# QUANTIQEN V1 — Security Decision Infrastructure Dashboard

Enterprise Security Decision Infrastructure Dashboard

![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel)

## Overview

QUANTIQEN is an enterprise-grade Security Decision Infrastructure (SDI) dashboard built for AnantNetra Technologies. It provides real-time security monitoring, AI-driven recommendations, and centralized management of security decisions, assets, and risk analytics. This V1 prototype uses mock JSON data to demonstrate the full UI/UX; real API integration is planned for the next sprint.

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

| Category | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16.2.9 | React meta-framework with App Router |
| **Language** | TypeScript 5 | Type-safe development |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Utility-first CSS with pre-built components |
| **State & Data** | TanStack React Query 5 | Server state, caching, and auto-refetch |
| **HTTP** | Axios 1.18 | API client (configured for future backend) |
| **Charts** | Recharts 3.9 | Interactive chart components |
| **Animation** | Framer Motion 12.42 | Page transitions and card entrance animations |
| **Icons** | Lucide React 1.21 | Consistent icon set across all features |
| **Theme** | next-themes 0.4 | Dark/light/system theme switching |
| **Fonts** | Geist + Poppins | Sans-serif and heading font pairing |
| **Notifications** | Sonner 2.0 | Toast notifications (configured) |
| **Linting** | ESLint 9 + Prettier 3.9 | Code quality and formatting |
| **Deployment** | Vercel | Serverless hosting and CI/CD |

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

### Setup

```bash
# Clone the repository
git clone https://github.com/anantnetra/quantiqen-v1.git
cd quantiqen-v1

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=https://api.quantiqen.com/v1" > .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The login page redirects to `/dashboard` after authentication.

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
│   │   ├── dashboard/            # Dashboard page
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
│   │   └── settings/             # Settings page
│   ├── layout.tsx                # Root layout with providers
│   └── globals.css               # Tailwind v4 + theme variables
├── assets/                       # Static assets (icons, images, logos)
├── components/
│   ├── auth/                     # Authentication UI (AuthGuard)
│   ├── layout/                   # App shell (sidebar, header, nav)
│   ├── shared/                   # Reusable shared components
│   ├── theme/                    # Theme provider and toggle
│   └── ui/                       # shadcn/ui primitives (17 components)
├── constants/                    # App config, routes, navigation, severity
├── features/                     # Feature-based modules
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
├── lib/                          # Utilities (axios client, cn helper)
├── mock-data/                    # 12 JSON files, one per feature
├── providers/                    # App, Query, Theme providers
├── types/                        # TypeScript interfaces per feature
└── utils/                        # Pure utility functions (date formatting)
```

## Mock Data Strategy

Every feature follows a three-layer architecture: **View → Hook → Service → Mock JSON**. Services currently import static JSON files and cast them to typed interfaces. When the real API becomes available, only the service file changes — views and hooks remain untouched.

### Before (mock)

```ts
// features/dashboard/services/dashboard.service.ts
import dashboardData from "@/mock-data/dashboard.json";
import { DashboardData } from "@/types/dashboard.types";

export const getDashboard = async () => {
  return dashboardData as unknown as DashboardData;
};
```

### After (real API)

```ts
// features/dashboard/services/dashboard.service.ts
import { api } from "@/lib/axios";
import { DashboardData } from "@/types/dashboard.types";

export const getDashboard = async () => {
  const { data } = await api.get<DashboardData>("/dashboard");
  return data;
};
```

The hook and view need zero changes — they receive the same typed data either way. This pattern is identical across all 12 features.

## Available Routes

| Route | Module | Description |
|---|---|---|
| `/login` | Login | Authentication page |
| `/dashboard` | Dashboard | Overview KPIs and recent activity |
| `/monitoring` | Live Monitoring | Real-time event feed with stats |
| `/decision` | Decision Center | AI decision table with detail panel |
| `/analytics` | Analytics | 8 interactive security charts |
| `/assets` | Assets | Asset inventory with search and filters |
| `/api-management` | API Management | API key cards and usage stats |
| `/ai-recommendations` | AI Recommendations | Actionable security recommendations |
| `/reports` | Reports | Generated report cards |
| `/organization` | Organization | Org profile, compliance, and scores |
| `/notifications` | Notifications | Severity-coded notification list |
| `/profile` | Profile | User profile with edit modal |
| `/settings` | Settings | Appearance, notifications, preferences, security |

## Shared Components

Located in `src/components/shared/`:

| Component | Description |
|---|---|
| `AppButton` | Reusable button with primary/outline/ghost/danger variants, loading spinner, icon support, and full-width mode |
| `ChartCard` | Card wrapper for Recharts components with title, subtitle, and consistent rounded-xl styling |
| `DataTable` | Generic table component with search, column filtering, and pagination |
| `KpiCard` | Single KPI display with label, value, trend, and icon |
| `KpiGrid` | Configurable grid layout for KPI cards (used on Dashboard) |
| `LoadingSkeleton` | Generic loading placeholder (base for all feature skeletons) |
| `PageHeader` | Page title + subtitle + action slot (used on every page) |
| `StatPills` | Horizontal stat pills with label, value, and icon |

## Design System

### Theme Tokens

| Token | Tailwind Class | Description |
|---|---|---|
| `--background` | `bg-background` | Page background (light/dark) |
| `--foreground` | `text-foreground` | Primary text color |
| `--card` | `bg-card` | Card surface background |
| `--card-foreground` | `text-card-foreground` | Card text color |
| `--primary` | `bg-primary text-primary-foreground` | Primary accent (purple) |
| `--muted` | `bg-muted text-muted-foreground` | Muted/secondary surfaces |
| `--border` | `border-border` | Border color for cards and inputs |
| `--chart-1` through `--chart-5` | `text-chart-1` etc. | Chart series colors |
| `--sidebar` | `bg-sidebar` | Sidebar surface |
| `--destructive` | `bg-destructive` | Error/danger color |
| `--radius-*` | `rounded-xl` | Consistent border radius (14px at base) |

The app uses a **dark-by-default** theme with full light mode support via `next-themes`. All cards use `rounded-xl border bg-card text-card-foreground` for visual consistency. Framer Motion powers entrance animations (`opacity: 0, y: 12` → `opacity: 1, y: 0`) across all feature pages.

## Deployment

### Deploy to Vercel

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Configure environment variable:
   - `NEXT_PUBLIC_API_URL` — your API base URL (defaults to empty, safe to leave blank for mock data)
4. Deploy — zero configuration required

### Live Demo

[https://quantiqen-v1.vercel.app](https://quantiqen-v1.vercel.app) *(update with actual URL after deployment)*

## Next Sprint

The next sprint will replace all 12 mock JSON files with live API endpoints. The service layer (in `src/features/*/services/`) is the only code that will change — each service function will switch from importing static JSON to calling the Axios client configured in `src/lib/axios.ts`. Every view, hook, component, and type will remain identical. The `NEXT_PUBLIC_API_URL` environment variable is already wired into the Axios instance and ready to go.

---

Built with ❤️ for AnantNetra Technologies
