import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AnalyticsFilters,
  AnalyticsKpis,
  PortfolioAnalyticsDataset,
  PortfolioAnalyticsProject,
  ProjectKind,
  ProjectStatus,
} from '../models/portfolio-analytics.model';

const DEFAULT_FILTERS: AnalyticsFilters = {
  kind: 'all',
  category: 'all',
  technology: 'all',
  status: 'all',
};

@Injectable({ providedIn: 'root' })
export class PortfolioAnalyticsService {
  private readonly http = inject(HttpClient);

  /** Shared showcase analytics from PortfolioAPI (SQL Server). */
  getAnalytics(): Observable<PortfolioAnalyticsDataset> {
    return this.http
      .get<PortfolioAnalyticsDataset>(`${environment.apiBaseUrl}/dashboard/analytics`)
      .pipe(
        map((data) => ({
          ...data,
          projects: (data.projects ?? []).map((project) => ({
            ...project,
            kind:
              project.kind === ProjectKind.Professional
                ? ProjectKind.Professional
                : ProjectKind.Personal,
            status:
              project.status === 'in-progress'
                ? ProjectStatus.InProgress
                : project.status === 'completed'
                  ? ProjectStatus.Completed
                  : project.status,
          })),
        })),
      );
  }

  defaultFilters(): AnalyticsFilters {
    return { ...DEFAULT_FILTERS };
  }

  filterProjects(
    projects: PortfolioAnalyticsProject[],
    filters: AnalyticsFilters,
  ): PortfolioAnalyticsProject[] {
    return projects.filter((project) => {
      const kind = project.kind ?? ProjectKind.Personal;
      if (filters.kind !== 'all' && kind !== filters.kind) return false;
      if (filters.category !== 'all' && project.category !== filters.category) return false;
      if (filters.technology !== 'all' && !project.technologies.includes(filters.technology)) {
        return false;
      }
      if (filters.status !== 'all' && project.status !== filters.status) return false;
      return true;
    });
  }

  uniqueKinds(projects: PortfolioAnalyticsProject[]): ProjectKind[] {
    const set = new Set(
      projects.map((p) =>
        p.kind === ProjectKind.Professional ? ProjectKind.Professional : ProjectKind.Personal,
      ),
    );
    return [...set].sort((a, b) => a.localeCompare(b));
  }

  buildKpis(
    filtered: PortfolioAnalyticsProject[],
    yearsExperience: number,
  ): AnalyticsKpis {
    const technologies = new Set(filtered.flatMap((p) => p.technologies));
    const categories = new Set(filtered.map((p) => p.category));
    return {
      totalProjects: filtered.length,
      yearsExperience,
      technologiesUsed: technologies.size,
      projectCategories: categories.size,
    };
  }

  uniqueCategories(projects: PortfolioAnalyticsProject[]): string[] {
    return [...new Set(projects.map((p) => p.category))].sort((a, b) => a.localeCompare(b));
  }

  uniqueTechnologies(projects: PortfolioAnalyticsProject[]): string[] {
    return [...new Set(projects.flatMap((p) => p.technologies))].sort((a, b) =>
      a.localeCompare(b),
    );
  }

  uniqueStatuses(projects: PortfolioAnalyticsProject[]): NonNullable<PortfolioAnalyticsProject['status']>[] {
    const set = new Set(
      projects.map((p) => p.status).filter((s): s is NonNullable<typeof s> => !!s),
    );
    return [...set].sort();
  }

  technologyUsage(projects: PortfolioAnalyticsProject[]): { name: string; y: number }[] {
    const counts = new Map<string, number>();
    for (const project of projects) {
      for (const tech of project.technologies) {
        counts.set(tech, (counts.get(tech) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([name, y]) => ({ name, y }))
      .sort((a, b) => b.y - a.y || a.name.localeCompare(b.name));
  }

  categoryDistribution(projects: PortfolioAnalyticsProject[]): { name: string; y: number }[] {
    const counts = new Map<string, number>();
    for (const project of projects) {
      counts.set(project.category, (counts.get(project.category) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, y]) => ({ name, y }))
      .sort((a, b) => b.y - a.y || a.name.localeCompare(b.name));
  }

  technologyMatrix(projects: PortfolioAnalyticsProject[]): {
    projects: string[];
    technologies: string[];
    cells: [number, number, number][];
  } {
    const projectNames = projects.map((p) => p.name);
    const technologies = this.uniqueTechnologies(projects);
    const cells: [number, number, number][] = [];
    projects.forEach((project, y) => {
      technologies.forEach((tech, x) => {
        cells.push([x, y, project.technologies.includes(tech) ? 1 : 0]);
      });
    });
    return { projects: projectNames, technologies, cells };
  }

  projectsWithDates(projects: PortfolioAnalyticsProject[]): PortfolioAnalyticsProject[] {
    return projects.filter((p) => !!p.startDate);
  }
}
