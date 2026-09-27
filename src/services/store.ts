// Lightweight data layer. Shaped so each entity map corresponds to a Supabase
// table (projects, evidence, timeline_events, analyses, solutions,
// solution_features, solution_screens, build_prompts). Swap this module for
// a real Supabase client later without touching the UI or other services.

import type {
  CivicProject,
  EvidenceItem,
  TimelineEvent,
  AnalysisResult,
  Solution,
  SolutionBlueprint,
  BuildPrompt,
} from '@/types';
import {
  seedProjects,
  seedEvidence,
  seedTimeline,
  seedAnalysis,
  seedSolutions,
  seedBlueprints,
} from '@/data/seed';

const STORAGE_KEY = 'citymind.v1';

interface DB {
  projects: CivicProject[];
  evidence: EvidenceItem[];
  timelineEvents: TimelineEvent[];
  analyses: Record<string, AnalysisResult>;
  solutions: Record<string, Solution>;
  blueprints: Record<string, SolutionBlueprint>;
  buildPrompts: Record<string, BuildPrompt>;
}

function seedDb(): DB {
  return {
    projects: seedProjects,
    evidence: seedEvidence,
    timelineEvents: seedTimeline,
    analyses: seedAnalysis,
    solutions: seedSolutions,
    blueprints: seedBlueprints,
    buildPrompts: {},
  };
}

function load(): DB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedDb();
    return JSON.parse(raw) as DB;
  } catch {
    return seedDb();
  }
}

function persist(db: DB) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // demo mode: storage failures are non-fatal
  }
}

let db = load();

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export const store = {
  async listProjects(): Promise<CivicProject[]> {
    await delay(200);
    return [...db.projects].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },

  async getProject(id: string): Promise<CivicProject | undefined> {
    await delay(150);
    return db.projects.find((p) => p.id === id);
  },

  async createProject(
    input: Omit<CivicProject, 'id' | 'createdAt' | 'status' | 'coordinates' | 'affectedGroups'> & {
      coordinates?: { lat: number; lng: number };
    }
  ): Promise<CivicProject> {
    await delay(400);
    const { coordinates, ...rest } = input;
    const project: CivicProject = {
      ...rest,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'Evidence Collection',
      coordinates: coordinates ?? { lat: 17.385 + (Math.random() - 0.5) * 0.1, lng: 78.4867 + (Math.random() - 0.5) * 0.1 },
      affectedGroups: ['Residents', 'Municipal field teams'],
    };
    db.projects = [project, ...db.projects];
    persist(db);
    return project;
  },

  async updateProjectStatus(id: string, status: CivicProject['status']): Promise<void> {
    db.projects = db.projects.map((p) => (p.id === id ? { ...p, status } : p));
    persist(db);
  },

  async listEvidence(projectId: string): Promise<EvidenceItem[]> {
    await delay(200);
    return db.evidence.filter((e) => e.projectId === projectId);
  },

  async addEvidence(item: Omit<EvidenceItem, 'id'>): Promise<EvidenceItem> {
    await delay(350);
    const newItem: EvidenceItem = { ...item, id: `ev-${Date.now()}` };
    db.evidence = [newItem, ...db.evidence];
    persist(db);
    return newItem;
  },

  async listTimeline(projectId: string): Promise<TimelineEvent[]> {
    await delay(200);
    return db.timelineEvents
      .filter((t) => t.projectId === projectId)
      .sort((a, b) => a.year.localeCompare(b.year));
  },

  async getAnalysis(projectId: string): Promise<AnalysisResult | undefined> {
    await delay(150);
    return db.analyses[projectId];
  },

  async saveAnalysis(analysis: AnalysisResult): Promise<void> {
    db.analyses[analysis.projectId] = analysis;
    persist(db);
  },

  async getSolution(projectId: string): Promise<Solution | undefined> {
    await delay(150);
    return db.solutions[projectId];
  },

  async saveSolution(solution: Solution): Promise<void> {
    db.solutions[solution.projectId] = solution;
    persist(db);
  },

  async getBlueprint(projectId: string): Promise<SolutionBlueprint | undefined> {
    await delay(150);
    return db.blueprints[projectId];
  },

  async saveBlueprint(blueprint: SolutionBlueprint): Promise<void> {
    db.blueprints[blueprint.projectId] = blueprint;
    persist(db);
  },

  async getBuildPrompt(projectId: string): Promise<BuildPrompt | undefined> {
    await delay(100);
    return db.buildPrompts[projectId];
  },

  async saveBuildPrompt(prompt: BuildPrompt): Promise<void> {
    db.buildPrompts[prompt.projectId] = prompt;
    persist(db);
  },

  resetDemoData(): void {
    db = seedDb();
    persist(db);
  },
};
