# QUANTIQEN Backend — Complete API Specification

> **Scope:** All **116** HTTP endpoints. Global prefix `/api/v1` (`src/main.ts:18`).
> **Companion docs:** [`docs/WORKFLOW.md`](WORKFLOW.md) (workflow guide) ·
> [`docs/postman/quantiqen.postman_collection.json`](postman/quantiqen.postman_collection.json)
> (importable collection).
>
> **Every endpoint** below documents: Path/Query parameters · Request Body Schema (JSON) ·
> Success Response Schema (JSON) · Error Response Schema(s) (JSON) — unique blocks, no placeholders.

---

## Part 0 — Global Conventions

### 0.1 Base URL

| Item                                          | Value                                                        |
| --------------------------------------------- | ------------------------------------------------------------ |
| Base                                          | `http://localhost:3000` (env `PORT`)                         |
| Global prefix                                 | `/api/v1`                                                    |
| Platform health (doubled-path bug fixed W1.1) | `@Controller('system')` → real path **`/api/v1/system/...`** |
| Swagger (when enabled)                        | `GET /docs`                                                  |

### 0.2 Authentication

| Model       | Header                          | Used by                                  |
| ----------- | ------------------------------- | ---------------------------------------- |
| **QIP JWT** | `Authorization: Bearer <jwt>`   | All management/dashboard endpoints       |
| **API key** | `X-API-KEY: qtn_{env}_{secret}` | `POST /events`, `POST /events/bulk` only |

JWT rules (`QipJwtStrategy`): algorithm **EdDSA only**; required claims `org_id`, `user_id`, `role`, `session_id`;
role must be one of `CUSTOMER_ADMIN | ANALYST | AUDITOR | READ_ONLY`.

### 0.3 RBAC matrix

| Decorator                  | CUSTOMER_ADMIN | ANALYST | AUDITOR | READ_ONLY |
| -------------------------- | :------------: | :-----: | :-----: | :-------: |
| `@Public()`                |   skip auth    |    —    |    —    |     —     |
| `@RequireAdmin()`          |      yes       |   no    |   no    |    no     |
| `@RequireAnalystOrAdmin()` |      yes       |   yes   |   no    |    no     |
| `@RequireAdminOrAuditor()` |      yes       |   no    |   yes   |    no     |
| No decorator + **GET**     |      yes       |   yes   |   yes   |    yes    |
| No decorator + **write**   |      403       |   403   |   403   |    403    |

### 0.4 Real error envelope (`HttpExceptionFilter`)

Every non-2xx response from this server uses **exactly**:

```json
{
  "error": {
    "code": "<CODE>",
    "message": "<human-readable message>",
    "request_id": "<uuid>"
  }
}
```

**Status → code map** (`statusToCode` fallback; Nest reason-phrase may win as `code` — see note):

| Status | Intended `code`                                                                              |
| ------ | -------------------------------------------------------------------------------------------- |
| 400    | `BAD_REQUEST`                                                                                |
| 401    | `UNAUTHORIZED`                                                                               |
| 403    | `FORBIDDEN`                                                                                  |
| 404    | `NOT_FOUND`                                                                                  |
| 409    | `CONFLICT` (decision state-gate / stale `expectedStatus`; policy `BLOCK` → `POLICY_BLOCKED`) |
| 422    | `VALIDATION_ERROR`                                                                           |
| 429    | `RATE_LIMITED`                                                                               |
| 500    | `INTERNAL_SERVER_ERROR`                                                                      |
| 503    | `SERVICE_UNAVAILABLE`                                                                        |

> **422 note:** `AppValidationPipe` emits `message: string[]`; the filter **joins with `'; '`** into a single string.
> Nest built-in exceptions often surface `code` as the reason-phrase (`"Unauthorized"`, `"Not Found"`,
> `"Unprocessable Entity"`) because `res.error` wins over `statusToCode`.

### 0.5 Global error templates (status-specific, full blocks)

**401 Unauthorized — missing/invalid JWT or API key**

```json
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**401 Unauthorized — invalid token claims**

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid token payload",
    "request_id": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

**401 Unauthorized — missing API key header (events)**

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing X-API-KEY header",
    "request_id": "550e8400-e29b-41d4-a716-446655440002"
  }
}
```

**403 Forbidden — admin required**

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440003"
  }
}
```

**403 Forbidden — analyst or admin required**

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN or ANALYST role",
    "request_id": "550e8400-e29b-41d4-a716-446655440004"
  }
}
```

**403 Forbidden — admin or auditor required**

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN or AUDITOR role",
    "request_id": "550e8400-e29b-41d4-a716-446655440005"
  }
}
```

**404 Not Found — resource missing or cross-tenant**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "<Resource> not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440006"
  }
}
```

**422 Unprocessable Entity — validation (joined messages)**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "property unknownField should not exist; name must be a string",
    "request_id": "550e8400-e29b-41d4-a716-446655440007"
  }
}
```

**422 Unprocessable Entity — Nest reason-phrase as code**

```json
{
  "error": {
    "code": "Unprocessable Entity",
    "message": "environment must be one of the following values: PRODUCTION, STAGING, DEVELOPMENT, UNKNOWN",
    "request_id": "550e8400-e29b-41d4-a716-446655440008"
  }
}
```

**429 Too Many Requests — API key rate limit**

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded",
    "request_id": "550e8400-e29b-41d4-a716-446655440009"
  }
}
```

> Response headers also include `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

**500 Internal Server Error - unhandled / unclassified exception** (all known state gates map to **409/404/403**; Prisma duplicates map to **409** via the global filter)

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "<exception.message>",
    "request_id": "550e8400-e29b-41d4-a716-44665544000a"
  }
}
```

**500 Internal Server Error — Prisma / unhandled**

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544000b"
  }
}
```

**503 Service Unavailable — readiness**

```json
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Service unavailable",
    "request_id": "550e8400-e29b-41d4-a716-44665544000c"
  }
}
```

> Per-endpoint sections below still print **unique** error JSON blocks for each status that endpoint can emit
> (with endpoint-specific `message` strings), never “same as above”.

### 0.6 Pagination envelope variants

| Style      | Shape                                                                          |
| ---------- | ------------------------------------------------------------------------------ |
| A (common) | `{ "…items…": [...], "total", "page", "limit", "totalPages" }`                 |
| B          | `{ "items": [...], "pagination": { "page", "limit", "total", "totalPages" } }` |
| Offset     | `{ "items": [...], "total", "limit", "offset" }`                               |
| Bare array | `[ ... ]`                                                                      |

---

## Step 1 — Identity & Session

### 1.1 `GET /api/v1/users/me` — Current user profile

**Auth:** Bearer JWT · **RBAC:** GET default-allow (all 4 roles) · **Path Parameters:** none · **Query Parameters:** none

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — email/name mirror the JWT's `email`/`name` claims when present,
// otherwise null
{
  "id": "3f6c0a2e-8b1d-4e7a-9c3f-1a2b3c4d5e6f",
  "qipUserId": "qip-user-abc123",
  "role": "CUSTOMER_ADMIN",
  "email": "jane@acme.com",
  "name": "Jane Doe",
  "createdAt": "2026-09-24T10:00:00.000Z"
}
```

**Lazy provisioning:** on successful JWT verification, `AuthGuard` ensures the
local `organizations` and `users` mirror rows exist (org first — FK
`users.organizationId → organizations.id`) and refreshes `role` / `email` /
`name` / `orgName` / `planTier` only when the token carries them and they
differ. Consequently this endpoint no longer returns 404 for a valid token.

#### Error Response Schema (JSON)

```json
// 401 Unauthorized — missing/malformed/expired JWT or no org context
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440011"
  }
}
```

```json
// 401 Unauthorized — invalid claims
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid token payload",
    "request_id": "550e8400-e29b-41d4-a716-446655440012"
  }
}
```

```json
// 500 Internal Server Error — includes lazy-provisioning database failures (fail-closed)
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440014"
  }
}
```

---

### 1.2 `GET /api/v1/users` — List organization users

**Auth:** Bearer JWT · **RBAC:** GET default-allow · **Path Parameters:** none · **Query Parameters:** none

#### Path / Query Parameters

None (no pagination).

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK
[
  {
    "id": "3f6c0a2e-8b1d-4e7a-9c3f-1a2b3c4d5e6f",
    "qipUserId": "qip-user-abc123",
    "role": "CUSTOMER_ADMIN",
    "email": null,
    "name": null,
    "createdAt": "2026-09-24T10:00:00.000Z"
  },
  {
    "id": "7b2d9f11-4c0a-4d8e-8f1a-9e8d7c6b5a40",
    "qipUserId": "qip-user-def456",
    "role": "ANALYST",
    "email": null,
    "name": null,
    "createdAt": "2026-09-24T11:00:00.000Z"
  }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440015"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440016"
  }
}
```

> Never 404 — empty array is a valid success.

---

### 1.3 `GET /api/v1/users/:qipUserId` — Get user by QIP user ID

**Auth:** Bearer JWT · **RBAC:** GET default-allow · **Path Parameters:** `qipUserId` (string)

#### Path / Query Parameters

| Location | Name        | Type   | Required | Notes                                 |
| -------- | ----------- | ------ | -------- | ------------------------------------- |
| path     | `qipUserId` | string | yes      | QIP subject id (not necessarily UUID) |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "id": "3f6c0a2e-8b1d-4e7a-9c3f-1a2b3c4d5e6f",
  "qipUserId": "qip-user-abc123",
  "role": "ANALYST",
  "email": null,
  "name": null,
  "createdAt": "2026-09-24T10:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440017"
  }
}
```

```json
// 404 Not Found — missing or cross-tenant
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440018"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440019"
  }
}
```

---

### 1.4 `GET /api/v1/organizations/me` — Current organization

**Auth:** Bearer JWT · **RBAC:** GET default-allow · **Path Parameters:** none · **Query Parameters:** none

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "id": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "orgName": "Acme Security",
  "planTier": "free",
  "status": "ACTIVE",
  "createdAt": "2026-09-01T00:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544001a"
  }
}
```

```json
// 404 Not Found — org claim does not resolve (defensive only; the org row
// is provisioned automatically by AuthGuard on verified login)
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Organization not found",
    "request_id": "550e8400-e29b-41d4-a716-44665544001b"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544001c"
  }
}
```

---

## Step 2 — API Keys (Machine Auth)

### 2.1 `POST /api/v1/api-keys` — Create API key

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Path Parameters:** none · **Query Parameters:** none

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

```json
{
  "name": "ci-ingest",
  "environment": "test",
  "scopes": ["events:write"]
}
```

| Field         | Type     | Required | Validation                                |
| ------------- | -------- | -------- | ----------------------------------------- |
| `name`        | string   | yes      | `@IsString @MinLength(1)`                 |
| `environment` | enum     | yes      | `live` \| `test` \| `dev`                 |
| `scopes`      | string[] | no       | `@IsArray @IsString({each})` default `[]` |

#### Success Response Schema (JSON)

```json
// 201 Created
{
  "id": "k1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "name": "ci-ingest",
  "environment": "test",
  "scopes": ["events:write"],
  "status": "ACTIVE",
  "expiresAt": null,
  "revokedAt": null,
  "lastUsedAt": null,
  "createdAt": "2026-09-24T12:00:00.000Z",
  "rawKey": "qtn_test_0123456789abcdef0123456789abcdef"
}
```

> `rawKey` is returned **once** only — never retrievable via GET.

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440020"
  }
}
```

```json
// 403 Forbidden — non-admin role
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440021"
  }
}
```

```json
// 422 Unprocessable Entity — invalid body
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "environment must be one of the following values: live, test, dev; name must be a string",
    "request_id": "550e8400-e29b-41d4-a716-446655440022"
  }
}
```

```json
// 422 Unprocessable Entity — unknown property
{
  "error": {
    "code": "Unprocessable Entity",
    "message": "property ttl should not exist",
    "request_id": "550e8400-e29b-41d4-a716-446655440023"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440024"
  }
}
```

---

### 2.2 `GET /api/v1/api-keys` — List API keys

**Auth:** Bearer JWT · **RBAC:** GET default-allow · **Path Parameters:** none · **Query Parameters:** none

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK
[
  {
    "id": "k1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "name": "ci-ingest",
    "environment": "test",
    "scopes": ["events:write"],
    "status": "ACTIVE",
    "expiresAt": null,
    "revokedAt": null,
    "lastUsedAt": "2026-09-24T12:30:00.000Z",
    "createdAt": "2026-09-24T12:00:00.000Z"
  }
]
```

> List never includes `rawKey`.

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440025"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440026"
  }
}
```

---

### 2.3 `POST /api/v1/api-keys/:id/rotate` — Rotate API key

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Path Parameters:** `id` (API key id)

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None` (body ignored if sent; route has no DTO)

#### Success Response Schema (JSON)

```json
// 201 Created
{
  "newKey": {
    "id": "n2b3c4d5-e6f7-8901-bcde-f12345678901",
    "name": "ci-ingest",
    "environment": "test",
    "scopes": ["events:write"],
    "status": "ACTIVE",
    "expiresAt": null,
    "revokedAt": null,
    "lastUsedAt": null,
    "createdAt": "2026-09-24T13:00:00.000Z",
    "rawKey": "qtn_test_fedcba9876543210fedcba9876543210"
  },
  "oldKey": {
    "id": "k1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "name": "ci-ingest",
    "environment": "test",
    "scopes": ["events:write"],
    "status": "ACTIVE",
    "expiresAt": null,
    "revokedAt": null,
    "lastUsedAt": "2026-09-24T12:30:00.000Z",
    "createdAt": "2026-09-24T12:00:00.000Z"
  }
}
```

> Old key remains valid for a **24h grace window**.

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440027"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440028"
  }
}
```

```json
// 404 Not Found — key id missing or other tenant
{
  "error": {
    "code": "NOT_FOUND",
    "message": "API key not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440029"
  }
}
```

```json
// 500 Internal Server Error — already revoked / Prisma
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "API key is not active",
    "request_id": "550e8400-e29b-41d4-a716-44665544002a"
  }
}
```

---

### 2.4 `DELETE /api/v1/api-keys/:id` — Revoke API key

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Path Parameters:** `id`

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK (Nest default for DELETE without @HttpCode)
{
  "success": true
}
```

> Quirk: revoke on a **nonexistent** id still returns `200 { success: true }` (updateMany matches 0 rows).

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544002b"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-44665544002c"
  }
}
```

```json
// 422 Unprocessable Entity — non-UUID path id (if pipe validated)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "id must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-44665544002d"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544002e"
  }
}
```

---

## Step 3 — Asset Onboarding

### 3.1 `POST /api/v1/assets` — Create asset

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Path Parameters:** none · **Query Parameters:** none

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

```json
{
  "name": "API Gateway",
  "assetType": "DOMAIN",
  "identifier": "api.example.com",
  "environment": "PRODUCTION",
  "criticality": "HIGH",
  "dataSensitivity": 7,
  "internetExposure": "INTERNET_FACING",
  "customerImpact": "HIGH",
  "regulatoryImpact": "MEDIUM",
  "ownerUserId": "5f0a1b2c-3d4e-4f60-8a71-111122223333",
  "tags": ["edge"],
  "metadata": { "team": "platform" }
}
```

| Field              | Type          | Required | Validation                                                                       |
| ------------------ | ------------- | -------- | -------------------------------------------------------------------------------- |
| `name`             | string        | yes      | `@IsString @MinLength(1) @MaxLength(200)`                                        |
| `assetType`        | enum          | yes      | `DOMAIN`,`IP`,`URL`,`CIDR`,`CLOUD_RESOURCE`,`SERVICE`,`OTHER`                    |
| `identifier`       | string        | yes      | `@IsString @MinLength(1) @MaxLength(500)`                                        |
| `environment`      | enum          | yes      | `PRODUCTION`,`STAGING`,`DEVELOPMENT`,`UNKNOWN`                                   |
| `criticality`      | enum          | yes      | `CRITICAL`,`HIGH`,`MEDIUM`,`LOW`,`UNRATED`                                       |
| `dataSensitivity`  | int           | yes      | `@IsInt @Min(0) @Max(10)`                                                        |
| `internetExposure` | enum          | no       | `INTERNET_FACING`,`INTERNAL_ONLY`,`UNKNOWN` — accepted, **not always persisted** |
| `customerImpact`   | enum          | no       | `CRITICAL`,`HIGH`,`MEDIUM`,`LOW` — accepted, not always persisted                |
| `regulatoryImpact` | enum          | no       | `HIGH`,`MEDIUM`,`LOW`,`NONE` — accepted, not always persisted                    |
| `ownerUserId`      | string (uuid) | no       | `@IsOptional @IsUUID` — must exist in this organization (local `users.id`)       |
| `tags`             | string[]      | no       | `@IsOptional @IsArray @IsString({each})`                                         |
| `metadata`         | object        | no       | `@IsOptional @IsObject`                                                          |

#### Success Response Schema (JSON)

```json
// 201 Created
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "name": "API Gateway",
  "assetType": "DOMAIN",
  "identifier": "api.example.com",
  "environment": "PRODUCTION",
  "criticality": "HIGH",
  "dataSensitivity": 7,
  "ownerUserId": "5f0a1b2c-3d4e-4f60-8a71-111122223333",
  "status": "ACTIVE",
  "discovered": false,
  "scanEnabled": false,
  "firstSeenAt": "2026-09-24T12:00:00.000Z",
  "lastSeenAt": "2026-09-24T12:00:00.000Z",
  "tags": ["edge"],
  "metadata": { "team": "platform" },
  "createdAt": "2026-09-24T12:00:00.000Z",
  "updatedAt": "2026-09-24T12:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440030"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440031"
  }
}
```

```json
// 422 Unprocessable Entity — enum / length / type failures
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "assetType must be one of the following values: DOMAIN, IP, URL, CIDR, CLOUD_RESOURCE, SERVICE, OTHER; dataSensitivity must not be greater than 10",
    "request_id": "550e8400-e29b-41d4-a716-446655440032"
  }
}
```

```json
// 422 Unprocessable Entity — forbidNonWhitelisted unknown field
{
  "error": {
    "code": "Unprocessable Entity",
    "message": "property scanEnabled should not exist",
    "request_id": "550e8400-e29b-41d4-a716-446655440033"
  }
}
```

```json
// 500 Internal Server Error — duplicate (organizationId, assetType, identifier)
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Unique constraint failed on the fields: (`organizationId`,`assetType`,`identifier`)",
    "request_id": "550e8400-e29b-41d4-a716-446655440034"
  }
}
```

---

### 3.2 `GET /api/v1/assets` — List assets

**Auth:** Bearer JWT · **RBAC:** GET default-allow · **Path Parameters:** none

#### Path / Query Parameters

| Location | Name          | Type   | Required | Notes                                       |
| -------- | ------------- | ------ | -------- | ------------------------------------------- |
| query    | `assetType`   | string | no       | bare string (invalid value matches nothing) |
| query    | `status`      | string | no       | e.g. `ACTIVE`                               |
| query    | `criticality` | string | no       | e.g. `HIGH`                                 |
| query    | `environment` | string | no       | e.g. `PRODUCTION`                           |

No pagination.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "name": "API Gateway",
    "assetType": "DOMAIN",
    "identifier": "api.example.com",
    "environment": "PRODUCTION",
    "criticality": "HIGH",
    "dataSensitivity": 7,
    "ownerUserId": null,
    "status": "ACTIVE",
    "discovered": true,
    "scanEnabled": true,
    "firstSeenAt": "2026-09-20T00:00:00.000Z",
    "lastSeenAt": "2026-09-24T00:00:00.000Z",
    "tags": [],
    "metadata": {},
    "createdAt": "2026-09-20T00:00:00.000Z",
    "updatedAt": "2026-09-24T00:00:00.000Z"
  }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440035"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440036"
  }
}
```

> Unknown query keys are **not** in a DTO (bare `@Query`) — ignored, not 422.

---

### 3.3 `GET /api/v1/assets/:id` — Get asset

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "name": "API Gateway",
  "assetType": "DOMAIN",
  "identifier": "api.example.com",
  "environment": "PRODUCTION",
  "criticality": "HIGH",
  "dataSensitivity": 7,
  "ownerUserId": null,
  "status": "ACTIVE",
  "discovered": false,
  "scanEnabled": false,
  "firstSeenAt": null,
  "lastSeenAt": null,
  "tags": [],
  "metadata": {},
  "createdAt": "2026-09-24T12:00:00.000Z",
  "updatedAt": "2026-09-24T12:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440037"
  }
}
```

```json
// 404 Not Found — missing, soft-deleted, or cross-tenant
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Asset not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440038"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440039"
  }
}
```

---

### 3.4 `PATCH /api/v1/assets/:id` — Update asset

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()`

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "criticality": "CRITICAL",
  "dataSensitivity": 9,
  "status": "ACTIVE",
  "scanEnabled": true
}
```

All `CreateAssetDto` fields optional, plus `status` (`ACTIVE` | `INACTIVE` | `UNKNOWN`) and `scanEnabled` (boolean — **scan opt-in**; `false` by default, gates scan policy creation and scan triggers, §9). Only defined fields written. `scanEnabled` is accepted **here (PATCH) only** — `POST /assets` (§3.1) rejects it with 422.

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "name": "API Gateway",
  "assetType": "DOMAIN",
  "identifier": "api.example.com",
  "environment": "PRODUCTION",
  "criticality": "CRITICAL",
  "dataSensitivity": 9,
  "ownerUserId": null,
  "status": "ACTIVE",
  "discovered": false,
  "scanEnabled": true,
  "firstSeenAt": null,
  "lastSeenAt": null,
  "tags": [],
  "metadata": {},
  "createdAt": "2026-09-24T12:00:00.000Z",
  "updatedAt": "2026-09-24T14:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544003a"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-44665544003b"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Asset not found",
    "request_id": "550e8400-e29b-41d4-a716-44665544003c"
  }
}
```

```json
// 422 Unprocessable Entity
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "status must be one of the following values: ACTIVE, INACTIVE, UNKNOWN",
    "request_id": "550e8400-e29b-41d4-a716-44665544003d"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544003e"
  }
}
```

---

### 3.5 `DELETE /api/v1/assets/:id` — Soft-delete asset

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()`

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 204 No Content (empty body)
{}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544003f"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440040"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Asset not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440041"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440042"
  }
}
```

---

### 3.6 `POST /api/v1/assets/:id/relationships` — Create relationship

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()`

#### Path / Query Parameters

| Location | Name | Type          | Required | Notes                                        |
| -------- | ---- | ------------- | -------- | -------------------------------------------- |
| path     | `id` | string (uuid) | yes      | treated as `parentAssetId` (overwrites body) |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "parentAssetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "childAssetId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "relationshipType": "depends_on"
}
```

| Field              | Type   | Required | Validation                                |
| ------------------ | ------ | -------- | ----------------------------------------- |
| `parentAssetId`    | uuid   | yes      | `@IsUUID` — **overwritten by path**       |
| `childAssetId`     | uuid   | yes      | `@IsUUID`                                 |
| `relationshipType` | string | yes      | `@IsString @MinLength(1) @MaxLength(100)` |

#### Success Response Schema (JSON)

```json
// 201 Created
{
  "id": "rel-0011-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "parentAssetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "childAssetId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "relationshipType": "depends_on",
  "createdAt": "2026-09-24T12:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440043"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440044"
  }
}
```

```json
// 404 Not Found — parent or child missing / other tenant
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Asset not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440045"
  }
}
```

```json
// 422 Unprocessable Entity
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "childAssetId must be a UUID; relationshipType must be a string",
    "request_id": "550e8400-e29b-41d4-a716-446655440046"
  }
}
```

```json
// 500 Internal Server Error — duplicate unique edge
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Unique constraint failed on the fields: (`organizationId`,`parentAssetId`,`childAssetId`,`relationshipType`)",
    "request_id": "550e8400-e29b-41d4-a716-446655440047"
  }
}
```

---

### 3.7 `GET /api/v1/assets/:id/relationships` — List relationships

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name | Type          | Required                        |
| -------- | ---- | ------------- | ------------------------------- |
| path     | `id` | string (uuid) | yes — parent **or** child match |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — unknown id returns []
[
  {
    "id": "rel-0011-2233-4455-66778899aabb",
    "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "parentAssetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "childAssetId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "relationshipType": "depends_on",
    "createdAt": "2026-09-24T12:00:00.000Z"
  }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440048"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440049"
  }
}
```

> No 404 for unknown asset id (returns `[]`).

---

### 3.8 `DELETE /api/v1/assets/relationships/:relId` — Remove relationship

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()`

#### Path / Query Parameters

| Location | Name    | Type          | Required |
| -------- | ------- | ------------- | -------- |
| path     | `relId` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 204 No Content (empty body)
{}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544004a"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-44665544004b"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Relationship not found",
    "request_id": "550e8400-e29b-41d4-a716-44665544004c"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544004d"
  }
}
```

---

## Step 4 — Telemetry Ingestion

**Auth for this step:** `X-API-KEY` + scope `events:write` · rate limit per key (60s fixed window).

### 4.1 `POST /api/v1/events` — Ingest single event

**Auth:** `X-API-KEY` (No Auth at collection level) · **RBAC:** `@Public()` + `RequireScope('events:write')` · **Guards:** `ApiKeyGuard` then `RateLimitGuard`

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

```json
{
  "eventType": "auth.login",
  "eventCategory": "authentication",
  "severity": "MEDIUM",
  "source": "app-backend",
  "occurredAt": "2026-09-24T10:00:00.000Z",
  "eventVersion": "1.0",
  "assetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "idempotencyKey": "login-abc-1727162400",
  "payload": { "userId": "u-123", "ip": "203.0.113.10", "mfa": true },
  "metadata": { "userAgent": "Mozilla/5.0", "environment": "production" }
}
```

| Field            | Type     | Required | Validation                                                          |
| ---------------- | -------- | -------- | ------------------------------------------------------------------- |
| `eventType`      | string   | yes      | `@MinLength(1) @MaxLength(500)`                                     |
| `eventCategory`  | string   | yes      | `@MinLength(1) @MaxLength(100)`                                     |
| `severity`       | enum     | yes      | `CRITICAL`,`HIGH`,`MEDIUM`,`LOW`,`INFO`                             |
| `source`         | string   | yes      | `@MinLength(1) @MaxLength(200)`                                     |
| `occurredAt`     | ISO 8601 | yes      | `@IsDateString`                                                     |
| `eventVersion`   | string   | no       | `@MaxLength(50)` default `"1.0"`                                    |
| `assetId`        | uuid     | no       | `@IsUUID`                                                           |
| `idempotencyKey` | string   | no       | `@MaxLength(256)` — derived if absent                               |
| `payload`        | object   | yes      | `@IsObject` — detection reads a fixed key set from it; see **§4.3** |
| `metadata`       | object   | no       | `@IsObject` — allow-list filtered                                   |

#### Success Response Schema (JSON)

```json
// 201 Created — new event
{
  "eventId": "e1f2a3b4-c5d6-7890-abcd-ef1234567890",
  "duplicate": false
}
```

```json
// 200 OK — duplicate (same idempotency key)
{
  "eventId": "e1f2a3b4-c5d6-7890-abcd-ef1234567890",
  "duplicate": true
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized — missing X-API-KEY
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing X-API-KEY header",
    "request_id": "550e8400-e29b-41d4-a716-446655440050"
  }
}
```

```json
// 401 Unauthorized — bad key format
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid API key format",
    "request_id": "550e8400-e29b-41d4-a716-446655440051"
  }
}
```

```json
// 401 Unauthorized — unknown / revoked / expired (identical message by design)
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid API key",
    "request_id": "550e8400-e29b-41d4-a716-446655440052"
  }
}
```

```json
// 403 Forbidden — missing scope
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient scope",
    "request_id": "550e8400-e29b-41d4-a716-446655440053"
  }
}
```

```json
// 403 Forbidden — PRODUCTION asset + non-live key
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Telemetry for PRODUCTION assets requires a live API key. Use X-API-KEY with environment=\"live\".",
    "request_id": "550e8400-e29b-41d4-a716-446655440054"
  }
}
```

```json
// 422 Unprocessable Entity — DTO validation
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "severity must be one of the following values: CRITICAL, HIGH, MEDIUM, LOW, INFO; occurredAt must be a valid ISO 8601 date string",
    "request_id": "550e8400-e29b-41d4-a716-446655440055"
  }
}
```

```json
// 429 Too Many Requests — per-key rate limit
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded",
    "request_id": "550e8400-e29b-41d4-a716-446655440056"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440057"
  }
}
```

---

### 4.2 `POST /api/v1/events/bulk` — Ingest batch (max 500)

**Auth:** `X-API-KEY` + `events:write` · **RBAC:** `@Public()`

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

```json
{
  "events": [
    {
      "eventType": "auth.login",
      "eventCategory": "authentication",
      "severity": "LOW",
      "source": "app-backend",
      "occurredAt": "2026-09-24T10:00:01.000Z",
      "payload": { "userId": "u-1" }
    },
    {
      "eventType": "api.request",
      "eventCategory": "application",
      "severity": "INFO",
      "source": "api-gw",
      "occurredAt": "2026-09-24T10:00:02.000Z",
      "payload": { "path": "/v1/payments", "status": 200 }
    }
  ]
}
```

| Field    | Type               | Required | Validation                                            |
| -------- | ------------------ | -------- | ----------------------------------------------------- |
| `events` | `CreateEventDto[]` | yes      | `@IsArray @ArrayMaxSize(500) @ValidateNested({each})` |

Any invalid item → whole request **422** (no partial accept at validation stage).

#### Success Response Schema (JSON)

```json
// 201 Created (always, even with rejections)
{
  "results": [
    {
      "index": 0,
      "status": "accepted",
      "eventId": "e1f2a3b4-c5d6-7890-abcd-ef1234567890"
    },
    {
      "index": 1,
      "status": "duplicate",
      "eventId": "e2f3a4b5-c6d7-8901-abcd-ef1234567891"
    },
    { "index": 2, "status": "rejected", "error": "eventType must be a string" }
  ],
  "acceptedCount": 1,
  "duplicateCount": 1,
  "rejectedCount": 1
}
```

`acceptedCount` = **queued** (not yet processed).

#### Error Response Schema (JSON)

```json
// 401 Unauthorized — missing X-API-KEY
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing X-API-KEY header",
    "request_id": "550e8400-e29b-41d4-a716-446655440058"
  }
}
```

```json
// 401 Unauthorized — invalid API key
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid API key",
    "request_id": "550e8400-e29b-41d4-a716-446655440059"
  }
}
```

```json
// 403 Forbidden — insufficient scope
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient scope",
    "request_id": "550e8400-e29b-41d4-a716-44665544005a"
  }
}
```

```json
// 422 Unprocessable Entity — size or nested validation
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "events must contain no more than 500 elements; events.0.severity must be one of the following values: CRITICAL, HIGH, MEDIUM, LOW, INFO",
    "request_id": "550e8400-e29b-41d4-a716-44665544005b"
  }
}
```

```json
// 429 Too Many Requests
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded",
    "request_id": "550e8400-e29b-41d4-a716-44665544005c"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544005d"
  }
}
```

---

### 4.3 `POST /api/v1/events` — Detection payload contract

**Applies to:** §4.1 (single) and §4.2 (bulk) · **Auth:** same as §4.1

The DTO validates `payload` as an arbitrary JSON object, but the **detection worker reads a
fixed, small key set** from it. An event that is stored successfully (`201`) but whose payload
does not match a rule below is **silently dropped by detection** — no alert, no finding, no
network observation, no situation, no decision, and no error. Treat `201` as _"stored and
queued for detection"_, never as _"detected"_.

#### 4.3.1 Routing by `eventCategory`

| `eventCategory`                                           | Pipeline                                                 | Notes                                                        |
| --------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| `network`                                                 | NetworkAnalyzer — the 6 network rules in §4.3.3          | generic rules and correlation **never run** for these events |
| anything else (`authentication`, `api`, `application`, …) | generic rules → anomaly recording → correlation (§4.3.4) | network rules never run                                      |

If no rule/pattern matches, the detection worker returns silently — this is by design
("dumb-first": ~99.9 % of telemetry exits here).

#### 4.3.2 Payload key aliases (exact keys the extractors read)

| Concept           | Accepted keys (first match wins)                   | Used by                                                             |
| ----------------- | -------------------------------------------------- | ------------------------------------------------------------------- |
| Source IP         | `src_ip`, `sourceIp`, `ip`                         | almost every rule; also the Situation grouping key                  |
| Destination IP    | `dest_ip`, `destinationIp`                         | syn_flood, icmp_anomaly, traffic_spike, repeated_connection_failure |
| Destination port  | `dest_port`, `destinationPort`, `destPort`, `port` | port_scan, sensitive_port_activity (number or numeric string)       |
| Source port       | `src_port`, `sourcePort`, `srcPort`                | recorded on the NetworkObservation row only                         |
| Protocol          | `protocol`                                         | icmp_anomaly (compared case-insensitively)                          |
| TCP flags         | `tcp_flags`                                        | syn_flood (must contain `syn` and not `ack`)                        |
| Connection result | `event_type`                                       | repeated_connection_failure (contains `failure`/`reset`/`timeout`)  |
| User identifier   | `userId`, `user_id`, `username`                    | credential_stuffing (distinct-count dimension)                      |
| Endpoint          | `endpoint`, `url`, `path`, else `eventType`        | multi_endpoint_enumeration                                          |

snake_case (`dest_port`, `src_ip`) and camelCase (`destPort`, `srcPort`) are both accepted.
No other payload keys are read by detection — `risk_score`, `tier`, `severity` inside
`payload`, etc. are stored but ignored by the pipeline.

#### 4.3.3 Network rules — `eventCategory: "network"` only

All thresholds are inclusive (`count >= threshold`) over a rolling Redis window per org.

| Rule id                       | Gates (all must hold)                                                    | Threshold               | Window | Severity | `NetworkObservationType`      |
| ----------------------------- | ------------------------------------------------------------------------ | ----------------------- | ------ | -------- | ----------------------------- |
| `sensitive_port_activity`     | destination port ∈ {22, 3306, 5432, 6379, 27017, 3389, 1433, 1521, 5900} | 1 event (point-in-time) | —      | MEDIUM   | `SENSITIVE_PORT_ACTIVITY`     |
| `port_scan_detected`          | source IP **and** destination port                                       | ≥10 distinct dest ports | 5 min  | HIGH     | `PORT_SCAN_DETECTED`          |
| `syn_flood`                   | `tcp_flags` contains `syn` (no `ack`) + source & dest IP                 | ≥100 events             | 60 s   | CRITICAL | `SYN_FLOOD`                   |
| `icmp_anomaly`                | `protocol: "icmp"` + source & dest IP                                    | ≥50 events              | 5 min  | MEDIUM   | `ICMP_ANOMALY`                |
| `traffic_spike`               | source & dest IP                                                         | ≥1000 events            | 10 min | HIGH     | `TRAFFIC_SPIKE`               |
| `repeated_connection_failure` | `event_type` contains `failure`/`reset`/`timeout` + source & dest IP     | ≥20 events              | 5 min  | MEDIUM   | `REPEATED_CONNECTION_FAILURE` |

#### 4.3.4 Generic rules & correlation — all other categories

| Pattern id                                   | Gates                                                                               | Threshold             | Window | Severity       |
| -------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------- | ------ | -------------- |
| `brute_force`                                | `eventCategory: "authentication"` **and** `severity` ∈ {HIGH, CRITICAL} + source IP | ≥5 events             | 5 min  | event severity |
| `credential_stuffing`                        | authentication + HIGH/CRITICAL + source IP + user identifier                        | ≥3 distinct users     | 15 min | CRITICAL       |
| `rate_anomaly`                               | source IP (any category)                                                            | ≥50 events            | 10 min | HIGH           |
| `api_abuse`                                  | `eventCategory: "api"` + HIGH/CRITICAL + source IP                                  | ≥20 events            | 5 min  | HIGH           |
| `multi_endpoint_enumeration` _(correlation)_ | source IP + endpoint (fallback `eventType`)                                         | ≥5 distinct endpoints | 10 min | HIGH           |
| `lateral_movement` _(correlation)_           | top-level `assetId` + source IP                                                     | ≥2 distinct assets    | 30 min | CRITICAL       |

Severity gates matter: an `authentication` event with `severity: "MEDIUM"` can **never** trigger
`brute_force` or `credential_stuffing`.

#### 4.3.5 What each output requires

| Output               | Requires                                                                                                               | Dedup/cooldown key (1 h)                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `NetworkObservation` | any network rule match — one row per matched rule with a mapped type                                                   | `asset:{assetId}:{type}` → `ip:{sourceIp}:{type}` → `global:{type}`                 |
| Alert                | any rule/correlation match                                                                                             | `asset:{assetId}:{alertType}` → `ip:{sourceIp}:{alertType}` → `global:{alertType}`  |
| Finding              | any match; on cooldown hit severity is upgraded (never downgraded) and `eventCount` incremented                        | `{assetId}:{findingType}` or `global:{findingType}`                                 |
| Situation            | a **new** alert **plus ≥1 other alert with the same `sourceIp` created within 30 min**                                 | — (a single alert never creates a Situation; alerts without `sourceIp` never group) |
| Decision             | a **new** finding → `risk-decision` worker → AI Engine `POST /risk/calculate` → Decision Policy evaluation at creation | — (repeat events inside the finding cooldown do **not** produce a new decision)     |

- Event-level `payload.risk_score` / `payload.tier` are **ignored** — score, tier and priority
  come from the AI Engine response, not from the event.
- If the AI Engine is unreachable, the finding stays `OPEN` (visible as pending) and no decision
  row exists until retries succeed; recover with §6.3 `POST /api/v1/decisions/analyze`.

#### 4.3.6 Worked examples

**A. Sensitive port — one event → observation + finding + decision**

```json
{
  "eventType": "network.sensitive_port_access",
  "eventCategory": "network",
  "severity": "MEDIUM",
  "source": "firewall",
  "occurredAt": "2026-09-29T10:00:00.000Z",
  "idempotencyKey": "fw-20260929-100000-203011377-22",
  "payload": {
    "src_ip": "203.0.113.77",
    "dest_ip": "10.0.0.5",
    "dest_port": 22,
    "protocol": "tcp"
  }
}
```

→ `GET /api/v1/network-observations?observationType=SENSITIVE_PORT_ACTIVITY` returns one row ·
finding `Sensitive port 22 accessed from 203.0.113.77` · decision appears in
`GET /api/v1/decisions` after the AI Engine responds (§6.1).

**B. Port scan — 10 events with distinct ports inside 5 minutes**

Same envelope as A with `eventType: "network.port_scan"`, varying `idempotencyKey` and
`payload.dest_port` over `10001 … 10010` (same `src_ip`) → `PORT_SCAN_DETECTED` observation +
finding `Port scan detected from 203.0.113.77`.

**C. Brute force — 5 events inside 5 minutes**

```json
{
  "eventType": "auth.login.failed",
  "eventCategory": "authentication",
  "severity": "HIGH",
  "source": "idp",
  "occurredAt": "2026-09-29T10:05:00.000Z",
  "idempotencyKey": "idp-fail-1",
  "payload": { "src_ip": "198.51.100.20", "userId": "alice", "success": false }
}
```

5 × with distinct `idempotencyKey` → finding `Brute force attempt detected from 198.51.100.20`.
Swap `userId` across 3+ values to trip `credential_stuffing` instead (15 min window).

**D. Multi-endpoint enumeration — 5 distinct paths inside 10 minutes**

```json
{
  "eventType": "api.request",
  "eventCategory": "application",
  "severity": "LOW",
  "source": "api-gw",
  "occurredAt": "2026-09-29T10:10:00.000Z",
  "idempotencyKey": "gw-1",
  "payload": { "src_ip": "198.51.100.30", "path": "/v1/users" }
}
```

5 × with distinct `payload.path` → correlation finding
`Multi-endpoint enumeration from 198.51.100.30` (`findingSource: CORRELATION`).

**Situation:** no single example creates one — send two _different-rule_ events sharing the same
`sourceIp` within 30 minutes (e.g. A then B). The second **new** alert groups both under one
Situation; verify via `GET /api/v1/situations`.

#### 4.3.7 "I got 201 — why is nothing generated?"

| Symptom                                   | Likely cause                                                                                         | Fix                                                                    |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| No observation/finding for network events | wrong `eventCategory` (network rules need exactly `"network"`), or port key not in §4.3.2 alias list | use `network` + `dest_port`/`destPort`                                 |
| Auth events never create findings         | `severity` below HIGH, or category ≠ `authentication`                                                | send `severity: "HIGH"`                                                |
| Rule not firing                           | threshold not yet reached inside the window                                                          | send N events inside the window (§4.3.3/§4.3.4), vary `idempotencyKey` |
| No Situation                              | fewer than 2 alerts with the same `sourceIp` within 30 min, or alert already inside its 1 h cooldown | send 2+ different-rule events, same `src_ip`                           |
| Finding exists but no decision            | AI Engine down/5xx, or event repeated inside the 1 h finding cooldown                                | check §14.5 platform health, run §6.3 batch re-analyze                 |
| `200 {duplicate: true}`                   | `idempotencyKey` reused                                                                              | use a unique key per logical event                                     |
| Silent everything                         | payload keys ignored by every extractor                                                              | match §4.3.2 exactly                                                   |

---

## Step 5 — Detection Outputs (Situations & Network Observations)

### 5.1 `GET /api/v1/situations` — List situations

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name       | Type | Required | Validation / default                         |
| -------- | ---------- | ---- | -------- | -------------------------------------------- |
| query    | `status`   | enum | no       | `ACTIVE`,`INVESTIGATING`,`RESOLVED`,`CLOSED` |
| query    | `severity` | enum | no       | `CRITICAL`,`HIGH`,`MEDIUM`,`LOW`,`INFO`      |
| query    | `dateFrom` | ISO  | no       | `firstSeenAt gte`                            |
| query    | `dateTo`   | ISO  | no       | `firstSeenAt lte`                            |
| query    | `page`     | int  | no       | `@Min(1)` default `1`                        |
| query    | `limit`    | int  | no       | `@Min(1) @Max(100)` default `20`             |

Path: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "situations": [
    {
      "id": "sit-0011-2233-4455-66778899aabb",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "title": "Brute force burst",
      "description": "5 failed logins in 5 minutes",
      "severity": "HIGH",
      "status": "ACTIVE",
      "firstSeenAt": "2026-09-24T10:00:00.000Z",
      "lastSeenAt": "2026-09-24T10:05:00.000Z",
      "createdAt": "2026-09-24T10:00:00.000Z",
      "updatedAt": "2026-09-24T10:05:00.000Z",
      "_count": { "relations": 3 }
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

Ordered `lastSeenAt desc`.

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544005e"
  }
}
```

```json
// 422 Unprocessable Entity — bad enum / unknown query key (DTO whitelist)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "status must be one of the following values: ACTIVE, INVESTIGATING, RESOLVED, CLOSED; property foo should not exist",
    "request_id": "550e8400-e29b-41d4-a716-44665544005f"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440060"
  }
}
```

---

### 5.2 `GET /api/v1/situations/:id` — Situation detail

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "id": "sit-0011-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "title": "Brute force burst",
  "description": "5 failed logins in 5 minutes",
  "severity": "HIGH",
  "status": "ACTIVE",
  "firstSeenAt": "2026-09-24T10:00:00.000Z",
  "lastSeenAt": "2026-09-24T10:05:00.000Z",
  "createdAt": "2026-09-24T10:00:00.000Z",
  "updatedAt": "2026-09-24T10:05:00.000Z",
  "relations": [
    {
      "id": "rel-…",
      "relatedSituationId": "…",
      "relationType": "correlates_with",
      "createdAt": "2026-09-24T10:01:00.000Z"
    }
  ],
  "decisions": [
    {
      "id": "dec-0011-2233-4455-66778899aabb",
      "status": "UNDER_REVIEW",
      "risk": { "tier": "CRITICAL", "riskScore": 88 }
    }
  ]
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440061"
  }
}
```

```json
// 404 Not Found — incl. cross-tenant
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Situation not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440062"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440063"
  }
}
```

---

### 5.3 `PATCH /api/v1/situations/:id/status` — Update situation status

**Auth:** Bearer JWT · **RBAC:** `@RequireAnalystOrAdmin()` · **Audit:** `SITUATION_STATUS_UPDATED`

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "status": "INVESTIGATING"
}
```

| Field    | Type | Required | Validation                                                           |
| -------- | ---- | -------- | -------------------------------------------------------------------- |
| `status` | enum | yes      | `@IsEnum @IsNotEmpty` — `ACTIVE`,`INVESTIGATING`,`RESOLVED`,`CLOSED` |

**Transitions:** `ACTIVE→[INVESTIGATING,RESOLVED,CLOSED]` · `INVESTIGATING→[RESOLVED,CLOSED]` · `RESOLVED→[CLOSED]` · `CLOSED` terminal.

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "id": "sit-0011-2233-4455-66778899aabb",
  "title": "Brute force burst",
  "status": "INVESTIGATING",
  "severity": "HIGH",
  "updatedAt": "2026-09-24T12:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 400 Bad Request — illegal transition
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid status transition: CLOSED → INVESTIGATING. CLOSED is terminal.",
    "request_id": "550e8400-e29b-41d4-a716-446655440064"
  }
}
```

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440065"
  }
}
```

```json
// 403 Forbidden — AUDITOR / READ_ONLY
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN or ANALYST role",
    "request_id": "550e8400-e29b-41d4-a716-446655440066"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Situation not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440067"
  }
}
```

```json
// 422 Unprocessable Entity — missing/invalid status
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "status should not be empty; status must be one of the following values: ACTIVE, INVESTIGATING, RESOLVED, CLOSED",
    "request_id": "550e8400-e29b-41d4-a716-446655440068"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440069"
  }
}
```

> Same-status update is an idempotent no-op (still 200).

---

### 5.4 `GET /api/v1/network-observations` — List network observations

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name              | Type   | Required | Validation / default                                                                                                                                                                                                            |
| -------- | ----------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| query    | `observationType` | enum   | no       | `PORT_SCAN_DETECTED`,`SYN_FLOOD`,`ICMP_ANOMALY`,`SUSPICIOUS_SOURCE`,`SUSPICIOUS_DESTINATION`,`TRAFFIC_SPIKE`,`REPEATED_CONNECTION_FAILURE`,`MALICIOUS_IP_COMMUNICATION`,`SENSITIVE_PORT_ACTIVITY`,`DATA_EXFILTRATION_INDICATOR` |
| query    | `severity`        | enum   | no       | `CRITICAL`,`HIGH`,`MEDIUM`,`LOW`,`INFO`                                                                                                                                                                                         |
| query    | `status`          | enum   | no       | `NEW`,`PROMOTED_TO_ALERT`,`CLOSED`                                                                                                                                                                                              |
| query    | `assetId`         | uuid   | no       | `@IsUUID`                                                                                                                                                                                                                       |
| query    | `sourceIp`        | string | no       | exact match                                                                                                                                                                                                                     |
| query    | `startDate`       | ISO    | no       | `createdAt gte`                                                                                                                                                                                                                 |
| query    | `endDate`         | ISO    | no       | `createdAt lte`                                                                                                                                                                                                                 |
| query    | `page`            | int    | no       | default `1`                                                                                                                                                                                                                     |
| query    | `limit`           | int    | no       | 1–100 default `20`                                                                                                                                                                                                              |

Path: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — envelope B
{
  "items": [
    {
      "id": "nob-0011-2233-4455-66778899aabb",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "assetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "observationType": "PORT_SCAN_DETECTED",
      "severity": "HIGH",
      "status": "NEW",
      "sourceIp": "198.51.100.10",
      "firstSeenAt": "2026-09-24T10:00:00.000Z",
      "lastSeenAt": "2026-09-24T10:02:00.000Z",
      "createdAt": "2026-09-24T10:00:00.000Z",
      "updatedAt": "2026-09-24T10:02:00.000Z",
      "asset": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "API Gateway",
        "identifier": "api.example.com"
      }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544006a"
  }
}
```

```json
// 422 Unprocessable Entity — bad enum / unknown key
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "status must be one of the following values: NEW, PROMOTED_TO_ALERT, CLOSED; property x should not exist",
    "request_id": "550e8400-e29b-41d4-a716-44665544006b"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544006c"
  }
}
```

---

### 5.5 `GET /api/v1/network-observations/:id` — Network observation detail

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "id": "nob-0011-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "assetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "observationType": "PORT_SCAN_DETECTED",
  "severity": "HIGH",
  "status": "NEW",
  "sourceIp": "198.51.100.10",
  "details": { "ports": [22, 80, 443], "count": 12 },
  "firstSeenAt": "2026-09-24T10:00:00.000Z",
  "lastSeenAt": "2026-09-24T10:02:00.000Z",
  "createdAt": "2026-09-24T10:00:00.000Z",
  "updatedAt": "2026-09-24T10:02:00.000Z",
  "asset": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "API Gateway",
    "identifier": "api.example.com"
  }
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544006d"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Network observation not found",
    "request_id": "550e8400-e29b-41d4-a716-44665544006e"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544006f"
  }
}
```

---

## Step 6 — Risk & Decision (Read + Policy Management)

### 6.1 `GET /api/v1/decisions` — List decisions

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name               | Type   | Required | Validation / default                                                              |
| -------- | ------------------ | ------ | -------- | --------------------------------------------------------------------------------- |
| query    | `status`           | enum   | no       | `PENDING`,`UNDER_REVIEW`,`APPROVED`,`IN_PROGRESS`,`RESOLVED`,`REJECTED`,`EXPIRED` |
| query    | `severity`         | enum   | no       | `CRITICAL`,`HIGH`,`MEDIUM`,`LOW` (filters `risk.tier`)                            |
| query    | `assignedToUserId` | string | no       |                                                                                   |
| query    | `dateFrom`         | string | no       | ISO                                                                               |
| query    | `dateTo`           | string | no       | ISO                                                                               |
| query    | `page`             | int    | no       | `@Min(1)` default `1`                                                             |
| query    | `limit`            | int    | no       | 1–100 default `20`                                                                |

Path: none. Unknown query keys → 422 (DTO whitelist).

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "decisions": [
    {
      "id": "dec-0011-2233-4455-66778899aabb",
      "status": "UNDER_REVIEW",
      "createdAt": "2026-09-24T10:05:00.000Z",
      "updatedAt": "2026-09-24T10:05:00.000Z",
      "risk": { "riskScore": 82, "tier": "CRITICAL", "priority": "P0" },
      "finding": {
        "title": "Credential stuffing burst",
        "severity": "CRITICAL",
        "findingType": "credential_stuffing"
      }
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

Ordered `createdAt desc`.

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440070"
  }
}
```

```json
// 422 Unprocessable Entity — bad enum / unknown key
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "status must be one of the following values: PENDING, UNDER_REVIEW, APPROVED, IN_PROGRESS, RESOLVED, REJECTED, EXPIRED; property foo should not exist",
    "request_id": "550e8400-e29b-41d4-a716-446655440071"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440072"
  }
}
```

---

### 6.2 `GET /api/v1/decisions/:id` — Get decision detail

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "id": "dec-0011-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "aiEngineDecisionId": "ai-dec-999",
  "status": "UNDER_REVIEW",
  "assignedToUserId": null,
  "recommendedAction": "Apply the vendor patch or upgrade the affected component",
  "aiDecisionLabel": "Urgent Patch Required",
  "recommendation": {
    "id": "405cfbdc-0afa-4737-9a0c-19dde0217c1d",
    "technical_text": "Apply the vendor patch or upgrade the affected component",
    "business_explanation": null,
    "estimated_effort": "medium",
    "estimated_impact": 71,
    "risk_reduction_potential": 45.0,
    "priority": "P1",
    "category": "vulnerability"
  },
  "nextAction": "Deploy the vendor patch within 24 hours and restart the payment service",
  "expectedRiskReduction": 45,
  "estimatedFixTime": "24 hours",
  "businessOwner": "Unassigned",
  "resolution": null,
  "SLABreachAt": "2026-09-25T10:05:00.000Z",
  "situationId": "sit-0011-2233-4455-66778899aabb",
  "contextHash": "9f2c7d1a4b8e3f6051c9a2d7e4b8f1c3a6d9e2b5f8c1a4d7e0b3f6c9a2d5e8b1",
  "contextSnapshot": { "window": "24h" },
  "rulesTriggered": ["risk_score>=80"],
  "policyVersionId": "pv-0001",
  "approvalRequired": true,
  "primaryTeamId": "team-0001",
  "engineVersions": {
    "aiEngine": "1.0.0",
    "riskEngine": "1.2.0",
    "scoring": "3.4.0",
    "knowledge": "2026.09",
    "policyEngine": "1.1.0",
    "policyVersionId": "pv-0001",
    "aiModelProvider": "groq",
    "aiModelIdentifier": "openai/gpt-oss-120b",
    "promptVersion": "7",
    "inputContextHash": "9f2c7d1a4b8e3f6051c9a2d7e4b8f1c3a6d9e2b5f8c1a4d7e0b3f6c9a2d5e8b1",
    "evaluatedAt": "2026-09-24T10:05:00.000Z",
    "traceId": null
  },
  "traceId": "550e8400-e29b-41d4-a716-446655440106",
  "createdAt": "2026-09-24T10:05:00.000Z",
  "updatedAt": "2026-09-24T10:05:00.000Z",
  "risk": {
    "id": "rsk-0001",
    "riskScore": 82,
    "tier": "CRITICAL",
    "priority": "P0",
    "confidence": 55,
    "confidenceBreakdown": {
      "overall_confidence": 55,
      "categories": { "asset_information": 60, "business_information": 100 },
      "factors": [
        { "factor": "CMDB record exists", "weight": 30, "score": 100 }
      ],
      "deductions": [{ "factor": "no_asset_owner", "deduction": 20 }]
    },
    "drivers": {
      "asset_importance": {
        "value": 90,
        "explanation": "Production asset with criticality 90/100."
      },
      "vulnerability_severity": {
        "value": 85,
        "explanation": "Critical vulnerability (severity 85/100)."
      },
      "exploitability": {
        "value": 70,
        "explanation": "Moderately exploitable (score 70/100)."
      },
      "business_impact": {
        "value": 100,
        "explanation": "High business impact (100/100)."
      },
      "exposure": {
        "value": 70,
        "explanation": "Exposure level: Customer Facing (score 70/100)."
      }
    },
    "aiSummary": "Unpatched RCE vulnerability in the payment API.\n\nExploitation could compromise the payment gateway.",
    "aiSummaryDetail": {
      "business_risk": "Exploitation could compromise the payment gateway.",
      "technical_risk": "Unpatched RCE vulnerability in the payment API.",
      "why_scored": "Scored High because the asset is a production payment system.",
      "immediate_recommendation": "Deploy the vendor patch immediately.",
      "expected_business_impact": "Service outages and PCI compliance penalties."
    },
    "reason": "Production asset with criticality 90/100. Critical vulnerability (severity 85/100).",
    "aiEngineVersion": "1.0.0"
  },
  "finding": {
    "id": "fnd-0001",
    "title": "Credential stuffing burst",
    "description": "…",
    "severity": "CRITICAL",
    "findingType": "credential_stuffing",
    "findingSource": "RULE",
    "assetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  },
  "history": [
    {
      "id": "h-1",
      "fromStatus": null,
      "toStatus": "UNDER_REVIEW",
      "note": "Created by policy engine",
      "createdAt": "2026-09-24T10:05:00.000Z"
    }
  ]
}
```

`history` = last 10, `createdAt desc`.

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440073"
  }
}
```

```json
// 404 Not Found — incl. cross-tenant
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Decision not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440074"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440075"
  }
}
```

---

### 6.3 `POST /api/v1/decisions/analyze` — Batch re-analyze pending decisions

**Auth:** Bearer JWT · **RBAC:** `@RequireAnalystOrAdmin()` · **Status:** `202 Accepted` · **Body must be empty**

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

```json
{}
```

Empty object only — any property → 422.

#### Success Response Schema (JSON)

```json
// 202 Accepted
{
  "message": "Batch analysis queued",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "enqueuedCount": 12
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440076"
  }
}
```

```json
// 403 Forbidden — AUDITOR / READ_ONLY
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN or ANALYST role",
    "request_id": "550e8400-e29b-41d4-a716-446655440077"
  }
}
```

```json
// 422 Unprocessable Entity — non-empty body
{
  "error": {
    "code": "Unprocessable Entity",
    "message": "property force should not exist",
    "request_id": "550e8400-e29b-41d4-a716-446655440078"
  }
}
```

```json
// 500 Internal Server Error — queue unavailable
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440079"
  }
}
```

---

### 6.4 `GET /api/v1/policies` — List policies

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name     | Type   | Required | Notes                                                                          |
| -------- | -------- | ------ | -------- | ------------------------------------------------------------------------------ |
| query    | `status` | string | no       | `@IsEnum(PolicyStatus)` — `DRAFT`,`ACTIVE`,`ARCHIVED`; invalid value → **422** |

Path: none.

Unknown query parameters are rejected with **422** (`property X should not exist`).

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — bare array
[
  {
    "id": "pol-0001-0002-0003-000000000001",
    "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "name": "Require approval for critical production risks",
    "description": "Block auto-approve when risk is critical in production",
    "policyType": "SECURITY_GUARDRAIL",
    "severity": "MANDATORY",
    "status": "ACTIVE",
    "rules": [
      {
        "field": "risk_score",
        "operator": "gte",
        "value": 80,
        "action": "REQUIRE_APPROVAL",
        "message": "High risk score requires review"
      }
    ],
    "createdByUserId": "qip-user-abc123",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "updatedAt": "2026-09-15T00:00:00.000Z",
    "versions": [
      {
        "id": "pv-0001",
        "versionNumber": 1,
        "rulesSnapshot": [],
        "changeReason": "Initial activation",
        "createdAt": "2026-09-15T00:00:00.000Z"
      }
    ],
    "_count": { "evaluations": 14 }
  }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544007a"
  }
}
```

```json
// 422 Unprocessable Entity — invalid status value
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "status must be one of the following values: DRAFT, ACTIVE, ARCHIVED",
    "request_id": "550e8400-e29b-41d4-a716-44665544007b"
  }
}
```

```json
// 422 Unprocessable Entity — unknown query parameter
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "property foo should not exist",
    "request_id": "550e8400-e29b-41d4-a716-44665544007c"
  }
}
```

---

### 6.5 `GET /api/v1/policies/:id` — Get policy

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "id": "pol-0001-0002-0003-000000000001",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "name": "Require approval for critical production risks",
  "description": "Block auto-approve when risk is critical in production",
  "policyType": "SECURITY_GUARDRAIL",
  "severity": "MANDATORY",
  "status": "ACTIVE",
  "rules": [
    {
      "field": "risk_score",
      "operator": "gte",
      "value": 80,
      "action": "REQUIRE_APPROVAL",
      "message": "High risk score requires review"
    }
  ],
  "createdByUserId": "qip-user-abc123",
  "createdAt": "2026-09-01T00:00:00.000Z",
  "updatedAt": "2026-09-15T00:00:00.000Z",
  "versions": [
    {
      "id": "pv-0002",
      "versionNumber": 2,
      "rulesSnapshot": [],
      "changeReason": "Raised threshold",
      "createdAt": "2026-09-20T00:00:00.000Z"
    },
    {
      "id": "pv-0001",
      "versionNumber": 1,
      "rulesSnapshot": [],
      "changeReason": "Initial activation",
      "createdAt": "2026-09-15T00:00:00.000Z"
    }
  ],
  "_count": { "evaluations": 14 }
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544007c"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Policy not found",
    "request_id": "550e8400-e29b-41d4-a716-44665544007d"
  }
}
```

```json
// 422 Unprocessable Entity — malformed id (UuidParamPipe)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "id must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-44665544007e"
  }
}
```

---

### 6.6 `GET /api/v1/policies/:id/versions/:versionId` — Get policy version

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name        | Type          | Required | Notes                                                                          |
| -------- | ----------- | ------------- | -------- | ------------------------------------------------------------------------------ |
| path     | `id`        | string (uuid) | yes      | **ignored server-side** (service uses `versionId` only) — still UUID-validated |
| path     | `versionId` | string (uuid) | yes      |                                                                                |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "id": "pv-0001",
  "versionNumber": 1,
  "rulesSnapshot": [
    {
      "field": "risk_score",
      "operator": "gte",
      "value": 80,
      "action": "REQUIRE_APPROVAL",
      "message": "High risk score requires review"
    }
  ],
  "changeReason": "Initial activation",
  "createdByUserId": "qip-user-abc123",
  "createdAt": "2026-09-15T00:00:00.000Z",
  "policy": {
    "id": "pol-0001-0002-0003-000000000001",
    "name": "Require approval for critical production risks"
  }
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544007f"
  }
}
```

```json
// 404 Not Found — wrong versionId (path id ignored)
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Policy version not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440080"
  }
}
```

```json
// 422 Unprocessable Entity — malformed id or versionId (UuidParamPipe)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "versionId must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-446655440081"
  }
}
```

---

### 6.7 `POST /api/v1/policies` — Create policy (DRAFT)

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Audit:** `POLICY_CREATED` · **Status:** `201`

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

```json
{
  "name": "Require approval for critical production risks",
  "description": "Block auto-approve when risk is critical in production",
  "policyType": "SECURITY_GUARDRAIL",
  "severity": "MANDATORY",
  "rules": [
    {
      "field": "risk_score",
      "operator": "gte",
      "value": 80,
      "action": "REQUIRE_APPROVAL",
      "message": "High risk score requires review"
    }
  ]
}
```

| Field         | Type              | Required | Validation                                                                                                                                                                      |
| ------------- | ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | string            | yes      | `@IsString @IsNotEmpty @MaxLength(200)`                                                                                                                                         |
| `description` | string            | no       | `@IsOptional @IsString @MaxLength(2000)`                                                                                                                                        |
| `policyType`  | enum              | yes      | `@IsEnum(PolicyType)` — `SECURITY_GUARDRAIL`,`REGULATORY`,`ORG_POLICY`,`ASSET_POLICY`,`ENVIRONMENT_POLICY`,`DETERMINISTIC_RULE`; invalid value → **422** (never reaches Prisma) |
| `severity`    | enum              | no       | `@IsOptional @IsIn` — `MANDATORY`,`RECOMMENDED`,`ADVISORY`, default `RECOMMENDED`                                                                                               |
| `rules`       | `PolicyRuleDto[]` | yes      | `@IsArray @ArrayMinSize(1) @ValidateNested({each:true})` — **at least one rule**                                                                                                |

`PolicyRuleDto.field`: `risk_score`,`tier`,`priority`,`asset_criticality`,`data_sensitivity`,`environment`,`finding_type`,`situation_severity`
`operator`: `eq`,`neq`,`gt`,`gte`,`lt`,`lte`,`in`,`not_in`
`action`: `REQUIRE_APPROVAL`,`AUTO_APPROVE`,`BLOCK`,`ESCALATE`
`message`: `@IsString @IsNotEmpty`
`value`: **required** (`@IsDefined`) and type-checked against `operator` + `field`:

| operator              | required `value` type                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `gt`,`gte`,`lt`,`lte` | finite number — only valid on `risk_score` (0–100) and `data_sensitivity` (integer 0–10) |
| `in`,`not_in`         | non-empty array; every item must match the field domain                                  |
| `eq`,`neq`            | scalar matching the field domain                                                         |

| `field` domain for `eq`/`neq`/`in`/`not_in`                      |
| ---------------------------------------------------------------- |
| `risk_score` — number 0–100                                      |
| `data_sensitivity` — integer 0–10                                |
| `tier` — `CRITICAL`,`HIGH`,`MEDIUM`,`LOW`                        |
| `priority` — `P0`,`P1`,`P2`,`P3`                                 |
| `asset_criticality` — `CRITICAL`,`HIGH`,`MEDIUM`,`LOW`,`UNRATED` |
| `environment` — `PRODUCTION`,`STAGING`,`DEVELOPMENT`,`UNKNOWN`   |
| `situation_severity` — `CRITICAL`,`HIGH`,`MEDIUM`,`LOW`,`INFO`   |
| `finding_type` — non-empty string                                |

#### Success Response Schema (JSON)

```json
// 201 Created
{
  "id": "pol-0001-0002-0003-000000000002",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "name": "Require approval for critical production risks",
  "description": "Block auto-approve when risk is critical in production",
  "policyType": "SECURITY_GUARDRAIL",
  "severity": "MANDATORY",
  "status": "DRAFT",
  "rules": [
    {
      "field": "risk_score",
      "operator": "gte",
      "value": 80,
      "action": "REQUIRE_APPROVAL",
      "message": "High risk score requires review"
    }
  ],
  "createdByUserId": "qip-user-abc123",
  "createdAt": "2026-09-24T12:00:00.000Z",
  "updatedAt": "2026-09-24T12:00:00.000Z"
}
```

> Creating a policy does **not** create a version — only `activate` does.

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440082"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440083"
  }
}
```

```json
// 422 Unprocessable Entity — nested rule validation (messages joined with '; ')
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "field must be one of the following values: risk_score, tier, priority, asset_criticality, data_sensitivity, environment, finding_type, situation_severity; action must be one of the following values: REQUIRE_APPROVAL, AUTO_APPROVE, BLOCK, ESCALATE",
    "request_id": "550e8400-e29b-41d4-a716-446655440084"
  }
}
```

```json
// 422 Unprocessable Entity — rule value missing
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "value should not be null or undefined",
    "request_id": "550e8400-e29b-41d4-a716-446655440085"
  }
}
```

```json
// 422 Unprocessable Entity — value fails the operator/field matrix
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "value must be a finite number when operator is \"gte\"",
    "request_id": "550e8400-e29b-41d4-a716-446655440086"
  }
}
```

```json
// 422 Unprocessable Entity — invalid policyType / empty rules / empty name
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "policyType must be one of the following values: SECURITY_GUARDRAIL, REGULATORY, ORG_POLICY, ASSET_POLICY, ENVIRONMENT_POLICY, DETERMINISTIC_RULE",
    "request_id": "550e8400-e29b-41d4-a716-446655440087"
  }
}
```

```json
// 422 Unprocessable Entity — empty rules array (other examples:
// "rules must contain at least 1 elements", "name should not be empty")
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "rules must contain at least 1 elements",
    "request_id": "550e8400-e29b-41d4-a716-446655440088"
  }
}
```

---

### 6.8 `PATCH /api/v1/policies/:id` — Update policy

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Audit:** `POLICY_UPDATED`

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "name": "Updated policy name",
  "description": "Updated notes",
  "rules": [
    {
      "field": "tier",
      "operator": "eq",
      "value": "CRITICAL",
      "action": "ESCALATE",
      "message": "Critical tier escalates"
    }
  ]
}
```

All optional (`name?`, `description?`, `rules?`). Same validators as create:
`name` `@IsNotEmpty`; `rules` (when present) `@ArrayMinSize(1)` with each rule
requiring `value` validated against the [operator/field matrix](#67-post-apiv1policies--create-policy-draft).
Does **not** create a version.

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "id": "pol-0001-0002-0003-000000000001",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "name": "Updated policy name",
  "description": "Updated notes",
  "policyType": "SECURITY_GUARDRAIL",
  "severity": "MANDATORY",
  "status": "ACTIVE",
  "rules": [
    {
      "field": "tier",
      "operator": "eq",
      "value": "CRITICAL",
      "action": "ESCALATE",
      "message": "Critical tier escalates"
    }
  ],
  "createdByUserId": "qip-user-abc123",
  "createdAt": "2026-09-01T00:00:00.000Z",
  "updatedAt": "2026-09-24T12:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440086"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440087"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Policy not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440088"
  }
}
```

```json
// 422 Unprocessable Entity — invalid operator (messages have no path prefix;
// field/operator/action errors are joined with '; ')
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "operator must be one of the following values: eq, neq, gt, gte, lt, lte, in, not_in",
    "request_id": "550e8400-e29b-41d4-a716-446655440089"
  }
}
```

```json
// 422 Unprocessable Entity — malformed id (UuidParamPipe) or rule without value
// ("value should not be null or undefined") or empty rules
// ("rules must contain at least 1 elements")
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "id must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-44665544008a"
  }
}
```

---

### 6.9 `POST /api/v1/policies/:id/activate` — Activate policy (version snapshot)

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Audit:** `POLICY_ACTIVATED` · **Status:** `201`

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "changeReason": "Initial activation"
}
```

| Field          | Type   | Required | Validation                     |
| -------------- | ------ | -------- | ------------------------------ |
| `changeReason` | string | no       | `@IsOptional @MaxLength(2000)` |

#### Success Response Schema (JSON)

```json
// 201 Created — returns the created PolicyVersion
{
  "id": "pv-0003",
  "policyId": "pol-0001-0002-0003-000000000001",
  "versionNumber": 3,
  "rulesSnapshot": [
    {
      "field": "risk_score",
      "operator": "gte",
      "value": 80,
      "action": "REQUIRE_APPROVAL",
      "message": "High risk score requires review"
    }
  ],
  "changeReason": "Initial activation",
  "createdByUserId": "qip-user-abc123",
  "createdAt": "2026-09-24T12:00:00.000Z"
}
```

> Audit `resourceId` is the **version** id. Policy `status` becomes `ACTIVE`.

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544008b"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-44665544008c"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Policy not found",
    "request_id": "550e8400-e29b-41d4-a716-44665544008d"
  }
}
```

```json
// 422 Unprocessable Entity
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "changeReason must be a string",
    "request_id": "550e8400-e29b-41d4-a716-44665544008e"
  }
}
```

```json
// 422 Unprocessable Entity — malformed id (UuidParamPipe)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "id must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-44665544008f"
  }
}
```

---

### 6.10 `POST /api/v1/policies/:id/archive` — Archive policy

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Audit:** `POLICY_ARCHIVED` · **Status:** `200` (`@HttpCode(OK)`)

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None` (body ignored)

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "id": "pol-0001-0002-0003-000000000001",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "name": "Require approval for critical production risks",
  "description": "Block auto-approve when risk is critical in production",
  "policyType": "SECURITY_GUARDRAIL",
  "severity": "MANDATORY",
  "status": "ARCHIVED",
  "rules": [],
  "createdByUserId": "qip-user-abc123",
  "createdAt": "2026-09-01T00:00:00.000Z",
  "updatedAt": "2026-09-24T12:00:00.000Z"
}
```

Idempotent — no state-machine guard.

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440090"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440091"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Policy not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440092"
  }
}
```

```json
// 422 Unprocessable Entity — malformed id (UuidParamPipe)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "id must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-446655440093"
  }
}
```

---

## Step 7 — Human Decision Loop & Teams

### 7.1 `POST /api/v1/decisions/:id/approve` — Approve decision

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Audit:** `DECISION_APPROVED` · **Status:** `201` (no `@HttpCode`)

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "note": "Looks correct — escalate to platform team"
}
```

| Field  | Type   | Required | Validation                               |
| ------ | ------ | -------- | ---------------------------------------- |
| `note` | string | no       | `@IsOptional @IsString @MaxLength(2000)` |

Allowed only from `PENDING` or `UNDER_REVIEW`.

#### Success Response Schema (JSON)

```json
// 201 Created
{
  "id": "dec-0011-2233-4455-66778899aabb",
  "status": "APPROVED"
}
```

#### Error Response Schema (JSON)

```json
// 409 Conflict - decision state gate (ConflictException)
{
  "error": {
    "code": "CONFLICT",
    "message": "Cannot approve decision in status RESOLVED",
    "request_id": "550e8400-e29b-41d4-a716-446655440094"
  }
}
```

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440095"
  }
}
```

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440096"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Decision not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440097"
  }
}
```

```json
// 422 Unprocessable Entity
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "note must be a string",
    "request_id": "550e8400-e29b-41d4-a716-446655440098"
  }
}
```

```json
// 500 Internal Server Error — history / SSE / DB failure
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440099"
  }
}
```

---

### 7.2 `POST /api/v1/decisions/:id/reject` — Reject decision

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Audit:** `DECISION_REJECTED` · **Status:** `201`

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "reason": "False positive — expected batch job",
  "note": "Verified with owning team"
}
```

| Field    | Type   | Required | Validation         |
| -------- | ------ | -------- | ------------------ |
| `reason` | string | no       | `@MaxLength(2000)` |
| `note`   | string | no       | `@MaxLength(2000)` |

#### Success Response Schema (JSON)

```json
// 201 Created
{
  "id": "dec-0011-2233-4455-66778899aabb",
  "status": "REJECTED"
}
```

#### Error Response Schema (JSON)

```json
// 409 Conflict - decision state gate (ConflictException - e.g. rejecting a RESOLVED decision)
{
  "error": {
    "code": "CONFLICT",
    "message": "Cannot reject decision in status RESOLVED",
    "request_id": "550e8400-e29b-41d4-a716-44665544009a"
  }
}
```

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544009b"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-44665544009c"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Decision not found",
    "request_id": "550e8400-e29b-41d4-a716-44665544009d"
  }
}
```

```json
// 422 Unprocessable Entity
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "reason must be a string",
    "request_id": "550e8400-e29b-41d4-a716-44665544009e"
  }
}
```

```json
// 500 Internal Server Error — other failures
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544009f"
  }
}
```

---

### 7.3 `POST /api/v1/decisions/:id/assign` — Assign owner

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Audit:** `DECISION_ASSIGNED` · **Status:** `201`

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "assignedToUserId": "qip-user-abc123"
}
```

| Field              | Type   | Required | Validation                                                       |
| ------------------ | ------ | -------- | ---------------------------------------------------------------- |
| `assignedToUserId` | string | **yes**  | `@IsString` (Swagger marks optional — still required at runtime) |

#### Success Response Schema (JSON)

```json
// 201 Created
{
  "id": "dec-0011-2233-4455-66778899aabb",
  "assignedToUserId": "qip-user-abc123"
}
```

No history/SLA/SSE side effects for assign.

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400a0"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-4466554400a1"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Decision not found",
    "request_id": "550e8400-e29b-41d4-a716-4466554400a2"
  }
}
```

```json
// 422 Unprocessable Entity — missing assignedToUserId
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "assignedToUserId must be a string",
    "request_id": "550e8400-e29b-41d4-a716-4466554400a3"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400a4"
  }
}
```

---

### 7.4 `GET /api/v1/decisions/:id/notes` — List investigation notes

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — missing decision returns []
[
  {
    "id": "note-0001",
    "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "decisionId": "dec-0011-2233-4455-66778899aabb",
    "authorUserId": "qip-user-abc123",
    "body": "Investigating login burst from unusual ASN.",
    "createdAt": "2026-09-24T11:00:00.000Z",
    "updatedAt": "2026-09-24T11:00:00.000Z",
    "deletedAt": null
  }
]
```

Ordered `createdAt desc`, `deletedAt: null`.

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400a5"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400a6"
  }
}
```

---

### 7.5 `POST /api/v1/decisions/:id/notes` — Create note

**Auth:** Bearer JWT · **RBAC:** `@RequireAnalystOrAdmin()` · **Audit:** `NOTE_CREATED` · **Status:** `201`

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "body": "Investigating login burst from unusual ASN. Correlated with situation sit-…"
}
```

| Field  | Type   | Required | Validation                    |
| ------ | ------ | -------- | ----------------------------- |
| `body` | string | yes      | `@IsString @MaxLength(10000)` |

#### Success Response Schema (JSON)

```json
// 201 Created
{
  "id": "note-0002",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "decisionId": "dec-0011-2233-4455-66778899aabb",
  "authorUserId": "qip-user-abc123",
  "body": "Investigating login burst from unusual ASN. Correlated with situation sit-…",
  "createdAt": "2026-09-24T11:10:00.000Z",
  "updatedAt": "2026-09-24T11:10:00.000Z",
  "deletedAt": null
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400a7"
  }
}
```

```json
// 403 Forbidden — AUDITOR / READ_ONLY
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN or ANALYST role",
    "request_id": "550e8400-e29b-41d4-a716-4466554400a8"
  }
}
```

```json
// 404 Not Found — decision missing
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Decision not found",
    "request_id": "550e8400-e29b-41d4-a716-4466554400a9"
  }
}
```

```json
// 422 Unprocessable Entity
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "body must be a string; body must not be longer than 10000 characters",
    "request_id": "550e8400-e29b-41d4-a716-4466554400aa"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400ab"
  }
}
```

---

### 7.6 `PATCH /api/v1/decisions/:id/notes/:noteId` — Edit note

**Auth:** Bearer JWT · **RBAC:** `@RequireAnalystOrAdmin()` · **Audit:** `NOTE_UPDATED` · **Status:** `200`

#### Path / Query Parameters

| Location | Name     | Type          | Required          |
| -------- | -------- | ------------- | ----------------- |
| path     | `id`     | string (uuid) | yes — decision id |
| path     | `noteId` | string (uuid) | yes               |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "body": "Updated: confirmed source ASN with upstream provider."
}
```

| Field  | Type   | Required | Validation                    |
| ------ | ------ | -------- | ----------------------------- |
| `body` | string | yes      | `@IsString @MaxLength(10000)` |

**Author-only** edit.

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "id": "note-0002",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "decisionId": "dec-0011-2233-4455-66778899aabb",
  "authorUserId": "qip-user-abc123",
  "body": "Updated: confirmed source ASN with upstream provider.",
  "createdAt": "2026-09-24T11:10:00.000Z",
  "updatedAt": "2026-09-24T12:00:00.000Z",
  "deletedAt": null
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400ac"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN or ANALYST role",
    "request_id": "550e8400-e29b-41d4-a716-4466554400ad"
  }
}
```

```json
// 404 Not Found — note not found / soft-deleted / other decision
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Note not found",
    "request_id": "550e8400-e29b-41d4-a716-4466554400ae"
  }
}
```

```json
// 422 Unprocessable Entity
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "body must be a string",
    "request_id": "550e8400-e29b-41d4-a716-4466554400af"
  }
}
```

```json
// 500 Internal Server Error — non-author (plain Error)
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Only the original author can edit a note",
    "request_id": "550e8400-e29b-41d4-a716-4466554400b0"
  }
}
```

```json
// 500 Internal Server Error — other
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400b1"
  }
}
```

---

### 7.7 `POST /api/v1/decisions/:id/assign-team` — Reassign decision to team

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Audit:** `DECISION_TEAM_REASSIGNED` · **Status:** `201`
**Controller:** `DecisionTeamController` in `src/teams/teams.controller.ts`

#### Path / Query Parameters

| Location | Name | Type          | Required          |
| -------- | ---- | ------------- | ----------------- |
| path     | `id` | string (uuid) | yes — decision id |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "teamId": "team-0001-0002-0003-000000000001",
  "reason": "SOC night shift owns credential incidents"
}
```

| Field    | Type   | Required | Validation                     |
| -------- | ------ | -------- | ------------------------------ |
| `teamId` | uuid   | yes      | `@IsUUID`                      |
| `reason` | string | no       | `@IsOptional @MaxLength(2000)` |

#### Success Response Schema (JSON)

```json
// 201 Created
{
  "id": "dta-0001",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "decisionId": "dec-0011-2233-4455-66778899aabb",
  "teamId": "team-0001-0002-0003-000000000001",
  "assignedByUserId": "qip-user-abc123",
  "assignmentSource": "MANUALLY_ASSIGNED",
  "assignmentReason": "SOC night shift owns credential incidents",
  "previousTeamId": null,
  "createdAt": "2026-09-24T12:00:00.000Z",
  "updatedAt": "2026-09-24T12:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400b2"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-4466554400b3"
  }
}
```

```json
// 404 Not Found — team pre-checked (decision NOT pre-checked)
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Team not found",
    "request_id": "550e8400-e29b-41d4-a716-4466554400b4"
  }
}
```

```json
// 422 Unprocessable Entity
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "teamId must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-4466554400b5"
  }
}
```

```json
// 500 Internal Server Error — unknown decision id hits FK (decision not pre-checked)
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400b6"
  }
}
```

---

### 7.8 `GET /api/v1/teams` — List teams

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — ordered name asc
[
  {
    "id": "team-0001-0002-0003-000000000001",
    "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "name": "SOC-Night",
    "description": "Night shift",
    "isActive": true,
    "createdAt": "2026-09-01T00:00:00.000Z",
    "updatedAt": "2026-09-01T00:00:00.000Z",
    "_count": { "members": 4 }
  }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400b7"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400b8"
  }
}
```

---

### 7.9 `GET /api/v1/teams/:id` — Get team with members

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "id": "team-0001-0002-0003-000000000001",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "name": "SOC-Night",
  "description": "Night shift",
  "isActive": true,
  "createdAt": "2026-09-01T00:00:00.000Z",
  "updatedAt": "2026-09-01T00:00:00.000Z",
  "members": [
    {
      "id": "tm-0001",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "teamId": "team-0001-0002-0003-000000000001",
      "userId": "qip-user-abc123",
      "isLead": true,
      "createdAt": "2026-09-01T00:00:00.000Z"
    }
  ]
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400b9"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Team not found",
    "request_id": "550e8400-e29b-41d4-a716-4466554400ba"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400bb"
  }
}
```

---

### 7.10 `POST /api/v1/teams` — Create team

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Audit:** `TEAM_CREATED` · **Status:** `201`

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

```json
{
  "name": "SOC-Night",
  "description": "Night shift"
}
```

| Field         | Type   | Required | Validation                         |
| ------------- | ------ | -------- | ---------------------------------- |
| `name`        | string | yes      | `@MaxLength(200)` — unique per org |
| `description` | string | no       | `@MaxLength(2000)`                 |

#### Success Response Schema (JSON)

```json
// 201 Created
{
  "id": "team-0001-0002-0003-000000000001",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "name": "SOC-Night",
  "description": "Night shift",
  "isActive": true,
  "createdAt": "2026-09-24T12:00:00.000Z",
  "updatedAt": "2026-09-24T12:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400bc"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-4466554400bd"
  }
}
```

```json
// 422 Unprocessable Entity
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "name must be a string; name must not be longer than 200 characters",
    "request_id": "550e8400-e29b-41d4-a716-4466554400be"
  }
}
```

```json
// 500 Internal Server Error — duplicate (organizationId, name) P2002 (no 409)
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Unique constraint failed on the fields: (`organizationId`,`name`)",
    "request_id": "550e8400-e29b-41d4-a716-4466554400bf"
  }
}
```

---

### 7.11 `PATCH /api/v1/teams/:id` — Update team

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Audit:** `TEAM_UPDATED` · **Status:** `200`

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "name": "SOC-Night-Shift",
  "description": "Updated description",
  "isActive": true
}
```

| Field         | Type    | Required |
| ------------- | ------- | -------- |
| `name`        | string  | no       |
| `description` | string  | no       |
| `isActive`    | boolean | no       |

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "id": "team-0001-0002-0003-000000000001",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "name": "SOC-Night-Shift",
  "description": "Updated description",
  "isActive": true,
  "createdAt": "2026-09-01T00:00:00.000Z",
  "updatedAt": "2026-09-24T12:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400c0"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-4466554400c1"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Team not found",
    "request_id": "550e8400-e29b-41d4-a716-4466554400c2"
  }
}
```

```json
// 422 Unprocessable Entity
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "isActive must be a boolean",
    "request_id": "550e8400-e29b-41d4-a716-4466554400c3"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400c4"
  }
}
```

---

### 7.12 `DELETE /api/v1/teams/:id` — Deactivate team (soft)

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Audit:** `TEAM_DEACTIVATED` · **Status:** `200` (not 204)

#### Path / Query Parameters

| Location | Name | Type          | Required |
| -------- | ---- | ------------- | -------- |
| path     | `id` | string (uuid) | yes      |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "id": "team-0001-0002-0003-000000000001",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "name": "SOC-Night",
  "description": "Night shift",
  "isActive": false,
  "createdAt": "2026-09-01T00:00:00.000Z",
  "updatedAt": "2026-09-24T12:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400c5"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-4466554400c6"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Team not found",
    "request_id": "550e8400-e29b-41d4-a716-4466554400c7"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400c8"
  }
}
```

---

### 7.13 `POST /api/v1/teams/:id/members` — Add/upsert member

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Audit:** `TEAM_MEMBER_ADDED` · **Status:** `201`

#### Path / Query Parameters

| Location | Name | Type          | Required      |
| -------- | ---- | ------------- | ------------- |
| path     | `id` | string (uuid) | yes — team id |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "userId": "qip-user-abc123",
  "isLead": true
}
```

| Field    | Type    | Required | Validation                                                               |
| -------- | ------- | -------- | ------------------------------------------------------------------------ |
| `userId` | uuid    | yes      | `@IsUUID` — **not** validated against users (no FK)                      |
| `isLead` | boolean | no       | `@IsOptional @IsBoolean` — omitting on existing member resets to `false` |

Upsert on `(organizationId, teamId, userId)`.

#### Success Response Schema (JSON)

```json
// 201 Created
{
  "id": "tm-0001",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "teamId": "team-0001-0002-0003-000000000001",
  "userId": "qip-user-abc123",
  "isLead": true,
  "createdAt": "2026-09-24T12:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400c9"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-4466554400ca"
  }
}
```

```json
// 404 Not Found — team missing
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Team not found",
    "request_id": "550e8400-e29b-41d4-a716-4466554400cb"
  }
}
```

```json
// 422 Unprocessable Entity — non-uuid userId
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "userId must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-4466554400cc"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400cd"
  }
}
```

---

### 7.14 `DELETE /api/v1/teams/:id/members/:userId` — Remove member

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Audit:** `TEAM_MEMBER_REMOVED` · **Status:** `200`

#### Path / Query Parameters

| Location | Name     | Type          | Required      |
| -------- | -------- | ------------- | ------------- |
| path     | `id`     | string (uuid) | yes — team id |
| path     | `userId` | string        | yes           |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — returns the deleted TeamMember row (hard delete)
{
  "id": "tm-0001",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "teamId": "team-0001-0002-0003-000000000001",
  "userId": "qip-user-abc123",
  "isLead": true,
  "createdAt": "2026-09-01T00:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400ce"
  }
}
```

```json
// 403 Forbidden
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-4466554400cf"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Team member not found",
    "request_id": "550e8400-e29b-41d4-a716-4466554400d0"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400d1"
  }
}
```

---

## Step 8 — Remediation, Verification & Corrections

Post-approval lifecycle: `APPROVED → (remediation) → REMEDIATION_SUBMITTED → (verification) → VERIFIED | REOPENED`.
Evidence rows are immutable; corrections append a `Correction` record and never edit evidence.

**State-gate messages (exact):**

- Remediation accepts only `APPROVED`, `IN_PROGRESS`, `REOPENED` →
  `Decision in status "{status}" does not accept remediation submissions. Only APPROVED, IN_PROGRESS, or REOPENED decisions can be remediated.`
- Verification accepts only `REMEDIATION_SUBMITTED` →
  `Decision in status "{status}" does not accept verification. Only REMEDIATION_SUBMITTED decisions can be verified.`
- Verification also requires ≥1 action →
  `Decision has no remediation actions. Cannot verify a decision without remediation.`

> **Evidence `rawPayload`:** accepted on remediation/verification evidence — `@IsOptional @IsObject()`. A non-object value → **422** `rawPayload must be an object`.

---

### 8.1 `POST /api/v1/decisions/:id/remediation` — Submit remediation

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Audit:** `REMEDIATION_SUBMITTED` · **Status:** `201`

#### Path / Query Parameters

| Location | Name | Type          | Required          |
| -------- | ---- | ------------- | ----------------- |
| path     | `id` | string (uuid) | yes — decision id |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "actionType": "PATCH_APPLIED",
  "title": "Rotated exposed API key",
  "description": "Key rotated and old key revoked in IdP.",
  "evidences": [
    {
      "evidenceType": "LOG_EXTRACT",
      "title": "Rotation audit log",
      "description": "IdP key rotation entry"
    }
  ]
}
```

| Field         | Type   | Required | Validation                                                                     |
| ------------- | ------ | -------- | ------------------------------------------------------------------------------ |
| `actionType`  | enum   | **yes**  | `REMEDIATION`, `PATCH_APPLIED`, `CONFIG_CHANGE`, `WORKAROUND`, `DOCUMENTATION` |
| `title`       | string | **yes**  | `@IsString @MaxLength(500)`                                                    |
| `description` | string | no       | `@IsOptional @IsString @MaxLength(10000)`                                      |
| `evidences`   | array  | no       | `@IsOptional @ValidateNested({each})` of `RemediationEvidenceDto`              |

`RemediationEvidenceDto`:

| Field          | Type   | Required | Validation                                                                                       |
| -------------- | ------ | -------- | ------------------------------------------------------------------------------------------------ |
| `evidenceType` | enum   | **yes**  | `DOCUMENT`, `LOG_EXTRACT`, `CONFIG_SNAPSHOT`, `SCREENSHOT`, `CODE_DIFF`, `SCAN_RESULT`, `CUSTOM` |
| `title`        | string | **yes**  | `@IsString @MaxLength(500)`                                                                      |
| `description`  | string | no       | `@IsOptional @IsString @MaxLength(10000)`                                                        |
| `rawPayload`   | object | no       | `@IsOptional @IsObject()` — non-object → **422** `rawPayload must be an object`                  |

Transitions decision → `REMEDIATION_SUBMITTED`; after commit SSE `decision.remediation_submitted` + SLA `REMEDIATION_SUBMITTED`.

#### Success Response Schema (JSON)

```json
// 201 Created
{
  "action": {
    "id": "act-0001-2233-4455-66778899aabb",
    "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "decisionId": "dec-0011-2233-4455-66778899aabb",
    "actionType": "PATCH_APPLIED",
    "title": "Rotated exposed API key",
    "description": "Key rotated and old key revoked in IdP.",
    "submittedByUserId": "qip-user-abc123",
    "submittedAt": "2026-09-24T12:00:00.000Z",
    "createdAt": "2026-09-24T12:00:00.000Z",
    "updatedAt": "2026-09-24T12:00:00.000Z"
  },
  "evidences": [
    {
      "id": "ae-0001",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "actionId": "act-0001-2233-4455-66778899aabb",
      "evidenceId": "ev-0001-2233-4455-66778899aabb",
      "evidenceType": "LOG_EXTRACT",
      "title": "Rotation audit log",
      "description": "IdP key rotation entry",
      "createdAt": "2026-09-24T12:00:00.000Z"
    }
  ]
}
```

#### Error Response Schema (JSON)

```json
// 400 Bad Request — state gate (Nest reason-phrase often wins as code)
{
  "error": {
    "code": "Bad Request",
    "message": "Decision in status \"UNDER_REVIEW\" does not accept remediation submissions. Only APPROVED, IN_PROGRESS, or REOPENED decisions can be remediated.",
    "request_id": "550e8400-e29b-41d4-a716-4466554400d2"
  }
}
```

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400d3"
  }
}
```

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-4466554400d4"
  }
}
```

```json
// 404 Not Found — decision missing or cross-tenant
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Decision not found",
    "request_id": "550e8400-e29b-41d4-a716-4466554400d5"
  }
}
```

```json
// 422 Unprocessable Entity — DTO failure (e.g. rawPayload not an object)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "rawPayload must be an object; actionType must be one of the following values: REMEDIATION, PATCH_APPLIED, CONFIG_CHANGE, WORKAROUND, DOCUMENTATION",
    "request_id": "550e8400-e29b-41d4-a716-4466554400d0"
  }
}
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400d7"
  }
}
```

---

### 8.2 `GET /api/v1/decisions/:id/remediation` — List remediations

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name    | Type          | Required          |
| -------- | ------- | ------------- | ----------------- |
| path     | `id`    | string (uuid) | yes — decision id |
| query    | `page`  | int ≥ 1       | no — default `1`  |
| query    | `limit` | int 1–100     | no — default `20` |

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — ordered submittedAt desc
{
  "items": [
    {
      "id": "act-0001-2233-4455-66778899aabb",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "decisionId": "dec-0011-2233-4455-66778899aabb",
      "actionType": "PATCH_APPLIED",
      "title": "Rotated exposed API key",
      "description": "Key rotated and old key revoked in IdP.",
      "submittedByUserId": "qip-user-abc123",
      "submittedAt": "2026-09-24T12:00:00.000Z",
      "createdAt": "2026-09-24T12:00:00.000Z",
      "updatedAt": "2026-09-24T12:00:00.000Z",
      "evidenceLinks": [
        {
          "id": "ae-0001",
          "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
          "actionId": "act-0001-2233-4455-66778899aabb",
          "evidenceId": "ev-0001-2233-4455-66778899aabb",
          "evidenceType": "LOG_EXTRACT",
          "title": "Rotation audit log",
          "description": "IdP key rotation entry",
          "createdAt": "2026-09-24T12:00:00.000Z",
          "evidence": {
            "id": "ev-0001-2233-4455-66778899aabb",
            "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
            "source": "remediation.submitted",
            "sourceId": "act-0001-2233-4455-66778899aabb",
            "sourceType": "actions",
            "rawPayload": {},
            "hash": "0f1e2d3c4b5a69788796a5b4c3d2e1f00112233445566778899aabbccddeeff",
            "capturedAt": "2026-09-24T12:00:00.000Z",
            "createdAt": "2026-09-24T12:00:00.000Z"
          }
        }
      ]
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400d8"
  }
}
```

```json
// 404 Not Found — decision missing
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Decision not found",
    "request_id": "550e8400-e29b-41d4-a716-4466554400d9"
  }
}
```

```json
// 422 Unprocessable Entity — page/limit out of range or unknown query key
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "limit must not be greater than 100; page must not be less than 1",
    "request_id": "550e8400-e29b-41d4-a716-4466554400da"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400db"
  }
}
```

---

### 8.3 `GET /api/v1/decisions/:id/remediation/:actionId` — Get one remediation

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name       | Type          | Required                    |
| -------- | ---------- | ------------- | --------------------------- |
| path     | `id`       | string (uuid) | yes — decision id           |
| path     | `actionId` | string (uuid) | yes — remediation action id |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — Action with evidenceLinks (evidence included, createdAt asc)
{
  "id": "act-0001-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "decisionId": "dec-0011-2233-4455-66778899aabb",
  "actionType": "PATCH_APPLIED",
  "title": "Rotated exposed API key",
  "description": "Key rotated and old key revoked in IdP.",
  "submittedByUserId": "qip-user-abc123",
  "submittedAt": "2026-09-24T12:00:00.000Z",
  "createdAt": "2026-09-24T12:00:00.000Z",
  "updatedAt": "2026-09-24T12:00:00.000Z",
  "evidenceLinks": [
    {
      "id": "ae-0001",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "actionId": "act-0001-2233-4455-66778899aabb",
      "evidenceId": "ev-0001-2233-4455-66778899aabb",
      "evidenceType": "LOG_EXTRACT",
      "title": "Rotation audit log",
      "description": "IdP key rotation entry",
      "createdAt": "2026-09-24T12:00:00.000Z",
      "evidence": {
        "id": "ev-0001-2233-4455-66778899aabb",
        "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
        "source": "remediation.submitted",
        "sourceId": "act-0001-2233-4455-66778899aabb",
        "sourceType": "actions",
        "rawPayload": {},
        "hash": "0f1e2d3c4b5a69788796a5b4c3d2e1f00112233445566778899aabbccddeeff",
        "capturedAt": "2026-09-24T12:00:00.000Z",
        "createdAt": "2026-09-24T12:00:00.000Z"
      }
    }
  ]
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400dc"
  }
}
```

```json
// 404 Not Found — decision missing
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Decision not found",
    "request_id": "550e8400-e29b-41d4-a716-4466554400dd"
  }
}
```

```json
// 404 Not Found — action missing or belongs to another decision
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Remediation action not found",
    "request_id": "550e8400-e29b-41d4-a716-4466554400de"
  }
}
```

```json
// 422 Unprocessable Entity — non-UUID path params (if validated)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "actionId must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-4466554400df"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400e0"
  }
}
```

---

### 8.4 `POST /api/v1/decisions/:id/verification` — Submit verification

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Audit:** `DECISION_VERIFIED` · **Status:** `201`

#### Path / Query Parameters

| Location | Name | Type          | Required                                            |
| -------- | ---- | ------------- | --------------------------------------------------- |
| path     | `id` | string (uuid) | yes — decision id (must be `REMEDIATION_SUBMITTED`) |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "verificationType": "TECHNICAL_RECHECK",
  "result": "PASS",
  "notes": "Re-scanned; no open ports on admin path.",
  "evidences": [
    {
      "evidenceType": "SCAN_RESULT",
      "title": "Post-remediation scan",
      "description": "Clean scan output"
    }
  ]
}
```

| Field              | Type   | Required | Validation                                                                      |
| ------------------ | ------ | -------- | ------------------------------------------------------------------------------- |
| `verificationType` | enum   | **yes**  | `TECHNICAL_RECHECK`, `SECURITY_VALIDATION`                                      |
| `result`           | enum   | **yes**  | `PASS`, `FAIL`, `PARTIAL`                                                       |
| `notes`            | string | no       | `@IsOptional @IsString @MaxLength(10000)`                                       |
| `evidences`        | array  | no       | same rules as remediation evidence — `rawPayload` accepted when it is an object |

**Outcome logic:** `PASS` → decision `VERIFIED` (terminal); `FAIL`/`PARTIAL` → `REOPENED` **and** clones original finding as `[Recheck] {title}` (`findingSource=MANUAL`, `findingType={old}:recheck`) enqueued to `risk-decision` (`jobId=recheck-{org}-{findingId}-{ts}`, `forceRecalculate=false`). SSE `decision.verified` / `decision.reopened`; SLA `VERIFICATION_COMPLETED`.

#### Success Response Schema (JSON)

```json
// 201 Created
{
  "verification": {
    "id": "ver-0001-2233-4455-66778899aabb",
    "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "decisionId": "dec-0011-2233-4455-66778899aabb",
    "verificationType": "TECHNICAL_RECHECK",
    "result": "PASS",
    "performedByUserId": "qip-user-abc123",
    "notes": "Re-scanned; no open ports on admin path.",
    "createdAt": "2026-09-24T13:00:00.000Z"
  },
  "evidences": [
    {
      "id": "ve-0001",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "verificationId": "ver-0001-2233-4455-66778899aabb",
      "evidenceId": "ev-0002-2233-4455-66778899aabb",
      "evidenceType": "SCAN_RESULT",
      "title": "Post-remediation scan",
      "description": "Clean scan output",
      "createdAt": "2026-09-24T13:00:00.000Z"
    }
  ],
  "outcome": {
    "id": "out-0001-2233-4455-66778899aabb",
    "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "decisionId": "dec-0011-2233-4455-66778899aabb",
    "verificationId": "ver-0001-2233-4455-66778899aabb",
    "outcomeType": "VERIFIED",
    "notes": "Re-scanned; no open ports on admin path.",
    "createdAt": "2026-09-24T13:00:00.000Z"
  }
}
```

#### Error Response Schema (JSON)

```json
// 400 Bad Request — wrong decision status for verification
{
  "error": {
    "code": "Bad Request",
    "message": "Decision in status \"APPROVED\" does not accept verification. Only REMEDIATION_SUBMITTED decisions can be verified.",
    "request_id": "550e8400-e29b-41d4-a716-4466554400e1"
  }
}
```

```json
// 400 Bad Request — no remediation actions yet
{
  "error": {
    "code": "Bad Request",
    "message": "Decision has no remediation actions. Cannot verify a decision without remediation.",
    "request_id": "550e8400-e29b-41d4-a716-4466554400e2"
  }
}
```

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400e3"
  }
}
```

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-4466554400e4"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Decision not found",
    "request_id": "550e8400-e29b-41d4-a716-4466554400e5"
  }
}
```

```json
// 422 Unprocessable Entity — DTO failure
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "result must be one of the following values: PASS, FAIL, PARTIAL; verificationType must be one of the following values: TECHNICAL_RECHECK, SECURITY_VALIDATION",
    "request_id": "550e8400-e29b-41d4-a716-4466554400e6"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400e7"
  }
}
```

---

### 8.5 `GET /api/v1/decisions/:id/verification` — List verifications

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name    | Type          | Required          |
| -------- | ------- | ------------- | ----------------- |
| path     | `id`    | string (uuid) | yes — decision id |
| query    | `page`  | int ≥ 1       | no — default `1`  |
| query    | `limit` | int 1–100     | no — default `20` |

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — ordered createdAt desc; evidenceLinks + outcomes included
{
  "items": [
    {
      "id": "ver-0001-2233-4455-66778899aabb",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "decisionId": "dec-0011-2233-4455-66778899aabb",
      "verificationType": "TECHNICAL_RECHECK",
      "result": "PASS",
      "performedByUserId": "qip-user-abc123",
      "notes": "Re-scanned; no open ports on admin path.",
      "createdAt": "2026-09-24T13:00:00.000Z",
      "evidenceLinks": [
        {
          "id": "ve-0001",
          "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
          "verificationId": "ver-0001-2233-4455-66778899aabb",
          "evidenceId": "ev-0002-2233-4455-66778899aabb",
          "evidenceType": "SCAN_RESULT",
          "title": "Post-remediation scan",
          "description": "Clean scan output",
          "createdAt": "2026-09-24T13:00:00.000Z",
          "evidence": {
            "id": "ev-0002-2233-4455-66778899aabb",
            "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
            "source": "verification.submitted",
            "sourceId": "ver-0001-2233-4455-66778899aabb",
            "sourceType": "verifications",
            "rawPayload": {},
            "hash": "6b8e4d2c9a1f7e3052d8b4c6a9e1f7d3b5c8a2e6f0d4b7a1c3e9f5d2b8a6c4e7",
            "capturedAt": "2026-09-24T13:00:00.000Z",
            "createdAt": "2026-09-24T13:00:00.000Z"
          }
        }
      ],
      "outcomes": [
        {
          "id": "out-0001-2233-4455-66778899aabb",
          "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
          "decisionId": "dec-0011-2233-4455-66778899aabb",
          "verificationId": "ver-0001-2233-4455-66778899aabb",
          "outcomeType": "VERIFIED",
          "notes": "Re-scanned; no open ports on admin path.",
          "createdAt": "2026-09-24T13:00:00.000Z"
        }
      ]
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400e8"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Decision not found",
    "request_id": "550e8400-e29b-41d4-a716-4466554400e9"
  }
}
```

```json
// 422 Unprocessable Entity — page/limit validation
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "limit must not be greater than 100; page must not be less than 1",
    "request_id": "550e8400-e29b-41d4-a716-4466554400ea"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400eb"
  }
}
```

---

### 8.6 `GET /api/v1/decisions/:id/verification/:verificationId` — Get one verification

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name             | Type          | Required          |
| -------- | ---------------- | ------------- | ----------------- |
| path     | `id`             | string (uuid) | yes — decision id |
| path     | `verificationId` | string (uuid) | yes               |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — Verification + evidenceLinks (with evidence) + outcomes
{
  "id": "ver-0001-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "decisionId": "dec-0011-2233-4455-66778899aabb",
  "verificationType": "TECHNICAL_RECHECK",
  "result": "PASS",
  "performedByUserId": "qip-user-abc123",
  "notes": "Re-scanned; no open ports on admin path.",
  "createdAt": "2026-09-24T13:00:00.000Z",
  "evidenceLinks": [
    {
      "id": "ve-0001",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "verificationId": "ver-0001-2233-4455-66778899aabb",
      "evidenceId": "ev-0002-2233-4455-66778899aabb",
      "evidenceType": "SCAN_RESULT",
      "title": "Post-remediation scan",
      "description": "Clean scan output",
      "createdAt": "2026-09-24T13:00:00.000Z",
      "evidence": {
        "id": "ev-0002-2233-4455-66778899aabb",
        "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
        "source": "verification.submitted",
        "sourceId": "ver-0001-2233-4455-66778899aabb",
        "sourceType": "verifications",
        "rawPayload": {},
        "hash": "6b8e4d2c9a1f7e3052d8b4c6a9e1f7d3b5c8a2e6f0d4b7a1c3e9f5d2b8a6c4e7",
        "capturedAt": "2026-09-24T13:00:00.000Z",
        "createdAt": "2026-09-24T13:00:00.000Z"
      }
    }
  ],
  "outcomes": [
    {
      "id": "out-0001-2233-4455-66778899aabb",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "decisionId": "dec-0011-2233-4455-66778899aabb",
      "verificationId": "ver-0001-2233-4455-66778899aabb",
      "outcomeType": "VERIFIED",
      "notes": "Re-scanned; no open ports on admin path.",
      "createdAt": "2026-09-24T13:00:00.000Z"
    }
  ]
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400ec"
  }
}
```

```json
// 404 Not Found — decision missing
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Decision not found",
    "request_id": "550e8400-e29b-41d4-a716-4466554400ed"
  }
}
```

```json
// 404 Not Found — verification missing or wrong decision
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Verification not found",
    "request_id": "550e8400-e29b-41d4-a716-4466554400ee"
  }
}
```

```json
// 422 Unprocessable Entity — non-UUID path params (if validated)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "verificationId must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-4466554400ef"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400f0"
  }
}
```

---

### 8.7 `POST /api/v1/corrections` — Create correction (append-only)

**Auth:** Bearer JWT · **RBAC:** `@RequireAnalystOrAdmin()` · **Audit:** `CORRECTION_CREATED` · **Status:** `201`

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

```json
{
  "evidenceId": "ev-0001-2233-4455-66778899aabb",
  "correctionType": "REINTERPRETATION",
  "correctedPayload": {
    "verdict": "benign",
    "analystNote": "Known scanner IP"
  },
  "reason": "MISP list was stale; asset is an approved pentest runner."
}
```

| Field              | Type   | Required | Validation                                                                                                                |
| ------------------ | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `evidenceId`       | string | **yes**  | `@IsString`                                                                                                               |
| `correctionType`   | string | no       | `@IsOptional @IsString` — convention `ANNOTATION`, `REINTERPRETATION`, `DATA_FIX` (no `@IsEnum`; DB default `ANNOTATION`) |
| `correctedPayload` | object | **yes**  | `@IsObject`                                                                                                               |
| `reason`           | string | **yes**  | `@IsString @MaxLength(2000)`                                                                                              |

Snapshots evidence `rawPayload` as `originalPayload`; evidence row is never edited.

#### Success Response Schema (JSON)

```json
// 201 Created — id only
{
  "id": "cor-0001-2233-4455-66778899aabb"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400f1"
  }
}
```

```json
// 403 Forbidden — AUDITOR / READ_ONLY
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN or ANALYST role",
    "request_id": "550e8400-e29b-41d4-a716-4466554400f2"
  }
}
```

```json
// 404 Not Found — evidence missing or cross-tenant
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Evidence ev-0001-2233-4455-66778899aabb not found or access denied",
    "request_id": "550e8400-e29b-41d4-a716-4466554400f3"
  }
}
```

```json
// 422 Unprocessable Entity — missing/invalid fields
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "evidenceId must be a string; correctedPayload must be an object; reason must be a string",
    "request_id": "550e8400-e29b-41d4-a716-4466554400f4"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400f5"
  }
}
```

---

### 8.8 `GET /api/v1/corrections` — List corrections

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name         | Type      | Required                                  |
| -------- | ------------ | --------- | ----------------------------------------- |
| query    | `evidenceId` | string    | no                                        |
| query    | `limit`      | int 1–200 | no — default `50` (**offset** pagination) |
| query    | `offset`     | int ≥ 0   | no — default `0`                          |

Path: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — ordered createdAt desc (offset pagination: { items, total, limit, offset })
{
  "items": [
    {
      "id": "cor-0001-2233-4455-66778899aabb",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "evidenceId": "ev-0001-2233-4455-66778899aabb",
      "authorUserId": "qip-user-abc123",
      "correctionType": "REINTERPRETATION",
      "originalPayload": { "verdict": "malicious" },
      "correctedPayload": {
        "verdict": "benign",
        "analystNote": "Known scanner IP"
      },
      "reason": "MISP list was stale; asset is an approved pentest runner.",
      "auditLogId": null,
      "createdAt": "2026-09-24T12:30:00.000Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400f6"
  }
}
```

```json
// 422 Unprocessable Entity — limit > 200, negative offset, unknown key
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "limit must not be greater than 200; offset must not be less than 0",
    "request_id": "550e8400-e29b-41d4-a716-4466554400f7"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400f8"
  }
}
```

---

### 8.9 `GET /api/v1/corrections/:id` — Get correction

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name | Type          | Required            |
| -------- | ---- | ------------- | ------------------- |
| path     | `id` | string (uuid) | yes — correction id |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — full Correction row
{
  "id": "cor-0001-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "evidenceId": "ev-0001-2233-4455-66778899aabb",
  "authorUserId": "qip-user-abc123",
  "correctionType": "REINTERPRETATION",
  "originalPayload": { "verdict": "malicious" },
  "correctedPayload": {
    "verdict": "benign",
    "analystNote": "Known scanner IP"
  },
  "reason": "MISP list was stale; asset is an approved pentest runner.",
  "auditLogId": null,
  "createdAt": "2026-09-24T12:30:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400f9"
  }
}
```

```json
// 404 Not Found — missing or cross-tenant
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Correction cor-0001-2233-4455-66778899aabb not found or access denied",
    "request_id": "550e8400-e29b-41d4-a716-4466554400fa"
  }
}
```

```json
// 422 Unprocessable Entity — non-UUID path param (if validated)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "id must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-4466554400fb"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-4466554400fc"
  }
}
```

---

## Step 9 — Authorized Scanning

Optional parallel track. Every target must be opted in (`asset.scanEnabled = true`) before any scan. Scans run out-of-band via the `scans` queue (never synchronous). V1 scope: DNS, TLS/cert expiry, HTTP security headers, host discovery, port/service inventory, known-CVE mapping. **No exploitation / pentesting.**

**SSRF:** TLS, HTTP_HEADERS, HOST_DISCOVERY, PORT_SCAN call `SsrfGuardService.validateTarget` before any outbound connection (DNS/VULNERABILITY make no outbound socket). Blocked ranges → per-check `ERROR` result (not job-level crash).

**Write RBAC:** all policy/trigger writes are `@RequireAdmin()` — ANALYST cannot manage or launch scans.

---

### 9.1 `POST /api/v1/scans/policies` — Create scan policy

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Status:** `201`

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

```json
{
  "assetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "scanTypes": ["DNS", "TLS", "HTTP_HEADERS"],
  "intervalMinutes": 1440,
  "enabled": true
}
```

| Field             | Type    | Required | Validation                                                                           |
| ----------------- | ------- | -------- | ------------------------------------------------------------------------------------ |
| `assetId`         | uuid    | **yes**  | `@IsUUID @IsNotEmpty`                                                                |
| `scanTypes`       | enum[]  | **yes**  | each of `DNS`, `TLS`, `HTTP_HEADERS`, `HOST_DISCOVERY`, `PORT_SCAN`, `VULNERABILITY` |
| `intervalMinutes` | int     | no       | `@Min(60) @Max(10080)` — default `1440`                                              |
| `enabled`         | boolean | no       | default `true`                                                                       |

Asset **opt-in IS checked on create**: the asset must have `scanEnabled = true` (§3.4 PATCH) → else **403** `Asset {assetId} has not opted in to scanning (scanEnabled=false)` (as-built; earlier note "opt-in not checked on create" was wrong). Unique per `(organizationId, assetId)`.

#### Success Response Schema (JSON)

```json
// 201 Created
{
  "id": "sp-0001-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "assetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "scanTypes": ["DNS", "TLS", "HTTP_HEADERS"],
  "intervalMinutes": 1440,
  "enabled": true,
  "scanConfig": "{}",
  "lastRunAt": null,
  "nextRunAt": null,
  "createdAt": "2026-09-24T12:00:00.000Z",
  "updatedAt": "2026-09-24T12:00:00.000Z",
  "deletedAt": null
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-4466554400fd"
  }
}
```

```json
// 403 Forbidden — non-admin (ANALYST cannot manage scans)
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-4466554400fe"
  }
}
```

```json
// 404 Not Found — asset missing, soft-deleted, or cross-tenant
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Asset not found",
    "request_id": "550e8400-e29b-41d4-a716-4466554400ff"
  }
}
```

```json
// 422 Unprocessable Entity — bad ScanType, interval out of range, non-UUID assetId
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "scanTypes must be one of the following values: DNS, TLS, HTTP_HEADERS, HOST_DISCOVERY, PORT_SCAN, VULNERABILITY; intervalMinutes must not be less than 60",
    "request_id": "550e8400-e29b-41d4-a716-446655440100"
  }
}
```

```json
// 500 Internal Server Error — duplicate (organizationId, assetId) P2002
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440101"
  }
}
```

---

### 9.2 `GET /api/v1/scans/policies` — List scan policies

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — plain array, deletedAt null, createdAt desc; each with asset summary
[
  {
    "id": "sp-0001-2233-4455-66778899aabb",
    "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "assetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "scanTypes": ["DNS", "TLS", "HTTP_HEADERS"],
    "intervalMinutes": 1440,
    "enabled": true,
    "scanConfig": "{}",
    "lastRunAt": null,
    "nextRunAt": null,
    "createdAt": "2026-09-24T12:00:00.000Z",
    "updatedAt": "2026-09-24T12:00:00.000Z",
    "deletedAt": null,
    "asset": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "edge-api",
      "identifier": "api.example.com",
      "assetType": "SERVICE"
    }
  }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440102"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440103"
  }
}
```

---

### 9.3 `PATCH /api/v1/scans/policies/:id` — Update scan policy

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Status:** `200`

#### Path / Query Parameters

| Location | Name | Type          | Required             |
| -------- | ---- | ------------- | -------------------- |
| path     | `id` | string (uuid) | yes — scan policy id |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "scanTypes": ["DNS", "TLS", "HTTP_HEADERS", "PORT_SCAN"],
  "intervalMinutes": 720,
  "enabled": false
}
```

`UpdateScanPolicyDto` = `PartialType(CreateScanPolicyDto)` — all fields optional. Service applies only `scanTypes`, `intervalMinutes`, `enabled` (**`assetId` in the body is ignored**).

| Field             | Type    | Required | Validation                                 |
| ----------------- | ------- | -------- | ------------------------------------------ |
| `scanTypes`       | enum[]  | no       | same enum rules as create                  |
| `intervalMinutes` | int     | no       | `@Min(60) @Max(10080)`                     |
| `enabled`         | boolean | no       |                                            |
| `assetId`         | uuid    | no       | accepted by DTO but **ignored** by service |

#### Success Response Schema (JSON)

```json
// 200 OK — updated ScanPolicy row
{
  "id": "sp-0001-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "assetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "scanTypes": ["DNS", "TLS", "HTTP_HEADERS", "PORT_SCAN"],
  "intervalMinutes": 720,
  "enabled": false,
  "scanConfig": "{}",
  "lastRunAt": null,
  "nextRunAt": null,
  "createdAt": "2026-09-24T12:00:00.000Z",
  "updatedAt": "2026-09-24T14:00:00.000Z",
  "deletedAt": null
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440104"
  }
}
```

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440105"
  }
}
```

```json
// 404 Not Found — missing, soft-deleted, or cross-tenant
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Scan policy not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440106"
  }
}
```

```json
// 422 Unprocessable Entity — interval/scanTypes validation
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "intervalMinutes must not be greater than 10080; scanTypes must be one of the following values: DNS, TLS, HTTP_HEADERS, HOST_DISCOVERY, PORT_SCAN, VULNERABILITY",
    "request_id": "550e8400-e29b-41d4-a716-446655440107"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440108"
  }
}
```

---

### 9.4 `DELETE /api/v1/scans/policies/:id` — Delete scan policy (soft)

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Status:** `204`

#### Path / Query Parameters

| Location | Name | Type          | Required             |
| -------- | ---- | ------------- | -------------------- |
| path     | `id` | string (uuid) | yes — scan policy id |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

`204 No Content — empty body (deletedAt set; not a hard delete)`

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440109"
  }
}
```

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-44665544010a"
  }
}
```

```json
// 404 Not Found — missing or already soft-deleted
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Scan policy not found",
    "request_id": "550e8400-e29b-41d4-a716-44665544010b"
  }
}
```

```json
// 422 Unprocessable Entity — non-UUID path param (if validated)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "id must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-44665544010c"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544010d"
  }
}
```

---

### 9.5 `POST /api/v1/scans/trigger` — Trigger scan (queued)

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Status:** `202 Accepted`

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

```json
{
  "assetIds": ["a1b2c3d4-e5f6-7890-abcd-ef1234567890"]
}
```

| Field      | Type   | Required | Validation                                  |
| ---------- | ------ | -------- | ------------------------------------------- |
| `assetIds` | uuid[] | **yes**  | `@IsArray @IsUUID('4', {each}) @IsNotEmpty` |

**Per-asset behavior** (sequential; first failure aborts remaining — already-enqueued jobs stay queued):

1. Asset must exist → else **404** `Asset {id} not found`
2. **Opt-in:** `asset.scanEnabled === true` → else **403** `Asset {assetId} has not opted in to scanning (scanEnabled=false)`
3. Policy auto-created if missing (default types `DNS,TLS,HTTP_HEADERS,HOST_DISCOVERY,PORT_SCAN`, 1440 min)
4. `ScanJob` row `status=QUEUED` → enqueue **`scans` queue** (`jobId=scan:{org}:{scanJobId}`, 3 attempts, exp 30s)

Worker: concurrency 10, **per-org semaphore max 3**, 30s per-check timeout; check order `HOST_DISCOVERY` first → `VULNERABILITY` last.

#### Success Response Schema (JSON)

```json
// 202 Accepted
{
  "message": "Scan triggered",
  "jobs": [
    {
      "id": "sj-0001-2233-4455-66778899aabb",
      "status": "QUEUED"
    }
  ]
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544010e"
  }
}
```

```json
// 403 Forbidden — non-admin role
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-44665544010f"
  }
}
```

```json
// 403 Forbidden — asset has not opted in to scanning
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Asset a1b2c3d4-e5f6-7890-abcd-ef1234567890 has not opted in to scanning (scanEnabled=false)",
    "request_id": "550e8400-e29b-41d4-a716-446655440110"
  }
}
```

```json
// 404 Not Found — asset missing or soft-deleted
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Asset a1b2c3d4-e5f6-7890-abcd-ef1234567890 not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440111"
  }
}
```

```json
// 422 Unprocessable Entity — non-uuid-v4 assetIds or empty array
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "assetIds must contain UUID versions; assetIds should not be empty",
    "request_id": "550e8400-e29b-41d4-a716-446655440112"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440113"
  }
}
```

---

### 9.6 `GET /api/v1/scans/jobs` — List scan jobs

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name     | Type                               | Required |
| -------- | -------- | ---------------------------------- | -------- |
| query    | `status` | string (bare cast to `ScanStatus`) | no       |

Valid `status`: `QUEUED`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELLED`.

> **Quirk:** bare `@Query('status')` is cast to the Prisma enum with **no DTO validation** → invalid value → Prisma throws → **500** (not 422).

Path: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — plain array, createdAt desc; each with asset summary
[
  {
    "id": "sj-0001-2233-4455-66778899aabb",
    "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "scanPolicyId": "sp-0001-2233-4455-66778899aabb",
    "assetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "QUEUED",
    "startedAt": null,
    "completedAt": null,
    "errorMessage": null,
    "createdAt": "2026-09-24T12:00:00.000Z",
    "asset": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "edge-api",
      "identifier": "api.example.com"
    }
  }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440114"
  }
}
```

```json
// 500 Internal Server Error — invalid bare status enum cast (Appendix C quirk)
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440115"
  }
}
```

```json
// 500 Internal Server Error — other failures
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440116"
  }
}
```

---

### 9.7 `GET /api/v1/scans/jobs/:id` — Get scan job with results

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name | Type          | Required          |
| -------- | ---- | ------------- | ----------------- |
| path     | `id` | string (uuid) | yes — scan job id |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — ScanJob + results[] + asset summary
{
  "id": "sj-0001-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "scanPolicyId": "sp-0001-2233-4455-66778899aabb",
  "assetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "COMPLETED",
  "startedAt": "2026-09-24T12:01:00.000Z",
  "completedAt": "2026-09-24T12:03:00.000Z",
  "errorMessage": null,
  "createdAt": "2026-09-24T12:00:00.000Z",
  "asset": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "edge-api",
    "identifier": "api.example.com"
  },
  "results": [
    {
      "id": "sr-0001-2233-4455-66778899aabb",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "scanJobId": "sj-0001-2233-4455-66778899aabb",
      "scanType": "TLS",
      "checkStatus": "PASS",
      "rawOutput": { "daysToExpiry": 42 },
      "summary": "Certificate valid for 42 more days",
      "riskLevel": "LOW",
      "createdAt": "2026-09-24T12:03:00.000Z"
    }
  ]
}
```

`checkStatus` ∈ `PASS`, `FAIL`, `WARNING`, `ERROR`, `TIMEOUT`.

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440117"
  }
}
```

```json
// 404 Not Found — job missing or cross-tenant
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Scan job not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440118"
  }
}
```

```json
// 422 Unprocessable Entity — non-UUID path param (if validated)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "id must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-446655440119"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544011a"
  }
}
```

---

### 9.8 `GET /api/v1/scans/results/:jobId` — Get results for a job

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name    | Type          | Required          |
| -------- | ------- | ------------- | ----------------- |
| path     | `jobId` | string (uuid) | yes — scan job id |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — plain ScanResult[] createdAt desc; unknown jobId → [] (no 404)
[
  {
    "id": "sr-0001-2233-4455-66778899aabb",
    "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "scanJobId": "sj-0001-2233-4455-66778899aabb",
    "scanType": "TLS",
    "checkStatus": "PASS",
    "rawOutput": { "daysToExpiry": 42 },
    "summary": "Certificate valid for 42 more days",
    "riskLevel": "LOW",
    "createdAt": "2026-09-24T12:03:00.000Z"
  }
]
```

> **No job existence check** — unknown or cross-tenant `jobId` returns **`[]`**, not 404.

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544011b"
  }
}
```

```json
// 422 Unprocessable Entity — non-UUID path param (if validated)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "jobId must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-44665544011c"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544011d"
  }
}
```

---

## Step 10 — Dashboard Scores & Analytics

Read-only aggregates. All Bearer JWT, GET default-allow, **401-only error surface** (except where noted). Analytics prefers snapshot tables (nightly `analytics-snapshot` at 02:00 UTC); live tables only for current-state distributions.

**Score formulas** (`src/dashboard/scoring.service.ts` — pure DB, no AI; components normalized 0–1, score rounded 0–100):

| Score               | Formula                                                                                                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Security Decision   | `0.35×slaComplianceRate + 0.25×criticalRemediationRate + 0.20×(1−normalizedBacklogRatio) + 0.20×controlEffectivenessRate`                                                    |
| Business Risk       | `0.30×technicalRiskScore + 0.20×assetCriticalityWeight + 0.15×dataSensitivityWeight + 0.15×internetExposureWeight + 0.10×customerImpactWeight + 0.10×regulatoryImpactWeight` |
| Organization Health | `0.30×securityPosture + 0.20×assetCoverage + 0.20×decisionSlaPerformance + 0.15×telemetryHealth + 0.15×integrationCoverage`                                                  |

Empty-tenant defaults: SLA rate `1.0`, critical remediation `1.0`, backlog `0`, internet exposure `0.5`, customer impact `0.25`, regulatory `0`.

**Analytics query quirk:** the 8 analytics routes use bare `@Query` strings with **no DTO** — invalid `days`/`period`/`groupBy` silently fall back to defaults (**never 422** from these params); unknown query keys are ignored.

---

### 10.1 `GET /api/v1/dashboard/summary` — Consolidated dashboard payload

**Auth:** Bearer JWT · **RBAC:** GET default-allow · **Cache:** Redis `dashboard:summary:{orgId}`, **TTL 60s** (fail-open to live compute)

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "counts": {
    "events": 120,
    "findings": 56,
    "risks": 40,
    "decisions": 42,
    "assets": 12
  },
  "scores": {
    "securityDecision": {
      "score": 74,
      "breakdown": {
        "slaComplianceRate": 0.9,
        "criticalRemediationRate": 0.8,
        "normalizedBacklogRatio": 0.3,
        "controlEffectivenessRate": 0.75
      }
    },
    "businessRisk": {
      "score": 61,
      "breakdown": {
        "technicalRiskScore": 0.62,
        "assetCriticalityWeight": 0.55,
        "dataSensitivityWeight": 0.4,
        "internetExposureWeight": 0.5,
        "customerImpactWeight": 0.3,
        "regulatoryImpactWeight": 0.2
      }
    },
    "organizationHealth": {
      "score": 69,
      "breakdown": {
        "securityPosture": 0.7,
        "assetCoverage": 0.8,
        "decisionSlaPerformance": 0.65,
        "telemetryHealth": 0.6,
        "integrationCoverage": 0.55
      }
    }
  },
  "timestamp": "2026-09-24T10:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544011e"
  }
}
```

```json
// 500 Internal Server Error — unhandled scoring/DB failure
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544011f"
  }
}
```

---

### 10.1b `GET /api/v1/dashboard/overview` — Single dashboard overview (org + stats + 8 KPI cards)

Single aggregate payload powering the whole dashboard page (WelcomeBar + StatsRow + all KPI cards) — replaces the frontend's ~12 parallel dashboard requests. **Additive:** `GET /dashboard/summary` (10.1) is unchanged.

**Auth:** Bearer JWT · **RBAC:** GET default-allow · **Cache:** Redis `dashboard:overview:{orgId}:{days}`, **TTL 60s** (fail-open to live compute)

#### Path / Query Parameters

| Param  | Type | Required | Default | Notes                                                                                              |
| ------ | ---- | -------- | ------- | -------------------------------------------------------------------------------------------------- |
| `days` | int  | No       | `14`    | Sparkline window, valid 1–90. Invalid (non-numeric, `< 1`, `> 90`) → **14**, silently — never 422. |

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK
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
    {
      "id": "security-decision",
      "value": 74,
      "percentageChange": 5,
      "trend": "up",
      "sparkline": [70, 71, 74]
    },
    {
      "id": "business-risk",
      "value": 61,
      "percentageChange": -3,
      "trend": "down",
      "sparkline": [65, 64, 61]
    },
    {
      "id": "organization-health",
      "value": 82,
      "percentageChange": 2,
      "trend": "up",
      "sparkline": [80, 81, 82]
    },
    {
      "id": "findings",
      "value": 56,
      "percentageChange": 8,
      "trend": "up",
      "sparkline": [40, 48, 56]
    },
    {
      "id": "events",
      "value": 120,
      "percentageChange": 12,
      "trend": "up",
      "sparkline": [90, 107, 120]
    },
    {
      "id": "decisions",
      "value": 42,
      "percentageChange": 0,
      "trend": "stable",
      "sparkline": [40, 42, 42]
    },
    {
      "id": "assets",
      "value": 12,
      "percentageChange": 20,
      "trend": "up",
      "sparkline": [9, 10, 12]
    },
    {
      "id": "active-api-keys",
      "value": 5,
      "percentageChange": 0,
      "trend": "stable",
      "sparkline": [5, 5, 5]
    }
  ]
}
```

#### Hard Guarantees

- Always exactly 8 cards, in the order above — even for empty orgs.
- `sparkline` is dense and ascending (one point per day, oldest first, capped at `days`), and `sparkline.at(-1) === value` for every card.
- Count cards (`findings`, `events`, `decisions`, `assets`, `active-api-keys`) zero-fill empty days; score cards (`security-decision`, `business-risk`, `organization-health`) carry the previous value forward (seeded by the last snapshot before the window); zero history → `[value]` (single point).
- `percentageChange` = last point vs previous point, integer, never `null` (`prev=0 && last>0` → `100`; `prev=0 && last=0` → `0`; `< 2` points → `0`). `trend` always matches its sign (`>0` up, `<0` down, else `stable`).
- Consistency: `stats.securityScore` / `stats.totalAssets` / `stats.activeApiKeys` equal the corresponding card values, and `organization.assets` / `organization.apiKeys` are computed from the same snapshot — all numbers agree by construction.
- Series sources: score cards read nightly snapshots (`organization_score_history`, `daily_risk_snapshots`); count cards are live `GROUP BY DATE(...)` counts; current score values reuse the exact `ScoringService` computation used by `GET /dashboard/summary` — the three can never drift.

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440120"
  }
}
```

```json
// 500 Internal Server Error — unhandled scoring/DB failure
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440121"
  }
}
```

---

### 10.2 `GET /api/v1/analytics/risk-trend` — Risk trend (snapshot)

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name   | Type                          | Required                          |
| -------- | ------ | ----------------------------- | --------------------------------- |
| query    | `days` | int (bare string; `parseInt`) | no — default `30`; invalid → `30` |

Path: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — DailyRiskSnapshot[], snapshotDate asc
[
  {
    "id": "drs-0001",
    "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "snapshotDate": "2026-09-23T00:00:00.000Z",
    "totalRisks": 50,
    "criticalCount": 3,
    "highCount": 9,
    "mediumCount": 18,
    "lowCount": 20,
    "avgRiskScore": 62.4,
    "maxRiskScore": 97,
    "minRiskScore": 12,
    "createdAt": "2026-09-24T02:00:00.000Z"
  }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440120"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440121"
  }
}
```

---

### 10.3 `GET /api/v1/analytics/decision-trend` — Decision trend by status

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name   | Type       | Required                          |
| -------- | ------ | ---------- | --------------------------------- |
| query    | `days` | int (bare) | no — default `30`; invalid → `30` |

Path: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — live decisions grouped by DATE(createdAt)+status, date asc
[
  { "date": "2026-09-22T00:00:00.000Z", "status": "UNDER_REVIEW", "count": 5 },
  { "date": "2026-09-23T00:00:00.000Z", "status": "APPROVED", "count": 3 }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440122"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440123"
  }
}
```

---

### 10.4 `GET /api/v1/analytics/api-usage` — API usage counts

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name     | Type                       | Required                                                                         |
| -------- | -------- | -------------------------- | -------------------------------------------------------------------------------- |
| query    | `period` | `day` \| `week` \| `month` | no — default `day`; invalid → falls through to `day` behavior via switch default |

Path: none.

> **Docstring quirk:** method comment says "Redis usage counters" but implementation queries live `events` by `receivedAt`.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — [{ date, count }] from events.receivedAt, date asc
[
  { "date": "2026-09-23T00:00:00.000Z", "count": 42 },
  { "date": "2026-09-24T00:00:00.000Z", "count": 17 }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440124"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440125"
  }
}
```

---

### 10.5 `GET /api/v1/analytics/security-score-timeline` — Security score history

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name   | Type       | Required          |
| -------- | ------ | ---------- | ----------------- |
| query    | `days` | int (bare) | no — default `30` |

Path: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — OrganizationScoreHistory select, snapshotDate asc
[
  {
    "snapshotDate": "2026-09-23T00:00:00.000Z",
    "securityDecisionScore": 74,
    "securityDecisionBreakdown": {
      "slaComplianceRate": 0.9,
      "criticalRemediationRate": 0.8,
      "normalizedBacklogRatio": 0.3,
      "controlEffectivenessRate": 0.75
    }
  }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440126"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440127"
  }
}
```

---

### 10.6 `GET /api/v1/analytics/risk-distribution` — Current risks by tier

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — live risks groupBy tier
[
  { "tier": "CRITICAL", "count": 3, "avgScore": 91.2 },
  { "tier": "HIGH", "count": 9, "avgScore": 74.5 },
  { "tier": "MEDIUM", "count": 18, "avgScore": 52.1 },
  { "tier": "LOW", "count": 10, "avgScore": 28.0 }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440128"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440129"
  }
}
```

---

### 10.7 `GET /api/v1/analytics/assets-by-category` — Assets by category

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name      | Type                                          | Required                                                                       |
| -------- | --------- | --------------------------------------------- | ------------------------------------------------------------------------------ |
| query    | `groupBy` | `assetType` \| `criticality` \| `environment` | no — default `assetType`; invalid value not validated (Prisma groupBy may 500) |

Path: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — [{ category, count }]
[
  { "category": "SERVICE", "count": 6 },
  { "category": "HOST", "count": 4 },
  { "category": "CLOUD", "count": 2 }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544012a"
  }
}
```

```json
// 500 Internal Server Error — invalid groupBy column cast
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544012b"
  }
}
```

---

### 10.8 `GET /api/v1/analytics/threat-distribution` — Threats by category

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — live threats groupBy threatCategory (V1-detectable categories only)
[
  { "category": "CREDENTIAL_ABUSE", "count": 12, "avgConfidence": 0.84 },
  { "category": "NETWORK_ANOMALY", "count": 7, "avgConfidence": 0.71 }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544012c"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544012d"
  }
}
```

---

### 10.9 `GET /api/v1/analytics/daily-decision-count` — Decisions per day

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name   | Type       | Required          |
| -------- | ------ | ---------- | ----------------- |
| query    | `days` | int (bare) | no — default `30` |

Path: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — [{ date, count }], date asc
[
  { "date": "2026-09-22T00:00:00.000Z", "count": 8 },
  { "date": "2026-09-23T00:00:00.000Z", "count": 11 }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544012e"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544012f"
  }
}
```

---

## Step 11 — Reports & Compliance

Reports are **synchronous** assemblies from persisted tables (not queued), with immutable version history + status state machine. Compliance is Phase 18.3 schema-only stubs.

**Status machine** (`VALID_TRANSITIONS` in `src/reports/reports.service.ts`):

```text
GENERATED → IN_REVIEW → APPROVED → LOCKED → PUBLISHED (terminal)
IN_REVIEW → GENERATED   (correction — creates new version; requires correctionNote)
```

**ReportType:** `SECURITY_POSTURE`, `RISK_ASSESSMENT`, `DECISION_SUMMARY`, `THREAT_INTELLIGENCE`, `EXECUTIVE_SUMMARY`, `COMPLIANCE`
**ReportStatus:** `GENERATED`, `IN_REVIEW`, `APPROVED`, `LOCKED`, `PUBLISHED`

---

### 11.1 `POST /api/v1/reports/generate` — Generate report (sync)

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Audit:** `REPORT_GENERATED` · **Status:** `201`

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

```json
{
  "reportType": "SECURITY_POSTURE",
  "title": "Q3 Security Posture",
  "description": "Quarterly posture roll-up for leadership.",
  "dateFrom": "2026-07-01T00:00:00.000Z",
  "dateTo": "2026-09-30T23:59:59.000Z"
}
```

| Field         | Type     | Required | Validation                                                                                                                      |
| ------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `reportType`  | enum     | **yes**  | `@IsEnum` — `SECURITY_POSTURE`, `RISK_ASSESSMENT`, `DECISION_SUMMARY`, `THREAT_INTELLIGENCE`, `EXECUTIVE_SUMMARY`, `COMPLIANCE` |
| `title`       | string   | **yes**  | `@IsString @IsNotEmpty`                                                                                                         |
| `description` | string   | no       | `@IsOptional @IsString`                                                                                                         |
| `dateFrom`    | ISO 8601 | no       | `@IsDateString`                                                                                                                 |
| `dateTo`      | ISO 8601 | no       | `@IsDateString`                                                                                                                 |

Content is assembled **before** the response (no async queue); initial `ReportVersion` v1 written in the same RLS transaction with content hash.

#### Success Response Schema (JSON)

```json
// 201 Created — Report row only (version created but not returned here)
{
  "id": "rpt-0001-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "title": "Q3 Security Posture",
  "description": "Quarterly posture roll-up for leadership.",
  "reportType": "SECURITY_POSTURE",
  "status": "GENERATED",
  "currentVersion": 1,
  "dateFrom": "2026-07-01T00:00:00.000Z",
  "dateTo": "2026-09-30T23:59:59.000Z",
  "summaryMetrics": { "decisionCount": 42 },
  "generatedByUserId": "qip-user-abc123",
  "publishedAt": null,
  "createdAt": "2026-09-24T12:00:00.000Z",
  "updatedAt": "2026-09-24T12:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440130"
  }
}
```

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440131"
  }
}
```

```json
// 422 Unprocessable Entity — missing title, bad reportType/date
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "reportType must be one of the following values: SECURITY_POSTURE, RISK_ASSESSMENT, DECISION_SUMMARY, THREAT_INTELLIGENCE, EXECUTIVE_SUMMARY, COMPLIANCE; title should not be empty; dateFrom must be a valid ISO 8601 date string",
    "request_id": "550e8400-e29b-41d4-a716-446655440132"
  }
}
```

```json
// 500 Internal Server Error — assembly or transaction failure
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440133"
  }
}
```

---

### 11.2 `GET /api/v1/reports` — List reports

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name         | Type                             | Required          |
| -------- | ------------ | -------------------------------- | ----------------- |
| query    | `status`     | ReportStatus enum                | no                |
| query    | `reportType` | ReportType enum                  | no                |
| query    | `dateFrom`   | string (filters `createdAt gte`) | no                |
| query    | `dateTo`     | string (filters `createdAt lte`) | no                |
| query    | `page`       | int ≥ 1                          | no — default `1`  |
| query    | `limit`      | int 1–100                        | no — default `20` |

Path: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — envelope key is "reports" (not "items"), createdAt desc
{
  "reports": [
    {
      "id": "rpt-0001-2233-4455-66778899aabb",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "title": "Q3 Security Posture",
      "description": "Quarterly posture roll-up for leadership.",
      "reportType": "SECURITY_POSTURE",
      "status": "GENERATED",
      "currentVersion": 1,
      "dateFrom": "2026-07-01T00:00:00.000Z",
      "dateTo": "2026-09-30T23:59:59.000Z",
      "summaryMetrics": { "decisionCount": 42 },
      "generatedByUserId": "qip-user-abc123",
      "publishedAt": null,
      "createdAt": "2026-09-24T12:00:00.000Z",
      "updatedAt": "2026-09-24T12:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440134"
  }
}
```

```json
// 422 Unprocessable Entity — bad status/reportType enum or limit range
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "status must be one of the following values: GENERATED, IN_REVIEW, APPROVED, LOCKED, PUBLISHED; limit must not be greater than 100",
    "request_id": "550e8400-e29b-41d4-a716-446655440135"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440136"
  }
}
```

---

### 11.3 `GET /api/v1/reports/:id` — Get report with current version

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name | Type          | Required        |
| -------- | ---- | ------------- | --------------- |
| path     | `id` | string (uuid) | yes — report id |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — Report + versions[] (latest only, versionNumber desc)
{
  "id": "rpt-0001-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "title": "Q3 Security Posture",
  "description": "Quarterly posture roll-up for leadership.",
  "reportType": "SECURITY_POSTURE",
  "status": "GENERATED",
  "currentVersion": 1,
  "dateFrom": "2026-07-01T00:00:00.000Z",
  "dateTo": "2026-09-30T23:59:59.000Z",
  "summaryMetrics": { "decisionCount": 42 },
  "generatedByUserId": "qip-user-abc123",
  "publishedAt": null,
  "createdAt": "2026-09-24T12:00:00.000Z",
  "updatedAt": "2026-09-24T12:00:00.000Z",
  "versions": [
    {
      "id": "rv-0001-2233-4455-66778899aabb",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "reportId": "rpt-0001-2233-4455-66778899aabb",
      "versionNumber": 1,
      "content": { "sections": [], "generatedAt": "2026-09-24T12:00:00.000Z" },
      "contentHash": "0f1e2d3c4b5a69788796a5b4c3d2e1f00112233445566778899aabbccddeeff",
      "createdByUserId": "qip-user-abc123",
      "correctionNote": null,
      "createdAt": "2026-09-24T12:00:00.000Z"
    }
  ]
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440137"
  }
}
```

```json
// 404 Not Found — missing or cross-tenant
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Report not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440138"
  }
}
```

```json
// 422 Unprocessable Entity — non-UUID path param (if validated)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "id must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-446655440139"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544013a"
  }
}
```

---

### 11.4 `GET /api/v1/reports/:id/versions` — List versions

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name | Type          | Required        |
| -------- | ---- | ------------- | --------------- |
| path     | `id` | string (uuid) | yes — report id |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — versionNumber desc; content omitted from list
[
  {
    "id": "rv-0002-2233-4455-66778899aabb",
    "versionNumber": 2,
    "contentHash": "6b8e4d2c9a1f7e3052d8b4c6a9e1f7d3b5c8a2e6f0d4b7a1c3e9f5d2b8a6c4e7",
    "createdByUserId": "qip-user-abc123",
    "correctionNote": "Fixed severity table for CN-042",
    "createdAt": "2026-09-24T14:00:00.000Z"
  },
  {
    "id": "rv-0001-2233-4455-66778899aabb",
    "versionNumber": 1,
    "contentHash": "0f1e2d3c4b5a69788796a5b4c3d2e1f00112233445566778899aabbccddeeff",
    "createdByUserId": "qip-user-abc123",
    "correctionNote": null,
    "createdAt": "2026-09-24T12:00:00.000Z"
  }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544013b"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Report not found",
    "request_id": "550e8400-e29b-41d4-a716-44665544013c"
  }
}
```

```json
// 422 Unprocessable Entity — non-UUID path param (if validated)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "id must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-44665544013d"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544013e"
  }
}
```

---

### 11.5 `GET /api/v1/reports/:id/versions/:versionId` — Get version content

**Auth:** Bearer JWT · **RBAC:** GET default-allow

#### Path / Query Parameters

| Location | Name        | Type          | Required                |
| -------- | ----------- | ------------- | ----------------------- |
| path     | `id`        | string (uuid) | yes — report id         |
| path     | `versionId` | string (uuid) | yes — report version id |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — full ReportVersion including content + contentHash
{
  "id": "rv-0001-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "reportId": "rpt-0001-2233-4455-66778899aabb",
  "versionNumber": 1,
  "content": {
    "sections": [
      { "heading": "Executive Summary", "body": "…" },
      { "heading": "Risk Overview", "body": "…" }
    ],
    "generatedAt": "2026-09-24T12:00:00.000Z"
  },
  "contentHash": "0f1e2d3c4b5a69788796a5b4c3d2e1f00112233445566778899aabbccddeeff",
  "createdByUserId": "qip-user-abc123",
  "correctionNote": null,
  "createdAt": "2026-09-24T12:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544013f"
  }
}
```

```json
// 404 Not Found — version missing or wrong parent report
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Report version not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440140"
  }
}
```

```json
// 422 Unprocessable Entity — non-UUID path params (if validated)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "versionId must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-446655440141"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440142"
  }
}
```

---

### 11.6 `PATCH /api/v1/reports/:id/status` — Transition status

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Audit:** `REPORT_STATUS_CHANGED` · **Status:** `200`

#### Path / Query Parameters

| Location | Name | Type          | Required        |
| -------- | ---- | ------------- | --------------- |
| path     | `id` | string (uuid) | yes — report id |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "status": "IN_REVIEW"
}
```

| Field            | Type              | Required    | Validation                                                  |
| ---------------- | ----------------- | ----------- | ----------------------------------------------------------- |
| `status`         | ReportStatus enum | **yes**     | `@IsEnum @IsString`                                         |
| `correctionNote` | string            | conditional | required when target status = `GENERATED` (correction path) |

**State machine:** `GENERATED→IN_REVIEW→APPROVED→LOCKED→PUBLISHED`; `IN_REVIEW→GENERATED` is a correction (creates `currentVersion+1`, copies content, stores `correctionNote`). `PUBLISHED` sets `publishedAt`.

#### Success Response Schema (JSON)

```json
// 200 OK — standard transition: full updated Report row
{
  "id": "rpt-0001-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "title": "Q3 Security Posture",
  "description": "Quarterly posture roll-up for leadership.",
  "reportType": "SECURITY_POSTURE",
  "status": "IN_REVIEW",
  "currentVersion": 1,
  "dateFrom": "2026-07-01T00:00:00.000Z",
  "dateTo": "2026-09-30T23:59:59.000Z",
  "summaryMetrics": { "decisionCount": 42 },
  "generatedByUserId": "qip-user-abc123",
  "publishedAt": null,
  "createdAt": "2026-09-24T12:00:00.000Z",
  "updatedAt": "2026-09-24T13:00:00.000Z"
}
```

```json
// 200 OK — correction response shape (only when target = GENERATED)
{
  "reportId": "rpt-0001-2233-4455-66778899aabb",
  "status": "GENERATED",
  "version": 2
}
```

#### Error Response Schema (JSON)

```json
// 400 Bad Request — illegal transition
{
  "error": {
    "code": "Bad Request",
    "message": "Cannot transition from \"GENERATED\" to \"PUBLISHED\". Allowed: IN_REVIEW",
    "request_id": "550e8400-e29b-41d4-a716-446655440143"
  }
}
```

```json
// 400 Bad Request — correction without note
{
  "error": {
    "code": "Bad Request",
    "message": "correctionNote is required when correcting a report (transitioning back to GENERATED)",
    "request_id": "550e8400-e29b-41d4-a716-446655440144"
  }
}
```

```json
// 400 Bad Request — no versions to correct from
{
  "error": {
    "code": "Bad Request",
    "message": "Report has no versions — cannot correct",
    "request_id": "550e8400-e29b-41d4-a716-446655440145"
  }
}
```

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440146"
  }
}
```

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440147"
  }
}
```

```json
// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Report not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440148"
  }
}
```

```json
// 422 Unprocessable Entity — invalid status enum / correctionNote type
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "status must be one of the following values: GENERATED, IN_REVIEW, APPROVED, LOCKED, PUBLISHED",
    "request_id": "550e8400-e29b-41d4-a716-446655440149"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544014a"
  }
}
```

---

### 11.7 `GET /api/v1/compliance/frameworks` — List active frameworks

**Auth:** Bearer JWT · **RBAC:** GET default-allow · **Note:** Phase 18.3 schema-only stub

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — isActive true only, framework asc
[
  {
    "id": "cf-0001-2233-4455-66778899aabb",
    "framework": "ISO_27001",
    "version": "ISO 27001:2022",
    "controlCount": 93,
    "createdAt": "2026-09-01T00:00:00.000Z"
  },
  {
    "id": "cf-0002-2233-4455-66778899aabb",
    "framework": "SOC_2",
    "version": "2017 (as amended 2022)",
    "controlCount": 64,
    "createdAt": "2026-09-01T00:00:00.000Z"
  }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544014b"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544014c"
  }
}
```

---

### 11.8 `GET /api/v1/compliance/frameworks/:id` — Framework with controls

**Auth:** Bearer JWT · **RBAC:** GET default-allow · **Note:** Phase 18.3 schema-only stub

#### Path / Query Parameters

| Location | Name | Type          | Required                      |
| -------- | ---- | ------------- | ----------------------------- |
| path     | `id` | string (uuid) | yes — compliance framework id |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — framework row + controls[] (controlId asc)
{
  "id": "cf-0001-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "framework": "ISO_27001",
  "version": "ISO 27001:2022",
  "isActive": true,
  "createdAt": "2026-09-01T00:00:00.000Z",
  "updatedAt": "2026-09-01T00:00:00.000Z",
  "controls": [
    {
      "id": "cc-0001-2233-4455-66778899aabb",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "frameworkId": "cf-0001-2233-4455-66778899aabb",
      "controlId": "A.5.1.1",
      "controlName": "Policies for information security",
      "description": "Information security policy and topic-specific policies shall be defined…",
      "status": "MAPPED",
      "findingIds": ["fnd-0001"],
      "evidenceIds": ["ev-0001"],
      "remediationIds": ["act-0001"],
      "lastAssessedAt": "2026-09-20T00:00:00.000Z",
      "createdAt": "2026-09-01T00:00:00.000Z",
      "updatedAt": "2026-09-20T00:00:00.000Z"
    }
  ]
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544014d"
  }
}
```

```json
// 404 Not Found — missing or cross-tenant
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Compliance framework cf-0001-2233-4455-66778899aabb not found or access denied",
    "request_id": "550e8400-e29b-41d4-a716-44665544014e"
  }
}
```

```json
// 422 Unprocessable Entity — non-UUID path param (if validated)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "id must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-44665544014f"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440150"
  }
}
```

---

### 11.9 `GET /api/v1/compliance/controls/:id` — Control detail

**Auth:** Bearer JWT · **RBAC:** GET default-allow · **Note:** Phase 18.3 schema-only stub

#### Path / Query Parameters

| Location | Name | Type          | Required                    |
| -------- | ---- | ------------- | --------------------------- |
| path     | `id` | string (uuid) | yes — compliance control id |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — control row + framework relation
{
  "id": "cc-0001-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "frameworkId": "cf-0001-2233-4455-66778899aabb",
  "controlId": "A.5.1.1",
  "controlName": "Policies for information security",
  "description": "Information security policy and topic-specific policies shall be defined…",
  "status": "MAPPED",
  "findingIds": ["fnd-0001"],
  "evidenceIds": ["ev-0001"],
  "remediationIds": ["act-0001"],
  "lastAssessedAt": "2026-09-20T00:00:00.000Z",
  "createdAt": "2026-09-01T00:00:00.000Z",
  "updatedAt": "2026-09-20T00:00:00.000Z",
  "framework": {
    "id": "cf-0001-2233-4455-66778899aabb",
    "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "framework": "ISO_27001",
    "version": "ISO 27001:2022",
    "isActive": true,
    "createdAt": "2026-09-01T00:00:00.000Z",
    "updatedAt": "2026-09-01T00:00:00.000Z"
  }
}
```

`status` ∈ `MAPPED`, `PARTIAL`, `GAP`, `NOT_APPLICABLE`.

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440151"
  }
}
```

```json
// 404 Not Found — missing or cross-tenant
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Compliance control cc-0001-2233-4455-66778899aabb not found or access denied",
    "request_id": "550e8400-e29b-41d4-a716-446655440152"
  }
}
```

```json
// 422 Unprocessable Entity — non-UUID path param (if validated)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "id must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-446655440153"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440154"
  }
}
```

---

## Step 12 — Realtime & Notifications

### 12.1 `GET /api/v1/events` — SSE stream (org-scoped)

**Auth:** Bearer JWT (not `X-API-KEY`) · **RBAC:** GET default-allow · **Transport:** `text/event-stream`

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

Not a JSON body — long-lived `text/event-stream`. Frames (each frame’s `data` is JSON or `ping`):

```json
// 200 OK — Content-Type: text/event-stream — example frames
// Live event frame:
{
  "id": "evt-0001-2233-4455-66778899aabb",
  "type": "finding.new",
  "data": {
    "id": "evt-0001-2233-4455-66778899aabb",
    "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "type": "finding.new",
    "payload": { "findingId": "fnd-0001", "severity": "HIGH" },
    "createdAt": "2026-09-24T12:00:00.000Z"
  }
}
```

```json
// 200 OK — heartbeat every 20s (SSE `data: ping`)
{
  "data": "ping"
}
```

`type` ∈ `finding.new`, `risk.tier_changed`, `decision.status_changed`, `decision.remediation_submitted`, `decision.verified`, `decision.reopened`, `situation.updated` (and similar pub/sub emits).

> **Replay:** the handler reads `Last-Event-ID` and replays buffered events after that sequence id (up to 500, ~5 min Redis buffer) before merging the live stream; a fresh connection gets only new live events + heartbeats. Org is derived from the JWT only (never query params).

#### Error Response Schema (JSON)

```json
// 401 Unauthorized — missing/invalid JWT (SSE requires Authorization header)
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440155"
  }
}
```

```json
// 500 Internal Server Error — pub/sub subscription failure mid-stream
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440156"
  }
}
```

---

### 12.2 `GET /api/v1/monitoring/recent` — SSE polling fallback

**Auth:** Bearer JWT · **RBAC:** GET default-allow · **Status:** `200` · Poll every **5s** when SSE is blocked

#### Path / Query Parameters

| Location | Name    | Type                 | Required                           |
| -------- | ------- | -------------------- | ---------------------------------- |
| query    | `since` | string (sequence id) | no — events after this sequence id |

Path: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — EventBufferService.getSince(orgId, since, 50)
{
  "events": [
    {
      "id": "evt-0001-2233-4455-66778899aabb",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "type": "decision.status_changed",
      "payload": {
        "decisionId": "dec-0001",
        "from": "PENDING",
        "to": "APPROVED"
      },
      "createdAt": "2026-09-24T12:00:00.000Z"
    }
  ],
  "hasMore": false,
  "timestamp": "2026-09-24T12:00:05.000Z"
}
```

`hasMore` is `true` only when exactly 50 events were returned (max page size).

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440157"
  }
}
```

```json
// 500 Internal Server Error — event buffer / Redis failure
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440158"
  }
}
```

---

### 12.3 `POST /api/v1/notifications/preferences` — Create or update preference (upsert)

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Status:** `201` (Nest POST default — no `@HttpCode`)

**NotificationType enum:** `CRITICAL_RISK_DETECTED`, `NEW_DECISION_READY`, `CRITICAL_ASSET_EXPOSURE`, `API_USAGE_WARNING`, `INTEGRATION_FAILURE`, `SCAN_COMPLETED`, `SUBSCRIPTION_WARNING`, `REMEDIATION_SUBMITTED`, `DECISION_SLA_BREACHED`, `VERIFICATION_COMPLETED`

**NotificationChannel enum:** `EMAIL`, `SLACK`, `WEBHOOK`, `IN_APP`

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

```json
{
  "notificationType": "CRITICAL_RISK_DETECTED",
  "channels": ["EMAIL", "SLACK"],
  "enabled": true,
  "emailAddresses": ["secops@example.com"],
  "slackWebhookUrl": "https://hooks.slack.com/services/T000/B000/XXXX",
  "customWebhookEndpointId": "whk-0001-2233-4455-66778899aabb"
}
```

| Field                     | Type                  | Required | Validation                   |
| ------------------------- | --------------------- | -------- | ---------------------------- |
| `notificationType`        | NotificationType      | **yes**  | `@IsEnum @IsNotEmpty`        |
| `channels`                | NotificationChannel[] | **yes**  | `@IsArray @IsEnum({each})`   |
| `enabled`                 | boolean               | no       | `@IsBoolean`, default `true` |
| `emailAddresses`          | string[]              | no       | `@IsArray @IsString({each})` |
| `slackWebhookUrl`         | string                | no       | `@IsOptional @IsString`      |
| `customWebhookEndpointId` | uuid                  | no       | `@IsUUID`                    |

Upsert key: `(organizationId, notificationType)` — one preference row per type per org.

#### Success Response Schema (JSON)

```json
// 201 Created — full NotificationPreference row
{
  "id": "npf-0001-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "notificationType": "CRITICAL_RISK_DETECTED",
  "channels": ["EMAIL", "SLACK"],
  "enabled": true,
  "emailAddresses": ["secops@example.com"],
  "slackWebhookUrl": "https://hooks.slack.com/services/T000/B000/XXXX",
  "customWebhookEndpointId": "whk-0001-2233-4455-66778899aabb",
  "createdAt": "2026-09-24T12:00:00.000Z",
  "updatedAt": "2026-09-24T12:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440159"
  }
}
```

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-44665544015a"
  }
}
```

```json
// 422 Unprocessable Entity — invalid enum / missing required
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "notificationType must be one of the following values: CRITICAL_RISK_DETECTED, NEW_DECISION_READY, CRITICAL_ASSET_EXPOSURE, API_USAGE_WARNING, INTEGRATION_FAILURE, SCAN_COMPLETED, SUBSCRIPTION_WARNING, REMEDIATION_SUBMITTED, DECISION_SLA_BREACHED, VERIFICATION_COMPLETED; channels must contain only EMAIL, SLACK, WEBHOOK, IN_APP values",
    "request_id": "550e8400-e29b-41d4-a716-44665544015b"
  }
}
```

```json
// 422 Unprocessable Entity — unknown property / bad UUID
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "property pushToken should not exist; customWebhookEndpointId must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-44665544015c"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544015d"
  }
}
```

---

### 12.4 `GET /api/v1/notifications/preferences` — List preferences

**Auth:** Bearer JWT · **RBAC:** GET default-allow · **Status:** `200`

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — NotificationPreference[] , createdAt desc (bare array, no envelope)
[
  {
    "id": "npf-0001-2233-4455-66778899aabb",
    "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "notificationType": "CRITICAL_RISK_DETECTED",
    "channels": ["EMAIL", "SLACK"],
    "enabled": true,
    "emailAddresses": ["secops@example.com"],
    "slackWebhookUrl": "https://hooks.slack.com/services/T000/B000/XXXX",
    "customWebhookEndpointId": null,
    "createdAt": "2026-09-24T12:00:00.000Z",
    "updatedAt": "2026-09-24T12:00:00.000Z"
  }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544015e"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544015f"
  }
}
```

---

### 12.5 `DELETE /api/v1/notifications/preferences/:id` — Delete preference

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Status:** `204` · Hard delete

#### Path / Query Parameters

| Location | Name | Type          | Required            |
| -------- | ---- | ------------- | ------------------- |
| path     | `id` | string (uuid) | yes — preference id |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

`204 No Content — empty body`

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440160"
  }
}
```

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440161"
  }
}
```

```json
// 404 Not Found — missing or cross-tenant
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Notification preference not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440162"
  }
}
```

```json
// 422 Unprocessable Entity — non-UUID path param (if validated)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "id must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-446655440163"
  }
}
```

---

### 12.6 `POST /api/v1/notifications/webhooks` — Register webhook

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Status:** `201` (Nest POST default)

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

```json
{
  "url": "https://hooks.example.com/quantiqen",
  "secret": "whsec_supersecret",
  "description": "Primary SOAR intake"
}
```

| Field         | Type   | Required | Validation                                                 |
| ------------- | ------ | -------- | ---------------------------------------------------------- |
| `url`         | string | **yes**  | `@IsUrl @IsNotEmpty`                                       |
| `secret`      | string | **yes**  | `@IsString @IsNotEmpty` — stored **encrypted** AES-256-GCM |
| `description` | string | no       | `@IsOptional @IsString`                                    |

#### Success Response Schema (JSON)

```json
// 201 Created — WebhookEndpoint row (secret returned encrypted on create)
{
  "id": "whk-0001-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "url": "https://hooks.example.com/quantiqen",
  "secret": "1:Zm9vYmFyYmF6cXV4MTIzNDU2Nzg5MGFiY2RlZmdoaWo=",
  "description": "Primary SOAR intake",
  "active": true,
  "createdAt": "2026-09-24T12:00:00.000Z",
  "updatedAt": "2026-09-24T12:00:00.000Z",
  "deletedAt": null
}
```

> `secret` format after encrypt: `"{version}:{base64(iv+authTag+ciphertext)}"`. **List responses strip `secret` entirely** (12.7); only create/update may echo the encrypted form.

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440164"
  }
}
```

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440165"
  }
}
```

```json
// 422 Unprocessable Entity — bad URL / missing fields
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "url must be a URL address; secret should not be empty",
    "request_id": "550e8400-e29b-41d4-a716-446655440166"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440167"
  }
}
```

---

### 12.7 `GET /api/v1/notifications/webhooks` — List webhooks (secrets masked)

**Auth:** Bearer JWT · **RBAC:** GET default-allow · **Status:** `200`

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — WebhookEndpoint[] with secret field stripped, deletedAt null, createdAt desc
[
  {
    "id": "whk-0001-2233-4455-66778899aabb",
    "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "url": "https://hooks.example.com/quantiqen",
    "description": "Primary SOAR intake",
    "active": true,
    "createdAt": "2026-09-24T12:00:00.000Z",
    "updatedAt": "2026-09-24T12:00:00.000Z",
    "deletedAt": null
  }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440168"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440169"
  }
}
```

---

### 12.8 `PATCH /api/v1/notifications/webhooks/:id` — Update webhook

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Status:** `200`

#### Path / Query Parameters

| Location | Name | Type          | Required                  |
| -------- | ---- | ------------- | ------------------------- |
| path     | `id` | string (uuid) | yes — webhook endpoint id |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "url": "https://hooks.example.com/quantiqen-v2",
  "secret": "whsec_rotated",
  "description": "Primary SOAR intake (v2)",
  "active": true
}
```

| Field         | Type    | Required | Validation                                    |
| ------------- | ------- | -------- | --------------------------------------------- |
| `url`         | string  | no       | `@IsOptional @IsUrl`                          |
| `secret`      | string  | no       | `@IsOptional @IsString` — re-encrypted on set |
| `description` | string  | no       | `@IsOptional @IsString`                       |
| `active`      | boolean | no       | `@IsOptional` only (no `@IsBoolean`)          |

Only provided fields are updated (partial patch).

#### Success Response Schema (JSON)

```json
// 200 OK — updated WebhookEndpoint row (secret re-encrypted if supplied)
{
  "id": "whk-0001-2233-4455-66778899aabb",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "url": "https://hooks.example.com/quantiqen-v2",
  "secret": "1:b3RoZXJjaXBoZXJ0ZXh0Z29lcyBoZXJlISEhISE=",
  "description": "Primary SOAR intake (v2)",
  "active": true,
  "createdAt": "2026-09-24T12:00:00.000Z",
  "updatedAt": "2026-09-24T13:00:00.000Z",
  "deletedAt": null
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544016a"
  }
}
```

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-44665544016b"
  }
}
```

```json
// 404 Not Found — missing, cross-tenant, or soft-deleted
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Webhook endpoint not found",
    "request_id": "550e8400-e29b-41d4-a716-44665544016c"
  }
}
```

```json
// 422 Unprocessable Entity — invalid url / types
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "url must be a URL address",
    "request_id": "550e8400-e29b-41d4-a716-44665544016d"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544016e"
  }
}
```

---

### 12.9 `DELETE /api/v1/notifications/webhooks/:id` — Soft-delete webhook

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Status:** `204` · Sets `deletedAt = now`

#### Path / Query Parameters

| Location | Name | Type          | Required                  |
| -------- | ---- | ------------- | ------------------------- |
| path     | `id` | string (uuid) | yes — webhook endpoint id |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

`204 No Content — empty body`

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544016f"
  }
}
```

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440170"
  }
}
```

```json
// 404 Not Found — missing, cross-tenant, or already soft-deleted
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Webhook endpoint not found",
    "request_id": "550e8400-e29b-41d4-a716-446655440171"
  }
}
```

```json
// 422 Unprocessable Entity — non-UUID path param (if validated)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "id must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-446655440172"
  }
}
```

---

### 12.10 `POST /api/v1/notifications/webhooks/:id/test` — Send test delivery

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Status:** `201` (Nest POST default — no `@HttpCode`)

#### Path / Query Parameters

| Location | Name | Type          | Required                  |
| -------- | ---- | ------------- | ------------------------- |
| path     | `id` | string (uuid) | yes — webhook endpoint id |

Query: none.

#### Request Body Schema (JSON)

`Request Body: None` — body ignored; dispatcher sends its own payload.

#### Success Response Schema (JSON)

```json
// 201 Created — fires HTTP POST { type: "test", message, timestamp } to endpoint URL
// No WebhookDelivery row is written for the test call.
{
  "message": "Test webhook sent"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440173"
  }
}
```

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440174"
  }
}
```

```json
// 404 Not Found — missing, deleted, or active=false
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Webhook endpoint not found or inactive",
    "request_id": "550e8400-e29b-41d4-a716-446655440175"
  }
}
```

```json
// 500 Internal Server Error — downstream HTTP failure (dispatcher throws plain Error)
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Webhook delivery failed with status 502",
    "request_id": "550e8400-e29b-41d4-a716-446655440176"
  }
}
```

```json
// 500 Internal Server Error — unexpected
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440177"
  }
}
```

---

### 12.11 `GET /api/v1/notifications/deliveries` — Delivery audit log

**Auth:** Bearer JWT · **RBAC:** GET default-allow · **Status:** `200`

**WebhookDeliveryStatus enum:** `PENDING`, `DELIVERED`, `FAILED`, `RETRYING`

#### Path / Query Parameters

| Location | Name     | Type                                          | Required |
| -------- | -------- | --------------------------------------------- | -------- |
| query    | `status` | string (bare cast to `WebhookDeliveryStatus`) | no       |

Path: none.

> **Quirk:** bare `@Query('status')` has **no DTO validation** → invalid value → Prisma throws → **500** (not 422), same class of bug as scan `status`.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — WebhookDelivery[] , createdAt desc; no pagination
[
  {
    "id": "whd-0001-2233-4455-66778899aabb",
    "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "webhookEndpointId": "whk-0001-2233-4455-66778899aabb",
    "notificationType": "CRITICAL_RISK_DETECTED",
    "jobId": "notify:9a8b7c6d:CRITICAL_RISK_DETECTED:1727179200000",
    "payload": { "findingId": "fnd-0001", "severity": "CRITICAL" },
    "status": "DELIVERED",
    "httpStatusCode": 200,
    "responseBody": "ok",
    "retryCount": 0,
    "lastAttemptAt": "2026-09-24T12:00:01.000Z",
    "createdAt": "2026-09-24T12:00:00.000Z"
  }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440178"
  }
}
```

```json
// 500 Internal Server Error — invalid bare status enum cast (Appendix C quirk)
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440179"
  }
}
```

```json
// 500 Internal Server Error — unexpected
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544017a"
  }
}
```

---

### 12.12 `GET /api/v1/notifications` — List notification inbox

**Auth:** Bearer JWT · **RBAC:** GET default-allow · **Status:** `200`

**NotificationStream enum (inbox streams):** `SECURITY`, `OPERATIONS`

The inbox is **org-shared**: one row per logical dispatch (written by the `notifications` queue via `recordInbox` on the job's first attempt, before the preference check), and the read state is shared across the organization. Inbox items are exactly the `notification_logs` rows with `stream NOT NULL` — legacy per-channel delivery-log rows (`stream NULL`) are never returned by any inbox endpoint.

#### Query Parameters

| Name | Type | Required | Validation / default |
| ---- | ---- | -------- | -------------------- |
| `stream` | enum `SECURITY \| OPERATIONS` | no | Omit = both streams (`{ in: [SECURITY, OPERATIONS] }`). Invalid → 422. |
| `unreadOnly` | boolean | no | Default `false`. `true` → filters `readAt = null`. Invalid → 422. |
| `page` | int | no | Default `1`. `< 1` → 422. |
| `limit` | int | no | 1–100, default `20`. Out of range → 422. |

Path parameters: none. Request body: none.

Sorting: `createdAt DESC` (no secondary tie-break). Filtering happens before pagination; `page` beyond the last page returns `200` with `items: []` (not 404/422).

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — { items, total, page, limit } (flat envelope, NOT the nested `pagination` object)
{
  "items": [
    {
      "id": "3c1f0a8e-7d2b-4c5a-9e6f-0b1d2c3e4f50",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "notificationType": "CRITICAL_RISK_DETECTED",
      "channel": "IN_APP",
      "recipientInfo": {},
      "delivered": true,
      "errorMessage": null,
      "payload": {
        "findingId": "fnd-0001",
        "riskScore": 91,
        "tier": "CRITICAL",
        "previousTier": "HIGH",
        "summary": { "business_risk": "...", "technical_risk": "..." }
      },
      "readAt": null,
      "stream": "SECURITY",
      "createdAt": "2026-10-04T12:00:00.000Z"
    },
    {
      "id": "8b2e9d7c-6a1f-4b3e-8d5c-2f0e1a3b5c70",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "notificationType": "SCAN_COMPLETED",
      "channel": "IN_APP",
      "recipientInfo": {},
      "delivered": true,
      "errorMessage": null,
      "payload": {
        "scanJobId": "scn-0001",
        "assetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "hostname": "api.acmecorp.com",
        "checks": 4,
        "highFindings": 1
      },
      "readAt": "2026-10-04T13:00:00.000Z",
      "stream": "OPERATIONS",
      "createdAt": "2026-10-04T11:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

**Empty inbox:**

```json
// 200 OK
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 20
}
```

| Field | Type | Notes |
| ----- | ---- | ----- |
| `items` | NotificationLog[] | Page slice of full inbox rows — notification content lives in `payload` (opaque producer JSON); there are no `title`/`message`/`severity` fields |
| `total` | int | Total rows matching the filters |
| `page` / `limit` | int | Echo of effective page/limit |

> **Note:** this envelope has **no `totalPages`** and **no top-level `unreadCount`** — use §12.13 for the badge count.

#### Error Response Schema (JSON)

```json
// 401 Unauthorized — missing/malformed/expired JWT
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "request_id": "550e8400-e29b-41d4-a716-44665544017b"
  }
}
```

```json
// 422 Unprocessable Entity — invalid enum / non-boolean / limit out of range / unknown query key
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "stream must be one of the following values: SECURITY, OPERATIONS; limit must not be greater than 100",
    "request_id": "550e8400-e29b-41d4-a716-44665544017c"
  }
}
```

*(500 — standard block. No 403/404 cases exist for this endpoint.)*

---

### 12.13 `GET /api/v1/notifications/unread-count` — Badge count

**Auth:** Bearer JWT · **RBAC:** GET default-allow · **Status:** `200`

Lightweight badge endpoint for the header bell — cheap enough to poll every 15–30 s. Path and query parameters: none. Request body: none.

**Unread semantics:** count of inbox rows (`stream IN (SECURITY, OPERATIONS)`) with `readAt = null` for the organization. The count is **org-shared** — any user marking an inbox item read (§12.14 / §12.15) decrements it for the whole organization.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "count": 4
}
```

| Field | Type | Notes |
| ----- | ---- | ----- |
| `count` | int >= 0 | Key is **`count`** (not `unreadCount`) |

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "request_id": "550e8400-e29b-41d4-a716-44665544017d"
  }
}
```

*(500 — standard block. No 403/404 cases.)*

---

### 12.14 `POST /api/v1/notifications/:id/read` — Mark one as read (org-shared)

**Auth:** Bearer JWT · **RBAC:** `@RequireAnalystOrAdmin()` · **Status:** `200` · Audit action: `NOTIFICATION_READ`

Idempotently marks a single inbox item read for the whole organization. The transition is one-way (`readAt: null → timestamp`) — there is **no un-read endpoint**. Read state is the only mutable content on an inbox row; notification payloads are never modified or deleted.

#### Path / Query Parameters

| Location | Name | Type | Required |
| -------- | ---- | ---- | -------- |
| path | `id` | string (uuid) | yes |

Query: none. Request body: none.

Invalid uuid → **422** (`"id must be a UUID"`, global `UuidParamPipe`) — this backend never returns 400 for path-uuid validation.

#### Request Body Schema (JSON)

`Request Body: None`

#### Behavior

| Current state | Effect | Response |
| ------------- | ------ | -------- |
| unread (`readAt: null`) | Set `readAt = now()` | `200` full updated row |
| already read (`readAt` set) | **No-op** — `readAt` untouched | `200` unchanged row |
| missing / other org / legacy delivery-log row (`stream NULL`) | — | `404` |

Never `409` for state conflicts — repeated reads are safe (multi-tab double-taps).

#### Success Response Schema (JSON)

```json
// 200 OK — full NotificationLog row
{
  "id": "3c1f0a8e-7d2b-4c5a-9e6f-0b1d2c3e4f50",
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "notificationType": "CRITICAL_RISK_DETECTED",
  "channel": "IN_APP",
  "recipientInfo": {},
  "delivered": true,
  "errorMessage": null,
  "payload": { "findingId": "fnd-0001", "riskScore": 91, "tier": "CRITICAL" },
  "readAt": "2026-10-04T14:00:00.000Z",
  "stream": "SECURITY",
  "createdAt": "2026-10-04T12:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 403 Forbidden — AUDITOR / READ_ONLY
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN or ANALYST role",
    "request_id": "550e8400-e29b-41d4-a716-44665544017e"
  }
}
```

```json
// 404 Not Found — missing, cross-tenant, or non-inbox row (message identical in all cases)
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Notification not found",
    "request_id": "550e8400-e29b-41d4-a716-44665544017f"
  }
}
```

```json
// 422 Unprocessable Entity — id is not a valid uuid
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "id must be a UUID",
    "request_id": "550e8400-e29b-41d4-a716-446655440180"
  }
}
```

*(401 / 500 — standard blocks.)*

---

### 12.15 `POST /api/v1/notifications/read-all` — Mark all as read (org-shared)

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Status:** `200` · Audit action: `NOTIFICATIONS_READ_ALL`

Idempotently marks every unread inbox item for the organization as read in one bulk update. The as-built endpoint accepts **no scope filters** (no type/severity/stream body).

#### Path / Query Parameters

None. Request body: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Behavior

Single `updateMany` where `stream IN (SECURITY, OPERATIONS) AND readAt = null` → `readAt = now()`. Rows already read are not touched. `count` is the number of rows actually transitioned; a repeat call returns `count: 0`.

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "count": 4
}
```

| Field | Type | Notes |
| ----- | ---- | ----- |
| `organizationId` | string (uuid) | Echo of the JWT org scope |
| `count` | int >= 0 | Rows transitioned `unread → read` this call |

#### Error Response Schema (JSON)

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440181"
  }
}
```

*(401 / 500 — standard blocks. No 404/422 cases.)*

---

## Step 13 — Audit Trail

### 13.1 `GET /api/v1/audit-logs` — Query audit log

**Auth:** Bearer JWT · **RBAC:** `@RequireAdminOrAuditor()` · **Status:** `200` · Insert-only, hash-chained (no UPDATE/DELETE API)

**resourceType map** (action **prefix** match in `audit.interceptor.ts`): `API_KEY`→`API_KEY`, `SCAN`→`SCAN`, `DECISION`→`DECISION`, `NOTE`→`DECISION_NOTE`, `RISK`→`RISK`, `WEBHOOK`→`WEBHOOK_ENDPOINT`, `ORG`→`ORGANIZATION`, `USER`→`USER`, `REPORT`→`REPORT`, `CORRECTION`→`CORRECTION`; anything else (incl. `TEAM_*`, `POLICY_*`, `SITUATION_*`, `ASSET_*`, `REMEDIATION_*`, `VERIFICATION_*`) → **`UNKNOWN`**.

#### Path / Query Parameters

| Location | Name           | Type     | Required | Validation / default                  |
| -------- | -------------- | -------- | -------- | ------------------------------------- |
| query    | `action`       | string   | no       | exact match, e.g. `DECISION_APPROVED` |
| query    | `resourceType` | string   | no       | exact match, e.g. `DECISION`          |
| query    | `actorUserId`  | string   | no       | **not** `userId`                      |
| query    | `from`         | ISO 8601 | no       | `@IsDateString` (`createdAt gte`)     |
| query    | `to`           | ISO 8601 | no       | `@IsDateString` (`createdAt lte`)     |
| query    | `page`         | int      | no       | `@Min(1)`, default **1**              |
| query    | `limit`        | int      | no       | `@Min(1) @Max(100)`, default **50**   |

Path: none.

> **Note:** there is **no** `/audit-logs/export` and **no** `/audit-logs/:id` (Appendix C).

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — envelope { data, total, page, limit } , createdAt desc, org-scoped
{
  "data": [
    {
      "id": "aud_c8x1y2z3a4b5",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "action": "DECISION_APPROVED",
      "actorUserId": "qip-user-abc123",
      "actorRole": "CUSTOMER_ADMIN",
      "resourceType": "DECISION",
      "resourceId": "dec-0001-2233-4455-66778899aabb",
      "beforeJson": { "status": "PENDING" },
      "afterJson": { "status": "APPROVED" },
      "ipAddress": "203.0.113.10",
      "userAgent": "Mozilla/5.0",
      "correlationId": "cor-0001",
      "requestId": "req-0001",
      "hash": "0f1e2d3c4b5a69788796a5b4c3d2e1f00112233445566778899aabbccddeeff",
      "createdAt": "2026-09-24T12:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544017b"
  }
}
```

```json
// 403 Forbidden — ANALYST / READ_ONLY
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN or AUDITOR role",
    "request_id": "550e8400-e29b-41d4-a716-44665544017c"
  }
}
```

```json
// 422 Unprocessable Entity — invalid from/to / page / limit
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "from must be an ISO 8601 date string; limit must not be greater than 100; page must not be less than 1",
    "request_id": "550e8400-e29b-41d4-a716-44665544017d"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544017e"
  }
}
```

---

## Step 14 — Health, Metrics & Platform Ops

**Platform health (doubled-path bug fixed W1.1):** `@Controller('system')` + global `/api/v1` → real paths **`/api/v1/system/...`** (was doubled before W1.1).

**DlqReason:** `PROVIDER_UNAVAILABLE`, `RATE_LIMITED`, `VALIDATION_ERROR`, `TIMEOUT`, `ORG_NOT_FOUND`, `UNKNOWN_ERROR`, `AUTH_FAILURE`, `REDIS_UNAVAILABLE`
**RecoveryPriority:** `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
**IncidentSeverity:** `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
**IncidentStatus:** `ACTIVE`, `INVESTIGATING`, `RESOLVED`, `MONITORING`
**PlatformState:** `HEALTHY`, `DEGRADED`, `UNAVAILABLE`, `RECOVERING`

---

### 14.1 `GET /api/v1/health` — Liveness probe

**Auth:** `@Public()` · **RBAC:** none · **Status:** `200` always while process alive

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — does not check dependencies
{
  "status": "ok",
  "timestamp": "2026-09-24T12:00:00.000Z"
}
```

#### Error Response Schema (JSON)

Handler emits no errors. Filter-level only:

```json
// 500 Internal Server Error (unexpected only)
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544017f"
  }
}
```

---

### 14.2 `GET /api/v1/ready` — Readiness probe

**Auth:** `@Public()` · **RBAC:** none · **Status:** `200` / `503`

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — Postgres and Redis both reachable
{
  "status": "ready",
  "checks": {
    "postgres": { "status": "ok", "latencyMs": 2 },
    "redis": { "status": "ok", "latencyMs": 1 }
  },
  "timestamp": "2026-09-24T12:00:00.000Z"
}
```

> **Quirk:** when degraded, the handler throws `ServiceUnavailableException({ status, checks, timestamp })`. The `HttpExceptionFilter` **discards** that custom body and emits only the standard envelope — clients get `503` + envelope, not the `checks` object.

#### Error Response Schema (JSON)

```json
// 503 Service Unavailable — Postgres or Redis unreachable (filter envelope only)
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Service Unavailable",
    "request_id": "550e8400-e29b-41d4-a716-446655440180"
  }
}
```

```json
// 500 Internal Server Error (unexpected only)
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440181"
  }
}
```

---

### 14.3 `GET /api/v1/status` — Customer-facing status rollup

**Auth:** `@Public()` · **RBAC:** none · **Status:** `200` (even when degraded — display endpoint)

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — 3 independent Redis connections + 7 BullMQ queues
{
  "overall": "operational",
  "components": {
    "database": "healthy",
    "redis": "healthy",
    "redisPubSub": "healthy",
    "redisBullmq": "healthy",
    "workers": "operational",
    "queues": {
      "ingestion": "ok",
      "detection": "ok",
      "risk-decision": "ok",
      "scans": "ok",
      "notifications": "ok",
      "analytics-snapshot": "ok",
      "retention-cleanup": "ok"
    },
    "queueDetails": {
      "ingestion": { "waiting": 0, "failed": 0 },
      "detection": { "waiting": 0, "failed": 0 },
      "risk-decision": { "waiting": 0, "failed": 0 },
      "scans": { "waiting": 0, "failed": 0 },
      "notifications": { "waiting": 0, "failed": 0 },
      "analytics-snapshot": { "waiting": 0, "failed": 0 },
      "retention-cleanup": { "waiting": 0, "failed": 0 }
    },
    "failedJobCount": 0,
    "scanner": "pending",
    "riskEngine": "pending",
    "realtime": "operational (1 active subscriptions)"
  },
  "timestamp": "2026-09-24T12:00:00.000Z"
}
```

`overall` ∈ `operational` | `degraded`. `scanner` / `riskEngine` hardcoded `"pending"` and do **not** affect `overall`.

```json
// 200 OK — degraded example (any live component down)
{
  "overall": "degraded",
  "components": {
    "database": "healthy",
    "redis": "down",
    "redisPubSub": "healthy",
    "redisBullmq": "healthy",
    "workers": "operational",
    "queues": {
      "ingestion": "ok",
      "detection": "ok",
      "risk-decision": "ok",
      "scans": "ok",
      "notifications": "ok",
      "analytics-snapshot": "ok",
      "retention-cleanup": "ok"
    },
    "queueDetails": {
      "ingestion": { "waiting": 0, "failed": 0 },
      "detection": { "waiting": 0, "failed": 0 },
      "risk-decision": { "waiting": 0, "failed": 0 },
      "scans": { "waiting": 0, "failed": 0 },
      "notifications": { "waiting": 0, "failed": 0 },
      "analytics-snapshot": { "waiting": 0, "failed": 0 },
      "retention-cleanup": { "waiting": 0, "failed": 0 }
    },
    "failedJobCount": 0,
    "scanner": "pending",
    "riskEngine": "pending",
    "realtime": "operational (0 active subscriptions)"
  },
  "timestamp": "2026-09-24T12:00:05.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 500 Internal Server Error — unexpected (handler itself returns 200 even when degraded)
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440182"
  }
}
```

---

### 14.4 `GET /api/v1/metrics` — Prometheus exposition

**Auth:** `@Public()` · **RBAC:** none · **Path note:** global prefix → **`/api/v1/metrics`** (not bare `/metrics`) · **Status:** `200` · **Content-Type:** `text/plain; version=0.0.4; charset=utf-8`

**Security:** must be network-restricted (internal only) — do not expose on a public-facing port.

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```text
// 200 OK — Content-Type: text/plain; version=0.0.4; charset=utf-8
# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.
# TYPE process_cpu_user_seconds_total counter
process_cpu_user_seconds_total 0.031
# HELP http_request_duration_seconds HTTP request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.005"} 12
http_request_duration_seconds_bucket{le="+Inf"} 40
http_request_duration_seconds_sum 1.842
http_request_duration_seconds_count 40
```

#### Error Response Schema (JSON)

Handler emits no errors. Filter-level only:

```json
// 500 Internal Server Error (unexpected only)
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440183"
  }
}
```

---

### 14.5 `GET /api/v1/system/health` — Platform health overview

**Auth:** `@Public()` · **RBAC:** none · **Status:** `200` · **Path:** (doubled-v1 bug fixed W1.1) (`@Controller('system')` + global prefix)

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK
{
  "platformState": "HEALTHY",
  "suspensionActive": false,
  "providers": [
    {
      "provider": "AI_ENGINE",
      "status": "HEALTHY",
      "lastCheckedAt": "2026-09-24T11:59:30.000Z",
      "consecutiveFails": 0,
      "latencyMs": 142
    },
    {
      "provider": "OSIRIS",
      "status": "DEGRADED",
      "lastCheckedAt": "2026-09-24T11:59:30.000Z",
      "consecutiveFails": 2,
      "latencyMs": 890
    },
    {
      "provider": "QIP",
      "status": "HEALTHY",
      "lastCheckedAt": "2026-09-24T11:59:30.000Z",
      "consecutiveFails": 0,
      "latencyMs": 55
    }
  ],
  "engines": [
    {
      "engine": "RISK_ENGINE",
      "status": "HEALTHY",
      "lastCheckedAt": "2026-09-24T11:59:30.000Z",
      "consecutiveFails": 0,
      "isAuthoritative": true,
      "latencyMs": 12
    },
    {
      "engine": "DETECTION_PIPELINE",
      "status": "HEALTHY",
      "lastCheckedAt": "2026-09-24T11:59:30.000Z",
      "consecutiveFails": 0,
      "isAuthoritative": true,
      "latencyMs": 3
    }
  ],
  "timestamp": "2026-09-24T12:00:00.000Z"
}
```

`platformState` overall rollup: any authoritative engine `UNAVAILABLE` → `UNAVAILABLE`; else any non-auth engine/provider `UNAVAILABLE` or any `DEGRADED` → `DEGRADED`; else `HEALTHY`.

#### Error Response Schema (JSON)

```json
// 500 Internal Server Error — state service / Prisma failure
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440184"
  }
}
```

---

### 14.6 `GET /api/v1/system/suspension` — Security-only mode metrics

**Auth:** `@Public()` · **RBAC:** none · **Status:** `200`

When `isActive=true`, the risk-decision worker skips AI scoring (findings stay `OPEN`).

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — SuspensionState singleton metrics
{
  "isActive": false,
  "triggeredBy": null,
  "activatedAt": null,
  "findingsQueued": 0,
  "findingsProcessed": 0
}
```

```json
// 200 OK — suspension active
{
  "isActive": true,
  "triggeredBy": "RISK_ENGINE",
  "activatedAt": "2026-09-24T11:30:00.000Z",
  "findingsQueued": 42,
  "findingsProcessed": 17
}
```

#### Error Response Schema (JSON)

```json
// 500 Internal Server Error — suspension singleton read/create failure
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440185"
  }
}
```

---

### 14.7 `GET /api/v1/system/dlq` — DLQ overview

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Status:** `200`

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — unrecovered queue_failures for metrics; all-time for recovered/total
{
  "total": 3,
  "byQueue": { "notifications": 2, "scans": 1 },
  "byPriority": { "CRITICAL": 1, "HIGH": 1, "MEDIUM": 1 },
  "byReason": {
    "PROVIDER_UNAVAILABLE": 1,
    "TIMEOUT": 1,
    "REDIS_UNAVAILABLE": 1
  },
  "avgAgeMs": 184000,
  "recoveredCount": 5,
  "totalCount": 8
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440186"
  }
}
```

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440187"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440188"
  }
}
```

---

### 14.8 `GET /api/v1/system/dlq/failures` — Paginated DLQ failures

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Status:** `200`

#### Path / Query Parameters

| Location | Name               | Type             | Required | Validation / default                                                                                                                                       |
| -------- | ------------------ | ---------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| query    | `queueName`        | string           | no       | exact queue name                                                                                                                                           |
| query    | `reasonCode`       | DlqReason        | no       | `PROVIDER_UNAVAILABLE` \| `RATE_LIMITED` \| `VALIDATION_ERROR` \| `TIMEOUT` \| `ORG_NOT_FOUND` \| `UNKNOWN_ERROR` \| `AUTH_FAILURE` \| `REDIS_UNAVAILABLE` |
| query    | `recoveryPriority` | RecoveryPriority | no       | `CRITICAL` \| `HIGH` \| `MEDIUM` \| `LOW`                                                                                                                  |
| query    | `recovered`        | boolean          | no       | `@Type(() => Boolean)`                                                                                                                                     |
| query    | `page`             | int              | no       | `@Min(1)`, default **1**                                                                                                                                   |
| query    | `limit`            | int              | no       | `@Min(1) @Max(100)`, default **20**                                                                                                                        |

Path: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — ordered recoveryPriorityOrder asc, sequenceNumber asc
{
  "items": [
    {
      "id": "qf-0001-2233-4455-66778899aabb",
      "queueName": "notifications",
      "jobId": "notify:9a8b7c6d:CRITICAL_RISK_DETECTED:1727179200000",
      "organizationId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "reasonCode": "PROVIDER_UNAVAILABLE",
      "errorMessage": "SMTP connection refused",
      "errorStack": "Error: SMTP connection refused\n    at ...",
      "recoveryPriority": "CRITICAL",
      "recoveryPriorityOrder": 0,
      "attemptCount": 5,
      "maxAttempts": 5,
      "jobPayload": { "findingId": "fnd-0001" },
      "backoffType": "exponential",
      "backoffDelay": 5000,
      "failureMetadata": { "host": "smtp.example.com" },
      "sequenceNumber": 1,
      "enqueuedAt": "2026-09-24T11:00:00.000Z",
      "failedAt": "2026-09-24T11:05:00.000Z",
      "recovered": false,
      "recoveredAt": null,
      "createdAt": "2026-09-24T11:05:00.000Z"
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440189"
  }
}
```

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-44665544018a"
  }
}
```

```json
// 422 Unprocessable Entity — invalid enum / page out of range
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "reasonCode must be one of the following values: PROVIDER_UNAVAILABLE, RATE_LIMITED, VALIDATION_ERROR, TIMEOUT, ORG_NOT_FOUND, UNKNOWN_ERROR, AUTH_FAILURE, REDIS_UNAVAILABLE; page must not be less than 1; limit must not be greater than 100",
    "request_id": "550e8400-e29b-41d4-a716-44665544018b"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544018c"
  }
}
```

---

### 14.9 `POST /api/v1/system/dlq/:id/replay` — Replay failed job

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Status:** `200` (`@HttpCode(OK)`)

#### Path / Query Parameters

| Location | Name | Type          | Required               |
| -------- | ---- | ------------- | ---------------------- |
| path     | `id` | string (uuid) | yes — queue failure id |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "dryRun": false
}
```

| Field    | Type    | Required | Validation                                          |
| -------- | ------- | -------- | --------------------------------------------------- |
| `dryRun` | boolean | no       | `@IsOptional @Type(() => Boolean)`, default `false` |

#### Success Response Schema (JSON)

```json
// 200 OK — re-enqueued; failure marked recovered
{
  "queued": true,
  "newJobId": "replay:notify:9a8b7c6d:CRITICAL_RISK_DETECTED:1727179200000:notifications:1727180000000"
}
```

```json
// 200 OK — dry run (no side effects)
{
  "queued": false,
  "newJobId": "replay:notify:9a8b7c6d:CRITICAL_RISK_DETECTED:1727179200000:notifications:1727180000000",
  "skipped": "Dry run — would enqueue to notifications with jobId replay:notify:9a8b7c6d:CRITICAL_RISK_DETECTED:1727179200000:notifications:1727180000000"
}
```

```json
// 200 OK — not found (NO 404 — Appendix C quirk)
{
  "queued": false,
  "skipped": "Failure not found"
}
```

```json
// 200 OK — already recovered
{
  "queued": false,
  "skipped": "Already recovered"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-44665544018d"
  }
}
```

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-44665544018e"
  }
}
```

```json
// 422 Unprocessable Entity — dryRun not boolean
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "dryRun must be a boolean",
    "request_id": "550e8400-e29b-41d4-a716-44665544018f"
  }
}
```

```json
// 500 Internal Server Error — re-enqueue / Redis failure
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440190"
  }
}
```

---

### 14.10 `GET /api/v1/system/incidents` — List or history

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Status:** `200`

**Behavior:** if **any** filter present (`severity`, `status`, `limit`, `offset`) → `getIncidentHistory` (paged, default limit 50); else → `getActiveIncidents` (`status IN ACTIVE, INVESTIGATING, MONITORING`, `detectedAt desc`).

#### Path / Query Parameters

| Location | Name       | Type             | Required | Validation / default                                      |
| -------- | ---------- | ---------------- | -------- | --------------------------------------------------------- |
| query    | `severity` | IncidentSeverity | no       | `CRITICAL` \| `HIGH` \| `MEDIUM` \| `LOW`                 |
| query    | `status`   | IncidentStatus   | no       | `ACTIVE` \| `INVESTIGATING` \| `RESOLVED` \| `MONITORING` |
| query    | `limit`    | int              | no       | `@Min(1)`, history default **50**                         |
| query    | `offset`   | int              | no       | `@Min(0)`, default **0**                                  |

Path: none.

#### Request Body Schema (JSON)

`Request Body: None`

#### Success Response Schema (JSON)

```json
// 200 OK — bare SystemIncident[] (no envelope), detectedAt desc
[
  {
    "id": "inc-0001-2233-4455-66778899aabb",
    "title": "RISK_ENGINE unavailable",
    "description": "Authoritative engine RISK_ENGINE has become unavailable: timeout",
    "severity": "CRITICAL",
    "status": "ACTIVE",
    "affectedComponents": ["RISK_ENGINE"],
    "suspensionTriggered": true,
    "detectedAt": "2026-09-24T11:30:00.000Z",
    "resolvedAt": null,
    "monitoringAt": null,
    "resolutionNotes": null,
    "createdAt": "2026-09-24T11:30:00.000Z",
    "updatedAt": "2026-09-24T11:30:00.000Z"
  }
]
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440191"
  }
}
```

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440192"
  }
}
```

```json
// 422 Unprocessable Entity — invalid severity/status enum / bad limit
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "severity must be one of the following values: CRITICAL, HIGH, MEDIUM, LOW; status must be one of the following values: ACTIVE, INVESTIGATING, RESOLVED, MONITORING; limit must not be less than 1; offset must not be less than 0",
    "request_id": "550e8400-e29b-41d4-a716-446655440193"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440194"
  }
}
```

---

### 14.11 `POST /api/v1/system/incidents` — Create incident

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Status:** `201` · System table (no `organizationId`; written via `prisma.raw`)

#### Path / Query Parameters

None.

#### Request Body Schema (JSON)

```json
{
  "title": "Scanner worker down",
  "description": "Scans queue has not drained in 15 minutes; scanner workers appear dead.",
  "severity": "HIGH",
  "affectedComponents": ["SCANNER", "scans"],
  "suspensionTriggered": false
}
```

| Field                 | Type             | Required | Validation                                |
| --------------------- | ---------------- | -------- | ----------------------------------------- |
| `title`               | string           | **yes**  | `@IsString @MaxLength(500)`               |
| `description`         | string           | **yes**  | `@IsString @MaxLength(2000)`              |
| `severity`            | IncidentSeverity | **yes**  | `@IsEnum`                                 |
| `affectedComponents`  | string[]         | **yes**  | `@IsArray @IsString({each})`              |
| `suspensionTriggered` | boolean          | no       | `@IsOptional @IsBoolean`, default `false` |

#### Success Response Schema (JSON)

```json
// 201 Created — created SystemIncident row (status defaults ACTIVE)
{
  "id": "inc-0002-2233-4455-66778899aabb",
  "title": "Scanner worker down",
  "description": "Scans queue has not drained in 15 minutes; scanner workers appear dead.",
  "severity": "HIGH",
  "status": "ACTIVE",
  "affectedComponents": ["SCANNER", "scans"],
  "suspensionTriggered": false,
  "detectedAt": "2026-09-24T12:00:00.000Z",
  "resolvedAt": null,
  "monitoringAt": null,
  "resolutionNotes": null,
  "createdAt": "2026-09-24T12:00:00.000Z",
  "updatedAt": "2026-09-24T12:00:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440195"
  }
}
```

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-446655440196"
  }
}
```

```json
// 422 Unprocessable Entity — missing fields / bad severity / over max length
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "title must be a string; description must be a string; severity must be one of the following values: CRITICAL, HIGH, MEDIUM, LOW; affectedComponents must be an array; title must not be longer than 500 characters; description must not be longer than 2000 characters",
    "request_id": "550e8400-e29b-41d4-a716-446655440197"
  }
}
```

```json
// 500 Internal Server Error
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-446655440198"
  }
}
```

---

### 14.12 `PATCH /api/v1/system/incidents/:id` — Update incident status

**Auth:** Bearer JWT · **RBAC:** `@RequireAdmin()` · **Status:** `200`

**Transitions:** `ACTIVE→[INVESTIGATING,RESOLVED]` · `INVESTIGATING→[RESOLVED,MONITORING]` · `MONITORING→[RESOLVED,INVESTIGATING]` · `RESOLVED` terminal.

#### Path / Query Parameters

| Location | Name | Type          | Required          |
| -------- | ---- | ------------- | ----------------- |
| path     | `id` | string (uuid) | yes — incident id |

Query: none.

#### Request Body Schema (JSON)

```json
{
  "status": "INVESTIGATING",
  "resolutionNotes": null
}
```

| Field             | Type           | Required | Validation                                                               |
| ----------------- | -------------- | -------- | ------------------------------------------------------------------------ |
| `status`          | IncidentStatus | **yes**  | `@IsEnum`                                                                |
| `resolutionNotes` | string         | no       | `@IsOptional @IsString @MaxLength(2000)` — used when target = `RESOLVED` |

#### Success Response Schema (JSON)

```json
// 200 OK — updated incident (monitoringAt set when target = MONITORING)
{
  "id": "inc-0001-2233-4455-66778899aabb",
  "title": "RISK_ENGINE unavailable",
  "description": "Authoritative engine RISK_ENGINE has become unavailable: timeout",
  "severity": "CRITICAL",
  "status": "MONITORING",
  "affectedComponents": ["RISK_ENGINE"],
  "suspensionTriggered": true,
  "detectedAt": "2026-09-24T11:30:00.000Z",
  "resolvedAt": null,
  "monitoringAt": "2026-09-24T12:00:00.000Z",
  "resolutionNotes": null,
  "createdAt": "2026-09-24T11:30:00.000Z",
  "updatedAt": "2026-09-24T12:00:00.000Z"
}
```

```json
// 200 OK — resolved (resolvedAt + resolutionNotes set)
{
  "id": "inc-0001-2233-4455-66778899aabb",
  "title": "RISK_ENGINE unavailable",
  "description": "Authoritative engine RISK_ENGINE has become unavailable: timeout",
  "severity": "CRITICAL",
  "status": "RESOLVED",
  "affectedComponents": ["RISK_ENGINE"],
  "suspensionTriggered": true,
  "detectedAt": "2026-09-24T11:30:00.000Z",
  "resolvedAt": "2026-09-24T12:05:00.000Z",
  "monitoringAt": null,
  "resolutionNotes": "Engine recovered after provider restart",
  "createdAt": "2026-09-24T11:30:00.000Z",
  "updatedAt": "2026-09-24T12:05:00.000Z"
}
```

#### Error Response Schema (JSON)

```json
// 401 Unauthorized
{
  "error": {
    "code": "Unauthorized",
    "message": "Unauthorized",
    "request_id": "550e8400-e29b-41d4-a716-446655440199"
  }
}
```

```json
// 403 Forbidden — non-admin
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Requires CUSTOMER_ADMIN role",
    "request_id": "550e8400-e29b-41d4-a716-44665544019a"
  }
}
```

```json
// 422 Unprocessable Entity — invalid status enum / over max length
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "status must be one of the following values: ACTIVE, INVESTIGATING, RESOLVED, MONITORING; resolutionNotes must not be longer than 2000 characters",
    "request_id": "550e8400-e29b-41d4-a716-44665544019b"
  }
}
```

```json
// 404 Not Found - missing incident (NotFoundException; upgraded from the old plain-Error 500)
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Incident not found",
    "request_id": "550e8400-e29b-41d4-a716-44665544019c"
  }
}
```

```json
// 409 Conflict - illegal transition (RESOLVED is terminal; ConflictException)
{
  "error": {
    "code": "CONFLICT",
    "message": "Invalid incident transition: RESOLVED → INVESTIGATING",
    "request_id": "550e8400-e29b-41d4-a716-44665544019d"
  }
}
```

```json
// 500 Internal Server Error — unexpected / Prisma failure
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "550e8400-e29b-41d4-a716-44665544019e"
  }
}
```

---
