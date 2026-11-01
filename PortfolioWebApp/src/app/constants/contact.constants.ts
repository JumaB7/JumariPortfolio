export const CONTACT_LIMITS = {
  nameMax: 120,
  emailMax: 200,
  messageMin: 10,
  messageMax: 4000,
} as const;

export const CONTACT_STATUS_MESSAGES = {
  sent: 'Message sent. I’ll get back to you soon.',
  error: 'Could not send right now. Please email me directly.',
} as const;
