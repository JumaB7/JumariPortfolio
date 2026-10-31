import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CategoryAggregate,
  DateRangeId,
  ExpenseCategory,
  FinancialDemoDataset,
  FinancialFilters,
  FinancialKpiCard,
  FinancialMonthDeptRow,
  MonthlyAggregate,
} from '../models/financial-analytics.model';

const DATE_RANGE_MONTHS: Record<DateRangeId, number[]> = {
  '2026-full': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  '2026-h1': [0, 1, 2, 3, 4, 5],
  '2026-h2': [6, 7, 8, 9, 10, 11],
  '2026-q1': [0, 1, 2],
  '2026-q2': [3, 4, 5],
  '2026-q3': [6, 7, 8],
  '2026-q4': [9, 10, 11],
};

export const DATE_RANGE_OPTIONS: { id: DateRangeId; label: string }[] = [
  { id: '2026-full', label: 'Jan 2026 – Dec 2026' },
  { id: '2026-h1', label: 'H1 2026 (Jan – Jun)' },
  { id: '2026-h2', label: 'H2 2026 (Jul – Dec)' },
  { id: '2026-q1', label: 'Q1 2026' },
  { id: '2026-q2', label: 'Q2 2026' },
  { id: '2026-q3', label: 'Q3 2026' },
  { id: '2026-q4', label: 'Q4 2026' },
];

@Injectable({ providedIn: 'root' })
export class FinancialAnalyticsService {
  private readonly http = inject(HttpClient);

  private readonly currency = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  });

  private readonly percent = new Intl.NumberFormat('en-ZA', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  getDataset(): Observable<FinancialDemoDataset> {
    return this.http.get<FinancialDemoDataset>(`${environment.apiBaseUrl}/financial/analytics`);
  }

  defaultFilters(): FinancialFilters {
    return {
      dateRange: '2026-full',
      department: 'all',
      category: 'all',
    };
  }

  formatRand(value: number): string {
    return this.currency.format(value);
  }

  formatCompactRand(value: number): string {
    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    if (abs >= 1_000_000) {
      return `${sign}R${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 2).replace(/\.00$/, '')}M`;
    }
    if (abs >= 1_000) {
      return `${sign}R${Math.round(abs / 1_000)}K`;
    }
    return `${sign}R${Math.round(abs)}`;
  }

  filterRows(dataset: FinancialDemoDataset, filters: FinancialFilters): FinancialMonthDeptRow[] {
    const months = new Set(DATE_RANGE_MONTHS[filters.dateRange]);
    return dataset.rows.filter((row) => {
      if (!months.has(row.monthIndex)) return false;
      if (filters.department !== 'all' && row.department !== filters.department) return false;
      return true;
    });
  }

  monthlyAggregates(rows: FinancialMonthDeptRow[], category: ExpenseCategory | 'all'): MonthlyAggregate[] {
    const byMonth = new Map<number, MonthlyAggregate>();

    for (const row of rows) {
      let entry = byMonth.get(row.monthIndex);
      if (!entry) {
        entry = {
          monthIndex: row.monthIndex,
          monthKey: row.monthKey,
          monthLabel: row.monthLabel,
          revenue: 0,
          expenses: 0,
          cashIn: 0,
          cashOut: 0,
          netCashFlow: 0,
          profit: 0,
        };
        byMonth.set(row.monthIndex, entry);
      }

      entry.revenue += Number(row.revenue);
      entry.cashIn += Number(row.cashIn);
      entry.cashOut += Number(row.cashOut);

      for (const expense of row.expenses) {
        if (category !== 'all' && expense.category !== category) continue;
        entry.expenses += Number(expense.actual);
      }
    }

    return [...byMonth.values()]
      .sort((a, b) => a.monthIndex - b.monthIndex)
      .map((m) => ({
        ...m,
        netCashFlow: m.cashIn - m.cashOut,
        profit: m.revenue - m.expenses,
      }));
  }

  categoryAggregates(rows: FinancialMonthDeptRow[], category: ExpenseCategory | 'all'): CategoryAggregate[] {
    const totals = new Map<ExpenseCategory, { actual: number; budget: number }>();

    for (const row of rows) {
      for (const expense of row.expenses) {
        if (category !== 'all' && expense.category !== category) continue;
        const current = totals.get(expense.category) ?? { actual: 0, budget: 0 };
        current.actual += Number(expense.actual);
        current.budget += Number(expense.budget);
        totals.set(expense.category, current);
      }
    }

    const list = [...totals.entries()].map(([cat, values]) => ({
      category: cat,
      actual: values.actual,
      budget: values.budget,
      share: 0,
    }));
    const sum = list.reduce((acc, item) => acc + item.actual, 0) || 1;
    return list
      .map((item) => ({ ...item, share: item.actual / sum }))
      .sort((a, b) => b.actual - a.actual);
  }

  buildKpis(rows: FinancialMonthDeptRow[], category: ExpenseCategory | 'all'): FinancialKpiCard[] {
    const monthly = this.monthlyAggregates(rows, category);
    const revenue = monthly.reduce((s, m) => s + m.revenue, 0);
    const expenses = monthly.reduce((s, m) => s + m.expenses, 0);
    const profit = revenue - expenses;
    const margin = revenue ? profit / revenue : 0;
    const cashFlow = monthly.reduce((s, m) => s + m.netCashFlow, 0);

    const prior = this.priorTotals(rows, category);
    const priorProfit = prior.revenue - prior.expenses;
    const priorMargin = prior.revenue ? priorProfit / prior.revenue : 0;
    const priorCash = prior.cashIn - prior.cashOut;

    return [
      {
        id: 'revenue',
        label: 'Total Revenue',
        valueLabel: this.formatRand(revenue),
        deltaLabel: this.deltaPercentLabel(revenue, prior.revenue),
        deltaPositive: revenue >= prior.revenue,
        sparkline: monthly.map((m) => m.revenue),
        accent: 'cyan',
      },
      {
        id: 'profit',
        label: 'Net Profit',
        valueLabel: this.formatRand(profit),
        deltaLabel: this.deltaPercentLabel(profit, priorProfit),
        deltaPositive: profit >= priorProfit,
        sparkline: monthly.map((m) => m.profit),
        accent: 'blue',
      },
      {
        id: 'margin',
        label: 'Profit Margin',
        valueLabel: this.percent.format(margin),
        deltaLabel: this.deltaPointsLabel(margin, priorMargin),
        deltaPositive: margin >= priorMargin,
        sparkline: monthly.map((m) => (m.revenue ? m.profit / m.revenue : 0)),
        accent: 'purple',
      },
      {
        id: 'cashflow',
        label: 'Cash Flow',
        valueLabel: this.formatRand(cashFlow),
        deltaLabel: this.deltaPercentLabel(cashFlow, priorCash),
        deltaPositive: cashFlow >= priorCash,
        sparkline: monthly.map((m) => m.netCashFlow),
        accent: 'teal',
      },
    ];
  }

  private priorTotals(rows: FinancialMonthDeptRow[], category: ExpenseCategory | 'all') {
    let revenue = 0;
    let expenses = 0;
    let cashIn = 0;
    let cashOut = 0;

    for (const row of rows) {
      revenue += Number(row.priorRevenue);
      cashIn += Number(row.priorCashIn);
      cashOut += Number(row.priorCashOut);
      for (const expense of row.expenses) {
        if (category !== 'all' && expense.category !== category) continue;
        expenses += Number(expense.priorActual);
      }
    }

    return { revenue, expenses, cashIn, cashOut };
  }

  private deltaPercentLabel(current: number, prior: number): string {
    if (!prior) {
      return 'vs. previous period';
    }
    const delta = ((current - prior) / Math.abs(prior)) * 100;
    const sign = delta >= 0 ? '+' : '';
    return `${sign}${delta.toFixed(1)}% vs. previous period`;
  }

  private deltaPointsLabel(current: number, prior: number): string {
    const pp = (current - prior) * 100;
    const sign = pp >= 0 ? '+' : '';
    return `${sign}${pp.toFixed(1)} pp vs. previous period`;
  }
}
