import { HttpContext, HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingSpinnerService } from '../services/loading-spinner.service';

/**
 * Opt a request out of the full-screen spinner.
 * Section reads use their own indicators so the rest of the page stays usable.
 */
export const SKIP_GLOBAL_LOADING = new HttpContextToken(() => false);

export function withoutGlobalLoading(): { context: HttpContext } {
  return { context: new HttpContext().set(SKIP_GLOBAL_LOADING, true) };
}

/** Shows the global spinner for API requests unless skipped via context. */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_GLOBAL_LOADING)) {
    return next(req);
  }

  const loading = inject(LoadingSpinnerService);
  loading.show();
  return next(req).pipe(finalize(() => loading.hide()));
};
