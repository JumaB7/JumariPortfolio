import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import {
  DEFAULT_ERROR_PAGE_CODE,
  ERROR_PAGE_COPY,
  ErrorPageCode,
  ErrorPageCopy,
} from '../constants/error-page.constants';
import { PortfolioService } from '../services/portfolio.service';

function isErrorPageCode(value: unknown): value is ErrorPageCode {
  return value === 404 || value === 500;
}

@Component({
  selector: 'app-error-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block min-h-screen bg-background text-text-primary',
  },
  template: `
    <main class="relative flex min-h-screen flex-col justify-center overflow-hidden py-16 md:py-24">
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,143,173,0.18),transparent_55%)]"
        aria-hidden="true"
      ></div>
      <div class="content-shell relative z-10 max-w-2xl">
        <p class="section-label">{{ copy().eyebrow }}</p>
        <p
          class="m-0 mt-4 font-semibold tracking-[-0.06em] text-accent-cyan tabular-nums text-[clamp(4.5rem,18vw,8rem)] leading-none"
          aria-hidden="true"
        >
          {{ copy().code }}
        </p>
        <h1 class="section-title mt-6 mb-0">{{ copy().title }}</h1>
        <p class="section-copy mt-4 max-w-xl">{{ copy().message }}</p>
        <div class="mt-10 flex flex-wrap gap-3">
          <a class="btn btn-primary" [routerLink]="copy().primaryLink">{{ copy().primaryLabel }}</a>
          @if (copy().secondaryLink.startsWith('/#')) {
            <a class="btn btn-secondary" routerLink="/" [fragment]="secondaryFragment()">
              {{ copy().secondaryLabel }}
            </a>
          } @else {
            <a class="btn btn-secondary" [routerLink]="copy().secondaryLink">
              {{ copy().secondaryLabel }}
            </a>
          }
        </div>
        <p class="mt-10 mb-0 text-sm text-text-muted">
          Need help?
          <a class="text-accent-cyan" [href]="'mailto:' + email">{{ email }}</a>
        </p>
      </div>
    </main>
  `,
})
export class ErrorPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly portfolio = inject(PortfolioService);

  /** Optional override when the page is embedded (e.g. missing project). */
  readonly codeInput = input<ErrorPageCode | undefined>(undefined, { alias: 'code' });

  private readonly routeCode = toSignal(
    this.route.data.pipe(
      map((data) => (isErrorPageCode(data['code']) ? data['code'] : DEFAULT_ERROR_PAGE_CODE)),
    ),
    {
      initialValue: isErrorPageCode(this.route.snapshot.data['code'])
        ? (this.route.snapshot.data['code'] as ErrorPageCode)
        : DEFAULT_ERROR_PAGE_CODE,
    },
  );

  readonly copy = computed<ErrorPageCopy>(() => {
    const code = this.codeInput() ?? this.routeCode();
    return ERROR_PAGE_COPY[code];
  });

  readonly secondaryFragment = computed(() => {
    const link = this.copy().secondaryLink;
    return link.startsWith('/#') ? link.slice(2) : '';
  });

  readonly email = this.portfolio.email;

  constructor() {
    effect(() => {
      const page = this.copy();
      this.title.setTitle(`${page.code} · ${page.title} — Jumari Blignaut`);
      this.meta.updateTag({ name: 'robots', content: 'noindex' });
    });
  }
}
