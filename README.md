# MindCloud

A small, private, **invite-only** web app for mental wellbeing.

- **📓 Journal** — free-form text entries, with a quick **daily mood check-in** (1–5).
- **🙏 Gratitude** — three things you're grateful for, **once per day**. Completing a day locks it (read-only) and saves it to history.
- **📊 Weekly Reports** — a warm, AI-written reflection (via Claude) on the week's journal, mood, and gratitude.
- **🚪 Waitlist + onboarding** — a public landing page collects waitlist signups; an admin approves people, who then get an invite link; new users go through a short guided onboarding.

It started as a native macOS (SwiftUI) app and was rewritten as a web app on Vercel. Voice journaling from the original was dropped for v1 (no on-device speech in the browser); the journal is text-only for now.

---

## How it works (the big picture)

```
Browser ──► Next.js app on Vercel ──► PostgreSQL (Neon)
                  │
                  ├──► Anthropic API (Claude Haiku)  ← weekly reports only
                  └──► Gmail SMTP (nodemailer)        ← waitlist / invite emails
```

- The **Next.js app** serves the UI *and* the server logic — there is no separate backend.
- **Reads** happen in Server Components; **writes** happen through Server Actions.
- **Claude** and **email** are called **only on the server**, so those credentials never reach the browser.
- Every database query is **scoped to the logged-in user** — users only ever see their own data.

---

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router) + **React 19** | Server Components + Server Actions |
| Language | **TypeScript** | |
| Styling | **Tailwind CSS v4** | Utility classes; no separate config file |
| Database | **PostgreSQL** | **Neon** in production, local Postgres in dev |
| ORM | **Prisma 6** | Type-safe DB access + migrations |
| Auth | **Auth.js v5** (NextAuth) | Email + password, `bcryptjs`, JWT sessions, **invite-only** |
| AI | **Anthropic SDK** (`claude-haiku-4-5`) | Server-side only |
| Email | **nodemailer** via **Gmail SMTP** | No domain needed; logs to console if unconfigured |
| Hosting | **Vercel** | Auto-deploys from GitHub |

---

## Access model (invite-only)

1. A visitor joins the **waitlist** on the landing page (`/`).
2. The **admin** (the email in `ADMIN_EMAIL`) opens **`/admin/waitlist`**, clicks **Approve & invite** — this generates an invite link (`/signup?token=…`), emails it, and shows a copyable link.
3. The invitee opens the link, sets a password, and an account is created. Signup is refused without a valid token — **except** `ADMIN_EMAIL`, which can register to bootstrap the first admin.
4. New users pass through **`/welcome`** (guided onboarding) once, tracked by `User.onboardedAt`.

Email is optional: if Gmail isn't configured, the admin page's **copyable invite link** still works (share it manually).

---

## Project structure

```
app/
  page.tsx                      Public landing page + waitlist form
  (auth)/login, (auth)/signup   Sign-in / invite-aware sign-up
  (app)/layout.tsx              Authed shell (nav + sign out + onboarding gate)
  (app)/journal                 Journal + daily mood check-in
  (app)/gratitude               Gratitude page
  (app)/reports                 Weekly reports page
  welcome/                      Guided first-run onboarding
  admin/waitlist/               Admin: approve & invite (gated by ADMIN_EMAIL)
  api/auth/[...nextauth]        Auth.js HTTP handler
actions/                        Server Actions: auth, journal, gratitude, mood, reports, waitlist, onboarding
components/                     Client components (forms, nav, mood check-in, copy field)
lib/
  db.ts                         Prisma client (singleton)
  session.ts / admin.ts         requireUserId() / requireAdmin()
  claude.ts                     Weekly-report prompt + Anthropic call
  email.ts                      Gmail SMTP wrapper (console fallback)
  mood.ts, week.ts, format.ts   Helpers
auth.ts / auth.config.ts        Auth.js instance / edge-safe config
proxy.ts                        Route protection (Next 16's renamed "middleware")
prisma/schema.prisma            Database schema
scripts/                        migrate-from-supabase.ts, send-test-email.ts
```

### Data model

| Table | Key fields | Notes |
|---|---|---|
| `User` | email (unique), passwordHash, **onboardedAt** | `onboardedAt` null ⇒ show onboarding |
| `JournalEntry` | content, createdAt | |
| `MoodEntry` | score (1–5), entryDate | unique (userId, entryDate) → one mood/day, editable |
| `GratitudeItem` | content, position (1–3), entryDate | unique (userId, entryDate, position) → 3/day |
| `WeeklyReport` | content, weekStart | unique (userId, weekStart) → one/week |
| `WaitlistEntry` | email (unique), status, inviteToken | status: PENDING → INVITED → REGISTERED |

---

## Local setup

### Prerequisites
- **Node.js 18+**
- **PostgreSQL** locally (e.g. `brew install postgresql@16 && brew services start postgresql@16`)

### Steps
```bash
npm install
createdb mindcloud
# create .env (see below)
npx prisma migrate dev      # create the tables
npm run dev
```
Open http://localhost:3000. Set `ADMIN_EMAIL` to your email, then register that email at `/signup` to bootstrap.

### Environment variables (`.env` — gitignored, never commit)

| Variable | What it is |
|---|---|
| `DATABASE_URL` | Postgres connection string (local: `postgresql://<you>@localhost:5432/mindcloud`) |
| `AUTH_SECRET` | Session signing secret — `openssl rand -base64 33` |
| `ANTHROPIC_API_KEY` | Claude API key (`sk-ant-…`) — weekly reports only |
| `ADMIN_EMAIL` | Owner's email — can register without an invite and access `/admin` |
| `APP_URL` | Base URL for invite links (`http://localhost:3000` in dev) |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Gmail address + 16-char App Password (emails log to console if unset) |
| `SUPABASE_*`, `MIGRATE_*` | Only for the one-off Supabase import script |

### npm scripts

| Script | Does |
|---|---|
| `npm run dev` / `build` | Dev server / production build |
| `npm run db:migrate` | Create/apply a migration locally |
| `npm run db:studio` | Visual DB browser (Prisma Studio) |
| `npm run email:test <addr>` | Send a test email via Gmail SMTP |
| `npm run migrate:supabase` | Import data from the old Supabase DB |

---

## Deployment

Connected to Vercel — **every push to `main` auto-deploys**. Full guide in **[DEPLOY.md](./DEPLOY.md)**. Production needs these env vars in Vercel: `DATABASE_URL` (from Neon), `AUTH_SECRET`, `ANTHROPIC_API_KEY`, `ADMIN_EMAIL`, `APP_URL`, and (for email) `GMAIL_USER` + `GMAIL_APP_PASSWORD`. Apply schema changes with `prisma migrate deploy` against the Neon **unpooled** URL.

---

## Decisions & gotchas

- **Next.js 16 renamed "middleware" to `proxy.ts`** — route protection lives there (must export a function).
- **Prisma pinned to v6** — v7 dropped the `url` field for a driver-adapter setup; v6 keeps the simpler approach.
- **No component library** — plain Tailwind, to avoid tooling friction on Next 16 / Tailwind v4.
- **Dates** are stored as *UTC-midnight of the local calendar day*, so daily locks and history don't drift across timezones.
- **Email needs no domain** — Gmail SMTP via an App Password (requires 2-Step Verification on the Google account).
- **Security** — queries are scoped to the session user; Claude/email creds stay server-side; secrets live only in env vars.
