import { Injectable, inject } from '@angular/core';
import type { Options } from 'highcharts';
import {
  analyticsChartBase,
  emptyChartOptions,
} from '../../services/analytics-chart-theme';
import {
  CategoryAggregate,
  FinancialKpiCard,
  MonthlyAggregate,
} from '../models/financial-analytics.model';
import { FinancialAnalyticsService } from './financial-analytics.service';

const CYAN = '#22D3EE';
const BLUE = '#3B82F6';
const TEAL = '#14B8A6';
const PURPLE = '#A78BFA';

const ACCENT: Record<FinancialKpiCard['accent'], string> = {
  cyan: CYAN,
  blue: BLUE,
  purple: PURPLE,
  teal: TEAL,
};

@Injectable({ providedIn: 'root' })
export class FinancialChartService {
  private readonly finance = inject(FinancialAnalyticsService);

  sparkline(card: FinancialKpiCard, reduceMotion: boolean): Options {
    const color = ACCENT[card.accent];
    return {
      chart: {
        backgroundColor: 'transparent',
        height: 44,
        margin: [4, 0, 4, 0],
        animation: reduceMotion ? false : { duration: 350 },
      },
      title: { text: undefined },
      credits: { enabled: false },
      legend: { enabled: false },
      exporting: { enabled: false },
      accessibility: { enabled: false },
      xAxis: { visible: false },
      yAxis: { visible: false, minPadding: 0.1, maxPadding: 0.1 },
      tooltip: { enabled: false },
      plotOptions: {
        series: {
          enableMouseTracking: false,
          animation: reduceMotion ? false : { duration: 350 },
          marker: { enabled: false },
        },
      },
      series: [
        {
          type: 'areaspline',
          data: card.sparkline,
          color,
          fillColor: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
              [0, `${color}55`],
              [1, `${color}00`],
            ],
          },
          lineWidth: 2,
        },
      ],
    };
  }

  revenueVsExpenses(months: MonthlyAggregate[], reduceMotion: boolean): Options {
    if (!months.length) {
      return emptyChartOptions('Revenue vs. Expenses', 'No data for the current filters.', reduceMotion);
    }

    const base = analyticsChartBase(reduceMotion);
    const formatRand = (v: number) => this.finance.formatRand(v);
    const formatCompact = (v: number) => this.finance.formatCompactRand(v);

    return {
      ...base,
      chart: { ...base.chart, type: 'column' },
      title: { ...base.title, text: 'Revenue vs. Expenses' },
      subtitle: { ...base.subtitle, text: 'Monthly totals (demo data, ZAR)' },
      xAxis: {
        categories: months.map((m) => m.monthLabel),
        labels: { style: { color: '#A3AEC0', fontSize: '11px' } },
        lineColor: 'rgba(192,199,209,0.16)',
        tickColor: 'rgba(192,199,209,0.16)',
      },
      yAxis: {
        title: { text: undefined },
        labels: {
          style: { color: '#A3AEC0', fontSize: '11px' },
          formatter() {
            return formatCompact(Number(this.value));
          },
        },
        gridLineColor: 'rgba(192,199,209,0.1)',
      },
      plotOptions: {
        ...base.plotOptions,
        column: { grouping: true, groupPadding: 0.12, pointPadding: 0.05 },
      },
      tooltip: {
        ...base.tooltip,
        shared: true,
        headerFormat: '<span style="font-size:12px">{point.key}</span><br/>',
        pointFormatter() {
          return `<span style="color:${this.color}">\u25CF</span> ${this.series.name}: <b>${formatRand(Number(this.y))}</b><br/>`;
        },
      },
      series: [
        {
          type: 'column',
          name: 'Revenue',
          data: months.map((m) => m.revenue),
          color: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
              [0, CYAN],
              [1, '#0891B2'],
            ],
          },
          borderRadius: 4,
        },
        {
          type: 'column',
          name: 'Expenses',
          data: months.map((m) => m.expenses),
          color: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
              [0, BLUE],
              [1, '#1D4ED8'],
            ],
          },
          borderRadius: 4,
        },
      ],
    };
  }

  cashFlowTrend(months: MonthlyAggregate[], reduceMotion: boolean): Options {
    if (!months.length) {
      return emptyChartOptions('Cash Flow Trend', 'No data for the current filters.', reduceMotion);
    }

    const base = analyticsChartBase(reduceMotion);
    const formatRand = (v: number) => this.finance.formatRand(v);
    const formatCompact = (v: number) => this.finance.formatCompactRand(v);

    return {
      ...base,
      chart: { ...base.chart, type: 'areaspline' },
      title: { ...base.title, text: 'Cash Flow Trend' },
      subtitle: { ...base.subtitle, text: 'Cash in, cash out, and net (demo data)' },
      xAxis: {
        categories: months.map((m) => m.monthLabel),
        labels: { style: { color: '#A3AEC0', fontSize: '11px' } },
        lineColor: 'rgba(192,199,209,0.16)',
        tickColor: 'rgba(192,199,209,0.16)',
      },
      yAxis: {
        title: { text: undefined },
        labels: {
          style: { color: '#A3AEC0', fontSize: '11px' },
          formatter() {
            return formatCompact(Number(this.value));
          },
        },
        gridLineColor: 'rgba(192,199,209,0.1)',
        plotLines: [
          {
            value: 0,
            color: 'rgba(192,199,209,0.35)',
            width: 1,
            zIndex: 4,
          },
        ],
      },
      tooltip: {
        ...base.tooltip,
        shared: true,
        headerFormat: '<span style="font-size:12px">{point.key}</span><br/>',
        pointFormatter() {
          return `<span style="color:${this.color}">\u25CF</span> ${this.series.name}: <b>${formatRand(Number(this.y))}</b><br/>`;
        },
      },
      series: [
        {
          type: 'areaspline',
          name: 'Cash In',
          data: months.map((m) => m.cashIn),
          color: CYAN,
          fillOpacity: 0.12,
          marker: { enabled: false },
        },
        {
          type: 'areaspline',
          name: 'Cash Out',
          data: months.map((m) => m.cashOut),
          color: BLUE,
          fillOpacity: 0.1,
          marker: { enabled: false },
        },
        {
          type: 'spline',
          name: 'Net Cash Flow',
          data: months.map((m) => m.netCashFlow),
          color: TEAL,
          lineWidth: 2.5,
          marker: {
            enabled: true,
            radius: 3.5,
            fillColor: TEAL,
            lineColor: '#0B1220',
            lineWidth: 1,
          },
        },
      ],
    };
  }

  expenseBreakdown(categories: CategoryAggregate[], reduceMotion: boolean): Options {
    if (!categories.length) {
      return emptyChartOptions('Expense Breakdown', 'No data for the current filters.', reduceMotion);
    }

    const base = analyticsChartBase(reduceMotion);
    const formatRand = (v: number) => this.finance.formatRand(v);
    const total = categories.reduce((s, c) => s + c.actual, 0);
    const palette = [CYAN, BLUE, '#60A5FA', PURPLE, '#1E3A8A'];

    return {
      ...base,
      chart: { ...base.chart, type: 'pie' },
      title: { ...base.title, text: 'Expense Breakdown' },
      subtitle: {
        ...base.subtitle,
        text: `Total expenses ${formatRand(total)} · share by category (demo data)`,
      },
      tooltip: {
        ...base.tooltip,
        pointFormatter() {
          const pct = this.percentage?.toFixed(1) ?? '0';
          return `<span style="color:${this.color}">\u25CF</span> ${this.name}: <b>${formatRand(Number(this.y))}</b> (${pct}%)<br/>`;
        },
      },
      legend: {
        ...base.legend,
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical',
        itemMarginBottom: 8,
      },
      plotOptions: {
        pie: {
          innerSize: '62%',
          borderWidth: 0,
          dataLabels: { enabled: false },
          showInLegend: true,
        },
      },
      series: [
        {
          type: 'pie',
          name: 'Expenses',
          data: categories.map((c, i) => ({
            name: c.category,
            y: c.actual,
            color: palette[i % palette.length],
          })),
        },
      ],
      responsive: {
        rules: [
          {
            condition: { maxWidth: 520 },
            chartOptions: {
              legend: {
                align: 'center',
                verticalAlign: 'bottom',
                layout: 'horizontal',
              },
            },
          },
        ],
      },
    };
  }

  budgetVsActual(categories: CategoryAggregate[], reduceMotion: boolean): Options {
    if (!categories.length) {
      return emptyChartOptions('Budget vs. Actual', 'No data for the current filters.', reduceMotion);
    }

    const base = analyticsChartBase(reduceMotion);
    const formatRand = (v: number) => this.finance.formatRand(v);
    const formatCompact = (v: number) => this.finance.formatCompactRand(v);
    const ordered = [...categories].reverse();

    return {
      ...base,
      chart: { ...base.chart, type: 'bar' },
      title: { ...base.title, text: 'Budget vs. Actual' },
      subtitle: { ...base.subtitle, text: 'Spend against plan by category (demo data)' },
      xAxis: {
        categories: ordered.map((c) => c.category),
        labels: { style: { color: '#A3AEC0', fontSize: '11px' } },
        lineColor: 'rgba(192,199,209,0.16)',
        tickColor: 'rgba(192,199,209,0.16)',
      },
      yAxis: {
        title: { text: undefined },
        labels: {
          style: { color: '#A3AEC0', fontSize: '11px' },
          formatter() {
            return formatCompact(Number(this.value));
          },
        },
        gridLineColor: 'rgba(192,199,209,0.1)',
      },
      tooltip: {
        ...base.tooltip,
        shared: true,
        headerFormat: '<span style="font-size:12px">{point.key}</span><br/>',
        pointFormatter() {
          return `<span style="color:${this.color}">\u25CF</span> ${this.series.name}: <b>${formatRand(Number(this.y))}</b><br/>`;
        },
      },
      plotOptions: {
        ...base.plotOptions,
        bar: { grouping: true, groupPadding: 0.15, pointPadding: 0.06, borderRadius: 3 },
      },
      series: [
        {
          type: 'bar',
          name: 'Budget',
          data: ordered.map((c) => c.budget),
          color: BLUE,
        },
        {
          type: 'bar',
          name: 'Actual',
          data: ordered.map((c) => c.actual),
          color: CYAN,
        },
      ],
    };
  }
}
