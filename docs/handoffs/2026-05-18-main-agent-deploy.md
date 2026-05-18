# Main agent handoff — Deploy, Supabase, auth & cloud saves (2026-05-18)

> **Role:** Primary / integration agent — ship production infrastructure and wire cloud persistence. You have access to **Vercel**, **Render**, and **Supabase** (via dashboard, CLI, or MCP). Execute end-to-end **without blocking on the user** unless credentials are missing.
>
> **Repo:** https://github.com/mateuszBetlej4/mergehold-td.git  
> **Branch:** `main` (HEAD `7751309` as of this handoff)  
> **Workspace:** `C:\Users\mateuszb\Documents\AI Projects\TD`  
> **Dev:** `npm install` → `npm run dev` → http://127.0.0.1:5173/ (or next free Vite port)  
> **Viewport:** 390×844 mobile portrait; Phaser canvas 390×694 (`src/game/config.ts`)

---

## Executive summary

**2026-05-18** was a full vertical slice day: graphics polish, bug sweeps, meta progression, economy/balance passes, audio MVP, and **per-map multi-route lane design**. The game is **playable offline** with `localStorage` persistence (`mergehold-td-progress-v1`). **No cloud backend is wired yet** — Supabase schema and Render API stubs exist but the client still only reads/writes local storage.

**Your mission:** Deploy the static frontend on **Vercel**, optional API on **Render**, and make the game **account-backed** with **Supabase Auth + `player_saves` sync** so progress survives devices. User login, progress tracking, and all DB-related state live in Supabase.

---

## What is done vs not done

| Area | Status | Notes |
|------|--------|-------|
| React shell + Phaser run loop | **Done** | `App.tsx`, `RunScene.ts`, `PlayHud.tsx` |
| Combat, waves, upgrades, buildings | **Done** | `src/data/*`, DEC-029–032 |
| Meta gems, `bestWave`, unlocks | **Done** | DEC-020 hybrid rewards |
| Audio SFX + music | **Done** | DEC-033, `audioManager.ts`, `menuMusic.ts` |
| Per-map layouts (4 maps, multi-route) | **Done** | DEC-034, `mapLayouts.ts` |
| Local persistence | **Done** | `useGameStore.ts` → `localStorage` |
| Supabase schema migration | **File only** | `supabase/migrations/20260518193000_initial_game_schema.sql` — **not applied in prod** |
| Supabase client in app | **Dependency only** | `@supabase/supabase-js` in `package.json`, **no `src/lib/supabase.ts`** |
| Auth UI | **Not started** | No login/signup screens |
| Cloud save load/save | **Not started** | No sync layer |
| Vercel production deploy | **Not started** | `vercel.json` ready |
| Render API deploy | **Not started** | `render.yaml` + `services/api` ready |
| Leaderboards | **Schema only** | `leaderboard_runs` table, no UI/API |
| `DEBUG_UNLOCK_ALL_MAPS` | **`true`** | **Set `false` before public launch** (`src/data/maps.ts`) |

---

## Today's commits (`main`, 2026-05-18)

| Commit | Summary |
|--------|---------|
| `7751309` | **DEC-034:** Multi-route `mapLayouts.ts`, `mapPathUtils.ts`, `mapWaves.ts`; route AI; tower pads off-path (`pushTowerPadsOffPath`); playtest screenshots; `npm run audit:maps` |
| `4a7ef52` | **DEC-033:** Audio assets + `AudioManager`, `sounds.ts`, menu music |
| `c2a1a91` | Docs: economy + balancing handoff/tracker updates |
| `d830470` | Asset pipeline + balance doc enhancements |
| `15223da` | **DEC-029/030:** `waves.ts` spawn tables, shield/bat/bomber/splash behaviors |
| `d657240` | Enemy facing offsets + balancing handoff |
| `7c90493` | Bug tracker + gameplay mechanics |
| `7e2cd65` | BUG-001–005 verified |
| `6e12092` | Runner facing fix |
| `66d14d6` | Bug-fix handoff |
| `508de3e` | Graphics docs + collection UI sprites |
| `846ad9b` | Run abandon confirm + wave clear rewards |
| `b1d2bb4` | Graphics polish, rotation, audit handoff |
| `c0f9b29` | Reuse Kenney sprites for run map |
| `03c6413` | Graphics agent handoff |

---

## Decision log summary (DEC-001 → DEC-034)

Full text: [`docs/tracking/DECISION_LOG.md`](../tracking/DECISION_LOG.md)

### Foundation (pre–2026-05-18, still binding)

| ID | Decision |
|----|----------|
| DEC-001 | React shell + Phaser game, Vite |
| DEC-002 | Supabase **later** for MVP — **you are implementing “later” now** |
| DEC-003 | Vercel for frontend static deploy |
| DEC-004 | Render reserved for optional API/workers |
| DEC-005 | Data-driven gameplay in `src/data/` |
| DEC-006 | Local storage for progress (to be **extended**, not removed, until cloud hydrate works) |

### 2026-05-18 gameplay / UX (implemented)

| ID | Decision |
|----|----------|
| DEC-008–015 | Spike traps on path pads; barracks share tower pads; coin mill on wave clear; pause/speed; stone wall shield; healing shrine on boss waves; manual Start Wave |
| DEC-016–019 | Grass + path-dot map; bat/bomber SVGs; arrow projectile; per-texture `spriteFacingOffset` |
| DEC-020 | **Hybrid meta:** gem drip on wave clear + fort-loss bonus; `bestWave` on clear; forfeit keeps drips |
| DEC-021–028 | Enemy facing offsets (grunt family = 0, boss = π/2) |
| DEC-022 | Audio in progress blob; Deploy screen **DEV-only** |
| DEC-023 | Catalog sprites mirror run keys |
| DEC-024 | Leave run = confirm abandon; `RunEndSummaryModal`; no mid-run resume |
| DEC-025 | Tiered enemy intro (bat W6+, bomber W8+) — superseded spawn **counts** by DEC-029 |
| DEC-029 | `waves.ts` explicit W1–15 + procedural budget; HP `+ wave×6` |
| DEC-030 | Distinct upgrade/enemy behaviors (armor, flyer, bomber explode, cannon splash, magic priority) |
| DEC-031 | Economy: kill rewards, mill 15×tier, gem fort-bonus cap, Merchant's Ledger |
| DEC-032 | Build/tier sinks; stipend 25 (+10 boss); wave pressure W4/7–9 |
| DEC-033 | CC0 audio; Phaser SFX + React menu music |
| DEC-034 | Per-map layouts; multi-route; route AI; per-map waves; traps on-path / towers off-path |

---

## Bugs fixed / verified today

Tracker: [`docs/tracking/BUG_TRACKER.md`](../tracking/BUG_TRACKER.md)

### Verified (audit + sweep BUG-001–020)

Includes: fort HP HUD, wave spawn budget, bat/bomber in waves, runner/tank/shield facing, upgrade overlay clipping, leave-run confirm, deploy hidden in prod, collection sprites, meta gems/`bestWave`, and more — see **Fixed Bugs** sections in tracker.

### Active (do not block deploy; optional follow-ups)

| ID | Title | Severity |
|----|-------|----------|
| BUG-021 | Troop HP + upgrade reroll not in gem shop | S3 |
| BUG-022 | Roguelike upgrades equal weight (no rarity) | S4 |
| BUG-023 | Economy tuning | **Verified** (DEC-032) |

---

## Architecture (current)

```text
┌─────────────────────────────────────────────────────────┐
│  Vercel (static) — React 19 + Vite 8                     │
│  src/app/App.tsx          menus, collection, settings    │
│  src/app/PlayHud.tsx      in-run dock, pause, leave      │
│  src/game/GameCanvas.tsx  Phaser host                    │
│  src/game/scenes/RunScene.ts  combat, waves, layout      │
│  src/state/useGameStore.ts    Zustand + localStorage     │
└───────────────────────┬─────────────────────────────────┘
                        │  (not wired yet)
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase — Auth + Postgres + RLS                        │
│  profiles, player_saves, leaderboard_runs, inventory,    │
│  remote_config                                           │
└───────────────────────┬─────────────────────────────────┘
                        │  optional
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Render — services/api (Node HTTP)                       │
│  GET /health, GET /api/config (feature flags stub)       │
└─────────────────────────────────────────────────────────┘
```

### Key runtime files

| Path | Role |
|------|------|
| `src/state/useGameStore.ts` | **Single source of player progress** today; `saveKey = "mergehold-td-progress-v1"` |
| `src/game/scenes/RunScene.ts` | Run loop; calls `recordWaveClear`, `claimRunRewards`; layout from `getMapLayout()` |
| `src/data/waves.ts` | Global wave tables |
| `src/data/mapWaves.ts` | Per-map wave scaling/overrides |
| `src/data/mapLayouts.ts` | Routes, pads, fort, decor per map |
| `src/data/mapPathUtils.ts` | Trap snap, `pushTowerPadsOffPath` |
| `src/game/audio/audioManager.ts` | Phaser SFX |
| `src/app/menuMusic.ts` | React menu BGM |
| `vercel.json` | SPA rewrite, build `dist` |
| `render.yaml` | Render blueprint |
| `supabase/migrations/20260518193000_initial_game_schema.sql` | DB schema + RLS |
| `.env.example` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL` |

### Balance reference

[`docs/balance/GAME_BALANCE.md`](../balance/GAME_BALANCE.md) — all combat/economy numbers and map wave profiles.

### Graphics reference

[`docs/GRAPHICS.md`](../GRAPHICS.md) — path dots, facing offsets, depth order.

### Map playtest

[`docs/playtest/2026-05-18-map-layout-audit.md`](../playtest/2026-05-18-map-layout-audit.md) + PNG screenshots per map.

---

## Local persistence contract (must map to Supabase)

**Storage key:** `mergehold-td-progress-v1`  
**Type:** `PlayerProgress` in `useGameStore.ts`

```ts
type PlayerProgress = {
  softCurrency: number;        // gems
  bestWave: number;            // unlock gate (cleared waves)
  selectedHeroId: string;      // e.g. "stone-warden"
  selectedMapId: string;       // greenwatch | sunspire | frostgate | underkeep
  permanentUpgrades: {
    fortHp: number;
    startingCoins: number;
    towerDamage: number;
    coinGain: number;
  };
  soundEnabled: boolean;
  musicEnabled: boolean;
};
```

**Meta rules (DEC-020):**

- `recordWaveClear(wave)` → `bestWave = max(...)`, `softCurrency += max(3, floor(wave * 2))`
- `claimRunRewards` on fort death → fort bonus gems (see DEC-031 formula in store)
- `forfeitRun` → keep drips, no fort bonus
- Hero/map unlock: `progress.bestWave >= getUnlockWave(unlock string)` unless `DEBUG_UNLOCK_ALL_MAPS`

**Suggested `player_saves` mapping:**

| DB column | Source |
|-----------|--------|
| `best_wave` | `progress.bestWave` |
| `soft_currency` | `progress.softCurrency` |
| `hard_currency` | `0` or future IAP |
| `permanent_upgrades` | `progress.permanentUpgrades` |
| `settings` | `{ soundEnabled, musicEnabled, selectedHeroId, selectedMapId }` |
| `unlocked_content` | optional JSON for explicit unlocks if you decouple from `bestWave` |
| `save_version` | `1` — bump on breaking migrations |

On login: **hydrate Zustand from `player_saves`**. On every `saveProgress()` (or debounced): **upsert `player_saves`**. Keep localStorage as offline cache / guest fallback if product allows guest play.

---

## Supabase (already in repo)

### Migration file

`supabase/migrations/20260518193000_initial_game_schema.sql`

**Tables:**

- `profiles` — `id` → `auth.users`, `display_name`
- `player_saves` — one row per user (PK `user_id`)
- `leaderboard_runs` — public read, user insert own rows
- `player_inventory` — optional content unlocks
- `remote_config` — seed row `starter_balance`

**RLS:** enabled; owner policies on saves/profiles; leaderboard select public.

### Your Supabase tasks

1. Create Supabase project (or use existing org project).
2. Run migration via **Supabase CLI** (`supabase db push`) or SQL editor.
3. Enable **Email** auth (magic link or email/password — pick one, implement UI).
4. Optional: Google OAuth if quick via dashboard.
5. Copy **Project URL** + **anon public key** → Vercel env vars (never service role in browser).
6. Implement `src/lib/supabase.ts` (browser client).
7. Implement `src/services/progressSync.ts` (or similar): `loadSave(userId)`, `upsertSave(progress)`.
8. Wire auth gate: unauthenticated users → Login screen; authenticated → hydrate store on app boot.
9. Handle **first login:** insert `profiles` + default `player_saves` row (trigger or client).
10. Test cross-browser: play → earn gems → logout → login → progress restored.

### Auth UI placement

Minimal acceptable:

- New screen or modal: Sign in / Sign up / Sign out
- Entry: Settings + gate Home if no session (product choice: allow guest + “Link account” vs force login — **recommend guest local + optional sign-in to cloud sync** unless user said otherwise; handoff said user login required for deploy phase — **implement login for cloud save**).

Store session with `supabase.auth.onAuthStateChange`.

---

## Vercel deployment

### Config (ready)

`vercel.json`:

- `buildCommand`: `npm run build`
- `outputDirectory`: `dist`
- SPA rewrite all routes → `index.html`

### Environment variables (Vercel project settings)

```text
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_BASE_URL=https://mergehold-td-api.onrender.com   # after Render deploy
```

### Steps

1. Connect GitHub repo `mateuszBetlej4/mergehold-td` to Vercel.
2. Framework: Vite; root directory `.`
3. Add env vars above.
4. Deploy `main`; verify preview URL loads game @ 390×844.
5. `npm run build` must pass locally first.
6. Confirm **no** `import.meta.env.DEV` Deploy tile in production bundle (DEC-022).
7. Set `DEBUG_UNLOCK_ALL_MAPS = false` in `maps.ts` before marketing deploy.

### Post-deploy QA

- Play W1, clear wave, see gem drip
- Lose fort, see summary modal + gems
- Settings audio toggles persist (local + cloud after sync)
- No console errors on mobile emulation

---

## Render API deployment

### Existing service

- `services/api/src/server.js` — Node HTTP
- `GET /health` → `{ ok: true, service: "mergehold-td-api" }`
- `GET /api/config` → feature flags (`cloudSaves: false` today — **flip to true when Supabase sync ships**)

### Blueprint

`render.yaml` — free web service, `rootDir: services/api`, health check `/health`.

### Steps

1. Create Render account / connect repo.
2. Apply blueprint or manual Web Service from `services/api`.
3. Note public URL → set `VITE_API_BASE_URL` on Vercel.
4. Optional phase 2: add authenticated endpoints (e.g. validate runs, anti-cheat) — **not required for MVP cloud save** (client can talk to Supabase directly with RLS).

### CORS

`server.js` already sets `access-control-allow-origin: *` for JSON responses.

---

## Recommended implementation order

```text
Phase A — Ship static (1–2h)
  1. npm run build
  2. Vercel connect + env placeholders
  3. Smoke test production URL

Phase B — Supabase backend (2–4h)
  4. Apply migration
  5. supabase client + auth UI
  6. Hydrate/upsert player_saves
  7. Debounced save on store changes

Phase C — Render (30min)
  8. Deploy API
  9. Update VITE_API_BASE_URL
  10. Flip cloudSaves in /api/config when ready

Phase D — Hardening (1–2h)
  11. DEBUG_UNLOCK_ALL_MAPS = false
  12. Error states (offline, auth expired)
  13. Migration save_version
  14. Update DECISION_LOG (DEC-035 deploy + cloud saves)
  15. Update BUG_TRACKER / close deploy-related items
  16. Document production URLs in README or DEPLOYMENT_PLAN.md
```

---

## Code changes checklist (concrete)

### New files (suggested)

```text
src/lib/supabase.ts              — createClient(VITE_SUPABASE_*)
src/services/playerSave.ts       — map PlayerProgress ↔ player_saves row
src/app/AuthScreen.tsx           — login/signup/signout
src/hooks/useAuth.ts             — session state
```

### Modify

```text
src/state/useGameStore.ts        — after saveProgress: call cloud upsert if authed
src/app/App.tsx                  — auth routes, boot hydrate, Settings sign out
src/data/maps.ts                 — DEBUG_UNLOCK_ALL_MAPS = false (prod)
.env.example                     — document all vars
docs/DEPLOYMENT_PLAN.md          — production URLs, steps done
docs/tracking/DECISION_LOG.md    — DEC-035
```

### Do not break

- Phaser `RunScene` reward hooks
- DEC-024 abandon flow
- Audio toggles
- Per-map layout loading (`selectedMapId`)

---

## Environment & secrets

| Variable | Where | Secret? |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | Vercel | Public |
| `VITE_SUPABASE_ANON_KEY` | Vercel | Public (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | Render / CI only | **Never in Vite** |
| `VITE_API_BASE_URL` | Vercel | Public URL |

`.env.local` for dev (gitignored). Copy from `.env.example`.

---

## Plugins / tools

You should use platform tooling directly:

- **Supabase:** dashboard SQL, Auth providers, API keys; CLI if installed (`supabase link`, `db push`)
- **Vercel:** dashboard or `vercel` CLI deploy; Git integration
- **Render:** dashboard blueprint deploy from `render.yaml`
- **GitHub:** `gh` for repo/PR if needed

If MCP servers exist for these in the user’s Cursor setup, prefer them for provisioning.

**Do not ask the user to click through setup** unless API tokens are missing from the environment — document what you created and which env vars were set.

---

## Map / gameplay notes for deploy agent (avoid regressions)

- **Four maps** with **2–3 routes** each; enemies pick route on spawn (`pickEnemyRoute` in `RunScene.ts`).
- **Traps** on path (gold spike icon); **towers** off path (white circles, ≥56px from lane).
- **`npm run audit:maps`** validates layout spacing.
- **Shared global waves** + **`mapWaves.ts`** per-map multipliers — do not delete.

---

## Git workflow

```bash
git checkout main
git pull
npm run build
# ... implement ...
npm run build
git add -A
git commit -m "Deploy: Vercel production, Supabase auth and cloud saves, Render API"
git push origin main
```

Vercel auto-deploys on push to `main` if connected.

---

## Success criteria (definition of done)

- [ ] Production URL on Vercel loads game; `npm run build` clean
- [ ] User can **sign up / sign in** (Supabase Auth)
- [ ] `player_saves` persists `bestWave`, gems, upgrades, hero/map selection, audio settings
- [ ] Refresh / new device restores progress after login
- [ ] Render `/health` returns 200; optional config reflects `cloudSaves: true`
- [ ] `DEBUG_UNLOCK_ALL_MAPS` false in production
- [ ] DEC-035 added to `DECISION_LOG.md`; deploy doc updated
- [ ] No service role key in client bundle (grep check)

---

## Copy-paste prompt for main agent

---

You are the **main integration agent** for **Mergehold TD**.

1. Read **`docs/handoffs/2026-05-18-main-agent-deploy.md`** in full (this file).
2. Read **`docs/tracking/DECISION_LOG.md`** (DEC-020 meta, DEC-034 maps) and **`docs/DEPLOYMENT_PLAN.md`**.
3. **Deploy frontend** to Vercel from `main` (`vercel.json`, `npm run build`).
4. **Provision Supabase:** apply `supabase/migrations/20260518193000_initial_game_schema.sql`, enable auth, add `VITE_*` env on Vercel.
5. **Implement** Supabase client + auth UI + sync `PlayerProgress` ↔ `player_saves` (see mapping table in handoff).
6. **Deploy** `services/api` to Render via `render.yaml`; set `VITE_API_BASE_URL`.
7. Set **`DEBUG_UNLOCK_ALL_MAPS = false`** in `src/data/maps.ts` for production.
8. Full QA @ 390×844; document URLs; add **DEC-035** to decision log; commit and push.

Work autonomously. Only stop if missing Supabase/Vercel/Render credentials — then list exact env vars needed.

Repo: `C:\Users\mateuszb\Documents\AI Projects\TD`

---
