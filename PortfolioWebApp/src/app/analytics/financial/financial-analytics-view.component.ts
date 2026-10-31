import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HighchartsChartComponent } from 'highcharts-angular';
import type { Options } from 'highcharts';
import { catchError, map, of, startWith } from 'rxjs';
import {
  DateRangeId,
  Department,
  ExpenseCategory,
  FinancialDemoDataset,
  FinancialFilters,
} from './models/financial-analytics.model';
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

  readonly filters = signal<FinancialFilters>(this.finance.defaultFilters());

  private readonly reduceMotion =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  private readonly dataset = toSignal(
    this.finance.getDataset().pipe(
      map((data): FinancialDemoDataset | null => data),
      catchError(() => of(null)),
      startWith(null),
    ),
    { initialValue: null },
  );

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

  accentClass(accent: string): string {
    if (accent === 'blue') return 'financial-kpi--blue';
    if (accent === 'purple') return 'financial-kpi--purple';
    if (accent === 'teal') return 'financial-kpi--teal';
    return 'financial-kpi--cyan';
  }
}
