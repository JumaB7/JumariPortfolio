import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HighchartsChartComponent } from 'highcharts-angular';
import type { Options } from 'highcharts';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import {
  ANALYTICS_LOAD_COPY,
  PROJECT_KIND_LABELS,
  PROJECT_STATUS_LABELS,
} from '../constants/analytics.constants';
import { BreakpointDirective } from '../directives/breakpoint.directive';
import {
  AnalyticsFilters,
  AnalyticsLoadState,
  ProjectKind,
  ProjectStatus,
} from './models/portfolio-analytics.model';
import { AnalyticsChartService } from './services/analytics-chart.service';
import { PortfolioAnalyticsService } from './services/portfolio-analytics.service';

@Component({
  selector: 'app-project-portfolio-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, HighchartsChartComponent, BreakpointDirective],
  templateUrl: './project-portfolio-view.component.html',
})
export class ProjectPortfolioViewComponent {
  private readonly analytics = inject(PortfolioAnalyticsService);
  private readonly charts = inject(AnalyticsChartService);

  readonly filters = signal<AnalyticsFilters>(this.analytics.defaultFilters());
  readonly period = signal<'showcase'>('showcase');
  readonly loadCopy = ANALYTICS_LOAD_COPY;

  private readonly reduceMotion =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly loadAttempt = signal(0);

  readonly loadState = toSignal(
    toObservable(this.loadAttempt).pipe(
      switchMap(() =>
        this.analytics.getAnalytics().pipe(
          map((data): AnalyticsLoadState => ({ status: 'ready', data })),
          catchError(() =>
            of({
              status: 'error',
              message: ANALYTICS_LOAD_COPY.projectsError,
            } satisfies AnalyticsLoadState),
          ),
          startWith({ status: 'loading' } satisfies AnalyticsLoadState),
        ),
      ),
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

  readonly kindOptions = computed(() =>
    this.analytics.uniqueKinds(this.allProjects()).map((id) => ({
      id,
      label: PROJECT_KIND_LABELS[id],
    })),
  );
  readonly categoryOptions = computed(() => this.analytics.uniqueCategories(this.allProjects()));
  readonly technologyOptions = computed(() =>
    this.analytics.uniqueTechnologies(this.allProjects()),
  );
  readonly statusOptions = computed(() =>
    this.analytics.uniqueStatuses(this.allProjects()).map((id) => ({
      id,
      label: PROJECT_STATUS_LABELS[id],
    })),
  );
  readonly hasActiveFilters = computed(() => {
    const f = this.filters();
    return (
      f.kind !== 'all' || f.category !== 'all' || f.technology !== 'all' || f.status !== 'all'
    );
  });

  readonly lastUpdated = computed(() => this.dataset()?.generatedAt ?? null);
  readonly sourceLabel = computed(
    () => this.dataset()?.sourceLabel ?? 'Synthetic showcase data',
  );

  readonly techChart = computed<Options>(() =>
    this.charts.technologyDistribution(this.filteredProjects(), this.reduceMotion),
  );

  readonly categoryChart = computed<Options>(() =>
    this.charts.categoryDonut(this.filteredProjects(), this.reduceMotion),
  );

  readonly matrixChart = computed<Options>(() =>
    this.charts.technologyMatrix(this.filteredProjects(), this.reduceMotion),
  );

  readonly timelineChart = computed<Options>(() =>
    this.charts.projectTimeline(this.filteredProjects(), this.reduceMotion),
  );

  readonly timelineRows = computed(() => this.charts.projectTimelineRows(this.filteredProjects()));

  setKind(value: string): void {
    this.filters.update((f) => ({ ...f, kind: value as ProjectKind | 'all' }));
  }

  setCategory(value: string): void {
    this.filters.update((f) => ({ ...f, category: value as AnalyticsFilters['category'] }));
  }

  setTechnology(value: string): void {
    this.filters.update((f) => ({ ...f, technology: value as AnalyticsFilters['technology'] }));
  }

  setStatus(value: string): void {
    this.filters.update((f) => ({
      ...f,
      status: value as ProjectStatus | 'all',
    }));
  }

  resetFilters(): void {
    this.filters.set(this.analytics.defaultFilters());
  }

  retryLoad(): void {
    if (this.loadState().status === 'loading') return;
    this.loadAttempt.update((count) => count + 1);
  }
}
