export interface NavLink {
  id: string;
  label: string;
}

export interface ProjectAction {
  label: string;
  url: string;
  primary?: boolean;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  tech: string[];
  features: string[];
  previewLabel: string;
  featured?: boolean;
  actions: ProjectAction[];
}

export interface ExperienceSection {
  title: string;
  summary?: string;
  tech?: string[];
  bullets: string[];
}

export interface ExperienceItem {
  title: string;
  organization: string;
  dates: string;
  location?: string;
  description: string;
  bullets?: string[];
  sections?: ExperienceSection[];
  tech: string[];
}

export interface SkillGroup {
  title: string;
  skills: string[];
}

export interface AboutHighlight {
  label: string;
  value: string;
}

export interface AboutContent {
  summary: string[];
  highlights: AboutHighlight[];
}
