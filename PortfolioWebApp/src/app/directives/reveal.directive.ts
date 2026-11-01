import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';

@Directive({
  selector: '[appReveal]',
  host: {
    class: 'reveal',
    '[class.reveal-ready]': 'armed()',
    '[class.reveal-visible]': 'visible()',
  },
})
export class RevealDirective {
  /** Stagger delay in milliseconds once the element enters the viewport. */
  readonly appReveal = input(0, {
    transform: (value: number | string | boolean): number => {
      if (value === '' || value === true) return 0;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    },
  });

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  /** Hide until revealed — only when motion is allowed (avoids post-paint flash). */
  readonly armed = signal(!RevealDirective.prefersReducedMotion());
  readonly visible = signal(RevealDirective.prefersReducedMotion());

  constructor() {
    afterNextRender(() => this.setup());
  }

  private setup(): void {
    const delayMs = Math.max(0, this.appReveal());
    this.el.nativeElement.style.setProperty('--reveal-delay', `${delayMs}ms`);

    if (!this.armed()) {
      this.visible.set(true);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      this.visible.set(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          this.visible.set(true);
          observer.disconnect();
          break;
        }
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );

    observer.observe(this.el.nativeElement);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private static prefersReducedMotion(): boolean {
    return (
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
