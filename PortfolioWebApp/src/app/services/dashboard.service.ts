import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { withoutGlobalLoading } from '../interceptors/loading.interceptor';
import { DashboardOverview } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  /** Home overview. Failures stay on the caller so that section can offer a retry. */
  getOverview(): Observable<DashboardOverview> {
    return this.http.get<DashboardOverview>(
      `${environment.apiBaseUrl}/dashboard`,
      withoutGlobalLoading(),
    );
  }
}
