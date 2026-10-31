export type ProjectStatus = 'completed' | 'in-progress';

export interface PortfolioAnalyticsProject {
  id: string;
  name: string;
  category: string;
  technologies: string[];
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface PortfolioAnalyticsDataset {
  /** Explicitly marks showcase / demo provenance. */
  sourceLabel: string;
  generatedAt: string;
  yearsExperience: number;
  projects: PortfolioAnalyticsProject[];
}

export interface AnalyticsFilters {
  category: string | 'all';
  technology: string | 'all';
  status: ProjectStatus | 'all';
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
  | { kind: 'matrix'; project: string; technology: string; used: boolean }
  | null;

export type AnalyticsLoadState =
  | { status: 'loading' }
  | { status: 'ready'; data: PortfolioAnalyticsDataset }
  | { status: 'error'; message: string };
