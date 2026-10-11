# QUANTIQEN — Application Notification (In-App Inbox) API — Backend Implementation Reference

> **Purpose:** This document is the authoritative contract for the **new in-app notification
> inbox API** that the backend must implement. It closes the gap where the frontend
> `/notifications` page and header bell currently consume **mock data only**
> (`src/features/notifications/services/notification.service.ts` is annotated
> `@mock-retained`; see `docs/TASK.md` line 61: *"Mock retained — none exist"*).
>
> **Scope:** 4 read/read-state endpoints appended to the existing `/api/v1/notifications/*`
> namespace (planned as **§12.12–12.15** in `docs/API.md`). The existing §12.3–12.11
> (preferences / webhooks / deliveries) are **unchanged** and do not overlap — method+path
> combinations are distinct.
>
> **Companion docs:** [`docs/API.md`](API.md) — Part 0 (global conventions, error envelope,
> pagination variants) is **normative** and applies to every endpoint below without
> repetition. [`docs/TASK.md`](TASK.md) — frontend wiring status.

---

## Table of Contents

1. [Context & Gap Summary](#1-context--gap-summary)
2. [Design Decisions](#2-design-decisions)
3. [Canonical Resource Schema](#3-canonical-resource-schema)
4. [Endpoint Specifications](#4-endpoint-specifications)
   - [§12.12 GET /api/v1/notifications — List inbox](#41-1212-get-apiv1notifications--list-inbox)
   - [§12.13 GET /api/v1/notifications/unread-count — Badge count](#42-1213-get-apiv1notificationsunread-count--badge-count)
   - [§12.14 PATCH /api/v1/notifications/:id/read — Mark one read/unread](#43-1214-patch-apiv1notificationsidread--mark-one-readunread)
   - [§12.15 POST /api/v1/notifications/read-all — Mark all read](#44-1215-post-apiv1notificationsread-all--mark-all-read)
5. [Read-State Management Rules](#5-read-state-management-rules)
6. [Enum & Label Mapping Tables](#6-enum--label-mapping-tables)
7. [Immutability & Compliance Invariants](#7-immutability--compliance-invariants)
8. [Suggested Persistence Model (non-normative)](#8-suggested-persistence-model-non-normative)
9. [Optional Enhancement: Real-Time via SSE](#9-optional-enhancement-real-time-via-sse)
10. [Frontend Consumption Appendix](#10-frontend-consumption-appendix)

---

## 1. Context & Gap Summary

The frontend has a fully built in-app notification inbox that has **no backend**:

| Area | Current state | Gap |
| ---- | ------------- | --- |
| `/notifications` page (`src/features/notifications/`) | Renders from mock JSON via `@mock-retained` service | No list endpoint, no pagination, no filters |
| Header bell (`src/components/layout/header/notification-bell.tsx`) | Shows static `unreadCount: 4` from mock | No unread-count endpoint; badge can never change |
| Read state | Static `read: boolean` in mock | No mark-as-read endpoint or action anywhere |
| Type vocabulary | 5 human labels (`"New Risk"`, …) in `src/types/notification.types.ts` | Does not match the 10 platform enums in `src/types/platform/notification-api.types.ts` used by preferences/webhooks/deliveries |
| Severity vocabulary | Lowercase `info\|success\|warning\|critical` | Backend convention is uppercase enums |
| Real-time | SSE `/api/v1/events` (§12.1) exists | Never emits notification frames |
| Retention | — | **Notifications must be permanent and immutable** (audit/compliance). No delete, no archive, no purge via API. |

The settings-side notification subsystems (preferences §12.3–12.5, webhooks §12.6–12.10,
delivery audit log §12.11) already exist and are **out of scope** — this contract only adds
the user-facing inbox.

---

## 2. Design Decisions

| # | Decision | Choice | Rationale |
| - | -------- | ------ | --------- |
| D1 | `type` enum | Platform `NotificationType` — 10 × SCREAMING_SNAKE, exactly as in `src/types/platform/notification-api.types.ts` | One vocabulary across preferences, webhooks, deliveries **and** inbox. Frontend maps enum → display label via [§6](#6-enum--label-mapping-tables). |
| D2 | `severity` enum | `CRITICAL \| WARNING \| SUCCESS \| INFO` (uppercase) | Matches backend enum style (e.g. §5.4 uses `CRITICAL\|HIGH\|MEDIUM\|LOW\|INFO`). Frontend lowercases once to feed the existing `severityConfig` map unchanged. |
| D3 | Pagination | **Envelope B** — `{ "items": [...], "pagination": { "page", "limit", "total", "totalPages" } }` plus a top-level `unreadCount` | Same shape as network-observations (§5.4). `unreadCount` rides on the list response so the page pill / bell stay synced in the same round-trip. |
| D4 | Scope | Rows keyed `(organizationId, userId)`; both derived from the JWT (`org_id`, `user_id` claims) — **never** from query/body | Personal inbox; cross-tenant and cross-user access impossible by construction; ID enumeration resistance. |
| D5 | Write RBAC | **Self-service mutation allowed for all 4 roles** (`CUSTOMER_ADMIN`, `ANALYST`, `AUDITOR`, `READ_ONLY`) | Marking *your own* notification read is not a privileged action; excluding AUDITOR/READ_ONLY from clearing their own badge would be wrong. **Explicit exception** to the Part 0.3 matrix row *"No decorator + write → 403"* — implement via a dedicated decorator (e.g. `@RequireAnyRole()`) or equivalent per-route write exemption. Reads remain GET default-allow. |
| D6 | Read semantics | **Idempotent.** PATCH to the state the row is already in → `200` with the unchanged object (never `409`) | Multi-tab / mobile double-taps must not surface errors. |
| D7 | `unreadCount` | Derived: `COUNT(*) WHERE organizationId = ? AND userId = ? AND read = false` (optionally Redis-cached, invalidated on every write) | Single source of truth; avoids the mock's hardcoded drift. |
| D8 | Content mutations | **Forbidden.** `title`, `message`, `type`, `severity`, `link`, `metadata`, `createdAt` are write-once at creation time | See [§7](#7-immutability--compliance-invariants). |
| D9 | Delete / archive | **Not offered. No endpoint. Ever.** | Audit-trail and compliance requirement: notifications are permanent records. (Contrast: webhook endpoints §12.9 deliberately *do* soft-delete — that is a different resource class.) |
| D10 | Cross-tenant / unknown id | Always `404 NOT_FOUND` (never `403`) | Matches the existing "resource missing or cross-tenant" convention; prevents ID probing. |
| D11 | `link` | Optional string or `null`. When `null`, frontend falls back to `/notifications` | Backend is not coupled to frontend routing; [§6](#6-enum--label-mapping-tables) suggests values but they are non-normative. |
| D12 | Sort | Fixed `createdAt DESC, id DESC` tie-break | Stable pagination; newest first matches the mock's ordering. |

---

## 3. Canonical Resource Schema

Every success payload that returns a notification uses **exactly** this shape.
Field types use TypeScript notation; `string` values in timestamps are ISO-8601 UTC
(`2026-10-11T10:30:00.000Z`), consistent with every other endpoint in `docs/API.md`.

| Field | Type | Nullable | Notes |
| ----- | ---- | -------- | ----- |
| `id` | `string (uuid)` | no | Server-generated primary key. Prefixed id style like `ntf-0001-2233-4455-66778899aabb` is acceptable if consistent with existing resources. |
| `organizationId` | `string (uuid)` | no | From JWT `org_id`. Echoed for parity with sibling resources (e.g. `WebhookDelivery`). |
| `userId` | `string (uuid)` | no | From JWT `user_id`. The inbox owner. |
| `type` | `NotificationType` | no | One of the 10 platform enums — see [§6.1](#61-notificationtype--10-values). **Immutable after creation.** |
| `severity` | `NotificationInboxSeverity` | no | `CRITICAL \| WARNING \| SUCCESS \| INFO`. **Immutable after creation.** |
| `title` | `string` (1–200 chars) | no | Short headline. **Immutable.** |
| `message` | `string` (1–4000 chars) | no | Body text. **Immutable.** |
| `read` | `boolean` | no | Initial `false`. The **only** client-mutable content field (via §12.14 / §12.15). |
| `readAt` | `string (ISO-8601)` | **yes** | `null` while unread. Set to `now()` on the first `unread → read` transition; reset to `null` on `read → unread`. |
| `link` | `string` | **yes** | Optional frontend route (e.g. `"/monitoring"`). `null` allowed at any time. **Immutable.** |
| `metadata` | `Record<string, unknown>` | no | Opaque context bag (e.g. `{ "findingId": "fnd-0001", "assetId": "a1b2c3d4-..." }`). May be `{}`. **Immutable.** |
| `createdAt` | `string (ISO-8601)` | no | Creation timestamp; the sort key for the list. |

**There is no `updatedAt`, no `deletedAt`, and no status/archive field.** Content never
changes after creation; the only timestamp that can move is `readAt`.

### 3.1 Example notification object

```json
{
  "id": "ntf-0001-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "userId": "3f6c0a2e-8b1d-4e7a-9c3f-1a2b3c4d5e6f",
  "type": "CRITICAL_RISK_DETECTED",
  "severity": "CRITICAL",
  "title": "Critical Risk Detected",
  "message": "A critical SQL injection vulnerability has been detected on api.acmecorp.com",
  "read": false,
  "readAt": null,
  "link": "/monitoring",
  "metadata": { "findingId": "fnd-0001", "assetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890" },
  "createdAt": "2026-10-11T10:30:00.000Z"
}
```

### 3.2 Example — read notification

```json
{
  "id": "ntf-0002-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "userId": "3f6c0a2e-8b1d-4e7a-9c3f-1a2b3c4d5e6f",
  "type": "NEW_DECISION_READY",
  "severity": "SUCCESS",
  "title": "New AI Decision Ready",
  "message": "AI has generated 3 new security decisions for your review in the Decision Center",
  "read": true,
  "readAt": "2026-10-11T11:00:00.000Z",
  "link": "/decision",
  "metadata": { "decisionCount": 3 },
  "createdAt": "2026-10-11T09:15:00.000Z"
}
```

---

## 4. Endpoint Specifications

**Auth for all 4 endpoints:** Bearer JWT (QIP JWT — EdDSA, claims `org_id`, `user_id`,
`role`, `session_id`). Not `X-API-KEY`.

**Common rules (apply to every endpoint below, not repeated per-section):**

- Org and user scope always come from the JWT — never from path, query, or body.
- Non-2xx responses use the exact envelope from API.md Part 0.4:
  `{ "error": { "code": "...", "message": "...", "request_id": "..." } }`.
- **401** for missing/malformed/expired JWT — standard block:

```json
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655441200"
  }
}
```

- **500** for unhandled failures — standard block:

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655441201"
  }
}
```

- **404** for any notification id that does not exist **or** belongs to another user/org
  (D10 — anti-enumeration; message is identical in both cases):

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Notification not found",
    "request_id": "550e8400-e29b-41d4-a716-446655441202"
  }
}
```

---

### 4.1 §12.12 `GET /api/v1/notifications` — List inbox

**Auth:** Bearer JWT · **RBAC:** GET default-allow (all 4 roles) · **Status:** `200`

Paginated, filtered list of the current user's notifications, newest first.

#### Query Parameters

| Name | Type | Required | Validation / default |
| ---- | ---- | -------- | -------------------- |
| `status` | enum `UNREAD \| READ` | no | Omit = all. Invalid value → 422. |
| `type` | `NotificationType` (10 values, §6.1) | no | Invalid value → 422. |
| `severity` | enum `CRITICAL \| WARNING \| SUCCESS \| INFO` | no | Invalid value → 422. |
| `startDate` | ISO-8601 date-time | no | Filter `createdAt >= startDate`. Invalid → 422. |
| `endDate` | ISO-8601 date-time | no | Filter `createdAt <= endDate`. Invalid → 422. If both set, `startDate <= endDate` else 422. |
| `page` | int | no | Default `1`. `< 1` → 422. |
| `limit` | int | no | 1–100, default `20`. Out of range → 422. |

Path parameters: none. Request body: none.

Sorting: `createdAt DESC`, tie-break `id DESC` (D12).

#### Success Response Schema (JSON) — envelope B + `unreadCount`

```json
// 200 OK
{
  "items": [
    {
      "id": "ntf-0001-2233-4455-66778899aabb",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "userId": "3f6c0a2e-8b1d-4e7a-9c3f-1a2b3c4d5e6f",
      "type": "CRITICAL_RISK_DETECTED",
      "severity": "CRITICAL",
      "title": "Critical Risk Detected",
      "message": "A critical SQL injection vulnerability has been detected on api.acmecorp.com",
      "read": false,
      "readAt": null,
      "link": "/monitoring",
      "metadata": { "findingId": "fnd-0001" },
      "createdAt": "2026-10-11T10:30:00.000Z"
    },
    {
      "id": "ntf-0002-2233-4455-66778899aabb",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "userId": "3f6c0a2e-8b1d-4e7a-9c3f-1a2b3c4d5e6f",
      "type": "NEW_DECISION_READY",
      "severity": "SUCCESS",
      "title": "New AI Decision Ready",
      "message": "AI has generated 3 new security decisions for your review in the Decision Center",
      "read": true,
      "readAt": "2026-10-11T11:00:00.000Z",
      "link": "/decision",
      "metadata": { "decisionCount": 3 },
      "createdAt": "2026-10-11T09:15:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 },
  "unreadCount": 17
}
```

| Field | Type | Notes |
| ----- | ---- | ----- |
| `items` | `Notification[]` | Page slice, schema §3. |
| `pagination.page` | `int` | Echo of requested/effective page. |
| `pagination.limit` | `int` | Echo of requested/effective limit. |
| `pagination.total` | `int` | Total rows **matching the filters** (`status`, `type`, `severity`, date range). |
| `pagination.totalPages` | `int` | `ceil(total / limit)`; `0` when `total` is `0`. |
| `unreadCount` | `int` | **Unfiltered** unread count for the user (all types/severities). Deliberately independent of the query filters so the badge is always the global truth (see §5.4). |

**Empty inbox:**

```json
// 200 OK — no notifications at all
{
  "items": [],
  "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 },
  "unreadCount": 0
}
```

#### Error Response Schema (JSON)

```json
// 422 Unprocessable Entity — invalid enum / bad date / limit out of range / unknown query key
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "status must be one of the following values: UNREAD, READ; limit must not be greater than 100",
    "request_id": "550e8400-e29b-41d4-a716-446655441203"
  }
}
```

> Same 422 class as §5.4 — DTO-validated `@Query()`; messages joined with `'; '`
> per the global `AppValidationPipe` behavior (Part 0.4).

*(401 / 500 — see the common blocks at the top of §4. No 403/404 cases exist for this
endpoint.)*

---

### 4.2 §12.13 `GET /api/v1/notifications/unread-count` — Badge count

**Auth:** Bearer JWT · **RBAC:** GET default-allow (all 4 roles) · **Status:** `200`

Lightweight endpoint for the header bell — cheap enough to poll every 15–30 s.
Path and query parameters: none. Request body: none.

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "unreadCount": 17
}
```

| Field | Type | Notes |
| ----- | ---- | ----- |
| `unreadCount` | `int >= 0` | Global unread count for `(orgId, userId)`, unfiltered. |

*(Errors: common 401 / 500 only.)*

---

### 4.3 §12.14 `PATCH /api/v1/notifications/:id/read` — Mark one read/unread

**Auth:** Bearer JWT · **RBAC:** Self-service write for **all 4 roles** (D5 — explicit
write-gate exception) · **Status:** `200`

Idempotently sets the read state of a single notification owned by the caller.

#### Path / Query Parameters

| Location | Name | Type | Required |
| -------- | ---- | ---- | -------- |
| path | `id` | `string (uuid)` | yes — notification id |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "read": true
}
```

| Field | Type | Required | Validation |
| ----- | ---- | -------- | ---------- |
| `read` | boolean | yes | Must be present and a boolean. Omitted → 422. Explicitly `null` → 422. |

> Alternative allowed by D6 if the backend prefers body-less PATCH: make `read` optional
> with default `true`. Either way the response is the full updated object. This contract
> **requires** the body form shown above (`read` required) for explicitness.

#### Behavior

| Current state | Requested | Effect | Response |
| ------------- | --------- | ------ | -------- |
| `read: false` | `read: true` | Set `read=true`, `readAt=now()` | `200` full object |
| `read: true` | `read: true` | **No-op** (do not touch `readAt`) | `200` unchanged object |
| `read: true` | `read: false` | Set `read=false`, `readAt=null` | `200` full object |
| `read: false` | `read: false` | **No-op** | `200` unchanged object |
| missing / other user / other org | any | — | `404` (common block) |

Never `409` for state conflicts (D6). Un-marking (`read: false`) is supported so a
mis-click is reversible; it is **not** an archive or delete — the row always remains.

#### Success Response Schema (JSON)

```json
// 200 OK — updated Notification (schema §3)
{
  "id": "ntf-0001-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "userId": "3f6c0a2e-8b1d-4e7a-9c3f-1a2b3c4d5e6f",
  "type": "CRITICAL_RISK_DETECTED",
  "severity": "CRITICAL",
  "title": "Critical Risk Detected",
  "message": "A critical SQL injection vulnerability has been detected on api.acmecorp.com",
  "read": true,
  "readAt": "2026-10-11T12:00:00.000Z",
  "link": "/monitoring",
  "metadata": { "findingId": "fnd-0001" },
  "createdAt": "2026-10-11T10:30:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 404 Not Found — missing, cross-tenant, or other user's notification
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Notification not found",
    "request_id": "550e8400-e29b-41d4-a716-446655441204"
  }
}
```

```json
// 422 Unprocessable Entity — read missing / not a boolean / unknown body key
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "read must be a boolean",
    "request_id": "550e8400-e29b-41d4-a716-446655441205"
  }
}
```

```json
// 400 Bad Request — id is not a valid uuid
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed (uuid version is supported)",
    "request_id": "550e8400-e29b-41d4-a716-446655441206"
  }
}
```

> Note on the 400-vs-422 split: follow whatever the existing backend does for invalid
> path uuids on sibling endpoints (e.g. §12.8 webhook `:id`). If path params are validated
> by the global `AppValidationPipe` as 422, use 422 here instead — consistency with the
> deployed backend wins over the illustrative block above. Document the chosen status in
> `docs/API.md` when the endpoint lands.

*(401 / 500 — common blocks. No 403: self-service write is allowed for every role, D5.)*

---

### 4.4 §12.15 `POST /api/v1/notifications/read-all` — Mark all read

**Auth:** Bearer JWT · **RBAC:** Self-service write for **all 4 roles** (D5) · **Status:** `200`

Idempotently marks every unread notification of the caller as read. Optionally scoped by
`type` and/or `severity` (e.g. "mark all critical as read").

#### Path / Query Parameters

None. Request body is the optional scope object below.

#### Request Body Schema (JSON)

```json
{
  "type": "CRITICAL_RISK_DETECTED",
  "severity": "CRITICAL"
}
```

| Field | Type | Required | Validation |
| ----- | ---- | -------- | ---------- |
| `type` | `NotificationType` | no | Invalid → 422. |
| `severity` | `CRITICAL \| WARNING \| SUCCESS \| INFO` | no | Invalid → 422. |

Both omitted (or empty body `{}`) = mark **all** unread → read. Only provided fields
apply (AND semantics when both present). Unknown keys → 422.

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "updatedCount": 17,
  "unreadCount": 0
}
```

| Field | Type | Notes |
| ----- | ---- | ----- |
| `updatedCount` | `int >= 0` | Number of rows actually transitioned `unread → read` this call. `0` on an idempotent repeat. |
| `unreadCount` | `int >= 0` | **Remaining** unread count after the update (for the unfiltered inbox). When scope filters are omitted this is always `0`. When scoped, it is the count of still-unread rows outside the scope. |

> `readAt` is set to `now()` for every row in `updatedCount`. Rows already read are not
> touched — their original `readAt` is preserved.

#### Error Response Schema (JSON)

```json
// 422 Unprocessable Entity — invalid scope enum / unknown key
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "type must be one of the following values: CRITICAL_RISK_DETECTED, NEW_DECISION_READY, CRITICAL_ASSET_EXPOSURE, API_USAGE_WARNING, INTEGRATION_FAILURE, SCAN_COMPLETED, SUBSCRIPTION_WARNING, REMEDIATION_SUBMITTED, DECISION_SLA_BREACHED, VERIFICATION_COMPLETED",
    "request_id": "550e8400-e29b-41d4-a716-446655441207"
  }
}
```

*(401 / 500 — common blocks. No 403 / 404 cases.)*

---

## 5. Read-State Management Rules

### 5.1 State machine

```
                 PATCH read:true  (or POST read-all)
   ┌──────────┐ ───────────────────────────────────────► ┌──────────┐
   │  UNREAD  │                                          │   READ   │
   │ read=false│ ◄────────────────────────────────────── │ read=true│
   │ readAt=null│        PATCH read:false                │readAt≠null│
   └──────────┘                                          └──────────┘
```

- Only two states. No archived / deleted / muted states exist (D8, D9).
- `readAt` is a **function of state**: `read ? (set once at transition) : null`.

### 5.2 Transition rules (normative)

| Rule | Specification |
| ---- | ------------- |
| R1 | `unread → read` sets `readAt = now()` (server clock, ISO-8601 UTC). |
| R2 | `read → unread` sets `readAt = null`. |
| R3 | Same-state requests are **no-ops**: return the row unchanged; do not rewrite `readAt`. |
| R4 | All transitions are **idempotent**; repeating any request never yields 409. |
| R5 | `read-all` performs one bulk `UPDATE ... SET read = true, readAt = now() WHERE ... AND read = false` — matching row count is returned as `updatedCount`. |
| R6 | Concurrent PATCHes on the same row are last-write-wins at the row level; no locking, no optimistic-version header required. The final state is always one of the two valid states. |
| R7 | Read-state changes **never** alter `type`, `severity`, `title`, `message`, `link`, `metadata`, or `createdAt` (immutable, §7). |
| R8 | Read-state changes are **per-user**; they never affect other users' copies of logically similar notifications. |

### 5.3 Idempotency & concurrency matrix

| Scenario | Expected behavior |
| -------- | ----------------- |
| PATCH `read:true` twice | `200` both times; second is no-op; `readAt` unchanged from first |
| read-all twice | First: `updatedCount: N`; second: `updatedCount: 0`, `unreadCount: 0` |
| PATCH `read:false` on unread row | `200`, no-op, `readAt` stays `null` |
| read-all racing per-item PATCH | Safe — both operate on `read = false` predicate; no error either way |
| Two tabs PATCH same id concurrently | Both `200`; final state deterministic (last committed write) |
| Request id from another user | `404` (never mutates, never confirms existence) |

### 5.4 `unreadCount` semantics

| Rule | Specification |
| ---- | ------------- |
| U1 | `unreadCount` = `COUNT(*)` of rows for `(organizationId, userId)` with `read = false`. |
| U2 | It is **never** filtered by `type` / `severity` / date — always the global truth for the user, so the header badge and the page pill cannot desync. |
| U3 | `pagination.total` reflects the **filtered** set; `unreadCount` does not. They may legitimately differ (e.g. `status=UNREAD&type=SCAN_COMPLETED` page has `total: 3` but `unreadCount: 17`). |
| U4 | Every mutation (single PATCH, read-all) must leave a cache (if any) invalidated or updated before the response is sent. |
| U5 | `GET /unread-count` and the `unreadCount` on the list response must be computed the same way — a client may switch between them freely. |

### 5.5 Pagination × filter interaction

- `status=UNREAD` filters `read = false`; `status=READ` filters `read = true`.
- Filtering happens **before** pagination — `items` is the page slice of the filtered set.
- Marking items read while viewing `status=UNREAD` means they will disappear on the next
  fetch; clients should invalidate the list query after mutations (see §10).
- `page` beyond `totalPages` returns `200` with `items: []` (not 404/422) — standard
  behavior for this backend's envelope-B endpoints.

---

## 6. Enum & Label Mapping Tables

### 6.1 `NotificationType` — 10 values

Exact source of truth: `src/types/platform/notification-api.types.ts`
(already used by preferences §12.3–12.5, webhooks §12.6–12.10, deliveries §12.11).

```
CRITICAL_RISK_DETECTED
NEW_DECISION_READY
CRITICAL_ASSET_EXPOSURE
API_USAGE_WARNING
INTEGRATION_FAILURE
SCAN_COMPLETED
SUBSCRIPTION_WARNING
REMEDIATION_SUBMITTED
DECISION_SLA_BREACHED
VERIFICATION_COMPLETED
```

### 6.2 Type → display label / default severity / suggested link

For the inbox backend: `title` and `message` are composed at creation time and stored —
the mapping below is **guidance for producers** (and the frontend label fallback), not
something the list endpoint computes. `link` values are **suggestions only** (D11); the
frontend falls back to `/notifications` whenever `link` is `null`.

| Backend enum | Frontend display label | Default severity | Suggested `link` |
| ------------ | ---------------------- | ---------------- | ---------------- |
| `CRITICAL_RISK_DETECTED` | Critical Risk | `CRITICAL` | `/monitoring` |
| `NEW_DECISION_READY` | Decision Generated | `SUCCESS` | `/decision` |
| `CRITICAL_ASSET_EXPOSURE` | Asset Exposure | `CRITICAL` | `/assets` |
| `API_USAGE_WARNING` | API Limit Warning | `WARNING` | `/api-management` |
| `INTEGRATION_FAILURE` | Integration Failure | `WARNING` | `/settings` |
| `SCAN_COMPLETED` | Scan Completed | `INFO` | `/scans` |
| `SUBSCRIPTION_WARNING` | Subscription Expiry | `WARNING` | `/settings` |
| `REMEDIATION_SUBMITTED` | Remediation Submitted | `INFO` | `/decision` |
| `DECISION_SLA_BREACHED` | Decision SLA Breached | `CRITICAL` | `/decision` |
| `VERIFICATION_COMPLETED` | Verification Completed | `SUCCESS` | `/decision` |

### 6.3 Severity mapping

| Backend (`NotificationInboxSeverity`) | Frontend (`EventSeverity`) | Visual (existing `severityConfig` in `src/constants/severity.ts`) |
| ------------------------------------- | -------------------------- | ----------------------------------------------------------------- |
| `CRITICAL` | `critical` | `AlertOctagon`, destructive |
| `WARNING` | `warning` | `AlertTriangle`, chart-3 |
| `SUCCESS` | `success` | `CheckCircle`, chart-2 |
| `INFO` | `info` | `Info`, chart-5 |

Frontend transformation: `severity.toLowerCase() as EventSeverity` — a single lowercase
conversion, same pattern already used in
`src/features/monitoring/components/NetworkObservationsPanel.tsx:62`.

> Deliberately a **4-value** severity (not the 5-value `CRITICAL|HIGH|MEDIUM|LOW|INFO`
> used by network observations) because the inbox UI is built around exactly four buckets
> (`severityConfig` in `src/constants/severity.ts` has four keys). Producers choose the
> closest of the four when fanning out platform events.

### 6.4 Legacy mock migration

Frontend mock data (`src/mock-data/notifications.json`) uses 5 human labels that must be
mapped when the real service replaces the mock:

| Mock label (legacy) | Mapped `NotificationType` |
| ------------------- | ------------------------- |
| `New Risk` | `CRITICAL_RISK_DETECTED` |
| `Decision Generated` | `NEW_DECISION_READY` |
| `API Limit Warning` | `API_USAGE_WARNING` |
| `Subscription Expiry` | `SUBSCRIPTION_WARNING` |
| `System Update` | `SCAN_COMPLETED` *(closest available; `INTEGRATION_FAILURE` if it was an incident)* |

Mock severities (`critical`, `success`, `warning`, `info`) uppercase 1:1 to the backend
enum — no lossy mapping.

---

## 7. Immutability & Compliance Invariants

These are **hard requirements** — violations are bugs, not enhancements.

| # | Invariant |
| - | --------- |
| I1 | **No DELETE endpoint.** Notification rows are never removed via the public API. |
| I2 | **No archive endpoint, no archive/status flag.** There is no concept of archived notifications. |
| I3 | **No purge/bulk-delete endpoint.** Not for users, not for admins, not for org-scoped cleanup. |
| I4 | Content fields — `type`, `severity`, `title`, `message`, `link`, `metadata`, `organizationId`, `userId`, `createdAt` — are **write-once**. No PATCH endpoint exists for them. |
| I5 | The **only** mutable state is `read` / `readAt`, and only via §12.14 / §12.15. |
| I6 | Notifications are permanent records retained for audit and compliance. Any retention/expiration policy is an **internal, out-of-band** data-lifecycle concern (e.g. an offline archival job) and must never be exposed as, or via, this API surface. |
| I7 | The delivery side-channel (webhooks §12.11 delivery log) is an independent audit trail and is likewise append-only from the API's perspective. |
| I8 | Producers may only **insert** notifications; they must never update or soft-delete existing inbox rows to "correct" content. Correction = emit a new notification. |

---

## 8. Suggested Persistence Model (non-normative)

Illustrative Prisma-style model for the backend implementer. Naming follows existing
tables; adjust indexes to the platform's query planner findings, but keep the guarantees
in §5 and §7.

```prisma
model Notification {
  id             String   @id @default(uuid()) @db.Uuid
  organizationId String   @map("organizationId") @db.Uuid
  userId         String   @map("userId") @db.Uuid

  type     NotificationType
  severity NotificationInboxSeverity   // CRITICAL | WARNING | SUCCESS | INFO

  title   String
  message String

  read   Boolean    @default(false)
  readAt DateTime?  @map("readAt")

  link     String?
  metadata Json      @default("{}")

  createdAt DateTime @default(now()) @map("createdAt")

  @@index([organizationId, userId, createdAt(sort: Desc)])
  @@index([organizationId, userId, read])                    // badge COUNT + status=UNREAD
  @@map("notifications")
}
```

**Notes**

- No `deletedAt`, no `updatedAt` — enforced by I1–I5.
- The partial/unfiltered `(organizationId, userId, read)` index makes `unreadCount`
  and `status=UNREAD` cheap.
- **Fan-out write path:** reuse the existing BullMQ `notifications` queue (already
  surfaced in platform-ops health/DLQ, e.g. `docs/API.md` §14 `"byQueue": { "notifications": 2 }`).
  When a platform event fires (finding.new, decision.status_changed, …):
  1. Load the org's `NotificationPreference` row for the event's `NotificationType`.
  2. If the preference exists, `enabled = true`, and `channels` includes `IN_APP` →
     insert one `Notification` row per targeted user.
  3. Email/Slack/Webhook fan-out continues through the existing channels — this API only
     owns the `IN_APP` rows.
- Default when **no preference row** exists: decide once and document — recommended
  default is **opt-in only** (no row ⇒ no in-app notification) to respect the preference
  model, with a bootstrap job seeding sensible defaults for new orgs.

---

## 9. Optional Enhancement: Real-Time via SSE

Not required for the initial implementation. If added:

- Emit a new frame `type: "notification.new"` on the existing org-scoped SSE stream
  `GET /api/v1/events` (§12.1), with `data.payload` carrying the full §3 notification
  object for the recipient user:

```json
{
  "id": "evt-0009-2233-4455-66778899aabb",
  "type": "notification.new",
  "data": {
    "id": "evt-0009-2233-4455-66778899aabb",
    "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "type": "notification.new",
    "payload": {
      "id": "ntf-0042-2233-4455-66778899aabb",
      "userId": "3f6c0a2e-8b1d-4e7a-9c3f-1a2b3c4d5e6f",
      "type": "CRITICAL_RISK_DETECTED",
      "severity": "CRITICAL",
      "title": "Critical Risk Detected",
      "message": "A critical SQL injection vulnerability has been detected on api.acmecorp.com",
      "read": false,
      "readAt": null,
      "link": "/monitoring",
      "metadata": { "findingId": "fnd-0009" },
      "createdAt": "2026-10-11T13:00:00.000Z"
    },
    "createdAt": "2026-10-11T13:00:00.000Z"
  }
}
```

- **Filter by user server-side** — the SSE stream is org-scoped; the backend must drop
  frames whose `payload.userId` ≠ the connected user's `user_id` claim before writing
  the frame (do not broadcast other users' notifications to the whole org).
- Frontend reaction: invalidate `["notifications"]` and `["notifications", "unread-count"]`
  (see §10) — do not blindly prepend, so ordering/`unreadCount` stay server-authoritative.

---

## 10. Frontend Consumption Appendix

This section guides the **frontend follow-up task** that swaps the `@mock-retained`
service for the real API. Not part of the backend deliverable.

### 10.1 Service layer

Replace `src/features/notifications/services/notification.service.ts` with axios calls
via `platformApi` (same client as `src/features/settings/services/notification.service.ts`):

| Method | HTTP | Returns |
| ------ | ---- | ------- |
| `list(params)` | `GET /notifications` | `NotificationListResponse` |
| `unreadCount()` | `GET /notifications/unread-count` | `{ unreadCount: number }` |
| `markRead(id, read)` | `PATCH /notifications/:id/read` | `Notification` |
| `markAllRead(scope?)` | `POST /notifications/read-all` | `{ updatedCount, unreadCount }` |

No delete/archive method exists — do not add one (I1–I3).

### 10.2 Types

New/updated types (feature-owned or `src/types/` per project convention — prefer
extending `src/types/platform/notification-api.types.ts` for the enum-shared bits and a
feature type for the envelope):

- Reuse `NotificationType` (platform) directly — retire the duplicate human-label
  `NotificationType` in `src/types/notification.types.ts` (it currently collides by name).
- `type NotificationInboxSeverity = "CRITICAL" | "WARNING" | "SUCCESS" | "INFO"`.
- `interface NotificationInboxItem` — schema §3.
- `interface NotificationListResponse` — `{ items, pagination: PaginationMeta, unreadCount }`
  (`PaginationMeta` already exists in `src/types/api.types.ts`; the shape matches
  envelope B / `PaginatedB`).
- Mapping constant `NOTIFICATION_TYPE_LABELS: Record<NotificationType, string>` and
  extend `typeBadgeStyles` in `src/features/notifications/components/NotificationList.tsx`
  from the 5 legacy labels to all 10 enums (§6.2) — otherwise the exhaustive
  `Record<NotificationType, string>` becomes a compile error, which is desirable.

### 10.3 Hooks (React Query)

| Hook | Query key | Suggested options |
| ---- | --------- | ----------------- |
| `useNotificationList(params)` | `["notifications", "list", params]` | `staleTime: 30_000` |
| `useUnreadCount()` | `["notifications", "unread-count"]` | `staleTime: 15_000`, `refetchInterval: 30_000` (or SSE-driven invalidation) |
| `useMarkNotificationRead()` | mutation | `onSuccess` → invalidate `["notifications"]` |
| `useMarkAllRead()` | mutation | `onSuccess` → invalidate `["notifications"]` |

Invalidate the whole `["notifications"]` prefix after mutations so list pages, the page
pill, and the bell badge re-sync atomically.

### 10.4 UI touchpoints

- `NotificationBell` (`src/components/layout/header/notification-bell.tsx`) — switch to
  `useUnreadCount()` instead of reading `data.unreadCount` off the list query.
- `ViewNotifications` (`src/features/notifications/view-notifications.tsx`) — add
  "Mark all as read" action wired to `useMarkAllRead`; replace the silent
  `if (isError) return null` with an error state.
- `NotificationList` (`src/features/notifications/components/NotificationList.tsx`) — add
  a per-row "Mark as read/unread" action wired to `useMarkNotificationRead`; make rows
  navigate to `notification.link ?? routes.notifications`; lowercase `severity` for
  `severityConfig`; map `type` enum → label/badge via §6.2.
- Delete `src/mock-data/notifications.json` and the `@mock-retained` marker once the
  service is live.

---

*End of specification. Questions or contract changes: update this file and the
corresponding section in `docs/API.md` together — they must not diverge.*
