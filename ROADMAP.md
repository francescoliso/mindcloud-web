# MindCloud — Improvement Plan & Roadmap

A pragmatic plan to evolve MindCloud across four lenses — **Features**, **Technical /
Infra**, **Front-end / UX**, and **Back-end / Data** — with **alternatives** and
**rough cost** for each. Costs are estimates for a solo/small build:

- **Effort:** S = ≤1 day · M = 2–4 days · L = 1–2 weeks · XL = 3+ weeks
- **$/mo:** incremental infrastructure / API cost at small scale (hundreds of users)

> Snapshot (June 2026): Next.js 16 + React 19, Prisma 6 + Neon Postgres, Auth.js v5
> (email+password, invite-only), Claude Haiku for weekly reports, Gmail SMTP, Vercel
> (manual CLI deploy). No tests, no CI, no analytics, no offline. Self-updating Safari
> Dock web app. A legacy native macOS (SwiftUI) client also exists.

---

## 1. Features

| # | Idea | Why | Effort | $/mo | Alternatives |
|---|------|-----|--------|------|--------------|
| F1 | **Voice journaling (back from native)** | The macOS app had it; lowers friction | M–L | $0–20 | (a) Browser `SpeechRecognition` (free, Chrome-only, flaky) · (b) **Whisper / Deepgram API** (accurate, paid) · (c) record audio + transcribe server-side on submit |
| F2 | **Richer weekly reports** | Currently Haiku @ 1024 tokens — thin | S–M | +$ | (a) Upgrade to **Sonnet 4.6** for depth · (b) keep Haiku, raise token budget + better prompt · (c) add mood-trend charts alongside prose |
| F3 | **Insights / trends dashboard** | Mood over time, streaks, themes | M | $0 | (a) Client charts (Recharts) · (b) precomputed server aggregates · (c) AI-extracted recurring themes |
| F4 | **Reminders / notifications** | Daily check-in nudges drive retention | M | $0–10 | (a) **Web Push** (free, needs service worker) · (b) email nudges (existing Gmail) · (c) native push on the macOS app |
| F5 | **Search & tags** | Find past entries; organize | M | $0 | (a) Postgres full-text search · (b) tags table + filters · (c) semantic search (pgvector + embeddings) |
| F6 | **Export / data portability** | Trust + GDPR; "your words stay yours" | S | $0 | (a) JSON/Markdown export · (b) PDF report export · (c) full account download + delete |
| F7 | **Prompts / guided journaling** | Helps users who face a blank page | S | $0 | (a) Static prompt library · (b) AI-personalized prompt of the day |
| F8 | **Mobile app (iOS)** | Reach; native notifications | XL | $99/yr | (a) **Reuse SwiftUI** native app · (b) wrap the PWA (Capacitor) · (c) React Native |

**Recommended first:** F6 (export — cheap, on-brand for privacy), F3 (trends — high
perceived value), F4 (reminders — retention).

---

## 2. Technical / Infrastructure

| # | Idea | Why | Effort | $/mo | Alternatives |
|---|------|-----|--------|------|--------------|
| T1 | **CI pipeline** | No tests/CI today — every deploy is unguarded | S–M | $0 | (a) **GitHub Actions**: typecheck + lint + build on PR · (b) Vercel preview checks · (c) add Playwright e2e later |
| T2 | **Automated tests** | Protect auth, daily-lock, report logic | M–L | $0 | (a) **Vitest** unit (lib/*, actions) · (b) Playwright e2e for auth/journal · (c) Prisma test DB via Neon branch |
| T3 | **Git → Vercel auto-deploy** | Manual `vercel --prod` is error-prone | S | $0 | (a) Connect repo in Vercel (push-to-deploy) · (b) deploy via GitHub Action · (c) keep CLI but document it (done) |
| T4 | **Error monitoring** | No visibility into runtime errors | S | $0–26 | (a) **Sentry** (free tier) · (b) Vercel Observability · (c) structured logs + Logflare |
| T5 | **Rate limiting / abuse protection** | Waitlist + auth + Claude endpoints are open | S–M | $0–10 | (a) **Upstash Redis** ratelimit · (b) Vercel WAF rules · (c) per-IP middleware in `proxy.ts` |
| T6 | **Secrets & key hygiene** | Single Anthropic key; no rotation | S | $0 | (a) Scoped keys per env · (b) Vercel env groups · (c) budget alerts on Anthropic console |
| T7 | **Dependency currency** | Auth.js is a **beta**; Prisma pinned to 6 | S | $0 | (a) Renovate/Dependabot · (b) scheduled manual review · (c) pin + lockfile audits |
| T8 | **Cost guardrails on AI** | Reports call Claude unbounded | S | $0 | (a) Cache reports (already 1/week) · (b) token budget per user · (c) queue + retry with backoff |

**Recommended first:** T1 + T4 (CI + Sentry — cheap safety net), T3 (auto-deploy),
T5 (rate limiting before any growth).

---

## 3. Front-end / UX

| # | Idea | Why | Effort | $/mo | Alternatives |
|---|------|-----|--------|------|--------------|
| U1 | **Offline support (service worker)** | PWA today has none; journaling should work offline | M | $0 | (a) **Network-first SW** (caches shell, syncs writes) · (b) `next-pwa` · (c) IndexedDB draft cache only |
| U2 | **Design system / component layer** | Plain Tailwind is fine but repetitive | M | $0 | (a) **shadcn/ui** (copy-in, no lock-in) · (b) Radix primitives · (c) keep Tailwind, extract shared components |
| U3 | **Accessibility pass** | Forms, focus, contrast, screen readers | S–M | $0 | (a) axe audit + fixes · (b) keyboard-nav review · (c) reduced-motion + dark-mode polish |
| U4 | **Polish & micro-interactions** | Calm brand deserves smooth feel | S–M | $0 | (a) Framer Motion transitions · (b) skeleton loaders · (c) optimistic UI on writes |
| U5 | **Dark mode** | Journaling at night; theme already hinted | S | $0 | (a) System-driven (`prefers-color-scheme`) · (b) manual toggle + persisted pref |
| U6 | **Onboarding upgrade** | First-run is functional but plain | S | $0 | (a) Interactive walkthrough · (b) sample/demo entry · (c) progress checklist |

**Recommended first:** U1 (offline — directly addresses the Dock-app expectation),
U5 (dark mode — cheap, high value for a journaling app), U3 (a11y).

---

## 4. Back-end / Data

| # | Idea | Why | Effort | $/mo | Alternatives |
|---|------|-----|--------|------|--------------|
| B1 | **At-rest encryption of entries** | "Private by design" — entries are plaintext in DB | M–L | $0 | (a) **App-level field encryption** (libsodium, server key) · (b) per-user keys (true E2EE, breaks AI reports) · (c) Postgres TDE via provider |
| B2 | **Automated backups / PITR** | Neon has branching; confirm backup policy | S | $0–19 | (a) Neon point-in-time restore · (b) scheduled `pg_dump` to object storage · (c) export job per user |
| B3 | **Background jobs / queue** | Reports + emails run inline in requests | M | $0–10 | (a) **Vercel Cron** + queue table · (b) Upstash QStash · (c) Inngest (durable workflows) |
| B4 | **Multi-admin / roles** | Single `ADMIN_EMAIL` is brittle | S | $0 | (a) `role` column + `requireRole` · (b) allowlist table · (c) org/team model (if B2B later) |
| B5 | **Audit log** | Track invites, admin actions, deletions | S | $0 | (a) `AuditEvent` table · (b) reuse Sentry breadcrumbs · (c) DB triggers |
| B6 | **DB indexes & query review** | Validate indexes on date-scoped queries | S | $0 | (a) Add composite indexes (userId, entryDate) · (b) `EXPLAIN` hot paths · (c) Prisma query metrics |
| B7 | **Email deliverability** | Gmail SMTP won't scale / lands in spam | S–M | $0–20 | (a) **Resend** / Postmark (proper domain, DKIM) · (b) SES · (c) keep Gmail for low volume |

**Recommended first:** B1 (encryption — core to the privacy promise), B6 (indexes —
cheap correctness/perf), B7 (Resend before real email volume).

---

## Suggested phased roadmap

**Phase 0 — Safety net (≈1 week, ~$0/mo)**
T1 CI · T4 Sentry · T3 auto-deploy · B6 indexes · F6 export. Low risk, high leverage;
makes everything after this safer.

**Phase 1 — Trust & retention (≈2 weeks, ~$0–20/mo)**
B1 encryption · F3 trends dashboard · F4 reminders · U5 dark mode · T5 rate limiting.
Delivers on the privacy promise and gives users reasons to return.

**Phase 2 — Depth & reach (≈3–4 weeks, ~$20–60/mo)**
F1 voice · F2 richer reports (Sonnet) · U1 offline · B3 background jobs · B7 Resend.
The "wow" features; introduces most of the recurring cost.

**Phase 3 — Platform (optional, XL)**
F8 mobile · F5 semantic search (pgvector) · B4 roles/teams. Pursue only if MindCloud
moves beyond personal use.

---

## Cost summary (rough, small scale)

| Area | One-time effort | Recurring $/mo |
|------|------------------|----------------|
| Phase 0 | ~5 dev-days | $0 |
| Phase 1 | ~10 dev-days | $0–20 (Sentry/ratelimit free tiers) |
| Phase 2 | ~15–20 dev-days | $20–60 (Claude Sonnet, Whisper, Resend, queue) |
| Current baseline | — | ~$0–20 (Neon free/launch + Anthropic usage + Vercel Hobby) |

> AI is the main variable cost: weekly Haiku reports are ~fractions of a cent each;
> moving to Sonnet or adding voice transcription is what moves the needle. Set an
> Anthropic budget alert (T6/T8) before scaling.
