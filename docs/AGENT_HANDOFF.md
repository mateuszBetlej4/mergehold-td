# Agent Handoff — Mergehold TD

**Last updated:** 2026-05-18  
**Repo:** https://github.com/mateuszBetlej4/mergehold-td.git  
**Branch:** `main` (synced with `origin/main`)  
**Local dev:** `npm install` → `npm run dev` → http://127.0.0.1:5173/ (or http://localhost:5173/)

---

## What this project is

**Mergehold TD** is a mobile-first merge / tower-defense web game (Fort Guardian–inspired, own identity). Players place and merge defenses, clear waves, pick roguelike upgrades, and earn meta progression between runs.

**Stack:** Vite + React + TypeScript + Phaser 3 + Zustand.  
**Deploy plan:** Vercel (frontend), Supabase later (auth/saves/leaderboards), optional Render API under `services/api` (not needed for gameplay MVP).

---

## Architecture (do not restart from scratch)

| Layer | Location | Responsibility |
|-------|----------|----------------|
| App shell / menus | `src/app/App.tsx`, `src/app/App.css` | Portrait mobile frame, bottom nav, all non-Phaser screens |
| Global state | `src/state/useGameStore.ts` | Screen routing, localStorage save, gems, permanent upgrades, hero/map selection, run snapshot |
| Phaser game | `src/game/GameCanvas.tsx`, `src/game/config.ts` | Mounts Phaser; single scene `RunScene` |
| Run logic | `src/game/scenes/RunScene.ts` | **Main gameplay file** (~1500+ lines) — waves, build/merge, combat, upgrades |
| Data | `src/data/*.ts` | Buildings, enemies, heroes, maps, troops, upgrades, waves |
| Assets | `public/assets/optimized/sprites/` | Runtime SVG/PNG; Kenney source in `public/assets/source/kenney/` |
| Docs | `docs/` | Plan, checklist, architecture, tracking |
| Credits | `public/assets/licenses/ASSET_CREDITS.md` | Kenney attribution |

**Conventions (follow these):**
- Keep game data in `src/data`, not hardcoded in scene (except small layout constants like path points).
- Prefer small slices: implement → `npm run build` → browser test → update checklist/decision log → commit → push.
- Do **not** revert existing work or add unnecessary abstractions.
- `RunScene.ts` is the right place for run logic unless a clear helper extract is warranted.
- Phaser bundle >500 kB warning is expected; do not code-split unless asked.

---

## Recent commits (newest first)

```
f97366a Add pause and speed controls to the run
6fcb9c2 Add coin mills with between-wave income
f376a1f Add barracks with spawning friendly troops
98a9d10 Add playable spike traps on path pads
0fdaa0a Add hero ability gameplay
```

Earlier: local progression, hero/map loadouts, Kenney sprites, React shell.

---

## What is implemented

### React shell
- Home (start run, stats, loadout shortcuts)
- Play (full-screen Phaser canvas)
- Upgrades (permanent upgrades for gems)
- Collection (buildings, heroes, enemies, maps, troops, upgrades — read-only catalogs)
- Settings (reset save, etc.)
- Deploy screen (deployment info)

### Phaser run (`RunScene.ts`)
- Fort HP, waves, coins HUD
- Enemy path, multiple enemy types, boss every 5 waves
- **Towers** on 6 build pads (`+`): Archer, Cannon, Magic — picker row 1; tap pad to place; tap again to merge (15 coins, tiers)
- **Spike traps** on 5 path-adjacent trap pads (`!`): unlock wave 2; proximity damage + cooldown pulse
- **Barracks** on build pads (exclusive with towers): unlock wave 4; spawns troops from `troops.ts` by tier (Squire/Longbow/Alchemist)
- **Coin mills** on build pads: unlock wave 3; income `12 × tier` paid on wave clear (before upgrade picker); shown on overlay
- **Hero ability** button (guardian heal / ranger volley / mage lane burn) — loadout from `useGameStore`
- **Map palette** tints ground/path from selected map
- **Roguelike upgrades** between waves (3 cards, stackable)
- **Pause** + **1x/1.5x speed** (top-left; `time.timeScale`; frozen during upgrade picker)
- Game over → gem rewards → tap to restart

### Progression (`useGameStore`)
- localStorage: best wave, gems, permanent upgrades (fort HP, starting coins, tower damage)
- Hero/map selection with unlock by best wave
- End-of-run gem claim

### Buildings in data but NOT playable in-run yet
- `stone-wall` — `role: "wall"`
- `healing-shrine` — `role: "support"`

These appear in Collection → Buildings only.

---

## Picker layout (row 2, y≈612)

| X (approx) | Building | Unlock label when locked |
|------------|----------|---------------------------|
| 52 | Spike trap `S $25` | W2 |
| 108 | Coin mill `$ $40` | W3 |
| 164 | Barracks `B $55` | W4 |

Row 1 (y≈656): three towers + hero ability (right).

**Build modes:** `selectedBuildMode`: `"tower" | "trap" | "barracks" | "mill"`.  
Trap uses trap pads only; barracks/mill/towers share build pads (one structure per pad).

---

## Key files to read first

1. `docs/DEVELOPMENT_CHECKLIST.md` — tick items when done
2. `docs/tracking/DECISION_LOG.md` — log product/tech decisions (DEC-001 … DEC-011)
3. `src/game/scenes/RunScene.ts` — all run gameplay
4. `src/data/buildings.ts` — costs, tiers, unlock waves, stats
5. `src/state/useGameStore.ts` — persistence API

---

## Browser testing notes

- Resize viewport ~390×844 for mobile frame.
- Phaser canvas is not in a11y tree — use `browser_take_screenshot` then `browser_mouse_click_xy` with **fresh screenshot coords** for gameplay clicks.
- Upgrade cards: click center of first card (~195, 305 in screenshot space worked in prior session).
- Dev server: `npm run dev` → port 5173.

---

## Open checklist items (good next work)

**Gameplay / polish**
- [ ] Stone wall (data exists — fort shield on pad or passive fort buffer)
- [ ] Healing shrine (boss wave fort repair)
- [ ] Rarity weights + reroll for upgrade picker
- [ ] Manual “Start next wave” button (waves auto-end after spawn delay today)
- [ ] Building unlock badges in Collection (reflect `unlockWave` vs `bestWave`)
- [ ] Sound/music toggles (settings exist as stubs?)

**Assets**
- [ ] Quaternius pack, UI pack, SFX

**Deploy**
- [ ] Vercel project, preview/prod
- [ ] Asset credits screen/link visible in app

**Backend (later only)**
- Supabase auth, cloud saves, leaderboards — schema starter in `supabase/migrations/`

---

## Git workflow

```bash
git status --short --branch
npm run build
# test at http://127.0.0.1:5173/
git add <files>
git commit -m "Clear message"
git push
```

- Only commit when doing a completed slice (user expects proactive commit+push after meaningful work).
- On Windows PowerShell use simple `-m "message"` (no heredoc).
- Never force-push main, never skip hooks, never update git config.

---

## Known issues / quirks

- Waves can feel fast; pause/speed helps testing.
- `rg` may not be in PATH on Windows; use IDE search or `Grep` tool.
- Right-hand “builder panel” in `App.tsx` shows on wide desktop — game is in left mobile frame.

---

## Suggested prompt for next agent session

Copy everything below into a new chat:

---

You are continuing **Mergehold TD** — do not restart from scratch.

**Read first:** `docs/AGENT_HANDOFF.md`, `docs/DEVELOPMENT_CHECKLIST.md`, `src/game/scenes/RunScene.ts`.

**Repo:** `C:\Users\mateuszb\Documents\AI Projects\TD`  
**GitHub:** https://github.com/mateuszBetlej4/mergehold-td.git  
**Dev:** `npm run dev` → http://127.0.0.1:5173/

**Done:** towers, spike traps, barracks+troops, coin mills, hero abilities, hero/map loadouts, local progression, pause/1.5x speed, Kenney assets.

**Not in-run yet:** stone wall, healing shrine.

**Your job:** Audit current state (git status, browser test Play screen), then implement the next checklist slice (stone wall or wave-start UI recommended). Build, test, update docs, commit, push. Match existing code style; keep changes focused.

---
