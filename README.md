# MCMC Complaint Management System (Mini)

A full-stack complaint management system for MCMC officers to review, manage, and resolve
complaints submitted by the public regarding telecommunications and digital services.

Built for the MCMC Digital Innovation and Solutions Department (DISD) technical assessment —
Fullstack Developer role.

---

## Table of Contents

1. [Scope](#1-scope)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Folder Structure](#4-folder-structure)
5. [Data Model](#5-data-model)
6. [API Contract](#6-api-contract)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Frontend Design](#8-frontend-design)
9. [Getting Started](#9-getting-started)
10. [Build Plan](#10-build-plan)
11. [Design Decisions & Trade-offs](#11-design-decisions--trade-offs)
12. [Interview Preparation](#12-interview-preparation)

---

## 1. Scope

### Must have (explicitly required by the brief)

**Backend**
- [ ] REST API with JWT authentication and role-based access
- [ ] `POST /api/complaints` — submit a new complaint
- [ ] `GET /api/complaints` — list with pagination + filter by status & category
- [ ] `GET /api/complaints/:id` — detail including activity log
- [ ] `PATCH /api/complaints/:id` — update status (with comment)
- [ ] `POST /api/auth/login` — email + password, returns JWT
- [ ] `GET /api/auth/me` — current user profile
- [ ] All endpoints protected except login
- [ ] Only `admin` can assign complaints
- [ ] Activity log auto-created on status or assignment change
- [ ] Input validation with proper error messages
- [ ] Seed/migration script — at least 2 users, 10 complaints

**Frontend**
- [ ] Login page (email/password)
- [ ] Complaint list page — table with title, category, status, date + filters + pagination
- [ ] Complaint detail page — full info, activity log timeline, update status with comment
- [ ] Consumes the backend API (no hardcoded data in production mode)
- [ ] Loading, error, and empty states handled
- [ ] Protected routes (redirect to login if not authenticated)
- [ ] At least one reusable component
- [ ] Responsive — works on desktop and tablet widths

### Nice to have (only if the must-haves are done and stable)

- [ ] Dashboard page with summary counts (Total / In Progress / Resolved / Closed)
- [ ] Category breakdown chart, complaints-over-time chart
- [ ] Assign-officer UI (admin only)
- [ ] Search by complainant name or title
- [ ] Sort by column
- [ ] Toast notifications
- [ ] Dark mode

> **Priority rule:** a complete, polished must-have build beats a half-finished ambitious one.
> The brief says they are looking for *working software, clear thinking, and problem-solving* —
> not feature count. Build the required scope end-to-end first, then stop and polish.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Backend runtime | Node.js + Express | Chosen from the brief's Python/Node option |
| Database | PostgreSQL | Chosen over SQLite — proper enums, better story in interview |
| DB access | `pg` (node-postgres) with a repository layer | No ORM — full control over queries |
| Auth | JWT (`jsonwebtoken`) stored in an httpOnly cookie | See section 7 |
| Password hashing | `bcrypt` | Never store plaintext |
| Validation | `zod` (or `express-validator`) | Schema-driven, returns field-level errors |
| Frontend | React + Vite | Fast dev server, simple build |
| Routing | React Router v6 | Protected route wrapper |
| HTTP client | Axios | Single configured instance, `withCredentials: true` |
| Styling | Tailwind CSS | Fast, consistent, responsive utilities |
| Icons | `lucide-react` | Clean, consistent icon set |

**Deliberately not included:** Redux (Context is enough at this size), an ORM (repositories are
clearer to explain), Docker (adds setup risk for a live local demo). Be ready to say *why* —
see section 11.

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React SPA (Vite)                                       │
│  Pages → Components → Hooks → API layer (Axios)         │
└────────────────────────┬────────────────────────────────┘
                         │  HTTPS, withCredentials: true
                         │  httpOnly cookie carries the JWT
                         ▼
┌─────────────────────────────────────────────────────────┐
│  Express API                                            │
│                                                         │
│  Routes                                                 │
│    └─ Middleware  (authenticate → authorize → validate) │
│         └─ Controllers   (HTTP in / HTTP out only)      │
│              └─ Services  (business rules, transactions)│
│                   └─ Repositories  (SQL only)           │
│                        └─ PostgreSQL                    │
│                                                         │
│  Every response wrapped by the Result helper            │
│  Errors funnel into one central error handler           │
└─────────────────────────────────────────────────────────┘
```

### The layering rule

Each layer only talks to the one below it. This is the single most important thing to be able
to explain in the interview.

| Layer | Responsibility | Must NOT do |
|---|---|---|
| **Route** | Map a URL + method to middleware and a controller | Contain logic |
| **Middleware** | Auth, role checks, validation, error handling | Query the database |
| **Controller** | Read the request, call one service, return a `Result` | Contain business rules or SQL |
| **Service** | Business rules, orchestration, transactions | Know about `req` / `res` |
| **Repository** | SQL queries only | Contain business rules |

**Why it matters:** when the interviewer asks you to add a feature live, you will know exactly
which files to open and in what order. That is the whole point of the structure.

---

## 4. Folder Structure

### Repository root

```
mcmc-complaint-system/
├── backend/
├── frontend/
├── docs/
│   ├── api.md                  # endpoint reference
│   └── screenshots/            # for the demo, in case live fails
├── .gitignore
└── README.md
```

### Backend

```
backend/
├── src/
│   ├── config/
│   │   ├── env.js                    # loads + validates env vars, fails fast if missing
│   │   └── db.js                     # PostgreSQL pool
│   │
│   ├── constants/
│   │   ├── complaintStatus.js        # NEW | IN_PROGRESS | RESOLVED | CLOSED
│   │   ├── complaintCategory.js      # NETWORK | BILLING | SCAM | SERVICE_DISRUPTION | OTHER
│   │   ├── userRole.js               # OFFICER | ADMIN
│   │   ├── activityAction.js         # CREATED | STATUS_CHANGED | ASSIGNED | COMMENTED
│   │   └── messages.js               # all user-facing response messages, in one place
│   │
│   ├── db/
│   │   ├── migrations/
│   │   │   ├── 001_create_users.sql
│   │   │   ├── 002_create_complaints.sql
│   │   │   └── 003_create_activity_logs.sql
│   │   ├── seeds/
│   │   │   └── seed.js               # 2 users + 10 complaints + starting activity logs
│   │   ├── migrate.js                # runs migrations in order
│   │   └── reset.js                  # drop → migrate → seed (one command for demos)
│   │
│   ├── repositories/
│   │   ├── userRepository.js         # findByEmail, findById, findAllOfficers
│   │   ├── complaintRepository.js    # create, findPaginated, findById, update
│   │   └── activityLogRepository.js  # create, findByComplaintId
│   │
│   ├── services/
│   │   ├── authService.js            # login, getCurrentUser
│   │   └── complaintService.js       # create, list, getDetail, updateStatus, assign
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   └── complaintController.js
│   │
│   ├── routes/
│   │   ├── index.js                  # mounts all routers under /api
│   │   ├── authRoutes.js
│   │   └── complaintRoutes.js
│   │
│   ├── middlewares/
│   │   ├── authenticate.js           # reads cookie, verifies JWT, attaches req.user
│   │   ├── authorize.js              # authorize('ADMIN') — role gate
│   │   ├── validate.js               # runs a zod schema against body/query/params
│   │   ├── errorHandler.js           # central catch — the ONLY place that formats errors
│   │   └── notFound.js               # unmatched routes → 404 Result
│   │
│   ├── validators/
│   │   ├── authValidator.js
│   │   └── complaintValidator.js     # createSchema, listQuerySchema, updateSchema
│   │
│   ├── utils/
│   │   ├── result.js                 # Result.ok() / Result.fail() — see section 6
│   │   ├── AppError.js               # custom error with statusCode + message
│   │   ├── jwt.js                    # sign, verify
│   │   ├── password.js               # hash, compare
│   │   ├── cookie.js                 # setAuthCookie, clearAuthCookie (options in one place)
│   │   └── pagination.js             # parse page/limit, build the pagination object
│   │
│   ├── app.js                        # express app: cors, cookieParser, routes, errorHandler
│   └── server.js                     # starts the server (kept separate so app is testable)
│
├── .env.example
├── .gitignore
└── package.json
```

### Frontend

```
frontend/
├── src/
│   ├── api/
│   │   ├── axiosClient.js            # base URL, withCredentials, interceptors
│   │   ├── authApi.js                # login, logout, getMe
│   │   └── complaintApi.js           # list, getById, create, updateStatus, assign
│   │
│   ├── components/
│   │   ├── ui/                       # generic, reusable, knows nothing about complaints
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Textarea.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Pagination.jsx         ★ reusable component
│   │   │   └── Spinner.jsx
│   │   │
│   │   ├── feedback/                 # the three states, standardised
│   │   │   ├── LoadingState.jsx
│   │   │   ├── ErrorState.jsx        # shows message + retry
│   │   │   └── EmptyState.jsx
│   │   │
│   │   ├── layout/
│   │   │   ├── AppShell.jsx          # sidebar + topbar + content outlet
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx            # user name, role, logout
│   │   │   └── PageHeader.jsx        # title + subtitle + actions slot
│   │   │
│   │   └── complaints/               # domain components
│   │       ├── StatusBadge.jsx        ★ reusable component
│   │       ├── CategoryBadge.jsx
│   │       ├── ComplaintTable.jsx
│   │       ├── ComplaintFilters.jsx   # status + category dropdowns
│   │       ├── ComplaintInfoCard.jsx
│   │       ├── ActivityTimeline.jsx
│   │       ├── StatusUpdateForm.jsx   # new status + required comment
│   │       └── AssignOfficerForm.jsx  # admin only
│   │
│   ├── constants/
│   │   ├── complaintStatus.js        # value → label + colour, mirrors the backend enum
│   │   ├── complaintCategory.js
│   │   └── routes.js                 # route paths as constants, no magic strings
│   │
│   ├── context/
│   │   └── AuthContext.jsx           # user, loading, login(), logout()
│   │
│   ├── hooks/
│   │   ├── useAuth.js                # consumes AuthContext
│   │   ├── useComplaints.js          # list + filters + pagination + loading/error
│   │   ├── useComplaintDetail.js
│   │   └── useDocumentTitle.js
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── ComplaintListPage.jsx
│   │   ├── ComplaintDetailPage.jsx
│   │   ├── DashboardPage.jsx          # optional
│   │   └── NotFoundPage.jsx
│   │
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   └── ProtectedRoute.jsx         # redirects to /login if unauthenticated
│   │
│   ├── utils/
│   │   ├── formatDate.js
│   │   └── cn.js                      # className merge helper
│   │
│   ├── styles/
│   │   └── index.css                  # tailwind directives + CSS variables
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env.example
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

### The rules behind this structure

Be ready to state these out loud — the interview explicitly covers folder structure.

1. **Pages hold no logic.** A page composes components and calls a hook. If a page grows past
   ~120 lines, something inside it should have been a component.
2. **`components/ui/` knows nothing about complaints.** `Button` and `Table` could be lifted into
   any other project unchanged. Domain knowledge lives in `components/complaints/`.
3. **All API calls live in `src/api/`.** No component ever imports Axios directly. If the base URL
   or auth handling changes, exactly one file changes.
4. **Enums are defined once per side and mirrored.** Status and category values live in
   `constants/` on both frontend and backend. No string literals scattered through the code.
5. **Backend: only `errorHandler.js` formats an error response.** Controllers throw; the handler
   shapes. This is why the response format is guaranteed consistent.

---

## 5. Data Model

```
┌──────────────────────┐
│ users                │
├──────────────────────┤
│ id            PK     │
│ name                 │
│ email         UNIQUE │
│ password_hash        │
│ role          ENUM   │◄──┐  officer | admin
│ created_at           │   │
└──────────────────────┘   │
         ▲                 │
         │ assigned_to     │ performed_by
         │ (nullable)      │
┌────────┴─────────────┐   │   ┌──────────────────────┐
│ complaints           │   │   │ activity_logs        │
├──────────────────────┤   │   ├──────────────────────┤
│ id            PK     │   └───┤ id            PK     │
│ title                │       │ complaint_id  FK     │
│ description          │◄──────┤ action        ENUM   │
│ category      ENUM   │  1..n │ description          │
│ status        ENUM   │       │ performed_by  FK     │
│ complainant_name     │       │ created_at           │
│ complainant_phone    │       └──────────────────────┘
│ complainant_email    │
│ assigned_to   FK null│
│ created_at           │
│ updated_at           │
└──────────────────────┘
```

### Enum values

| Enum | Values |
|---|---|
| `user_role` | `officer`, `admin` |
| `complaint_status` | `new`, `in_progress`, `resolved`, `closed` |
| `complaint_category` | `network`, `billing`, `scam`, `service_disruption`, `other` |
| `activity_action` | `created`, `status_changed`, `assigned`, `commented` |

### Schema notes

- Use native PostgreSQL `ENUM` types (or `CHECK` constraints) — the database enforces validity,
  not just the application. Good detail to mention in the interview.
- Index `complaints(status)`, `complaints(category)`, and `complaints(created_at DESC)` — the list
  endpoint filters and sorts on exactly these.
- Index `activity_logs(complaint_id)` — always queried by complaint.
- `assigned_to` is nullable: a new complaint is unassigned.
- Never select `password_hash` outside `userRepository`. The repository returns a shape without it.

### Seed data

- 2 users minimum: one `admin`, one `officer`. Use obvious demo credentials and **write them in
  this README** so the interviewer can log in themselves if they ask.
- 10 complaints spread across all statuses and all categories, with varied `created_at` dates so
  filtering and pagination visibly do something.
- Give each seeded complaint at least one `created` activity log so the timeline is never empty
  on first view.

**Demo credentials**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@mcmc.gov.my` | `Admin@123` |
| Officer | `officer@mcmc.gov.my` | `Officer@123` |

---

## 6. API Contract

### The Result wrapper

Every response — success or failure — has the same shape. Nothing is returned bare.

```js
// src/utils/result.js
const Result = {
  ok:   (data = null, message = 'Success')  => ({ success: true,  message, data }),
  fail: (message = 'Request failed', data = null) => ({ success: false, message, data }),
};
```

```json
{
  "success": true,
  "message": "Complaints retrieved successfully",
  "data": { }
}
```

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      { "field": "title", "message": "Title is required" },
      { "field": "complainant_email", "message": "Must be a valid email address" }
    ]
  }
}
```

**Why this pays off:** the frontend never has to guess. One Axios interceptor reads
`response.data.success`, and `message` is always safe to show the user directly. Field-level errors
always live at `data.errors`, so form components handle them uniformly.

> Note on the generic type: you wrote the contract as `Result<T>`. JavaScript has no generics at
> runtime, so `data` is simply the typed payload. If you want the generic to be real and checked,
> use TypeScript on the backend and declare `type Result<T> = { success: boolean; message: string;
> data: T | null }`. **That is a genuinely good thing to mention in the interview** — it shows you
> know the difference between a convention and a type guarantee.

### Endpoints

| Method | Path | Auth | Role | Purpose |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | — | — | Log in, set httpOnly cookie |
| `POST` | `/api/auth/logout` | ✔ | any | Clear the cookie |
| `GET` | `/api/auth/me` | ✔ | any | Current user profile |
| `POST` | `/api/complaints` | ✔ | any | Submit a complaint |
| `GET` | `/api/complaints` | ✔ | any | List — paginated, filterable |
| `GET` | `/api/complaints/:id` | ✔ | any | Detail + activity log |
| `PATCH` | `/api/complaints/:id` | ✔ | any / admin | Update status; **assignment is admin-only** |
| `GET` | `/api/users/officers` | ✔ | admin | Officer list for the assign dropdown *(optional)* |

### `POST /api/auth/login`

```json
// request
{ "email": "admin@mcmc.gov.my", "password": "Admin@123" }
```

```json
// 200 — plus Set-Cookie: token=<jwt>; HttpOnly; SameSite=Lax; Path=/
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": 1, "name": "Aleya", "email": "admin@mcmc.gov.my", "role": "admin" }
  }
}
```

The token is **not** in the body — only in the cookie. Returning the user object lets the frontend
populate `AuthContext` immediately without a second round trip.

### `GET /api/complaints`

Query params: `page` (default 1), `limit` (default 10, max 100), `status`, `category`,
`sort` (default `created_at`), `order` (`asc` | `desc`, default `desc`).

```json
{
  "success": true,
  "message": "Complaints retrieved successfully",
  "data": {
    "items": [
      {
        "id": 7,
        "title": "No coverage in Taman Melawati since Monday",
        "category": "network",
        "status": "in_progress",
        "complainant_name": "Nurul Huda",
        "assigned_to": { "id": 2, "name": "Officer Ahmad" },
        "created_at": "2026-07-21T02:14:09.000Z",
        "updated_at": "2026-07-23T08:02:41.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 34, "totalPages": 4 }
  }
}
```

The list endpoint returns a summary shape — it does **not** include `description` or the activity
log. Only the detail endpoint does. Worth saying out loud: it keeps the list payload small.

### `GET /api/complaints/:id`

Returns the full complaint plus `activity_logs`, ordered oldest → newest, each with the performer's
name resolved.

### `PATCH /api/complaints/:id`

```json
{ "status": "resolved", "comment": "Issue confirmed fixed by the service provider." }
```

```json
{ "assigned_to": 2, "comment": "Assigning to Officer Ahmad for site verification." }  // admin only
```

Rules to enforce in `complaintService`:

- `comment` is **required** on any status change — it becomes the activity log description.
- A non-admin attempting `assigned_to` gets `403` with a clear message.
- Status change and activity log insert happen in **one transaction**. If the log fails, the status
  change rolls back. There must never be an unexplained status change in the history.
- If `status` is unchanged, do not create a log entry — avoid noise in the timeline.

---

## 7. Authentication & Authorization

### Why httpOnly cookie instead of localStorage

This is the decision most likely to be probed. The short answer:

> JavaScript cannot read an httpOnly cookie, so an XSS vulnerability cannot steal the token. If the
> token sits in `localStorage`, any injected script can read it and impersonate the user.

The honest trade-off — say this too, it is the part that shows maturity:

> Cookies are sent automatically by the browser, which reintroduces CSRF risk that `localStorage`
> does not have. I mitigate it with `SameSite`, and for a production deployment I would add a CSRF
> token on state-changing requests.

### Cookie configuration

```js
// src/utils/cookie.js
const COOKIE_NAME = 'token';

const cookieOptions = {
  httpOnly: true,                                    // JS cannot read it
  secure:   process.env.NODE_ENV === 'production',   // HTTPS only in prod
  sameSite: 'lax',                                   // CSRF mitigation
  maxAge:   1000 * 60 * 60 * 8,                      // 8 hours — a work shift
  path:     '/',
};
```

Keep these options in **one file**. If the interviewer asks you to change token lifetime live, it
is a one-line edit in a predictable place.

### Request flow

```
1. POST /api/auth/login
     → authService verifies email + bcrypt password
     → signs JWT { sub: userId, role }
     → res.cookie('token', jwt, cookieOptions)
     → returns Result.ok({ user })

2. Frontend calls GET /api/auth/me on app load
     → cookie is sent automatically (withCredentials: true)
     → authenticate middleware verifies it, attaches req.user
     → AuthContext is populated, or the user is treated as logged out

3. Protected route renders, or redirects to /login
```

### CORS — the thing that will waste an hour if you get it wrong

Cookies across origins (`localhost:5173` → `localhost:3000`) require **both** of these, and a
wildcard origin will silently fail:

```js
// backend — app.js
app.use(cors({
  origin: process.env.CORS_ORIGIN,   // exact origin. NOT '*'
  credentials: true,
}));
```

```js
// frontend — src/api/axiosClient.js
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,             // send cookies
  headers: { 'Content-Type': 'application/json' },
});
```

### Axios response interceptor

```js
axiosClient.interceptors.response.use(
  (response) => response.data,                 // unwrap to the Result object
  (error) => {
    if (error.response?.status === 401) {
      // token expired or missing — clear local auth state and send to login
    }
    return Promise.reject(
      error.response?.data ?? { success: false, message: 'Network error', data: null }
    );
  }
);
```

Because the backend always returns a `Result`, even a thrown error is the same shape. Every
`catch` block in the app can rely on `err.message` existing.

### Authorization

- `authenticate` — verifies the cookie, attaches `req.user`. Applied to every route except login.
- `authorize('admin')` — a separate middleware, applied only where needed.

Assignment is admin-only, but it shares the `PATCH` endpoint with status updates. So the check
belongs in `complaintService`, not in route middleware: *if the payload contains `assigned_to` and
the user is not an admin, reject.* Being able to explain **why the check lives in the service and
not the route** is exactly the kind of reasoning they are assessing.

Also: hide the assign control in the UI for officers **and** enforce it on the server. A hidden
button is not access control.

---

## 8. Frontend Design

### Direction

Government-adjacent, so: credible, calm, and legible over decorative. Dense information presented
clearly. The interviewer is a technical person judging whether it looks professionally built — not
whether it is exciting.

**Layout:** persistent left sidebar (collapses to a top bar under 768px), content area with a page
header, then cards. Standard, and standard is correct here.

### Design tokens

Define these once in `styles/index.css` as CSS variables and use them everywhere. Do not pick
colours ad hoc per component.

```css
:root {
  --color-bg:        #F7F8FA;   /* page background */
  --color-surface:   #FFFFFF;   /* cards, table */
  --color-border:    #E3E7ED;
  --color-text:      #14213A;   /* near-navy, softer than pure black */
  --color-muted:     #667085;
  --color-primary:   #1B4B8F;   /* MCMC-adjacent institutional blue */
  --color-primary-h: #163C73;

  --status-new:         #6B7280;   /* grey  */
  --status-progress:    #C77700;   /* amber */
  --status-resolved:    #157F4B;   /* green */
  --status-closed:      #3F4A5A;   /* slate */

  --radius: 8px;
  --shadow: 0 1px 2px rgba(20, 33, 58, .06), 0 1px 3px rgba(20, 33, 58, .04);
}
```

**Typography:** one family, used well. `Inter` for everything, with a clear scale — page title
24px/600, section heading 16px/600, body 14px/400, meta 12px/400. Tabular numerals for dates and
IDs in the table (`font-variant-numeric: tabular-nums`) so columns align.

**Status colours must be the same everywhere.** Map them once in
`constants/complaintStatus.js` and have `StatusBadge` read from that map. Never hardcode a colour
in a component.

### Responsive behaviour

| Breakpoint | Behaviour |
|---|---|
| ≥1024px | Sidebar expanded, full table, filters inline |
| 768–1023px | Sidebar collapsed to icons, table keeps key columns, filters stack |
| <768px | Sidebar becomes a top bar with a menu; **table becomes stacked cards** |

A table with six columns cannot shrink gracefully. Switching to cards below 768px is the honest
solution and a good thing to have the interviewer notice when they resize the window.

### Non-negotiable quality floor

- Loading, error, and empty states for **every** async view — the brief asks for this explicitly,
  so it will be checked. Use skeleton rows for the table, not a centred spinner.
- Visible keyboard focus rings. Do not remove outlines.
- Every input has a real `<label>`.
- Buttons show a pending state and disable during submit — prevents double submission.
- Error states include a retry action, not just a message.

---

## 9. Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ running locally

### Backend

```bash
cd backend
npm install
cp .env.example .env        # then fill in the values
npm run db:reset            # drop, migrate, seed
npm run dev                 # http://localhost:3000
```

`.env.example`

```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/mcmc_complaints
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev                 # http://localhost:5173
```

`.env.example`

```
VITE_API_BASE_URL=http://localhost:3000/api
```

### Scripts

| Command | Location | Does |
|---|---|---|
| `npm run dev` | both | Dev server with hot reload |
| `npm run db:migrate` | backend | Runs pending migrations |
| `npm run db:seed` | backend | Inserts seed data |
| `npm run db:reset` | backend | Drop → migrate → seed |
| `npm run build` | frontend | Production build |
| `npm run lint` | both | ESLint |

> **Make `db:reset` work reliably.** You will use it right before the demo, and possibly during it.

---

## 10. Build Plan

Roughly one week. Backend first — the frontend has nothing real to consume until the API works.

### Day 1 — Foundation
- Repo, both `package.json` files, ESLint + Prettier, `.gitignore`
- PostgreSQL database created, migrations written and running
- Seed script producing 2 users and 10 complaints
- `Result` helper, `AppError`, central error handler
- Express app booting with a health-check route returning a `Result`

**Done when:** `npm run db:reset` works from clean, and `GET /api/health` returns a wrapped response.

### Day 2 — Auth
- `bcrypt` hashing, `userRepository`
- `POST /api/auth/login` setting the httpOnly cookie
- `authenticate` and `authorize` middleware
- `GET /api/auth/me`, `POST /api/auth/logout`
- Validation on login with field-level errors

**Done when:** you can log in via Postman/curl, hit `/me` with the cookie, and get `401` without it.

### Day 3 — Complaints API
- `complaintRepository`: create, findPaginated (filters + count), findById, update
- `complaintService`: business rules, activity log creation, **transaction** on status change
- All five complaint endpoints, validated
- Admin-only assignment enforced in the service

**Done when:** every endpoint in section 6 works, and a status change creates exactly one log entry.

> Test each endpoint as you build it, not at the end. Save a Postman collection — it is also a
> quick way to prove the API works if the frontend misbehaves during the demo.

### Day 4 — Frontend foundation
- Vite + React + Tailwind, tokens in `index.css`
- `axiosClient` with `withCredentials` and the response interceptor
- `AuthContext`, `useAuth`, `ProtectedRoute`, routing
- `AppShell`, `Sidebar`, `Topbar`
- Login page fully working, including displaying server validation errors

**Done when:** you can log in through the UI, land on a protected page, refresh without being
logged out, and log out.

### Day 5 — List and detail pages
- `ui/` primitives: Button, Input, Select, Badge, Table, Card, Spinner, Pagination
- `feedback/`: LoadingState, ErrorState, EmptyState
- `StatusBadge`, `ComplaintTable`, `ComplaintFilters`
- List page: filters + pagination wired to the API
- Detail page: info card, `ActivityTimeline`, `StatusUpdateForm`
- Admin-only assign form

**Done when:** the full flow works end-to-end against the real API — filter, paginate, open a
complaint, change status with a comment, and see the new entry appear in the timeline.

### Day 6 — Polish
- Responsive pass at 1440 / 1024 / 768 / 375
- Table → cards below 768px
- Every loading / error / empty state verified (stop the backend and click around)
- Keyboard focus, labels, disabled submit states
- Refactor: any component over ~150 lines gets split; delete dead code and stray `console.log`

### Day 7 — Demo readiness
- Fresh clone into a new folder, follow this README exactly, confirm it runs. Fix whatever breaks.
- `npm run db:reset` then walk the full demo once, timed
- Screenshots into `docs/screenshots/` as a fallback if something fails live
- Re-read your own code — you will be asked to explain any part of it
- Write down the three trade-offs from section 11 in your own words

---

## 11. Design Decisions & Trade-offs

The brief says you will be asked to *explain specific implementation decisions and trade-offs*.
For each of these, know the decision, the reason, **and what you gave up**.

| Decision | Why | What it costs |
|---|---|---|
| **httpOnly cookie, not localStorage** | JS cannot read it, so XSS cannot steal the token | Reintroduces CSRF; needs `SameSite` now and a CSRF token in production |
| **No ORM — repository layer with raw SQL** | Full control over the filter + count queries and indexes; no generated SQL to fight | More boilerplate; no automatic migrations; I own the SQL correctness |
| **PostgreSQL over SQLite** | Native enums and proper concurrency; closer to a real deployment | Requires a running service, so setup is heavier than a file |
| **Generic `Result` on every response** | Frontend never guesses a shape; one interceptor, uniform error display | Slightly more verbose; not a compile-time guarantee in plain JS |
| **Layered controller → service → repository** | Each layer is testable and replaceable; obvious where a change goes | More files for a small app — deliberate, for a system meant to grow |
| **Context API, not Redux** | Only auth is global state; server data lives in hooks | Would not scale to heavy shared client state — I would reach for Redux or React Query then |
| **Admin check in the service, not route middleware** | Assignment shares the `PATCH` endpoint with status update, so it is payload-dependent | Authorization is no longer in one obvious place; must be documented |
| **Status change + activity log in one transaction** | The history can never disagree with the record | Slightly more complex repository code |
| **Tailwind over CSS Modules** | Fast, consistent spacing scale, responsive variants built in | Longer class strings in markup |
| **No Docker** | Fewer moving parts for a live local demo | Less reproducible setup — a documented `.env.example` compensates |

### Where you would go next

Have a short, honest answer ready for *"what would you add with more time?"*:

1. **Automated tests** — Jest + Supertest on the service and repository layers, Playwright for the
   critical path. You know this matters; you did not have time to do it properly here.
2. **Refresh tokens** — short-lived access token, longer refresh token, rotation. Right now the
   session is a single 8-hour token.
3. **CSRF tokens** — the natural companion to cookie-based auth.
4. **Rate limiting on login** — nothing currently stops brute force.
5. **Audit trail beyond complaints** — logins and permission changes, since this is a regulator.
6. **Structured logging and observability** — request IDs, error tracking.
7. **TypeScript on the backend** — makes `Result<T>` a real guarantee rather than a convention.

Naming a gap yourself is stronger than being caught out on it.

---

## 12. Interview Preparation

The brief is explicit: **the interview is the assessment.** 60–90 minutes, and you must arrive with
the project running.

### The six things they will do

1. **Demo the working application live** from your machine, via screen share
2. **Walk through the architecture**, folder structure, and code
3. **Explain implementation decisions and trade-offs**
4. **Make a live modification** to a new requirement they give you
5. **Debug an issue they introduce**
6. **Answer questions about extending the system**

### Before the call

- Both servers running, database seeded, browser tabs open: app, editor, terminal
- Close everything unrelated. Clean desktop, notifications off
- Editor font size up — they need to read your code over a screen share
- Have `docs/screenshots/` open in a tab as a fallback
- Test your screen share and audio in advance

### Demo script — about 5 minutes, rehearsed

1. One sentence of context: what the system does and who uses it
2. Log in as **officer** — show the list, filter by status, filter by category, paginate
3. Open a complaint — point at the activity timeline
4. Change the status with a comment — show the new timeline entry appear
5. Point out that the assign control is **not visible** to an officer
6. Log out, log in as **admin** — the assign control is now there. Assign a complaint
7. Resize the window to tablet, then phone width
8. Optional: stop the backend, reload, show the error state handling gracefully

Then stop and let them drive. Do not narrate every file unprompted.

### Likely live modifications — think through these now

Each of these should be a short, confident edit if the structure holds. Trace the file path for each
one in advance:

- **Add a new status or category** → constants (both sides) + migration/enum + badge colour map
- **Add a search box** on complainant name → validator, repository `WHERE`, hook, filter component
- **Make a field required** → validator schema + form error display
- **Add a column** to the table → repository select, ComplaintTable
- **Change page size** → pagination default
- **Sort by a different column** → query param whitelist, repository `ORDER BY`, table header
- **Restrict officers to only their assigned complaints** → service-level filter on `req.user`
- **Add a "reopen" action** on closed complaints → service rule + a button

> If your enums are centralised and your layers are clean, most of these are 3–4 file edits. That
> is the payoff of section 4, and saying so out loud is the right move: *"this is why I structured
> it this way."*

### When they introduce a bug

Do not start guessing. Narrate a method — they are watching how you think, not how fast you fix it.

1. **Reproduce it.** What exactly is the wrong behaviour?
2. **Locate the layer.** Is the network request even firing? Check the Network tab. Wrong response
   from the server, or right response rendered wrong? That single question halves the search space.
3. **Narrow down.** Backend → is it the route, middleware, service, or SQL? Frontend → is the state
   wrong, or the render?
4. **Form one hypothesis, test it, discard it if wrong.** Say the hypothesis out loud.
5. **Fix, then verify** the original reproduction passes.
6. **Say what you would add** so it could not recur — a validation, a test, a guard.

Common places they will plant something: the CORS/`withCredentials` pair, the JWT verify step, a
filter dropped from the SQL `WHERE`, the pagination offset arithmetic, a missing `await`, the
activity log outside the transaction, or a stale dependency array in `useEffect`.

If you get stuck: **think out loud.** Silence reads as panic; reasoning reads as competence.
"I expected X here and I am seeing Y, so the problem is somewhere between A and B" is a good thing
to be heard saying.

### Extension questions — have a first sentence ready

| Question | Your opening |
|---|---|
| *Scale to 100,000 complaints?* | Indexes on the filter columns are already there; add keyset pagination instead of `OFFSET`, then a read replica for reporting |
| *Public submission portal?* | Separate unauthenticated route with rate limiting, CAPTCHA, and stricter validation — public input is untrusted input |
| *File attachments?* | Object storage, not the database; store a reference; validate type and size; scan before serving |
| *Email or SMS notifications?* | Queue-based, not inline — the request should not wait on a third party. I have done this with Azure Queue Storage |
| *Full-text search?* | PostgreSQL `tsvector` with a GIN index first; only reach for Elasticsearch when that stops being enough |
| *Audit requirements?* | The activity log is the foundation; extend to an append-only audit table covering logins and permission changes |
| *Multiple agencies or divisions?* | Add an organisation dimension and scope every query by it — the security risk is a missed `WHERE`, so it belongs in the repository layer, not each service |

### Your genuine advantages here — use them

- You have built and shipped a system that submits directly to a **government regulator's API**
  (IRAS e-Filing). Very few candidates for this role will have touched a government integration.
- You have done **queue-based background processing** in production. When notifications or bulk
  operations come up, that is real experience, not theory.
- You have built **role-based access with SSO** on a real platform.
- You have **owned an entire platform solo**, architecture upward.

Where a decision in this project mirrors something you have done in production, say so. It turns an
assessment answer into evidence.

---

## Progress

- [ ] Day 1 — Foundation
- [ ] Day 2 — Auth
- [ ] Day 3 — Complaints API
- [ ] Day 4 — Frontend foundation
- [ ] Day 5 — List and detail pages
- [ ] Day 6 — Polish
- [ ] Day 7 — Demo readiness
