import { Injectable, inject } from '@angular/core';
import type { Options, Point, SeriesOptionsType } from 'highcharts';
import {
  AnalyticsSelection,
  PortfolioAnalyticsProject,
} from '../models/portfolio-analytics.model';
import { PortfolioAnalyticsService } from './portfolio-analytics.service';
import { analyticsChartBase, emptyChartOptions } from './analytics-chart-theme';

@Injectable({ providedIn: 'root' })
export class AnalyticsChartService {
  private readonly analytics = inject(PortfolioAnalyticsService);

  technologyDistribution(
    projects: PortfolioAnalyticsProject[],
    reduceMotion: boolean,
    onSelect: (selection: AnalyticsSelection) => void,
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
        cursor: 'pointer',
        point: {
          events: {
            click() {
              const point = this as Point;
              onSelect({ kind: 'technology', value: String(point.name ?? point.category) });
            },
          },
        },
      },
    ];

    return {
      ...base,
      chart: { ...base.chart, type: 'column' },
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
              chart: { type: 'bar' },
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
    onSelect: (selection: AnalyticsSelection) => void,
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
    const base = analyticsChartBase(reduceMotion);
    const series: SeriesOptionsType[] = [
      {
        type: 'pie',
        name: 'Projects',
        data: distribution.map((d) => ({ name: d.name, y: d.y })),
      },
    ];

    return {
      ...base,
      chart: { ...base.chart, type: 'pie' },
      title: {
        text: `<div style="text-align:center"><span style="font-size:1.5rem;color:#F2F5FA;font-weight:700">${total}</span><br/><span style="font-size:0.75rem;color:#A3AEC0">projects</span></div>`,
        align: 'center',
        verticalAlign: 'middle',
        useHTML: true,
        y: 18,
      },
      subtitle: {
        ...base.subtitle,
        text: 'Project type distribution',
        align: 'left',
        verticalAlign: 'top',
        y: 8,
      },
      tooltip: {
        ...base.tooltip,
        pointFormat: '<b>{point.y}</b> ({point.percentage:.0f}%)',
      },
      plotOptions: {
        ...base.plotOptions,
        pie: {
          innerSize: '62%',
          borderWidth: 0,
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.percentage:.0f}%',
            style: {
              color: '#A3AEC0',
              fontSize: '11px',
              fontWeight: '500',
              textOutline: 'none',
            },
            distance: 14,
            crop: true,
            overflow: 'justify',
          },
          showInLegend: true,
          point: {
            events: {
              click() {
                const point = this as Point;
                onSelect({ kind: 'category', value: String(point.name) });
              },
            },
          },
        },
      },
      series,
    };
  }

  technologyMatrix(
    projects: PortfolioAnalyticsProject[],
    reduceMotion: boolean,
    onSelect: (selection: AnalyticsSelection) => void,
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
        cursor: 'pointer',
        point: {
          events: {
            click() {
              const point = this as Point;
              const x = point.x ?? 0;
              const y = point.y ?? 0;
              onSelect({
                kind: 'matrix',
                project: matrix.projects[y] ?? '',
                technology: matrix.technologies[x] ?? '',
                used: Number(point.value) === 1,
              });
            },
          },
        },
      },
    ];

    return {
      ...base,
      chart: {
        ...base.chart,
        type: 'heatmap',
        height: Math.max(280, 72 + matrix.projects.length * 48),
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
        },
        lineColor: 'rgba(192,199,209,0.14)',
      },
      yAxis: {
        categories: matrix.projects,
        title: { text: undefined },
        reversed: true,
        labels: { style: { color: '#A3AEC0', fontSize: '11px' } },
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
              chart: { height: Math.max(300, 80 + matrix.projects.length * 56) },
            },
          },
        ],
      },
    };
  }

  projectTimeline(
    projects: PortfolioAnalyticsProject[],
    reduceMotion: boolean,
  ): Options {
    const dated = this.analytics.projectsWithDates(projects);
    if (!dated.length) {
      return emptyChartOptions(
        'Project timeline',
        'Project dates are not available yet. The chart will populate when start/end dates are added to the analytics data.',
        reduceMotion,
      );
    }

    const base = analyticsChartBase(reduceMotion);
    const series: SeriesOptionsType[] = [
      {
        type: 'column',
        name: 'Duration',
        data: dated.map((p) => {
          const start = Date.parse(p.startDate ?? '');
          const end = p.endDate ? Date.parse(p.endDate) : Date.now();
          return {
            name: p.name,
            y: Math.max(0, end - start),
            color: p.status === 'in-progress' ? '#00D9FF' : '#3B82F6',
          };
        }),
      },
    ];

    return {
      ...base,
      chart: { ...base.chart, type: 'column' },
      title: { ...base.title, text: 'Project timeline' },
      subtitle: {
        ...base.subtitle,
        text: 'Showcase projects with known date ranges',
      },
      xAxis: {
        categories: dated.map((p) => p.name),
        labels: { style: { color: '#A3AEC0', fontSize: '11px' } },
        lineColor: 'rgba(192,199,209,0.16)',
      },
      yAxis: {
        title: { text: 'Duration (ms)', style: { color: '#A3AEC0' } },
        labels: { style: { color: '#A3AEC0', fontSize: '11px' } },
        gridLineColor: 'rgba(192,199,209,0.1)',
      },
      legend: { enabled: false },
      tooltip: {
        ...base.tooltip,
        pointFormat: '<b>{point.name}</b>',
      },
      series,
    };
  }
}
