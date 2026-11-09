import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import type { Options } from 'highcharts';
import { catchError, fromEvent, map, of, startWith, switchMap } from 'rxjs';
import {
  DEFAULT_PROJECT_PREVIEW_CLASS,
  PROJECT_PREVIEW_CLASS_BY_ID,
} from '../constants/analytics.constants';
import { CONTACT_STATUS_MESSAGES } from '../constants/contact.constants';
import { OVERVIEW_STATUS_COPY } from '../constants/portfolio.constants';
import { ContactStatus } from '../models/contact.model';
import { ChartSeriesPoint } from '../models/dashboard.model';
import {
  ProjectActionLinkKind,
  ProjectActionView,
  ProjectCardView,
} from '../models/portfolio.model';
import { ContactService } from '../services/contact.service';
import { DashboardService } from '../services/dashboard.service';
import { PortfolioService } from '../services/portfolio.service';
import { ValidationService } from '../services/validation.service';

/** Shared home logic for desktop/mobile — plain TS base (no empty @Directive). */
export class HomeBase {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly validation = inject(ValidationService);
  private readonly portfolio = inject(PortfolioService);
  private readonly dashboardService = inject(DashboardService);
  private readonly contactService = inject(ContactService);

  readonly navLinks = this.portfolio.navLinks;
  readonly about = this.portfolio.about;
  readonly skillGroups = this.portfolio.skillGroups;
  readonly experience = this.portfolio.experience;
  readonly email = this.portfolio.email;
  readonly linkedInUrl = this.portfolio.linkedInUrl;
  readonly githubUrl = this.portfolio.githubUrl;
  readonly cvUrl = this.portfolio.cvUrl;
  readonly footerLinks = this.portfolio.footerLinks;
  readonly year = this.portfolio.year;

  readonly activeSection = signal('home');
  readonly menuOpen = signal(false);
  readonly submitting = signal(false);
  readonly status = signal<ContactStatus>(null);
  readonly statusMessage = signal('');
  /** Hero copy fades in once the aurora intro reaches the reveal phase. */
  readonly heroContentReady = signal(false);
  readonly overviewStatusCopy = OVERVIEW_STATUS_COPY;

  private readonly overviewAttempt = signal(0);

  private readonly overviewState = toSignal(
    toObservable(this.overviewAttempt).pipe(
      switchMap(() =>
        this.dashboardService.getOverview().pipe(
          map((data) => ({ status: 'ready' as const, data })),
          catchError(() => of({ status: 'error' as const })),
          startWith({ status: 'loading' as const }),
        ),
      ),
    ),
    { initialValue: { status: 'loading' as const } },
  );

  readonly overview = computed(() => {
    const state = this.overviewState();
    return state.status === 'ready' ? state.data : undefined;
  });

  readonly overviewFailed = computed(() => this.overviewState().status === 'error');

  readonly techChart = computed(() =>
    this.buildPie('Technology mix', this.overview()?.technologyMix ?? []),
  );
  readonly categoryChart = computed(() =>
    this.buildColumn('Project categories', this.overview()?.projectCategories ?? []),
  );

  readonly projectCards: ProjectCardView[] = this.portfolio.projects.map((project) => ({
    ...project,
    previewClass: PROJECT_PREVIEW_CLASS_BY_ID[project.id] ?? DEFAULT_PROJECT_PREVIEW_CLASS,
    overviewShots: (
      project.previewVisuals ??
      (project.capabilities ?? []).flatMap((capability) => capability.visuals ?? [])
    ).slice(0, 2),
    cardFeatures: project.features.slice(0, 4),
    actionViews: project.actions.map((action): ProjectActionView => ({
      ...action,
      linkKind: this.resolveActionLinkKind(action.url),
    })),
  }));

  readonly form = this.fb.nonNullable.group({
    name: ['', this.validation.contactNameValidators()],
    email: ['', this.validation.contactEmailValidators()],
    message: ['', this.validation.contactMessageValidators()],
  });

  constructor() {
    fromEvent(window, 'scroll')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateActiveSection());
    fromEvent(window, 'resize')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (window.innerWidth >= 1024) {
          this.menuOpen.set(false);
        }
      });
    this.updateActiveSection();

    // Safety: never leave hero copy hidden if the aurora intro fails to signal.
    const heroFallback = window.setTimeout(() => this.heroContentReady.set(true), 3500);
    this.destroyRef.onDestroy(() => clearTimeout(heroFallback));
  }

  onHeroContentReady(): void {
    this.heroContentReady.set(true);
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  retryOverview(): void {
    if (this.overviewState().status === 'loading') return;
    this.overviewAttempt.update((count) => count + 1);
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.form.getRawValue();
    this.submitting.set(true);
    this.status.set(null);
    this.form.disable({ emitEvent: false });

    this.contactService
      .send(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.form.enable({ emitEvent: false });
          this.form.reset();
          this.submitting.set(false);
          this.status.set('sent');
          this.statusMessage.set(CONTACT_STATUS_MESSAGES.sent);
        },
        error: (err: unknown) => {
          this.form.enable({ emitEvent: false });
          this.submitting.set(false);
          this.status.set('error');
          this.statusMessage.set(
            err instanceof HttpErrorResponse && err.status === 429
              ? CONTACT_STATUS_MESSAGES.rateLimited
              : CONTACT_STATUS_MESSAGES.error,
          );
        },
      });
  }

  private resolveActionLinkKind(url: string): ProjectActionLinkKind {
    if (!url) return 'disabled';
    if (url.startsWith('/')) return 'route';
    if (url.startsWith('#')) return 'hash';
    return 'external';
  }

  private updateActiveSection(): void {
    const offset = 120;
    let current = 'home';
    for (const link of this.navLinks) {
      if (link.route) continue;
      const el = document.getElementById(link.id);
      if (!el) continue;
      if (el.getBoundingClientRect().top - offset <= 0) {
        current = link.id;
      }
    }
    this.activeSection.set(current);
  }

  private chartBase(): Options {
    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    return {
      chart: {
        backgroundColor: 'transparent',
        style: { fontFamily: 'Inter, sans-serif' },
        animation: reduceMotion ? false : { duration: 650 },
        spacing: [16, 20, 20, 20],
      },
      title: { text: undefined },
      credits: { enabled: false },
      legend: {
        itemStyle: { color: '#A3AEC0', fontSize: '13px' },
        itemHoverStyle: { color: '#F2F5FA' },
      },
      tooltip: {
        backgroundColor: '#111B2D',
        borderColor: 'rgba(192,199,209,0.14)',
        style: { color: '#F2F5FA', fontSize: '13px' },
      },
      plotOptions: {
        series: {
          animation: reduceMotion ? false : { duration: 650 },
        },
      },
    };
  }

  private buildPie(name: string, data: ChartSeriesPoint[]): Options {
    const base = this.chartBase();
    return {
      ...base,
      chart: { ...base.chart, type: 'pie', spacing: [20, 28, 28, 28] },
      legend: { enabled: false },
      plotOptions: {
        ...base.plotOptions,
        pie: {
          innerSize: '58%',
          borderWidth: 0,
          size: '70%',
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.percentage:.0f}%',
            style: {
              color: '#A3AEC0',
              fontSize: '12px',
              fontWeight: '500',
              textOutline: 'none',
            },
            distance: 16,
            crop: false,
            overflow: 'allow',
            connectorColor: 'rgba(163,174,192,0.55)',
          },
        },
      },
      colors: ['#3B82F6', '#00D9FF', '#7DD3FC', '#64748B', '#C0C7D1'],
      series: [{ type: 'pie', name, data }],
    };
  }

  private buildColumn(name: string, data: ChartSeriesPoint[]): Options {
    const base = this.chartBase();
    return {
      ...base,
      chart: { ...base.chart, type: 'column' },
      xAxis: {
        categories: data.map((d) => d.name),
        lineColor: 'rgba(192,199,209,0.14)',
        tickColor: 'rgba(192,199,209,0.14)',
        labels: { style: { color: '#A3AEC0', fontSize: '12px' } },
      },
      yAxis: {
        title: { text: undefined },
        gridLineColor: 'rgba(192,199,209,0.1)',
        labels: { style: { color: '#A3AEC0', fontSize: '12px' } },
        allowDecimals: false,
        min: 0,
      },
      legend: { enabled: false },
      plotOptions: {
        ...base.plotOptions,
        column: {
          dataLabels: {
            enabled: true,
            style: {
              color: '#F2F5FA',
              fontSize: '12px',
              fontWeight: '600',
              textOutline: 'none',
            },
          },
        },
      },
      series: [
        {
          type: 'column',
          name,
          data: data.map((d) => d.y),
          color: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
              [0, '#00D9FF'],
              [1, '#3B82F6'],
            ],
          },
          borderRadius: 6,
          borderWidth: 0,
        },
      ],
    };
  }
}
