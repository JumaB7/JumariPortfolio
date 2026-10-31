import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';

/**
 * Animates a numeric display string (e.g. "3", "~4", "12+") from 0 to its
 * final value once the host enters the viewport. Non-numeric values show as-is.
 * Illustrative portfolio metrics — not live telemetry.
 */
@Directive({
  selector: '[appCountUp]',
  host: {
    '[textContent]': 'display()',
  },
})
export class CountUpDirective {
  readonly appCountUp = input.required<string>();

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly display = signal('');

  constructor() {
    afterNextRender(() => this.setup());
  }

  private setup(): void {
    const target = this.appCountUp();
    const parsed = parseMetric(target);

    const reduced =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!parsed || reduced) {
      this.display.set(target);
      return;
    }

    this.display.set(`${parsed.prefix}0${parsed.suffix}`);

    if (typeof IntersectionObserver === 'undefined') {
      this.display.set(target);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          this.animate(parsed, target);
          break;
        }
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.2 },
    );

    observer.observe(this.el.nativeElement);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private animate(
    parsed: { prefix: string; value: number; suffix: string },
    finalText: string,
  ): void {
    const duration = 700;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      const current = Math.round(parsed.value * eased);
      this.display.set(`${parsed.prefix}${current}${parsed.suffix}`);
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        this.display.set(finalText);
      }
    };

    requestAnimationFrame(tick);
  }
}

function parseMetric(
  value: string,
): { prefix: string; value: number; suffix: string } | null {
  const match = value.trim().match(/^([^0-9]*)(\d+)(.*)$/);
  if (!match) return null;
  return {
    prefix: match[1] ?? '',
    value: Number(match[2]),
    suffix: match[3] ?? '',
  };
}
