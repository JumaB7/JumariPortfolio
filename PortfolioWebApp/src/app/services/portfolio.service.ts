import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  ABOUT,
  EXPERIENCE,
  NAV_LINKS,
  PROJECTS,
  SKILL_GROUPS,
} from '../models/portfolio-content';
import {
  AboutContent,
  ExperienceItem,
  NavLink,
  ProjectItem,
  SkillGroup,
} from '../models/portfolio.model';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  readonly navLinks: NavLink[] = NAV_LINKS;
  readonly about: AboutContent = ABOUT;
  readonly skillGroups: SkillGroup[] = SKILL_GROUPS;
  readonly projects: ProjectItem[] = PROJECTS;
  readonly experience: ExperienceItem[] = EXPERIENCE;

  readonly email = environment.email;
  readonly linkedInUrl = environment.linkedInUrl;
  readonly githubUrl = environment.githubUrl;
  readonly cvUrl = environment.cvUrl;
  readonly footerLinks = NAV_LINKS.slice(0, 5);
  readonly year = new Date().getFullYear();
}
