import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getValidApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === 'MY_GEMINI_API_KEY' || key === 'YOUR_API_KEY') {
    return null;
  }
  return key;
}

function createGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Check API configuration status safely without exposing the secret key
  app.get('/api/status', (_req, res) => {
    const hasKey = Boolean(getValidApiKey());
    res.json({
      configured: hasKey,
      message: hasKey
        ? 'Google Gemini AI reasoning engine is active.'
        : 'GEMINI_API_KEY is not configured. Running in resilient Demo Fallback Mode (set GEMINI_API_KEY in .env or AI Studio Secrets for live Gemini generation).',
    });
  });

  // 1. Primary Blind Spot Analysis (9 Structured Sections)
  app.post('/api/analyze', async (req, res) => {
    try {
      const { decision } = req.body;
      if (!decision || typeof decision !== 'string' || !decision.trim()) {
        res.status(400).json({ error: 'Please provide a decision to analyze.' });
        return;
      }

      const apiKey = getValidApiKey();
      if (!apiKey) {
        res.status(200).json({
          useFallback: true,
          reason: 'GEMINI_API_KEY environment variable is missing or placeholder.',
        });
        return;
      }

      const ai = createGeminiClient(apiKey);

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Audit the reasoning behind the following user decision and context, and surface their blind spots:\n\n"${decision.trim()}"`,
        config: {
          systemInstruction: `You are BLIND SPOT, an AI cognitive decision-thinking companion.
STRICT PRODUCT RULE: You MUST NEVER decide for the user, recommend what they should do, or tell them which option is correct. Your sole role is to audit and challenge the reasoning behind the decision.
CRITICAL ANALYTICAL GUIDELINES:
- Ground every single point directly in the user's specific submitted decision, context, constraints, and priorities. Avoid generic motivational advice or repetitive boilerplate.
- Strictly separate KNOWN FACTS (explicitly stated or objective realities) from ASSUMPTIONS (unstated beliefs taken for granted). Never treat an assumption as a verified fact.
- Explicitly communicate uncertainty where outcomes depend on unknown variables or missing evidence.
Analyze the user's input across these 9 mandatory dimensions:
1. Decision Snapshot (how they are framing it, the core tension, and a strict neutrality reminder)
2. Facts (objective facts explicitly present or directly implied in the user's situation)
3. Assumptions (unstated premises the user is taking for granted, their fragility: "High", "Medium", or "Low", and why they matter)
4. Unknowns (uncertain variables that cannot be known with certainty right now)
5. Missing Information (actionable facts the user hasn't checked yet, why needed, and how to find them)
6. Risks (direct risks with severity "High", "Medium", or "Low")
7. Second-Order Effects (downstream consequences that happen after the immediate outcome)
8. Alternative Explanations (other ways to interpret the problem or non-binary third-way paths)
9. Questions Worth Asking (penetrating Socratic questions examining reversibility, Pre-Mortem, Inversion, 10/10/10 Rule, or Opportunity Cost)
Also provide 4 concise "keyConsiderationsSummary" bullet strings summarizing the top blind spots discovered for later review.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              decisionSnapshot: {
                type: Type.OBJECT,
                properties: {
                  framing: { type: Type.STRING },
                  coreTension: { type: Type.STRING },
                  neutralityNote: { type: Type.STRING },
                },
                required: ['framing', 'coreTension', 'neutralityNote'],
              },
              facts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              assumptions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    statement: { type: Type.STRING },
                    fragility: { type: Type.STRING, description: 'Must be "High", "Medium", or "Low"' },
                    whyItMatters: { type: Type.STRING },
                  },
                  required: ['id', 'statement', 'fragility', 'whyItMatters'],
                },
              },
              unknowns: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              missingInformation: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    item: { type: Type.STRING },
                    whyNeeded: { type: Type.STRING },
                    howToFind: { type: Type.STRING },
                  },
                  required: ['id', 'item', 'whyNeeded', 'howToFind'],
                },
              },
              risks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    severity: { type: Type.STRING, description: 'Must be "High", "Medium", or "Low"' },
                    description: { type: Type.STRING },
                  },
                  required: ['id', 'title', 'severity', 'description'],
                },
              },
              secondOrderEffects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    trigger: { type: Type.STRING },
                    downstreamImpact: { type: Type.STRING },
                    timeframe: { type: Type.STRING },
                  },
                  required: ['id', 'trigger', 'downstreamImpact', 'timeframe'],
                },
              },
              alternativeExplanations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              questionsWorthAsking: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    lens: { type: Type.STRING },
                    question: { type: Type.STRING },
                    purpose: { type: Type.STRING },
                  },
                  required: ['id', 'lens', 'question', 'purpose'],
                },
              },
              keyConsiderationsSummary: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'decisionSnapshot',
              'facts',
              'assumptions',
              'unknowns',
              'missingInformation',
              'risks',
              'secondOrderEffects',
              'alternativeExplanations',
              'questionsWorthAsking',
              'keyConsiderationsSummary',
            ],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        res.status(200).json({ useFallback: true, reason: 'Empty model response.' });
        return;
      }

      const parsed = JSON.parse(rawText.trim());
      res.status(200).json({
        analysis: {
          id: `bs-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          decisionInput: decision.trim(),
          isFallback: false,
          ...parsed,
        },
      });
    } catch (error) {
      console.error('Gemini /api/analyze error, falling back:', error);
      res.status(200).json({
        useFallback: true,
        reason: error instanceof Error ? error.message : 'Gemini service temporarily unavailable.',
      });
    }
  });

  // 2. "Challenge My Thinking" (Red Team Engine)
  app.post('/api/red-team', async (req, res) => {
    try {
      const { decision } = req.body;
      if (!decision || typeof decision !== 'string' || !decision.trim()) {
        res.status(400).json({ error: 'Decision context is required for Red Team analysis.' });
        return;
      }

      const apiKey = getValidApiKey();
      if (!apiKey) {
        res.status(200).json({ useFallback: true });
        return;
      }

      const ai = createGeminiClient(apiKey);

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Red-team and stress-test the user's thinking on this decision:\n\n"${decision.trim()}"`,
        config: {
          systemInstruction: `You are the Red Team module inside BLIND SPOT.
CRITICAL RULE: Do NOT tell the user which option to choose or make the decision for them.
Your job is to rigorously stress-test their current reasoning by returning:
- strongestCounterargument: The single sharpest argument challenging how they are currently thinking about this dilemma.
- weakPointsInReasoning: 3 specific logical vulnerabilities or blind spots in their framing.
- hiddenAssumptionsToChallenge: 3 implicit beliefs worth questioning.
- disprovingEvidence: 3 concrete pieces of evidence that, if found, would disprove or invalidate their current leaning.
- difficultQuestions: 3 uncomfortable, incisive questions the user is likely avoiding.
- whatWouldStrengthenReasoning: 3 concrete actions or checks that would make their reasoning much stronger regardless of what they decide.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              strongestCounterargument: { type: Type.STRING },
              weakPointsInReasoning: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              hiddenAssumptionsToChallenge: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              disprovingEvidence: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              difficultQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              whatWouldStrengthenReasoning: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'strongestCounterargument',
              'weakPointsInReasoning',
              'hiddenAssumptionsToChallenge',
              'disprovingEvidence',
              'difficultQuestions',
              'whatWouldStrengthenReasoning',
            ],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        res.status(200).json({ useFallback: true });
        return;
      }

      const parsed = JSON.parse(rawText.trim());
      res.status(200).json({
        redTeam: {
          isFallback: false,
          ...parsed,
        },
      });
    } catch (error) {
      console.error('Gemini /api/red-team error, falling back:', error);
      res.status(200).json({ useFallback: true });
    }
  });

  // 3. "What Would Change Your Mind?" (Falsification & Evidence Engine)
  app.post('/api/change-mind', async (req, res) => {
    try {
      const { decision, mindChangeInput } = req.body;
      if (!mindChangeInput || typeof mindChangeInput !== 'string' || !mindChangeInput.trim()) {
        res.status(400).json({ error: 'Please enter what would have to be true for you to reconsider.' });
        return;
      }

      const apiKey = getValidApiKey();
      if (!apiKey) {
        res.status(200).json({ useFallback: true });
        return;
      }

      const ai = createGeminiClient(apiKey);

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Original Decision/Position: "${(decision || '').trim()}"\nUser's answer to "What would have to be true for you to reconsider your current position?": "${mindChangeInput.trim()}"`,
        config: {
          systemInstruction: `You are the "What Would Change Your Mind?" module of BLIND SPOT.
CRITICAL RULE: You must NOT tell the user what decision to make. Help the user operationalize the falsification threshold they just stated so they can gather real evidence.
Return structured JSON containing:
- summaryObservation: 1-2 sentences acknowledging the decision-changing factor(s) they identified (e.g., "You've identified a clear decision-changing factor: ...").
- decisionChangingFactors: 3 specific factors that would legitimately shift the calculus of this decision.
- evidenceToLookFor: 3-4 concrete, observable pieces of evidence worth checking right now.
- questionsToInvestigate: 3-4 direct questions the user should ask stakeholders, mentors, or themselves to verify that evidence.
- informationCurrentlyMissing: 3 key facts still unverified.
- assumptionsToTest: 3 specific ways to test their underlying assumptions in the real world.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summaryObservation: { type: Type.STRING },
              decisionChangingFactors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              evidenceToLookFor: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              questionsToInvestigate: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              informationCurrentlyMissing: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              assumptionsToTest: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'summaryObservation',
              'decisionChangingFactors',
              'evidenceToLookFor',
              'questionsToInvestigate',
              'informationCurrentlyMissing',
              'assumptionsToTest',
            ],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        res.status(200).json({ useFallback: true });
        return;
      }

      const parsed = JSON.parse(rawText.trim());
      res.status(200).json({
        mindChange: {
          isFallback: false,
          userThresholdInput: mindChangeInput.trim(),
          ...parsed,
        },
      });
    } catch (error) {
      console.error('Gemini /api/change-mind error, falling back:', error);
      res.status(200).json({ useFallback: true });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BLIND SPOT server running on http://localhost:${PORT}`);
  });
}

startServer();
