import { DatePipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HighchartsChartComponent } from 'highcharts-angular';
import type { Options } from 'highcharts';
import { catchError, map, of, startWith } from 'rxjs';
import {
  AnalyticsFilters,
  AnalyticsLoadState,
  AnalyticsSelection,
  ProjectStatus,
} from './models/portfolio-analytics.model';
import { AnalyticsChartService } from './services/analytics-chart.service';
import { PortfolioAnalyticsService } from './services/portfolio-analytics.service';

@Component({
  selector: 'app-project-portfolio-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, DatePipe, HighchartsChartComponent],
  templateUrl: './project-portfolio-view.component.html',
})
export class ProjectPortfolioViewComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly analytics = inject(PortfolioAnalyticsService);
  private readonly charts = inject(AnalyticsChartService);

  readonly filters = signal<AnalyticsFilters>(this.analytics.defaultFilters());
  readonly selection = signal<AnalyticsSelection>(null);
  readonly period = signal<'showcase'>('showcase');

  private readonly reduceMotion =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  readonly loadState = toSignal(
    this.analytics.getAnalytics().pipe(
      map((data): AnalyticsLoadState => ({ status: 'ready', data })),
      catchError(() =>
        of({
          status: 'error',
          message: 'Could not load portfolio analytics. Please try again.',
        } satisfies AnalyticsLoadState),
      ),
      startWith({ status: 'loading' } satisfies AnalyticsLoadState),
    ),
    { initialValue: { status: 'loading' } satisfies AnalyticsLoadState },
  );

  readonly dataset = computed(() => {
    const state = this.loadState();
    return state.status === 'ready' ? state.data : null;
  });

  readonly allProjects = computed(() => this.dataset()?.projects ?? []);

  readonly filteredProjects = computed(() =>
    this.analytics.filterProjects(this.allProjects(), this.filters()),
  );

  readonly kpis = computed(() => {
    const data = this.dataset();
    if (!data) {
      return {
        totalProjects: 0,
        yearsExperience: 0,
        technologiesUsed: 0,
        projectCategories: 0,
      };
    }
    return this.analytics.buildKpis(this.filteredProjects(), data.yearsExperience);
  });

  readonly categoryOptions = computed(() => this.analytics.uniqueCategories(this.allProjects()));
  readonly technologyOptions = computed(() =>
    this.analytics.uniqueTechnologies(this.allProjects()),
  );
  readonly statusOptions = computed(() => this.analytics.uniqueStatuses(this.allProjects()));

  readonly hasActiveFilters = computed(() => {
    const f = this.filters();
    return f.category !== 'all' || f.technology !== 'all' || f.status !== 'all';
  });

  readonly lastUpdated = computed(() => this.dataset()?.generatedAt ?? null);
  readonly sourceLabel = computed(
    () => this.dataset()?.sourceLabel ?? 'Synthetic showcase data',
  );

  readonly techChart = computed<Options>(() =>
    this.charts.technologyDistribution(this.filteredProjects(), this.reduceMotion, (s) =>
      this.selection.set(s),
    ),
  );

  readonly categoryChart = computed<Options>(() =>
    this.charts.categoryDonut(this.filteredProjects(), this.reduceMotion, (s) =>
      this.selection.set(s),
    ),
  );

  readonly matrixChart = computed<Options>(() =>
    this.charts.technologyMatrix(this.filteredProjects(), this.reduceMotion, (s) =>
      this.selection.set(s),
    ),
  );

  readonly timelineChart = computed<Options>(() =>
    this.charts.projectTimeline(this.filteredProjects(), this.reduceMotion),
  );

  readonly selectionProjects = computed(() => {
    const sel = this.selection();
    const projects = this.filteredProjects();
    if (!sel) return [];
    if (sel.kind === 'technology') {
      return projects.filter((p) => p.technologies.includes(sel.value));
    }
    if (sel.kind === 'category') {
      return projects.filter((p) => p.category === sel.value);
    }
    if (sel.kind === 'project') {
      return projects.filter((p) => p.name === sel.value);
    }
    if (sel.kind === 'matrix') {
      return projects.filter((p) => p.name === sel.project);
    }
    return [];
  });

  readonly selectionTitle = computed(() => {
    const sel = this.selection();
    if (!sel) return '';
    if (sel.kind === 'technology') return `Projects using ${sel.value}`;
    if (sel.kind === 'category') return `Projects in ${sel.value}`;
    if (sel.kind === 'project') return sel.value;
    if (sel.kind === 'matrix') {
      return sel.used
        ? `${sel.project} uses ${sel.technology}`
        : `${sel.project} does not use ${sel.technology}`;
    }
    return '';
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.selection.set(null));
  }

  setCategory(value: string): void {
    this.filters.update((f) => ({ ...f, category: value as AnalyticsFilters['category'] }));
    this.selection.set(null);
  }

  setTechnology(value: string): void {
    this.filters.update((f) => ({ ...f, technology: value as AnalyticsFilters['technology'] }));
    this.selection.set(null);
  }

  setStatus(value: string): void {
    this.filters.update((f) => ({
      ...f,
      status: value as ProjectStatus | 'all',
    }));
    this.selection.set(null);
  }

  resetFilters(): void {
    this.filters.set(this.analytics.defaultFilters());
    this.selection.set(null);
  }

  clearSelection(): void {
    this.selection.set(null);
  }

  statusLabel(status?: ProjectStatus | 'all'): string {
    if (status === 'completed') return 'Completed';
    if (status === 'in-progress') return 'In progress';
    if (status === 'all') return 'All statuses';
    return 'Unknown';
  }
}
