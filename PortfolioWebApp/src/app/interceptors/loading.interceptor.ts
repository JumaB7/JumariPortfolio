import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingSpinnerService } from '../services/loading-spinner.service';

/** Opt a request out of the full-screen spinner (e.g. agent chat). */
export const SKIP_GLOBAL_LOADING = new HttpContextToken(() => false);

/** Shows the global spinner for API requests unless skipped via context. */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_GLOBAL_LOADING)) {
    return next(req);
  }

  const loading = inject(LoadingSpinnerService);
  loading.show();
  return next(req).pipe(finalize(() => loading.hide()));
};
