import { Routes } from '@angular/router';
import { DashboardAgentComponent } from './agent/dashboard-agent.component';
import { AnalyticsDashboardComponent } from './analytics/analytics-dashboard.component';
import { HomeContainerComponent } from './home/home-container.component';

export const routes: Routes = [
  { path: '', component: HomeContainerComponent },
  { path: 'dashboard/agent', component: DashboardAgentComponent },
  { path: 'dashboard', component: AnalyticsDashboardComponent },
  { path: '**', redirectTo: '' },
];
