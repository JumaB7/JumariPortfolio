import { Injectable, inject } from '@angular/core';
import type { Chart, Options, Point, SeriesOptionsType } from 'highcharts';
import {
  PortfolioAnalyticsProject,
  ProjectStatus,
  ProjectTimelineRow,
} from '../models/portfolio-analytics.model';
import { PortfolioAnalyticsService } from './portfolio-analytics.service';
import {
  analyticsChartBase,
  emptyChartOptions,
  syncDonutCenterLabel,
} from './analytics-chart-theme';

@Injectable({ providedIn: 'root' })
export class AnalyticsChartService {
  private readonly analytics = inject(PortfolioAnalyticsService);

  technologyDistribution(
    projects: PortfolioAnalyticsProject[],
    reduceMotion: boolean,
  ): Options {
    const usage = this.analytics.technologyUsage(projects);
    if (!usage.length) {
      return emptyChartOptions(
        'Technology distribution',
        'No technologies match the current filters.',
        reduceMotion,
      );
    }

    const base = analyticsChartBase(reduceMotion);
    const series: SeriesOptionsType[] = [
      {
        type: 'column',
        name: 'Projects',
        data: usage.map((u) => ({
          name: u.name,
          y: u.y,
          color: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
              [0, '#00D9FF'],
              [1, '#3B82F6'],
            ],
          },
        })),
        borderRadius: 5,
      },
    ];

    return {
      ...base,
      chart: {
        ...base.chart,
        type: 'column',
        height: 380,
        spacingBottom: 28,
      },
      title: { ...base.title, text: 'Technology distribution' },
      subtitle: {
        ...base.subtitle,
        text: 'How many showcase projects use each technology',
      },
      xAxis: {
        categories: usage.map((u) => u.name),
        labels: {
          style: { color: '#A3AEC0', fontSize: '11px' },
          autoRotation: [-35],
          overflow: 'allow',
        },
        lineColor: 'rgba(192,199,209,0.16)',
        tickColor: 'rgba(192,199,209,0.16)',
      },
      yAxis: {
        min: 0,
        allowDecimals: false,
        title: { text: 'Projects', style: { color: '#A3AEC0' } },
        labels: { style: { color: '#A3AEC0', fontSize: '11px' } },
        gridLineColor: 'rgba(192,199,209,0.1)',
      },
      legend: { enabled: false },
      tooltip: {
        ...base.tooltip,
        pointFormat: '<b>{point.y}</b> project(s) use {point.category}',
      },
      series,
      responsive: {
        rules: [
          {
            condition: { maxWidth: 560 },
            chartOptions: {
              chart: { type: 'bar', height: Math.max(380, 80 + usage.length * 36) },
              xAxis: { labels: { autoRotation: undefined } },
            },
          },
        ],
      },
    };
  }

  categoryDonut(
    projects: PortfolioAnalyticsProject[],
    reduceMotion: boolean,
  ): Options {
    const distribution = this.analytics.categoryDistribution(projects);
    if (!distribution.length) {
      return emptyChartOptions(
        'Project type distribution',
        'No categories match the current filters.',
        reduceMotion,
      );
    }

    const total = distribution.reduce((sum, d) => sum + d.y, 0);
    const base = analyticsChartBase(reduceMotion, 400);
    const series: SeriesOptionsType[] = [
      {
        type: 'pie',
        name: 'Projects',
        data: distribution.map((d) => ({ name: d.name, y: d.y })),
      },
    ];

    return {
      ...base,
      chart: {
        ...base.chart,
        type: 'pie',
        spacing: [48, 36, 36, 36],
        events: {
          render() {
            syncDonutCenterLabel(this as Chart, total);
          },
        },
      },
      title: { ...base.title, text: 'Project type distribution' },
      subtitle: {
        ...base.subtitle,
        text: 'Share of showcase projects by category',
      },
      legend: { enabled: false },
      tooltip: {
        ...base.tooltip,
        pointFormat: '<b>{point.y}</b> ({point.percentage:.0f}%)',
      },
      plotOptions: {
        ...base.plotOptions,
        pie: {
          innerSize: '62%',
          borderWidth: 0,
          allowPointSelect: false,
          size: '68%',
          center: ['50%', '50%'],
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.percentage:.0f}%',
            style: {
              color: '#A3AEC0',
              fontSize: '11px',
              fontWeight: '500',
              textOutline: 'none',
            },
            distance: 18,
            crop: false,
            overflow: 'allow',
            connectorColor: 'rgba(163,174,192,0.55)',
            connectorWidth: 1,
          },
        },
      },
      series,
    };
  }

  technologyMatrix(
    projects: PortfolioAnalyticsProject[],
    reduceMotion: boolean,
  ): Options {
    const matrix = this.analytics.technologyMatrix(projects);
    if (!matrix.projects.length || !matrix.technologies.length) {
      return emptyChartOptions(
        'Project technology matrix',
        'No matrix data for the current filters.',
        reduceMotion,
      );
    }

    const base = analyticsChartBase(reduceMotion);
    const series: SeriesOptionsType[] = [
      {
        type: 'heatmap',
        name: 'Used',
        borderWidth: 1,
        borderColor: 'rgba(5,7,13,0.85)',
        data: matrix.cells,
        dataLabels: { enabled: false },
        colsize: 1,
        rowsize: 1,
      },
    ];

    const rowHeight = 52;
    const chartHeight = Math.max(340, 110 + matrix.projects.length * rowHeight);

    return {
      ...base,
      chart: {
        ...base.chart,
        type: 'heatmap',
        height: chartHeight,
        spacingBottom: 28,
        marginLeft: 160,
      },
      title: { ...base.title, text: 'Project technology matrix' },
      subtitle: {
        ...base.subtitle,
        text: 'Which technologies appear in each showcase project',
      },
      xAxis: {
        categories: matrix.technologies,
        labels: {
          style: { color: '#A3AEC0', fontSize: '10px' },
          autoRotation: [-40],
          overflow: 'allow',
        },
        lineColor: 'rgba(192,199,209,0.14)',
      },
      yAxis: {
        categories: matrix.projects,
        title: { text: undefined },
        reversed: true,
        labels: {
          style: { color: '#A3AEC0', fontSize: '11px' },
          overflow: 'allow',
        },
        gridLineColor: 'rgba(192,199,209,0.08)',
      },
      colorAxis: {
        min: 0,
        max: 1,
        stops: [
          [0, '#0B1220'],
          [1, '#00D9FF'],
        ],
        labels: { enabled: false },
      },
      legend: {
        align: 'right',
        layout: 'vertical',
        verticalAlign: 'middle',
        symbolHeight: 120,
      },
      tooltip: {
        ...base.tooltip,
        formatter() {
          const point = this as unknown as Point;
          const x = point.x ?? 0;
          const y = point.y ?? 0;
          const tech = matrix.technologies[x] ?? '';
          const project = matrix.projects[y] ?? '';
          const used = Number(point.value) === 1;
          return `<b>${project}</b><br/>${tech}: ${used ? 'Used' : 'Not used'}`;
        },
      },
      series,
      responsive: {
        rules: [
          {
            condition: { maxWidth: 700 },
            chartOptions: {
              legend: { enabled: false },
              chart: {
                height: Math.max(340, 110 + matrix.projects.length * 56),
                marginLeft: 120,
              },
            },
          },
        ],
      },
    };
  }

  projectTimelineRows(projects: PortfolioAnalyticsProject[]): ProjectTimelineRow[] {
    const dated = this.datedProjects(projects);
    if (!dated.length) return [];

    const min = Math.min(...dated.map((row) => row.start));
    const max = Math.max(...dated.map((row) => row.end));
    const spanMs = Math.max(max - min, 1);

    return dated.map((row) => {
      const rawSpan = ((row.end - row.start) / spanMs) * 100;
      const span = Math.min(100, Math.max(rawSpan, 8));
      const offset = Math.min(Math.max(((row.start - min) / spanMs) * 100, 0), 100 - span);
      return {
        id: row.project.id,
        name: row.project.name,
        startLabel: formatTimelineDate(row.start),
        endLabel: row.project.endDate ? formatTimelineDate(row.end) : 'Present',
        offset: Math.round(offset * 10) / 10,
        span: Math.round(span * 10) / 10,
        inProgress: row.project.status === ProjectStatus.InProgress || !row.project.endDate,
      };
    });
  }

  projectTimeline(
    projects: PortfolioAnalyticsProject[],
    reduceMotion: boolean,
  ): Options {
    const dated = this.datedProjects(projects);

    if (!dated.length) {
      return emptyChartOptions(
        'Project timeline',
        'Project dates are not available yet. The chart will populate when start/end dates are added to the analytics data.',
        reduceMotion,
      );
    }

    const categories = dated.map((row) => row.project.name);
    const longestLabel = categories.reduce((max, name) => Math.max(max, name.length), 0);
    const labelMargin = Math.min(240, Math.max(128, Math.round(longestLabel * 7.2)));
    const chartHeight = Math.max(360, 120 + dated.length * 52);
    const base = analyticsChartBase(reduceMotion, chartHeight);
    const series: SeriesOptionsType[] = [
      {
        type: 'xrange',
        name: 'Active period',
        borderRadius: 4,
        borderWidth: 0,
        pointPadding: 0.18,
        groupPadding: 0.12,
        data: dated.map((row, index) => ({
          x: row.start,
          x2: row.end,
          y: index,
          name: row.project.name,
          color: row.project.status === 'in-progress' ? '#00D9FF' : '#3B82F6',
        })),
        dataLabels: {
          enabled: false,
        },
      },
    ];

    return {
      ...base,
      chart: {
        ...base.chart,
        type: 'xrange',
        marginLeft: labelMargin,
        spacingBottom: 28,
        spacingRight: 20,
      },
      title: { ...base.title, text: 'Project timeline' },
      subtitle: {
        ...base.subtitle,
        text: 'Active periods for showcase projects with known dates',
      },
      xAxis: {
        type: 'datetime',
        labels: { style: { color: '#A3AEC0', fontSize: '11px' } },
        lineColor: 'rgba(192,199,209,0.16)',
        gridLineColor: 'rgba(192,199,209,0.1)',
        gridLineWidth: 1,
      },
      yAxis: {
        categories,
        reversed: true,
        title: { text: undefined },
        labels: {
          style: { color: '#A3AEC0', fontSize: '11px' },
          overflow: 'allow',
          reserveSpace: true,
        },
        gridLineColor: 'rgba(192,199,209,0.08)',
      },
      legend: { enabled: false },
      tooltip: {
        ...base.tooltip,
        useHTML: true,
        pointFormatter() {
          const start = formatTimelineDate(this.x);
          const end = formatTimelineDate((this as Point & { x2?: number }).x2);
          return `<b>${this.name ?? ''}</b><br/>${start} → ${end}`;
        },
      },
      series,
    };
  }

  private datedProjects(projects: PortfolioAnalyticsProject[]): DatedProject[] {
    return this.analytics
      .projectsWithDates(projects)
      .map((project) => {
        const start = parseProjectDate(project.startDate);
        const end = project.endDate ? parseProjectDate(project.endDate) : Date.now();
        if (start === undefined || end === undefined || end < start) return undefined;
        return { project, start, end };
      })
      .filter((row): row is DatedProject => !!row)
      .sort((a, b) => a.start - b.start || a.project.name.localeCompare(b.project.name));
  }
}

interface DatedProject {
  project: PortfolioAnalyticsProject;
  start: number;
  end: number;
}

/** Accepts `YYYY-MM` or ISO dates from the analytics payload. */
function parseProjectDate(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const monthOnly = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (monthOnly) {
    const year = Number(monthOnly[1]);
    const month = Number(monthOnly[2]);
    if (month < 1 || month > 12) return undefined;
    return Date.UTC(year, month - 1, 1);
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function formatTimelineDate(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return 'Present';
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(value);
}
