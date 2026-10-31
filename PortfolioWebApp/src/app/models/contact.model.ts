export interface ContactRequest {
  name: string;
  email: string;
  message: string;
}

export type ContactStatus = 'sent' | 'error' | null;
