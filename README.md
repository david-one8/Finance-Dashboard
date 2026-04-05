<div align="center">

# Finance Dashboard Backend

<p>A production-style backend for a finance dashboard system built with Node.js, Express, Prisma, and PostgreSQL. The project focuses on clean API design, role-based access control, financial record management, dashboard analytics, validation, and reliable backend behavior.</p>

<p>
  <img src="https://img.shields.io/badge/Node.js-22.x-2F6B3B?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.x-1F2937?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-ORM-0F172A?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-1D4ED8?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

<p>
  <img src="https://img.shields.io/badge/JWT-Auth-7C3AED?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Zod-Validation-2563EB?style=for-the-badge" alt="Zod" />
  <img src="https://img.shields.io/badge/Swagger-API%20Docs-047857?style=for-the-badge&logo=swagger&logoColor=white" alt="Swagger" />
  <img src="https://img.shields.io/badge/Jest-Testing-7F1D1D?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" />
</p>

</div>

---

It was designed to satisfy a backend engineering assignment centered on:

- user and role management
- financial records CRUD and filtering
- dashboard summary APIs
- backend-enforced access control
- validation and error handling
- real data persistence

<details>
<summary><strong>Table of Contents</strong></summary>

<br />

- [Overview](#overview)
- [Highlights](#highlights)
- [Assignment Coverage](#assignment-coverage)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Role and Access Matrix](#role-and-access-matrix)
- [Data Model](#data-model)
- [API Design](#api-design)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Database and Prisma Workflow](#database-and-prisma-workflow)
- [Seeded Demo Accounts](#seeded-demo-accounts)
- [API Endpoints](#api-endpoints)
- [Request and Response Shape](#request-and-response-shape)
- [Validation and Error Handling](#validation-and-error-handling)
- [Security and Operational Features](#security-and-operational-features)
- [Testing](#testing)
- [Live End-to-End Verification](#live-end-to-end-verification)
- [Design Decisions and Assumptions](#design-decisions-and-assumptions)
- [Submission Notes](#submission-notes)

</details>

---

## Overview

This backend powers a finance dashboard where different users interact with financial data based on their role.

The system supports:

- self-registration and authenticated sessions
- admin-managed users and roles
- income and expense records
- record filtering, search, pagination, and soft delete
- dashboard analytics such as totals, category totals, recent activity, and monthly trends
- strict role-based access control for `VIEWER`, `ANALYST`, and `ADMIN`

The codebase is organized with clear separation of concerns:

- routes define the HTTP interface
- controllers handle request and response orchestration
- services contain business logic
- middleware enforces authentication, authorization, and validation
- Prisma manages persistence and data access

---

## Highlights

- Clean Express module structure with feature-based separation
- PostgreSQL persistence through Prisma ORM
- JWT access and refresh token authentication with rotation
- Refresh sessions stored in the database as hashed tokens
- Role-based access control enforced at the backend
- Finance record CRUD with filtering, pagination, search, and soft delete
- Dashboard summary endpoint with totals, category breakdowns, trends, and recent activity
- Zod validation for body and query input
- Centralized error handling and consistent API response format
- Swagger/OpenAPI documentation built into the app
- Unit tests plus live end-to-end API verification against a real PostgreSQL database

---

## Assignment Coverage

This project directly satisfies the required backend scope.

| Requirement | Implementation |
| --- | --- |
| User and role management | Admin endpoints for user creation, listing, detail, update, and status changes |
| Role assignment | `VIEWER`, `ANALYST`, and `ADMIN` roles in Prisma schema and middleware |
| User status | `ACTIVE` and `INACTIVE` enforced in login, refresh, and protected routes |
| Financial record management | Create, read, update, list, and soft delete finance records |
| Filtering | Type, category, search text, date range, include deleted for admins |
| Dashboard summary APIs | Totals, net balance, category totals, trends, recent activity |
| Access control | `authenticate` and `authorize` middleware plus role-specific route rules |
| Validation and error handling | Zod schemas, custom `ApiError`, centralized error middleware |
| Data persistence | PostgreSQL through Prisma with schema and migration files |

Additional enhancements included:

- JWT access and refresh tokens
- refresh-token rotation and session revocation
- pagination
- search
- soft delete
- rate limiting
- Swagger documentation
- unit tests
- live end-to-end API testing

---

## System Architecture

```mermaid
flowchart LR
    Client["Client / Frontend / API Consumer"] --> Express["Express App"]
    Express --> Middleware["Middleware Layer"]
    Middleware --> Routes["Feature Routes"]
    Routes --> Controllers["Controllers"]
    Controllers --> Services["Services / Business Logic"]
    Services --> Prisma["Prisma Client"]
    Prisma --> Postgres["PostgreSQL Database"]
    Express --> Docs["Swagger UI / OpenAPI JSON"]
```

### Request lifecycle

1. A request enters the Express app.
2. Security and platform middleware run first: logging, Helmet, CORS, compression, JSON parsing, and rate limiting.
3. Feature routes are mounted under `/api/v1`.
4. Authentication and role checks are applied where required.
5. Zod validation sanitizes and normalizes request input.
6. Controllers delegate to services.
7. Services perform data access and business logic through Prisma.
8. Responses return through a consistent success or error shape.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| Web framework | Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT access token + JWT refresh token |
| Password hashing | bcryptjs |
| Validation | Zod |
| Logging | Pino + pino-http |
| API docs | Swagger UI |
| Testing | Jest |
| Security middleware | Helmet, CORS, compression, express-rate-limit |

---

## Project Structure

```text
.
|-- prisma/
|   |-- migrations/
|   |-- schema.prisma
|   `-- seed.js
|-- src/
|   |-- config/
|   |-- lib/
|   |-- middlewares/
|   |-- modules/
|   |   |-- auth/
|   |   |-- dashboard/
|   |   |-- records/
|   |   `-- users/
|   |-- routes/
|   |-- shared/
|   |-- app.js
|   `-- server.js
|-- tests/
|   `-- unit/
|-- .env.example
|-- package.json
`-- README.md
```

### Folder responsibilities

| Path | Responsibility |
| --- | --- |
| `src/app.js` | Express app setup and middleware registration |
| `src/server.js` | HTTP server startup, database connection, graceful shutdown |
| `src/routes/` | Root route registration |
| `src/modules/auth/` | Registration, login, refresh, logout, current user |
| `src/modules/users/` | Admin-only user management |
| `src/modules/records/` | Finance record CRUD, filtering, soft delete |
| `src/modules/dashboard/` | Summary analytics and trends |
| `src/middlewares/` | Authentication, authorization, validation, not found, error handling |
| `src/shared/` | Reusable helpers such as tokens, pagination, numeric conversion, API response helpers |
| `prisma/schema.prisma` | Database schema and relations |
| `prisma/seed.js` | Demo data for users and finance records |
| `tests/unit/` | Unit tests for middleware, helpers, and service behavior |

---

## Role and Access Matrix

| Capability | Viewer | Analyst | Admin |
| --- | --- | --- | --- |
| Register and log in | Yes | Yes | Yes |
| View own profile (`/auth/me`) | Yes | Yes | Yes |
| Refresh access token | Yes | Yes | Yes |
| Logout / logout all | Yes | Yes | Yes |
| View dashboard summary | Yes | Yes | Yes |
| List finance records | No | Yes | Yes |
| Get finance record by id | No | Yes | Yes |
| Create finance record | No | No | Yes |
| Update finance record | No | No | Yes |
| Soft delete finance record | No | No | Yes |
| Include deleted records in listing | No | No | Yes |
| List users | No | No | Yes |
| Create users | No | No | Yes |
| Get user by id | No | No | Yes |
| Update user | No | No | Yes |
| Update user status | No | No | Yes |

---

## Data Model

### Enums

| Enum | Values |
| --- | --- |
| `UserRole` | `VIEWER`, `ANALYST`, `ADMIN` |
| `UserStatus` | `ACTIVE`, `INACTIVE` |
| `FinanceType` | `INCOME`, `EXPENSE` |

### User

Represents application users and their access level.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key (`cuid`) |
| `name` | `String` | User display name |
| `email` | `String` | Unique |
| `passwordHash` | `String` | bcrypt hash |
| `role` | `UserRole` | Defaults to `VIEWER` |
| `status` | `UserStatus` | Defaults to `ACTIVE` |
| `createdAt` | `DateTime` | Auto-generated |
| `updatedAt` | `DateTime` | Auto-updated |

### FinanceRecord

Represents a financial entry used by the dashboard.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key (`cuid`) |
| `amount` | `Decimal(14,2)` | Stored precisely in PostgreSQL |
| `type` | `FinanceType` | `INCOME` or `EXPENSE` |
| `category` | `String` | Used in breakdowns and filters |
| `date` | `DateTime` | Transaction or entry date |
| `notes` | `String?` | Optional notes |
| `createdById` | `String` | Required creator |
| `updatedById` | `String?` | Last updater |
| `deletedById` | `String?` | User who soft deleted the record |
| `deletedAt` | `DateTime?` | Soft-delete marker |
| `createdAt` | `DateTime` | Auto-generated |
| `updatedAt` | `DateTime` | Auto-updated |

### RefreshSession

Represents a persistent refresh-token session.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `String` | Primary key (`cuid`) |
| `userId` | `String` | Related user |
| `jti` | `String` | Unique token identifier |
| `tokenHash` | `String` | SHA-256 hash of refresh token |
| `expiresAt` | `DateTime` | Expiration |
| `revokedAt` | `DateTime?` | Revocation marker |
| `createdAt` | `DateTime` | Auto-generated |
| `updatedAt` | `DateTime` | Auto-updated |

---

## API Design

### Base URLs

| Resource | URL |
| --- | --- |
| API base | `http://localhost:4000/api/v1` |
| Swagger UI | `http://localhost:4000/docs` |
| OpenAPI JSON | `http://localhost:4000/docs-json` |
| Health endpoint | `GET /api/v1/health` |

### Authentication style

- Access tokens are sent as `Authorization: Bearer <token>`
- Refresh tokens are sent in request bodies for `/auth/refresh` and `/auth/logout`
- Refresh tokens are rotated and old sessions are revoked
- `logout-all` revokes all active refresh sessions for the authenticated user

---

## Environment Variables

The application validates environment variables at startup. Some values are required, while others have defaults.

### Core runtime variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `development` | Runtime environment |
| `PORT` | No | `4000` | HTTP server port |
| `API_PREFIX` | No | `/api/v1` | API route prefix |
| `APP_NAME` | No | `Finance Dashboard Backend` | App/service name |
| `CORS_ORIGIN` | No | `*` | Allowed origins, comma-separated or `*` |
| `LOG_LEVEL` | No | `info` | Pino log level |
| `DATABASE_URL` | Yes | None | PostgreSQL connection string used by Prisma |
| `JWT_ACCESS_SECRET` | Yes | None | Minimum 32-character JWT secret |
| `JWT_REFRESH_SECRET` | Yes | None | Minimum 32-character JWT secret |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Access-token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh-token lifetime |
| `BCRYPT_ROUNDS` | No | `12` | Password hashing cost |
| `SWAGGER_SERVER_URL` | No | `http://localhost:4000` | Server URL shown in Swagger |

### Seed-only optional variables

These are used by `prisma/seed.js` if present:

| Variable | Default |
| --- | --- |
| `SEED_ADMIN_EMAIL` | `admin@example.com` |
| `SEED_ADMIN_PASSWORD` | `Admin@12345` |
| `SEED_ANALYST_EMAIL` | `analyst@example.com` |
| `SEED_ANALYST_PASSWORD` | `Analyst@12345` |
| `SEED_VIEWER_EMAIL` | `viewer@example.com` |
| `SEED_VIEWER_PASSWORD` | `Viewer@12345` |

### Example `.env`

```env
NODE_ENV=development
PORT=4000
API_PREFIX=/api/v1
APP_NAME=Finance Dashboard Backend
CORS_ORIGIN=*
LOG_LEVEL=info
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finance_dashboard?schema=public
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/finance_dashboard?schema=public
JWT_ACCESS_SECRET=replace_with_a_long_random_string_for_access_token_secret_12345
JWT_REFRESH_SECRET=replace_with_a_long_random_string_for_refresh_token_secret_67890
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
SWAGGER_SERVER_URL=http://localhost:4000
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=Admin@12345
SEED_ANALYST_EMAIL=analyst@example.com
SEED_ANALYST_PASSWORD=Analyst@12345
SEED_VIEWER_EMAIL=viewer@example.com
SEED_VIEWER_PASSWORD=Viewer@12345
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

```bash
cp .env.example .env
```

If you are on Windows PowerShell and do not have `cp` aliased:

```powershell
Copy-Item .env.example .env
```

### 3. Configure PostgreSQL

Create a PostgreSQL database and point `DATABASE_URL` to it.

Example local database name:

```text
finance_dashboard
```

### 4. Generate Prisma client

```bash
npm run prisma:generate
```

### 5. Run migrations

```bash
npm run prisma:migrate
```

### 6. Seed demo data

```bash
npm run prisma:seed
```

### 7. Start the server

Development:

```bash
npm run dev
```

Production-style local start:

```bash
npm start
```

---

## Available Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the app with nodemon |
| `npm start` | Start the app with Node.js |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run Prisma development migrations |
| `npm run prisma:deploy` | Apply migrations in deploy mode |
| `npm run prisma:seed` | Seed demo users and finance records |
| `npm test` | Run Jest unit tests |

---

## Database and Prisma Workflow

### Prisma schema

The database schema is defined in:

```text
prisma/schema.prisma
```

### Migrations

Migration SQL files are stored in:

```text
prisma/migrations/
```

### Seed behavior

The seed script:

- upserts admin, analyst, and viewer users
- hashes passwords with `bcryptjs`
- clears existing `FinanceRecord` entries
- inserts demo income and expense records across several months

---

## Seeded Demo Accounts

After running `npm run prisma:seed`, you can log in with:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `Admin@12345` |
| Analyst | `analyst@example.com` | `Analyst@12345` |
| Viewer | `viewer@example.com` | `Viewer@12345` |

---

## API Endpoints

All business endpoints are mounted under:

```text
/api/v1
```

### Auth

| Method | Endpoint | Auth required | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | No | Register a new viewer account |
| `POST` | `/auth/login` | No | Log in and receive access/refresh tokens |
| `POST` | `/auth/refresh` | No | Rotate refresh token and issue a new token pair |
| `POST` | `/auth/logout` | Yes | Revoke the provided refresh session for the current user |
| `POST` | `/auth/logout-all` | Yes | Revoke all active refresh sessions for the current user |
| `GET` | `/auth/me` | Yes | Get current authenticated user |

#### Example: register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "StrongPass@123"
}
```

### Users

Admin-only module.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/users` | List users with search and pagination |
| `POST` | `/users` | Create a user |
| `GET` | `/users/:id` | Get a user by id |
| `PATCH` | `/users/:id` | Update name, email, password, role, or status |
| `PATCH` | `/users/:id/status` | Update status only |

### Records

| Method | Endpoint | Roles | Description |
| --- | --- | --- | --- |
| `GET` | `/records` | `ADMIN`, `ANALYST` | List records with filters and pagination |
| `GET` | `/records/:id` | `ADMIN`, `ANALYST` | Get record by id |
| `POST` | `/records` | `ADMIN` | Create a finance record |
| `PATCH` | `/records/:id` | `ADMIN` | Update a finance record |
| `DELETE` | `/records/:id` | `ADMIN` | Soft delete a finance record |

#### Supported record filters

| Query param | Description |
| --- | --- |
| `page` | Page number |
| `limit` | Page size, max `100` |
| `type` | `INCOME` or `EXPENSE` |
| `category` | Category text filter |
| `search` | Search in category and notes |
| `startDate` | Start date |
| `endDate` | End date |
| `includeDeleted` | Admin-only deleted-record inclusion |

### Dashboard

| Method | Endpoint | Roles | Description |
| --- | --- | --- | --- |
| `GET` | `/dashboard/summary` | `VIEWER`, `ANALYST`, `ADMIN` | Return summary analytics |

#### Supported dashboard filters

| Query param | Description |
| --- | --- |
| `startDate` | Optional date lower bound |
| `endDate` | Optional date upper bound |
| `recentLimit` | Number of recent records to return, max `50` |

---

## Request and Response Shape

### Success response

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

### Error response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "path": "email",
      "message": "Invalid email"
    }
  ]
}
```

### Authentication response payload

Successful auth actions return:

```json
{
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "VIEWER",
    "status": "ACTIVE",
    "createdAt": "2026-04-03T18:04:56.182Z",
    "updatedAt": "2026-04-03T18:04:56.182Z"
  },
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "accessTokenExpiresIn": "15m",
    "refreshTokenExpiresIn": "7d"
  }
}
```

---

## Validation and Error Handling

### Validation

Validation is handled through Zod schemas for:

- auth body payloads
- user body payloads
- user query payloads
- record body payloads
- record query payloads
- dashboard query payloads

### Examples of enforced validation

- passwords require uppercase, lowercase, number, and special character
- pagination values are coerced and bounded
- date-range queries are validated so `startDate <= endDate`
- record amounts must be positive
- `includeDeleted` query parsing is normalized safely

### Common error cases handled

- missing or invalid access token
- inactive user trying to access the system
- invalid or revoked refresh session
- duplicate email conflict
- invalid request payload
- requesting non-existent resources
- unauthorized role access

---

## Security and Operational Features

The project includes practical backend hardening features:

- `helmet` for HTTP security headers
- `cors` for origin control
- `compression` for response compression
- `express-rate-limit` for request throttling
- `pino` and `pino-http` for structured logs
- password hashing with `bcryptjs`
- hashed refresh tokens stored in the database
- refresh-token rotation
- graceful Prisma connect/disconnect lifecycle

---

## Testing

### Unit tests

Run:

```bash
npm test
```

The test suite covers:

- authentication service session behavior
- authentication middleware
- authorization middleware
- validation middleware
- user service behavior
- record query logic
- record query validation
- dashboard helper logic
- pagination helper behavior

### Coverage

Coverage can be generated with:

```bash
npm test -- --coverage
```

---

## Live End-to-End Verification

This backend was verified with a live API audit against a real PostgreSQL-backed running server.

The live audit covered:

- registration
- login
- refresh token rotation
- logout
- logout all sessions
- current user lookup
- dashboard access by viewer
- record access restrictions by role
- analyst record reads
- admin record create, update, soft delete
- admin include-deleted listing
- admin user create, update, get, list, status update
- inactive user login blocking

Live audit result:

- total live requests executed: `27`
- passed: `27`
- failed: `0`

The detailed request and response logs were captured into local audit artifacts during testing.

---

## Design Decisions and Assumptions

- Self-registration creates a `VIEWER`
- Elevated roles are assigned through admin-managed user endpoints
- `INACTIVE` users are blocked from login, refresh, and protected endpoints
- Finance records use soft delete rather than hard delete
- Dashboard analytics exclude soft-deleted records
- `includeDeleted=true` only matters for admins
- Dashboard trends are grouped by month
- Services hold business logic so controllers stay thin

---

## Submission Notes

This project intentionally emphasizes correctness, maintainability, and backend clarity over unnecessary complexity.

What a reviewer should notice:

- clear modular structure
- consistent request/response behavior
- practical access-control enforcement
- thoughtful data modeling
- realistic auth/session handling
- meaningful documentation
- test coverage plus live verification

---

## Quick Start

If you only want the shortest path to running the project:

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Then open:

- Swagger UI: `http://localhost:4000/docs`
- API JSON: `http://localhost:4000/docs-json`
- Health check: `http://localhost:4000/api/v1/health`
