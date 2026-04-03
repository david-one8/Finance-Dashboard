# Finance Dashboard Backend

A production-style Express + Node.js backend for a finance dashboard assessment. It uses PostgreSQL + Prisma, JWT access/refresh token authentication, RBAC, soft deletion for finance records, dashboard summary analytics, Swagger/OpenAPI docs, and unit tests.

## Why this structure

This codebase follows a 15-factor-friendly backend approach:

1. **Codebase**: one backend service, one repository.
2. **Dependencies**: all dependencies are explicit in `package.json`.
3. **Config**: runtime settings come from environment variables.
4. **Backing services**: PostgreSQL is attached through `DATABASE_URL`.
5. **Build, release, run**: Prisma generate/migrate/seed and server start are separated.
6. **Processes**: stateless API process, refresh sessions persisted in the database.
7. **Port binding**: Express binds directly to a port.
8. **Concurrency**: horizontal scaling friendly because app state is not stored in memory.
9. **Disposability**: graceful startup and shutdown are implemented.
10. **Dev/prod parity**: local development mirrors production behavior closely.
11. **Logs**: structured logs are written through Pino.
12. **Admin processes**: Prisma seed/migrate commands are one-off tasks.
13. **API first**: Swagger/OpenAPI is included.
14. **Telemetry**: health endpoint and structured logs are available.
15. **Auth**: backend-level authentication and RBAC are enforced in middleware and services.

## Tech stack

- Node.js + Express
- PostgreSQL
- Prisma ORM
- JWT access + refresh tokens with rotation
- bcryptjs for password hashing
- Zod validation
- Swagger UI for API documentation
- Jest for unit tests
- Helmet, CORS, compression, and rate limiting for API hardening

## Feature summary

### Authentication
- Register
- Login
- Refresh token rotation
- Logout current session
- Logout all sessions
- Current user endpoint
- Inactive users blocked at login, refresh, and protected APIs

### Users
- Admin-only user creation and management
- Role assignment: Viewer, Analyst, Admin
- Status management: Active / Inactive
- Search and pagination

### Finance records
- Admin create/update/delete
- Analyst read-only access
- Viewer blocked from record APIs
- Filters: type, category, text search, date range
- Soft delete with `deletedAt` and `deletedById`
- Pagination

### Dashboard analytics
- Total income
- Total expense
- Net balance
- Category totals
- Monthly trends
- Recent activity
- Date-range filtering

## Folder structure

```text
.
├── prisma/
├── src/
│   ├── config/
│   ├── lib/
│   ├── middlewares/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── records/
│   │   └── dashboard/
│   ├── routes/
│   └── shared/
├── tests/
└── README.md
```

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

```bash
cp .env.example .env
```

Update `.env` with your PostgreSQL credentials and JWT secrets.

### 3) Make sure PostgreSQL is running locally

Create a database named `finance_dashboard`, or update `DATABASE_URL` to match your existing local PostgreSQL database.

### 4) Generate Prisma client

```bash
npm run prisma:generate
```

### 5) Run migrations

```bash
npm run prisma:migrate
```

### 6) Seed demo users and records

```bash
npm run prisma:seed
```

### 7) Start the API

```bash
npm run dev
```

## API base and docs

- Base URL: `http://localhost:4000/api/v1`
- Swagger UI: `http://localhost:4000/docs`
- OpenAPI JSON: `http://localhost:4000/docs-json`
- Health: `GET /api/v1/health`

## Default seeded users

- Admin: `admin@example.com` / `Admin@12345`
- Analyst: `analyst@example.com` / `Analyst@12345`
- Viewer: `viewer@example.com` / `Viewer@12345`

## Main endpoints

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/logout-all`
- `GET /auth/me`

### Users (Admin only)
- `GET /users`
- `POST /users`
- `GET /users/:id`
- `PATCH /users/:id`
- `PATCH /users/:id/status`

### Records
- `GET /records` → Admin, Analyst
- `GET /records/:id` → Admin, Analyst
- `POST /records` → Admin
- `PATCH /records/:id` → Admin
- `DELETE /records/:id` → Admin (soft delete)

### Dashboard
- `GET /dashboard/summary` → Viewer, Analyst, Admin

## Example install command with all libraries

```bash
npm install express cors helmet compression express-rate-limit dotenv jsonwebtoken bcryptjs zod pino pino-http pino-pretty @prisma/client swagger-ui-express && npm install -D prisma nodemon jest
```

## Notes and assumptions

- Self-registration creates a **Viewer** by default.
- Admins manage elevated roles and user status.
- Refresh tokens are rotated and persisted as hashed session records.
- Soft-deleted finance records are excluded from dashboards and analyst views.
- `includeDeleted=true` is meaningful only for admins on record listing.
- Monthly trends are grouped by calendar month.