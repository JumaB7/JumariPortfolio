import { Injectable, computed, signal } from '@angular/core';

/** Tracks in-flight HTTP requests for a global loading spinner. */
@Injectable({ providedIn: 'root' })
export class LoadingSpinnerService {
  private readonly pending = signal(0);

  readonly active = computed(() => this.pending() > 0);

  show(): void {
    this.pending.update((count) => count + 1);
  }

  hide(): void {
    this.pending.update((count) => Math.max(0, count - 1));
  }
}
