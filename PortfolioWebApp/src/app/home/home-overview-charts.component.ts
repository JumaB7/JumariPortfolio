import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Options } from 'highcharts';
import { HighchartsChartComponent, providePartialHighcharts } from 'highcharts-angular';

/** Lazy-loaded overview charts — keeps Highcharts out of the initial home bundle. */
@Component({
  selector: 'app-home-overview-charts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HighchartsChartComponent],
  host: { class: 'contents' },
  providers: [
    providePartialHighcharts({
      modules: () => [
        import('highcharts/esm/modules/exporting'),
        import('highcharts/esm/modules/accessibility'),
      ],
    }),
  ],
  template: `
    <article class="surface-card min-w-0 overflow-hidden bg-surface-elevated p-5 md:p-6">
      <div class="mb-1 flex items-baseline justify-between gap-3">
        <h3 class="m-0 text-base font-semibold text-text-primary md:text-lg">Technology mix</h3>
        <span class="text-xs font-medium tracking-wide text-text-muted uppercase">Illustrative</span>
      </div>
      <p class="mt-1 mb-3 text-sm text-text-secondary md:mb-4">
        Relative emphasis across the stack used in these portfolio projects.
      </p>
      <highcharts-chart
        class="block min-h-65 w-full max-w-full overflow-visible md:min-h-75"
        [options]="techChart()"
      />
    </article>
    <article class="surface-card min-w-0 overflow-hidden bg-surface-elevated p-5 md:p-6">
      <div class="mb-1 flex items-baseline justify-between gap-3">
        <h3 class="m-0 text-base font-semibold text-text-primary md:text-lg">Project categories</h3>
        <span class="text-xs font-medium tracking-wide text-text-muted uppercase">Illustrative</span>
      </div>
      <p class="mt-1 mb-3 text-sm text-text-secondary md:mb-4">Count of showcased projects by category.</p>
      <highcharts-chart
        class="block min-h-65 w-full max-w-full overflow-visible md:min-h-75"
        [options]="categoryChart()"
      />
    </article>
  `,
})
export class HomeOverviewChartsComponent {
  readonly techChart = input.required<Options>();
  readonly categoryChart = input.required<Options>();
}
