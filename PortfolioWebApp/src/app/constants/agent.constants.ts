/** Sample chips for the portfolio agent — keep aligned with AgentRouter intents. */
export const AGENT_SAMPLE_PROMPTS = [
  'Who is Jumari?',
  "What's your tech stack?",
  "What's her best project?",
] as const;

export type AgentSamplePrompt = (typeof AGENT_SAMPLE_PROMPTS)[number];
