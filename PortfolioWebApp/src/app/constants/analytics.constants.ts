import { ProjectKind, ProjectStatus } from '../analytics/models/portfolio-analytics.model';

export const PROJECT_KIND_LABELS: Record<ProjectKind | 'all', string> = {
  all: 'All types',
  personal: 'Personal',
  professional: 'Professional',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus | 'all', string> = {
  all: 'All statuses',
  completed: 'Completed',
  'in-progress': 'In progress',
};

export const FINANCIAL_KPI_ACCENT_CLASS: Record<'cyan' | 'blue' | 'purple' | 'teal', string> = {
  cyan: 'financial-kpi--cyan',
  blue: 'financial-kpi--blue',
  purple: 'financial-kpi--purple',
  teal: 'financial-kpi--teal',
};

export const PROJECT_PREVIEW_CLASS_BY_ID: Record<string, string> = {
  'veld-supply': 'project-preview--commerce',
  'accountant-app': 'project-preview--admin',
};

export const DEFAULT_PROJECT_PREVIEW_CLASS = 'project-preview--analytics';

export const ANALYTICS_LOAD_COPY = {
  financialLoading: 'Loading financial analytics',
  financialError: 'Could not load financial analytics.',
  projectsLoading: 'Loading analytics',
  projectsError: 'Could not load portfolio analytics.',
  retry: 'Try again',
} as const;
