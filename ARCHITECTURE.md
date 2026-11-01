# Jumari Portfolio — Architecture & Integration Guide

This document explains how the portfolio site is built, how the pieces talk to each other, and why those choices were made. It is written for someone reviewing the project (hiring, peer review, or future you).

---

## 1. What this product is

**JumariPortfolio** is a personal portfolio: a public site that presents who Jumari is, skills, experience, and project showcases, plus interactive analytics dashboards and a grounded “portfolio agent” chat.

It is intentionally a **full-stack showcase**, not a static brochure. The same SQL-backed content powers:

- the home page and project cards
- Highcharts analytics (projects + financial demo)
- the in-process agent that answers questions about that data

Deploy target: **one Azure App Service** (same pattern as Veld Supply) — the Angular SPA is published into the API’s `wwwroot`, and the API serves both REST and the SPA.

---

## 2. High-level architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (Angular 22 SPA — PortfolioWebApp)                  │
│  Home · Project detail · Analytics · Agent FAB/chat          │
└───────────────────────────┬─────────────────────────────────┘
                            │  HTTP /api/*  (proxy in local)
┌───────────────────────────▼─────────────────────────────────┐
│  ASP.NET Core API (PortfolioAPI, .NET 10)                    │
│  Controllers → Services → EF Core → SQL Server               │
│  Agent: Router → Tools → Answer templates (in-process)       │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  SQL Server                                                  │
│  LocalDB PortfolioLocal · Azure SQL PortfolioUat / Prod      │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Project | Role |
| --- | --- | --- |
| Frontend | `PortfolioWebApp/` | SPA UI, charts, agent chat, contact form |
| Backend | `PortfolioAPI/` | REST API, EF Core, seed data, agent orchestration |
| Data | SQL Server | Profile, skills, experience, projects, financial demo rows |

There is **no separate FastAPI / Python agent host**. The agent lives inside `PortfolioAPI` so one App Service can deploy everything.

---

## 3. Languages & toolchain

| Area | Language / tool | Version (approx.) | Why |
| --- | --- | --- | --- |
| UI | **TypeScript** | ~6.0 | Typed Angular app; models mirror API contracts |
| UI framework | **Angular** | ^22.2 | Component architecture, router, forms, HTTP, signals |
| Styling | **Tailwind CSS** | ^4.3 (+ PostCSS) | Utility-first, design tokens via `@theme`, no feature SCSS |
| Charts | **Highcharts** + `highcharts-angular` | ^13 / ^5 | Heatmap, xrange, exporting, accessibility modules |
| Layout helpers | **Angular CDK** | ^22.2 | `BreakpointObserver` for desktop/mobile host |
| Package manager | **pnpm** | 10.33 | Repo convention; lockfile + speed |
| API | **C#** | .NET **10** | Controllers, DI, EF Core, Swagger |
| ORM | **EF Core SQL Server** | 10.0.14 | Migrations, seed, typed queries |
| API docs | **Swashbuckle** | 10.3 | Local Swagger UI |
| Tests (FE) | **Vitest** + jsdom | ^5 | Angular’s current test runner setup |
| CI | **GitHub Actions** | `portfolio.yml` | Build API + SPA; deploy UAT on `release` |

### Why Angular (not React / plain HTML)

- Strong fit for a **multi-view** product: home, project detail, nested analytics dashboard, agent UI.
- Built-in **router**, **reactive forms**, **HTTP client**, and **dependency injection** without bolting on a mini-framework.
- Aligns with day-to-day professional stack (same patterns used at work: standalone components, OnPush, signals).
- Desktop/mobile **shared base class + breakpoint host** is a natural Angular pattern and keeps one data path for two templates.

### Why TypeScript

- Shared mental model with C# contracts: DTOs on the API, interfaces/enums on the FE.
- Safer refactors when agent responses, chart series, and project cards evolve together.

### Why Tailwind (not SCSS/CSS modules per feature)

- Portfolio UI is **token + utility** driven: cyan accents, spacing scale, responsive breakpoints.
- Tailwind v4 `@import 'tailwindcss'` + `@theme` maps CSS variables once; components use scale classes (`text-sm`, `gap-3`, `min-h-9!`) instead of one-off hex and rem values.
- Global `styles.css` still holds **design-system** pieces that utilities alone can’t express cleanly: aurora masks, device frames, reveal keyframes, select chevrons — not per-feature SCSS files.
- Important modifier convention for v4: trailing `!` (e.g. `min-h-9!`), not leading `!`.

### Why C# / ASP.NET Core

- Same ecosystem as other portfolio/product backends (Veld Supply style host).
- First-class **SQL Server** + EF Core migrations.
- Agent can call the same `PortfolioContentService` the dashboards use — one source of truth, no duplicated JSON files for chat.

### Why SQL Server (not only static JSON)

- Seeded showcase data is **queryable** for analytics and agent tools (filters by technology, category, featured URLs).
- Environment split is clear: LocalDB locally, Azure SQL on UAT/prod, connection string name always **`Portfolio`**.
- Migrations document schema evolution (`InitialCreate`, `ProjectKindAndUrl`).

---

## 4. Frontend architecture (`PortfolioWebApp`)

### 4.1 Bootstrapping

- `main.ts` → `bootstrapApplication(App, appConfig)` — **standalone** app (no NgModules).
- `app.config.ts` registers:
  - router
  - `provideHttpClient(withInterceptors([loadingInterceptor]))`
  - Highcharts (`provideHighcharts` with heatmap, xrange, exporting, accessibility)
- Environments: `apiBaseUrl: '/api'`, `agentApiBaseUrl: '/api/agent'` (same-origin in prod; proxied in local).

### 4.2 Routes

| Path | Purpose |
| --- | --- |
| `/` | Home (desktop or mobile via breakpoint) |
| `/projects/:id` | Project detail / showcase |
| `/dashboard` | Analytics shell |
| `/dashboard/...` | Project portfolio + financial analytics children |
| `/dashboard/agent` | Full-page agent (also site-wide FAB) |

Root `App` hosts the global **agent FAB** (`AgentHostComponent`) and the **loading spinner**.

### 4.3 Why Angular signals

Signals are the primary UI state model:

- **Writable signals** for user/UI state: draft text, menu open, active section, send-in-flight, hero ready.
- **`computed`** for derived UI: e.g. `canSend` from draft + sending; chart options derived from API data.
- **`toSignal`** to bridge RxJS HTTP into templates, with **`catchError(() => of(undefined))`** so a failed request does not blow up OnPush templates.

**Why not only RxJS in templates?**

- Templates stay declarative: bind `signal()` / `computed()`, avoid calling methods that re-run every CD cycle.
- OnPush + signals = clear dependency graph: when a signal changes, only interested views update.
- Effects are reserved for **side effects** (not for deriving state). Derived values use `computed`.

### 4.4 Why OnPush + `inject()`

- **`ChangeDetectionStrategy.OnPush`** on UI components: update when inputs/signals change, not on every unrelated event.
- **`inject()`** instead of constructor DI: consistent with modern Angular style and easier in plain TypeScript base classes that are not `@Component`s.

### 4.5 Desktop / mobile split

Pattern:

1. **`HomeBase`** — plain TypeScript class (shared signals, forms, overview charts, contact submit). Comment in code: *no empty `@Directive`* so the language service stays happy with inherited members.
2. **`HomeDesktopComponent` / `HomeMobileComponent`** — templates + layout only; extend `HomeBase`.
3. **`HomeContainerComponent`** — switches with `*appBreakpoint` (Tailwind `lg` / 1024px via CDK `BreakpointObserver`).

Same idea elsewhere when layouts diverge: one logic path, two presentation shells.

### 4.6 Constants, models, services

| Folder | Responsibility |
| --- | --- |
| `models/` | Interfaces, enums (API/UI shapes) |
| `constants/` | Static copy, nav, preview class maps, limits |
| `services/` | HTTP, validation, portfolio content wiring, loading spinner |
| `directives/` | Breakpoint, reveal-on-scroll, count-up |
| `agent/` | Chat panel, host FAB, tool-results UI, chat state + API |
| `analytics/` | Dashboard views + Highcharts services/theme |

Validation rules live in **`ValidationService`** (not scattered regexes in components). Static marketing/nav copy lives in constants, not inside component classes.

### 4.7 Loading UX

Every HTTP call goes through **`loadingInterceptor`** → **`LoadingSpinnerService`** show/hide → global **`LoadingSpinnerComponent`**. That keeps a single loading affordance for dashboard fetches, contact submit, and agent chat without per-call spinner wiring.

### 4.8 Local proxy

`proxy.conf.json` forwards `/api` → `http://localhost:5157` so the SPA on port **4300** can call relative `/api/...` the same way production does (same origin).

---

## 5. Backend architecture (`PortfolioAPI`)

### 5.1 Request pipeline (`Program.cs`)

1. Register controllers, Swagger, `PortfolioDbContext`, content services, `AgentTools`, `AgentOrchestrator`.
2. CORS policy `PortfolioWebApp` (localhost 4200/4300 + configured origins).
3. On startup: **migrate** DB + **`PortfolioSeed.Apply`** (public demo data only).
4. Serve static files + **`MapFallbackToFile("index.html")`** for SPA deep links.
5. Map controllers under `/api/...`.

### 5.2 Controllers (HTTP surface)

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/health` | GET | Liveness `{ status: "ok" }` |
| `/api/contact` | POST | Validate contact message; log; acknowledge (no outbound mail yet) |
| `/api/dashboard` | GET | Home overview chart series |
| `/api/dashboard/analytics` | GET | Full project-portfolio analytics dataset |
| `/api/financial/analytics` | GET | Financial demo dataset for charts |
| `/api/agent/chat` | POST | Portfolio agent chat |

### 5.3 Layering

```
Controller  →  Service (PortfolioContentService / FinancialContentService / AgentOrchestrator)
            →  DbContext / seed entities
            →  Contracts (*Dto / *Request / *Response) returned to the client
```

Entities stay in `Data/`; public JSON shapes live in `Contracts/`. Controllers stay thin: parse input, call service, return contract.

### 5.4 Seeded domain

Typical entities: profile, highlights, skill groups/items, experience (+ technologies), projects (+ technologies, kind, URL), financial month/dept and expenses. Seed is **safe for UAT** — no secrets, demo-honest labels (`is_demo_dataset`).

---

## 6. AI / agent integration (detailed)

### 6.1 What “AI” means here

This is a **grounded portfolio agent**, not a ChatGPT wrapper.

- **No OpenAI / Azure OpenAI / Anthropic SDK**
- **No API keys** for an LLM
- Response metadata always reports `Model: "rule-router"` and `LlmCalls: 0`
- Answers are produced from **allowlisted tools** that read the **same SQL analytics dataset** as the dashboards

The FE types leave room for an `'llm'` answer source later; the current backend uses `"router"` / `"template"`.

**Why this design?**

- Deterministic, auditable answers for a personal showcase (no hallucinations about employers or “best project” rankings).
- Zero LLM cost and no key management on a public portfolio.
- Single App Service deploy — no second Python process to host or secure.
- Still demonstrates **tool calling**, **routing**, **grounding**, and a polished chat UX — the integration story hiring managers care about.

### 6.2 End-to-end chat flow

```
User types in AgentChatPanel
        │
        ▼
AgentChatStateService.send()
  · trim message · set sending · append turn (loading)
        │
        ▼
ChatApiService → POST /api/agent/chat  { message }
        │
        ▼
AgentController.Chat
        │
        ▼
AgentOrchestrator.RunAsync
  1. Empty → template nudge
  2. AgentRouter.Route(text)     // keyword / regex rules
  3. greeting / unsupported → fixed copy
  4. tool → AgentTools.ExecuteAsync(name, args)
  5. AgentAnswers.Render(tool, result) → natural-language answer
        │
        ▼
AgentChatResponse
  answer, tool_activity[], model, llm_calls, answer_source, is_demo_dataset
        │
        ▼
FE updates turn · ToolResultsComponent can show tool activity
```

### 6.3 Router (`AgentRouter`)

Static rule engine over normalized text:

- Greetings → short capability blurb
- Off-domain (weather, HR, SQL, sales, …) → **unsupported** (refuse politely)
- Intent phrases → tool name + optional args  
  Examples: “Who is Jumari?” → `get_owner_profile`; skills / frontend → `get_skills` with `group`; “Tell me about Veld Supply” → `get_project_detail` with query; “best project” → `get_featured_projects` (featured URLs, not a subjective ranking)

### 6.4 Tools (`AgentTools`) — allowlist

All tools load `PortfolioContentService.GetAnalyticsAsync` then project a dictionary result:

| Tool | Purpose |
| --- | --- |
| `get_owner_profile` | Name, role, location, summary, project count |
| `get_skills` | Skill groups (optional `group` filter) |
| `get_experience` | Work / education-style entries |
| `get_contact` | Contact channels from dataset |
| `get_portfolio_summary` | Aggregate metrics (`focus` optional) |
| `list_projects` | Filter by category / technology / status |
| `get_featured_projects` | Projects with public URLs (“best” grounding) |
| `get_technology_usage` | Top technologies (`top_n`) |
| `get_category_distribution` | Category mix (`top_n`) |
| `get_project_detail` | Single project by name/query |

Unknown tool names fail closed: *not allowlisted*.

### 6.5 Answers (`AgentAnswers`)

Maps tool JSON → readable sentences. Keeps the chat human without an LLM. Tool activity is still returned so the UI can show **what was called** (transparency).

### 6.6 Frontend agent UX

- **`AgentHostComponent`** — floating open/close; deep-link `?agent=1`
- **`AgentChatPanelComponent`** — suggested prompts, textarea, Ask / Enter to send
- **`AgentChatStateService`** — site-wide draft, turns, `canSend` computed
- **`ToolResultsComponent`** — surfaces `tool_activity` from the response
- Suggested prompts are grounded examples: Jumari, skills, experience, Veld Supply

Safety on the wire: message length capped (API ~4000 chars); empty messages rejected; off-topic intents refused before tools run.

---

## 7. Analytics & Highcharts

Highcharts is registered once at app bootstrap with modules needed for the showcase:

- **Heatmap** — technology × category style matrices
- **X-range** — project timeline (real date ranges, not nonsense category bars)
- **Exporting** / **accessibility** — polished demo quality

| Surface | Service | Typical chart types |
| --- | --- | --- |
| Home overview | `HomeBase` + dashboard GET | Pie (tech mix), column (categories) |
| Project analytics | `AnalyticsChartService` | Column/bar, pie/donut, heatmap, xrange |
| Financial analytics | `FinancialChartService` | Areaspline sparklines, revenue/expense columns, cash curve, expense pie, budget vs actual |

Theme helpers (`analytics-chart-theme.ts`) keep chart colors aligned with the site’s cyan/dark visual system. Data comes from API endpoints that read the same seeded SQL content the agent tools use — charts and chat stay consistent.

---

## 8. Motion & visual design

Motion is intentional presence, not decoration spam. Most animations respect **`prefers-reduced-motion`**.

| Feature | Implementation | Role |
| --- | --- | --- |
| **Aurora hero** | `AuroraBackgroundComponent` + `aurora.webm` / poster; CSS mask; `aurora-plate-drift` | Full-bleed atmospheric background under hero copy |
| **Hero rise** | `.hero-intro` + `@keyframes hero-rise` after `heroContentReady` | Staggered entrance once aurora is ready |
| **Scroll reveal** | `RevealDirective` + IntersectionObserver | Sections fade/rise into view with optional stagger |
| **Count-up** | `CountUpDirective` (~700ms ease-out) | KPI-style numbers animate when scrolled into view |
| **Device float** | `showcase-float` / `showcase-float-phone` | Subtle laptop/phone motion on project showcases |
| **Card / preview hover** | Lift + cyan glow; preview scale **1.015** | Mild hover so overlapping laptop+phone layouts don’t clip harshly |
| **Loading spinner** | `loading-spin` | Global request feedback |

Visual language: dark atmospheric backgrounds, cyan accents, custom device frames for desktop+mobile project pairs (Accountant / Veld Supply / Jumari Portfolio style showcases). Tailwind utilities compose layout; `styles.css` owns the heavier showcase/aurora system.

---

## 9. Contact form integration

1. Reactive form on home (desktop/mobile) via `HomeBase`.
2. Client validation through **`ValidationService`** + shared **`CONTACT_LIMITS`** (aligned with API annotations: name/email/message lengths).
3. `ContactService` → `POST /api/contact`.
4. API validates and **logs** the message; returns a success acknowledgement. Outbound email is not wired yet — intentional for a portfolio receive-path without mail infrastructure.

---

## 10. Environments, branches, deploy

| Branch | Role |
| --- | --- |
| `develop` | Day-to-day work |
| `release` | UAT deploy |
| `main` | Production (when host is ready) |

**CI** (`.github/workflows/portfolio.yml`):

1. `dotnet publish` API + `pnpm build` SPA  
2. On `release`: copy SPA into `api/wwwroot`, deploy App Service `JumariPortfolio`  
3. `main` production remains stub until `PRODUCTION_HOST` is configured  

**Databases**

| Database | Where |
| --- | --- |
| `PortfolioLocal` | LocalDB |
| `PortfolioUat` | Azure SQL (UAT) |
| `PortfolioProd` | Production SQL (when ready) |

UAT/prod connection strings stay in Azure App Service settings — not in git. Local Development connection string for LocalDB is documented in the root README.

---

## 11. How the pieces stay integrated (summary)

1. **One content pipeline** — SQL seed → EF → `PortfolioContentService` → dashboards **and** agent tools.  
2. **One host** — API serves `/api` and the SPA; local proxy mirrors that.  
3. **One styling system** — Tailwind v4 tokens + shared component layer in `styles.css`.  
4. **One state style on the FE** — signals/computed/OnPush; HTTP via services + interceptor.  
5. **Agent is productized UX around deterministic tools** — not an opaque LLM black box.  

That combination is the portfolio’s main technical story: a real Angular + ASP.NET + SQL product surface, with analytics and a grounded agent on top of the same data.

---

## 12. Quick file map (where to look)

| Concern | Start here |
| --- | --- |
| FE bootstrap / HTTP / Highcharts | `PortfolioWebApp/src/app/app.config.ts` |
| Home logic | `PortfolioWebApp/src/app/home/home-base.ts` |
| Agent UI | `PortfolioWebApp/src/app/agent/` |
| Agent API client / state | `chat-api.service.ts`, `agent-chat-state.service.ts` |
| Motion directives | `directives/reveal.directive.ts`, `count-up.directive.ts` |
| Visual system | `PortfolioWebApp/src/styles.css` |
| API entry | `PortfolioAPI/Program.cs` |
| Agent pipeline | `PortfolioAPI/Agent/AgentOrchestrator.cs`, `AgentRouter.cs`, `AgentTools.cs`, `AgentAnswers.cs` |
| Chat endpoint | `PortfolioAPI/Controllers/AgentController.cs` |
| Seed / schema | `PortfolioAPI/Data/PortfolioSeed.cs`, `Entities.cs` |
| Run / deploy | Root `README.md` |

---

## 13. Honest limitations (good interview talking points)

- Agent is a **rule router**, not a generative model — extensible toward LLM tool-calling later without changing the allowlist idea.
- Contact form **does not send email** yet; it validates and logs.
- Financial analytics are a **demo dataset** for chart craft, clearly labeled in agent responses via `is_demo_dataset`.
- Production App Service wiring may still be pending; UAT path is the primary cloud story today.

Use these as strengths: deliberate scope, grounded answers, and a deployable single-host architecture.
