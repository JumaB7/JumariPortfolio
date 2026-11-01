import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingSpinnerService } from '../services/loading-spinner.service';

/** Shows the global spinner for every API request until it completes. */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingSpinnerService);
  loading.show();
  return next(req).pipe(finalize(() => loading.hide()));
};
