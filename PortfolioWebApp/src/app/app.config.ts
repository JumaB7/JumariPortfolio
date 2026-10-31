import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHighcharts } from 'highcharts-angular';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),
    provideHttpClient(),
    provideHighcharts({
      modules: () => [
        import('highcharts/esm/modules/heatmap'),
        import('highcharts/esm/modules/exporting'),
        import('highcharts/esm/modules/accessibility'),
      ],
    }),
  ],
};
