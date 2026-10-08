# QUANTIQEN V1 — Security Decision Infrastructure Dashboard

Enterprise Security Decision Infrastructure Dashboard

![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel)

## Overview

QUANTIQEN is an enterprise-grade Security Decision Infrastructure (SDI) dashboard built for AnantNetra Technologies. It provides real-time security monitoring, AI-driven recommendations, and centralized management of security decisions, assets, and risk analytics. This version is integrated with the live platform backend (`https://quantiqen-backend.onrender.com`) via a Next.js proxy; a small set of features without backend endpoints remain on annotated mock data.

## Features

- ✅ **Login** — Authentication page with branded form and credential validation UI
- ✅ **Dashboard** — Welcome bar + 5 stat pills (API Requests, Decisions, Risks, Events, Assets) + 8 KPI cards grid (Threats Blocked, Risk Score, Avg Confidence, etc.)
- ✅ **Live Monitoring** — Auto-refreshing stats panel (API requests, assets, decisions, risks, events, deliveries) + scrollable event feed with severity badges
- ✅ **Decision Center** — 10-column AI decision table with status/priority badges, confidence bar, and row-click side panel showing full decision details
- ✅ **Analytics** — 8 interactive Recharts visualizations: Risk Trend, Decision Trend, API Usage, Security Score, Daily Decisions, Risk Distribution (Bar/Pie)
- ✅ **Assets** — 7-column asset inventory table with search, type/status filters, and paginated results
- ✅ **API Management** — API key cards with masked keys, usage stats, status indicators, and regenerate action
- ✅ **AI Recommendations** — Recommendation cards with priority badges, description, impact/effort badges, and "Take Action" workflow
- ✅ **Reports** — Report card grid with title, description, date, status badge, and View/Download actions
- ✅ **Organization** — Organization header with logo/name/plan/members + detail cards (overview stats, compliance, security scores, contact info)
- ✅ **Notifications** — Notification list with type icons, severity colors, relative timestamps, and read/unread styling
- ✅ **Profile** — Profile header (avatar, name, role, department) + details card (email, phone, 2FA, team, joined) + Edit Profile modal + Security Settings (2FA toggle, password change)
- ✅ **Settings** — Appearance (light/dark/system toggle), Notification Preferences (5 email toggles), Preferences (timezone, date format, language selects), Security (2FA status, session timeout)

## Tech Stack

| Category          | Technology                 | Purpose                                       |
| ----------------- | -------------------------- | --------------------------------------------- |
| **Framework**     | Next.js 16.2.9             | React meta-framework with App Router          |
| **Language**      | TypeScript 5               | Type-safe development                         |
| **Styling**       | Tailwind CSS 4 + shadcn/ui | Utility-first CSS with pre-built components   |
| **State & Data**  | TanStack React Query 5     | Server state, caching, and auto-refetch       |
| **HTTP**          | Axios 1.18                 | API client (configured for future backend)    |
| **Charts**        | Recharts 3.9               | Interactive chart components                  |
| **Animation**     | Framer Motion 12.42        | Page transitions and card entrance animations |
| **Icons**         | Lucide React 1.21          | Consistent icon set across all features       |
| **Theme**         | next-themes 0.4            | Dark/light/system theme switching             |
| **Fonts**         | Geist + Poppins            | Sans-serif and heading font pairing           |
| **Notifications** | Sonner 2.0                 | Toast notifications (configured)              |
| **Linting**       | ESLint 9 + Prettier 3.9    | Code quality and formatting                   |
| **Deployment**    | Vercel                     | Serverless hosting and CI/CD                  |

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

### Setup

```bash
# Clone the repository
git clone https://github.com/kalidashodekare14/quantiqen-v1.git
cd quantiqen-v1

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=https://api.quantiqen.com" > .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The login page redirects to `/dashboard` after authentication.

> **Note:** Identity/auth traffic uses `NEXT_PUBLIC_API_URL` (identity service, unchanged). Platform traffic is proxied through `/platform/:path*` → `NEXT_PUBLIC_PLATFORM_API_URL` (defaults to `https://quantiqen-backend.onrender.com`).

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/login/             # Login page route
│   ├── (dashboard)/              # Authenticated routes layout
│   │   ├── dashboard/            # Overview KPIs and activity
│   │   ├── monitoring/           # Live Monitoring page
│   │   ├── decision/             # Decision Center page
│   │   ├── analytics/            # Analytics page
│   │   ├── assets/               # Assets page
│   │   ├── api-management/       # API Management page
│   │   ├── ai-recommendations/   # AI Recommendations page
│   │   ├── reports/              # Reports page
│   │   ├── organization/         # Organization page
│   │   ├── notifications/        # Notifications page
│   │   ├── profile/              # Profile page
│   │   ├── settings/             # Settings page
│   │   ├── layout.tsx            # Dashboard layout (sidebar + header)
│   │   ├── page.tsx              # Dashboard route index (redirect)
│   │   └── error.tsx             # Route-level error boundary
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Splash screen with JWT auth redirect
│   ├── not-found.tsx             # 404 page
│   ├── global-error.tsx          # Root-level critical error boundary
│   └── globals.css               # Tailwind v4 + theme variables
├── assets/                       # Static assets (icons, images, logos)
├── components/
│   ├── auth/                     # AuthGuard wrapper component
│   ├── layout/                   # App shell (sidebar, header, nav)
│   ├── shared/                   # 9 reusable shared components
│   ├── theme/                    # Theme provider and toggle
│   └── ui/                       # 17 shadcn/ui primitives
├── constants/                    # App config, routes, navigation, severity
├── features/                     # Feature-based modules (13 features)
│   ├── auth/                     # Login form component
│   ├── dashboard/                # Dashboard (view, hooks, services, components)
│   ├── decisions/                # Decision Center
│   ├── analytics/                # Analytics + charts
│   ├── monitoring/               # Live Monitoring
│   ├── assets/                   # Asset Inventory
│   ├── api-management/           # API Keys
│   ├── ai-recommendations/       # AI Recommendations
│   ├── reports/                  # Reports
│   ├── organization/             # Organization Profile
│   ├── notifications/            # Notifications
│   ├── profile/                  # User Profile
│   └── settings/                 # Settings
├── hooks/                        # Shared hooks (useMobile)
├── lib/                          # Utilities (axios, motion presets, cn helper)
├── mock-data/                    # 12 JSON mock files, one per feature
├── providers/                    # App, Query, Theme providers
├── types/                        # TypeScript interfaces per feature (15 files)
└── utils/                        # Pure utility functions (color, date, string)
```

## Data Source Status

Every feature follows a three-layer architecture: **View → Hook → Service → API/Mock**. Live features call the platform backend through `src/lib/platform-axios.ts` (baseURL `/platform`, Bearer JWT) or the identity service (`src/lib/axios.ts`, unchanged). Views and hooks are agnostic — they receive the same typed data either way.

### Live (platform backend)

Dashboard · Analytics · Monitoring (feed + Situations + Network Observations) · Decision Center · Assets · API Management · Reports · Organization overview · Guardrail policies · Dual audit log (portal + platform) · Compliance · Scans · Teams · Notification preferences · Webhooks · Delivery log · Platform Ops (status/DLQ/incidents) · Profile (identity) · MFA/IP policy (identity)

### Mock-retained (`@mock-retained` — no backend endpoints)

AI Recommendations · Notifications inbox · Findings tab · General UI settings · Report PDF export (client-side `.md`) · Global search

## Available Routes

| Route                 | Module             | Description                                      |
| --------------------- | ------------------ | ------------------------------------------------ |
| `/login`              | Login              | Authentication page                              |
| `/dashboard`          | Dashboard          | Overview KPIs and recent activity                |
| `/monitoring`         | Live Monitoring    | Real-time event feed with stats                  |
| `/decision`           | Decision Center    | AI decision table with detail panel              |
| `/analytics`          | Analytics          | 8 interactive security charts                    |
| `/assets`             | Assets             | Asset inventory with search and filters          |
| `/api-management`     | API Management     | API key cards and usage stats                    |
| `/ai-recommendations` | AI Recommendations | Actionable security recommendations              |
| `/reports`            | Reports            | Generated report cards                           |
| `/organization`       | Organization       | Org profile, compliance, and scores              |
| `/notifications`      | Notifications      | Severity-coded notification list                 |
| `/profile`            | Profile            | User profile with edit modal                     |
| `/settings`           | Settings           | Appearance, notifications, preferences, security |
| `/scans`              | Scans              | Scan policies, jobs, and results                 |
| `/organization/teams` | Teams              | Team CRUD and member management                  |
| `/organization/guardrails` | Guardrails    | Policy rules builder, versions, activate/archive |
| `/organization/compliance` | Compliance    | Framework controls and coverage                  |
| `/organization/audit-log`  | Audit Log      | Portal + platform audit with source toggle       |
| `/platform-ops`       | Platform Ops       | Status, DLQ replay, incidents (admin only)       |

## Error Handling

QUANTIQEN implements Next.js error handling at three levels:

| File               | Scope   | Description                                                                    |
| ------------------ | ------- | ------------------------------------------------------------------------------ |
| `not-found.tsx`    | Global  | 404 page with animated "404" heading, description, and "Back to Dashboard" link |
| `error.tsx`        | Route   | Route-level error boundary (`(dashboard)/`) with retry and navigation buttons   |
| `global-error.tsx` | Root    | Root-level critical error boundary with standalone `<html>`/`<body>` tags       |

### Root splash page

`app/page.tsx` serves as the application entry point — it reads a JWT token from `localStorage` and redirects to `/dashboard` (authenticated) or `/login` (unauthenticated). While checking, it displays a branded splash screen with an animated loading bar.

---

## Shared Components

Located in `src/components/shared/`:

| Component         | Description                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| `AppButton`       | Reusable button with primary/outline/ghost/danger variants, loading spinner, icon support, and full-width mode |
| `AppLoading`      | Full-page loading overlay shown during initial auth check                                                      |
| `ChartCard`       | Card wrapper for Recharts components with title, subtitle, and consistent rounded-xl styling                   |
| `DataTable`       | Generic table component with search, column filtering, and pagination                                          |
| `KpiCard`         | Single KPI display with label, value, trend, and icon                                                          |
| `KpiGrid`         | Configurable grid layout for KPI cards (used on Dashboard)                                                     |
| `LoadingSkeleton` | Generic loading placeholder (base for all feature skeletons)                                                   |
| `PageHeader`      | Page title + subtitle + action slot (used on every page)                                                       |
| `StatPills`       | Horizontal stat pills with label, value, and icon                                                              |

## Design System

### Theme Tokens

| Token                           | Tailwind Class                       | Description                             |
| ------------------------------- | ------------------------------------ | --------------------------------------- |
| `--background`                  | `bg-background`                      | Page background (light/dark)            |
| `--foreground`                  | `text-foreground`                    | Primary text color                      |
| `--card`                        | `bg-card`                            | Card surface background                 |
| `--card-foreground`             | `text-card-foreground`               | Card text color                         |
| `--primary`                     | `bg-primary text-primary-foreground` | Primary accent (purple)                 |
| `--muted`                       | `bg-muted text-muted-foreground`     | Muted/secondary surfaces                |
| `--border`                      | `border-border`                      | Border color for cards and inputs       |
| `--chart-1` through `--chart-5` | `text-chart-1` etc.                  | Chart series colors                     |
| `--sidebar`                     | `bg-sidebar`                         | Sidebar surface                         |
| `--destructive`                 | `bg-destructive`                     | Error/danger color                      |
| `--radius-*`                    | `rounded-xl`                         | Consistent border radius (14px at base) |

The app uses a **dark-by-default** theme with full light mode support via `next-themes`. All cards use `rounded-xl border bg-card text-card-foreground` for visual consistency. Framer Motion powers entrance animations (`opacity: 0, y: 12` → `opacity: 1, y: 0`) across all feature pages.

> **Note:** The `--radius` variable (defined in `:root` of `globals.css`) controls all shadcn/ui border radii. It defaults to `0.625rem` (10px), with `rounded-xl` resolving to `calc(var(--radius) * 1.4)` = 14px. All `rounded-*` utilities depend on `--radius` being set in `:root`.

## Deployment

### Deploy to Vercel

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL` — identity service base URL (auth/portal endpoints)
   - `NEXT_PUBLIC_PLATFORM_API_URL` — platform backend base URL (optional; defaults to `https://quantiqen-backend.onrender.com`)
4. Deploy — zero configuration required

### Live Demo

[https://quantiqen.vercel.app](https://quantiqen.vercel.app)

## Remaining Work

Features annotated `@mock-retained` above await backend endpoints (notifications inbox, findings, AI recommendations, general UI settings, global search, report PDF export). When endpoints land, only the service file changes — views and hooks remain untouched. Full integration plan and API contract: `docs/API.md` (116 platform endpoints) and `docs/TASK.md` (phase log).

---

Built with ❤️ for AnantNetra Technologies
