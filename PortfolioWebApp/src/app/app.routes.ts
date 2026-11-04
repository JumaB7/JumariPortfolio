import { Routes } from '@angular/router';
import { DashboardAgentComponent } from './agent/dashboard-agent.component';
import { AnalyticsDashboardComponent } from './analytics/analytics-dashboard.component';
import { FinancialAnalyticsViewComponent } from './analytics/financial/financial-analytics-view.component';
import { ProjectPortfolioViewComponent } from './analytics/project-portfolio-view.component';
import { ErrorPageComponent } from './error/error-page.component';
import { HomeContainerComponent } from './home/home-container.component';
import { ProjectDetailComponent } from './projects/project-detail.component';

export const routes: Routes = [
  { path: '', component: HomeContainerComponent },
  { path: 'projects/:id', component: ProjectDetailComponent },
  { path: 'dashboard/agent', component: DashboardAgentComponent },
  {
    path: 'dashboard',
    component: AnalyticsDashboardComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'financial' },
      { path: 'financial', component: FinancialAnalyticsViewComponent },
      { path: 'projects', component: ProjectPortfolioViewComponent },
    ],
  },
  {
    path: 'error/404',
    component: ErrorPageComponent,
    data: { code: 404 },
  },
  {
    path: 'error/500',
    component: ErrorPageComponent,
    data: { code: 500 },
  },
  { path: 'error', pathMatch: 'full', redirectTo: 'error/404' },
  {
    path: '**',
    component: ErrorPageComponent,
    data: { code: 404 },
  },
];
