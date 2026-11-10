import { Routes } from '@angular/router';
import {
  FINANCIAL_DASHBOARD_SEO,
  HOME_SEO,
  PROJECT_PORTFOLIO_SEO,
  SEO_DEFER_DATA,
  SEO_ROUTE_DATA,
} from './constants/seo.constants';
import { provideDashboardHighcharts } from './providers/highcharts.providers';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home-container.component').then((m) => m.HomeContainerComponent),
    data: { [SEO_ROUTE_DATA]: HOME_SEO },
  },
  {
    path: 'projects/:id',
    loadComponent: () =>
      import('./projects/project-detail.component').then((m) => m.ProjectDetailComponent),
    data: { [SEO_DEFER_DATA]: true },
  },
  {
    path: 'dashboard/agent',
    loadComponent: () =>
      import('./agent/dashboard-agent.component').then((m) => m.DashboardAgentComponent),
    data: { [SEO_DEFER_DATA]: true },
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./analytics/analytics-dashboard.component').then((m) => m.AnalyticsDashboardComponent),
    providers: [provideDashboardHighcharts()],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'financial' },
      {
        path: 'financial',
        loadComponent: () =>
          import('./analytics/financial/financial-analytics-view.component').then(
            (m) => m.FinancialAnalyticsViewComponent,
          ),
        data: { [SEO_ROUTE_DATA]: FINANCIAL_DASHBOARD_SEO },
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./analytics/project-portfolio-view.component').then(
            (m) => m.ProjectPortfolioViewComponent,
          ),
        data: { [SEO_ROUTE_DATA]: PROJECT_PORTFOLIO_SEO },
      },
    ],
  },
  {
    path: 'error/404',
    loadComponent: () => import('./error/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 404, [SEO_DEFER_DATA]: true },
  },
  {
    path: 'error/500',
    loadComponent: () => import('./error/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 500, [SEO_DEFER_DATA]: true },
  },
  { path: 'error', pathMatch: 'full', redirectTo: 'error/404' },
  {
    path: '**',
    loadComponent: () => import('./error/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 404, [SEO_DEFER_DATA]: true },
  },
];
