import { Routes } from '@angular/router';
import { DashboardAgentComponent } from './agent/dashboard-agent.component';
import { AnalyticsDashboardComponent } from './analytics/analytics-dashboard.component';
import { FinancialAnalyticsViewComponent } from './analytics/financial/financial-analytics-view.component';
import { ProjectPortfolioViewComponent } from './analytics/project-portfolio-view.component';
import {
  FINANCIAL_DASHBOARD_SEO,
  HOME_SEO,
  PROJECT_PORTFOLIO_SEO,
  SEO_DEFER_DATA,
  SEO_ROUTE_DATA,
} from './constants/seo.constants';
import { ErrorPageComponent } from './error/error-page.component';
import { HomeContainerComponent } from './home/home-container.component';
import { ProjectDetailComponent } from './projects/project-detail.component';

export const routes: Routes = [
  { path: '', component: HomeContainerComponent, data: { [SEO_ROUTE_DATA]: HOME_SEO } },
  {
    path: 'projects/:id',
    component: ProjectDetailComponent,
    data: { [SEO_DEFER_DATA]: true },
  },
  {
    path: 'dashboard/agent',
    component: DashboardAgentComponent,
    data: { [SEO_DEFER_DATA]: true },
  },
  {
    path: 'dashboard',
    component: AnalyticsDashboardComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'financial' },
      {
        path: 'financial',
        component: FinancialAnalyticsViewComponent,
        data: { [SEO_ROUTE_DATA]: FINANCIAL_DASHBOARD_SEO },
      },
      {
        path: 'projects',
        component: ProjectPortfolioViewComponent,
        data: { [SEO_ROUTE_DATA]: PROJECT_PORTFOLIO_SEO },
      },
    ],
  },
  {
    path: 'error/404',
    component: ErrorPageComponent,
    data: { code: 404, [SEO_DEFER_DATA]: true },
  },
  {
    path: 'error/500',
    component: ErrorPageComponent,
    data: { code: 500, [SEO_DEFER_DATA]: true },
  },
  { path: 'error', pathMatch: 'full', redirectTo: 'error/404' },
  {
    path: '**',
    component: ErrorPageComponent,
    data: { code: 404, [SEO_DEFER_DATA]: true },
  },
];
