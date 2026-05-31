# Deploying MindCloud to Vercel

Prerequisites: a Vercel account, and the CLI logged in (`vercel login`).

## 1. Link the project
From `~/Desktop/mindcloud-web`:
```bash
vercel link
```
Accept the prompts (create a new project named `mindcloud-web`).

## 2. Create the production database (Vercel Postgres)
In the Vercel dashboard → your project → **Storage** → **Create Database** → **Postgres**.
Connecting it auto-adds connection env vars to the project, including:
- `DATABASE_URL` — **pooled** connection (use this for the app at runtime)
- a non-pooled / direct URL (named `DATABASE_URL_UNPOOLED` or `POSTGRES_URL_NON_POOLING`) — use this for migrations

If Prisma's `DATABASE_URL` isn't set automatically, add it manually pointing at the **pooled** string.

## 3. Set the remaining env vars
```bash
vercel env add ANTHROPIC_API_KEY production   # paste your ROTATED key
vercel env add AUTH_SECRET production          # paste: openssl rand -base64 33
```
(Add them to `preview`/`development` too if you want those environments to work.)

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
1. Open the URL → you should be redirected to `/login`.
2. Sign up → land on `/journal`. Add an entry; it appears newest-first.
3. Gratitude: fill all three → it locks (read-only) for the day.
4. Reports: **Generate this week** → a report appears (needs `ANTHROPIC_API_KEY`).

## Notes
- `vercel-build` is set so the Prisma client is regenerated on every deploy.
- Secrets live only in Vercel env vars and the gitignored local `.env` — never in the bundle.
- Future schema changes: `prisma migrate dev` locally → commit → `prisma migrate deploy` against prod.
