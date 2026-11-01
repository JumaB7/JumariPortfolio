import { environment } from '../../environments/environment';
import {
  AboutContent,
  ExperienceItem,
  NavLink,
  ProjectItem,
  SkillGroup,
} from '../models/portfolio.model';

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
      'Standalone South African e-commerce application with its own ASP.NET Core API and SQL Server database — shop and admin in one product.',
    tech: ['Angular', 'TypeScript', 'ASP.NET Core', 'EF Core', 'SQL Server', 'Azure', 'PayFast'],
    features: [
      'Shop + admin in one Angular app',
      'PayFast checkout',
      'Stock and order workflows',
      'Own API and database, separate from other projects',
    ],
    delivery: {
      code: 'Angular + TypeScript SPA, ASP.NET Core Web API, Entity Framework Core, SQL Server.',
      deploy:
        'GitHub Actions on the release branch — build the SPA and API, package them together, zip-deploy to Azure.',
      host: 'Azure App Service for the web app/API and Azure SQL for the store database.',
    },
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
      'Accounting platform with one shared ASP.NET Core backend powering an admin dashboard web app and a mobile client.',
    tech: ['Angular', 'TypeScript', 'ASP.NET Core', 'SQL Server', 'Mobile'],
    features: [
      'Shared API and database for web + mobile',
      'Admin dashboard for day-to-day accounting work',
      'Mobile client against the same backend',
    ],
    delivery: {
      code: 'Angular admin SPA, mobile client, shared ASP.NET Core Web API, SQL Server.',
      deploy: 'Admin web/API published to Azure; mobile client points at the shared hosted API.',
      host: 'Azure-hosted API and admin dashboard; mobile app uses the same cloud database.',
    },
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
    name: 'Jumari Portfolio',
    description:
      'This site: Angular marketing pages, financial and project analytics with Highcharts, and an in-process AI agent for grounded Q&A — one ASP.NET Core host and one SQL database.',
    tech: [
      'Angular',
      'Tailwind CSS',
      'Highcharts',
      'ASP.NET Core',
      'EF Core',
      'SQL Server',
      'GitHub Actions',
      'Azure',
    ],
    features: [
      'Responsive portfolio home (desktop + mobile layouts)',
      'Financial KPIs and multi-chart demo (ZAR)',
      'Project portfolio analytics view',
      'Custom AI agent with allowlisted tools — no raw SQL',
      'SPA served from the API wwwroot in production',
    ],
    delivery: {
      code: 'Angular + Tailwind frontend, ASP.NET Core Web API, EF Core migrations/seed, Highcharts, in-process analytics agent (no separate agent host).',
      deploy:
        'GitHub Actions on release — pnpm build the SPA, dotnet publish the API, copy the SPA into api/wwwroot, zip-deploy with the Azure publish profile.',
      host: 'Single Azure App Service (Linux) for site + API + agent; Azure SQL for UAT; SQL Server LocalDB for local development.',
    },
    previewLabel: 'Site + analytics',
    actions: [
      {
        label: 'Explore Analytics Dashboard',
        url: '/dashboard',
        primary: true,
      },
      {
        label: 'Ask the AI agent',
        url: '/dashboard/agent',
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
    url: 'https://matogen.com/',
    urlLabel: 'matogen.com',
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
        url: 'https://www.easyequities.co.za/',
        urlLabel: 'easyequities.co.za',
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
        url: 'https://services.nwu.ac.za/centre-teaching-and-learning-ctl/work-integrated-and-service-learning-wisl',
        urlLabel: 'NWU WISL',
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
        url: 'https://cypherfuel.com/',
        urlLabel: 'cypherfuel.com',
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
        url: 'https://matogen.com/',
        urlLabel: 'matogen.com',
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
    url: 'https://www.nwu.ac.za/',
    urlLabel: 'nwu.ac.za',
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
