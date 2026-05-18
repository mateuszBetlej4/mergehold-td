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

## DEC-008: Spike Traps Use Dedicated Path Pads

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Place spike traps only on path-adjacent trap pads, separate from tower build slots, with a second picker row and proximity-triggered damage.
- **Reasoning:** Keeps tower placement simple while making traps feel distinct and lane-focused without a full path-tile editor.

## DEC-009: Barracks Share Tower Build Pads

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Place barracks on the same build pads as towers (one structure per pad) and spawn tier-based friendly troops that chase, attack, and block enemies.
- **Reasoning:** Reuses the existing placement UX while adding lane pressure without a separate barracks grid.

## DEC-010: Coin Mill Income On Wave Clear

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Pay coin mill income when a wave is cleared, before the upgrade picker opens, and show the payout on the wave-cleared overlay.
- **Reasoning:** Matches the building description, gives immediate feedback, and reinforces economy planning between waves.

## DEC-011: Pause And Speed Use Phaser Time Scale

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Add in-run Pause and 1x/1.5x speed buttons that drive `this.time.timeScale`, freezing wave timers and combat while paused.
- **Reasoning:** Gives mobile players quick control without a separate settings screen and keeps wave pacing, spawns, and cooldowns in sync.

## DEC-012: Dated Handoffs In docs/handoffs/

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Store agent session handoffs in `docs/handoffs/` as dated files (`YYYY-MM-DD.md`) with `LATEST.md` pointing to the newest. Create or replace a handoff only when the user explicitly asks—not after every task.
- **Reasoning:** Keeps history, avoids stale auto-handoffs, and makes the next session’s entry point obvious.

## DEC-013: Stone Walls Grant Refilling Fort Shield

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Stone walls on build pads add a pooled fort shield (18 × tier per wall). The pool absorbs incoming fort damage and refills to max when a new wave starts.
- **Reasoning:** Matches the wall role, gives a distinct defensive economy choice on shared pads, and telegraphs protection with HUD shield + hit flash.

## DEC-014: Healing Shrine Repairs After Boss Waves

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Healing shrines on build pads restore fort HP (12 × tier per shrine) when a boss wave (every 5 waves) is cleared, shown on the wave-cleared overlay.
- **Reasoning:** Ties support buildings to boss pacing and rewards shrine investment without passive regen every wave.

## DEC-015: Manual Start Wave Between Upgrades

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** After picking a roguelike upgrade, show a Start Wave button instead of auto-spawning the next wave. The first wave still starts on run begin.
- **Reasoning:** Gives players time to build or merge after upgrades and matches the planned start-wave control from the handoff checklist.

## DEC-016: Tiled Grass And Path-Dot Map (No Vector Path Stroke)

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Render run map ground with tiled `kenney-grass` (map-tinted) and the lane with stamped `kenney-path-dot` tiles. Do not draw a Phaser `graphics` vector path on top.
- **Reasoning:** Path-dot tiles read well alone; a semi-transparent vector stroke stacked on dots produced an unwanted light-gray “radiant” band. Map theme still comes from `maps.ts` palette tints.

## DEC-017: Bat And Bomber Use Tinted Project SVGs

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** `bat` uses Phaser key `enemy-runner` (SVG); `bomber` uses `enemy-grunt` (SVG), each tinted with `enemyDefinitions[].color`. Other enemies keep Kenney PNGs.
- **Reasoning:** Differentiates flyer/exploder silhouettes without new downloads; PNG runner/grunt remain for `runner` and `grunt` wave types.

## DEC-018: Archer Arrow Projectile And Troop Role Tints

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Archer tower fires `projectile-arrow` SVG; cannon and magic keep `kenney-projectile`. Barracks troops tint `hero-guardian` by troop role (blocker / ranged / burst), not a single barracks color.
- **Reasoning:** Clearer combat read at low resolution using assets already in `optimized/sprites/`.

## DEC-019: Per-Texture Sprite Facing Offsets

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Rotate towers, enemies, troops, and directional projectiles using a `spriteFacingOffset` map keyed by texture name, plus `rotateSpriteToward()` with `Angle.RotateTo` smoothing. Kenney units face up or right at rotation 0 depending on asset; offsets were set per inspected sprite.
- **Reasoning:** Phaser angle 0 is east; art-forward varies by file. Central map avoids wrong 90° facing and documents tuning in `docs/GRAPHICS.md`.
