# Deploying to Render

This repo includes a `render.yaml` Blueprint that provisions:
- a free Postgres database
- the backend as a Node web service
- the frontend as a static site

## Step 0 — generate the initial migration (do this locally first)

Render's `preDeployCommand` runs `prisma migrate deploy`, which only *applies* existing migration files — it doesn't generate them. There's no `prisma/migrations` folder in this repo yet, so before your first deploy, run this once on your own machine (where you have a working internet connection — Prisma needs to download its engine binaries):

```
cd backend
npm install
# point DATABASE_URL at any Postgres you have running locally, e.g.:
#   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/legal_department"
npx prisma migrate dev --name init
```

This creates `backend/prisma/migrations/<timestamp>_init/migration.sql`. Commit that folder — it's what Render will apply to the production database on deploy.

## One-time setup

1. **Push this repo to GitHub** (if you haven't already):
   ```
   cd legal-department-app
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/farukbashar/legal-department-app.git
   git push -u origin main
   ```

2. **Create the Blueprint in Render**:
   - Go to https://dashboard.render.com/blueprints
   - Click "New Blueprint Instance"
   - Connect your GitHub account if you haven't, and select this repo
   - Render will read `render.yaml` and show you the three resources above — click "Apply"

3. **Fill in the two `sync: false` env vars** (Render will prompt for these, or set them after creation):
   - On **legal-department-backend**: set `FRONTEND_URL` to your frontend's Render URL once it's live (e.g. `https://legal-department-frontend.onrender.com`) — this is what CORS checks against.
   - On **legal-department-frontend**: set `VITE_API_URL` to your backend's Render URL + `/api` (e.g. `https://legal-department-backend.onrender.com/api`).

   Note the chicken-and-egg: deploy once first so both URLs exist, then set these two vars and trigger a manual redeploy of each service so the values take effect.

4. **Create your first user.** There's no registration UI yet, so hit the backend directly once it's live:
   ```
   curl -X POST https://legal-department-backend.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"fullName":"Bashar Umar","email":"bashar.umar@rea.gov.ng","password":"<choose one>","role":"admin"}'
   ```
   Then log in at the frontend URL with that email/password.

## What happens on every deploy

- Backend `buildCommand` runs `npm install && npm run build` (installs deps, runs `prisma generate`).
- Backend `preDeployCommand` runs `npm run release` (`prisma migrate deploy`) — applies any pending schema migrations before the new version goes live.
- Frontend `buildCommand` runs `npm install && npm run build`, and Render serves the static `dist/` output.

## Free-tier notes

- Render's free web services spin down after 15 minutes of inactivity and take ~30-60s to wake up on the next request — expected on the free plan, not a bug.
- The free Postgres database expires after 90 days on Render's free tier; you'll need to either upgrade or recreate it before then.

## Local development still works the same way

Nothing about local dev changes — `npm run dev` in `backend/` and `frontend/` against your local Postgres, as before. The Render env vars only apply to the deployed instance.
