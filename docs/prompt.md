# Backend Task Prompt — Single Dashboard Overview API

> Copy everything below the line and paste it into the backend agent.

---

## Role

You are the backend engineer for the **Quantiquen platform** (NestJS + Prisma + PostgreSQL, global prefix `/api/v1`, deployed at `https://quantiqen-backend.onrender.com`). Follow the existing conventions in this repository: controller → service → Prisma, standard error envelope, Bearer JWT auth.

## Goal

The frontend dashboard page currently needs **12 parallel requests** to render its WelcomeBar, StatsRow, and KPI cards — and 4 of the 8 KPI cards show a `+0%` badge because the backend exposes **no historical time-series** for them.

Implement **one aggregate endpoint** that returns everything the dashboard page needs in a single response: organization info, stats pills, and all 8 KPI cards with current value, period-over-period percentage change, trend, and a dense sparkline series.

Do **not** modify any existing endpoint (notably `GET /dashboard/summary` — it must keep working unchanged).

## Endpoint

```
GET /api/v1/dashboard/overview?days=14
```

| Aspect | Value |
|---|---|
| Auth | Bearer JWT |
| RBAC | default-allow (same as `GET /dashboard/summary`) |
| Query | `days` — optional int, default `14`, invalid → `14` (silent fallback, never 422) |
| Cache | Redis, TTL 60s, key `dashboard:overview:{orgId}:{days}`, fail-open to live compute (same pattern as `/dashboard/summary`) |
| Status | `200 OK` |

## Response Schema (complete example)

```json
{
  "timestamp": "2026-10-10T12:00:00.000Z",
  "organization": {
    "name": "Acme Corp",
    "plan": "PRO",
    "users": 8,
    "assets": 12,
    "apiKeys": 10
  },
  "stats": {
    "securityScore": 74,
    "totalAssets": 12,
    "activeApiKeys": 5,
    "apiRequestsToday": 120,
    "activeRisks": 40,
    "pendingDecisions": 3
  },
  "cards": [
    { "id": "security-decision",   "value": 74,  "percentageChange": 5,   "trend": "up",     "sparkline": [70, 71, 74] },
    { "id": "business-risk",       "value": 61,  "percentageChange": -3,  "trend": "down",   "sparkline": [65, 64, 61] },
    { "id": "organization-health", "value": 82,  "percentageChange": 2,   "trend": "up",     "sparkline": [80, 81, 82] },
    { "id": "findings",            "value": 56,  "percentageChange": 8,   "trend": "up",     "sparkline": [40, 48, 56] },
    { "id": "events",              "value": 120, "percentageChange": 12,  "trend": "up",     "sparkline": [90, 107, 120] },
    { "id": "decisions",           "value": 42,  "percentageChange": 0,   "trend": "stable", "sparkline": [40, 42, 42] },
    { "id": "assets",              "value": 12,  "percentageChange": 20,  "trend": "up",     "sparkline": [9, 10, 12] },
    { "id": "active-api-keys",     "value": 5,   "percentageChange": 0,   "trend": "stable", "sparkline": [5, 5, 5] }
  ]
}
```

## TypeScript Types (response)

```ts
type KpiCardId =
  | "security-decision"
  | "business-risk"
  | "organization-health"
  | "findings"
  | "events"
  | "decisions"
  | "assets"
  | "active-api-keys";

type KpiTrend = "up" | "down" | "stable";

interface DashboardKpiCard {
  id: KpiCardId;
  value: number;
  percentageChange: number; // integer percent, never null
  trend: KpiTrend;
  sparkline: number[];      // dense, ascending, last element === value
}

interface DashboardOverviewResponse {
  timestamp: string; // ISO 8601
  organization: {
    name: string;
    plan: string;
    users: number;
    assets: number;
    apiKeys: number;
  };
  stats: {
    securityScore: number;
    totalAssets: number;
    activeApiKeys: number;
    apiRequestsToday: number;
    activeRisks: number;
    pendingDecisions: number;
  };
  cards: DashboardKpiCard[]; // always exactly 8, in the order shown above
}
```

## Hard Guarantees (must hold for every response)

1. **Always all 8 cards**, in the documented order — even when data is empty or a score has no history.
2. **`sparkline` is dense and ascending** — one point per day for `days` days, oldest first, no gaps. Cap series length at `days` (keep the most recent `days` points).
3. **`sparkline[sparkline.length - 1] === value`** for every card — the current number is always the last chart point.
4. **Count cards** (`findings`, `events`, `decisions`, `assets`, `active-api-keys`) — missing day → `value: 0` (interval counts).
5. **Score cards** (`security-decision`, `business-risk`, `organization-health`) — missing day → **carry previous day's value forward**; if there is no history at all → `sparkline: [value]` (single point).
6. **`percentageChange`** computed as **last point vs previous point** (period-over-period):
   ```
   prev = sparkline[len-2]; last = sparkline[len-1];
   prev === 0 && last > 0  → 100
   prev === 0 && last === 0 → 0
   otherwise               → Math.round(((last - prev) / prev) * 100)
   ```
   If fewer than 2 points → `0`. **Never `null`.**
7. **`trend`** — `> 0` → `"up"`, `< 0` → `"down"`, else `"stable"` (must agree with the sign of `percentageChange`).
8. **Consistency** — `stats.securityScore === cards["security-decision"].value`; `stats.totalAssets === cards["assets"].value`; `stats.activeApiKeys === cards["active-api-keys"].value`; `organization.assets` and `organization.apiKeys` match the same scalars. Everything is computed in one transaction/snapshot so all numbers agree.

## Data Sources Per Card

| Card id | Series source | Current value |
|---|---|---|
| `security-decision` | `OrganizationScoreHistory.securityDecisionScore` (existing nightly snapshots), ordered by `snapshotDate` | `securityDecision.score` from the same computation as `/dashboard/summary` |
| `business-risk` | `DailyRiskSnapshot.avgRiskScore` (existing nightly snapshots), ordered by `snapshotDate` | `businessRisk.score` (same as summary) |
| `organization-health` | **New:** extend `OrganizationScoreHistory` with an `organizationHealthScore Decimal @default(0)` column (Prisma migration) and populate it in the same nightly job that writes `securityDecisionScore` | `organizationHealth.score` (same as summary) |
| `findings` | Live: `GROUP BY DATE(createdAt)` on the findings table for the `days` window | `COUNT(*)` of findings |
| `events` | Live: `GROUP BY DATE(receivedAt)` on the events table for the `days` window | `COUNT(*)` of events |
| `decisions` | Live: `GROUP BY DATE(createdAt)` on the decisions table for the `days` window | `COUNT(*)` of decisions |
| `assets` | Live: `GROUP BY DATE(createdAt)` on the assets table for the `days` window | `COUNT(*)` of assets |
| `active-api-keys` | Live: `GROUP BY DATE(createdAt)` on api-keys **where `status = ACTIVE`** | `COUNT(*)` of active keys |

Notes:
- Score snapshot tables may contain fewer than `days` rows (or zero) — apply guarantee #5 (carry-forward / single point).
- If a score snapshot exists **before** the requested window, use the last snapshot before the window as the carry-forward seed for the first day.
- Count queries must include **zero rows for empty days** (generate the date spine in code or with a `generate_series`/recursive CTE).

## Stats / Organization Sources

| Field | Source |
|---|---|
| `organization.name`, `organization.plan` | organization record (`orgName`, `planTier`) |
| `organization.users` | `COUNT(users)` for the org |
| `organization.assets` | `COUNT(assets)` for the org |
| `organization.apiKeys` | `COUNT(api-keys)` for the org |
| `stats.securityScore` | same computation as `scores.securityDecision` in `/dashboard/summary` |
| `stats.totalAssets` / `stats.activeApiKeys` | same counts as cards `assets` / `active-api-keys` |
| `stats.apiRequestsToday` | `COUNT(events)` where `receivedAt` is today (UTC) — same as `/analytics/api-usage` last point |
| `stats.activeRisks` | active/non-closed risks count — same as summary `counts.risks` |
| `stats.pendingDecisions` | `COUNT(decisions)` where `status = PENDING` |

Reuse the existing summary computation service rather than duplicating score logic — the aggregate must not drift from `/dashboard/summary`.

## Error Responses (standard envelope)

```json
// 401 Unauthorized
{ "error": { "code": "Unauthorized", "message": "Unauthorized", "request_id": "550e8400-e29b-408a-a716-446655440123" } }

// 500 Internal Server Error
{ "error": { "code": "INTERNAL_SERVER_ERROR", "message": "An unexpected error occurred", "request_id": "..." } }
```

## Acceptance Criteria

- [ ] `GET /api/v1/dashboard/overview` returns 200 with all top-level keys: `timestamp`, `organization`, `stats`, `cards`
- [ ] `cards` always contains exactly 8 entries with the 8 documented ids, in order
- [ ] For every card: `sparkline` non-empty, dense, ascending, and `sparkline.at(-1) === value`
- [ ] For every card: `percentageChange` is an integer (never null) and `trend` matches its sign
- [ ] Count-card series contain explicit `0` entries for days with no data
- [ ] Score-card series use carry-forward; zero-history orgs return `[value]`
- [ ] `stats.securityScore`, `stats.totalAssets`, `stats.activeApiKeys` equal the corresponding card values
- [ ] `GET /dashboard/summary` (10.1) still returns its original shape (regression check)
- [ ] Unauthenticated request → 401 with standard error envelope
- [ ] `?days=999` / `?days=abc` → defaults to 14, still 200 (silent fallback)
- [ ] Prisma migration for `OrganizationScoreHistory.organizationHealthScore` applies cleanly; nightly job writes it
- [ ] Unit/integration test: response shape + `percentageChange` formula (including `prev=0` cases) + empty-history org

## Verification (cURL)

```bash
TOKEN="<jwt>"
curl -s "https://quantiqen-backend.onrender.com/api/v1/dashboard/overview?days=14" \
  -H "Authorization: Bearer $TOKEN" | jq '.cards[] | {id, value, percentageChange, trend, last: .sparkline[-1], len: (.sparkline | length)}'
```

Expected: 8 rows; every `last` equals `value`; every `percentageChange` integer; `len` ≤ `days`.

## Out of Scope

- No changes to any existing endpoint or response shape
- No SSE / streaming
- Frontend integration (separate task — the frontend will collapse its 12 dashboard calls into this single endpoint)
