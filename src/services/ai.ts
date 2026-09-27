// AI service layer.
//
// Each exported function tries the server-side /api/ai endpoint first.
// If the endpoint is unreachable, returns a non-2xx status, or the response
// cannot be parsed, it falls back to the local mock so the app continues
// working in all environments (plain `npm run dev`, offline, or before the
// LLM is wired in).
//
// To add a real LLM: implement the handler in netlify/functions/ai.ts.
// Nothing in this file needs to change once that is done.

import type { AnalysisResult, CivicProject, EvidenceItem, Solution, SolutionBlueprint, TimelineEvent } from '@/types';
import { seedAnalysis, seedSolutions, PROJECT_FLOODING_ID } from '@/data/seed';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** Call the server-side AI endpoint. Returns parsed JSON or throws. */
async function callAiEndpoint(action: string, payload: unknown): Promise<unknown> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });
  if (!res.ok) {
    throw new Error(`AI endpoint returned ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Mock fallbacks (preserved exactly from original implementation)
// ---------------------------------------------------------------------------

function _mockAnalyzeChallenge(
  project: CivicProject,
  evidence: EvidenceItem[],
  timeline: TimelineEvent[]
): AnalysisResult {
  if (project.id === PROJECT_FLOODING_ID && seedAnalysis[PROJECT_FLOODING_ID]) {
    return { ...seedAnalysis[PROJECT_FLOODING_ID], generatedAt: new Date().toISOString().slice(0, 10) };
  }

  const verifiedSources = evidence.filter((e) => e.status === 'Verified').map((e) => e.title);
  const years = [...new Set(timeline.map((t) => t.year))];

  return {
    id: `an-${Date.now()}`,
    projectId: project.id,
    generatedAt: new Date().toISOString().slice(0, 10),
    whatIsHappening: `Based on ${evidence.length} evidence item${evidence.length === 1 ? '' : 's'}, a recurring "${project.category.toLowerCase()}" issue has been reported in ${project.location}.`,
    whereItHappens: `Reports concentrate around ${project.location}, based on the locations attached to submitted evidence.`,
    whenItOccurs: years.length
      ? `Recorded incidents span ${years.join(', ')}, suggesting a pattern rather than an isolated event.`
      : 'Insufficient timeline data to establish a clear recurrence window yet.',
    recurringPatterns: years.length > 1
      ? [`Reports recur across multiple years: ${years.join(', ')}`]
      : ['Not enough historical data yet to confirm a recurring pattern.'],
    contributingFactors: [
      { factor: 'Specific root cause not yet established from available evidence', confidence: 'interpretation' },
    ],
    supportingEvidence: verifiedSources.length ? verifiedSources : ['No verified evidence attached yet'],
    informationGaps: [
      'Baseline conditions have not been measured',
      'Limited evidence outside reported incident windows',
    ],
  };
}

function _mockGenerateSolution(project: CivicProject, analysis: AnalysisResult): Solution {
  if (project.id === PROJECT_FLOODING_ID && seedSolutions[PROJECT_FLOODING_ID]) {
    return seedSolutions[PROJECT_FLOODING_ID];
  }

  return {
    id: `sol-${Date.now()}`,
    projectId: project.id,
    name: `${project.category.split(' ')[0]}Watch`,
    description: `A digital platform for reporting, tracking and coordinating response to ${project.category.toLowerCase()} issues in ${project.location}.`,
    objective: `Enable faster reporting and response to the pattern identified in the challenge analysis: ${analysis.whatIsHappening}`,
    users: ['Municipal teams', 'Field workers', 'Civic organizations', 'Citizens'],
    features: [
      { id: 'f1', name: 'Incident reporting', description: 'Citizens and field teams submit reports with photo and location.' },
      { id: 'f2', name: 'Location-based mapping', description: 'Reports plotted on a live map for situational awareness.' },
      { id: 'f3', name: 'Severity classification', description: 'Reports tagged by estimated severity and impact.' },
      { id: 'f4', name: 'Response tracking', description: 'Municipal teams assign and update response status.' },
      { id: 'f5', name: 'Municipal dashboard', description: 'Aggregated operational view of open and resolved reports.' },
    ],
  };
}

function _mockGenerateBlueprint(project: CivicProject, solution: Solution): SolutionBlueprint {
  return {
    id: `bp-${Date.now()}`,
    projectId: project.id,
    status: 'Ready to build',
    goal: solution.objective,
    targetUsers: solution.users,
    coreFeatures: solution.features.map((f) => f.name),
    userFlows: [
      { role: 'Citizen', steps: ['Report incident', 'Attach photo', 'Share location', 'Submit'] },
      { role: 'Municipal team', steps: ['View incident', 'Verify', 'Assign response', 'Update status'] },
    ],
    screens: [
      { id: 's1', name: 'Login', description: 'Role-based sign-in for citizens and municipal staff.' },
      { id: 's2', name: 'Incident reporting', description: 'Form for submitting a new report with photo and location.' },
      { id: 's3', name: 'Map', description: 'Live map of reported incidents.' },
      { id: 's4', name: 'Incident details', description: 'Full record of a single incident including status history.' },
      { id: 's5', name: 'Municipal dashboard', description: 'Aggregated operational view for response teams.' },
    ],
    dataModels: [
      {
        entity: 'Incident',
        fields: [
          { name: 'id', type: 'uuid' },
          { name: 'location', type: 'text' },
          { name: 'latitude', type: 'float' },
          { name: 'longitude', type: 'float' },
          { name: 'timestamp', type: 'timestamptz' },
          { name: 'severity', type: 'enum(low, medium, high, critical)' },
          { name: 'description', type: 'text' },
          { name: 'photo', type: 'text (storage url)' },
          { name: 'status', type: 'enum(reported, verified, in_progress, resolved)' },
        ],
      },
      {
        entity: 'Response',
        fields: [
          { name: 'id', type: 'uuid' },
          { name: 'incident_id', type: 'uuid (fk -> Incident)' },
          { name: 'assigned_team', type: 'text' },
          { name: 'status', type: 'enum(pending, dispatched, resolved)' },
          { name: 'notes', type: 'text' },
          { name: 'updated_at', type: 'timestamptz' },
        ],
      },
    ],
    acceptanceCriteria: [
      `A user can submit a ${project.category.toLowerCase()} incident with location and photo.`,
      'A municipal user can view reported incidents on a map.',
      'A municipal user can update response status.',
      'The dashboard displays incident trends.',
    ],
  };
}

// ---------------------------------------------------------------------------
// Public API — signatures and return types are unchanged
// ---------------------------------------------------------------------------

export async function analyzeChallenge(
  project: CivicProject,
  evidence: EvidenceItem[],
  timeline: TimelineEvent[]
): Promise<AnalysisResult> {
  try {
    const result = await callAiEndpoint('analyzeChallenge', { project, evidence, timeline });
    return result as AnalysisResult;
  } catch {
    await delay(1600);
    return _mockAnalyzeChallenge(project, evidence, timeline);
  }
}

export async function generateSolution(project: CivicProject, analysis: AnalysisResult): Promise<Solution> {
  try {
    const result = await callAiEndpoint('generateSolution', { project, analysis });
    return result as Solution;
  } catch {
    await delay(1200);
    return _mockGenerateSolution(project, analysis);
  }
}

export async function generateBlueprint(project: CivicProject, solution: Solution): Promise<SolutionBlueprint> {
  try {
    const result = await callAiEndpoint('generateBlueprint', { project, solution });
    return result as SolutionBlueprint;
  } catch {
    await delay(1000);
    return _mockGenerateBlueprint(project, solution);
  }
}

export async function generateBuildPrompt(
  project: CivicProject,
  solution: Solution,
  blueprint: SolutionBlueprint
): Promise<string> {
  await delay(900);

  const flows = blueprint.userFlows.map((f) => `  - ${f.role}: ${f.steps.join(' -> ')}`).join('\n');
  const screens = blueprint.screens.map((s) => `  - ${s.name}: ${s.description}`).join('\n');
  const features = blueprint.coreFeatures.map((f) => `  - ${f}`).join('\n');
  const schema = blueprint.dataModels
    .map((m) => `  ${m.entity}:\n${m.fields.map((f) => `    - ${f.name}: ${f.type}`).join('\n')}`)
    .join('\n');
  const criteria = blueprint.acceptanceCriteria.map((c) => `  - ${c}`).join('\n');

  return `PRODUCT NAME
${solution.name}

PROBLEM / CONTEXT
${project.description}

Location: ${project.location}
Category: ${project.category}

USERS
${blueprint.targetUsers.map((u) => `  - ${u}`).join('\n')}

OBJECTIVE
${blueprint.goal}

FEATURES
${features}

SCREENS
${screens}

USER FLOWS
${flows}

DATABASE SCHEMA
${schema}

TECHNICAL REQUIREMENTS
  - React + TypeScript frontend
  - Supabase-compatible backend (Postgres, auth, storage for photos)
  - Map integration (Leaflet/OpenStreetMap) for incident locations
  - Role-based access: citizen vs municipal team
  - Mobile-responsive incident reporting flow

ACCEPTANCE CRITERIA
${criteria}
`;
}
