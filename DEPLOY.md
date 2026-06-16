# Deploying MindCloud to Vercel

Repo: https://github.com/francescoliso/mindcloud-web (private)

> **Current state (June 2026):** every push to `main` auto-deploys via
> **GitHub Actions** (`.github/workflows/deploy.yml`) to **mindcloud.space**.
> `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are already set as GitHub secrets.

---

## How deploys work

```
git push origin main
  → CI: typecheck + lint + test + build
  → Deploy: Vercel build (prisma migrate deploy + next build) → live on mindcloud.space
```

The `vercel-build` script in `package.json` runs `prisma migrate deploy && prisma generate && next build`, so schema migrations are applied automatically on every deploy.

---

## Production environment variables

Set all of these in **Vercel → Settings → Environment Variables (Production)**:

| Variable | Value / notes |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string |
| `DATABASE_URL_UNPOOLED` | Neon **direct/unpooled** connection string (used by Prisma for migrations) |
| `AUTH_SECRET` | `openssl rand -base64 33` |
| `ANTHROPIC_API_KEY` | Claude API key (`sk-ant-…`) |
| `ADMIN_EMAIL` | `admin@mindcloud.space` — the only account that can access `/admin`; also receives contact + feedback emails |
| `APP_URL` | `https://mindcloud.space` — used to build invite and password-reset links |
| `RESEND_API_KEY` | Resend API key (`re_…`) — domain `mindcloud.space` must be verified (DKIM + SPF) |
| `ENCRYPTION_KEY` | `openssl rand -base64 32` — AES-256-GCM key for content at rest |
| `CRON_SECRET` | Any long random string — guards `/api/cron/weekly-reports`; endpoint returns 500 if unset |

After adding or changing any env var, trigger a **redeploy** (Vercel → Deployments → Redeploy latest).

---

## GitHub secrets

| Secret | Where used |
|---|---|
| `VERCEL_TOKEN` | `deploy.yml` — Vercel API token for remote builds |
| `VERCEL_ORG_ID` | `deploy.yml` — already set |
| `VERCEL_PROJECT_ID` | `deploy.yml` — already set |
| `BACKUP_DATABASE_URL` | `backup.yml` — Neon **unpooled** string; nightly `pg_dump` is a no-op until this is set |

---

## Admin account setup

The admin account is **not created via the registration UI** — it is inserted directly into the production database.

1. Generate a bcrypt hash locally:
   ```bash
   node -e "const b=require('bcryptjs');b.hash('yourpassword',12).then(h=>console.log(h))"
   ```
2. In **Neon → SQL Editor**, run:
   ```sql
   INSERT INTO "User" (id, email, "passwordHash", "createdAt")
   VALUES (gen_random_uuid(), 'admin@mindcloud.space', '<hash>', now());
   ```
3. Log in at `mindcloud.space/login` with those credentials → lands on `/admin`.

The admin account is excluded from the `/admin/users` list and all dashboard counts. It cannot access any user routes (`/journal`, `/gratitude`, `/wheel`, etc.).

---

## Nightly database backups

`.github/workflows/backup.yml` runs `pg_dump` daily at 03:00 UTC and uploads the dump as a GitHub Actions artifact (90-day retention).

- Requires the `BACKUP_DATABASE_URL` GitHub secret (Neon unpooled connection string).
- Uses `/usr/lib/postgresql/17/bin/pg_dump` explicitly (Neon runs PG 17; the runner's default `pg_dump` is v16).
- The workflow **no-ops gracefully** if the secret is not set.
- Belt-and-suspenders on top of Neon's built-in point-in-time restore.

---

## Cron job (weekly reports)

`vercel.json` schedules `/api/cron/weekly-reports` every **Monday at 08:00 UTC**.

- Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically.
- The route generates a weekly reflection for every user who had activity in the past week.
- `CRON_SECRET` must match in both Vercel env vars and the codebase.
- If `CRON_SECRET` is not set, the endpoint returns `500` and refuses to run.

---

## Email (Resend)

- Sender: `hello@mindcloud.space`
- Domain verified in Resend dashboard (DKIM + SPF → both **Verified**).
- `RESEND_API_KEY` must be set in Vercel env vars.
- Test locally: `npm run email:test you@example.com` (requires `RESEND_API_KEY` in `.env`).
- Without the key, emails fall back to `console.log` and invite links remain usable via the admin UI copy button.

Emails sent by the app:

| Trigger | Recipient | Subject |
|---|---|---|
| Waitlist join | User | "You're on the MindCloud waitlist" |
| Admin approves invite | User | "Your MindCloud invite is ready" |
| Password reset request | User | "Reset your MindCloud password" |
| Contact form submitted | Admin (`ADMIN_EMAIL`) | "MindCloud contact: \<name\>" |
| Feedback submitted | Admin (`ADMIN_EMAIL`) | "MindCloud feedback from \<email\>" |
| Account deletion | User | "Your MindCloud account has been deleted" |

---

## Smoke test after a fresh deploy

1. Open `https://mindcloud.space` → landing page loads with waitlist form and contact section.
2. Submit the contact form → check admin inbox for the message.
3. Log in as `admin@mindcloud.space` → lands on `/admin`, not `/journal`.
4. `/admin/users` → shows Members section (admin card excluded from Members).
5. `/admin/waitlist` → join the waitlist with a test email at `/`, then Approve & invite → copy the invite link.
6. Open the invite link → fill in first name, last name, date of birth, email, password → account created → `/welcome` feature overview → `/journal`.
7. Write a journal entry, fill gratitude, set mood → all save.
8. Open `/wheel` → set up Life Wheel → radar chart renders.
9. Settings → **Feedback** form → submit → check admin inbox.
10. Settings → Export my data → JSON downloads with readable (decrypted) content.
11. Settings → Dark mode → toggles and persists across reload.
12. Sign out → go to `/login` → click "Forgot password?" → enter email → check inbox → click link → set new password → sign in with new password.
13. Open `/admin` in incognito → redirects away (not accessible to non-admins).

---

## Manual deploy (emergency / CLI)

```bash
cd ~/Desktop/mindcloud-web
vercel --prod
```
