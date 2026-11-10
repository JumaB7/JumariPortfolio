import { Provider } from '@angular/core';
import { providePartialHighcharts } from 'highcharts-angular';

/** Dashboard chart modules — loaded when Highcharts charts initialise, not at bootstrap. */
export function provideDashboardHighcharts(): Provider {
  return providePartialHighcharts({
    modules: () => [
      import('highcharts/esm/modules/heatmap'),
      import('highcharts/esm/modules/xrange'),
      import('highcharts/esm/modules/exporting'),
      import('highcharts/esm/modules/accessibility'),
    ],
  });
}
