import React, { useState, useEffect, useRef } from 'react';
import {
  EyeOff,
  Compass,
  AlertTriangle,
  HelpCircle,
  Search,
  Layers,
  ArrowRight,
  ArrowDown,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Split,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  FileCheck2,
  GitCompareArrows,
  Info,
  Target,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react';
import { DecisionAnalysis, RedTeamAnalysis, MindChangeAnalysis } from './types';
import {
  SAMPLE_SCENARIOS,
  generateFallbackAnalysis,
  generateFallbackRedTeam,
  generateFallbackMindChange,
} from './mockData';

type NavSection = 'workspace' | 'dashboard' | 'change-mind' | 'revisited';

export default function App() {
  // Primary Decision Input & Optional Contextual Fields
  const [decisionInput, setDecisionInput] = useState<string>('');
  const [contextField, setContextField] = useState<string>('');
  const [constraintsField, setConstraintsField] = useState<string>('');
  const [mattersMostField, setMattersMostField] = useState<string>('');
  const [showOptionalContext, setShowOptionalContext] = useState<boolean>(true);
  const [preservedOriginalReasoning, setPreservedOriginalReasoning] = useState<string>('');

  // Active Navigation Section
  const [activeNav, setActiveNav] = useState<NavSection>('workspace');

  // Active Engine Preview Stage in Hero
  const [hoveredEngineStage, setHoveredEngineStage] = useState<number>(0);

  // API Status
  const [apiStatus, setApiStatus] = useState<{ configured: boolean; message: string } | null>(null);

  // Stage 1: Blind Spot Analysis (9 Sections)
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<DecisionAnalysis | null>(null);
  const [examinedIds, setExaminedIds] = useState<Record<string, boolean>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Stage 2: Challenge My Thinking (Red Team)
  const [isLoadingRedTeam, setIsLoadingRedTeam] = useState<boolean>(false);
  const [redTeamError, setRedTeamError] = useState<string | null>(null);
  const [redTeamResult, setRedTeamResult] = useState<RedTeamAnalysis | null>(null);

  // Stage 3: What Would Change Your Mind?
  const [mindChangeInput, setMindChangeInput] = useState<string>('');
  const [isLoadingMindChange, setIsLoadingMindChange] = useState<boolean>(false);
  const [mindChangeError, setMindChangeError] = useState<string | null>(null);
  const [mindChangeResult, setMindChangeResult] = useState<MindChangeAnalysis | null>(null);

  // Stage 4: Your Thinking, Revisited (Reasoning Evolution)
  const [revisedThinkingInput, setRevisedThinkingInput] = useState<string>('');
  const [isRevisedSaved, setIsRevisedSaved] = useState<boolean>(false);

  // Section Refs for Smooth Navigation & Active Tracking
  const analyzerSectionRef = useRef<HTMLElement | null>(null);
  const dashboardSectionRef = useRef<HTMLElement | null>(null);
  const redTeamSectionRef = useRef<HTMLDivElement | null>(null);
  const mindChangeSectionRef = useRef<HTMLDivElement | null>(null);
  const revisitedSectionRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => setApiStatus(data))
      .catch(() => {
        setApiStatus({
          configured: false,
          message: 'GEMINI_API_KEY is not configured. Running in resilient Demo Fallback Mode.',
        });
      });
  }, []);

  // Track scroll position to highlight active navigation command bar item
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 240;
      const revisitedTop = revisitedSectionRef.current?.offsetTop;
      const mindChangeTop = mindChangeSectionRef.current?.offsetTop;
      const dashboardTop = dashboardSectionRef.current?.offsetTop;

      if (revisitedTop && scrollPos >= revisitedTop) {
        setActiveNav('revisited');
      } else if (mindChangeTop && scrollPos >= mindChangeTop) {
        setActiveNav('change-mind');
      } else if (dashboardTop && scrollPos >= dashboardTop) {
        setActiveNav('dashboard');
      } else {
        setActiveNav('workspace');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentAnalysis]);

  const scrollToAnalyzer = () => {
    setActiveNav('workspace');
    analyzerSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 300);
  };

  const handleSelectScenario = (scenario: typeof SAMPLE_SCENARIOS[0]) => {
    setDecisionInput(scenario.prompt);
    setMindChangeInput(scenario.sampleMindChangePrompt);
    setErrorMsg(null);
    analyzerSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleExamined = (id: string) => {
    setExaminedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleSectionCollapse = (sectionKey: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Build composite prompt if optional contextual fields are provided
  const buildCompositeDecisionText = () => {
    const base = decisionInput.trim();
    const parts: string[] = [base];
    if (contextField.trim()) parts.push(`Context: ${contextField.trim()}`);
    if (constraintsField.trim()) parts.push(`Constraints: ${constraintsField.trim()}`);
    if (mattersMostField.trim()) parts.push(`What matters most: ${mattersMostField.trim()}`);
    return parts.join('\n');
  };

  // STEP 1: Run Blind Spot Analysis
  const handleAnalyzeDecision = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = decisionInput.trim();
    if (!trimmed) {
      setErrorMsg('Please describe the decision or reasoning you are thinking about before analyzing.');
      textareaRef.current?.focus();
      return;
    }

    if (trimmed.length < 10) {
      setErrorMsg('Please enter at least a complete sentence or dilemma so BLIND SPOT can audit your reasoning.');
      textareaRef.current?.focus();
      return;
    }

    const fullPayload = buildCompositeDecisionText();

    // Automatically preserve the user's original reasoning before analysis
    setPreservedOriginalReasoning(trimmed);
    setErrorMsg(null);
    setIsLoadingAnalysis(true);
    setLoadingStage(0);

    // Reset downstream interactive stages for the new decision
    setRedTeamResult(null);
    setRedTeamError(null);
    setMindChangeResult(null);
    setMindChangeError(null);
    setIsRevisedSaved(false);

    const matchedScenario = SAMPLE_SCENARIOS.find((s) => s.prompt === trimmed);
    if (matchedScenario && !mindChangeInput.trim()) {
      setMindChangeInput(matchedScenario.sampleMindChangePrompt);
    }

    const stageInterval = setInterval(() => {
      setLoadingStage((prev) => (prev < 3 ? prev + 1 : prev));
    }, 450);

    try {
      let result: DecisionAnalysis | null = null;
      let fallbackReason: string | undefined;

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision: fullPayload }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.analysis) {
            result = {
              ...data.analysis,
              decisionInput: trimmed,
            };
          } else if (data.useFallback) {
            fallbackReason = data.reason;
          }
        }
      } catch {
        fallbackReason = 'Could not reach server endpoint; using built-in cognitive fallback.';
      }

      if (!result) {
        await new Promise((resolve) => setTimeout(resolve, 900));
        result = generateFallbackAnalysis(trimmed, fallbackReason);
      }

      setCurrentAnalysis(result);
      setActiveNav('dashboard');
      setTimeout(() => {
        dashboardSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch {
      setErrorMsg('An unexpected error occurred while auditing your decision. Please try again.');
    } finally {
      clearInterval(stageInterval);
      setIsLoadingAnalysis(false);
    }
  };

  // STEP 2: Run "Challenge My Thinking" (Red Team)
  const handleChallengeThinking = async () => {
    if (!currentAnalysis) return;

    setIsLoadingRedTeam(true);
    setRedTeamError(null);

    try {
      let redTeam: RedTeamAnalysis | null = null;

      try {
        const response = await fetch('/api/red-team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision: buildCompositeDecisionText() }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.redTeam) {
            redTeam = data.redTeam;
          }
        }
      } catch {
        // Fallback handled below
      }

      if (!redTeam) {
        await new Promise((resolve) => setTimeout(resolve, 750));
        redTeam = generateFallbackRedTeam(currentAnalysis.decisionInput);
      }

      setRedTeamResult(redTeam);
      setTimeout(() => {
        redTeamSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch {
      setRedTeamError('Unable to generate Red Team challenge. Please try again.');
    } finally {
      setIsLoadingRedTeam(false);
    }
  };

  // STEP 3: Run "What Would Change Your Mind?"
  const handleAnalyzeMindChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnalysis) return;

    const trimmed = mindChangeInput.trim();
    if (!trimmed) {
      setMindChangeError('Please enter what would have to be true for you to reconsider your current position.');
      return;
    }

    setMindChangeError(null);
    setIsLoadingMindChange(true);

    try {
      let mindChange: MindChangeAnalysis | null = null;

      try {
        const response = await fetch('/api/change-mind', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            decision: currentAnalysis.decisionInput,
            mindChangeInput: trimmed,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.mindChange) {
            mindChange = data.mindChange;
          }
        }
      } catch {
        // Fallback handled below
      }

      if (!mindChange) {
        await new Promise((resolve) => setTimeout(resolve, 750));
        mindChange = generateFallbackMindChange(currentAnalysis.decisionInput, trimmed);
      }

      setMindChangeResult(mindChange);
    } catch {
      setMindChangeError('Unable to analyze your falsification threshold. Please try again.');
    } finally {
      setIsLoadingMindChange(false);
    }
  };

  const handleResetAll = () => {
    setDecisionInput('');
    setContextField('');
    setConstraintsField('');
    setMattersMostField('');
    setPreservedOriginalReasoning('');
    setCurrentAnalysis(null);
    setRedTeamResult(null);
    setMindChangeResult(null);
    setMindChangeInput('');
    setRevisedThinkingInput('');
    setIsRevisedSaved(false);
    setErrorMsg(null);
    scrollToAnalyzer();
  };

  const loadingSteps = [
    '01. Capturing Decision Snapshot & Stated Facts',
    '02. Detecting Hidden Assumptions & Blind Spots',
    '03. Mapping Direct Risks & Second-Order Effects',
    '04. Formulating Socratic Inquiry & Reversibility',
  ];

  // Progress indicators
  const hasInitial = Boolean(preservedOriginalReasoning);
  const hasBlindSpots = Boolean(currentAnalysis);
  const hasChallenge = Boolean(redTeamResult);
  const hasNewEvidence = Boolean(mindChangeResult);
  const hasRevised = Boolean(revisedThinkingInput.trim().length > 5);

  const totalSignals = currentAnalysis
    ? currentAnalysis.assumptions.length +
      currentAnalysis.missingInformation.length +
      currentAnalysis.risks.length
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#070A12] bg-analytical-grid text-slate-100">
      {/* =====================================================================
          2. NAVIGATION COMMAND BAR (Strict 3-Zone Contract)
         ===================================================================== */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 lg:px-12 h-16 bg-[#070A12]/90 backdrop-blur-md border-b border-slate-800/80">
        {/* Zone 1: Single Brand Wordmark */}
        <a
          href="#top"
          className="text-lg font-extrabold tracking-tight text-slate-50 font-display whitespace-nowrap"
        >
          BLIND SPOT
        </a>

        {/* Zone 2: 4 Command Bar Navigation Links with Active Amber Indicator */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0D1322] border border-slate-800/90 rounded-lg p-1">
          {[
            { id: 'workspace', label: 'Analyze a Decision', href: '#workspace' },
            { id: 'dashboard', label: 'Blind Spots', href: '#dashboard' },
            { id: 'change-mind', label: 'Change My Mind', href: '#change-mind' },
            { id: 'revisited', label: 'Thinking Revisited', href: '#revisited' },
          ].map((item) => {
            const isActive = activeNav === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setActiveNav(item.id as NavSection)}
                className={`relative px-3.5 py-1.5 text-xs font-medium rounded-md transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? 'text-amber-300 bg-amber-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-amber-400 rounded-full" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action CTA */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={scrollToAnalyzer}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-all duration-150 hover:-translate-y-0.5 shadow-sm shadow-amber-500/10 whitespace-nowrap cursor-pointer"
          >
            Analyze a Decision
          </button>
        </div>
      </header>

      <main id="top" className="flex-1 bg-radial-observatory">
        {/* =====================================================================
            1. HERO SECTION & 3. DECISION INTELLIGENCE ENGINE VISUALIZATION
           ===================================================================== */}
        <section className="relative overflow-hidden border-b border-slate-800/80 pt-12 pb-16 lg:pt-20 lg:pb-24 px-6 lg:px-12">
          {/* Subtle Thinking System SVG Backdrop: Faint Connected Nodes & Analytical Orbits */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-35" aria-hidden="true">
            <svg
              className="w-full h-full"
              viewBox="0 0 1440 680"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Faint Orbital Decision Paths */}
              <circle
                cx="1040"
                cy="320"
                r="230"
                stroke="#1E293B"
                strokeWidth="1"
                strokeDasharray="4 6"
              />
              <circle
                cx="1040"
                cy="320"
                r="340"
                stroke="#1E293B"
                strokeWidth="1"
              />
              {/* Decision Branching Vectors */}
              <path
                d="M120 520 C 380 520, 520 260, 810 260"
                stroke="#38BDF8"
                strokeOpacity="0.22"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
              <path
                d="M120 520 C 420 520, 560 400, 810 400"
                stroke="#F59E0B"
                strokeOpacity="0.28"
                strokeWidth="1"
              />
              {/* Analytical Nodes */}
              <circle cx="120" cy="520" r="3.5" fill="#F59E0B" className="animate-pulse-subtle" />
              <circle cx="465" cy="390" r="3" fill="#38BDF8" className="animate-pulse-subtle" />
              <circle cx="810" cy="260" r="3.5" fill="#38BDF8" />
              <circle cx="810" cy="400" r="3.5" fill="#F43F5E" className="animate-pulse-subtle" />
            </svg>
          </div>

          <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Column (7 Cols): Editorial Headline + 4-Stage Trajectory */}
            <div className="lg:col-span-7 space-y-7">
              <div className="flex items-center gap-2.5 text-xs font-mono text-amber-400 tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-subtle" />
                <span>AI DECISION-INTELLIGENCE LABORATORY</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-sky-400">NON-PRESCRIPTIVE ENGINE</span>
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-[62px] font-extrabold tracking-tight text-slate-50 font-display leading-[1.04]"
                style={{ textWrap: 'balance' }}
              >
                See what you&apos;re missing before you decide.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                BLIND SPOT is an AI thinking companion that challenges your reasoning without making the decision for you—exposing hidden assumptions, missing evidence, biases, and second-order effects before you commit.
              </p>

              {/* Primary Hero Actions */}
              <div className="pt-1 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={scrollToAnalyzer}
                  className="group inline-flex items-center gap-3 px-6 py-3.5 text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-all duration-150 hover:-translate-y-0.5 shadow-lg shadow-amber-500/15 whitespace-nowrap cursor-pointer"
                >
                  <span>ANALYZE A DECISION</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectScenario(SAMPLE_SCENARIOS[0])}
                  className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium text-slate-300 hover:text-slate-100 bg-[#0D1322]/90 border border-slate-800 hover:border-slate-700 rounded-lg transition-all duration-150 hover:-translate-y-0.5 whitespace-nowrap cursor-pointer"
                >
                  <span>Load Live Demo Dilemma</span>
                </button>
              </div>

              {/* Architectural Flow Pipeline: 01 DECISION -> 02 BLIND-SPOT AUDIT -> 03 RED TEAM -> 04 REVISED THINKING */}
              <div className="pt-4 border-t border-slate-800/80">
                <p className="text-[11px] font-mono text-slate-400 tracking-wider mb-3">
                  COGNITIVE VERIFICATION ARCHITECTURE
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { num: '01', label: 'DECISION', desc: 'Input & Framing', accent: 'text-slate-200 border-slate-800' },
                    { num: '02', label: 'BLIND-SPOT AUDIT', desc: '9 Dimensions', accent: 'text-amber-400 border-amber-500/30' },
                    { num: '03', label: 'RED TEAM', desc: 'Counter-Case', accent: 'text-rose-400 border-rose-500/30' },
                    { num: '04', label: 'REVISED THINKING', desc: 'Evolution Diff', accent: 'text-emerald-400 border-emerald-500/30' },
                  ].map((step, index) => (
                    <div
                      key={step.num}
                      className={`relative p-3 rounded-lg bg-[#0D1322]/90 border ${step.accent} transition-colors`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="text-slate-400">{step.num}</span>
                        {index < 3 && (
                          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">→</span>
                        )}
                      </div>
                      <div className="text-xs font-bold tracking-wide text-slate-100 whitespace-nowrap truncate">
                        {step.label}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {step.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (5 Cols): 3. DECISION INTELLIGENCE ENGINE VISUALIZATION */}
            <div className="lg:col-span-5">
              <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-6 space-y-5 shadow-2xl shadow-black/60">
                {/* Panel Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-sky-400 tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse-subtle" />
                      <span>DECISION INTELLIGENCE ENGINE</span>
                    </div>
                    <h2 className="text-base font-bold text-slate-100 font-display">
                      Multi-Stage Reasoning Diagnostic
                    </h2>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs text-slate-400 block">AGENCY</span>
                    <span className="text-sm font-bold text-amber-400 tabular-nums">100% USER</span>
                  </div>
                </div>

                {/* Connected Interactive Stages with Vertical Connector Line & Ring Indicators */}
                <div className="relative space-y-3">
                  {/* Vertical Analytical Connector Line */}
                  <div
                    className="pointer-events-none absolute left-6 top-8 bottom-8 w-[1px] bg-slate-800"
                    aria-hidden="true"
                  />

                  {/* Stage 01: BLIND-SPOT AUDIT */}
                  <div
                    onMouseEnter={() => setHoveredEngineStage(0)}
                    onClick={scrollToAnalyzer}
                    className={`relative pl-12 pr-4 py-4 rounded-lg border transition-all duration-150 cursor-pointer ${
                      hoveredEngineStage === 0
                        ? 'bg-[#121A2E] border-amber-500/50 translate-x-0.5'
                        : 'bg-[#070A12]/90 border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    {/* Ring Indicator Node */}
                    <div className="absolute left-3.5 top-5 w-5 h-5 rounded-full bg-[#070A12] border-2 border-amber-400 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-amber-400 font-semibold">STAGE 01 · BLIND-SPOT AUDIT</span>
                      <span className="text-slate-300 tabular-nums">9 DIMENSIONS</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Deconstructs stated facts, fragile assumptions, missing variables, and second-order consequences.
                    </p>
                  </div>

                  {/* Stage 02: RED TEAM STRESS TEST */}
                  <div
                    onMouseEnter={() => setHoveredEngineStage(1)}
                    onClick={() => {
                      if (currentAnalysis) {
                        redTeamSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        scrollToAnalyzer();
                      }
                    }}
                    className={`relative pl-12 pr-4 py-4 rounded-lg border transition-all duration-150 cursor-pointer ${
                      hoveredEngineStage === 1
                        ? 'bg-[#17111C] border-rose-500/50 translate-x-0.5'
                        : 'bg-[#070A12]/90 border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    <div className="absolute left-3.5 top-5 w-5 h-5 rounded-full bg-[#070A12] border-2 border-rose-400 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-rose-400 font-semibold">STAGE 02 · RED TEAM</span>
                      <span className="text-rose-300 tabular-nums">STRESS TEST</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Constructs the strongest counterargument against your leaning and defines disproving evidence.
                    </p>
                  </div>

                  {/* Stage 03: THINKING REVISITED */}
                  <div
                    onMouseEnter={() => setHoveredEngineStage(2)}
                    onClick={() => {
                      if (currentAnalysis) {
                        revisitedSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        scrollToAnalyzer();
                      }
                    }}
                    className={`relative pl-12 pr-4 py-4 rounded-lg border transition-all duration-150 cursor-pointer ${
                      hoveredEngineStage === 2
                        ? 'bg-[#0D1D1C] border-emerald-500/50 translate-x-0.5'
                        : 'bg-[#070A12]/90 border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    <div className="absolute left-3.5 top-5 w-5 h-5 rounded-full bg-[#070A12] border-2 border-emerald-400 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-emerald-400 font-semibold">STAGE 03 · THINKING REVISITED</span>
                      <span className="text-emerald-300 tabular-nums">EVOLUTION</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Preserves your initial thinking alongside discovered blind spots and your revised synthesis.
                    </p>
                  </div>
                </div>

                {/* Footer Telemetry Bar */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>PROTOCOL: ZERO-VERDICT AUDIT</span>
                  <span className="text-sky-400 tabular-nums">
                    {currentAnalysis ? `${totalSignals} SIGNALS DETECTED` : 'READY FOR INPUT'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            4. ANALYZE A DECISION EXPERIENCE (Structured Decision Workspace)
           ===================================================================== */}
        <section
          id="workspace"
          ref={analyzerSectionRef}
          className="py-14 lg:py-20 px-6 lg:px-12 border-b border-slate-800/80"
        >
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Setup Notice if GEMINI_API_KEY is missing */}
            {apiStatus && !apiStatus.configured && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-950/25 border border-amber-700/40 text-amber-200/90 text-xs leading-relaxed">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-300">
                    Setup Notice: GEMINI_API_KEY Not Detected — Resilient Demo Mode Active
                  </p>
                  <p className="text-amber-200/80">
                    Configure <code className="font-mono bg-amber-950/80 px-1.5 py-0.5 rounded">GEMINI_API_KEY</code> in your environment or AI Studio Secrets for live Gemini reasoning. All interactive stages remain 100% functional via our deterministic fallback engine.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-amber-400 tracking-wider">
                  01 · DECISION ANALYSIS WORKSPACE
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-50 font-display mt-1">
                  What decision are you thinking about?
                </h2>
              </div>
              <p className="text-xs font-mono text-slate-400">
                ORIGINAL FRAMING AUTO-PRESERVED
              </p>
            </div>

            {/* Quick Scenario Presets */}
            <div className="space-y-2">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Load a calibrated decision scenario or write your own below:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {SAMPLE_SCENARIOS.map((scenario) => {
                  const isSelected = decisionInput.trim() === scenario.prompt;
                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      onClick={() => handleSelectScenario(scenario)}
                      className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-all duration-150 whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/60 text-amber-200'
                          : 'bg-[#0D1322] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-slate-100'
                      }`}
                    >
                      {scenario.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Structured Command Workspace Form */}
            <form
              onSubmit={handleAnalyzeDecision}
              className="bg-[#0D1322] border border-slate-800 rounded-xl p-6 lg:p-8 space-y-6 shadow-xl shadow-black/40"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="decision-textarea"
                    className="text-xs font-mono text-amber-400 tracking-wider"
                  >
                    DECISION TO ANALYZE
                  </label>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {decisionInput.trim().length} CHARS
                  </span>
                </div>

                <textarea
                  id="decision-textarea"
                  ref={textareaRef}
                  rows={4}
                  value={decisionInput}
                  onChange={(e) => {
                    setDecisionInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Should I attend this hackathon or stay home and finish my college work?"
                  className="w-full bg-[#070A12] border border-slate-800 focus:border-amber-500/80 focus:outline-none rounded-lg p-4 text-base text-slate-100 placeholder:text-slate-500 leading-relaxed resize-y transition-colors"
                />
              </div>

              {/* Optional Contextual Framing Fields */}
              <div className="space-y-3 pt-1 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowOptionalContext((prev) => !prev)}
                  className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                  <span>OPTIONAL ANALYTICAL PARAMETERS (CONTEXT · CONSTRAINTS · PRIORITIES)</span>
                  {showOptionalContext ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {showOptionalContext && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label htmlFor="ctx-field" className="block text-[11px] font-mono text-slate-400">
                        CONTEXT (OPTIONAL)
                      </label>
                      <input
                        id="ctx-field"
                        type="text"
                        value={contextField}
                        onChange={(e) => setContextField(e.target.value)}
                        placeholder="e.g., Junior CS major, midterm week"
                        className="w-full bg-[#070A12] border border-slate-800 focus:border-sky-500/60 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="constraints-field" className="block text-[11px] font-mono text-slate-400">
                        CONSTRAINTS (OPTIONAL)
                      </label>
                      <input
                        id="constraints-field"
                        type="text"
                        value={constraintsField}
                        onChange={(e) => setConstraintsField(e.target.value)}
                        placeholder="e.g., 48 hours available, Monday 9am lab"
                        className="w-full bg-[#070A12] border border-slate-800 focus:border-sky-500/60 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="matters-field" className="block text-[11px] font-mono text-slate-400">
                        WHAT MATTERS MOST? (OPTIONAL)
                      </label>
                      <input
                        id="matters-field"
                        type="text"
                        value={mattersMostField}
                        onChange={(e) => setMattersMostField(e.target.value)}
                        placeholder="e.g., Building portfolio without failing GPA"
                        className="w-full bg-[#070A12] border border-slate-800 focus:border-sky-500/60 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="flex items-start gap-3 p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs leading-relaxed"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Strict Non-Prescriptive Audit · Surfaces what you might be missing</span>
                </div>

                <div className="flex items-center gap-3">
                  {decisionInput.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setDecisionInput('');
                        setContextField('');
                        setConstraintsField('');
                        setMattersMostField('');
                        setErrorMsg(null);
                        textareaRef.current?.focus();
                      }}
                      className="px-3.5 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Clear
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isLoadingAnalysis}
                    className="group inline-flex items-center justify-center gap-2.5 px-6 py-3 text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 rounded-lg transition-all duration-150 hover:-translate-y-0.5 shadow-lg shadow-amber-500/15 whitespace-nowrap cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>{isLoadingAnalysis ? 'RUNNING COGNITIVE AUDIT...' : 'ANALYZE DECISION →'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>

        {/* =====================================================================
            5 & 6. INTELLIGENCE REPORT & VISUAL HERO "BLIND SPOTS"
           ===================================================================== */}
        <section
          id="dashboard"
          ref={dashboardSectionRef}
          className="py-14 lg:py-20 px-6 lg:px-12 border-b border-slate-800/80"
        >
          <div className="max-w-6xl mx-auto">
            {/* AI REASONING LOADING STATE */}
            {isLoadingAnalysis && (
              <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span>DECISION INTELLIGENCE ENGINE ACTIVE</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-100 font-display">
                      Auditing assumptions, blind-spot signals, and downstream risk vectors...
                    </h3>
                  </div>
                  <div className="text-xs font-mono tabular-nums text-sky-400 bg-[#070A12] px-3 py-1.5 rounded-lg border border-slate-800">
                    PHASE 0{loadingStage + 1} / 0{loadingSteps.length}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-[#070A12] rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${((loadingStage + 1) / loadingSteps.length) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {loadingSteps.map((stepText, idx) => {
                    const isCompleted = idx < loadingStage;
                    const isCurrent = idx === loadingStage;
                    return (
                      <div
                        key={stepText}
                        className={`p-4 rounded-lg border transition-colors ${
                          isCurrent
                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-200'
                            : isCompleted
                            ? 'bg-[#070A12] border-emerald-800/50 text-slate-300'
                            : 'bg-[#070A12] border-slate-800/70 text-slate-500'
                        }`}
                      >
                        <div className="text-[11px] font-mono mb-1">
                          {isCompleted ? 'VERIFIED' : isCurrent ? 'SCANNING...' : 'QUEUED'}
                        </div>
                        <p className="text-xs leading-relaxed">{stepText}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STANDBY / EMPTY STATE */}
            {!isLoadingAnalysis && !currentAnalysis && (
              <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-8 lg:p-12 text-center max-w-3xl mx-auto space-y-6">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
                  <Compass className="w-6 h-6 text-amber-400" />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-mono text-sky-400 tracking-wider">
                    INTELLIGENCE REPORT STANDBY
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-100 font-display">
                    No Decision Loaded in the Analytical Matrix
                  </h3>
                  <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                    Enter your dilemma above or load a calibrated scenario to generate a 9-section intelligence report, Red Team counter-case, and Reasoning Evolution diff.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectScenario(SAMPLE_SCENARIOS[0])}
                    className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Load &ldquo;Hackathon vs. College Work&rdquo;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectScenario(SAMPLE_SCENARIOS[1])}
                    className="px-5 py-2.5 text-xs font-medium text-slate-300 hover:text-slate-100 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Load &ldquo;Internship Career Doubt&rdquo;
                  </button>
                </div>
              </div>
            )}

            {/* POPULATED STATE: INTELLIGENCE REPORT */}
            {!isLoadingAnalysis && currentAnalysis && (
              <div className="space-y-14">
                {/* REPORT HEADER & DECISION SNAPSHOT */}
                <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-6 lg:p-8 space-y-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-400">
                        <span>DECISION SNAPSHOT</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">TIMESTAMP {currentAnalysis.timestamp}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-sky-400">
                          {currentAnalysis.isFallback ? 'DEMO ENGINE' : 'GEMINI LIVE ENGINE'}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-50 font-display">
                        &ldquo;{currentAnalysis.decisionInput}&rdquo;
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={handleChallengeThinking}
                        disabled={isLoadingRedTeam}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-950 bg-rose-400 hover:bg-rose-300 disabled:opacity-60 rounded-lg transition-all duration-150 hover:-translate-y-0.5 whitespace-nowrap cursor-pointer"
                      >
                        <span className="w-2 h-2 rounded-full bg-slate-950" />
                        <span>{isLoadingRedTeam ? 'CHALLENGING...' : 'CHALLENGE MY THINKING'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetAll}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:text-slate-100 bg-[#070A12] border border-slate-800 hover:border-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>New Decision</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-mono text-sky-400 tracking-wider">
                        IMPLICIT FRAMING LENS
                      </p>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {currentAnalysis.decisionSnapshot.framing}
                      </p>
                    </div>

                    <div className="space-y-1.5 md:border-l md:border-slate-800 md:pl-6">
                      <p className="text-[11px] font-mono text-amber-400 tracking-wider">
                        CORE STRUCTURAL TENSION
                      </p>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {currentAnalysis.decisionSnapshot.coreTension}
                      </p>
                    </div>

                    <div className="space-y-1.5 md:border-l md:border-slate-800 md:pl-6">
                      <p className="text-[11px] font-mono text-emerald-400 tracking-wider">
                        SOVEREIGNTY GUARDRAIL
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {currentAnalysis.decisionSnapshot.neutralityNote}
                      </p>
                    </div>
                  </div>
                </div>

                {/* =====================================================================
                    6. VISUAL HERO SECTION: 04 BLIND SPOTS (IDENTIFIED SIGNALS)
                   ===================================================================== */}
                <div className="bg-[#0D1322] border-2 border-amber-500/40 rounded-xl p-6 lg:p-8 space-y-6 shadow-2xl shadow-amber-500/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-mono text-amber-400 tracking-wider">
                        <EyeOff className="w-4 h-4" />
                        <span>04 · BLIND SPOTS DETECTED — PRIMARY COGNITIVE SIGNALS</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-50 font-display">
                        What may you be overlooking?
                      </h3>
                      <p className="text-xs text-slate-400">
                        Each signal highlights an unexamined distortion, assumption trap, or framing blind spot in your current thinking.
                      </p>
                    </div>

                    <div className="font-mono text-right shrink-0 bg-[#070A12] border border-slate-800 px-4 py-2 rounded-lg">
                      <span className="text-[11px] text-slate-400 block">DETECTED SIGNALS</span>
                      <span className="text-base font-bold text-amber-400 tabular-nums">
                        0{currentAnalysis.keyConsiderationsSummary.length} ACTIVE
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentAnalysis.keyConsiderationsSummary.map((signalText, idx) => {
                      const matchingAssumption = currentAnalysis.assumptions[idx];
                      const riskLevel = matchingAssumption?.fragility
                        ? matchingAssumption.fragility.toUpperCase()
                        : idx === 0
                        ? 'HIGH'
                        : 'MEDIUM';

                      const signalTitles = [
                        'PLANNING & EXECUTION FALLACY',
                        'BINARY FRAMING TRAP',
                        'UNVERIFIED BASELINE VARIABLE',
                        'SECOND-ORDER FATIGUE BLINDNESS',
                      ];
                      const signalCategory = signalTitles[idx % signalTitles.length];

                      return (
                        <div
                          key={idx}
                          className="p-5 bg-[#070A12] border border-slate-800 hover:border-amber-500/50 rounded-xl space-y-3 transition-all duration-150 hover:-translate-y-0.5"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs font-mono">
                            <span className="text-amber-400 font-bold tabular-nums">
                              BLIND SPOT #0{idx + 1} · {signalCategory}
                            </span>
                            <span
                              className={`tabular-nums ${
                                riskLevel === 'HIGH' ? 'text-rose-400' : 'text-amber-300'
                              }`}
                            >
                              Risk level: {riskLevel}
                            </span>
                          </div>

                          <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
                            &ldquo;{signalText}&rdquo;
                          </p>

                          {/* Subtle Severity Bar */}
                          <div className="pt-1 flex items-center gap-2">
                            <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  riskLevel === 'HIGH' ? 'w-4/5 bg-rose-400' : 'w-3/5 bg-amber-400'
                                }`}
                              />
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">
                              Signal Verified
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* =====================================================================
                    5. STRUCTURED INTELLIGENCE REPORT SECTIONS (01 TO 09)
                   ===================================================================== */}

                {/* ROW A: 01 FACTS & 03 UNKNOWN VARIABLES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 01 FACTS */}
                  <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                          <FileCheck2 className="w-4 h-4" />
                          <span>01 · FACTS</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-100 font-display mt-0.5">
                          What is actually known?
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSectionCollapse('facts')}
                        className="text-xs font-mono text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {collapsedSections['facts'] ? 'Expand' : 'Collapse'}
                      </button>
                    </div>

                    {!collapsedSections['facts'] && (
                      <ul className="space-y-2.5">
                        {currentAnalysis.facts.map((fact, idx) => (
                          <li
                            key={idx}
                            className="p-3.5 bg-[#070A12] border border-slate-800/80 rounded-lg text-sm text-slate-200 leading-relaxed flex items-start gap-3"
                          >
                            <span className="text-xs font-mono text-emerald-400 mt-0.5 tabular-nums">
                              0{idx + 1}
                            </span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* 03 UNKNOWN VARIABLES */}
                  <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
                          <Compass className="w-4 h-4" />
                          <span>03 · UNKNOWN VARIABLES</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-100 font-display mt-0.5">
                          What information is missing?
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSectionCollapse('unknowns')}
                        className="text-xs font-mono text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {collapsedSections['unknowns'] ? 'Expand' : 'Collapse'}
                      </button>
                    </div>

                    {!collapsedSections['unknowns'] && (
                      <ul className="space-y-2.5">
                        {currentAnalysis.unknowns.map((unknown, idx) => (
                          <li
                            key={idx}
                            className="p-3.5 bg-[#070A12] border border-slate-800/80 rounded-lg text-sm text-slate-200 leading-relaxed flex items-start gap-3"
                          >
                            <span className="text-xs font-mono text-sky-400 mt-0.5 tabular-nums">
                              0{idx + 1}
                            </span>
                            <span>{unknown}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* ROW B: 02 ASSUMPTIONS & Missing Information Verification */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* 02 ASSUMPTIONS */}
                  <div className="lg:col-span-6 bg-[#0D1322] border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                          <Layers className="w-4 h-4" />
                          <span>02 · ASSUMPTIONS</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-100 font-display mt-0.5">
                          What are you taking for granted?
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentAnalysis.assumptions.map((item, idx) => {
                        const isChecked = !!examinedIds[`assump-${item.id || idx}`];
                        return (
                          <div
                            key={item.id || idx}
                            className={`p-4 bg-[#070A12] border rounded-lg space-y-2 transition-all duration-150 hover:-translate-y-0.5 ${
                              isChecked ? 'border-emerald-800/60 opacity-80' : 'border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                                <span className="tabular-nums">ASSUMPTION #0{idx + 1}</span>
                                <span aria-hidden="true">·</span>
                                <span
                                  className={
                                    item.fragility === 'High'
                                      ? 'text-rose-400'
                                      : item.fragility === 'Medium'
                                      ? 'text-amber-400'
                                      : 'text-sky-400'
                                  }
                                >
                                  {item.fragility.toUpperCase()} FRAGILITY
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleExamined(`assump-${item.id || idx}`)}
                                className={`inline-flex items-center gap-1 text-xs font-medium cursor-pointer whitespace-nowrap ${
                                  isChecked ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{isChecked ? 'Examined' : 'Audit'}</span>
                              </button>
                            </div>

                            <h4 className="text-sm sm:text-base font-semibold text-slate-100 leading-snug">
                              &ldquo;{item.statement}&rdquo;
                            </h4>

                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                              {item.whyItMatters}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ACTIONABLE MISSING INFORMATION PROTOCOLS */}
                  <div className="lg:col-span-6 bg-[#0D1322] border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
                          <BookOpen className="w-4 h-4" />
                          <span>03B · VERIFIABLE INTELLIGENCE GAPS</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-100 font-display mt-0.5">
                          How to verify what is missing
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentAnalysis.missingInformation.map((info, idx) => {
                        const isChecked = !!examinedIds[`missing-${info.id || idx}`];
                        return (
                          <div
                            key={info.id || idx}
                            className={`p-4 bg-[#070A12] border rounded-lg space-y-2 transition-all duration-150 hover:-translate-y-0.5 ${
                              isChecked ? 'border-emerald-800/60 opacity-80' : 'border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-xs font-mono text-sky-400 tabular-nums">
                                VERIFICATION PROTOCOL #0{idx + 1}
                              </span>

                              <button
                                type="button"
                                onClick={() => toggleExamined(`missing-${info.id || idx}`)}
                                className={`inline-flex items-center gap-1 text-xs font-medium cursor-pointer whitespace-nowrap ${
                                  isChecked ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{isChecked ? 'Verified' : 'Mark Checked'}</span>
                              </button>
                            </div>

                            <h4 className="text-sm sm:text-base font-semibold text-slate-100">
                              {info.item}
                            </h4>

                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                              {info.whyNeeded}
                            </p>

                            <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                              <span className="font-mono text-emerald-400">ACTION: </span>
                              {info.howToFind}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ROW C: 05 RISKS & 06 SECOND-ORDER EFFECTS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* 05 RISKS */}
                  <div className="lg:col-span-6 bg-[#0D1322] border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-rose-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span>05 · RISKS</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-100 font-display mt-0.5">
                          What could go wrong?
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentAnalysis.risks.map((risk, idx) => (
                        <div
                          key={risk.id || idx}
                          className="p-4 bg-[#070A12] border border-slate-800 rounded-lg space-y-2 transition-all duration-150 hover:-translate-y-0.5"
                        >
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400 tabular-nums">RISK VECTOR #0{idx + 1}</span>
                            <span
                              className={
                                risk.severity === 'High'
                                  ? 'text-rose-400'
                                  : risk.severity === 'Medium'
                                  ? 'text-amber-400'
                                  : 'text-sky-400'
                              }
                            >
                              {risk.severity.toUpperCase()} SEVERITY
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-semibold text-slate-100">
                            {risk.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            {risk.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 06 SECOND-ORDER EFFECTS */}
                  <div className="lg:col-span-6 bg-[#0D1322] border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                          <Sparkles className="w-4 h-4" />
                          <span>06 · SECOND-ORDER EFFECTS</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-100 font-display mt-0.5">
                          What happens after the obvious outcome?
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentAnalysis.secondOrderEffects.map((effect, idx) => (
                        <div
                          key={effect.id || idx}
                          className="p-4 bg-[#070A12] border border-slate-800 rounded-lg space-y-2 transition-all duration-150 hover:-translate-y-0.5"
                        >
                          <div className="flex items-center justify-between text-xs font-mono text-amber-400">
                            <span className="tabular-nums">CAUSAL CHAIN #0{idx + 1}</span>
                            <span>HORIZON: {effect.timeframe.toUpperCase()}</span>
                          </div>
                          <p className="text-xs font-mono text-slate-400">
                            TRIGGER: <span className="text-slate-200 font-sans">{effect.trigger}</span>
                          </p>
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                            <span className="font-mono text-xs text-sky-400">RIPPLE: </span>
                            {effect.downstreamImpact}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ROW D: 07 ALTERNATIVES & 08 REVERSIBILITY / SOCRATIC INQUIRY */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* 07 ALTERNATIVES */}
                  <div className="lg:col-span-5 bg-[#0D1322] border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
                          <Split className="w-4 h-4" />
                          <span>07 · ALTERNATIVES</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-100 font-display mt-0.5">
                          What other paths exist?
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentAnalysis.alternativeExplanations.map((alt, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-[#070A12] border border-slate-800 rounded-lg space-y-1.5 transition-all duration-150 hover:-translate-y-0.5"
                        >
                          <div className="text-xs font-mono text-sky-400 tabular-nums">
                            ALTERNATIVE PATH #0{idx + 1}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                            {alt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 08 REVERSIBILITY & QUESTIONS WORTH ASKING */}
                  <div className="lg:col-span-7 bg-[#0D1322] border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                          <HelpCircle className="w-4 h-4" />
                          <span>08 · REVERSIBILITY &amp; SOCRATIC AUDIT</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-100 font-display mt-0.5">
                          How difficult is it to undo this decision?
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentAnalysis.questionsWorthAsking.map((q, idx) => (
                        <div
                          key={q.id || idx}
                          className="p-4 bg-[#070A12] border border-slate-800 rounded-lg space-y-1.5 transition-all duration-150 hover:-translate-y-0.5"
                        >
                          <div className="flex items-center justify-between text-xs font-mono text-amber-400">
                            <span>LENS: {q.lens.toUpperCase()}</span>
                            <span className="text-slate-500 tabular-nums">INQUIRY #0{idx + 1}</span>
                          </div>
                          <h4 className="text-sm sm:text-base font-semibold text-slate-100 leading-snug">
                            {q.question}
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {q.purpose}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* =====================================================================
                    7. RED TEAM MODE — SIGNATURE FEATURE
                   ===================================================================== */}
                <div ref={redTeamSectionRef} className="pt-4">
                  <div
                    className={`rounded-xl p-6 lg:p-8 space-y-6 transition-all duration-300 border ${
                      redTeamResult
                        ? 'bg-[#130D16] border-rose-500/50 shadow-2xl shadow-rose-950/20'
                        : 'bg-[#0D1322] border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/90 pb-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 text-xs font-mono text-rose-400 tracking-wider">
                          <span
                            className={`w-2 h-2 rounded-full bg-rose-500 ${
                              redTeamResult ? 'animate-ping' : ''
                            }`}
                          />
                          <span>
                            {redTeamResult
                              ? 'RED TEAM ACTIVE · ADVERSARIAL STRESS TEST ENGAGED'
                              : 'ADVERSARIAL REASONING PROTOCOL'}
                          </span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-50 font-display">
                          CHALLENGE MY THINKING
                        </h3>
                        <p className="text-sm text-slate-300">
                          &ldquo;Try to prove my decision wrong.&rdquo;
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleChallengeThinking}
                        disabled={isLoadingRedTeam}
                        className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-xs font-bold text-slate-950 bg-rose-400 hover:bg-rose-300 disabled:opacity-60 rounded-lg transition-all duration-150 hover:-translate-y-0.5 shadow-lg shadow-rose-500/15 whitespace-nowrap cursor-pointer shrink-0"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>
                          {isLoadingRedTeam
                            ? 'RUNNING RED TEAM...'
                            : redTeamResult
                            ? 'RE-RUN RED TEAM CHALLENGE'
                            : 'CHALLENGE MY THINKING'}
                        </span>
                      </button>
                    </div>

                    {redTeamError && (
                      <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs">
                        {redTeamError}
                      </div>
                    )}

                    {isLoadingRedTeam && (
                      <div className="p-6 bg-[#070A12] border border-rose-900/40 rounded-lg space-y-3 animate-pulse">
                        <div className="text-xs font-mono text-rose-400">
                          CONSTRUCTING STRONGEST COUNTERARGUMENT...
                        </div>
                        <div className="h-4 w-2/3 bg-slate-800 rounded" />
                        <div className="h-3 w-full bg-slate-800/70 rounded" />
                      </div>
                    )}

                    {!isLoadingRedTeam && !redTeamResult && (
                      <div className="p-6 bg-[#070A12] border border-slate-800/90 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-mono text-rose-400">
                            SIGNATURE INTELLECTUAL STRESS-TEST
                          </p>
                          <p className="text-sm text-slate-300">
                            Activate Red Team Mode to construct the single strongest case against your current leaning and expose what evidence could disprove it.
                          </p>
                        </div>
                      </div>
                    )}

                    {!isLoadingRedTeam && redTeamResult && (
                      <div className="space-y-6">
                        {/* STRONGEST COUNTERARGUMENT */}
                        <div className="p-6 bg-[#09070D] border-l-4 border-rose-500 border-t border-r border-b border-slate-800 rounded-r-xl space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono text-rose-400">
                            <span>STRONGEST COUNTERARGUMENT</span>
                            <span>What is the strongest case against your current reasoning?</span>
                          </div>
                          <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
                            &ldquo;{redTeamResult.strongestCounterargument}&rdquo;
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Weak Points in Reasoning */}
                          <div className="p-5 bg-[#070A12] border border-slate-800 rounded-xl space-y-3">
                            <h4 className="text-xs font-mono text-rose-400 tracking-wider">
                              WEAK POINTS IN THE REASONING
                            </h4>
                            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200">
                              {redTeamResult.weakPointsInReasoning.map((pt, i) => (
                                <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                                  <span className="font-mono text-rose-400 shrink-0 tabular-nums">0{i + 1}</span>
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Hidden Assumptions Worth Challenging */}
                          <div className="p-5 bg-[#070A12] border border-slate-800 rounded-xl space-y-3">
                            <h4 className="text-xs font-mono text-amber-400 tracking-wider">
                              HIDDEN ASSUMPTIONS WORTH CHALLENGING
                            </h4>
                            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200">
                              {redTeamResult.hiddenAssumptionsToChallenge.map((item, i) => (
                                <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                                  <span className="font-mono text-amber-400 shrink-0 tabular-nums">0{i + 1}</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Disproving Evidence */}
                          <div className="p-5 bg-[#070A12] border border-slate-800 rounded-xl space-y-3">
                            <h4 className="text-xs font-mono text-sky-400 tracking-wider">
                              EVIDENCE THAT COULD DISPROVE YOUR REASONING
                            </h4>
                            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200">
                              {redTeamResult.disprovingEvidence.map((ev, i) => (
                                <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                                  <span className="font-mono text-sky-400 shrink-0 tabular-nums">0{i + 1}</span>
                                  <span>{ev}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Difficult Questions */}
                          <div className="p-5 bg-[#070A12] border border-slate-800 rounded-xl space-y-3">
                            <h4 className="text-xs font-mono text-rose-400 tracking-wider">
                              DIFFICULT QUESTIONS TO CONSIDER
                            </h4>
                            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200">
                              {redTeamResult.difficultQuestions.map((dq, i) => (
                                <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                                  <span className="font-mono text-rose-400 shrink-0 tabular-nums">Q{i + 1}</span>
                                  <span>{dq}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* What Would Strengthen Reasoning */}
                        <div className="p-5 bg-[#070A12] border border-emerald-900/50 rounded-xl space-y-3">
                          <h4 className="text-xs font-mono text-emerald-400 tracking-wider">
                            WHAT WOULD STRENGTHEN YOUR REASONING
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {redTeamResult.whatWouldStrengthenReasoning.map((str, i) => (
                              <div
                                key={i}
                                className="p-3.5 bg-[#0D1322] border border-slate-800 rounded-lg text-xs text-slate-200 leading-relaxed"
                              >
                                <span className="font-mono text-emerald-400 block mb-1 tabular-nums">
                                  SAFEGUARD #0{i + 1}
                                </span>
                                {str}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* =====================================================================
                    09 EVIDENCE: WHAT WOULD CHANGE YOUR MIND?
                   ===================================================================== */}
                <div id="change-mind" ref={mindChangeSectionRef} className="pt-4">
                  <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-6 lg:p-8 space-y-6">
                    <div className="space-y-1 border-b border-slate-800 pb-5">
                      <div className="flex items-center gap-2 text-xs font-mono text-sky-400 tracking-wider">
                        <Target className="w-4 h-4" />
                        <span>09 · EVIDENCE &amp; FALSIFICATION THRESHOLD</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-50 font-display">
                        What Would Change Your Mind?
                      </h3>
                      <p className="text-sm text-slate-300">
                        What would have to be true for you to reconsider your current position?
                      </p>
                    </div>

                    <form onSubmit={handleAnalyzeMindChange} className="space-y-4">
                      <div>
                        <label htmlFor="mind-change-input" className="sr-only">
                          What would have to be true for you to reconsider your current position?
                        </label>
                        <textarea
                          id="mind-change-input"
                          rows={3}
                          value={mindChangeInput}
                          onChange={(e) => {
                            setMindChangeInput(e.target.value);
                            if (mindChangeError) setMindChangeError(null);
                          }}
                          placeholder="e.g., If I knew I would get meaningful analytics work using SQL/Power BI and mentorship during the internship, I would reconsider declining it..."
                          className="w-full bg-[#070A12] border border-slate-800 focus:border-amber-500/70 focus:outline-none rounded-lg p-4 text-sm text-slate-100 placeholder:text-slate-500 leading-relaxed resize-y"
                        />
                      </div>

                      {mindChangeError && (
                        <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs">
                          {mindChangeError}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <span className="text-xs text-slate-400">
                          Operationalizes the exact evidence that would strengthen or shift your reasoning.
                        </span>

                        <button
                          type="submit"
                          disabled={isLoadingMindChange}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 rounded-lg transition-all duration-150 hover:-translate-y-0.5 whitespace-nowrap cursor-pointer"
                        >
                          <Target className="w-4 h-4" />
                          <span>
                            {isLoadingMindChange
                              ? 'MAPPING EVIDENCE...'
                              : 'IDENTIFY EVIDENCE WORTH CHECKING →'}
                          </span>
                        </button>
                      </div>
                    </form>

                    {isLoadingMindChange && (
                      <div className="p-6 bg-[#070A12] border border-slate-800 rounded-lg space-y-3 animate-pulse">
                        <div className="h-4 w-1/3 bg-slate-800 rounded" />
                        <div className="h-3 w-full bg-slate-800/70 rounded" />
                        <div className="h-3 w-4/5 bg-slate-800/70 rounded" />
                      </div>
                    )}

                    {!isLoadingMindChange && mindChangeResult && (
                      <div className="space-y-6 pt-2">
                        <div className="p-5 bg-amber-500/10 border border-amber-500/40 rounded-xl space-y-1.5">
                          <div className="text-xs font-mono text-amber-400">
                            DECISION-CHANGING FACTOR IDENTIFIED
                          </div>
                          <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
                            {mindChangeResult.summaryObservation}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="p-5 bg-[#070A12] border border-slate-800 rounded-xl space-y-3">
                            <h4 className="text-xs font-mono text-amber-400 tracking-wider">
                              1. DECISION-CHANGING FACTORS
                            </h4>
                            <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                              {mindChangeResult.decisionChangingFactors.map((factor, i) => (
                                <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                                  <span className="font-mono text-amber-400 shrink-0 tabular-nums">0{i + 1}</span>
                                  <span>{factor}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-5 bg-[#070A12] border border-slate-800 rounded-xl space-y-3">
                            <h4 className="text-xs font-mono text-emerald-400 tracking-wider">
                              2. EVIDENCE WORTH CHECKING
                            </h4>
                            <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                              {mindChangeResult.evidenceToLookFor.map((ev, i) => (
                                <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                                  <span className="font-mono text-emerald-400 shrink-0 tabular-nums">0{i + 1}</span>
                                  <span>{ev}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-5 bg-[#070A12] border border-slate-800 rounded-xl space-y-3">
                            <h4 className="text-xs font-mono text-sky-400 tracking-wider">
                              3. QUESTIONS YOU SHOULD INVESTIGATE
                            </h4>
                            <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                              {mindChangeResult.questionsToInvestigate.map((q, i) => (
                                <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                                  <span className="font-mono text-sky-400 shrink-0 tabular-nums">Q{i + 1}</span>
                                  <span>{q}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-5 bg-[#070A12] border border-slate-800 rounded-xl space-y-3">
                            <h4 className="text-xs font-mono text-slate-300 tracking-wider">
                              4. INFORMATION CURRENTLY MISSING
                            </h4>
                            <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                              {mindChangeResult.informationCurrentlyMissing.map((info, i) => (
                                <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                                  <span className="font-mono text-slate-400 shrink-0 tabular-nums">0{i + 1}</span>
                                  <span>{info}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="p-5 bg-[#070A12] border border-slate-800 rounded-xl space-y-3">
                          <h4 className="text-xs font-mono text-amber-400 tracking-wider">
                            5. WHICH ASSUMPTIONS COULD BE TESTED
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {mindChangeResult.assumptionsToTest.map((test, i) => (
                              <div
                                key={i}
                                className="p-3.5 bg-[#0D1322] border border-slate-800 rounded-lg text-xs text-slate-200 leading-relaxed"
                              >
                                <span className="font-mono text-amber-400 block mb-1 tabular-nums">
                                  TEST #0{i + 1}
                                </span>
                                {test}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* =====================================================================
                    8. THINKING REVISITED — REASONING EVOLUTION TIMELINE & DIFF
                   ===================================================================== */}
                <div id="revisited" ref={revisitedSectionRef} className="pt-4">
                  <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-6 lg:p-10 space-y-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
                      <div className="space-y-1">
                        <p className="text-xs font-mono text-emerald-400 tracking-wider">
                          REASONING EVOLUTION TIMELINE
                        </p>
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-50 font-display">
                          YOUR THINKING, REVISITED
                        </h3>
                        <p className="text-sm text-slate-400">
                          Trace how your perspective evolved from initial framing to an audited, stress-tested synthesis.
                        </p>
                      </div>
                      <GitCompareArrows className="w-6 h-6 text-emerald-400 shrink-0" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left Column (4 cols): Evolution Timeline Ladder */}
                      <div className="lg:col-span-4 bg-[#070A12] border border-slate-800 rounded-xl p-6 space-y-2">
                        <p className="text-xs font-mono text-slate-400 mb-4 tracking-wider">
                          COGNITIVE EVOLUTION LOG
                        </p>

                        {[
                          { label: 'YOUR ORIGINAL THINKING', active: hasInitial, sub: 'Initial framing preserved' },
                          { label: 'BLIND SPOTS DISCOVERED', active: hasBlindSpots, sub: `${currentAnalysis.keyConsiderationsSummary.length} primary signals surfaced` },
                          { label: 'RED TEAM CHALLENGE', active: hasChallenge, sub: redTeamResult ? 'Counter-case evaluated' : 'Ready for adversarial challenge' },
                          { label: 'NEW EVIDENCE', active: hasNewEvidence, sub: mindChangeResult ? 'Falsification threshold mapped' : 'Optional evidence check' },
                          { label: 'YOUR REVISED THINKING', active: hasRevised, sub: hasRevised ? 'Evolution diff active' : 'Awaiting revised synthesis' },
                        ].map((stage, idx, arr) => (
                          <React.Fragment key={stage.label}>
                            <div
                              className={`p-3.5 rounded-lg border transition-colors ${
                                stage.active
                                  ? 'bg-[#0D1322] border-amber-500/50 text-slate-100'
                                  : 'bg-[#070A12] border-slate-800/80 text-slate-500'
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className={stage.active ? 'text-amber-400 font-semibold' : 'text-slate-500'}>
                                  {stage.label}
                                </span>
                                {stage.active && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                              </div>
                              <p className="text-xs text-slate-400 mt-1">{stage.sub}</p>
                            </div>
                            {idx < arr.length - 1 && (
                              <div className="flex justify-center py-0.5">
                                <ArrowDown className="w-4 h-4 text-slate-600" />
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Right Column (8 cols): BEFORE / DISCOVERED / AFTER + SIDE-BY-SIDE DIFF */}
                      <div className="lg:col-span-8 space-y-6">
                        {/* BEFORE */}
                        <div className="p-6 bg-[#070A12] border border-slate-800 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                            <span>BEFORE · YOUR ORIGINAL THINKING</span>
                            <span>BASELINE SNAPSHOT</span>
                          </div>
                          <p className="text-base font-medium text-slate-200 leading-relaxed">
                            &ldquo;{preservedOriginalReasoning || currentAnalysis.decisionInput}&rdquo;
                          </p>
                        </div>

                        {/* THEN YOU DISCOVERED */}
                        <div className="p-6 bg-[#070A12] border border-amber-500/30 rounded-xl space-y-3">
                          <div className="text-xs font-mono text-amber-400">
                            THEN YOU DISCOVERED · BLIND SPOTS &amp; RED TEAM SIGNALS
                          </div>
                          <ul className="space-y-2.5 text-sm text-slate-200">
                            {currentAnalysis.keyConsiderationsSummary.slice(0, 5).map((item, idx) => (
                              <li key={idx} className="flex items-start gap-3 leading-relaxed">
                                <span className="font-mono text-xs text-amber-400 mt-1 shrink-0 tabular-nums">
                                  +0{idx + 1}
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* AFTER: User Revised Input */}
                        <div className="p-6 bg-[#070A12] border border-emerald-800/60 rounded-xl space-y-4">
                          <div className="space-y-1">
                            <div className="text-xs font-mono text-emerald-400">
                              AFTER · YOUR REVISED THINKING
                            </div>
                            <label
                              htmlFor="revised-thinking-textarea"
                              className="block text-base font-bold text-slate-100 font-display"
                            >
                              Has your thinking changed?
                            </label>
                            <p className="text-xs text-slate-400">
                              Write how your decision framing, assumptions, or next steps have evolved after examining the blind spots.
                            </p>
                          </div>

                          <textarea
                            id="revised-thinking-textarea"
                            rows={3}
                            value={revisedThinkingInput}
                            onChange={(e) => {
                              setRevisedThinkingInput(e.target.value);
                              if (isRevisedSaved) setIsRevisedSaved(false);
                            }}
                            placeholder="e.g., Instead of treating this weekend as an all-or-nothing choice, I will check my syllabus weights tonight, complete the mandatory Monday assignment before Friday at 6 PM, and attend the hackathon with a 6-hour sleep boundary..."
                            className="w-full bg-[#0D1322] border border-slate-800 focus:border-emerald-500/70 focus:outline-none rounded-lg p-4 text-sm text-slate-100 placeholder:text-slate-500 leading-relaxed resize-y"
                          />

                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="text-xs text-slate-400">
                              BLIND SPOT does not score your choice—it highlights how your reasoning matured.
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (revisedThinkingInput.trim()) {
                                  setIsRevisedSaved(true);
                                }
                              }}
                              disabled={!revisedThinkingInput.trim()}
                              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                            >
                              {isRevisedSaved ? 'Evolution Diff Active' : 'Generate Side-by-Side Diff'}
                            </button>
                          </div>
                        </div>

                        {/* VISUAL DIFF-STYLE SIDE-BY-SIDE COMPARISON */}
                        {revisedThinkingInput.trim().length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="p-5 bg-[#140D12] border border-rose-900/40 rounded-xl space-y-2.5">
                              <div className="flex items-center justify-between text-xs font-mono text-rose-300">
                                <span>− INITIAL THINKING</span>
                                <span>UNAUDITED</span>
                              </div>
                              <p className="text-sm text-slate-300 leading-relaxed font-mono">
                                &ldquo;{preservedOriginalReasoning || currentAnalysis.decisionInput}&rdquo;
                              </p>
                            </div>

                            <div className="p-5 bg-[#0A1815] border border-emerald-700/50 rounded-xl space-y-2.5">
                              <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                                <span>+ REVISED THINKING</span>
                                <span>BLIND-SPOT AUDITED</span>
                              </div>
                              <p className="text-sm text-emerald-100 leading-relaxed font-mono">
                                &ldquo;{revisedThinkingInput.trim()}&rdquo;
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mandatory Closing Philosophy Banner */}
                    <div className="pt-8 border-t border-slate-800 text-center space-y-2">
                      <p className="text-lg sm:text-xl font-bold text-slate-100 font-display">
                        &ldquo;BLIND SPOT doesn&apos;t decide for you.
                        <br className="hidden sm:inline" /> It helps you see what you might have missed.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* QUIET FOOTER */}
      <footer className="py-8 px-6 lg:px-12 text-xs text-slate-500 border-t border-slate-800/60 bg-[#070A12]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-300 font-display">BLIND SPOT</span>
            <span aria-hidden="true">·</span>
            <span>See what you&apos;re missing before you decide.</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            <span>AI DECISION-INTELLIGENCE COMPANION · ZERO-PRESCRIPTION ARCHITECTURE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
