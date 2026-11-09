/** Public site origin. Canonical and Open Graph URLs always use this host. */
export const SITE_ORIGIN = 'https://jumariblignaut.dev';

export const SITE_NAME = 'Jumari Blignaut';

export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/projects/jumari-portfolio/home-1024.jpg`;

/** Route `data` key for static page metadata. */
export const SEO_ROUTE_DATA = 'seo';

/** Route `data` key when the page component sets metadata itself. */
export const SEO_DEFER_DATA = 'seoDefer';

export interface PageSeo {
  title: string;
  description: string;
  /** Site path beginning with `/`. */
  path: string;
  noindex?: boolean;
  /** Site-relative or absolute image used for social previews. */
  image?: string;
}

/**
 * Homepage metadata. Keep the matching tags in `src/index.html` in sync —
 * that file is the HTML response before Angular boots.
 */
export const HOME_SEO: PageSeo = {
  title: 'Jumari Blignaut — Full-Stack Software Engineer',
  description:
    'Portfolio of Jumari Blignaut, full-stack software engineer specializing in Angular, ASP.NET Core, and data-driven systems.',
  path: '/',
};

export const FINANCIAL_DASHBOARD_SEO: PageSeo = {
  title: 'Financial Analytics — Jumari Blignaut',
  description:
    'Financial analytics demo with revenue, profit, cash flow, and budget charts. Illustrative figures for a software engineering portfolio, not real client data.',
  path: '/dashboard/financial',
};

export const PROJECT_PORTFOLIO_SEO: PageSeo = {
  title: 'Project Portfolio — Jumari Blignaut',
  description:
    'Interactive charts of project work — technology mix, categories, and timeline — from the Jumari Blignaut software engineering portfolio.',
  path: '/dashboard/projects',
};
