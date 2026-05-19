# Deployment Plan

## Current Production Setup

- **Vercel project:** `mergehold-td`
- **Production URL:** `https://mergehold-td.vercel.app`
- **Latest deployment:** `https://mergehold-el3rb0nqg-mateuszbetlej4s-projects.vercel.app`
- **Supabase project:** `ASAP-MOB-FC` (`xbfkgvfnmtswygxovgcy`)
- **Supabase URL:** `https://xbfkgvfnmtswygxovgcy.supabase.co`
- **Render API target:** `https://mergehold-td-api.onrender.com`
- **Status:** Frontend deployed from `main`; Supabase schema applied; Render is intentionally deferred and is not required for phone testing.

## Initial Deployment

Use Vercel for the frontend.

Expected settings:

- Framework preset: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Install command: `npm install`.
- Config file: `vercel.json`.

## Environment Variables

Required Vercel variables:

```text
VITE_SUPABASE_URL=https://xbfkgvfnmtswygxovgcy.supabase.co
VITE_SUPABASE_ANON_KEY=<Supabase publishable key>
VITE_API_BASE_URL=https://mergehold-td-api.onrender.com
```

Only expose public anon keys through `VITE_` variables. Service role keys must never be shipped to the browser.

These are set in Vercel for Production, Preview, and Development.

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

**Current decision:** Render is flagged as deferred optional infrastructure. Do not treat it as a broken production dependency.

The optional starter API is included under `services/api` with a Render Blueprint in `render.yaml`. It currently exposes:

- `GET /health`
- `GET /api/config` with `features.cloudSaves = true`

Blueprint deeplink:

```text
https://dashboard.render.com/blueprint/new?repo=https://github.com/mateuszBetlej4/mergehold-td
```

Current blocker: the local machine has no `render` CLI, `RENDER_API_KEY` is not set, and Render MCP deployment tools were not exposed in the Codex session. The target `/health` URL currently returns 404, so the Render API service still needs the Blueprint applied or a Render API key provided.

## Render Deferred Checklist

- [x] Frontend is testable on phone without Render.
- [x] Supabase handles auth and cloud saves without Render.
- [x] Vercel has `VITE_API_BASE_URL` reserved for the future Render URL.
- [ ] Deploy Render Blueprint when an API service is actually needed.
- [ ] Provide `RENDER_API_KEY` or apply the Blueprint in the Render Dashboard.
- [ ] Verify `https://mergehold-td-api.onrender.com/health` returns 200 after deployment.
