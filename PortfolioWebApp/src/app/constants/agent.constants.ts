/** Sample chips for the portfolio agent — keep aligned with AgentRouter intents. */
export const AGENT_SAMPLE_PROMPTS = [
  'Who is Jumari?',
  'What are you working on right now?',
  "What's your tech stack?",
  'How experienced is she?',
  'Where has Jumari worked?',
  'What do you want in your next job?',
  'When can you start?',
  'Do you prefer remote?',
  "What's her best project?",
  'What project are you most proud of?',
  'Tell me about EasyEquities',
  'What was your contribution on EasyEquities?',
  'Frontend or full-stack?',
  'Have you worked in fintech?',
  'Tell me about CypherFuel',
  'Tell me about Veld Supply',
  'Top technologies?',
  'How many projects?',
] as const;

export type AgentSamplePrompt = (typeof AGENT_SAMPLE_PROMPTS)[number];
