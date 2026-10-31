import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardOverview } from '../models/dashboard.model';

const FALLBACK: DashboardOverview = {
  metrics: [
    { label: 'Independent projects', value: '3' },
    { label: 'Years experience', value: '~4' },
    { label: 'Core technologies', value: '12+' },
    { label: 'Industries', value: '4' },
  ],
  technologyMix: [
    { name: 'Angular / TypeScript', y: 30 },
    { name: 'C# / ASP.NET', y: 28 },
    { name: 'SQL / Data', y: 18 },
    { name: 'Cloud / DevOps', y: 14 },
    { name: 'Other', y: 10 },
  ],
  projectCategories: [
    { name: 'Commerce', y: 1 },
    { name: 'Finance tooling', y: 1 },
    { name: 'Portfolio / analytics', y: 1 },
  ],
};

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getOverview(): Observable<DashboardOverview | undefined> {
    return this.http
      .get<DashboardOverview>(`${environment.apiBaseUrl}/dashboard`)
      .pipe(catchError(() => of(FALLBACK)));
  }
}
