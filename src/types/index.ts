export type ChallengeCategory =
  | 'Flooding & Drainage'
  | 'Waste Management'
  | 'Traffic & Mobility'
  | 'Public Safety'
  | 'Environment'
  | 'Infrastructure'
  | 'Other';

export type ProjectStatus =
  | 'Evidence Collection'
  | 'Challenge Analysis'
  | 'Solution Design'
  | 'Solution Ready';

export interface CivicProject {
  id: string;
  name: string;
  category: ChallengeCategory;
  location: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  coordinates: { lat: number; lng: number };
  affectedGroups: string[];
}

export type EvidenceType = 'Current Photos' | 'Historical Maps' | 'Reports & Records' | 'Citizen Reports';

export interface EvidenceItem {
  id: string;
  projectId: string;
  title: string;
  type: EvidenceType;
  date: string;
  location: string;
  latitude?: number;
  longitude?: number;
  description: string;
  source: string;
  status: 'Verified' | 'Unverified' | 'Under Review';
  imageUrl?: string;
  imageCredit?: string;
}

export interface TimelineEvent {
  id: string;
  projectId: string;
  year: string;
  title: string;
  description: string;
  kind: 'incident' | 'change' | 'pattern' | 'current';
}

export interface AnalysisResult {
  id: string;
  projectId: string;
  generatedAt: string;
  whatIsHappening: string;
  whereItHappens: string;
  whenItOccurs: string;
  recurringPatterns: string[];
  contributingFactors: { factor: string; confidence: 'evidence' | 'interpretation' }[];
  supportingEvidence: string[];
  informationGaps: string[];
}

export interface SolutionFeature {
  id: string;
  name: string;
  description: string;
}

export interface SolutionScreen {
  id: string;
  name: string;
  description: string;
}

export interface Solution {
  id: string;
  projectId: string;
  name: string;
  description: string;
  objective: string;
  users: string[];
  features: SolutionFeature[];
}

export interface DataField {
  name: string;
  type: string;
}

export interface DataModel {
  entity: string;
  fields: DataField[];
}

export interface SolutionBlueprint {
  id: string;
  projectId: string;
  status: 'Draft' | 'Ready to build';
  goal: string;
  targetUsers: string[];
  coreFeatures: string[];
  userFlows: { role: string; steps: string[] }[];
  screens: SolutionScreen[];
  dataModels: DataModel[];
  acceptanceCriteria: string[];
}

export interface BuildPrompt {
  id: string;
  projectId: string;
  generatedAt: string;
  content: string;
}
