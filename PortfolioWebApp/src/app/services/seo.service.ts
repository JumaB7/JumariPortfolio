import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import {
  DEFAULT_OG_IMAGE,
  PageSeo,
  SEO_DEFER_DATA,
  SEO_ROUTE_DATA,
  SITE_NAME,
  SITE_ORIGIN,
} from '../constants/seo.constants';

const DESCRIPTION_MAX = 160;

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.applyFromRoute());
  }

  apply(page: PageSeo): void {
    const url = new URL(page.path, SITE_ORIGIN).href;
    const description = this.clip(page.description);
    const image = this.absoluteImage(page.image);

    this.title.setTitle(page.title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({
      name: 'robots',
      content: page.noindex ? 'noindex, follow' : 'index, follow',
    });
    this.upsertCanonical(url);

    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: page.title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }

  private applyFromRoute(): void {
    let current = this.router.routerState.snapshot.root;
    let page: PageSeo | undefined;
    let defer = false;

    while (current) {
      if (current.data[SEO_DEFER_DATA] === true) {
        defer = true;
      }
      const seo = current.data[SEO_ROUTE_DATA];
      if (this.isPageSeo(seo)) {
        page = seo;
      }
      if (!current.firstChild) break;
      current = current.firstChild;
    }

    if (defer || !page) return;
    this.apply(page);
  }

  private isPageSeo(value: unknown): value is PageSeo {
    if (!value || typeof value !== 'object') return false;
    const page = value as PageSeo;
    return (
      typeof page.title === 'string' &&
      typeof page.description === 'string' &&
      typeof page.path === 'string'
    );
  }

  private absoluteImage(path: string | undefined): string {
    if (!path) return DEFAULT_OG_IMAGE;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return new URL(path, SITE_ORIGIN).href;
  }

  private clip(text: string): string {
    const flat = text.replace(/\s+/g, ' ').trim();
    if (flat.length <= DESCRIPTION_MAX) return flat;
    const cut = flat.slice(0, DESCRIPTION_MAX - 1);
    const space = cut.lastIndexOf(' ');
    const end = space > 100 ? space : DESCRIPTION_MAX - 1;
    return `${cut.slice(0, end)}…`;
  }

  private upsertCanonical(url: string): void {
    const head = this.document.head;
    if (!head) return;

    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
