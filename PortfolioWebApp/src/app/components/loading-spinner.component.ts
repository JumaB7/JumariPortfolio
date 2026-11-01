import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoadingSpinnerService } from '../services/loading-spinner.service';

@Component({
  selector: 'app-loading-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'contents',
  },
  template: `
    @if (loading.active()) {
      <div
        class="loading-spinner-overlay"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="loading-spinner" aria-hidden="true"></div>
        <span class="sr-only">Loading</span>
      </div>
    }
  `,
})
export class LoadingSpinnerComponent {
  readonly loading = inject(LoadingSpinnerService);
}
