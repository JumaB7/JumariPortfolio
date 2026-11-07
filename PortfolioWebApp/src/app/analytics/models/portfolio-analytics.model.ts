export enum ProjectStatus {
  Completed = 'completed',
  InProgress = 'in-progress',
}

export enum ProjectKind {
  Personal = 'personal',
  Professional = 'professional',
}

export interface PortfolioAnalyticsProject {
  id: string;
  name: string;
  category: string;
  technologies: string[];
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  description?: string;
  /** personal = independent work; professional = employer / client delivery. */
  kind?: ProjectKind;
  url?: string;
  organization?: string;
}

export interface PortfolioOwnerHighlight {
  label: string;
  value: string;
}

export interface PortfolioOwner {
  name: string;
  role: string;
  location: string;
  summary: string;
  highlights: PortfolioOwnerHighlight[];
}

export interface PortfolioAnalyticsDataset {
  /** Explicitly marks showcase / demo provenance. */
  sourceLabel: string;
  generatedAt: string;
  yearsExperience: number;
  /** Optional — present on the shared API payload; charts do not require it. */
  owner?: PortfolioOwner;
  projects: PortfolioAnalyticsProject[];
}

export type AnalyticsFilterAll = 'all';

export interface AnalyticsFilters {
  kind: ProjectKind | AnalyticsFilterAll;
  category: string | AnalyticsFilterAll;
  technology: string | AnalyticsFilterAll;
  status: ProjectStatus | AnalyticsFilterAll;
}

export interface AnalyticsKpis {
  totalProjects: number;
  yearsExperience: number;
  technologiesUsed: number;
  projectCategories: number;
}

export type AnalyticsSelection =
  | { kind: 'technology'; value: string }
  | { kind: 'category'; value: string }
  | { kind: 'project'; value: string }
  | null;

export type AnalyticsLoadState =
  | { status: 'loading' }
  | { status: 'ready'; data: PortfolioAnalyticsDataset }
  | { status: 'error'; message: string };
