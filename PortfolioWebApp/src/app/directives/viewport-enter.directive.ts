import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  output,
} from '@angular/core';

/** Emits once when the host enters (or is near) the viewport. */
@Directive({
  selector: '[appViewportEnter]',
})
export class ViewportEnterDirective {
  readonly entered = output<void>();

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private emitted = false;

  constructor() {
    afterNextRender(() => this.setup());
  }

  private setup(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.emitOnce();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          this.emitOnce();
          observer.disconnect();
          break;
        }
      },
      { root: null, rootMargin: '200px 0px', threshold: 0.01 },
    );

    const tryEmitIfVisible = (): boolean => {
      if (this.emitted) return true;
      const rect = this.el.nativeElement.getBoundingClientRect();
      const margin = 200;
      if (rect.top < window.innerHeight + margin && rect.bottom > -margin) {
        this.emitOnce();
        observer.disconnect();
        return true;
      }
      return false;
    };

    observer.observe(this.el.nativeElement);

    // Cover hosts already near the viewport, plus hash/anchor scrolling that lands after paint.
    requestAnimationFrame(() => tryEmitIfVisible());
    const anchorPass = window.setTimeout(() => tryEmitIfVisible(), 150);
    this.destroyRef.onDestroy(() => {
      window.clearTimeout(anchorPass);
      observer.disconnect();
    });
  }

  private emitOnce(): void {
    if (this.emitted) return;
    this.emitted = true;
    // Defer so host `(entered)` bindings are subscribed before the first emit
    // (afterNextRender / rAF can otherwise fire during the same turn as setup).
    queueMicrotask(() => this.entered.emit());
  }
}
