# Deployment Plan

## Initial Deployment

Use Vercel for the frontend.

Expected settings:

- Framework preset: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Install command: `npm install`.
- Config file: `vercel.json`.

## Environment Variables

No environment variables are required for the first static prototype.

Future Supabase variables:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Only expose public anon keys through `VITE_` variables. Service role keys must never be shipped to the browser.

## Release Flow

1. Work on feature branch.
2. Run `npm run build`.
3. Update documentation if scope changes.
4. Log known bugs.
5. Open GitHub PR.
6. Use Vercel preview deployment for QA.
7. Merge to main.
8. Vercel deploys production.

## QA Before Production

- Build completes.
- Game loads on mobile viewport.
- Game loads on desktop viewport.
- Touch/tap works.
- Audio toggles work if audio exists.
- No console errors.
- Known bugs are tracked.
- Asset credits are up to date.

## Rollback Plan

Use Vercel deployment history to promote the previous working production deployment.

## Render Plan

Do not deploy anything to Render for the first version. Add Render only when the product needs a service that should run outside the static frontend and Supabase.

An optional starter API is included under `services/api` with a Render Blueprint in `render.yaml`. It currently exposes:

- `GET /health`
- `GET /api/config`
