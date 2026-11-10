import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HTTP_STATUS_PHRASE, HTTP_STATUS_PHRASE_UNKNOWN } from '../constants/http-error.constants';

@Injectable({ providedIn: 'root' })
export class HttpErrorMessageService {
  /** Dashboard / overview load failures — includes HTTP status when known. */
  describeLoadFailure(err: unknown, resource: string): string {
    const statusPhrase = this.statusPhrase(err);
    if (statusPhrase) {
      return `Could not load ${resource}. ${statusPhrase}`;
    }
    if (err instanceof Error && err.message.trim()) {
      return `Could not load ${resource}. ${err.message}`;
    }
    return `Could not load ${resource}.`;
  }

  /** Agent chat — prefer API problem-details, then status-aware fallbacks. */
  describeAgentFailure(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const detail = this.readProblemDetail(err);
      if (detail) return detail;
      if (err.status === 429) {
        return 'Too many questions right now. Please wait a moment and try again.';
      }
      if (err.status === 0) {
        return 'Could not reach the analytics agent. Is PortfolioAPI running?';
      }
      const phrase = this.statusPhrase(err);
      if (phrase) return phrase;
      return err.message || `Request failed (${err.status})`;
    }
    if (err instanceof Error && err.message.trim()) {
      return err.message;
    }
    return 'Something went wrong talking to the analytics agent.';
  }

  private statusPhrase(err: unknown): string | undefined {
    if (!(err instanceof HttpErrorResponse)) return undefined;
    return HTTP_STATUS_PHRASE[err.status] ?? HTTP_STATUS_PHRASE_UNKNOWN(err.status);
  }

  private readProblemDetail(err: HttpErrorResponse): string | undefined {
    const detail = err.error?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
    if (detail && typeof detail === 'object' && typeof detail.message === 'string') {
      return detail.message;
    }
    return undefined;
  }
}
