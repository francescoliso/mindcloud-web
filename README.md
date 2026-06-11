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
                  └──► Resend API                     ← waitlist / invite emails
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
| Email | **Resend** (`resend` SDK) | From `hello@mindcloud.space` via DKIM; logs to console if `RESEND_API_KEY` unset |
| Hosting | **Vercel** | Auto-deploys from GitHub (`main` → production); see [DEPLOY.md](./DEPLOY.md) |
| CI | **GitHub Actions** | Typecheck + lint + build on every push/PR; deploy on push to `main` |
| Install app | **Safari web app** ("Add to Dock") | Standalone PWA wrapper; self-updates via `/api/version` polling |

---

## Access model (invite-only)

1. A visitor joins the **waitlist** on the landing page (`/`).
2. The **admin** (the email in `ADMIN_EMAIL`) opens **`/admin/waitlist`**, clicks **Approve & invite** — this generates an invite link (`/signup?token=…`), emails it, and shows a copyable link.
3. The invitee opens the link, sets a password, and an account is created. Signup is refused without a valid token — **except** `ADMIN_EMAIL`, which can register to bootstrap the first admin.
4. New users pass through **`/welcome`** (guided onboarding) once, tracked by `User.onboardedAt`.

Email is optional: if `RESEND_API_KEY` isn't set, emails log to the server console and the admin page's **copyable invite link** still works (share it manually).

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
  api/version                   Returns the Vercel deployment id (for self-update)
actions/                        Server Actions: auth, journal, gratitude, mood, reports, waitlist, onboarding
components/                     Client components (forms, nav, mood check-in, copy field)
  logo.tsx                      Moodmind brand mark (brain hemispheres, mood gradient)
  auto-refresh.tsx              Polls api/version, reloads the app on a new deploy
lib/
  db.ts                         Prisma client (singleton)
  session.ts / admin.ts         requireUserId() / requireAdmin()
  claude.ts                     Weekly-report prompt + Anthropic call
  email.ts                      Resend wrapper — from hello@mindcloud.space (console fallback if key unset)
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
| `APP_URL` | Base URL for invite links (`http://localhost:3000` in dev, `https://mindcloud.space` in prod) |
| `RESEND_API_KEY` | Resend API key — emails log to console if unset (invite links still work via admin UI) |
| `ENCRYPTION_KEY` | Base64 of 32 bytes (`openssl rand -base64 32`) — encrypts entries at rest. Unset ⇒ content stored as plaintext (dev) |
| `CRON_SECRET` | Bearer token guarding the weekly-report cron (`/api/cron/weekly-reports`) |
| `DATABASE_URL_UNPOOLED` | Neon direct URL — used as Prisma `directUrl` for migrations (locally mirror `DATABASE_URL`) |
| `SUPABASE_*`, `MIGRATE_*` | Only for the one-off Supabase import script |

### npm scripts

| Script | Does |
|---|---|
| `npm run dev` / `build` | Dev server / production build |
| `npm run db:migrate` | Create/apply a migration locally |
| `npm run db:studio` | Visual DB browser (Prisma Studio) |
| `npm run email:test <addr>` | Send a test email via Resend (requires `RESEND_API_KEY` in `.env`) |
| `npm run migrate:supabase` | Import data from the old Supabase DB |

---

## Deployment

Every push to `main` deploys automatically via **GitHub Actions** (`.github/workflows/deploy.yml`).

```
git push origin main   # → CI runs, then deploy runs → live on mindcloud.space
```

The workflow needs three GitHub secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`). `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are already set. `VERCEL_TOKEN` must be created once in the Vercel dashboard (Account → Settings → Tokens → Create → type "Classic") and added as a GitHub secret. Full guide in **[DEPLOY.md](./DEPLOY.md)**.

Production needs these env vars in Vercel: `DATABASE_URL` (from Neon), `AUTH_SECRET`, `ANTHROPIC_API_KEY`, `ADMIN_EMAIL`, `APP_URL` (`https://mindcloud.space`), and `RESEND_API_KEY`. Apply schema changes with `prisma migrate deploy` against the Neon **unpooled** URL.

### Always-fresh Dock app

The landing and login pages are `force-dynamic` (no ISR window), and every screen mounts `AutoRefresh`, which polls `/api/version` (the Vercel deployment id) every 30s — and on window focus — and calls `location.reload()` when a new build ships. So the standalone Safari "Add to Dock" web app picks up deploys automatically, without a manual reload.

---

## Decisions & gotchas

- **Next.js 16 renamed "middleware" to `proxy.ts`** — route protection lives there (must export a function).
- **Prisma pinned to v6** — v7 dropped the `url` field for a driver-adapter setup; v6 keeps the simpler approach.
- **No component library** — plain Tailwind, to avoid tooling friction on Next 16 / Tailwind v4.
- **Dates** are stored as *UTC-midnight of the local calendar day*, so daily locks and history don't drift across timezones.
- **Email** — sent via **Resend** from `hello@mindcloud.space` with DKIM/SPF. Requires a `RESEND_API_KEY` and the domain verified in the Resend dashboard. Console fallback if the key is missing.
- **Security** — queries are scoped to the session user; Claude/email creds stay server-side; secrets live only in env vars.
- **Encryption at rest** — journal, gratitude, and report content is AES-256-GCM encrypted (`lib/crypto.ts`, `ENCRYPTION_KEY`) with a `enc:v1:` prefix and plaintext fallback for legacy rows. Tags stay plaintext so they're SQL-filterable.
- **Rate limiting** — `lib/rate-limit.ts` is a Postgres-backed fixed-window limiter (fail-open) on waitlist join, login, and signup.
- **Search & tags** — journal entries carry plaintext tags; search decrypts and filters in memory (content is ciphertext), tag filter runs in SQL.
- **Account deletion + churn** — users delete from `/settings` (cascades all data); a PII-free `AccountDeletion` row feeds the `/admin` dashboard. Confirmation email via Resend.
- **Background jobs** — Vercel Cron (`vercel.json`) runs `/api/cron/weekly-reports` Mondays to pre-generate reports for active users.
- **Dark mode** — class-based (`.dark`) with a no-flash inline script and a toggle in Settings; defaults to system preference.
- **Tests** — Vitest unit tests (`test/`) for week math, mood, and crypto run in CI alongside typecheck/lint/build.
- **Branding** — the `Logo` component (`components/logo.tsx`) is an inline SVG "Moodmind" mark (two brain hemispheres in a blue→purple→amber mood gradient) used across landing, login, signup, and welcome. Tagline on the landing page: *"Designed with Love in Puglia!"* with *"Private by design · Your words stay yours."* under the waitlist form.
- **Self-updating PWA** — see "Always-fresh Dock app" above; `force-dynamic` + `AutoRefresh` keep the installed Dock web app current with each deploy.
