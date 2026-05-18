# Graphics — Runtime Reference

Canonical reference for **in-run visuals** in Mergehold TD. Implementation lives in `src/game/scenes/RunScene.ts`; dock thumbnails in `src/app/PlayHud.tsx`.

**Handoff history:** [handoffs/2026-05-18-graphics.md](./handoffs/2026-05-18-graphics.md)  
**Decisions:** [tracking/DECISION_LOG.md](./tracking/DECISION_LOG.md) (DEC-016–DEC-019)  
**Credits:** [../public/assets/licenses/ASSET_CREDITS.md](../public/assets/licenses/ASSET_CREDITS.md)

---

## Map rendering (`drawMap`)

| Layer | Depth | Implementation |
|-------|-------|----------------|
| Ground | 0 | `drawGroundTiles()` — `kenney-grass` 64×64 grid, `setTint(palette.ground)`, α0.9 |
| Trees | 1 | 4× `kenney-tree`, tinted `palette.hud` |
| Path | 2 | `drawPathTiles()` — `kenney-path-dot` every ~26px along path polyline, tinted `palette.path` |
| Path outline | — | **None** — Phaser `graphics` vector stroke removed (looked muddy when stacked on dots) |
| Fort | 12 | `fort.svg` at (195, 500) |

Map colors come from `mapDefinitions[].palette` via `applyLoadout()` → `palette.ground`, `palette.path`, `palette.hud`.

**Pads:** Tower slots and trap slots remain procedural circles (not Kenney pad art).

---

## Preload keys (`preload()`)

Roughly 22 runtime textures. All paths under `/assets/optimized/sprites/`.

| Phaser key | File | Format |
|------------|------|--------|
| `kenney-tower-archer` | `kenney-tower-archer.png` | image |
| `kenney-tower-cannon` | `kenney-tower-cannon.png` | image |
| `kenney-tower-magic` | `kenney-tower-magic.png` | image |
| `kenney-enemy-grunt` | `kenney-enemy-grunt.png` | image |
| `kenney-enemy-runner` | `kenney-enemy-runner.png` | image |
| `kenney-enemy-tank` | `kenney-enemy-tank.png` | image |
| `kenney-enemy-shield` | `kenney-enemy-shield.png` | image |
| `kenney-enemy-boss` | `kenney-enemy-boss.png` | image |
| `kenney-tree` | `kenney-tree.png` | image |
| `kenney-grass` | `kenney-grass.png` | image |
| `kenney-path-dot` | `kenney-path-dot.png` | image |
| `kenney-projectile` | `kenney-projectile.png` | image |
| `enemy-runner` | `enemy-runner.svg` | svg 64×64 |
| `enemy-grunt` | `enemy-grunt.svg` | svg 64×64 |
| `projectile-arrow` | `projectile-arrow.svg` | svg 32×32 |
| `fort`, `hero-guardian`, `spike-trap`, `barracks`, `coin-mill`, `stone-wall`, `healing-shrine` | matching `.svg` | svg 64–128 |

Keep preload keys aligned with `towerAssetKeys`, `enemyAssetKeys`, `projectileAssetKeys`, and `publishRunUiState()` sprite ids.

---

## Entity → asset mapping

### Towers (`towerAssetKeys`)

| Building id | Texture | Dock (React) |
|-------------|---------|--------------|
| `archer-tower` | `kenney-tower-archer` | same `.png` |
| `cannon-tower` | `kenney-tower-cannon` | same |
| `magic-tower` | `kenney-tower-magic` | same |

### Enemies (`enemyAssetKeys`)

| Enemy id | Texture | Notes |
|----------|---------|-------|
| `grunt` | `kenney-enemy-grunt` | Kenney PNG |
| `runner` | `kenney-enemy-runner` | Kenney PNG |
| `tank` | `kenney-enemy-tank` | Kenney PNG |
| `shield` | `kenney-enemy-shield` | Kenney PNG |
| `bat` | `enemy-runner` | Project SVG + `definition.color` tint |
| `bomber` | `enemy-grunt` | Project SVG + `definition.color` tint |
| `gatebreaker` | `kenney-enemy-boss` | Kenney PNG, larger scale |

### Projectiles (`projectileAssetKeys`)

| Tower id | Texture |
|----------|---------|
| `archer-tower` | `projectile-arrow` |
| `cannon-tower` | `kenney-projectile` |
| `magic-tower` | `kenney-projectile` |

### Heroes & troops

| Role | Texture | Tint |
|------|---------|------|
| All heroes (lane) | `hero-guardian` | `selectedHero.color` from loadout |
| Barracks troops | `hero-guardian` | `troopRoleTints` by role: blocker `0x546a7b`, ranged `0x2f5d8c`, burst `0xb85c38` |

Structures use their SVG keys at ~0.42–0.46 scale + tier badge.

---

## Sprite rotation (`spriteFacingOffset`)

Phaser aim angle: **0 = east (right)**. Each texture’s art was inspected at rotation `0`; `spriteFacingOffset` is added so “forward” points at the target.

| Texture key | Default facing (art at rot 0) | Offset |
|-------------|-------------------------------|--------|
| `kenney-tower-archer` | Up | `+π/2` |
| `kenney-tower-cannon` | Up | `+π/2` |
| `kenney-tower-magic` | Right | `0` |
| `kenney-enemy-grunt` | Right | `0` |
| `kenney-enemy-runner` | Right | `0` |
| `kenney-enemy-tank` | Right | `0` |
| `kenney-enemy-shield` | Right | `0` |
| `kenney-enemy-boss` | Up | `+π/2` |
| `enemy-grunt`, `enemy-runner` | Up | `+π/2` |
| `projectile-arrow` | Right | `0` |
| `hero-guardian` | Up | `+π/2` |

**Behavior**

- **Enemies:** `moveEnemies()` → `rotateSpriteToward()` toward next path waypoint; offset stored per spawn as `enemy.facingOffset`.
- **Towers:** `aimTowers()` each frame when a target is in range; `shootNearestEnemy()` sets projectile rotation on fire.
- **Troops:** face current combat target while moving or attacking.
- **Smoothing:** `Phaser.Math.Angle.RotateTo` with `rotationTurnSpeed = 0.01` × delta.

If a unit looks 90° off, adjust only its row in `spriteFacingOffset` (e.g. try `0` vs `π/2` for `kenney-enemy-runner`).

Hit flash: `setTintFill(0xffffff)` then restore `enemy.tint` for SVG enemies or `clearTint()` for Kenney PNGs.

---

## Depth & scale (quick reference)

| Layer | Depth | Typical scale |
|-------|-------|----------------|
| Ground / path | 0–2 | grass 64px display; path dot 0.42 |
| Trees | 1 | 0.6–0.74 |
| Pads | 3–4 | circles |
| Structures / towers | 8–10 | towers ~0.58 + tier |
| Enemies | 16–17 | ~0.46; boss ~0.58 |
| Projectiles | 18 | arrow 0.62; blob 0.55 |
| Hero | 14 | 0.44 |
| Troops | 13–14 | 0.28 |
| Fort | 12 | 0.78 |
| Phaser UI / upgrade overlay | 28–80 | — |
| React `PlayHud` | z-index 2 | above canvas |

---

## React HUD (`PlayHud.tsx`)

- **Towers tab:** `/assets/optimized/sprites/${tower.sprite}.png` (`kenney-tower-*`).
- **Support tab:** `/assets/optimized/sprites/${struct.sprite}.svg` (e.g. `spike-trap`).

---

## Unused runtime files (still in repo)

SVG duplicates for towers/enemies (`tower-*.svg`, `enemy-*.svg` except bat/bomber keys), `tree.svg`, Kenney source pack under `public/assets/source/kenney/`. Safe for Collection screen thumbs later — see handoff optional items.

---

## Visual testing checklist

1. Viewport **390×844**, Play screen.
2. Confirm grass tint changes with selected map (Deploy).
3. Path = dot tiles only, no gray vector band.
4. Place archer/cannon/magic — towers track nearest enemy in range.
5. Enemies face movement direction along zigzag path.
6. Barracks troops: three tint colors by tier role.
7. Boss wave 5 — upgrade overlay + HUD still usable (BUG-003/005).

---

## Optional next work (not done)

- Collection / menu card thumbnails from existing SVG/PNG in `App.tsx`
- Kenney build/trap pad tiles from source pack
- Per-hero Kenney silhouettes (still one `hero-guardian.svg` + tint)
- Unique troop sprites
- SFX / UI skin packs (`docs/ASSET_PIPELINE.md`)
