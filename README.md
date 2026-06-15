# MindCloud

A small, private, **invite-only** web app for mental wellbeing.

- **📓 Journal** — free-form text entries with plaintext tags, with a quick **daily mood check-in** (1–5).
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
                  └──► Resend API                     ← waitlist / invite / deletion emails
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
| CI | **GitHub Actions** | Typecheck + lint + test + build on every push/PR; deploy on push to `main` |
| Tests | **Vitest** | Unit tests in `test/` — week math, mood, crypto |
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
  page.tsx                        Public landing page + waitlist form (scroll-snap sections)
  (auth)/login, (auth)/signup     Sign-in / invite-aware sign-up
  (app)/layout.tsx                Authed shell (frosted nav, logo, sign out, onboarding gate)
  (app)/journal                   Journal + mood check-in; supports ?q= search and ?tag= filter
  (app)/gratitude                 Gratitude page
  (app)/reports                   Weekly reports page
  (app)/settings                  Appearance (dark mode), data export, danger zone (account deletion)
  welcome/                        Guided first-run onboarding
  admin/                          Admin dashboard (stats + churn)
  admin/users/                    Admin: list all users with per-user stats
  admin/waitlist/                 Admin: approve & invite (gated by ADMIN_EMAIL)
  api/auth/[...nextauth]          Auth.js HTTP handler
  api/version                     Returns Vercel deployment id (for self-update)
  api/export                      GET → decrypted JSON download (mindcloud-export-YYYY-MM-DD.json)
  api/cron/weekly-reports         POST (cron) → pre-generates reports for active users
actions/                          Server Actions: auth, journal, gratitude, mood, reports, waitlist, account, onboarding
components/
  logo.tsx                        Moodmind brand mark (brain hemispheres, mood gradient)
  auto-refresh.tsx                Polls api/version, reloads the app on a new deploy
  theme-toggle.tsx                Light/dark pill; persists to localStorage, no-flash on load
  journal-search.tsx              Search input + tag chip filter; pushes ?q= / ?tag= params
  delete-account.tsx              Typed "DELETE" confirmation; calls deleteAccount() server action
  app-preview.tsx                 Stylised app mockup shown on the landing page
  social-icons.tsx                Instagram + X SVG icons (hrefs are # placeholders)
lib/
  db.ts                           Prisma client (singleton)
  session.ts / admin.ts           requireUserId() / requireAdmin()
  claude.ts                       Weekly-report prompt + Anthropic call
  email.ts                        Resend wrapper — from hello@mindcloud.space (console fallback)
  crypto.ts                       AES-256-GCM encrypt/decrypt with enc:v1: prefix + plaintext fallback
  rate-limit.ts                   Postgres-backed fixed-window rate limiter (fail-open)
  reports.ts                      generateWeeklyReport() + usersWithWeeklyActivity() — shared by action + cron
  mood.ts, week.ts, format.ts     Helpers
auth.ts / auth.config.ts          Auth.js instance / edge-safe config
proxy.ts                          Route protection (Next 16's renamed "middleware")
prisma/schema.prisma              Database schema
test/                             Vitest unit tests: crypto.test.ts, week.test.ts, mood.test.ts
scripts/                          migrate-from-supabase.ts, send-test-email.ts
.github/workflows/
  ci.yml                          Typecheck → lint → test → build
  deploy.yml                      Remote Vercel build + deploy on push to main
  backup.yml                      Nightly pg_dump artifact (90-day retention; requires BACKUP_DATABASE_URL)
vercel.json                       Vercel Cron: /api/cron/weekly-reports every Monday 08:00 UTC
```

### Data model

| Table | Key fields | Notes |
|---|---|---|
| `User` | email (unique), passwordHash, **onboardedAt** | `onboardedAt` null ⇒ show onboarding |
| `JournalEntry` | content (encrypted), tags `String[]`, createdAt | tags are plaintext so SQL-filterable |
| `MoodEntry` | score (1–5), entryDate | unique (userId, entryDate) → one mood/day, editable |
| `GratitudeItem` | content (encrypted), position (1–3), entryDate | unique (userId, entryDate, position) → 3/day |
| `WeeklyReport` | content (encrypted), weekStart | unique (userId, weekStart) → one/week |
| `WaitlistEntry` | email (unique), status, inviteToken | status: PENDING → INVITED → REGISTERED |
| `AccountDeletion` | accountCreatedAt, wasOnboarded, deletedAt | PII-free churn row written on deletion |
| `RateLimit` | key (PK), count, windowEnd | fixed-window counter for waitlist / login / signup |

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
| `DATABASE_URL_UNPOOLED` | Neon direct URL — used as Prisma `directUrl` for migrations (locally mirror `DATABASE_URL`) |
| `AUTH_SECRET` | Session signing secret — `openssl rand -base64 33` |
| `ANTHROPIC_API_KEY` | Claude API key (`sk-ant-…`) — weekly reports only |
| `ADMIN_EMAIL` | Owner's email — can register without an invite and access `/admin` |
| `APP_URL` | Base URL for invite links (`http://localhost:3000` in dev, `https://mindcloud.space` in prod) |
| `RESEND_API_KEY` | Resend API key — emails log to console if unset (invite links still work via admin UI) |
| `ENCRYPTION_KEY` | Base64 of 32 bytes (`openssl rand -base64 32`) — encrypts journal/gratitude/report content at rest; unset ⇒ plaintext (dev) |
| `CRON_SECRET` | Bearer token guarding `/api/cron/weekly-reports` |
| `BACKUP_DATABASE_URL` | Neon unpooled URL for nightly `pg_dump` — add as a GitHub secret to activate backups |
| `SUPABASE_*`, `MIGRATE_*` | Only for the one-off Supabase import script |

### npm scripts

| Script | Does |
|---|---|
| `npm run dev` / `build` | Dev server / production build |
| `npm test` | Vitest unit tests (`test/`) |
| `npm run lint` | ESLint |
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

Production needs these env vars in Vercel: `DATABASE_URL` (from Neon), `DATABASE_URL_UNPOOLED`, `AUTH_SECRET`, `ANTHROPIC_API_KEY`, `ADMIN_EMAIL`, `APP_URL` (`https://mindcloud.space`), `RESEND_API_KEY`, `ENCRYPTION_KEY`, `CRON_SECRET`.

### Always-fresh Dock app

The landing and login pages are `force-dynamic` (no ISR window), and every screen mounts `AutoRefresh`, which polls `/api/version` (the Vercel deployment id) every 30s — and on window focus — and calls `location.reload()` when a new build ships. So the standalone Safari "Add to Dock" web app picks up deploys automatically, without a manual reload.

---

## Decisions & gotchas

- **Next.js 16 renamed "middleware" to `proxy.ts`** — route protection lives there (must export a function).
- **Prisma pinned to v6** — v7 dropped the `url` field for a driver-adapter setup; v6 keeps the simpler approach.
- **No component library** — plain Tailwind, to avoid tooling friction on Next 16 / Tailwind v4.
- **Dates** are stored as *UTC-midnight of the local calendar day*, so daily locks and history don't drift across timezones.
- **Email** — sent via **Resend** from `hello@mindcloud.space` with DKIM/SPF. Requires a `RESEND_API_KEY` and the domain verified in the Resend dashboard. Console fallback if the key is missing. Emails sent on: waitlist join, invite, and account deletion.
- **Security** — queries are scoped to the session user; Claude/email creds stay server-side; secrets live only in env vars.
- **Encryption at rest** — journal, gratitude, and report content is AES-256-GCM encrypted (`lib/crypto.ts`, `ENCRYPTION_KEY`) with an `enc:v1:<iv>:<tag>:<ciphertext>` format and plaintext fallback for legacy rows. Tags stay plaintext so they're SQL-filterable.
- **Rate limiting** — `lib/rate-limit.ts` is a Postgres-backed fixed-window limiter (fail-open) on waitlist join (5/hr/IP), login (10/10min/IP), and signup (10/10min/IP).
- **Search & tags** — journal entries carry up to 10 plaintext tags (comma-separated on input, lowercased, de-duped); tag filter runs in SQL. Free-text search decrypts entries in memory server-side (content is ciphertext, so SQL LIKE is not possible).
- **Account deletion + churn** — users delete from `/settings` (types "DELETE" to confirm); cascades all personal data; a PII-free `AccountDeletion` row feeds the `/admin` dashboard churn rate. A confirmation email is sent via Resend.
- **Admin panel** — `/admin` (stats + churn), `/admin/users` (per-user data), `/admin/waitlist` (approve & invite) — all gated to `ADMIN_EMAIL`.
- **Background jobs** — Vercel Cron (`vercel.json`) runs `/api/cron/weekly-reports` Mondays 08:00 UTC to pre-generate reports for active users, guarded by `Authorization: Bearer <CRON_SECRET>`.
- **Nightly backups** — `.github/workflows/backup.yml` runs `pg_dump` at 03:00 UTC, stored as a 90-day GitHub artifact. No-ops until `BACKUP_DATABASE_URL` is set as a GitHub secret. Belt-and-suspenders on top of Neon's built-in point-in-time restore.
- **Dark mode** — class-based (`.dark`) with a no-flash inline script in `<head>` that reads localStorage before first paint, and a toggle pill in Settings → Appearance; defaults to system preference.
- **Tests** — Vitest unit tests (`test/`) for week math, mood, and crypto run in CI alongside typecheck/lint/build.
- **Branding** — the `Logo` component (`components/logo.tsx`) is an inline SVG "Moodmind" mark (two brain hemispheres in a blue→purple→amber mood gradient). Tagline: *"Designed with Love in Puglia!"* Footer: *"Private by design · Your words stay yours."*
- **Self-updating PWA** — `force-dynamic` + `AutoRefresh` keep the installed Dock web app current with each deploy; see "Always-fresh Dock app" above.
- **Data export** — `/api/export` returns a JSON download of all the user's decrypted data; linked from Settings → Your data.
