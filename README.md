# MCMC Complaint Management System (Mini)

A full-stack complaint management system that lets officers review, triage, assign, and resolve
complaints submitted by the public about telecommunications and digital services.

Built as a technical assessment for the MCMC Digital Innovation and Solutions Department (DISD) —
Fullstack Developer role.

---

## Overview

The system has two roles:

- **Admin** — sees every complaint, assigns complaints to officers, and has full visibility across
  dashboards and reports.
- **Officer** — sees only the complaints assigned to them and updates their status as work
  progresses.

Every status change or reassignment is recorded as an entry in a per-complaint activity timeline,
so there's always an audit trail of who did what and when.

## Features

- **Authentication** — email/password login, JWT stored in an httpOnly cookie (no tokens sitting
  in `localStorage`).
- **Role-based access control** — officers only see their own assigned complaints; only admins can
  assign/reassign.
- **Complaint lifecycle** — `New → Investigation → On Hold / Appeal → Resolved → Closed`, with a
  required comment on every status change or assignment.
- **Activity timeline** — full audit history per complaint (created, assigned, status changes).
- **Table & Kanban board views** — switch between a filterable/sortable table and a drag-free
  status-column board (view preference persists across sessions).
- **Search, filters & pagination** — by status, category, assignee, and free-text search on title
  or complainant name.
- **Dashboard** — KPI counts, category breakdown chart, and complaints-over-time chart.
- **Reports** — aggregate breakdowns by status and category.
- **Officer workload view** — admin-only page showing each officer's assigned/active/resolved
  counts.
- **Consistent API contract** — every response (success or error) is wrapped as
  `{ success, message, data }`.

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Backend runtime | Node.js + Express 4 | Express 4 pinned deliberately — see [SETUP.md](SETUP.md) |
| Database | PostgreSQL | Enums for role/category/status, triggers for `updated_at` |
| DB access | `pg` (node-postgres) + a repository layer | No ORM — plain SQL, full control |
| Auth | `jsonwebtoken`, httpOnly cookie | See [Authentication & Roles](#authentication--roles) |
| Password hashing | `bcryptjs` | Pure-JS, avoids native build tooling on Windows |
| Validation | `zod` | Schema-driven, field-level error messages |
| Frontend | React 19 + Vite | |
| Routing | React Router v7 | Protected-route wrapper around auth context |
| HTTP client | Axios | Single instance, `withCredentials: true` |
| Charts | Recharts | Dashboard + reports |
| Styling | Tailwind CSS 3 | |
| Icons | `lucide-react` | |

## Architecture

```
┌───────────────────────────────────────────────────────────┐
│  React SPA (Vite)                                          │
│  Pages → Components → Hooks → API layer (Axios)             │
└────────────────────────┬────────────────────────────────────┘
                          │  withCredentials: true
                          │  httpOnly cookie carries the JWT
                          ▼
┌───────────────────────────────────────────────────────────┐
│  Express API                                                │
│                                                              │
│  Routes                                                     │
│    └─ Middleware  (authenticate → authorize → validate)      │
│         └─ Controllers   (HTTP in / HTTP out only)            │
│              └─ Services  (business rules, transactions)      │
│                   └─ Repositories  (SQL only)                 │
│                        └─ PostgreSQL                          │
└───────────────────────────────────────────────────────────┘
```

Each layer only talks to the one directly below it: routes wire up middleware and a controller,
controllers translate HTTP ↔ service calls, services hold the business rules and transactions,
and repositories are the only place raw SQL lives.

## Project Structure

```
ComplaintManagementSystem/
├── backend/
│   └── src/
│       ├── config/        # env loading/validation
│       ├── constants/      # roles, categories, statuses, messages
│       ├── controllers/    # HTTP in/out
│       ├── services/       # business logic, transactions
│       ├── repositories/   # SQL queries
│       ├── routes/         # /api/* endpoint wiring
│       ├── middlewares/    # authenticate, authorize, validate, error handling
│       ├── validators/     # zod schemas
│       ├── db/             # migrations, seeds, migrate/reset scripts
│       └── utils/
├── frontend/
│   └── src/
│       ├── pages/          # top-level views (login, dashboard, complaints, reports...)
│       ├── components/     # ui/, layout/, complaints/, dashboard/, reports/, feedback/
│       ├── hooks/          # useComplaints, useComplaintBoard, useDashboardCharts, ...
│       ├── context/        # AuthContext
│       ├── api/            # axios client + endpoint wrappers
│       └── routes/         # route table + ProtectedRoute
├── docs/
│   └── screenshots/
└── SETUP.md                # full local setup + troubleshooting guide
```

## Getting Started

This README covers the essentials. For complete step-by-step instructions — installing
prerequisites, creating the database, environment variables, and a full troubleshooting guide —
see **[SETUP.md](SETUP.md)**.

### Quick start

```bash
# 1. Clone
git clone <repository-url>
cd ComplaintManagementSystem

# 2. Install dependencies
cd backend && npm install && cd ../frontend && npm install && cd ..

# 3. Configure environment
cp backend/.env.example backend/.env      # then set DATABASE_URL and JWT_SECRET
cp frontend/.env.example frontend/.env

# 4. Create the database (see SETUP.md §2.2 for full detail, incl. a PostgreSQL 15+ gotcha)
psql -U postgres -c "CREATE DATABASE mcmc_complaints;"

# 5. Run migrations + seed data
cd backend && npm run db:reset

# 6. Start both servers (two terminals)
npm run dev                       # backend  → http://localhost:3000
cd ../frontend && npm run dev     # frontend → http://localhost:5173
```

### Demo credentials

Seeded by `npm run db:seed` / `db:reset` (2 users, 10 sample complaints):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@mcmc.gov.my` | `Admin@123` |
| Officer | `officer@mcmc.gov.my` | `Officer@123` |

## Authentication & Roles

- Login issues a JWT signed with `JWT_SECRET`, sent to the browser as an httpOnly, `sameSite=lax`
  cookie (`secure` only in production).
- All `/api/complaints`, `/api/dashboard`, and `/api/auth/me` routes require a valid cookie.
- **Officer** — can only list/view complaints assigned to them; a request for someone else's
  complaint returns `403`.
- **Admin** — can list/view all complaints, and is the only role allowed to set `assigned_to` on
  a complaint or list officers via `/api/users/officers`.

## API Reference

All endpoints are mounted under `/api` and return `{ success, message, data }`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Liveness check |
| POST | `/auth/login` | — | `{ email, password }` → sets auth cookie, returns user |
| POST | `/auth/logout` | ✅ | Clears the auth cookie |
| GET | `/auth/me` | ✅ | Current user's profile |
| POST | `/complaints` | ✅ | Create a complaint |
| GET | `/complaints` | ✅ | Paginated list — filter by status/category/assignee, search, sort |
| GET | `/complaints/:id` | ✅ | Complaint detail + activity timeline |
| PATCH | `/complaints/:id` | ✅ | Update status and/or assignment (comment required); assignment is admin-only |
| GET | `/users/officers` | ✅ admin | List all officer accounts |
| GET | `/dashboard/charts` | ✅ | Category breakdown + complaints-over-time series |

## Data Model

| Table | Key columns |
|---|---|
| `users` | `id`, `name`, `email` (unique), `password_hash`, `role` (`officer` \| `admin`) |
| `complaints` | `id`, `title`, `description`, `category`, `status`, `complainant_name/phone/email`, `assigned_to → users.id`, `created_at`, `updated_at` |
| `activity_logs` | `id`, `complaint_id → complaints.id`, `action` (`created` \| `status_changed` \| `assigned` \| `commented`), `description`, `performed_by → users.id`, `created_at` |

**Categories:** Network Service Quality · Fraud, Scam & Security · Billing & Charges ·
Service Provisioning · Digital & Online Services

**Statuses:** New · Investigation · On Hold · Appeal · Resolved · Closed

## License

ISC
