export interface NavLink {
  id: string;
  label: string;
  /** In-app route. Section links omit this and scroll to `id`. */
  route?: string;
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

/** Optional visual proof for a capability chapter — only when the shot earns the space. */
export interface ProjectVisual {
  image: string;
  imageAlt: string;
  /** e.g. Laptop · 1024px / Phone · 320px */
  caption?: string;
  frameClass?: string;
  /** Device frame used in the showcase stage. */
  device?: 'laptop' | 'phone';
}
/**
 * A capability chapter on the project detail page.
 * Most chapters are discussion-only; charts and a few highlights may carry visuals.
 */
export interface ProjectCapability {
  title: string;
  detail: string;
  href?: string;
  linkLabel?: string;
  /** Pull-quote / note shown beside copy when the chapter has no screenshot. */
  callout?: string;
  visuals?: ProjectVisual[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  /** Longer intro shown on the project detail route. */
  detailSummary?: string;
  tech: string[];
  features: string[];
  /** Optional build / deploy / host breakdown shown on project cards. */
  delivery?: ProjectDelivery;
  /** Capability chapters on the project detail page. */
  capabilities?: ProjectCapability[];
  /** Home-card preview shots when there is no detail page yet. */
  previewVisuals?: ProjectVisual[];
  previewLabel: string;
  featured?: boolean;
  actions: ProjectAction[];
}

export interface ProjectCardView extends ProjectItem {
  previewClass: string;
  actionViews: ProjectActionView[];
  /** First few highlight shots for the home card strip. */
  overviewShots: ProjectVisual[];
  /** Short feature list shown on the home card. */
  cardFeatures: string[];
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
