# QUANTIQEN V1 — Frontend ↔ Live Backend Integration Task

> **Status legend:** ⬜ Not started · 🔄 In progress · ✅ Done · 🚫 Blocked / deferred
> **Gates (run at every phase):** `npm run lint` · `npx tsc --noEmit` · `npm run build`

---

## 0. Context & Confirmed Decisions

| Topic | Decision |
| --- | --- |
| Backends | **Two separate services.** Identity `https://quantiqen-identity.onrender.com` (`/api/v1/auth/*`, `/api/v1/portal/*`) — **strictly as-is, zero changes.** Platform `https://quantiqen-backend.onrender.com` (`/api/v1/*`, 116 endpoints, spec in [`docs/API.md`](API.md)) — verified live. |
| Scope | Full reads **and** writes for every core feature — no compromises. |
| Policies | **Both:** portal MFA/IP policy page kept untouched + platform guardrail policies (`6.4`–`6.10`) fully built. |
| Audit logs | **Both:** portal audit (auth/sessions) + platform hash-chained `GET /audit-logs` (`13.1`) via a source toggle. |
| Scans | Full dedicated Scanning page/section. |
| Teams | Full team management (not just a dropdown). |
| Real-time | **Polling only** — `GET /monitoring/recent` every 5s (backend's designed fallback). SSE (`12.1`) deferred. |
| Findings / AI Recommendations / general UI settings | **Mock retained** (no backend endpoints exist), integrated in a later step. Notifications inbox → **live** (`12.12`–`12.15`). |
| Dashboard | `GET /dashboard/summary` (`10.1`) + associated dashboard/analytics APIs (`10.2`–`10.9`). |
| Profile | Keep + fully verify the existing live identity integration. |
| Parked code | `ai-response.json`, `profile.json`, unused components (`DecisionTable`, `DecisionSidePanel`, `AIDecisionResult`, `AIDecisionError`, `useDecisions`, `decisionService`, `useAIBatchDecision`) — **retain, no deletions.** |
| Proxy | Same-origin Next.js rewrites (no CORS, no cookies needed for platform — JWT Bearer only). |
| Dead buttons | Wire ALL dead buttons and add missing controls (Regenerate/Create/Revoke keys, Reports View/Download/Generate, Asset CRUD, Profile Change Password, Analytics period selector, header org dropdown). |

### Endpoint coverage check

Every UI-capable group in `docs/API.md` has a home below. Intentionally excluded:

- `4.1`–`4.2` `POST /events` — machine ingestion (`X-API-KEY`), not portal UI.
- `14.2 /ready`, `14.4 /metrics` — ops text endpoints, no UI needed.
- `12.1` SSE — deferred (polling per decision).

### Remaining backend API gaps (to raise with backend team)

1. `GET /findings` · 2. AI recommendations list · 3. Global search · 4. Report PDF/binary export (JSON content only) · 5. General UI settings persistence · 6. Identity `/auth` + `/portal` documentation.

> **Resolved:** notifications inbox list + unread count + mark-read (`12.12`–`12.15`) now exist in `docs/API.md`.

---

## 1. Page ↔ API Mapping Matrix

| Route | Source after integration | Endpoints | Status |
| --- | --- | --- | --- |
| `/dashboard` | Real | `10.1 dashboard/summary` · `12.2 monitoring/recent` (activity) · `1.4 organizations/me` · `1.2 users` · `2.2 api-keys` · `10.4 api-usage` | ⬜ |
| `/analytics` | Real | `10.2`–`10.9` (8 charts ↔ 8 endpoints) + period selectors | ⬜ |
| `/monitoring` | Real | `12.2` 5s polling · counts `10.1` · **Situations `5.1`–`5.3`** · **Network observations `5.4`–`5.5`** | ⬜ |
| `/decision` | Real (findings tab = mock) | `6.1` `6.2` · `7.1`–`7.6` · `6.3` · `7.8` · `14.5` · **`8.1`–`8.9`** · AI pre-analysis `/ai/decision` unchanged | ⬜ |
| `/assets` | Real | `3.1`–`3.5` + filters · **relationships `3.6`–`3.8`** | ⬜ |
| `/api-management` | Real | `2.1`–`2.4` · usage `10.4` | ⬜ |
| `/reports` | Real | `11.1`–`11.6` | ⬜ |
| `/organization` | Real | `1.4` + counts from `10.1`/`1.2`/`2.2`/`3.2` | ⬜ |
| `/organization/policy` | Portal (as-is) | identity `PATCH /portal/policy` | ✅ existing |
| `/organization/guardrail-policies` **(new)** | Real | `6.4`–`6.10` | ⬜ |
| `/organization/audit-log` | **Both** | Portal audit + Platform `13.1` (source toggle) | ⬜ |
| `/organization/compliance` **(new)** | Real | `11.7`–`11.9` | ⬜ |
| `/organization/teams` **(new)** | Real | `7.8`–`7.14` | ⬜ |
| `/organization/users`, `/sessions` | Identity as-is | `/portal/*` | ✅ existing |
| `/profile` | Identity as-is + dead-button fix | `/portal/me`, `authApi.changePassword` | 🔄 |
| `/scans` **(new)** | Real | `9.1`–`9.8` | ⬜ |
| `/platform-ops` **(new, admin)** | Real | `14.3`, `14.5`–`14.12` | ⬜ |
| `/notifications` | Real | `12.12` list · `12.13` unread-count · `12.14` mark-read · `12.15` read-all | ✅ |
| `/ai-recommendations` | Mock retained | none exist | 🚫 |
| `/settings` | General mock retained; alert toggles → `12.3`/`12.4` | `12.3`–`12.5` | ⬜ |
| Findings tab (`/decision`) | Mock retained | none exist | 🚫 |

---

## 2. Phase-by-Phase Plan

### Phase 1 — Dual-Backend Infrastructure & Service Layer ✅

- [x] `next.config.ts`: add `{ source: "/platform/:path*", destination: "${NEXT_PUBLIC_PLATFORM_API_URL}/api/v1/:path*" }`
- [x] `.env`: add `NEXT_PUBLIC_PLATFORM_API_URL=https://quantiqen-backend.onrender.com` (identity rewrites untouched)
- [x] `src/lib/platform-axios.ts`: axios instance `baseURL: "/platform"`, Bearer token from `token-manager`, 401 → single-flight refresh via identity `/api/v1/auth/refresh` (shared `src/lib/refresh-token.ts` also used by `lib/axios.ts`)
- [x] `src/lib/api-error.ts`: normalize nested `{ error: { code, message, request_id } }` → typed `ApiError`
- [x] Update `src/utils/errorMessages.ts` `getFriendlyError()` for the nested envelope
- [x] `src/types/api.types.ts`: `ApiErrorEnvelope`, `ApiError`, pagination variants (A, A-keyed, B, offset, bare-array)
- [x] No page behavior changes; profile/auth regression check

### Phase 2 — Dashboard & Analytics ✅

- [x] `dashboard.service.ts` → `GET dashboard/summary` aggregator (org, users, api-keys, pending decisions, `analytics/api-usage?period=day`, `analytics/security-score-timeline?days=14`); 8 KPI cards (3 scores + Findings/Events/Decisions/Assets/API Keys), sparkline on security card
- [x] WelcomeBar/plan badge ← `1.4 organizations/me` via shared `useOrganization()` hook (header + user-nav mock removed)
- [x] (Dashboard activity/history from real endpoints; no dead fields kept)
- [x] `analyticsService.ts` → 8 endpoints + point mappers (`snapshotDate→date`, decision-trend long→wide, `tier/category→name`, `shortDate`, `titleCase`)
- [x] `useAnalytics(days)` single typed query keyed `["analytics", days]` (mappers co-located; no behavior loss)
- [x] **Period selector added** on Analytics page (7/14/30 days) + subtitles on all 4 charts

### Phase 3 — Monitoring + Situations + Network Observations ✅

- [x] `GET /monitoring/recent` — 5s `refetchInterval`, buffer **replaced** each poll (cursor accumulation dropped: sequence-id cursor bug risk; `hasMore` unused), map `{id,type,payload,createdAt}` → `MonitoringEvent` (label humanization + severity heuristic)
- [x] Monitoring stats ← `10.1 counts` (+ `10.4` api-usage today for API Requests) — 6 pills renamed (API Requests/Assets/Decisions/Risks/Events/Findings)
- [x] **NEW:** severity filter on the feed (select in tab bar)
- [x] **NEW:** Situations tab — list (`5.1` status/severity filters + pagination), detail dialog (`5.2`), status-transition buttons honoring ACTIVE→INVESTIGATING→RESOLVED→CLOSED (`5.3`, analyst/admin via `useRole`)
- [x] **NEW:** Network Observations tab — list (`5.4` type/severity/status filters + pagination), detail dialog (`5.5`) with details JSON

### Phase 4 — Decision Center ✅

- [x] Revive `decisionService`/`useDecisions`: `GET /decisions` (pagination + `status/severity/dateFrom/dateTo/assignedToUserId` filters), list → `DecisionListItem` rendered by revived `DecisionTable`
- [x] Detail panel ← `GET /decisions/:id`: risk (score/tier/confidence/drivers/aiSummary), `recommendation`, `finding`, `history[]`, `engineVersions` — new `DecisionDetailPanel.tsx`
- [x] Mutations: `7.1 approve` (note), `7.2 reject` (reason), `7.3 assign` (picker ← `1.2 users`), `7.7 assign-team` (← `7.8`), notes `7.4`–`7.6` (author-only edit), `6.3 analyze` (202 → toast + invalidate)
- [x] **NEW:** Remediation section — submit (`8.1` w/ evidences) + list (`8.2`)
- [x] **NEW:** Verification section — submit (`8.4`) + list (`8.5`); PASS→VERIFIED / FAIL→REOPENED toasts
- [x] **NEW:** Corrections (`8.7`–`8.9`) per evidence link via `CorrectionDialog` (existing corrections list + create)
- [x] Health banner → `14.5 system/health` (platformState/suspension banner); findings tab stays mock; `/ai/decision` untouched (Run AI Analysis preserved)
- [x] RBAC gating (`useRole`) on admin/analyst-only actions; 409 → friendly toast (added to `getFriendlyError`)

### Phase 5 — Assets ✅

- [x] `GET /assets` with `assetType/status/criticality/environment` query filters (client search/paging retained in DataTable)
- [x] **NEW buttons:** Add Asset dialog (`3.1`, full DTO incl. exposure/impacts, admin-only), row detail drawer (`3.3`), inline edit (`3.4`), soft delete (`3.5`, confirm AlertDialog)
- [x] **NEW:** relationships section (`3.6` create, `3.7` list, `3.8` remove) in detail panel
- [x] `meta` computed client-side (total/active/inactive/unknown from unfiltered list); 422 validation messages inline in form dialog

### Phase 6 — API Management ✅

- [x] `GET /api-keys` list; **wire dead "Regenerate Key" → `2.3 rotate`** (new rawKey shown once in `RawKeyDialog`, 24h grace note)
- [x] **NEW:** Create dialog (`2.1`, rawKey shown once + copy + warning); **NEW:** Revoke (`2.4`, admin-only, confirm)
- [x] Usage ← `10.4 api-usage?period=day` (last-7-day bar strip + Requests Today pill); `meta {total, active, expired, revoked}` computed

### Phase 7 — Reports ✅

- [x] `GET /reports` (`11.2`, envelope key `reports`, `status/reportType/dateFrom/dateTo/page/limit` filters + pagination)
- [x] **Wire dead View → `11.3`/`11.5` version viewer** (version selector, sections render, correction note banner); **Download → serialize version content to file** (client-side `.md`, no download endpoint exists)
- [x] **NEW:** Generate dialog (`11.1`: reportType/title/description/date range, admin-only)
- [x] Status transitions (`11.6`) as buttons per state machine + `correctionNote` prompt on IN_REVIEW→GENERATED rollback
- [x] `meta.total` ← `total`

### Phase 8 — Organization: Overview + Guardrail Policies + Dual Audit + Compliance ✅

- [x] Overview ← `1.4` + computed counts (`users`, `apiKeys`, `assets`, `domains`); hide unsupported mock fields
- [x] **NEW:** Guardrail policies page — list (`6.4`, status filter), create/edit rules builder (`6.7`/`6.8`, field/operator/action matrices), activate (`6.9`, version snapshot), archive (`6.10`), version history (`6.5`/`6.6`); admin-only mutations
- [x] Portal MFA/IP policy page: **completely untouched**
- [x] Audit log source toggle: Portal audit (existing) | Platform `13.1` (filters `action/resourceType/actorUserId/from/to`, `page/limit` default 50, envelope key `data`, `@RequireAdminOrAuditor`)
- [x] **NEW:** Compliance section (`11.7` frameworks → `11.8` framework+controls → `11.9` control detail) replacing mock compliance card

### Phase 9 — Scans + Teams ✅

- [x] **NEW `/scans`:** scan policy CRUD (`9.1`–`9.4`: asset, scanTypes multi-select, interval, enable), trigger (`9.5`, asset picker, 202 queued), job list + status filter (`9.6`), job detail + results (`9.7`/`9.8`); admin-only writes; `scanEnabled=false` 403 → clear message
- [x] **NEW `/organization/teams`:** list (`7.8`), create (`7.10`), edit (`7.11`), deactivate (`7.12`), detail + members (`7.9`), add/upsert member (`7.13`, lead flag), remove (`7.14`)
- [x] Wire `assign-team` from the decision panel; add sidebar nav entries *(assign-team already wired in Phase 4; nav entries added)*

### Phase 10 — Webhooks, Deliveries & Notification Preferences ✅

- [x] **NEW webhook manager:** register (`12.6`), list (`12.7`, secrets stripped), update (`12.8`), delete (`12.9`), test (`12.10`)
- [x] **NEW delivery audit log:** `12.11` + `status` filter
- [x] Wire Settings alert toggles → `12.3` upsert / `12.4` list / `12.5` delete (channel + email per notification type)
- [x] General UI settings (theme/language/timezone/date format) remain local mock-retained

### Phase 11 — Platform Ops (admin) ✅

- [x] **NEW `/platform-ops`** (admin-only nav): status rollup (`14.3`), system health (`14.5`), suspension metrics (`14.6`), DLQ overview (`14.7`) + failures list w/ filters (`14.8`) + replay w/ dry-run (`14.9`), incidents list/create/status transitions (`14.10`–`14.12`)

### Phase 12 — Mock-Retained Pages + Profile/Header Fixes ✅

- [x] Annotate `@mock-retained` on notifications, findings, recommendations, general settings services
- [x] **Wire dead Profile "Change Password"** → existing `authApi.changePassword` (identity as-is); end-to-end profile verification pass
- [x] **Wire header org dropdown** → `1.4 organizations/me`; plan badge ← `planTier`
- [x] No deletions of parked assets

### Phase 13 — Hardening & QA ✅

- [x] RBAC matrix audit: every write gated to match `@RequireAdmin` / `@RequireAnalystOrAdmin` / `@RequireAdminOrAuditor` (13/13 OK, 0 mismatches)
- [x] Error pass: nested-envelope 401/403/404/409/422/429 toasts (+429, 404 server message, generic status fallback added), `retry: 1` on queries, per-page empty/loading states
- [x] Responsive + light/dark pass on every touched page (theme vars only, no hardcoded colors, overflow-x-auto tables)
- [x] **Gates:** `npm run lint` · `npx tsc --noEmit` · `npm run build` (matches CI) — all ✓, 25 routes
- [x] Update `README.md` mock→live status; check off this file

---

## 3. TypeScript Types (new) — `src/types/platform/`

| File | Contents |
| --- | --- |
| `api.types.ts` | `ApiErrorEnvelope`, `ApiError`, `PaginatedA<T,K>`, `PaginatedB<T>`, `PaginatedOffset<T>` |
| `dashboard-api.types.ts` | `DashboardSummaryResponse`, `DashboardCounts`, `ScoreCard`, `ScoreBreakdown` |
| `analytics-api.types.ts` | 8 point types (`RiskTrendPoint`, `DecisionTrendRow`, `ApiUsagePoint`, `SecurityScorePoint`, `RiskDistributionPoint`, `AssetCategoryPoint`, `ThreatPoint`, `DailyDecisionPoint`) |
| `monitoring-api.types.ts` | `MonitoringRecentResponse`, `StreamEvent` |
| `situation.types.ts` | `Situation`, `SituationDetail`, `SituationStatus` |
| `network-observation.types.ts` | `NetworkObservation`, `NetworkObservationDetail`, filters |
| `decision-api.types.ts` | `DecisionListItem`, `DecisionDetail`, `DecisionRisk`, `DecisionRecommendation`, `DecisionNote`, `DecisionHistoryItem`, `EngineVersions`, mutation requests/responses, remediation/verification/correction types |
| `asset-api.types.ts` | `Asset`, `CreateAssetRequest`, `UpdateAssetRequest`, `AssetRelationship` |
| `api-key.types.ts` | `ApiKey`, `CreateApiKeyRequest`, `RotateApiKeyResponse` |
| `report-api.types.ts` | `Report`, `ReportVersion`, `GenerateReportRequest`, `ReportContent` |
| `policy-api.types.ts` | `Policy`, `PolicyRule`, `PolicyVersion`, `CreatePolicyRequest` |
| `audit-log-platform.types.ts` | `PlatformAuditLogEntry`, envelope, params |
| `compliance.types.ts` | `Framework`, `FrameworkControl`, `ControlDetail` |
| `team.types.ts` | `Team`, `TeamMember`, mutation requests |
| `scan.types.ts` | `ScanPolicy`, `ScanJob`, `ScanResult`, mutation requests |
| `webhook.types.ts` | `WebhookEndpoint`, `WebhookDelivery`, `NotificationPreference` |
| `ops.types.ts` | `StatusRollup`, `SystemHealth`, `SuspensionMetrics`, `DlqOverview`, `DlqFailure`, `SystemIncident` |

Existing `src/types/*.types.ts` remain **view models**; mappers live beside services. No `any`. No duplicate definitions.

## 4. Mock Disposition

| Mock file | Decision |
| --- | --- |
| `dashboard`, `analytics`, `monitoring`, `assets`, `api-management`, `reports`, `organization`, `decisions` | **Replace** |
| `findings`, `recommendations`, `settings` | **Retain** (no endpoints — later step) |
| `notifications` | **Retired from use** (service now calls `12.12`–`12.15`; JSON kept parked, not deleted) |
| `profile`, `ai-response` | **Retain parked** (unused, harmless) |

## 5. Proposed New Routes

`/scans` · `/organization/teams` · `/organization/guardrail-policies` · `/organization/compliance` · `/platform-ops` (admin-gated) + Monitoring tabs (Situations / Network Observations) + audit-log source toggle.

---

## Execution Log

| Date | Phase | Notes |
| --- | --- | --- |
| 2026-10-07 | Plan finalized | All scope decisions confirmed; `docs/TASK.md` created |
| 2026-10-07 | Phase 1 ✅ | Dual-backend proxy + `platformApi` + shared refresh + error envelope; gates: tsc ✓ lint ✓ proxy smoke test 200 |
| 2026-10-07 | Phase 2 ✅ | Dashboard + Analytics on real endpoints, org hook, header plan badge, 7/14/30 period selector; gates: tsc ✓ lint ✓ |
| 2026-10-07 | Phase 3 ✅ | Monitoring stats + feed severity filter + Situations/Network Observations tabs (list/detail/filters/pagination/transitions); gates: tsc ✓ lint ✓ |
| 2026-10-07 | Phase 4 ✅ | Decision list/detail/actions/notes/remediation/verification/corrections; system/health banner; shared `useUsers`/`useTeams`; 409 in getFriendlyError; new `textarea`/`label` UI primitives; gates: tsc ✓ lint ✓ |
| 2026-10-07 | Phase 5 ✅ | Assets on `/assets` (server filters, create/edit/delete, relationships drawer, client meta pills, inline 422 errors); gates: tsc ✓ lint ✓ |
| 2026-10-07 | Phase 6 ✅ | API keys list/create/rotate/revoke + one-time rawKey dialog + api-usage bars; gates: tsc ✓ lint ✓ |
| 2026-10-07 | Phase 7 ✅ | Reports list/filters/generate/version viewer/download (client .md)/status transitions + correction note; gates: tsc ✓ lint ✓ |
| 2026-10-07 | Phase 8 ✅ | Org overview → 1.4 + computed counts; new guardrails page (6.4–6.10 rules builder/activate/archive/versions); dual audit toggle (portal \| 13.1); new compliance page (11.7–11.9); routes/nav added; gates: tsc ✓ lint ✓ |
| 2026-10-07 | Phase 9 ✅ | New /scans (policies CRUD/toggle/trigger + jobs status filter + results dialog); new /organization/teams (CRUD, members upsert/remove, lead flag, deactivate); sidebar nav; gates: tsc ✓ lint ✓ |
| 2026-10-07 | Phase 12 ✅ | @mock-retained annotations (settings/notifications/findings/recommendations services); Profile Change Password wired → authApi.changePassword; header org name ← 1.4 orgName (planTier badge already live); gates: tsc ✓ lint ✓ |
| 2026-10-07 | Phase 13 ✅ | RBAC audit 13/13 OK (0 mismatches); error pass: +429, 404/generic server messages (fixed cp1252 byte breaking build); README mock→live rewrite; final gates: lint ✓ tsc ✓ build ✓ (25 routes) |
| 2026-10-07 | Phase 10 ✅ | Settings: notification preferences (12.3–12.5 upsert/list/delete w/ channels+emails), webhook manager (12.6–12.10), delivery log (12.11 status filter); general UI settings mock-retained; gates: tsc ✓ lint ✓ |
| 2026-10-07 | Phase 11 ✅ | New /platform-ops (admin-only nav): status 14.3 + health 14.5 + suspension 14.6, DLQ 14.7–14.9 (filters, dry-run/replay), incidents 14.10–14.12 (state machine + resolution notes); gates: tsc ✓ lint ✓ |
| 2026-10-11 | Phase 14 ✅ | Notifications inbox live → `12.12`–`12.15`: list (stream/unreadOnly filters, flat envelope pagination), unread-count badge (30s poll), mark-one-read (analyst/admin), read-all (admin, confirm dialog); client-side type→label/severity/link/payload-message mapping; bell ← `12.13` `count`; mock JSON parked unused; gates: tsc ✓ lint ✓ build ✓ (27 routes) |
| 2026-10-11 | Reports export ✅ | View crash + download `sections is not iterable` fixed via generic `normalizeReportContent` (live `content` is type-specific — API.md §11.3/11.5 shape mismatch); Download → menu (md / structured CSV / direct PDF via lazy jsPDF); new `report-content.ts`, `report-export.ts`, `ReportDownloadMenu`; gates: tsc ✓ lint ✓ build ✓ |
