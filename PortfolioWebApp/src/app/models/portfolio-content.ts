import { environment } from '../../environments/environment';
import {
  AboutContent,
  ExperienceItem,
  NavLink,
  ProjectItem,
  SkillGroup,
} from './portfolio.model';

export const NAV_LINKS: NavLink[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'contact', label: 'Contact' },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: 'Frontend',
    skills: ['Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind'],
  },
  {
    title: 'Backend',
    skills: ['C#', 'ASP.NET Core', 'PHP', 'REST APIs', 'Node.js'],
  },
  {
    title: 'Databases',
    skills: ['SQL Server', 'SQL', 'Database design'],
  },
  {
    title: 'Tools & Platforms',
    skills: ['Git', 'Azure', 'Visual Studio', 'VS Code', 'Highcharts'],
  },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: 'veld-supply',
    name: 'Veld Supply',
    description:
      'Standalone South African e-commerce application with its own ASP.NET Core API and SQL Server database.',
    tech: ['Angular', 'ASP.NET Core', 'SQL Server', 'Azure'],
    features: ['Shop + admin in one app', 'PayFast checkout', 'Stock and order workflows'],
    previewLabel: 'Commerce platform',
    featured: true,
    actions: [
      {
        label: environment.projects.veldSupplyUrl ? 'View Project' : 'View Project — Coming soon',
        url: environment.projects.veldSupplyUrl,
        primary: true,
      },
    ],
  },
  {
    id: 'accountant-app',
    name: 'Accountant App',
    description:
      'Accounting platform with a shared backend for an admin dashboard web app and a mobile application.',
    tech: ['Angular', 'ASP.NET Core', 'SQL Server', 'Mobile'],
    features: ['Shared API and database', 'Admin dashboard', 'Mobile client'],
    previewLabel: 'Admin + mobile',
    actions: [
      {
        label: environment.projects.accountantAdminUrl
          ? 'Open Admin Dashboard'
          : 'Open Admin Dashboard — Coming soon',
        url: environment.projects.accountantAdminUrl,
        primary: true,
      },
      {
        label: environment.projects.accountantMobileUrl
          ? 'View Mobile App'
          : 'View Mobile App — Coming soon',
        url: environment.projects.accountantMobileUrl,
      },
    ],
  },
  {
    id: 'portfolio-dashboard',
    name: 'Portfolio Dashboard',
    description:
      'Data dashboard inside this portfolio, powered by the portfolio API and its own SQL Server database.',
    tech: ['Angular', 'Highcharts', 'ASP.NET Core', 'SQL Server'],
    features: [
      'Portfolio statistics',
      'API-backed charts',
      'Isolated from other project databases',
    ],
    previewLabel: 'Analytics view',
    actions: [
      {
        label: 'Explore Analytics Dashboard',
        url: '/dashboard',
        primary: true,
      },
    ],
  },
];

export const EXPERIENCE: ExperienceItem[] = [
  {
    title: 'Software Engineer',
    organization: 'Matogen',
    dates: '01/2023 – Present',
    location: 'Potchefstroom, South Africa',
    description:
      'Contributed to the development and maintenance of software solutions across multiple industries, including financial technology, higher education, fleet telematics and workflow automation.',
    tech: ['Angular', 'C#', '.NET', 'TypeScript', 'Highcharts', 'NestJS', 'SQL', 'Azure'],
    sections: [
      {
        title: 'Purple Group — EasyEquities and EasyID Web Applications',
        tech: [
          'Angular',
          'Tailwind CSS',
          'Node.js',
          'C#',
          '.NET Framework',
          'Highcharts',
          'Swagger',
          'Git',
        ],
        bullets: [
          'Contributed to the development and maintenance of web applications for EasyEquities and EasyID, working across interconnected projects and shared libraries.',
          'Developed and maintained frontend and backend functionality using Angular, Node.js, C# and .NET Framework.',
          'Implemented and enhanced interactive data visualizations using Highcharts, including graph styling and interactive functionality.',
          'Investigated and resolved software defects, maintained existing features, and contributed to application improvements.',
        ],
      },
      {
        title: 'North-West University — WISL',
        tech: ['PHP', 'Angular', 'SQL', 'Dropinbase', 'Docker'],
        bullets: [
          'Contributed to the development and maintenance of the WISL web application.',
          'Worked with frontend, backend and database technologies as part of the development team.',
        ],
      },
      {
        title: 'CypherFuel — Fleet Telematics',
        summary:
          'As part of a development team, worked on a multi-tenant fleet telematics application used to ingest, process and visualize high-volume vehicle data for truck fleets; covering fuel efficiency, trip analysis and driver/vehicle performance scoring.',
        tech: ['Angular', 'NestJS', 'Node.js', 'TypeScript', 'Chart.js', 'Firebase / Firestore'],
        bullets: [
          'Built and maintained Angular UI for fleet dashboards, per-vehicle and per-day views, trip-related screens and interactive charts, including styling, responsive layout and usability improvements across the application.',
          'Worked with raw telematics and trip data (GPS, CAN bus / vehicle IO, odometer and related counters) and implemented logic to transform that data into operational metrics.',
          'Developed and refined scoring and calculation models across driving, vehicle, environmental and road factors; including weighting logic, odometer/CAN odometer handling, payload, road classification, altitude/elevation, ambient conditions and related trip metrics; so results could be displayed accurately in the application.',
          'Contributed to NestJS services supporting telematics processing, scoring and summary generation used by the frontend.',
        ],
      },
      {
        title: 'Jira Workflow Automation — Matogen Zebra',
        summary: 'Short-term project',
        tech: ['SQL', 'Jira', 'Docker'],
        bullets: [
          'Independently developed an automated system to manage workshop orders and Jira tickets.',
        ],
      },
    ],
  },
  {
    title: 'Bachelor of Engineering in Computer and Electronic Engineering',
    organization: 'North-West University',
    dates: '2019 – 2022',
    location: 'Potchefstroom, South Africa',
    description: 'Academic achievement: Graduated with Distinction.',
    tech: ['Engineering'],
  },
  {
    title: 'A Serious Game for Children with Fetal Alcohol Syndrome',
    organization: 'North-West University',
    dates: '01/2022 – 11/2022',
    location: 'Potchefstroom, South Africa',
    description:
      'Additional project completed alongside the Bachelor of Engineering degree.',
    tech: ['Unity', 'Android'],
    bullets: [
      'Designed and implemented an Android mobile game using Unity to support children with Fetal Alcohol Syndrome.',
      'Developed gameplay targeting attention, motor skills and impulse control, including dynamic difficulty adjustment based on player performance.',
      'Conducted informal testing as part of the project evaluation.',
    ],
  },
];

export const ABOUT: AboutContent = {
  summary: [
    'Full-Stack Software Engineer with nearly four years of professional experience developing and maintaining web applications across financial technology, higher education and fleet telematics. Experienced in frontend and backend development, with a strong technical foundation in C#, .NET, Angular, TypeScript and SQL.',
    'Skilled in building application features, integrating databases and APIs, developing interactive data visualisations, and troubleshooting complex software issues. Comfortable working with established codebases, shared libraries and collaborative development teams. Holds a Bachelor of Engineering in Computer and Electronic Engineering from North-West University, completed with distinction.',
  ],
  highlights: [
    {
      label: 'Education',
      value: 'BEng Computer & Electronic Engineering — NWU (Distinction)',
    },
    { label: 'Experience', value: 'Nearly 4 years professional' },
    { label: 'Focus', value: 'Angular · ASP.NET · SQL Server · Azure' },
    { label: 'Based in', value: 'Potchefstroom, South Africa' },
  ],
};
