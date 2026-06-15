# MindCloud

A small, private, **invite-only** web app for mental wellbeing.

- **📓 Journal** — free-form text entries with plaintext tags and a daily **mood check-in** (1–5).
- **🙏 Gratitude** — three things you're grateful for, **once per day**. Completing a day locks it read-only.
- **🕸️ Life Wheel** — a radar chart mapping **goal vs. now** across 8 fixed life dimensions (Work, Love, Friendship, Family, Health, Mind, Finance, Growth), with a comment per dimension. Live chart preview while editing.
- **📊 Weekly Reports** — a warm, AI-written reflection (via Claude) on the week's journal, mood, and gratitude.
- **🚪 Waitlist + onboarding** — a public landing page collects waitlist signups; the admin approves people, who then get an invite link; new users go through a short guided onboarding.

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
| Email | **Resend** (`resend` SDK) | From `hello@mindcloud.space` via DKIM/SPF; logs to console if `RESEND_API_KEY` unset |
| Hosting | **Vercel** | Auto-deploys from GitHub (`main` → production); see [DEPLOY.md](./DEPLOY.md) |
| CI | **GitHub Actions** | Typecheck + lint + test + build on every push/PR; deploy on push to `main` |
| Tests | **Vitest** | Unit tests in `test/` — week math, mood, crypto |
| Install app | **Safari web app** ("Add to Dock") | Standalone PWA wrapper; self-updates via `/api/version` polling |

---

## Access model (invite-only)

1. A visitor joins the **waitlist** on the landing page (`/`).
2. The **admin** (`ADMIN_EMAIL`) opens **`/admin/waitlist`**, clicks **Approve & invite** — this generates an invite link (`/signup?token=…`), emails it, and shows a copyable link.
3. The invitee opens the link, sets a password, and an account is created. Signup is refused without a valid token.
4. New users pass through **`/welcome`** (guided onboarding) once, tracked by `User.onboardedAt`.

**Admin and user accounts are fully separate.** The admin account (`ADMIN_EMAIL`) can only access `/admin/*` and is redirected away from all user routes. Regular users cannot access `/admin`. The admin is pre-inserted directly into the DB — no registration UI needed.

Email is optional: if `RESEND_API_KEY` isn't set, emails log to the server console and the admin page's **copyable invite link** still works.

---

## Project structure

```
app/
  page.tsx                        Public landing page + waitlist form (scroll-snap sections)
  (auth)/login                    Sign-in page (dark slate background + soft glow)
  (auth)/signup                   Invite-aware sign-up (token required; plain card)
  (app)/layout.tsx                Authed shell (frosted nav, logo, sign out, onboarding gate)
  (app)/journal                   Journal + mood check-in; supports ?q= search and ?tag= filter
  (app)/gratitude                 Gratitude page (once-per-day hard lock)
  (app)/wheel                     Life Wheel — radar chart, goals vs now, 8 fixed dimensions
  (app)/reports                   Weekly reports page
  (app)/settings                  Appearance (dark mode), data export, danger zone (account deletion)
  welcome/                        Guided first-run onboarding
  admin/                          Admin dashboard (stats + churn) — gated to ADMIN_EMAIL
  admin/users/                    Admin: list all users (admin excluded) + per-user stats
  admin/waitlist/                 Admin: approve & invite
  api/auth/[...nextauth]          Auth.js HTTP handler
  api/version                     Returns Vercel deployment id (for self-update)
  api/export                      GET → decrypted JSON download of all user data
  api/cron/weekly-reports         POST (cron) → pre-generates reports for active users
actions/                          Server Actions: auth, journal, gratitude, mood, reports, wheel, waitlist, account, onboarding
components/
  auth-form.tsx                   Login form (dark slate background + soft glow)
  signup-form.tsx                 Signup form (invite-only, plain card)
  logo.tsx                        Brand mark (brain hemispheres, mood gradient)
  auto-refresh.tsx                Polls api/version, reloads the app on a new deploy
  theme-toggle.tsx                Light/dark pill; persists to localStorage, no-flash on load
  nav-tabs.tsx                    Journal / Gratitude / Wheel / Reports tab bar
  journal-search.tsx              Search input + tag chip filter
  wheel-chart.tsx                 SVG radar chart — two polygons (goal dashed, now filled)
  wheel-form.tsx                  Life Wheel edit form with live chart preview
  delete-account.tsx              Typed "DELETE" confirmation; calls deleteAccount() server action
  app-preview.tsx                 Stylised app mockup shown on the landing page
  social-icons.tsx                Instagram + X SVG icons (hrefs are # placeholders for now)
lib/
  db.ts                           Prisma client (singleton)
  session.ts / admin.ts           requireUserId() / requireAdmin()
  claude.ts                       Weekly-report prompt + Anthropic call
  email.ts                        Resend wrapper — from hello@mindcloud.space (console fallback)
  crypto.ts                       AES-256-GCM encrypt/decrypt with enc:v1: prefix + plaintext fallback
  rate-limit.ts                   Postgres-backed fixed-window rate limiter (fail-open)
  reports.ts                      generateWeeklyReport() + usersWithWeeklyActivity()
  dimensions.ts                   Fixed Life Wheel dimension constants + TypeScript types
  mood.ts, week.ts, format.ts     Helpers
auth.ts / auth.config.ts          Auth.js instance / edge-safe config (admin vs user route split)
proxy.ts                          Route protection (Next 16's renamed "middleware")
prisma/schema.prisma              Database schema
test/                             Vitest unit tests: crypto.test.ts, week.test.ts, mood.test.ts
scripts/                          migrate-from-supabase.ts, send-test-email.ts
.github/workflows/
  ci.yml                          Typecheck → lint → test → build
  deploy.yml                      Remote Vercel build + deploy on push to main
  backup.yml                      Nightly pg_dump (v17) at 03:00 UTC, 90-day GitHub artifact
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
| `LifeWheel` | goals (Json), current (Json), userId (unique) | one row per user; goals = `{dim: score}`; current = `{dim: {score, comment}}` |
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
npx prisma migrate dev
npm run dev
```

Open http://localhost:3000. Set `ADMIN_EMAIL` in `.env`, then insert the admin user directly into the DB (see DEPLOY.md).

### Environment variables (`.env` — gitignored, never commit)

| Variable | What it is |
|---|---|
| `DATABASE_URL` | Postgres connection string (local: `postgresql://<you>@localhost:5432/mindcloud`) |
| `DATABASE_URL_UNPOOLED` | Neon direct URL for migrations (locally mirror `DATABASE_URL`) |
| `AUTH_SECRET` | Session signing secret — `openssl rand -base64 33` |
| `ANTHROPIC_API_KEY` | Claude API key (`sk-ant-…`) — weekly reports only |
| `ADMIN_EMAIL` | Admin account email — **only** this account can access `/admin` |
| `APP_URL` | Base URL for invite links (`http://localhost:3000` dev / `https://mindcloud.space` prod) |
| `RESEND_API_KEY` | Resend API key — emails log to console if unset |
| `ENCRYPTION_KEY` | Base64 of 32 random bytes (`openssl rand -base64 32`) — encrypts content at rest |
| `CRON_SECRET` | Bearer token guarding `/api/cron/weekly-reports` |
| `BACKUP_DATABASE_URL` | Neon unpooled URL — add as a **GitHub secret** to activate nightly backups |
| `SUPABASE_*`, `MIGRATE_*` | Only for the one-off Supabase import script |

### npm scripts

| Script | Does |
|---|---|
| `npm run dev` / `build` | Dev server / production build |
| `npm test` | Vitest unit tests |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Create/apply a migration locally |
| `npm run db:studio` | Visual DB browser (Prisma Studio) |
| `npm run email:test <addr>` | Send a test email via Resend (requires `RESEND_API_KEY`) |
| `npm run migrate:supabase` | Import data from the old Supabase DB |

---

## Deployment

Every push to `main` deploys automatically. Full guide in **[DEPLOY.md](./DEPLOY.md)**.

---

## Decisions & gotchas

- **Next.js 16 renamed "middleware" to `proxy.ts`** — route protection lives there (must export a function).
- **Prisma pinned to v6** — v7 dropped the `url` field; v6 keeps the simpler approach.
- **No component library** — plain Tailwind, to avoid tooling friction on Next 16 / Tailwind v4.
- **Admin/user separation** — `auth.config.ts` splits `USER_ROUTES` and `ADMIN_ROUTES`; middleware redirects each role to its correct home. Admin is inserted directly into the DB, never via the registration UI. Admin account is excluded from the `/admin/users` list.
- **Dates** stored as *UTC-midnight of the local calendar day* to avoid TZ off-by-one on daily locks.
- **Email** — Resend from `hello@mindcloud.space`, DKIM + SPF verified. Sent on: waitlist join, invite, account deletion. Console fallback if key missing.
- **Encryption at rest** — AES-256-GCM via `lib/crypto.ts`. Format: `enc:v1:<iv>:<tag>:<ciphertext>`. Plaintext fallback for legacy rows. Tags stay plaintext so they're SQL-filterable.
- **Life Wheel** — one JSON row per user (`LifeWheel`). 8 fixed dimensions in `lib/dimensions.ts`. Upserted on every save. SVG chart in `components/wheel-chart.tsx` — no chart library.
- **Rate limiting** — Postgres-backed fixed-window (fail-open): waitlist 5/hr/IP, login 10/10min/IP, signup 10/10min/IP.
- **Search & tags** — tags filter in SQL; free-text search decrypts in memory server-side (ciphertext blocks SQL LIKE).
- **Account deletion** — cascades all personal data; PII-free `AccountDeletion` row feeds admin churn rate; confirmation email sent.
- **Cron** — Vercel Cron runs `/api/cron/weekly-reports` Mondays 08:00 UTC; guarded by `CRON_SECRET`.
- **Nightly backups** — `pg_dump` (explicit v17 path) at 03:00 UTC; 90-day GitHub artifact. Requires `BACKUP_DATABASE_URL` GitHub secret.
- **Dark mode** — class-based; no-flash inline script in `<head>`; toggle in Settings → Appearance.
- **Self-updating PWA** — `force-dynamic` + `AutoRefresh` keep the Dock web app current with each deploy.
- **Data export** — `/api/export` returns decrypted JSON (journal, gratitude, moods, reports, life wheel).
- **Social links** — `components/social-icons.tsx` has `href="#"` placeholders; swap in real URLs when accounts are ready.
