export type ErrorPageCode = 404 | 500;

export interface ErrorPageCopy {
  readonly code: ErrorPageCode;
  readonly eyebrow: string;
  readonly title: string;
  readonly message: string;
  readonly primaryLabel: string;
  readonly primaryLink: string;
  readonly secondaryLabel: string;
  readonly secondaryLink: string;
}

export const ERROR_PAGE_COPY: Record<ErrorPageCode, ErrorPageCopy> = {
  404: {
    code: 404,
    eyebrow: 'Not found',
    title: 'This page is not on the map',
    message:
      'The link may be outdated, or that route does not exist on this portfolio. Head home or browse the projects instead.',
    primaryLabel: 'Back to home',
    primaryLink: '/',
    secondaryLabel: 'View projects',
    secondaryLink: '/#projects',
  },
  500: {
    code: 500,
    eyebrow: 'Server error',
    title: 'Something went wrong on our side',
    message:
      'The request failed unexpectedly. Try again in a moment. If it keeps happening, email me and I will take a look.',
    primaryLabel: 'Back to home',
    primaryLink: '/',
    secondaryLabel: 'Contact',
    secondaryLink: '/#contact',
  },
} as const;

export const DEFAULT_ERROR_PAGE_CODE: ErrorPageCode = 404;
