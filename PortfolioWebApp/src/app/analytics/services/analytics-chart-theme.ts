import type { Chart, Options, SVGElement } from 'highcharts';

export const ANALYTICS_CHART_COLORS = [
  '#22D3EE',
  '#3B82F6',
  '#60A5FA',
  '#A78BFA',
  '#14B8A6',
  '#7DD3FC',
  '#94A3B8',
];

const DONUT_CENTER_LABEL_KEY = '_portfolioDonutCenterLabel';

type ChartWithDonutLabel = Chart & {
  [DONUT_CENTER_LABEL_KEY]?: SVGElement;
};

export function analyticsChartBase(reduceMotion: boolean, height = 360): Options {
  return {
    chart: {
      backgroundColor: 'transparent',
      height,
      reflow: true,
      style: { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' },
      animation: reduceMotion ? false : { duration: 450 },
      // Leave room for titles, axis labels, and pie connectors.
      spacing: [20, 24, 24, 24],
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

/**
 * Pins the donut hole label to the pie series centre on each render.
 * Highcharts floating HTML titles do not reliably centre inside the ring.
 */
export function syncDonutCenterLabel(chart: Chart, total: number, unit = 'projects'): void {
  const pie = chart.series[0] as { center?: number[] } | undefined;
  const center = pie?.center;
  if (!center || center.length < 2) {
    return;
  }

  const host = chart as ChartWithDonutLabel;
  host[DONUT_CENTER_LABEL_KEY]?.destroy();

  const cx = chart.plotLeft + center[0];
  const cy = chart.plotTop + center[1];
  const html =
    `<div style="text-align:center;line-height:1.15;white-space:nowrap">` +
    `<span style="display:block;font-size:1.5rem;color:#F2F5FA;font-weight:700">${total}</span>` +
    `<span style="display:block;font-size:0.75rem;color:#A3AEC0;font-weight:500">${unit}</span>` +
    `</div>`;

  const label = chart.renderer
    .label(html, cx, cy, undefined, undefined, undefined, true)
    .attr({ padding: 0, zIndex: 7 })
    .add();

  const box = label.getBBox();
  label.attr({
    x: cx - box.width / 2,
    y: cy - box.height / 2,
  });

  host[DONUT_CENTER_LABEL_KEY] = label;
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
