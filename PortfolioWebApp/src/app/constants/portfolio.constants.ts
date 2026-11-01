import { environment } from '../../environments/environment';
import {
  AboutContent,
  ExperienceItem,
  NavLink,
  ProjectCapability,
  ProjectItem,
  SkillGroup,
} from '../models/portfolio.model';

const veldSupplyOrigin = environment.projects.veldSupplyUrl;

/** Few curated visuals + discussion-first chapters (Linear-style product storytelling). */
function veldSupplyCapabilities(): ProjectCapability[] {
  return [
    {
      title: 'One storefront. Two widths.',
      detail:
        'Laptop and phone are the same Angular app — not a separate mobile site. At ~1024px the hero runs as a wide composition with a featured product card; at ~320px navigation, search, and CTAs stack into a single readable column. Layouts reflow; the catalogue and checkout stay on one codebase.',
      href: `${veldSupplyOrigin}/`,
      linkLabel: 'Open live shop',
      visuals: [
        {
          image: '/projects/veld-supply/home-1024.jpg',
          imageAlt: 'Veld Supply home hero on a laptop-width viewport',
          caption: 'Laptop · 1024px',
          device: 'laptop',
        },
        {
          image: '/projects/veld-supply/home-320.png',
          imageAlt: 'Veld Supply home hero on a phone-width viewport with search',
          caption: 'Phone · 320px',
          device: 'phone',
        },
      ],
    },
    {
      title: 'Clients cannot buy more than stock',
      detail:
        'Every product shows on-hand count. The quantity stepper stops at available units — here the bag is capped at 23 when stock is 23. The UI is only the first gate: cart and checkout APIs re-check inventory and reject oversells, so a stale tab cannot promise gear that is already gone.',
      href: `${veldSupplyOrigin}/product/VS-OPT-1042`,
      linkLabel: 'Open a product',
      visuals: [
        {
          image: '/projects/veld-supply/product-stock-1024.png',
          imageAlt: 'Product page with quantity set to 23 matching units in stock',
          caption: 'Laptop · stock-capped quantity',
          frameClass: 'object-top',
          device: 'laptop',
        },
      ],
    },
    {
      title: 'Admin stays behind the role wall',
      detail:
        'Shop routes are public or customer-scoped. Admin routes (/admin/orders, products, sales, stock) require an authenticated admin claim — a client session is redirected to sign-in and never receives the desk UI or its APIs. Authorisation is enforced on the server from the JWT, not from a “hide the menu” trick on the client.',
      href: `${veldSupplyOrigin}/admin/orders`,
      linkLabel: 'Try the admin desk',
      callout: 'JWT role claim on the API — not a hidden nav item — decides who reaches the desk.',
    },
    {
      title: 'Search and find gear',
      detail:
        'On narrower layouts the shop exposes a dedicated Search gear field above the hero so buyers can jump straight to optics, apparel, or kit without hunting through categories. Desktop keeps category and featured paths front and centre; phone puts search within thumb reach.',
      href: `${veldSupplyOrigin}/shop`,
      linkLabel: 'Open the shop',
      callout: 'Same catalogue, different chrome — search sits in the thumb zone on ~320px.',
    },
    {
      title: 'Sales division, with charts',
      detail:
        'Paid orders only. The desk opens on period KPIs, then charts profit across months, sales versus profit, and contribution by category — so margin and mix are visible without exporting a spreadsheet.',
      href: `${veldSupplyOrigin}/admin/sales`,
      linkLabel: 'Open sales',
      visuals: [
        {
          image: '/projects/veld-supply/sales-admin-1024.png',
          imageAlt: 'Admin sales desk with KPIs and profit bar chart',
          caption: 'Admin · sales overview',
          device: 'laptop',
        },
        {
          image: '/projects/veld-supply/sales-charts-1024.png',
          imageAlt: 'Admin sales charts for margin, sales versus profit, and category',
          caption: 'Admin · sales charts',
          device: 'laptop',
        },
      ],
    },
    {
      title: 'Catalogue: add and edit products',
      detail:
        'Admins create and update SKUs in place — name, SKU prefix, category, pricing, optics attributes, and stock — without a separate CMS. Soft-remove keeps historical orders intact while taking a product off the shop floor.',
      href: `${veldSupplyOrigin}/admin/products`,
      linkLabel: 'Open products',
      callout: 'One products desk for create, edit, stock, and soft-remove — no separate CMS.',
    },
    {
      title: 'PayFast checkout, amounts fixed on the server',
      detail:
        'Card numbers never touch the shop. Checkout continues on PayFast; the payable amount is computed and signed on the API so the client cannot rewrite the total. An order only counts as paid after a matching PayFast signature.',
      href: `${veldSupplyOrigin}/product/VS-OPT-1042`,
      linkLabel: 'See checkout note',
      callout: 'Payable total is signed on the server. The browser never gets to invent the price.',
    },
    {
      title: 'Account fields for delivery',
      detail:
        'Signed-in buyers keep personal and delivery details — name, email, phone, address — so checkout is not a blank form every time. The same account model feeds orders; admin accounts additionally unlock the desk.',
      href: `${veldSupplyOrigin}/account`,
      linkLabel: 'Open account',
      callout: 'One account model for delivery details and, when the role allows, the admin desk.',
    },
  ];
}

export const NAV_LINKS: NavLink[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'overview', label: 'Overview' },
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
    detailSummary:
      'A South African shop and admin desk in one product — responsive from phone to laptop, stock-capped carts, role-gated admin, PayFast checkout, and a sales division with real charts.',
    tech: ['Angular', 'TypeScript', 'ASP.NET Core', 'EF Core', 'SQL Server', 'Azure', 'PayFast'],
    features: [
      'Responsive storefront from ~320px phone to ~1024px laptop',
      'Quantity and checkout capped by on-hand stock (API-enforced)',
      'Admin routes gated by role — clients never see the desk',
      'Sales KPIs plus profit and category charts',
      'Product add/edit, PayFast checkout, account delivery fields',
    ],
    capabilities: veldSupplyCapabilities(),
    delivery: {
      code: 'Angular + TypeScript SPA, ASP.NET Core Web API, Entity Framework Core, SQL Server.',
      deploy:
        'GitHub Actions on the release branch — build the SPA and API, package them together, zip-deploy to Azure.',
      host: 'Azure App Service for the web app/API and Azure SQL for the store database.',
    },
    previewLabel: 'Commerce platform',
    previewVisuals: [
      {
        image: '/projects/veld-supply/home-1024.jpg',
        imageAlt: 'Veld Supply storefront on a laptop-width viewport',
        caption: 'Laptop · 1024px',
        device: 'laptop',
      },
      {
        image: '/projects/veld-supply/home-320.png',
        imageAlt: 'Veld Supply storefront on a phone-width viewport',
        caption: 'Phone · 320px',
        device: 'phone',
      },
    ],
    featured: true,
    actions: [
      {
        label: 'View details',
        url: '/projects/veld-supply',
        primary: true,
      },
      {
        label: environment.projects.veldSupplyUrl ? 'Open live site' : 'Open live site — Coming soon',
        url: environment.projects.veldSupplyUrl,
      },
    ],
  },
  {
    id: 'accountant-app',
    name: 'Accountant App',
    description:
      'Firm workspace for client work and deadlines — one ASP.NET Core API shared by an Angular admin desk and a mobile client. Admins manage memberships, client records, documents, and tax obligations; clients sign in with the contact email the firm has on file.',
    tech: ['Angular', 'TypeScript', 'ASP.NET Core', 'EF Core', 'SQL Server', 'Mobile', 'Azure'],
    features: [
      'Firm workspace: clients, documents, obligations, and settings in one admin shell',
      'Client profiles with type, reference, contact, and active status — add, edit, remove',
      'Create-firm / sign-in flow for accountants; owner role on the desk',
      'Mobile client portal against the same API — clients set their own password',
      'Shared SQL database so admin and client stay in sync',
    ],
    previewVisuals: [
      {
        image: '/projects/accountant-app/admin-clients-1024.png',
        imageAlt: 'Accountant Admin clients desk with active client list',
        caption: 'Admin clients · laptop',
        frameClass: 'object-top',
        device: 'laptop',
      },
      {
        image: '/projects/accountant-app/client-signin-320.png',
        imageAlt: 'Accountant Client sign-in on a phone-width viewport',
        caption: 'Client · phone',
        frameClass: 'object-top',
        device: 'phone',
      },
      {
        image: '/projects/accountant-app/admin-signin-1024.png',
        imageAlt: 'Accountant Admin sign-in workspace',
        caption: 'Admin sign-in · laptop',
        frameClass: 'object-top',
        device: 'laptop',
      },
    ],
    delivery: {
      code: 'Angular admin SPA + mobile client, shared ASP.NET Core Web API, EF Core, SQL Server.',
      deploy:
        'Admin web and API published to Azure; mobile client targets the same hosted API.',
      host: 'Azure App Service for admin/API; shared Azure SQL (or cloud SQL) for firm and client data.',
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
      'This site — Angular marketing pages, financial and project analytics with Highcharts, and an in-process AI agent for grounded Q&A. One ASP.NET Core host serves the SPA from wwwroot; one SQL database backs overview metrics, analytics seed data, and agent tool results.',
    detailSummary:
      'This portfolio site ships marketing pages, financial and project analytics with Highcharts, and an in-process AI agent with allowlisted tools — one ASP.NET Core host serving the SPA from wwwroot and one SQL database.',
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
      'Responsive portfolio home with desktop and mobile layouts',
      'Financial KPIs and multi-chart demo in ZAR',
      'Project portfolio analytics — mix, categories, and technology matrix',
      'In-process AI agent with allowlisted tools — no raw SQL from the client',
      'SPA copied into API wwwroot and zip-deployed with the backend',
    ],
    delivery: {
      code: 'Angular + Tailwind SPA, ASP.NET Core Web API, EF Core migrations/seed, Highcharts, in-process analytics agent (no separate agent host).',
      deploy:
        'GitHub Actions on release — pnpm build the SPA, dotnet publish the API, copy the SPA into api/wwwroot, zip-deploy with the Azure publish profile.',
      host: 'Single Azure App Service (Linux) for site + API + agent; Azure SQL for UAT; SQL Server LocalDB for local development.',
    },
    previewLabel: 'Site + analytics',
    previewVisuals: [
      {
        image: '/projects/jumari-portfolio/home-1024.jpg',
        imageAlt: 'Jumari Portfolio home hero on a laptop-width viewport',
        caption: 'Laptop · home',
        device: 'laptop',
      },
      {
        image: '/projects/jumari-portfolio/analytics-320.png',
        imageAlt: 'Project portfolio analytics on a phone-width viewport',
        caption: 'Phone · analytics',
        device: 'phone',
      },
    ],
    actions: [
      {
        label: 'View details',
        url: '/projects/portfolio-dashboard',
        primary: true,
      },
      {
        label: 'Explore Analytics Dashboard',
        url: '/dashboard',
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
