import type { Options } from 'highcharts';

export const ANALYTICS_CHART_COLORS = [
  '#00D9FF',
  '#3B82F6',
  '#7DD3FC',
  '#60A5FA',
  '#C0C7D1',
  '#94A3B8',
  '#38BDF8',
];

export function analyticsChartBase(reduceMotion: boolean): Options {
  return {
    chart: {
      backgroundColor: 'transparent',
      style: { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' },
      animation: reduceMotion ? false : { duration: 450 },
      spacing: [12, 12, 8, 12],
    },
    title: {
      align: 'left',
      style: {
        color: '#F2F5FA',
        fontSize: '1rem',
        fontWeight: '600',
      },
    },
    subtitle: {
      align: 'left',
      style: {
        color: '#A3AEC0',
        fontSize: '0.8rem',
      },
    },
    credits: { enabled: false },
    legend: {
      itemStyle: { color: '#A3AEC0', fontWeight: '500', fontSize: '12px' },
      itemHoverStyle: { color: '#F2F5FA' },
    },
    tooltip: {
      backgroundColor: '#111B2D',
      borderColor: 'rgba(192,199,209,0.18)',
      style: { color: '#F2F5FA', fontSize: '12px' },
      shadow: false,
    },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuClassName: 'analytics-export-menu',
          theme: {
            fill: 'transparent',
            stroke: 'rgba(192,199,209,0.25)',
          },
        },
      },
    },
    accessibility: {
      enabled: true,
    },
    plotOptions: {
      series: {
        animation: reduceMotion ? false : { duration: 450 },
        borderWidth: 0,
      },
    },
    colors: ANALYTICS_CHART_COLORS,
  };
}

export function emptyChartOptions(title: string, message: string, reduceMotion: boolean): Options {
  const base = analyticsChartBase(reduceMotion);
  return {
    ...base,
    title: { ...base.title, text: title },
    subtitle: { ...base.subtitle, text: message },
    series: [],
    exporting: { enabled: false },
  };
}
