import { NgClass } from '@angular/common';
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
  DateRangeId,
  Department,
  ExpenseCategory,
  FinancialDemoDataset,
  FinancialFilters,
} from './models/financial-analytics.model';
import { ANALYTICS_LOAD_COPY, FINANCIAL_KPI_ACCENT_CLASS } from '../../constants/analytics.constants';
import {
  DATE_RANGE_OPTIONS,
  FinancialAnalyticsService,
} from './services/financial-analytics.service';
import { FinancialChartService } from './services/financial-chart.service';

@Component({
  selector: 'app-financial-analytics-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, HighchartsChartComponent],
  templateUrl: './financial-analytics-view.component.html',
})
export class FinancialAnalyticsViewComponent {
  private readonly finance = inject(FinancialAnalyticsService);
  private readonly charts = inject(FinancialChartService);

  readonly dateRangeOptions = DATE_RANGE_OPTIONS;
  readonly accentClassByAccent = FINANCIAL_KPI_ACCENT_CLASS;
  readonly loadCopy = ANALYTICS_LOAD_COPY;

  readonly filters = signal<FinancialFilters>(this.finance.defaultFilters());

  private readonly reduceMotion =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly loadAttempt = signal(0);

  private readonly loadState = toSignal(
    toObservable(this.loadAttempt).pipe(
      switchMap(() =>
        this.finance.getDataset().pipe(
          map(
            (data): { status: 'ready'; data: FinancialDemoDataset } | { status: 'error'; message: string } => ({
              status: 'ready',
              data,
            }),
          ),
          catchError(() =>
            of({
              status: 'error' as const,
              message: ANALYTICS_LOAD_COPY.financialError,
            }),
          ),
          startWith({ status: 'loading' as const }),
        ),
      ),
    ),
    { initialValue: { status: 'loading' as const } },
  );

  readonly loadStatus = computed(() => this.loadState().status);
  readonly loadError = computed(() => {
    const state = this.loadState();
    return state.status === 'error' ? state.message : null;
  });

  private readonly dataset = computed(() => {
    const state = this.loadState();
    return state.status === 'ready' ? state.data : null;
  });

  readonly departments = computed(() => this.dataset()?.departments ?? []);
  readonly categories = computed(() => this.dataset()?.categories ?? []);
  readonly sourceLabel = computed(
    () => this.dataset()?.label ?? 'Demo data — illustrative figures only',
  );

  readonly filteredRows = computed(() => {
    const data = this.dataset();
    if (!data) return [];
    return this.finance.filterRows(data, this.filters());
  });

  readonly monthly = computed(() =>
    this.finance.monthlyAggregates(this.filteredRows(), this.filters().category),
  );

  readonly categoryBreakdown = computed(() =>
    this.finance.categoryAggregates(this.filteredRows(), this.filters().category),
  );

  readonly kpis = computed(() =>
    this.finance.buildKpis(this.filteredRows(), this.filters().category),
  );

  readonly hasActiveFilters = computed(() => {
    const f = this.filters();
    return f.dateRange !== '2026-full' || f.department !== 'all' || f.category !== 'all';
  });

  readonly sparklineOptions = computed(() => {
    const map = new Map<string, Options>();
    for (const card of this.kpis()) {
      map.set(card.id, this.charts.sparkline(card, this.reduceMotion));
    }
    return map;
  });

  readonly revenueExpenseChart = computed(() =>
    this.charts.revenueVsExpenses(this.monthly(), this.reduceMotion),
  );

  readonly cashFlowChart = computed(() =>
    this.charts.cashFlowTrend(this.monthly(), this.reduceMotion),
  );

  readonly expenseDonutChart = computed(() =>
    this.charts.expenseBreakdown(this.categoryBreakdown(), this.reduceMotion),
  );

  readonly budgetChart = computed(() =>
    this.charts.budgetVsActual(this.categoryBreakdown(), this.reduceMotion),
  );

  setDateRange(value: string): void {
    this.filters.update((f) => ({ ...f, dateRange: value as DateRangeId }));
  }

  setDepartment(value: string): void {
    this.filters.update((f) => ({
      ...f,
      department: value as Department | 'all',
    }));
  }

  setCategory(value: string): void {
    this.filters.update((f) => ({
      ...f,
      category: value as ExpenseCategory | 'all',
    }));
  }

  resetFilters(): void {
    this.filters.set(this.finance.defaultFilters());
  }

  retryLoad(): void {
    if (this.loadStatus() === 'loading') return;
    this.loadAttempt.update((count) => count + 1);
  }
}
