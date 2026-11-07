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
      'An e-commerce website I built from the ground up, with a customer storefront and an admin area for managing products, orders and sales. It includes a shopping cart, stock management and PayFast checkout.',
    detailSummary:
      'I built the Angular storefront and .NET API, connected the application to SQL Server, and deployed it to Azure. The project includes customer and admin functionality, stock checks, payment integration and sales charts.',
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
      "A web and mobile application I'm developing for accounting firms. It gives firms a place to manage clients, documents and tax deadlines, while clients can use a mobile portal to access their information and submit documents.",
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
      'My personal portfolio website, where I showcase my work and experiment with different technologies. It includes an analytics dashboard with interactive Highcharts visualisations and an AI agent.',
    detailSummary:
      'I built the Angular frontend and ASP.NET Core backend, with SQL Server handling the data. The dashboard gives visitors a closer look at the projects and analytics behind the portfolio.',
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
      'Worked on several software projects across financial technology, higher education, fleet management and workflow automation. My work has included building application features, integrating APIs, working with databases, developing interactive charts and maintaining existing applications.',
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
          'Worked on the EasyEquities and EasyID applications as part of the development team.',
          'Developed frontend components and backend functionality using Angular, Node.js, C# and .NET.',
          'Integrated API endpoints, fixed bugs and updated existing features and shared components.',
          'Developed and maintained interactive Highcharts visualisations, including chart layouts, styling and functionality.',
        ],
      },
      {
        title: 'North-West University — WISL',
        tech: ['PHP', 'Angular', 'SQL', 'Dropinbase', 'Docker'],
        url: 'https://services.nwu.ac.za/centre-teaching-and-learning-ctl/work-integrated-and-service-learning-wisl',
        urlLabel: 'NWU WISL',
        bullets: [
          'Worked on the Work Integrated and Service Learning (WISL) application.',
          'Worked across the frontend, backend and database, using Angular, PHP and SQL.',
          'Used Dropinbase alongside Angular, PHP and SQL to develop and maintain application functionality.',
        ],
      },
      {
        title: 'CypherFuel — Fleet Telematics',
        summary:
          'Worked on a fleet management application that processes vehicle and trip data to help monitor fuel efficiency and driver performance.',
        tech: ['Angular', 'NestJS', 'Node.js', 'TypeScript', 'Chart.js', 'Firebase / Firestore'],
        url: 'https://cypherfuel.com/',
        urlLabel: 'cypherfuel.com',
        bullets: [
          'Developed and maintained Angular dashboards, vehicle views, trip screens and interactive charts.',
          'Worked with vehicle data from GPS, CAN bus and odometer readings to calculate useful trip and vehicle metrics.',
          'Implemented and refined scoring calculations involving driving behaviour, vehicle performance, road conditions, payload and environmental factors.',
          'Contributed to NestJS services used for telematics processing, scoring and generating summaries for the frontend.',
        ],
      },
      {
        title: 'Jira Workflow Automation — Matogen Zebra',
        summary:
          'A short-term project focused on automating workshop orders and Jira ticket management.',
        tech: ['Laravel', 'PHP', 'SQL', 'Jira', 'Docker'],
        url: 'https://matogen.com/',
        urlLabel: 'matogen.com',
        bullets: [
          'Independently developed a system using Laravel to automate workshop orders and Jira ticket management.',
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
      'A final-year engineering project where I developed an Android game using Unity, designed to support children with Fetal Alcohol Syndrome.',
    tech: ['Unity', 'Android'],
    bullets: [
      'Developed gameplay targeting attention, motor skills and impulse control, including dynamic difficulty adjustment based on player performance.',
      'Conducted informal testing as part of the project evaluation.',
    ],
  },
];

export const ABOUT: AboutContent = {
  summary: [
    "I'm a software engineer based in Potchefstroom, South Africa, with around four years of professional experience. I've worked on applications in financial technology, higher education and fleet management, contributing to both frontend and backend development.",
    "Most of my day-to-day work has involved Angular, TypeScript, C#, .NET and SQL. I've also worked with PHP, Node.js and different data visualisation libraries. I enjoy working through technical problems, especially when there's data, calculations or a tricky piece of functionality to figure out.",
  ],
  highlights: [
    {
      label: 'Education',
      value: 'BEng Computer & Electronic Engineering — NWU (Distinction)',
    },
    { label: 'Experience', value: 'Around 4 years' },
    { label: 'Focus', value: 'Angular · ASP.NET · SQL Server · Azure' },
    { label: 'Based in', value: 'Potchefstroom, South Africa' },
  ],
};
