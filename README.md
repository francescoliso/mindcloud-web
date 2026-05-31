# MindCloud

A small, private web app for mental wellbeing. It has three features:

- **🎙️ Journal** — write free-form journal entries (text). History is kept.
- **🙏 Gratitude** — record three things you're grateful for, **once per day**. After you complete a day it locks (read-only) and is saved to history.
- **📊 Weekly Reports** — generate a warm, AI-written reflection (via Claude) on the week's journal + gratitude.

It started life as a native macOS (SwiftUI) app and was rewritten as a web app deployed on Vercel. Voice journaling from the original app was dropped for v1 (browsers have no on-device speech equivalent); the journal is text-only for now.

---

## How it works (the big picture)

```
Browser  ──►  Next.js app on Vercel  ──►  PostgreSQL (Neon)
                     │
                     └──►  Anthropic API (Claude Haiku)  ← only for weekly reports
```

- The **Next.js app** serves the UI *and* contains the server logic — there is no separate backend.
- Reads happen in **Server Components** (the server queries the database and renders HTML).
- Writes happen through **Server Actions** (form submissions that run on the server).
- The **database** stores users and their entries.
- **Claude** is called **only on the server** to write weekly reports, so the API key is never exposed to the browser.
- Every database query is **scoped to the logged-in user**, so users can only ever see their own data.

---

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router) + **React 19** | Server Components + Server Actions |
| Language | **TypeScript** | |
| Styling | **Tailwind CSS v4** | Utility classes; no separate config file |
| Database | **PostgreSQL** | **Neon** in production, local Postgres in dev |
| ORM | **Prisma 6** | Type-safe DB access + migrations |
| Auth | **Auth.js v5** (NextAuth) | Email + password, `bcryptjs`, JWT sessions |
| AI | **Anthropic SDK** (`claude-haiku-4-5`) | Server-side only |
| Hosting | **Vercel** | Auto-deploys from GitHub |

---

## Project structure

```
app/
  (auth)/login, (auth)/signup   Sign-in / sign-up pages
  (app)/layout.tsx              Authenticated shell (nav tabs + sign out)
  (app)/journal                 Journal page
  (app)/gratitude               Gratitude page
  (app)/reports                 Weekly reports page
  api/auth/[...nextauth]        Auth.js HTTP handler
actions/                        Server Actions (writes): auth, journal, gratitude, reports
components/                     Client components (forms, nav)
lib/
  db.ts                         Prisma client (singleton)
  session.ts                    requireUserId() — server-side auth check
  claude.ts                     Weekly-report prompt + Anthropic call
  week.ts, format.ts            Date helpers
auth.ts                         Auth.js instance (providers + bcrypt) — Node runtime
auth.config.ts                  Edge-safe auth config (used by proxy)
proxy.ts                        Route protection (Next 16's renamed "middleware")
prisma/schema.prisma            Database schema
scripts/migrate-from-supabase.ts  One-off import from the old Supabase database
```

### Data model

| Table | Fields | Notes |
|---|---|---|
| `User` | id, email (unique), passwordHash, createdAt | |
| `JournalEntry` | id, userId, content, createdAt | |
| `GratitudeItem` | id, userId, content, position (1–3), entryDate, createdAt | unique on (userId, entryDate, position) → enforces 3/day |
| `WeeklyReport` | id, userId, content, weekStart, createdAt | unique on (userId, weekStart) → one report per week |

---

## Local setup

### Prerequisites
- **Node.js 18+**
- **PostgreSQL** running locally (e.g. `brew install postgresql@16 && brew services start postgresql@16`)

### Steps
```bash
# 1. Install dependencies
npm install

# 2. Create a local database
createdb mindcloud

# 3. Create .env (see below)

# 4. Create the tables
npx prisma migrate dev

# 5. Run the app
npm run dev
```
Open http://localhost:3000 and sign up.

### Environment variables (`.env`)
This file is **gitignored** — never commit it.

| Variable | What it is |
|---|---|
| `DATABASE_URL` | Postgres connection string (local: `postgresql://<you>@localhost:5432/mindcloud`) |
| `AUTH_SECRET` | Secret for signing sessions — generate with `openssl rand -base64 33` |
| `ANTHROPIC_API_KEY` | Your Claude API key (`sk-ant-...`) — needed only for weekly reports |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `MIGRATE_USER_EMAIL`, `MIGRATE_USER_PASSWORD` | Only used by the Supabase migration script |

### npm scripts
| Script | Does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run db:migrate` | Create/apply a migration locally (`prisma migrate dev`) |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run migrate:supabase` | Import data from the old Supabase DB |

---

## Deployment (Vercel + GitHub)

The repo is connected to Vercel; **every push to `main` auto-deploys**. To set up from scratch, see **[DEPLOY.md](./DEPLOY.md)**. In short:

1. Import the GitHub repo into Vercel.
2. Add a **Neon Postgres** database (Storage tab) — this adds `DATABASE_URL`.
3. Set env vars in Vercel: `AUTH_SECRET`, `ANTHROPIC_API_KEY` (`DATABASE_URL` comes from Neon).
4. Create the tables once: `DATABASE_URL='<unpooled-url>' npx prisma migrate deploy`.
5. Push to `main` (or click Redeploy).

Vercel builds with `vercel-build` (`prisma generate && next build`).

---

## Migrating old data (optional)

The original Mac app stored data in Supabase. To copy it into the new database, fill the `SUPABASE_*` / `MIGRATE_*` env vars and run:
```bash
npm run migrate:supabase
```
It maps the old fields (e.g. `transcript` → journal `content`), attaches everything to one user account, and is safe to re-run.

---

## Decisions & gotchas worth knowing

- **Next.js 16 renamed "middleware" to `proxy.ts`** — route protection lives there (must export a function).
- **Prisma is pinned to v6.** Prisma 7 removed the `url` field from the schema in favour of a driver-adapter setup; v6 keeps the simpler, well-documented approach.
- **No component library** (e.g. shadcn/ui) — plain Tailwind, to avoid tooling friction on Next 16 / Tailwind v4.
- **Dates** are stored as *UTC-midnight of the local calendar day*, so the "once per day" lock and history don't drift across timezones.
- **Security**: the database query layer always filters by the session user; the Anthropic key is only ever used in server code; secrets live in env vars, never in the browser bundle.
- **Auth note**: sign-up has no email confirmation — any email + a 6+ character password creates an account.
