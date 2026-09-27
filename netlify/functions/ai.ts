// Netlify serverless function — Google Gemini integration.
//
// Environment variable required (set in Netlify site settings, never committed):
//   GEMINI_API_KEY — Google AI Studio API key (free tier supported)
//
// The function accepts POST requests from src/services/ai.ts:
//   { action: "analyzeChallenge" | "generateSolution" | "generateBlueprint", payload: { … } }
//
// Returns JSON matching the existing TypeScript types in src/types/index.ts.
// Returns 503 on any LLM error so the client falls back to its local mock.

import type { Handler, HandlerEvent } from '@netlify/functions';

// ---------------------------------------------------------------------------
// Gemini helper
// ---------------------------------------------------------------------------

// gemini-2.0-flash is available on the free tier and has strong JSON output
const GEMINI_MODEL = 'gemini-2.0-flash';

async function generateText(apiKey: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1200 },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini generate failed ${res.status}: ${text}`);
  }
  const data = await res.json() as {
    candidates: { content: { parts: { text: string }[] } }[];
  };
  return data.candidates[0]?.content?.parts[0]?.text ?? '';
}

/** Extract the first JSON object or array from a model response string. */
function extractJson(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON found in model response');
  return JSON.parse(match[0]);
}

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

function buildAnalyzePrompt(payload: Record<string, unknown>): string {
  const { project, evidence, timeline } = payload as {
    project: { id: string; name: string; category: string; location: string; description: string };
    evidence: { title: string; type: string; description: string; status: string }[];
    timeline: { year: string; title: string; description: string; kind: string }[];
  };

  const evidenceSummary = evidence
    .map((e) => `- [${e.status}] ${e.title} (${e.type}): ${e.description}`)
    .join('\n');
  const timelineSummary = timeline
    .map((t) => `- ${t.year} [${t.kind}]: ${t.title} — ${t.description}`)
    .join('\n');

  return `You are a civic-technology analyst. Analyze the following urban challenge and return ONLY a JSON object — no explanation, no markdown, no text outside the JSON.

Challenge: ${project.name}
Location: ${project.location}
Category: ${project.category}
Description: ${project.description}

Evidence:
${evidenceSummary || '(none)'}

Timeline:
${timelineSummary || '(none)'}

Return a JSON object with exactly these keys:
{
  "whatIsHappening": "one paragraph describing the core issue",
  "whereItHappens": "one paragraph describing the affected locations",
  "whenItOccurs": "one paragraph describing timing and frequency",
  "recurringPatterns": ["pattern 1", "pattern 2"],
  "contributingFactors": [
    { "factor": "description", "confidence": "evidence" },
    { "factor": "description", "confidence": "interpretation" }
  ],
  "supportingEvidence": ["evidence title 1", "evidence title 2"],
  "informationGaps": ["gap 1", "gap 2"]
}

JSON:`;
}

function buildSolutionPrompt(payload: Record<string, unknown>): string {
  const { project, analysis } = payload as {
    project: { id: string; name: string; category: string; location: string; description: string };
    analysis: { whatIsHappening: string; recurringPatterns: string[] };
  };

  return `You are a civic-technology solution designer. Design a digital solution for the following urban challenge and return ONLY a JSON object — no explanation, no markdown, no text outside the JSON.

Challenge: ${project.name}
Location: ${project.location}
Category: ${project.category}
What is happening: ${analysis.whatIsHappening}
Patterns: ${analysis.recurringPatterns.join('; ')}

Return a JSON object with exactly these keys:
{
  "name": "short product name (e.g. FloodWatch)",
  "description": "one sentence describing the platform",
  "objective": "one sentence stating the goal",
  "users": ["User type 1", "User type 2"],
  "features": [
    { "id": "f1", "name": "Feature name", "description": "one sentence" }
  ]
}

Include 5–8 features. JSON:`;
}

function buildBlueprintPrompt(payload: Record<string, unknown>): string {
  const { project, solution } = payload as {
    project: { id: string; category: string; location: string };
    solution: {
      name: string;
      objective: string;
      users: string[];
      features: { id: string; name: string; description: string }[];
    };
  };

  const featureList = solution.features.map((f) => `- ${f.name}: ${f.description}`).join('\n');

  return `You are a civic-technology architect. Create a solution blueprint and return ONLY a JSON object — no explanation, no markdown, no text outside the JSON.

Product: ${solution.name}
Category: ${project.category}
Location: ${project.location}
Objective: ${solution.objective}
Users: ${solution.users.join(', ')}
Features:
${featureList}

Return a JSON object with exactly these keys:
{
  "goal": "one sentence",
  "targetUsers": ["User 1", "User 2"],
  "coreFeatures": ["Feature name 1", "Feature name 2"],
  "userFlows": [
    { "role": "Role name", "steps": ["Step 1", "Step 2", "Step 3"] }
  ],
  "screens": [
    { "id": "s1", "name": "Screen name", "description": "one sentence" }
  ],
  "dataModels": [
    {
      "entity": "EntityName",
      "fields": [
        { "name": "fieldName", "type": "type description" }
      ]
    }
  ],
  "acceptanceCriteria": ["criterion 1", "criterion 2"]
}

Include 2–3 user flows, 4–6 screens, 2–3 data models, and 4 acceptance criteria. JSON:`;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
    };
  }

  let body: { action: string; payload: Record<string, unknown> };
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON body' };
  }

  const { action, payload } = body;

  let prompt: string;
  switch (action) {
    case 'analyzeChallenge':
      prompt = buildAnalyzePrompt(payload);
      break;
    case 'generateSolution':
      prompt = buildSolutionPrompt(payload);
      break;
    case 'generateBlueprint':
      prompt = buildBlueprintPrompt(payload);
      break;
    default:
      return { statusCode: 400, body: `Unknown action: ${action}` };
  }

  try {
    const raw = await generateText(apiKey, prompt);
    const result = extractJson(raw);

    // For analyzeChallenge and generateSolution we need to inject server-generated ids
    // that the client types require but the model doesn't know about.
    let finalResult: Record<string, unknown>;
    if (action === 'analyzeChallenge') {
      const p = payload.project as { id: string };
      finalResult = {
        id: `an-${Date.now()}`,
        projectId: p.id,
        generatedAt: new Date().toISOString().slice(0, 10),
        ...(result as object),
      };
    } else if (action === 'generateSolution') {
      const p = payload.project as { id: string };
      finalResult = {
        id: `sol-${Date.now()}`,
        projectId: p.id,
        ...(result as object),
      };
    } else {
      // generateBlueprint
      const p = payload.project as { id: string };
      finalResult = {
        id: `bp-${Date.now()}`,
        projectId: p.id,
        status: 'Ready to build',
        ...(result as object),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalResult),
    };
  } catch (err) {
    console.error('[ai function]', err);
    // Return 503 so the client falls back to its local mock
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'LLM call failed, client should use fallback' }),
    };
  }
};
