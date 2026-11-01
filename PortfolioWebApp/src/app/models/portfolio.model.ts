export interface NavLink {
  id: string;
  label: string;
}

export type ProjectActionLinkKind = 'route' | 'hash' | 'external' | 'disabled';

export interface ProjectAction {
  label: string;
  url: string;
  primary?: boolean;
}

export interface ProjectActionView extends ProjectAction {
  linkKind: ProjectActionLinkKind;
}

export interface ProjectDelivery {
  /** Languages, frameworks, and libraries used to build it. */
  code: string;
  /** How releases get to the environment (CI/CD, manual publish, stores). */
  deploy: string;
  /** Where the live app and data run. */
  host: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  tech: string[];
  features: string[];
  /** Optional build / deploy / host breakdown shown on project cards. */
  delivery?: ProjectDelivery;
  previewLabel: string;
  featured?: boolean;
  actions: ProjectAction[];
}

export interface ProjectCardView extends ProjectItem {
  previewClass: string;
  actionViews: ProjectActionView[];
}

export interface ExperienceSection {
  title: string;
  summary?: string;
  tech?: string[];
  bullets: string[];
  /** Public product / programme link from the CV, when available. */
  url?: string;
  urlLabel?: string;
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
  /** Public organisation link from the CV, when available. */
  url?: string;
  urlLabel?: string;
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
