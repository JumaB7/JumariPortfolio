import { PROJECTS } from '../../models/portfolio-content';
import {
  PortfolioAnalyticsDataset,
  PortfolioAnalyticsProject,
  ProjectStatus,
} from '../models/portfolio-analytics.model';

/** Map showcase preview labels to analytics categories represented in the portfolio. */
const CATEGORY_BY_PROJECT_ID: Record<string, string> = {
  'veld-supply': 'Full-stack web applications',
  'accountant-app': 'Mobile applications',
  'portfolio-dashboard': 'AI/data analytics',
};

/**
 * Status is inferred only from known delivery signals in portfolio content
 * (live URL vs coming-soon), not invented business metrics.
 */
function inferStatus(projectId: string): ProjectStatus | undefined {
  const project = PROJECTS.find((p) => p.id === projectId);
  if (!project) return undefined;
  const hasLivePrimary = project.actions.some((a) => a.primary && !!a.url && !a.url.startsWith('#'));
  if (projectId === 'veld-supply' && hasLivePrimary) return 'completed';
  if (projectId === 'accountant-app') return 'in-progress';
  if (projectId === 'portfolio-dashboard') return 'in-progress';
  return undefined;
}

function mapProjects(): PortfolioAnalyticsProject[] {
  return PROJECTS.map((project) => ({
    id: project.id,
    name: project.name,
    category: CATEGORY_BY_PROJECT_ID[project.id] ?? 'Other',
    technologies: [...project.tech],
    status: inferStatus(project.id),
    description: project.description,
    // Dates are intentionally omitted until real project dates are available.
  }));
}

/**
 * Demo / showcase dataset derived from the same portfolio project list used on the landing page.
 * Not connected to live production telemetry. Ready to swap for an API response later.
 */
export function createAnalyticsDemoDataset(): PortfolioAnalyticsDataset {
  return {
    sourceLabel: 'Synthetic showcase data derived from portfolio projects',
    generatedAt: new Date().toISOString(),
    yearsExperience: 4,
    projects: mapProjects(),
  };
}
