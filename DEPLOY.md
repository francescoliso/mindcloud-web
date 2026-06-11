# Deploying MindCloud to Vercel

Repo: https://github.com/francescoliso/mindcloud-web (private)

> **Current state (June 2026):** every push to `main` auto-deploys via
> **GitHub Actions** (`.github/workflows/deploy.yml`) to **mindcloud.space**.
> One-time setup: add `VERCEL_TOKEN` as a GitHub secret (see step 1 below).
> `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are already set.

## 1. One-time: add VERCEL_TOKEN to GitHub

1. Go to **vercel.com → Account Settings → Tokens → Create**.
2. Name: `github-actions`, Type: **Classic Token**, Expiration: as preferred.
3. Copy the token.
4. Go to **github.com/francescoliso/mindcloud-web → Settings → Secrets → Actions → New secret**.
5. Name: `VERCEL_TOKEN`, Value: paste the token.

After this, `git push origin main` triggers CI then deploys automatically.

---

## Alternative: Vercel CLI (manual deploy)
From `~/Desktop/mindcloud-web`:
```bash
vercel --prod
```

## 2. Create the production database (Vercel Postgres)
In the Vercel dashboard → your project → **Storage** → **Create Database** → **Postgres**.
Connecting it auto-adds connection env vars to the project, including:
- `DATABASE_URL` — **pooled** connection (use this for the app at runtime)
- a non-pooled / direct URL (named `DATABASE_URL_UNPOOLED` or `POSTGRES_URL_NON_POOLING`) — use this for migrations

If Prisma's `DATABASE_URL` isn't set automatically, add it manually pointing at the **pooled** string.

## 3. Set the remaining env vars
In Vercel → **Settings → Environment Variables (Production)**:

| Variable | Value |
|---|---|
| `ANTHROPIC_API_KEY` | your Claude key (`sk-ant-…`) |
| `AUTH_SECRET` | `openssl rand -base64 33` |
| `ADMIN_EMAIL` | your email — bootstraps admin + `/admin/waitlist` access |
| `APP_URL` | your `https://…vercel.app` URL (for invite links) |
| `GMAIL_USER` | your Gmail address *(optional — for emails)* |
| `GMAIL_APP_PASSWORD` | a 16-char Google App Password *(optional)* |

Email is optional: without `GMAIL_*`, invite links still appear (copyable) on the admin page.
Changing env vars requires a **redeploy** to take effect.

## 4. Create the tables in the production DB (one time)
Run the migration against the **direct/unpooled** connection string (pooled connections can stall on migration locks):
```bash
vercel env pull .env.production.local          # fetches the DB URLs locally
# then, using the unpooled URL from that file:
DATABASE_URL="<UNPOOLED_URL>" npx prisma migrate deploy
```

## 5. (Optional) Migrate your old Supabase data
With `SUPABASE_SERVICE_ROLE_KEY`, `MIGRATE_USER_EMAIL`, `MIGRATE_USER_PASSWORD`, and the prod
`DATABASE_URL` set in `.env`:
```bash
npm run migrate:supabase
```

## 6. Deploy
```bash
vercel --prod
```

Vercel runs `vercel-build` (`prisma generate && next build`). On success it prints your live URL.

## Smoke test the deployment
1. Open the URL → the **landing page** with a waitlist form.
2. **Bootstrap admin:** go to `/signup`, register with the `ADMIN_EMAIL` address → you land on `/welcome` (onboarding) → "Start journaling".
3. Visit `/admin/waitlist` → join the waitlist with another email at `/`, then **Approve & invite** it → open the copied invite link → set a password → account created.
4. Journal: add an entry + tap a mood. Gratitude: fill all three → it locks for the day.
5. Reports: **Generate this week** → a report appears (needs `ANTHROPIC_API_KEY`).
6. (If email configured) `npm run email:test you@addr` sends a test via Gmail SMTP.

## Notes
- `vercel-build` is set so the Prisma client is regenerated on every deploy.
- Secrets live only in Vercel env vars and the gitignored local `.env` — never in the bundle.
- Future schema changes: `prisma migrate dev` locally → commit → `prisma migrate deploy` against prod.
