# BLIND SPOT

**"See what you're missing before you decide."**

An AI decision-thinking companion that audits and challenges your reasoning—surfacing hidden assumptions, blind spots, missing information, risks, cognitive biases, and second-order effects—without ever making the decision for you.

---

## Problem

People often make important academic, career, technical, and personal decisions based on what they notice first (**WYSIATI** — *What You See Is All There Is*). When weighing a dilemma, human reasoning naturally defaults to:
- Treating unverified **assumptions** as objective facts
- Compressing multi-dimensional problems into rigid **binary choices** (*Option A vs. Option B*)
- Overlooking **missing information** that could be verified with a quick check
- Ignoring **second-order effects** that ripple out days or months after the initial choice
- Seeking confirmation for an existing gut leaning rather than stress-testing it

Standard conversational chatbots frequently reinforce these traps by agreeing with the user's framing or offering generic pros-and-cons lists that tell the user what to choose.

---

## Solution

**BLIND SPOT** is built as an analytical **Decision Intelligence Laboratory** rather than a generic chatbot.

Instead of prescribing an answer or scoring your choice as "right" or "wrong", BLIND SPOT preserves **100% User Agency**. It decomposes a user's dilemma across 9 structured analytical dimensions, runs an adversarial **Red Team Mode** (*"Challenge My Thinking"*), operationalizes falsification thresholds (*"What Would Change Your Mind?"*), and tracks how the user's perspective matures in **Thinking Revisited**.

---

## Chosen Challenge Vertical

**Challenge Vertical: THE BLIND SPOT**

- **Challenge Problem Statement**: People often make decisions based on what they notice first while overlooking assumptions, risks, missing information, biases, and important factors.
- **Core Goal**: Build an AI-powered thinking companion that spots what might be missing, asks thoughtful questions, and helps users examine their reasoning without making the decision for them.

---

## How It Works

The application guides the user through a 4-stage cognitive verification pipeline:

```text
01 USER DECISION
       ↓
02 BLIND-SPOT AUDIT (9 Dimensions)
       ↓
03 RED TEAM CHALLENGE & FALSIFICATION
       ↓
04 THINKING REVISITED (Reasoning Evolution)
```

### The 9-Dimension Blind-Spot Audit
When a user enters a decision (along with optional *Context*, *Constraints*, and *What Matters Most*), BLIND SPOT generates an intelligence report structured into:

1. **01 · Facts (`What is actually known?`)**: Objective realities explicitly stated or directly implied in the user's situation, separated from speculation.
2. **02 · Assumptions (`What are you taking for granted?`)**: Unstated premises baked into the user's framing, rated by fragility (`HIGH`, `MEDIUM`, `LOW`) with an interactive audit checklist.
3. **03 · Unknown Variables & Verifiable Gaps (`What information is missing?`)**: Uncertain variables alongside concrete verification protocols explaining *why* the data matters and *how* to check it quickly.
4. **04 · Blind Spots (`What may you be overlooking?`)**: Primary cognitive signals highlighting planning fallacies, binary framing traps, and salience biases.
5. **05 · Direct Risks (`What could go wrong?`)**: Immediate failure modes categorized by severity.
6. **06 · Second-Order Effects (`What happens after the obvious outcome?`)**: Causal chains (`Trigger → Ripple`) mapped across downstream time horizons.
7. **07 · Alternatives (`What other paths exist?`)**: Non-binary, third-way structural reframes that bypass all-or-nothing trade-offs.
8. **08 · Reversibility & Socratic Audit (`How difficult is it to undo this decision?`)**: Penetrating Socratic questions using cognitive lenses (*Pre-Mortem*, *Inversion*, *10/10/10 Rule*, and *Opportunity Cost*).
9. **09 · Evidence (`What would change your mind?`)**: Interactive falsification engine that converts the user's stated reconsideration threshold into testable evidence and questions to investigate.

---

## Key Features

- **9-Dimension Blind-Spot Audit**: Structured intelligence report separating facts, fragile assumptions, unknown variables, and downstream risks.
- **Visual Hero Blind-Spot Signals**: Highlights top cognitive blind spots with severity indicators and interactive verification checkboxes.
- **Red Team Mode (`Challenge My Thinking`)**: An intellectual stress test (*"Try to prove my decision wrong"*) that contrasts the user's original reasoning against the **Strongest Counterargument**, weak points in the reasoning, hidden assumptions worth challenging, disproving evidence, and safeguards to strengthen the reasoning.
- **What Would Change Your Mind?**: Prompts the user with *"What would have to be true for you to reconsider your current position?"* and generates decision-changing factors, observable evidence worth checking, and rapid experiments.
- **Your Thinking, Revisited (`Reasoning Evolution`)**: Automatically preserves the user's `BEFORE` reasoning, displays the key blind spots discovered (`THEN YOU DISCOVERED`), and provides an interactive `AFTER` workspace with a side-by-side visual diff (`− INITIAL THINKING` vs. `+ REVISED THINKING`).
- **100% User Agency (Non-Prescriptive Guardrail)**: Enforced at both the system-prompt level and UI architecture level—BLIND SPOT never tells the user which option to pick.

---

## AI Approach

- **Model**: Powered by Google Gemini (`gemini-3.8-flash`) via the official `@google/genai` SDK on the server (`server.ts`).
- **Context-Grounded Reasoning**: Combines the user's primary decision statement with optional analytical parameters (*Context*, *Constraints*, *What Matters Most*) so the analysis is directly anchored in the user's specific situation.
- **Structured JSON Schema Enforcement**: Every endpoint (`/api/analyze`, `/api/red-team`, `/api/change-mind`) uses strict `responseSchema` definitions (`Type.OBJECT` / `Type.ARRAY`) to guarantee deterministic, well-typed analytical cards rather(than unstructured chat prose.
- **Resilient Demo Fallback Engine**: If `GEMINI_API_KEY` is not configured in the environment or if network connectivity is interrupted during a live presentation, the application automatically falls back to a deterministic cognitive analysis engine (`src/mockData.ts`) with clear UI status transparency.

---

## Assumptions & Limitations

1. **Single-Session Privacy by Design**: To keep the tool lightweight, fast, and privacy-preserving, analyses and revised thinking reflections are held in client session state rather than persisted to an external database.
2. **User Context Honesty**: The quality of the blind-spot audit depends on the user providing at least a complete sentence describing a genuine dilemma (enforced via input validation).
3. **Non-Advisory Scope**: BLIND SPOT is a cognitive reasoning companion for general decision-making and is not a substitute for licensed legal, medical, or financial fiduciary advice.

---

## Security

- **Zero Client-Side Secret Exposure**: The `@google/genai` SDK is initialized strictly on the backend (`server.ts`) using `process.env.GEMINI_API_KEY`. The API key is never bundled into frontend code or transmitted to the browser.
- **Safe Status Check**: `GET /api/status` reports only a boolean (`configured: true | false`) so the UI can display setup instructions when no key is present without exposing environment values.
- **Repository Hygiene**: `.gitignore` blocks `.env*` files (while keeping `.env.example` with safe instructions), `node_modules/`, `dist/`, and build logs.

---

## Testing & Verification

The project has been verified across the following checks:
1. **Clean Dependency Installation**: `npm install` resolves cleanly with zero peer-dependency conflicts (`esbuild@^0.28.0` aligned with `vite@^8.3.0`).
2. **TypeScript Static Analysis**: `npm run lint` (`tsc --noEmit`) passes with zero type errors across frontend and backend code.
3. **Production Build**: `npm run build` (`vite build`) compiles the production bundle cleanly into `dist/`.
4. **End-to-End Functional Flow**:
   - Empty and short-input validation (`< 10 characters`) displays accessible `role="alert"` feedback.
   - Full 9-dimension Blind-Spot Audit renders and supports interactive section collapsing and signal auditing.
   - **Red Team Mode** transitions into active state and displays the strongest counterargument and disproving evidence.
   - **What Would Change Your Mind?** processes user falsification thresholds.
   - **Thinking Revisited** preserves original reasoning and generates the side-by-side evolution diff.
   - Graceful fallback works seamlessly when `GEMINI_API_KEY` is unset.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), Lucide React Icons
- **Backend / API Layer**: Node.js, Express (`server.ts`), `tsx`
- **AI Engine**: Google Gemini API (`@google/genai` SDK)
- **Build Tooling**: Vite 8, ESBuild (`^0.28.0`)

---

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables (optional for Demo Mode, required for Live Gemini)**:
   Copy `.env.example` to `.env` and set your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## Production Build & Deployment

### Production Build
```bash
npm run build
```
This runs `vite build` and outputs optimized static assets to `dist/`.

To run the full-stack production server locally:
```bash
npm start
```

### Vercel Deployment
- **Install Command**: `npm install`
- **Build Command**: `vite build` (or `npm run build`)
- **Output Directory**: `dist`
- **Environment Variables**: Add `GEMINI_API_KEY` in the Vercel Project Settings → Environment Variables panel. (If omitted, the frontend automatically operates in resilient Demo Fallback Mode.)
