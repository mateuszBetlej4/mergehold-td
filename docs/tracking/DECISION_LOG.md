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

## DEC-020: Hybrid Meta Rewards (Wave Clear + Fort Loss)

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** On each wave clear, persist `bestWave` to the cleared wave and bank a small gem drip (`max(3, floor(wave * 2))`). Fort loss adds a separate completion bonus (`max(8, floor(wave * 12 + coins * 0.08))`). Leaving run via Home calls `forfeitRun`: keep wave-clear progress and drips already earned; no completion bonus. Hero/map unlock gates use highest **cleared** wave (`bestWave`), matching “Clear wave N” copy.
- **Reasoning:** Fixes misleading unlocks and zero-gem mid-run exits. Completion bonus still rewards full runs that end in fort loss.
- **Implemented:** 2026-05-18 — `useGameStore.recordWaveClear`, `forfeitRun`, `claimRunRewards`, `runEndSummary`; `RunScene.showUpgradeChoice`; meta + run UI (BUG-006/008/009). Leave/end-run UX: DEC-024 (BUG-007/016).

## DEC-021: Kenney Tank / Shield Facing Offset

- **Date:** 2026-05-18
- **Status:** Superseded by DEC-028 (tank/shield)
- **Decision:** Set `spriteFacingOffset` to `+π/2` for `kenney-enemy-tank` and `kenney-enemy-shield` (art faces **up** at Phaser rotation 0). Keep `kenney-enemy-grunt` at `0` (art faces **right**). Boss and SVG bat/bomber keys unchanged at `+π/2`.
- **Reasoning:** Graphics QA (BUG-017 / AUD-014) found vertical-path segments showed sideways facing when offsets assumed all Kenney PNGs face east. Table in `docs/GRAPHICS.md` updated to match `RunScene.ts`. **Runner** was briefly included here; reverted to `0` in DEC-026 after BUG-018.

## DEC-028: Kenney Grunt Family Facing (Tank / Shield → Offset 0)

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Set `spriteFacingOffset` to `0` for `kenney-enemy-grunt`, `kenney-enemy-runner`, `kenney-enemy-tank`, and `kenney-enemy-shield` (Kenney PNGs face **right** at rotation 0). Keep `kenney-enemy-boss` at `+π/2` until playtested. SVG bat/bomber keys stay `+π/2`.
- **Reasoning:** User report 2026-05-18 — tank and shield looked sideways with DEC-021 `+π/2`; same fix pattern as runner (DEC-026/027). All standard wave Kenney enemies share right-facing art.

## DEC-026: Kenney Runner Faces Right (Offset 0)

- **Date:** 2026-05-18
- **Status:** Superseded by DEC-027
- **Decision:** Set `spriteFacingOffset` for `kenney-enemy-runner` to `0` (PNG art faces **right** at Phaser rotation 0, same as grunt). Do not apply DEC-021 `+π/2` to runner.
- **Reasoning:** BUG-018 — user report and `b1d2bb4` baseline; runner was wrongly grouped with tank/shield in DEC-021. With `+π/2`, runner read ~90° off on vertical path legs @ 390×844. Bat (`enemy-runner` SVG) unchanged at `+π/2`.

## DEC-027: Path Corner Rotation Snap + Upgrade Overlay Gap

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** On path waypoint advance, snap `enemy.body.rotation` to the next leg angle + `facingOffset`. Increase `rotationTurnSpeed` to `0.045`. Wave-clear overlay: `cardStartY = bonusY + upgradeCardHalfHeight + 24` so gem drip text is not clipped (BUG-019). **Runner offset stays `0`** (DEC-026) — do not apply `+π/2` to `kenney-enemy-runner`; user confirmed `+π/2` reads sideways.
- **Reasoning:** BUG-020 agent playtest misread diagonal facing; user verified runner correct at offset `0`. Grunt also `0`. Tank/shield moved to `0` in DEC-028 (user report).

## DEC-022: Audio Settings In Progress Blob; Deploy Dev-Only

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Persist `soundEnabled` and `musicEnabled` inside `mergehold-td-progress-v1` (same `PlayerProgress` blob as gems/upgrades). Gate Home Deploy navigation and a Settings shortcut behind `import.meta.env.DEV` so production builds omit player-facing deployment scaffolding.
- **Reasoning:** One localStorage key keeps meta and settings in sync; Vite strips dead DEV branches from prod bundles. Reset save clears progression but keeps audio prefs unless product says otherwise.

## DEC-023: Menu Catalog Sprites Mirror Run Asset Keys

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Collection/catalog thumbnails use `src/app/catalogSprites.ts` (`getCatalogSprite`) with the same tower/enemy key table as `RunScene.ts`, rendered via `CatalogThumb` in React. Roguelike upgrade defs get a dedicated **Run upgrades** screen (`run-upgrades`); permanent gem shop stays on nav **Upgrades** only.
- **Reasoning:** Reuses existing `optimized/sprites` without new packs; avoids letter placeholders and separates in-run upgrade catalog from meta shop (AUD-008–010).

## DEC-024: Roguelike Leave Flow — Confirm Abandon, No Mid-Run Resume

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Leaving Play is an explicit **abandon**, not a silent reset. No `localStorage` run snapshot; unmounting `GameCanvas` still destroys Phaser and the next Play starts wave 1. Before leave: `PlayHud` shows a confirm dialog (also when exiting Play via bottom nav / `navigateTo`). On confirm: `forfeitRun()` — keep wave-clear gems and `bestWave` already earned (DEC-020); no fort-death bonus. End-of-run feedback is **React-only**: `RunEndSummaryModal` driven by `runEndSummary` in Zustand for both abandon and fort loss; Phaser “FORT LOST” overlay removed. Defeat offers **Play again** (`restartRun` bridge) and **Home**; abandon offers **Home** only.
- **Reasoning:** Closes AUD-006/007/015 (BUG-007, BUG-016) without high-effort run serialization. Players see forfeit rules before losing progress; reward feedback is consistent whether they leave or lose.
- **Implemented:** 2026-05-18 — `PlayHud.tsx`, `App.tsx` (`navigateTo`, `RunEndSummaryModal`), `useGameStore.forfeitRun` / `runEndSummary`, `RunScene` `isGameOver` + `runEnded` emit; `npm run build`; browser @ 390×844 (confirm → stay/leave, summary modal, fresh re-enter).

## DEC-025: Tiered Wave Enemy Mix (Bat / Bomber)

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** `getWaveEnemyMix()` uses a cumulative tier table: wave 1 grunt only; wave 2+ runner; wave 4+ tank and shield; wave 6+ bat; wave 8+ bomber; every 5th wave (5, 10, …) gatebreaker boss only (DEC-015). HP scaling `definition.hp + wave * 6` unchanged.
- **Reasoning:** Closes AUD-011 / BUG-013. Bat and bomber were defined and asset-mapped (DEC-017) but never selected for spawn. Staggered intro avoids dumping all archetypes on wave 4; boss waves stay milestone fights.
- **Implemented:** 2026-05-18 — `RunScene.ts` `getWaveEnemyMix()`; `npm run build`; browser @ 390×844 @ 1.5× through wave 6+ (W5 boss-only confirmed).

## DEC-029: Wave Spawn Tables + Combat Ability Pass

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Use `src/data/waves.ts` as the runtime spawn source (`getWaveSpawnGroups`). Explicit tables for waves 1–15; procedural fallback uses DEC-025 tier IDs with a **shared** spawn budget (`8 + floor(wave × 0.75)`, cap 28) split across types — not `min(6, 1 + wave)` per archetype. HP scaling: `definition.hp + wave × 5`. Fort damage multiplier stays `× 0.55`.
- **Reasoning:** Old `getWaveEnemyMix` × per-type count produced 36–54 enemies by wave 8 (handoff research). Wave 8 now spawns 16 enemies (3G+4R+2T+2D+3B+2X). Boss waves 5/10/15 remain gatebreaker-only.

### Research snapshot (code + @ 390×844, guardian loadout)

| Wave | Total spawns | Example mix | Grunt effective HP | All-leak fort dmg |
|------|-------------|-------------|-------------------|-------------------|
| 1 | 6 | grunt×6 | 35 | ~24 (13% of 180) |
| 5 | 1 | gatebreaker | 505 | ~19 |
| 8 | 16 | mixed + bat/bomber | 70 (grunt) | varies |
| 10 | 1 | gatebreaker | 530 | ~19 |
| 15 | 1 | gatebreaker | 555 | ~19 |

**Targets:** W1–2 learnable with one T1 archer (&lt;15% fort loss on leaks); W5 boss threatening with 2–3 towers; no-tower fort death ~W3–4 (6–8 grunts + runners).

- **Implemented:** 2026-05-18 — `waves.ts`, `RunScene.spawnWave`, enemy stat tune, `npm run build`, browser W1 @ 390×844.

## DEC-030: Distinct Upgrade + Enemy Combat Behaviors

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:**
  - **Sharp Arrows:** archer towers only (no trap/tower-wide buff).
  - **Powder Kegs:** `cannonSplashBonus` scales splash radius from `buildings.stats.splash`; splash deals 45% primary damage in radius.
  - **Arcane Focus:** magic towers prioritize shield/tank/boss; magic damage ignores shield armor reduction.
  - **Shield Guard:** 50% damage from archer projectiles only.
  - **Bat:** `archetype === "flyer"` skips spike traps.
  - **Bomber:** on fort reach, applies `damageToFort` + 55% bonus explosion (second `applyFortDamage`).
- **Reasoning:** Closes balancing handoff gaps; upgrade cards and Collection copy now match runtime. Cannon/magic building descriptions aligned.
- **Deferred:** FEATURE_SPEC permanent upgrades (troop HP, reroll) and roguelike rarity weights — see BUG-021, BUG-022. Coin gain added in DEC-031.

## DEC-031: Economy Rebalance + Coin Ledger

- **Date:** 2026-05-18
- **Status:** Accepted
- **Decision:** Tune in-run coin sources/sinks and meta gem fort-bonus hoarding without changing DEC-020 drip policy or DEC-024 forfeit rules.
  - **Kill rewards:** grunt 6, runner 7, gatebreaker 115 (was 5/6/90).
  - **Coin mill:** `15 × tier` income per wave clear (was 12).
  - **Wave stipend:** +35 on upgrade pick; **+20** extra on boss waves (`wave % 5 === 0`).
  - **Fort loss gem bonus:** `max(8, floor(wave × 12 + min(24, floor(coins × 0.04))))` — caps coin hoarding vs drip (was uncapped `coins × 0.08`).
  - **Meta shop:** add **Merchant's Ledger** (`coinGain`) — +5% kill rewards per level, 40 gem base cost; stacks with mage / Gold Rush in `applyLoadout`.
- **Reasoning:** Code ledger + strategy B simulation @ 390×844 (guardian, 100% kills): boss-only waves starved kill income vs mixed waves; fort bonus at 400+ coins dominated session gems; mill ROI on 40g build was ~4 clears at tier 1. Boss stipend keeps W5→W6 affordable without inflating normal waves. Hoarding cap preserves DEC-020 hybrid model.
- **Research snapshot (strategy B — 1 archer W1, T2 W2, cannon W4, guardian, mult=1)**

| Wave | Max kill coins | Cumulative stipend+mill* | Sim end coins (before W spend) |
|-----:|---------------:|-------------------------:|-------------------------------:|
| 1 | 36 | 35 | 191 |
| 5 | 115 | 175 | ~555† |
| 10 | 115 | 350 | ~1280† |

\*Stipend only; no mill. †Spend ~70 (archer + T2 + cannon); actual playtest targets ≥50 entering W6 — met.

**Gem paths (unchanged drip; new fort coin cap)**

| Run end | Drip 1–N | Fort bonus @ 200 coins | Fort bonus @ 400 coins |
|---------|----------|------------------------|------------------------|
| W5 death | 31 | 74 (was 76) | — |
| W10 death | 111 | — | 136 (was 152) |
| Forfeit W6 | 31 (kept) | 0 | — |

- **Implemented:** 2026-05-18 — `enemies.ts`, `buildings.ts`, `useGameStore.ts`, `RunScene.ts`, `GAME_BALANCE.md` §§10–12; `npm run build`.
- **Deferred:** troop health + upgrade reroll permanent upgrades (BUG-021 remainder).

## DEC-032: Combat & Economy Sink Pass (Build/Tier Costs + Wave Pressure)

- **Date:** 2026-05-18
- **Status:** Accepted
- **Context:** Post–DEC-031 playtest feedback — too easy to buy/upgrade towers; strategy B left **~460 coins** entering W5 with only archer T2 + cannon.
- **Audit summary:**
  - **Towers @ T1:** Archer ~31 DPS, cannon ~31, magic ~32 — similar single-target throughput; cannon adds splash.
  - **W4 HP budget:** ~726 scaled HP (11 spawns); one T2 archer needs ~16s continuous fire if all on field — staggered spawns make one tower viable; economy was the real issue.
  - **W7–9:** HP budget 1179→1786; fort wipe if all leak ~64–108 dmg vs 215 guardian HP — requires 2+ towers by midgame.
  - **Boss W5:** 505 HP (pre-pass) ≈ 16s per T1 archer → design expects 2–3 towers.
- **Decision:**
  - **Sinks:** `padTierUpgradeCost = 25`; tower costs 30 / 52 / 65; support 35–78 (see `buildings.ts`).
  - **Income:** wave stipend **25** (+10 boss); kill rewards unchanged from DEC-031.
  - **Combat:** spawn HP `baseHp + wave × 6`; tank 115, shield 82, gatebreaker 520 base HP.
  - **Waves:** W4 +1 shield; W7 +1 runner; W8 +1 bomber; W9 +1 tank.
- **Post-pass coin path (strategy B, 100% kills):** after W4 **~383** (was ~460); after W5 **~533** (was ~630) — still affords magic or mill + tier, not both plus extras without tradeoffs.
- **Implemented:** `buildings.ts`, `enemies.ts`, `waves.ts`, `RunScene.ts`, `GAME_BALANCE.md`, `catalogStats.ts`, `App.tsx`; `npm run build`.
