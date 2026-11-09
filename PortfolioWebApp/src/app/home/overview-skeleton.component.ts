import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-overview-skeleton',
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div role="status" aria-busy="true" [ngClass]="rootClass()">
      <span class="sr-only">Loading overview</span>
      <div aria-hidden="true" [ngClass]="metricClass()">
        @for (slot of metricSlots; track slot) {
          <article class="surface-card bg-surface-elevated" [ngClass]="cardPad()">
            <div class="h-8 w-16 animate-pulse rounded bg-surface-highlight"></div>
            <div class="mt-3 h-3 w-28 animate-pulse rounded bg-surface-highlight"></div>
          </article>
        }
      </div>
      <div aria-hidden="true" [ngClass]="chartClass()">
        @for (slot of chartSlots; track slot) {
          <article class="surface-card bg-surface-elevated" [ngClass]="cardPad()">
            <div class="h-4 w-36 animate-pulse rounded bg-surface-highlight"></div>
            <div class="mt-3 h-3 w-full max-w-sm animate-pulse rounded bg-surface-highlight"></div>
            <div class="mt-5 h-52 animate-pulse rounded-xl bg-surface-highlight"></div>
          </article>
        }
      </div>
    </div>
  `,
})
export class OverviewSkeletonComponent {
  readonly layout = input<'desktop' | 'mobile'>('desktop');

  readonly rootClass = computed(() => (this.layout() === 'desktop' ? 'mt-10' : 'mt-8'));
  readonly cardPad = computed(() => (this.layout() === 'desktop' ? 'p-6' : 'p-4'));
  readonly metricClass = computed(() =>
    this.layout() === 'desktop' ? 'grid gap-4 grid-cols-4' : 'grid gap-3 grid-cols-2',
  );
  readonly chartClass = computed(() =>
    this.layout() === 'desktop' ? 'mt-6 grid min-w-0 grid-cols-2 gap-6' : 'mt-5 grid min-w-0 gap-5',
  );

  readonly metricSlots = [0, 1, 2, 3];
  readonly chartSlots = [0, 1];
}
