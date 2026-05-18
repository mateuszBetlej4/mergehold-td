# Mergehold TD

A mobile-first web game inspired by merge defense and roguelike tower-defense games such as Fort Guardian.

The project is planned as a deployable browser game with a simple architecture, clear documentation, and room to grow into accounts, progression saves, leaderboards, analytics, and live operations later.

## Current Stack

- Vite
- React
- TypeScript
- Phaser 3
- Zustand
- Vercel for frontend deployment
- Supabase planned for auth, saves, leaderboards, and remote config
- GitHub planned for source control, issues, and project tracking
- Render optional API starter included under `services/api`

## Documentation

- [Project Plan](docs/PROJECT_PLAN.md)
- [Feature Specification](docs/FEATURE_SPEC.md)
- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Asset Pipeline](docs/ASSET_PIPELINE.md)
- [Development Checklist](docs/DEVELOPMENT_CHECKLIST.md)
- [Deployment Plan](docs/DEPLOYMENT_PLAN.md)
- [Bug Tracker](docs/tracking/BUG_TRACKER.md)
- [Decision Log](docs/tracking/DECISION_LOG.md)

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

- Vercel frontend config: `vercel.json`
- Supabase schema starter: `supabase/migrations/20260518193000_initial_game_schema.sql`
- Optional Render API blueprint: `render.yaml`
- Optional API health endpoint: `services/api/src/server.js`

## GitHub Repo

Planned remote:

```text
https://github.com/mateuszBetlej4/mergehold-td.git
```
