# Agent handoff — Map design & lane layout (2026-05-18)

> **Role:** Map design agent — **research, audit, and implement** functional lane layouts for all four maps. Improve **Greenwatch Pass** (main/starter map) first, then deliver distinct geometry for **Sunspire**, **Frostgate**, and **Underkeep**. Layout choices must respect towers, traps, enemies, waves, fort/HQ, and mobile portrait constraints.
>
> **Depends on:** [2026-05-18-game-balancing.md](./2026-05-18-game-balancing.md) (combat numbers), [2026-05-18-graphics.md](./2026-05-18-graphics.md) (path-dot rendering), [2026-05-18-audio-sfx.md](./2026-05-18-audio-sfx.md) (done — DEC-033)
>
> **Avoid:** New enemy types, new buildings, balance rewrites, meta gem formulas, Supabase, deploy scaffolding

**Repo:** https://github.com/mateuszBetlej4/mergehold-td.git  
**Branch:** `main`  
**Dev:** `npm run dev` → http://127.0.0.1:5173/  
**Viewport:** **390×844** mobile portrait (React shell); Phaser canvas **390×694** (`src/game/config.ts`)  
**Tracking:** `docs/tracking/BUG_TRACKER.md`, `docs/tracking/DECISION_LOG.md`  
**Balance reference:** [`docs/balance/GAME_BALANCE.md`](../balance/GAME_BALANCE.md)  
**Graphics reference:** [`docs/GRAPHICS.md`](../GRAPHICS.md)

---

## Mission

1. **Audit** how the current map works in code and how every gameplay system interacts with path geometry.
2. **Research** TD lane-design patterns (chokepoints, coverage, trap lanes, flyer shortcuts) against our enemy roster and tower ranges.
3. **Refactor** hardcoded layout constants out of `RunScene.ts` into data-driven map layouts (see [Recommended architecture](#recommended-architecture)).
4. **Design & ship** four playable layouts:
   - **Greenwatch Pass** — polish the main map (coverage, pad placement, readability).
   - **Sunspire Dunes** — faster pressure, open lanes (desert theme).
   - **Frostgate Road** — longer path / tougher boss approach (snow theme).
   - **Underkeep** — trap-focused dungeon (more trap pads, tighter chokepoints).
5. Playtest each map @ **390×844** through at least wave 8 (bat/bomber) and one boss wave (5 or 10).
6. Document decisions as **DEC-034** (or next free id) in `DECISION_LOG.md`.

**Today maps are palette-only.** Selecting Sunspire/Frostgate/Underkeep changes ground/path/accent tints but uses the **same** path, tower pads, trap pads, fort, trees, and spawn point as Greenwatch.

---

## Current state (code truth)

| Area | Status |
|------|--------|
| Map metadata | `src/data/maps.ts` — 4 maps, theme + palette + unlock strings |
| Map selection UI | `App.tsx` `MapsScreen` — unlock via `bestWave` |
| Runtime effect today | `applyLoadout()` tints grass/path/tree HUD only (`RunScene.ts` ~1844–1857) |
| Path waypoints | **Hardcoded** module-level `path[]` in `RunScene.ts` (5 points) |
| Tower build pads | **Hardcoded** `createBuildSlots()` — 6 circles |
| Trap pads | **Hardcoded** `trapPadPositions[]` — 5 circles on/near path |
| Fort / hero | Fixed `(195, 500)` fort, `(195, 508)` hero |
| Enemy spawn | First path waypoint `(195, 28)` |
| Trees / decor | 4 fixed `kenney-tree` positions |
| Wave tables | **Global** — `src/data/waves.ts` (not per-map) |

### Greenwatch layout (all maps today)

Canvas **390×694**. Origin top-left.

```
Spawn (195, 28)
    |
    v  leg 1 — vertical
(195, 108)
    \
     \  leg 2 — diagonal SW
(96, 200)
              \
               \  leg 3 — diagonal SE
            (286, 300)
    /
   /  leg 4 — diagonal SW
(195, 448)  ← last waypoint; leak triggers here → fort damage
    |
 Fort (195, 500)  HQ visual
```

**Tower pads (6):** `(98,128)`, `(292,142)`, `(75,318)`, `(315,408)`, `(124,448)`, `(278,228)`  
**Trap pads (5):** `(168,82)`, `(72,188)`, `(318,288)`, `(248,372)`, `(168,418)`  
**Path dot spacing:** 26px along polyline segments (`pathDotSpacing`)

### Map unlock gates (`maps.ts`)

| Map | Unlock | Intended fantasy |
|-----|--------|------------------|
| `greenwatch` | Starter | Single winding route, teaching map |
| `sunspire` | Clear wave 8 | Open desert, fast pressure |
| `frostgate` | Clear wave 14 | Slower enemies, tougher bosses |
| `underkeep` | Clear wave 20 | Trap-focused dungeon |

---

## Systems the map layout affects (audit checklist)

Use this when placing waypoints and pads. **Read the cited files before moving coordinates.**

### Enemies & path movement

| System | File / hook | Map sensitivity |
|--------|-------------|-----------------|
| Waypoint following | `moveEnemies()` — `pathIndex`, distance threshold 8px | Longer/shorter legs change time-in-lane and tower dwell time |
| Spawn timing | `spawnWave()` → `spawnEnemy()` at `path[0]` | Spawn must be on first waypoint |
| Leak / fort damage | `moveEnemies()` when no `currentTarget` | Last waypoint must sit just before fort; leak SFX at fort `(195,584)` hardcoded |
| Flyers (bat) | `triggerTraps()` skips `archetype === "flyer"` | Trap-heavy maps matter less vs bats — design flyer-friendly tower coverage |
| Bombers | `exploder` double `applyFortDamage` at path end | Short final leg = less time to kill bombers near fort |
| Boss (gatebreaker) | Slow, high HP — needs sustained DPS zones | Boss maps need at least 2–3 viable tower angles on long straight |
| HP scale | `scaledHp = definition.hp + wave * 6` | Not map-specific; layout affects **effective** DPS via coverage |
| Speed scale | `(0.046 + wave * 0.0015) * definition.speed` | Faster maps = higher effective speed on short diagonals |

**Enemy roster:** `src/data/enemies.ts` — grunt, runner, tank, shield, bat (flyer), bomber (exploder), gatebreaker (boss).  
**Wave tables:** `src/data/waves.ts` — explicit 1–15; procedural 16+ (DEC-025 tier gates: bat W6+, bomber W8+).

### Towers & coverage

| Tower | Range (T1) | Fire rate | Map note |
|-------|------------|-----------|----------|
| Archer | 166 | 520ms | Single-target; needs line-of-sight to path polyline |
| Cannon | 136 | 900ms | Splash 42px — loves path bends and clumps |
| Magic | 154 | 680ms | Ignores 50% archer armor on shield; prioritize armored segments |

- Targeting: `findTowerTarget()` — nearest in range, magic can prioritize armored (upgrade).
- **No line-of-sight blockers** today — only distance. Trees are decorative (depth 1), not obstacles.
- Pad tier upgrades: +4 range per tier (`RunScene` tower upgrade branch).
- Throttle: fire sounds 120–180ms (`audioManager`) — irrelevant to layout but caps visual clutter.

**Design rule:** Every tower pad should reach **at least one path segment** at tier 1; ideal pads cover **two segments** or a chokepoint.

### Traps

- Placed only on `trapPadPositions` (separate from tower pads).
- `triggerTraps()` — ground enemies within `triggerRadius` (34 + tier×3); **flyers ignore**.
- Cooldown/damage from `buildings.ts` spike-trap stats.
- Underkeep should offer **more or better** trap angles; Sunspire might have **fewer** trap pads but wider tower lanes.

### Support buildings (tower pads)

| Building | Unlock wave | Map interaction |
|----------|-------------|-----------------|
| Spike trap | 2 | Path-adjacent pads only |
| Stone wall | 2 | Shield absorbs before fort — fort at `(195,584)` flash |
| Coin mill | 3 | Off-path OK; no combat role |
| Barracks | 4 | Troops chase within 220px — pads nearer path = stronger lane hold |
| Healing shrine | 5 | Repairs after boss waves — fort-adjacent fantasy |

All support structures share the **6 tower pads** via `isPadOccupied()` — one structure per pad.

### Fort / HQ / hero

- Fort image `(195, 500)`; combat leak reference `(195, 584)` for flashes/shield.
- Guardian hero at `(195, 508)`; abilities reference fort coords (ranger lines, mage AoE at `(195,326)`).
- Any map refactor must update **fort + hero + leak flash** together.

### Economy & waves (indirect)

- Wave stipend / kills are global (DEC-032) — layout changes **how hard** the same wave feels, not coin numbers.
- If a map is easier/harder, note in playtest log; **do not** change `waves.ts` unless user asks for map-specific tables (defer).

### UI / camera

- Upgrade overlay centered `(195, 347)` full-screen rect 390×694 — path must not rely on UI-overlap regions at y 80–250 if possible (upgrade cards).
- React HUD (`PlayHud.tsx`) covers bottom — keep fort and bottom path readable above dock.

---

## Research tasks (do before moving pixels)

1. **Play Greenwatch** — waves 1, 4 (shield+tank), 5 (boss), 8 (bomber), with strategies:
   - A: one T2 archer only  
   - B: archer + cannon (DEC-032 economy baseline)  
   Note dead pads, blind spots, and leak clusters.
2. **Measure coverage** — script or manual: for each pad, min distance to path polyline; flag pads where distance > archer range 166.
3. **Study reference TD maps** — Kingdom Rush / Bloons-style chokepoints, dual entrances (defer if scope), spiral vs S-curve.
4. **Read balance doc** §§1–4, 10–12 — `docs/balance/GAME_BALANCE.md` for intended difficulty bands.
5. **Read graphics doc** — path-dot rendering, no vector overlay (DEC-016); rotation offsets if path has new diagonal angles (DEC-021/026).
6. **Confirm map selection path** — `useGameStore.selectMap`, `progress.selectedMapId`, `applyLoadout()` already wired.

---

## Recommended architecture

**Goal:** One layout per `mapDefinitions[].id`; `RunScene` reads active layout at run start.

### File layout (proposed)

```text
src/data/
  maps.ts              # extend MapDefinition with layout id / metadata
  mapLayouts.ts        # NEW — path, pads, fort, spawn, decor per map

src/game/scenes/
  RunScene.ts          # consume active layout; remove module-level path/slots constants
```

### `MapLayout` shape (proposal)

```ts
export type MapLayout = {
  mapId: string;
  path: Array<{ x: number; y: number }>;
  towerPads: Array<{ x: number; y: number }>;
  trapPads: Array<{ x: number; y: number }>;
  fort: { x: number; y: number };
  hero: { x: number; y: number };
  fortFx: { x: number; y: number }; // shield/hit flashes
  trees?: Array<{ x: number; y: number; scale?: number }>;
  /** Optional per-map wave id override — defer until layouts stable */
  // waveSetId?: string;
};
```

### Runtime wiring

1. `applyLoadout()` — resolve `selectedMapId` → `getMapLayout(id)` → store on scene (`this.layout`).
2. `drawPathTiles()` / `moveEnemies()` / `createBuildSlots()` / `createTrapSlots()` / `createHero()` / `drawMap()` trees — read from `this.layout`.
3. Keep `mapDefinitions[].palette` for tints; layouts reference same `mapId`.

### Constraints (hard)

| Constraint | Value |
|------------|--------|
| Canvas size | 390×694 (do not change without updating `config.ts` + CSS) |
| Waypoints | 4–8 points; polyline only (no Bezier path follower yet) |
| Tower pads | 5–7 per map |
| Trap pads | 4–7 per map; must be within ~40px of path for fairness |
| Path within canvas | Margin ≥24px from edges (sprites clip) |
| Spawn | First waypoint in top ~15% of canvas |
| Fort | Bottom ~70–90% y; centered or intentionally offset for asymmetry |
| Touch targets | Build/trap circles radius 26 / 18 — keep tappable on 390 width |

---

## Per-map design briefs

Align geometry with existing copy in `maps.ts`. Playtest with **guardian** starter unless testing hero-specific spots.

### 1. Greenwatch Pass (`greenwatch`) — **priority**

**Goals:** Tutorial clarity; teach chokepoint at `(96,200)` and `(286,300)`; no dead pads; fair W5 boss.

| Direction | Suggestion |
|-----------|------------|
| Path | Keep S-curve DNA; fix pads that cannot hit diagonal legs; consider 1 extra waypoint if corners feel rushed |
| Towers | 6 pads — each covers a distinct leg; cannon pad near bend at (286,300) |
| Traps | 5 pads on straight-ish segments; first trap pad reachable W2 |
| Fort | Center-bottom; path end ~40px above fort |
| Readability | Trees frame lane, not blocking pads |

**Success:** Strategy B clears W5 with ≤2 leaks; no pad unused on W1–4.

### 2. Sunspire Dunes (`sunspire`)

**Fantasy:** Open desert, **fast pressure** — shorter path or wider straights, faster effective waves.

| Direction | Suggestion |
|-----------|------------|
| Path | Shorter total length or fewer sharp turns → enemies reach fort ~10–15% faster |
| Towers | Fewer but stronger positions (5 pads); reward cannon splash on long straight |
| Traps | 3–4 pads (flyers common W6+) — traps are weak vs bats; document in playtest |
| Palette only today | Sand tints already in `maps.ts` |

### 3. Frostgate Road (`frostgate`)

**Fantasy:** Slower enemies, **tougher bosses** — longer path, more time on field, higher exposure to ranged towers.

| Direction | Suggestion |
|-----------|------------|
| Path | +1–2 waypoints, longer final approach to fort |
| Towers | 6–7 pads; magic-friendly stretch vs shield stacks |
| Traps | 5 pads; boss wave needs sustained trap + tower DPS |
| Boss | W10 gatebreaker — ensure 3+ pads can focus fire on last 120px of path |

### 4. Underkeep (`underkeep`)

**Fantasy:** **Trap-focused** dungeon — narrow corridors, more trap pads, fewer optimal tower spots.

| Direction | Suggestion |
|-----------|------------|
| Path | Narrower S or zig-zag; chokepoints where traps trigger multiple times |
| Traps | 6–7 pads, some on short backtracking segments (if path allows) |
| Towers | 5 pads — trade tower power for trap lanes |
| Flyers | Bats bypass traps — must have archer/magic coverage |

---

## Implementation phases

### Phase 1 — Data model + Greenwatch pass

1. Add `mapLayouts.ts` with `greenwatch` layout (parity or improved vs current constants).
2. Refactor `RunScene` to use layout instance fields.
3. Playtest W1–8 on Greenwatch; fix blind pads.
4. `npm run build`; optional DEC-034 draft.

### Phase 2 — Alternate maps

1. Author `sunspire`, `frostgate`, `underkeep` layouts.
2. Visual pass: palette + tree positions per theme.
3. Playtest unlock progression (W8 / W14 / W20 **feel** achievable on intended map).

### Phase 3 — Polish (optional)

1. Map preview thumbnails in `MapsScreen` (mini path sketch or screenshot).
2. Per-map decor (rocks, dungeon props) from unused Kenney tiles — graphics handoff scope.
3. Per-map wave modifiers — **out of scope** unless balance agent signs off.

---

## Files — touch vs avoid

| Touch | Avoid |
|-------|-------|
| `src/data/mapLayouts.ts` (new) | `enemies.ts` stats |
| `src/data/maps.ts` (layout refs, descriptions) | `waves.ts` unless explicit map-wave scope approved |
| `src/game/scenes/RunScene.ts` (layout consumption) | Meta shop, gem formulas |
| `docs/balance/GAME_BALANCE.md` (§ map notes) | Audio, deploy |
| `docs/GRAPHICS.md` (per-map decor table) | `RunScene` combat math |
| `docs/tracking/DECISION_LOG.md` (DEC-034) | Supabase |

---

## Test plan

1. **Selection:** Maps screen → each map selectable when unlocked → run uses correct palette **and** geometry.
2. **Greenwatch:** W1 placement tutorial; W4 shield; W5 boss; no enemy stuck off-path.
3. **Coverage:** Each tower pad fires on at least one enemy on W3 hold.
4. **Traps:** Ground enemy triggers on each trap pad when led through (manual drag or long run).
5. **Flyers:** W6+ bats path correctly; traps do not block bat wins.
6. **Bombers:** W8 — bombers killable before double fort hit on leak.
7. **Sunspire / Frostgate / Underkeep:** One full run each to W8; note difficulty vs Greenwatch in playtest notes.
8. **Regression:** Sprite facing on new diagonal legs (`spriteFacingOffset` in `RunScene.ts`, `docs/GRAPHICS.md`).
9. **Mobile:** 390×844, 1× and 1.5× speed; pads tappable.
10. `npm run build`.

---

## Product decisions to lock (DEC-034 proposal)

- **Data-driven layouts** in `mapLayouts.ts`; `RunScene` does not hardcode per-map coordinates.
- **Shared wave tables** across maps for MVP; difficulty skew comes from geometry only.
- **Polyline waypoints only** — no path branch / multiple exits in v1.
- **Flyers ignore traps** remains; map design must not hard-require traps vs bats.
- **Four maps ship with unique paths** before optional wave-per-map or preview art.

---

## Git workflow

```bash
npm run build
git add src/data/mapLayouts.ts src/data/maps.ts src/game/scenes/RunScene.ts docs/
git commit -m "Add per-map lane layouts and refactor RunScene to data-driven geometry"
```

Do **not** commit unless user asks.

---

## Prompt for agent (copy-paste)

---

You are the **map design agent** for **Mergehold TD**.

1. Read **`docs/handoffs/2026-05-18-map-design.md`** in full.
2. **Audit** `RunScene.ts` path/pads/fort and play Greenwatch @ 390×844 (W1–8).
3. Add **`src/data/mapLayouts.ts`** and refactor **`RunScene`** to load layout from **`selectedMapId`**.
4. **Improve Greenwatch**, then implement distinct layouts for **sunspire**, **frostgate**, **underkeep**.
5. Research TD chokepoints vs our tower ranges, traps, flyers, and bombers (see audit tables).
6. Playtest all four maps; `npm run build`; add **DEC-034** to **`DECISION_LOG.md`**.

Repo: `C:\Users\mateuszb\Documents\AI Projects\TD`

---
