import { Directive, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import type { Options } from 'highcharts';
import { catchError, fromEvent, of } from 'rxjs';
import { ContactStatus } from '../models/contact.model';
import { ChartSeriesPoint, DashboardOverview } from '../models/dashboard.model';
import { ProjectAction, ProjectItem } from '../models/portfolio.model';
import { ContactService } from '../services/contact.service';
import { DashboardService } from '../services/dashboard.service';
import { PortfolioService } from '../services/portfolio.service';

@Directive()
export class HomeBaseDirective {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly portfolio = inject(PortfolioService);
  private readonly dashboardService = inject(DashboardService);
  private readonly contactService = inject(ContactService);

  readonly navLinks = this.portfolio.navLinks;
  readonly about = this.portfolio.about;
  readonly skillGroups = this.portfolio.skillGroups;
  readonly projects = this.portfolio.projects;
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

  readonly overview = toSignal<DashboardOverview | undefined>(
    this.dashboardService.getOverview().pipe(catchError(() => of(undefined))),
    { initialValue: undefined },
  );

  readonly techChart = computed(() =>
    this.buildPie('Technology mix', this.overview()?.technologyMix ?? []),
  );
  readonly categoryChart = computed(() =>
    this.buildColumn('Project categories', this.overview()?.projectCategories ?? []),
  );

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(4000)]],
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

  previewClass(project: ProjectItem): string {
    if (project.id === 'veld-supply') {
      return 'project-preview--commerce';
    }
    if (project.id === 'accountant-app') {
      return 'project-preview--admin';
    }
    return 'project-preview--analytics';
  }

  isInternal(action: ProjectAction): boolean {
    return action.url.startsWith('#');
  }

  isAppRoute(action: ProjectAction): boolean {
    return action.url.startsWith('/');
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.status.set(null);

    this.contactService.send(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.status.set('sent');
        this.statusMessage.set('Message sent. I’ll get back to you soon.');
        this.form.reset();
      },
      error: () => {
        this.submitting.set(false);
        this.status.set('error');
        this.statusMessage.set('Could not send right now. Please email me directly.');
      },
    });
  }

  private updateActiveSection(): void {
    const offset = 120;
    let current = 'home';
    for (const link of this.navLinks) {
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
        spacing: [8, 8, 8, 8],
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
      chart: { ...base.chart, type: 'pie' },
      plotOptions: {
        ...base.plotOptions,
        pie: {
          innerSize: '58%',
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.percentage:.0f}%',
            style: {
              color: '#A3AEC0',
              fontSize: '12px',
              fontWeight: '500',
              textOutline: 'none',
            },
            distance: 12,
            crop: true,
            overflow: 'justify',
          },
          showInLegend: true,
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
