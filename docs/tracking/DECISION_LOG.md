# Decision Log

Record meaningful product and technical decisions here so future development has context.

## DEC-001: Use Vite, React, TypeScript, Phaser 3

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Use Vite + React + TypeScript for the web app shell and Phaser 3 for gameplay.
- **Reasoning:** Phaser is purpose-built for browser games, React is better for menus and overlays, and Vite keeps the app simple to build and deploy.

## DEC-002: Use Supabase Later, Not In The MVP

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Start with local persistence, then add Supabase when cloud saves, auth, leaderboards, or remote config are ready.
- **Reasoning:** The first milestone should prove the game loop before adding backend complexity.

## DEC-003: Use Vercel For Frontend Deployment

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Deploy the frontend as a Vite static app on Vercel.
- **Reasoning:** Vercel gives simple previews, production deployments, and GitHub integration for a static React game.

## DEC-004: Reserve Render For Future Services

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Do not use Render in the initial version.
- **Reasoning:** The app does not need a long-running backend yet. Render remains useful later for jobs, workers, or custom APIs.

## DEC-005: Start With CC0-Friendly Asset Sources

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Start with Kenney and Quaternius as the primary asset sources.
- **Reasoning:** They provide broad stylized game asset coverage with simple licensing, making them suitable for rapid development.

## DEC-006: Name The Project Mergehold TD

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Use `Mergehold TD` as the product name and `mergehold-td` as the repository name.
- **Reasoning:** The name directly communicates the merge-defense loop while staying distinct from Fort Guardian.

## DEC-007: Keep Loadouts Local Until Account Saves Exist

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Store selected hero, selected map, best wave, gems, and permanent upgrades in browser local storage for now.
- **Reasoning:** This keeps the MVP playable without backend friction while preserving a clear path to Supabase cloud saves later.
