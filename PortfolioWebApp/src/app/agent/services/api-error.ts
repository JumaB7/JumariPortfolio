import { HttpErrorResponse } from '@angular/common/http';

export function readApiErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const detail = err.error?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
    if (detail && typeof detail === 'object' && typeof detail.message === 'string') {
      return detail.message;
    }
    if (err.status === 429) {
      return 'Too many questions right now. Please wait a moment and try again.';
    }
    if (err.status === 0) {
      return 'Could not reach the analytics agent. Is PortfolioAPI running?';
    }
    return err.message || `Request failed (${err.status})`;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Something went wrong talking to the analytics agent.';
}
