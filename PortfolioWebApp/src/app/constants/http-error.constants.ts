/** Human-readable HTTP status phrases for load/error UI (not agent-specific copy). */
export const HTTP_STATUS_PHRASE: Record<number, string> = {
  0: 'Cannot reach the API — is PortfolioAPI running?',
  400: 'Bad request (400)',
  401: 'Unauthorized (401)',
  403: 'Forbidden (403)',
  404: 'Not found (404)',
  408: 'Request timed out (408)',
  429: 'Too many requests (429) — wait a moment and try again',
  500: 'Server error (500)',
  502: 'Bad gateway (502) — the API server may be down',
  503: 'Service unavailable (503) — the API may be restarting',
  504: 'Gateway timeout (504)',
};

export const HTTP_STATUS_PHRASE_UNKNOWN = (status: number): string =>
  `Request failed (HTTP ${status})`;
