# SETUP.md — Local Development Setup

Complete, end-to-end instructions for getting the **MCMC Complaint Management System (Mini)**
running on a local machine.

This document covers two paths:

| You are… | Read |
|---|---|
| Setting up your machine for the first time | **Part 1** (tools) |
| Creating this project from scratch | **Part 1**, then **Part 2** |
| Cloning an existing repo to run it | **Part 1**, then **Part 3** |

Everything is written for Windows, macOS, and Linux. Pick your OS section and skip the rest.

---

## Table of Contents

**Part 1 — Machine Prerequisites**
- [1.1 What you need](#11-what-you-need)
- [1.2 Install Git](#12-install-git)
- [1.3 Install Node.js](#13-install-nodejs)
- [1.4 Install PostgreSQL](#14-install-postgresql)
- [1.5 Install VS Code](#15-install-vs-code)
- [1.6 VS Code extensions](#16-vs-code-extensions)
- [1.7 Optional tools](#17-optional-tools)

**Part 2 — Creating the Project from Scratch**
- [2.1 Repository skeleton](#21-repository-skeleton)
- [2.2 Create the database](#22-create-the-database)
- [2.3 Backend scaffolding](#23-backend-scaffolding)
- [2.4 Frontend scaffolding](#24-frontend-scaffolding)
- [2.5 VS Code workspace configuration](#25-vs-code-workspace-configuration)
- [2.6 Debugging configuration](#26-debugging-configuration)

**Part 3 — Running an Existing Clone**
- [3.1 Clone and install](#31-clone-and-install)
- [3.2 Environment variables](#32-environment-variables)
- [3.3 Database setup](#33-database-setup)
- [3.4 Start both servers](#34-start-both-servers)

**Part 4 — Verification & Troubleshooting**
- [4.1 Verification checklist](#41-verification-checklist)
- [4.2 Troubleshooting](#42-troubleshooting)
- [4.3 Useful commands](#43-useful-commands)

---

# Part 1 — Machine Prerequisites

## 1.1 What you need

| Tool | Minimum version | Purpose |
|---|---|---|
| Git | 2.40+ | Version control |
| Node.js | 22 LTS or newer | Backend runtime + frontend tooling |
| npm | 10+ | Comes bundled with Node.js |
| PostgreSQL | 16+ | Database |
| VS Code | Latest | Editor |

**Disk space:** roughly 2 GB for all tools plus `node_modules`.

> **A note on versions:** the exact latest versions will have moved on since this was written.
> Any current LTS Node and any PostgreSQL 16+ will work fine. Where a *specific* version matters,
> it is called out explicitly — and there are two places where it genuinely does
> (see [2.3](#23-backend-scaffolding) and [2.4](#24-frontend-scaffolding)).

---

## 1.2 Install Git

### Windows

1. Download from [git-scm.com/download/win](https://git-scm.com/download/win)
2. Run the installer. The defaults are fine, with one recommendation:
   - **"Adjusting your PATH environment"** → *Git from the command line and also from 3rd-party software*
3. Verify:

```bash
git --version
```

### macOS

Git ships with the Xcode Command Line Tools:

```bash
xcode-select --install
git --version
```

Or via Homebrew (if you have it): `brew install git`

### Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install git -y
git --version
```

### First-time Git configuration (all platforms)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
```

---

## 1.3 Install Node.js

You have two options. **A version manager is strongly recommended** — it lets you switch Node
versions per project instead of reinstalling.

### Option A — Version manager (recommended)

**Windows — nvm-windows**

1. Download `nvm-setup.exe` from [github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases)
2. Run the installer
3. **Open a new terminal** (PATH changes need a fresh shell), then:

```bash
nvm install lts
nvm use lts
```

**macOS / Linux — nvm**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

Close and reopen your terminal, then:

```bash
nvm install --lts
nvm use --lts
nvm alias default lts/*
```

### Option B — Direct installer

Download the **LTS** build from [nodejs.org](https://nodejs.org) and run it.
On Windows, tick *"Automatically install the necessary tools"* if offered.

### Verify

```bash
node --version    # v22.x.x or newer
npm --version     # 10.x.x or newer
```

### Windows only — PowerShell execution policy

If `npm` commands fail with *"running scripts is disabled on this system"*, open PowerShell **as
Administrator** and run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 1.4 Install PostgreSQL

### Windows

1. Download the installer from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
   (the EDB installer)
2. Run it. During setup:
   - **Components:** keep *PostgreSQL Server*, *pgAdmin 4*, and *Command Line Tools*. StackBuilder
     is not needed.
   - **Password:** set a password for the `postgres` superuser. **Write it down** — you need it in
     your `.env`.
   - **Port:** leave at `5432`
   - **Locale:** default
3. **Add `psql` to your PATH** (the installer does not always do this):
   - Search *"Environment Variables"* → *Edit the system environment variables* → *Environment Variables*
   - Under *System variables*, select `Path` → *Edit* → *New*
   - Add: `C:\Program Files\PostgreSQL\17\bin` (adjust the version number to match your install)
   - **Open a new terminal** afterwards

### macOS

**Option A — Postgres.app (easiest)**

1. Download from [postgresapp.com](https://postgresapp.com)
2. Drag to Applications, open it, click **Initialize**
3. Add the CLI tools to your PATH:

```bash
sudo mkdir -p /etc/paths.d && \
  echo /Applications/Postgres.app/Contents/Versions/latest/bin | sudo tee /etc/paths.d/postgresapp
```

Open a new terminal afterwards.

**Option B — Homebrew**

```bash
brew install postgresql@17
brew services start postgresql@17
echo 'export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Set a password for the `postgres` role:

```bash
sudo -u postgres psql
```

```sql
ALTER USER postgres WITH PASSWORD 'your_password_here';
\q
```

### Verify (all platforms)

```bash
psql --version
```

Then confirm you can actually connect:

```bash
# Windows / macOS (Postgres.app or EDB)
psql -U postgres -c "SELECT version();"

# Linux
sudo -u postgres psql -c "SELECT version();"
```

If you are prompted for a password, use the one you set during installation.

---

## 1.5 Install VS Code

### Windows

1. Download from [code.visualstudio.com](https://code.visualstudio.com)
2. Run the installer. **Tick these options** — they make daily work much easier:
   - ✅ *Add "Open with Code" action to Windows Explorer file context menu*
   - ✅ *Add "Open with Code" action to Windows Explorer directory context menu*
   - ✅ *Register Code as an editor for supported file types*
   - ✅ *Add to PATH*

### macOS

1. Download the `.zip` from [code.visualstudio.com](https://code.visualstudio.com)
2. Unzip and drag **Visual Studio Code.app** into `/Applications`
3. Enable the `code` terminal command: open VS Code, press `Cmd+Shift+P`, run
   **Shell Command: Install 'code' command in PATH**

Or via Homebrew: `brew install --cask visual-studio-code`

### Linux (Debian/Ubuntu)

```bash
sudo apt install wget gpg -y
wget -qO- https://packages.microsoft.com/keys/microsoft.asc \
  | gpg --dearmor > packages.microsoft.gpg
sudo install -D -o root -g root -m 644 packages.microsoft.gpg \
  /etc/apt/keyrings/packages.microsoft.gpg
echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/packages.microsoft.gpg] \
https://packages.microsoft.com/repos/code stable main" \
  | sudo tee /etc/apt/sources.list.d/vscode.list
rm -f packages.microsoft.gpg
sudo apt update && sudo apt install code -y
```

### Verify

```bash
code --version
```

You can now open any folder with `code .` from its directory.

---

## 1.6 VS Code extensions

### Install them all in one command

Run this from any terminal after VS Code is installed:

```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
code --install-extension usernamehw.errorlens
code --install-extension mikestead.dotenv
code --install-extension rangav.vscode-thunder-client
code --install-extension ms-ossdata.vscode-pgsql
code --install-extension eamodio.gitlens
code --install-extension yzhang.markdown-all-in-one
```

### What each one is for

| Extension | Why you want it |
|---|---|
| **ESLint** | Shows lint errors inline as you type |
| **Prettier** | Formats on save — no more arguing with yourself about spacing |
| **Tailwind CSS IntelliSense** | Autocompletes class names and shows the resolved CSS on hover. Near-essential with Tailwind |
| **ES7+ React Snippets** | `rafce` + Tab scaffolds a whole component |
| **Auto Rename Tag** | Rename `<div>` and the closing tag follows |
| **Path Intellisense** | Autocompletes file paths in imports |
| **Error Lens** | Prints the error message *on* the line instead of hiding it in the Problems panel |
| **DotENV** | Syntax highlighting for `.env` files |
| **Thunder Client** | A Postman-like API client **inside VS Code**. Test endpoints without leaving the editor |
| **PostgreSQL** | Browse tables and run queries from the sidebar |
| **GitLens** | See who changed a line and when |
| **Markdown All in One** | Live preview for this file and the README |

> **Two of these matter more than the rest for this project.** *Thunder Client* means you can build
> and verify the API before any frontend exists. *Error Lens* means you will actually notice
> mistakes instead of scrolling past them.

---

## 1.7 Optional tools

| Tool | Why | Where |
|---|---|---|
| **pgAdmin 4** | Visual database browser. Bundled with the Windows PostgreSQL installer | [pgadmin.org](https://www.pgadmin.org) |
| **DBeaver** | Better cross-platform DB client than pgAdmin | [dbeaver.io](https://dbeaver.io) |
| **Postman** | Standalone API client, if you prefer it to Thunder Client | [postman.com](https://www.postman.com) |
| **Windows Terminal** | Much nicer than `cmd.exe`. Free on the Microsoft Store | Microsoft Store |

None of these are required. Thunder Client and the VS Code PostgreSQL extension cover the same
ground from inside the editor.

---

# Part 2 — Creating the Project from Scratch

Follow this part if the project does not exist yet. If you are cloning an existing repository,
skip to [Part 3](#part-3--running-an-existing-clone).

## 2.1 Repository skeleton

```bash
mkdir mcmc-complaint-system
cd mcmc-complaint-system
git init
mkdir backend frontend docs
mkdir docs/screenshots
```

Create the root `.gitignore`:

```bash
cat > .gitignore << 'EOF'
# dependencies
node_modules/

# environment — never commit real secrets
.env
.env.local
.env.*.local

# build output
dist/
build/

# logs
*.log
npm-debug.log*

# editor / OS
.DS_Store
Thumbs.db
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
!.vscode/launch.json
EOF
```

> The `!.vscode/...` lines are deliberate: workspace settings, the recommended-extensions list, and
> debug configs **should** be committed so every developer gets the same setup. Personal
> preferences do not belong there.

**Windows note:** the `cat > file << 'EOF'` syntax works in Git Bash, WSL, macOS, and Linux. In
PowerShell, create the file through VS Code instead.

Open the project:

```bash
code .
```

---

## 2.2 Create the database

Connect to PostgreSQL:

```bash
# Windows / macOS
psql -U postgres

# Linux
sudo -u postgres psql
```

Then run:
```sql
CREATE DATABASE mcmc_complaints;

CREATE USER mcmc_dev_cms WITH PASSWORD 'mcmc@dev@cms';

GRANT ALL PRIVILEGES ON DATABASE mcmc_complaints TO mcmc_dev_cms;

-- Connect to the new database to grant schema privileges
\c mcmc_complaints

GRANT ALL ON SCHEMA public TO mcmc_dev_cms;

\q
```

> ### ⚠️ The PostgreSQL 15+ gotcha
>
> Those last two lines are not optional. Since PostgreSQL 15, `GRANT ALL PRIVILEGES ON DATABASE`
> **no longer** lets a user create tables — the `public` schema stopped granting `CREATE` to
> everyone by default. Without `GRANT ALL ON SCHEMA public`, your migrations will fail with
> *"permission denied for schema public"* and the cause is not obvious.

Verify the connection works with the new user:

```bash
psql -U mcmc_dev_cms -d mcmc_complaints -c "SELECT current_user, current_database();"
```

---

## 2.3 Backend scaffolding

```bash
cd backend
npm init -y
```

### Install dependencies

```bash
npm install express@^4.21.2 cors cookie-parser dotenv pg jsonwebtoken bcryptjs zod
npm install -D nodemon eslint prettier
```

> ### ⚠️ Two deliberate choices here — do not "fix" them
>
> **`express@^4.21.2` is pinned on purpose.** Plain `npm install express` now installs Express 5,
> which changed route-matching syntax (`app.get('*')` no longer works the same way) and altered some
> middleware behaviour. Express 4 is battle-tested and every tutorial and Stack Overflow answer you
> find will match it. On a deadline, that matters more than being current.
>
> **`bcryptjs`, not `bcrypt`.** The `bcrypt` package is a native module that compiles on install —
> on Windows it frequently fails unless you have Visual Studio build tools set up. `bcryptjs` is
> pure JavaScript with an identical API. It is marginally slower, which is irrelevant here.
> If asked about it in an interview: *"bcryptjs avoids a native build dependency; for a production
> service under real load I would benchmark native bcrypt or Argon2."*

### Enable ES modules

Open `backend/package.json` and add `"type": "module"`, then replace the `scripts` block:

```json
{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "db:migrate": "node src/db/migrate.js",
    "db:seed": "node src/db/seeds/seed.js",
    "db:reset": "node src/db/reset.js",
    "lint": "eslint src"
  }
}
```

> **ESM gotcha:** with `"type": "module"`, relative imports **must include the file extension**.
> `import Result from './utils/result.js'` works; `'./utils/result'` throws
> `ERR_MODULE_NOT_FOUND`. This catches everyone once.

### Create the folder structure

```bash
mkdir -p src/{config,constants,db/{migrations,seeds},repositories,services,controllers,routes,middlewares,validators,utils}
```

**Windows PowerShell equivalent:**

```powershell
"config","constants","db/migrations","db/seeds","repositories","services","controllers","routes","middlewares","validators","utils" | ForEach-Object { New-Item -ItemType Directory -Force -Path "src/$_" }
```

### Create `.env.example` and `.env`

`backend/.env.example` — **this gets committed**:

```
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://mcmc_dev_cms:your_password@localhost:5432/mcmc_complaints

JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=8h

CORS_ORIGIN=http://localhost:5173
```

Then create your real `.env` — **this stays out of Git**:

```bash
cp .env.example .env
```

Generate a real JWT secret rather than typing one:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Paste the output into `JWT_SECRET` in `.env`, and set `DATABASE_URL` to the password you chose in
[2.2](#22-create-the-database).

### Smoke-test the setup

Create `src/server.js` temporarily to prove the pieces work:

```js
import 'dotenv/config';
import express from 'express';
import pg from 'pg';

const app = express();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

app.get('/api/health', async (req, res) => {
  const { rows } = await pool.query('SELECT NOW() AS now');
  res.json({
    success: true,
    message: 'Backend is running',
    data: { db_time: rows[0].now },
  });
});

app.listen(process.env.PORT, () =>
  console.log(`API listening on http://localhost:${process.env.PORT}`)
);
```

Run it:

```bash
npm run dev
```

Visit `http://localhost:3000/api/health`. You should see a JSON response containing a database
timestamp. **If you see that, your Node install, your `.env`, and your PostgreSQL connection are
all correct** — which is the whole point of this step.

Stop the server with `Ctrl+C`.

---

## 2.4 Frontend scaffolding

From the repository root:

```bash
cd frontend
npm create vite@latest . -- --template react
npm install
```

When prompted about the non-empty directory, choose to continue (the folder only exists, it has no
files yet).

### Install dependencies

```bash
npm install axios react-router-dom lucide-react clsx
npm install -D tailwindcss@^3.4.17 postcss autoprefixer
```

> ### ⚠️ Tailwind v3 is pinned on purpose
>
> Plain `npm install tailwindcss` installs **v4**, which has a completely different setup: no
> `tailwind.config.js`, a `@tailwindcss/vite` plugin instead of PostCSS, and CSS-first configuration
> via `@theme`. It is good, but it is different — every guide, Stack Overflow answer, and component
> snippet you find will assume v3, and the config file this project's structure expects does not
> exist in v4.
>
> **For a project with a deadline and a live code walkthrough at the end of it, pick the boring
> option.** If you want v4 instead, that is a legitimate choice — just know you are opting into
> less matching documentation.

### Initialise Tailwind

```bash
npx tailwindcss init -p
```

This creates `tailwind.config.js` and `postcss.config.js`. Replace the contents of
`tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

### Set up the stylesheet

```bash
mkdir -p src/styles
rm src/App.css src/index.css
```

Create `src/styles/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg:        #F7F8FA;
  --color-surface:   #FFFFFF;
  --color-border:    #E3E7ED;
  --color-text:      #14213A;
  --color-muted:     #667085;
  --color-primary:   #1B4B8F;
  --color-primary-h: #163C73;

  --status-new:      #6B7280;
  --status-progress: #C77700;
  --status-resolved: #157F4B;
  --status-closed:   #3F4A5A;

  --radius: 8px;
  --shadow: 0 1px 2px rgba(20, 33, 58, .06), 0 1px 3px rgba(20, 33, 58, .04);
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: 'Inter', system-ui, sans-serif;
}

/* Tabular numerals keep table columns aligned */
.tabular {
  font-variant-numeric: tabular-nums;
}
```

Update `src/main.jsx` to import it:

```jsx
import './styles/index.css';
```

Add the Inter font to `index.html`, inside `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Create the folder structure

```bash
mkdir -p src/{api,components/{ui,feedback,layout,complaints},constants,context,hooks,pages,routes,utils}
```

**Windows PowerShell:**

```powershell
"api","components/ui","components/feedback","components/layout","components/complaints","constants","context","hooks","pages","routes","utils" | ForEach-Object { New-Item -ItemType Directory -Force -Path "src/$_" }
```

### Configure the dev server

Replace `frontend/vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,   // fail loudly instead of silently using another port
  },
});
```

> `strictPort: true` matters. If Vite quietly starts on `5174` because `5173` is taken, your
> backend's `CORS_ORIGIN` no longer matches and cookies stop working — with a confusing error.
> Better to fail immediately.

### Create `.env.example` and `.env`

`frontend/.env.example`:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

```bash
cp .env.example .env
```

> Vite only exposes variables prefixed `VITE_` to the browser. Anything without that prefix is
> invisible to your frontend code — which is a safety feature, not a bug.

### Verify

```bash
npm run dev
```

Visit `http://localhost:5173`. To confirm Tailwind is wired up, replace the contents of
`src/App.jsx`:

```jsx
export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-semibold text-[--color-primary]">
        Tailwind is working
      </h1>
    </div>
  );
}
```

If the text is centred, blue, and semibold, the frontend toolchain is correct.

---

## 2.5 VS Code workspace configuration

Because the backend and frontend are separate npm projects in one repository, a **multi-root
workspace** gives you one window with both, and lets ESLint resolve each project's own config.

Create `ComplaintManagementSystem.code-workspace` in the repository root:

```json
{
  "folders": [
    { "name": "backend", "path": "backend" },
    { "name": "frontend", "path": "frontend" },
    { "name": "root", "path": "." }
  ],
  "settings": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    },
    "editor.tabSize": 2,
    "editor.rulers": [100],
    "files.eol": "\n",
    "files.trimTrailingWhitespace": true,
    "files.insertFinalNewline": true,
    "emmet.includeLanguages": { "javascript": "javascriptreact" },
    "tailwindCSS.includeLanguages": { "javascript": "javascript" },
    "eslint.workingDirectories": [
      { "mode": "auto" }
    ],
    "search.exclude": {
      "**/node_modules": true,
      "**/dist": true
    }
  }
}
```

From then on, open the project with **File → Open Workspace from File**, or:

```bash
code ComplaintManagementSystem.code-workspace
```

> **`files.eol: "\n"`** matters on Windows. Without it, Git shows every file as modified due to
> line-ending differences, which makes diffs unreadable.

### Recommended extensions for the repo

Create `.vscode/extensions.json`. Anyone who opens the project gets prompted to install these:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "usernamehw.errorlens",
    "mikestead.dotenv",
    "rangav.vscode-thunder-client",
    "ms-ossdata.vscode-pgsql"
  ]
}
```

### Prettier configuration

Create `.prettierrc` in the repository root:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

---

## 2.6 Debugging configuration

**Do not skip this section.** Being able to set a breakpoint and step through code is worth far
more than scattering `console.log` statements — and if you are ever asked to debug something live
in front of someone, doing it properly with a debugger is a different level of credibility.

Create `.vscode/launch.json` in the repository root:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Frontend (Chrome)",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend/src"
    }
  ],
  "compounds": [
    {
      "name": "Debug Full Stack",
      "configurations": ["Debug Backend", "Debug Frontend (Chrome)"]
    }
  ]
}
```

### How to use it

1. Open the **Run and Debug** panel (`Ctrl+Shift+D` / `Cmd+Shift+D`)
2. Pick **Debug Full Stack** from the dropdown
3. Press `F5`

Both servers start with debuggers attached. Click in the gutter left of any line number to set a
breakpoint — in a controller, a service, a React component, anywhere. When execution pauses you can
inspect every variable in scope.

| Key | Action |
|---|---|
| `F5` | Start / continue |
| `F9` | Toggle breakpoint |
| `F10` | Step over |
| `F11` | Step into |
| `Shift+F11` | Step out |
| `Shift+F5` | Stop |

---

# Part 3 — Running an Existing Clone

For a developer setting up a repository that already exists. Complete
[Part 1](#part-1--machine-prerequisites) first.

## 3.1 Clone and install

```bash
git clone <repository-url>
cd mcmc-complaint-system

cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

## 3.2 Environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Now **edit `backend/.env`** — the example file has placeholders, not working values:

| Variable | Set it to |
|---|---|
| `DATABASE_URL` | Your local PostgreSQL credentials (see 3.3) |
| `JWT_SECRET` | Any long random string. Generate one with the command below |
| `CORS_ORIGIN` | `http://localhost:5173` unless you changed the Vite port |

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`frontend/.env` usually needs no changes.

## 3.3 Database setup

Create the database and user (see [2.2](#22-create-the-database) for the full explanation,
including the PostgreSQL 15+ schema-grant requirement):

```bash
psql -U postgres
```

```sql
CREATE DATABASE mcmc_complaints;
CREATE USER mcmc_dev_cms WITH PASSWORD 'mcmc@dev@cms';
GRANT ALL PRIVILEGES ON DATABASE mcmc_complaints TO mcmc_dev_cms;
\c mcmc_complaints
GRANT ALL ON SCHEMA public TO mcmc_dev_cms;
\q
```

Then run migrations and seed data:

```bash
cd backend
npm run db:reset
```

This drops existing tables, recreates the schema, and inserts seed data — 2 users and 10
complaints.

**Seeded login credentials:**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@mcmc.gov.my` | `Admin@123` |
| Officer | `officer@mcmc.gov.my` | `Officer@123` |

## 3.4 Start both servers

You need **two terminals** running at once. In VS Code, split the terminal with the `+` button or
`Ctrl+Shift+5`.

**Terminal 1 — backend:**

```bash
cd backend
npm run dev
```

Expect: `API listening on http://localhost:3000`

**Terminal 2 — frontend:**

```bash
cd frontend
npm run dev
```

Expect: `Local: http://localhost:5173`

Open `http://localhost:5173` and log in with the credentials above.

> Or press `F5` with **Debug Full Stack** selected and both start together, with debuggers attached.

---

# Part 4 — Verification & Troubleshooting

## 4.1 Verification checklist

Work through this in order. Each step depends on the previous one, so the **first** failure is
the real problem.

**Tooling**
- [ ] `node --version` → v22+
- [ ] `npm --version` → 10+
- [ ] `git --version` → 2.40+
- [ ] `psql --version` → 16+
- [ ] `code --version` → any

**Database**
- [ ] `psql -U mcmc_dev_cms -d mcmc_complaints -c "SELECT 1;"` connects without error
- [ ] `npm run db:reset` completes with no errors
- [ ] `psql -U mcmc_dev_cms -d mcmc_complaints -c "SELECT COUNT(*) FROM complaints;"` returns 10
- [ ] `psql -U mcmc_dev_cms -d mcmc_complaints -c "SELECT COUNT(*) FROM users;"` returns 2

**Backend**
- [ ] `npm run dev` starts with no errors
- [ ] `GET http://localhost:3000/api/health` returns a wrapped JSON response
- [ ] `POST /api/auth/login` with the admin credentials returns `success: true`
- [ ] That same response includes a `Set-Cookie` header containing `HttpOnly`
- [ ] `GET /api/complaints` **without** a cookie returns `401`
- [ ] `GET /api/complaints` **with** the cookie returns paginated data

**Frontend**
- [ ] `npm run dev` starts on port 5173
- [ ] The login page renders with Tailwind styling applied
- [ ] Logging in redirects to the complaint list
- [ ] Refreshing the page keeps you logged in *(this proves the cookie is working)*
- [ ] Navigating to a protected route while logged out redirects to `/login`
- [ ] Filters and pagination change the data shown
- [ ] Opening a complaint shows its activity timeline
- [ ] Updating a status with a comment adds a new timeline entry
- [ ] Stopping the backend and reloading shows an error state, not a blank page

**Environment hygiene**
- [ ] `git status` does **not** list `.env` or `node_modules/`
- [ ] `.env.example` **is** tracked, with placeholder values only

---

## 4.2 Troubleshooting

### Database

| Symptom | Cause | Fix |
|---|---|---|
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL is not running | Windows: start the `postgresql-x64-17` service in Services. macOS: open Postgres.app, or `brew services start postgresql@17`. Linux: `sudo systemctl start postgresql` |
| `password authentication failed for user "mcmc_dev_cms"` | Password in `DATABASE_URL` does not match | Re-check `.env`. If unsure: `ALTER USER mcmc_dev_cms WITH PASSWORD 'mcmc@dev@cms';` then update `.env` |
| `permission denied for schema public` | **The PostgreSQL 15+ issue** | `\c mcmc_complaints` then `GRANT ALL ON SCHEMA public TO mcmc_dev_cms;` |
| `database "mcmc_complaints" does not exist` | Never created | See [2.2](#22-create-the-database) |
| `psql: command not found` | Not on PATH | Windows: add `C:\Program Files\PostgreSQL\17\bin` to PATH and open a new terminal. macOS: see [1.4](#14-install-postgresql) |
| `relation "complaints" does not exist` | Migrations never ran | `npm run db:reset` |

### Authentication and CORS

This is where most time gets lost. Work down the list in order.

| Symptom | Cause | Fix |
|---|---|---|
| Browser console: *"blocked by CORS policy"* | `CORS_ORIGIN` does not exactly match the frontend origin | It must be `http://localhost:5173` — no trailing slash, correct port, `http` not `https` |
| Login returns 200 but you are immediately logged out | Cookie not being sent back | Check **all three**: `credentials: true` in the backend CORS options, `withCredentials: true` on the Axios instance, and that `CORS_ORIGIN` is a specific origin and **not** `*` |
| Cookie visible in DevTools but never sent | `secure: true` while on `http://localhost` | `secure` must be `false` in development. Gate it on `NODE_ENV === 'production'` |
| Every request returns `401` | `JWT_SECRET` changed after the token was issued | Log in again to get a fresh token |
| `JsonWebTokenError: invalid signature` | Backend restarted with a different `JWT_SECRET` | Set a fixed secret in `.env` — don't generate one at runtime |
| Works in Postman, fails in the browser | Postman ignores CORS entirely | The bug is real; it is a CORS or cookie configuration problem. Trust the browser |

> **The one-minute CORS + cookie check.** Open DevTools → Network → the login request.
> Look at the **Response Headers** for `Set-Cookie` — if it is absent, the problem is the backend.
> If it is present, check the *next* request's **Request Headers** for `Cookie` — if that is absent,
> the problem is `withCredentials` or the `secure` flag. This narrows it in two clicks instead of
> twenty minutes of guessing.

### Node and npm

| Symptom | Cause | Fix |
|---|---|---|
| `ERR_MODULE_NOT_FOUND` on a relative import | ESM requires file extensions | `import x from './utils/result.js'` — add the `.js` |
| `Cannot use import statement outside a module` | Missing `"type": "module"` | Add it to `backend/package.json` |
| `EADDRINUSE :::3000` | Port already in use | Find and kill it — see [4.3](#43-useful-commands) — or change `PORT` in `.env` |
| `running scripts is disabled on this system` (Windows) | PowerShell execution policy | `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` as Administrator |
| `gyp ERR!` during install | A native module is trying to compile | You are installing `bcrypt` instead of `bcryptjs`. Switch to `bcryptjs` |
| Strange errors after switching branches | Stale `node_modules` | `rm -rf node_modules package-lock.json && npm install` |

### Frontend

| Symptom | Cause | Fix |
|---|---|---|
| Tailwind classes have no effect | `content` paths wrong, or the CSS isn't imported | Check `content` in `tailwind.config.js` covers `./src/**/*.{js,jsx}`, and that `main.jsx` imports `./styles/index.css` |
| Tailwind IntelliSense not autocompleting | Extension can't find the config | The config must be at the root of the `frontend` folder. Reload the VS Code window |
| `import.meta.env.VITE_API_BASE_URL` is `undefined` | Missing prefix, or server not restarted | The variable must start with `VITE_`, and Vite must be restarted after editing `.env` |
| Vite started on port 5174 | 5173 was taken | With `strictPort: true` it fails instead — kill whatever holds 5173 |
| Blank page, no errors | A render-time crash | Check the browser console, not the terminal |

### VS Code

| Symptom | Fix |
|---|---|
| ESLint not reporting anything | Open the **Output** panel → select *ESLint* from the dropdown → read the actual error |
| Prettier not formatting on save | Confirm `editor.defaultFormatter` is `esbenp.prettier-vscode` and Prettier is not disabled for the workspace |
| Debugger won't attach | Confirm `cwd` in `launch.json` points at the right folder, and the port is free |
| `code .` not recognised | Windows: reinstall with *Add to PATH* ticked. macOS: run **Shell Command: Install 'code' command in PATH** |

---

## 4.3 Useful commands

### Free a stuck port

```bash
# macOS / Linux
lsof -ti:3000 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Database

```bash
# Full reset — drop, migrate, seed
cd backend && npm run db:reset

# Open a SQL shell
psql -U mcmc_dev_cms -d mcmc_complaints

# List tables
psql -U mcmc_dev_cms -d mcmc_complaints -c "\dt"

# Inspect a table's structure
psql -U mcmc_dev_cms -d mcmc_complaints -c "\d complaints"

# Quick row counts
psql -U mcmc_dev_cms -d mcmc_complaints -c "SELECT status, COUNT(*) FROM complaints GROUP BY status;"
```

Useful `psql` commands once you are inside:

| Command | Does |
|---|---|
| `\l` | List databases |
| `\dt` | List tables |
| `\d table_name` | Describe a table |
| `\du` | List users and roles |
| `\c dbname` | Connect to a different database |
| `\x` | Toggle expanded output — much easier to read wide rows |
| `\q` | Quit |

### Reset dependencies

```bash
# macOS / Linux
rm -rf node_modules package-lock.json && npm install

# Windows (PowerShell)
Remove-Item -Recurse -Force node_modules, package-lock.json; npm install
```

### Test the API from the terminal

```bash
# Log in and save the cookie to a file
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mcmc.gov.my","password":"Admin@123"}'

# Reuse the cookie on a protected route
curl -b cookies.txt http://localhost:3000/api/complaints
```

If the second command returns data, cookie-based auth is working end to end.

---

## Setting up on a new machine — the short version

Once everything is committed, the whole process on a fresh machine is:

```bash
# 1. Install Node 22+, PostgreSQL 16+, Git, VS Code   (Part 1)

# 2. Clone
git clone <repository-url> && cd mcmc-complaint-system

# 3. Install
cd backend && npm install && cd ../frontend && npm install && cd ..

# 4. Configure
cp backend/.env.example backend/.env      # then edit DATABASE_URL and JWT_SECRET
cp frontend/.env.example frontend/.env

# 5. Database
psql -U postgres -c "CREATE DATABASE mcmc_complaints;"
# ...create the user and grant schema privileges — see 2.2
cd backend && npm run db:reset

# 6. Run
npm run dev                 # terminal 1
cd ../frontend && npm run dev   # terminal 2
```

Then open `http://localhost:5173`.

---

## Before you commit — a short checklist

- [ ] `.env` is **not** tracked (`git status` confirms it)
- [ ] `.env.example` **is** tracked, containing placeholders only
- [ ] No real passwords, secrets, or connection strings anywhere in tracked files
- [ ] `node_modules/` is ignored
- [ ] A fresh clone into a new folder, following this document, actually runs

> That last one is the only real test of this document. Do it once before you rely on it —
> preferably not on the day you need it to work.
