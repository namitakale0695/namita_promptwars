export interface DecisionSnapshot {
  framing: string;
  coreTension: string;
  neutralityNote: string;
}

export interface AssumptionItem {
  id: string;
  statement: string;
  fragility: 'High' | 'Medium' | 'Low';
  whyItMatters: string;
}

export interface RiskItem {
  id: string;
  title: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface SecondOrderEffectItem {
  id: string;
  trigger: string;
  downstreamImpact: string;
  timeframe: string;
}

export interface MissingInfoItem {
  id: string;
  item: string;
  whyNeeded: string;
  howToFind: string;
}

export interface QuestionItem {
  id: string;
  lens: string;
  question: string;
  purpose: string;
}

export interface DecisionAnalysis {
  id: string;
  timestamp: string;
  decisionInput: string;
  isFallback?: boolean;
  fallbackReason?: string;
  decisionSnapshot: DecisionSnapshot;
  facts: string[];
  assumptions: AssumptionItem[];
  unknowns: string[];
  missingInformation: MissingInfoItem[];
  risks: RiskItem[];
  secondOrderEffects: SecondOrderEffectItem[];
  alternativeExplanations: string[];
  questionsWorthAsking: QuestionItem[];
  keyConsiderationsSummary: string[];
}

export interface RedTeamAnalysis {
  isFallback?: boolean;
  strongestCounterargument: string;
  weakPointsInReasoning: string[];
  hiddenAssumptionsToChallenge: string[];
  disprovingEvidence: string[];
  difficultQuestions: string[];
  whatWouldStrengthenReasoning: string[];
}

export interface MindChangeAnalysis {
  isFallback?: boolean;
  userThresholdInput: string;
  summaryObservation: string;
  decisionChangingFactors: string[];
  evidenceToLookFor: string[];
  questionsToInvestigate: string[];
  informationCurrentlyMissing: string[];
  assumptionsToTest: string[];
}

export interface SampleScenario {
  id: string;
  label: string;
  category: string;
  prompt: string;
  sampleMindChangePrompt: string;
}
