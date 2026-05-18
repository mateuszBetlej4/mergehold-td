# Bug Tracker

Use this file for known bugs during development. When GitHub Issues are active, each bug should either link to a GitHub issue or be migrated into one.

## Status Values

- `New`
- `Confirmed`
- `In Progress`
- `Blocked`
- `Fixed`
- `Verified`
- `Won't Fix`

## Severity Values

- `S0` - Crash, data loss, app cannot load.
- `S1` - Core gameplay broken.
- `S2` - Major feature broken but workaround exists.
- `S3` - Minor bug, visual issue, tuning issue.
- `S4` - Polish, typo, small inconsistency.

## Bug Template

```text
ID:
Title:
Status:
Severity:
Area:
Found in:
Owner:
Date opened:
Related issue:

Steps to reproduce:
Expected:
Actual:
Notes:
Verification:
```

## Active Bugs

_None — bug-fix sweep 2026-05-18 complete. See **Fixed Bugs** below._

**Handoff:** `docs/handoffs/2026-05-18-bug-fix.md` (see `LATEST.md`).

_Audit BUG-006–009, 007, 013, 016, 017 are **Verified** in **Fixed Bugs** below._

---

ID: BUG-018
Title: Runner Kenney sprite faces wrong direction on path (DEC-021 regression)
Status: Verified
Severity: S3
Area: Graphics / gameplay polish
Found in: User report 2026-05-18; cross-check BUG-017 / DEC-021
Owner: Bug-fix agent
Date opened: 2026-05-18
Date closed: 2026-05-18
Related issue: DEC-026 (supersedes runner part of DEC-021), BUG-017

Steps to reproduce:
1. `npm run dev` → Play @ **390×844**, **1.5×** speed.
2. Start run; reach **wave 2+** (runner in mix).
3. Watch `kenney-enemy-runner` on each path leg: top vertical, diagonal, horizontal, diagonal, bottom vertical toward fort.

Expected:
Runner faces travel direction on all segments (same standard as grunt).

Actual:
With DEC-021 `+π/2`, runner read ~90° off on path (user report). PNG art faces **right** like grunt, not up like tank/shield.

Notes:
- Fix: `spriteFacingOffset["kenney-enemy-runner"]` → `0`. Bat (`enemy-runner` SVG) unchanged at `+π/2`.
- `docs/GRAPHICS.md` rotation table synced.

Verification:
2026-05-18 — offset `0` restored (DEC-026); `npm run build` pass; code + asset inspection vs `b1d2bb4`; graphics-qa handoff listed runner `0` as correct. Tank/shield remain `+π/2` per DEC-021.

---

## Fixed Bugs (audit 2026-05-18)

ID: BUG-006
Title: Meta gems and bestWave only update when the fort is destroyed
Status: Verified
Severity: S1
Area: Meta progression / economy
Found in: Audit 2026-05-18 (AUD-001, AUD-002, AUD-005)
Owner: Meta progression agent
Date opened: 2026-05-18
Related issue: DEC-020

Steps to reproduce:
1. Fresh save: Home shows Gems 0, Best Wave 1.
2. Play → clear wave 1 → pick upgrade (optional) → tap Home (Leave run).
3. Check Home / Heroes / Permanent Upgrades.

Expected:
Partial gem credit and `bestWave` reflect highest wave reached this session; hero/map unlock copy (“Clear wave 5”) matches behavior.

Actual:
`claimRunRewards()` runs only from `RunScene.claimEndOfRunRewards()` when `fortHp <= 0`. Early exit earns 0 gems; `bestWave` stays at prior value. Unlock gates use `progress.bestWave` in `App.tsx` but never advance until a losing run ends.

Notes:
Formula exists: `Math.max(8, Math.floor(wave * 12 + coins * 0.08))` in `useGameStore.ts`. Product decision needed: award on wave clear, on abandon forfeit, or both.

Verification:
`recordWaveClear()` banks gem drip and updates `bestWave` each wave; `claimRunRewards()` adds fort-loss bonus. Hero/map gates use cleared-wave `bestWave` (DEC-020). 2026-05-18: upgrade overlay “+N gems banked”; `npm run build` pass; browser @ 390×844.

---

ID: BUG-007
Title: Leaving Play destroys the Phaser run — no confirm, resume, or abandon rules
Status: Verified
Severity: S1
Area: Run session lifecycle
Found in: Audit 2026-05-18 (AUD-006, AUD-007)
Owner: Run lifecycle agent
Date opened: 2026-05-18
Date closed: 2026-05-18
Related issue: DEC-020, DEC-024, BUG-016

Steps to reproduce:
1. Start run, clear wave 1, reach upgrade picker.
2. Tap Home (Leave run) in `PlayHud`.
3. Tap Play again.

Expected:
Either confirm abandon (with stated gem/forfeit rules) or resume the same run state.

Actual:
`setActiveScreen("home")` unmounts `GameCanvas`; `useEffect` cleanup calls `game.destroy(true)`. New Play session is wave 1 with full reset. No `localStorage` run snapshot.

Notes:
**AUD-007 (no persistence):** intentional roguelike abandon — no `mergehold-td-run-v1`; canvas destroy on unmount unchanged. **AUD-006:** confirm before leave via `PlayHud` + `App.navigateTo` (bottom nav). `forfeitRun()` applies DEC-020 forfeit rules.

Verification:
Leave → confirm (“Stay” / “Leave”) → cancel stays in run; confirm → Home + `RunEndSummaryModal`. Play again → fresh wave 1. `npm run build` pass; browser @ 390×844. Policy: DEC-024.

---

ID: BUG-008
Title: Home “Run W{n}” metric is stale after leaving mid-run
Status: Verified
Severity: S2
Area: Shell / Home UI
Found in: Audit 2026-05-18 (AUD-004)
Owner: Meta progression agent
Date opened: 2026-05-18
Related issue: BUG-016, DEC-020

Steps to reproduce:
1. Clear wave 1 in Play (HUD shows wave progress).
2. Leave run via Home button without fort death.
3. Read Home quick-stats: Best, Gems, Run.

Expected:
Run pill shows last active wave or a “abandoned” / post-run summary; Best/Gems align with meta rules.

Actual:
`run` snapshot may still show last `setRunSnapshot` from Phaser until overwritten; no “last run rewards” or session summary. Best/Gems unchanged (see BUG-006).

Verification:
Home **Last** pill uses `formatLastRunLabel()` (`Left Wn · +gems`, `Lost Wn`, `Peak Wn`). 2026-05-18 browser: abandon shows `Left W1` + `RunEndSummaryModal` (DEC-024).

---

ID: BUG-009
Title: Permanent upgrade rows look non-interactive when player has 0 gems
Status: Verified
Severity: S2
Area: Meta UI
Found in: Audit 2026-05-18 (AUD-003)
Owner: Meta progression agent
Date opened: 2026-05-18
Related issue: BUG-006, DEC-020

Steps to reproduce:
1. With 0 gems, open Permanent Upgrades (nav or Home tile).
2. Observe rows and tap buy.

Expected:
Clear affordance: disabled buy vs affordable; optional toast when broke. `buyPermanentUpgrade` works when gems ≥ cost.

Actual:
`.locked` class when `!canAfford` — same styling as hero locks. Logic works after a fort-loss run awards gems.

Verification:
`.cant-afford` styling, `N gems` cost label, hint copy, toast on broke tap. 2026-05-18 browser: “Need 35 gems — clear waves to earn more”.

---

ID: BUG-010
Title: Collection and catalog screens use letter tokens instead of runtime sprites
Status: Verified
Severity: S3
Area: Menus / graphics
Found in: Audit 2026-05-18 (AUD-008)
Owner: Unassigned
Date opened: 2026-05-18
Related issue: N/A

Steps to reproduce:
1. Open Collection → Buildings or Enemies (or Home → Buildings).

Expected:
Thumbnails use `/assets/optimized/sprites/` per `docs/GRAPHICS.md` entity mapping.

Actual:
`CardsScreen` renders `div.card-token` with first letter of name only (`App.tsx` ~235).

Notes:
`catalogSprites.ts` + `CatalogThumb.tsx` map building/enemy/troop/hero ids to Kenney PNGs and project SVGs (DEC-023). `CardsScreen` and `HeroesScreen` use sprite thumbs; `.catalog-thumb` styles in `App.css`.

Verification:
2026-05-18 — `CardsScreen` / `HeroesScreen` use `CatalogThumb` + `catalogSprites.ts` keys matching `RunScene`; no letter-only enemy/building thumbs. `npm run build` pass.

---

ID: BUG-011
Title: Settings asset credits still claim “procedural placeholders”
Status: Verified
Severity: S4
Area: Settings / copy
Found in: Audit 2026-05-18 (AUD-009)
Owner: Collection UI agent
Date opened: 2026-05-18
Related issue: N/A

Steps to reproduce:
1. Open Settings → read Asset credits card.

Expected:
Copy reflects Kenney CC0 + project SVGs; link to `ASSET_CREDITS.md`.

Actual:
“Runtime assets are currently procedural placeholders…” (`App.tsx` ~336).

Notes:
Settings Asset credits card now describes Kenney CC0 + project SVGs under `public/assets/optimized/sprites/` with link to `/assets/licenses/ASSET_CREDITS.md`.

Verification:
2026-05-18 — Settings Asset credits card: Kenney CC0 + project SVGs, link `/assets/licenses/ASSET_CREDITS.md`; no procedural-placeholder copy.

---

ID: BUG-012
Title: Collection “6 upgrades” opens roguelike defs, not permanent meta shop
Status: Verified
Severity: S3
Area: Navigation / UX
Found in: Audit 2026-05-18 (AUD-010)
Owner: Collection UI agent
Date opened: 2026-05-18
Related issue: N/A

Steps to reproduce:
1. Collection → tile labeled “6 upgrades”.
2. Compare with bottom nav “Upgrades” (Permanent Upgrades).

Expected:
Clear separation: in-run upgrade catalog vs gem shop.

Actual:
Collection tile uses `gameContent.upgrades` (roguelike `upgrades.ts` defs). Permanent shop is separate screen only via nav/Home tile.

Notes:
Collection tile renamed **Run upgrades (6)** → new `run-upgrades` screen (read-only `upgradeDefinitions` catalog + lead copy). Bottom nav **Upgrades** and Home **Permanent Upgrades** still open gem shop (`upgrades` screen).

Verification:
2026-05-18 — Collection **Run upgrades (6)** → `run-upgrades` read-only catalog; nav **Upgrades** / Home **Permanent Upgrades** → gem shop. No regression.

---

ID: BUG-013
Title: bat and bomber enemies never appear in wave spawn mix
Status: Verified
Severity: S3
Area: Gameplay / content
Found in: Audit 2026-05-18 (AUD-011)
Owner: Gameplay content agent
Date opened: 2026-05-18
Related issue: DEC-025

Steps to reproduce:
1. Play through waves 2–10+ with speed enabled.
2. Observe enemy types spawned.

Expected:
`bat` / `bomber` appear per design (data in `enemies.ts`, assets wired in `RunScene`).

Actual:
`getWaveEnemyMix()` only included grunt, runner, tank, shield, gatebreaker.

Notes:
`RunScene.getWaveEnemyMix()` tiered mix per gameplay-content handoff (DEC-025). No `enemies.ts` stat changes — wave 6 count spike felt fair with towers placed; no balance pass.

Verification:
2026-05-18 — `bat` from wave 6, `bomber` from wave 8; wave 5/10 boss = gatebreaker only. `npm run build` pass; browser @ 390×844 @ 1.5×: W1 grunts; W2–4 runner/tank/shield; W5 single boss; W6 reached (mixed spawn). Tinted SVG keys per DEC-017.

---

ID: BUG-014
Title: Deploy dev screen exposed on Home grid
Status: Verified
Severity: S3
Area: Shell / prod UX
Found in: Audit 2026-05-18 (AUD-012)
Owner: Unassigned
Date opened: 2026-05-18
Related issue: N/A

Steps to reproduce:
1. Home → Deploy tile (rocket icon).

Expected:
Player-facing Home has no Vercel/Supabase/Render scaffolding (or behind dev flag).

Actual:
`MenuTile` → `deploy` screen with deployment copy (`App.tsx` ~197).

Notes:
2026-05-18 polish-settings (DEC-022): Home Deploy `MenuTile` gated with `import.meta.env.DEV`; dev-only **Deploy → Dev** row in Settings. Prod build tree-shakes deploy menu strings (`npm run build`).

Verification:
2026-05-18 — `HomeScreen` Deploy `MenuTile` wrapped in `import.meta.env.DEV`; prod `npm run build` bundle has no Home Deploy string. Settings DEV row unchanged.

---

ID: BUG-015
Title: SFX and music toggles reset on full page reload
Status: Verified
Severity: S3
Area: Settings / persistence
Found in: Audit 2026-05-18 (AUD-013)
Owner: Unassigned
Date opened: 2026-05-18
Related issue: N/A

Steps to reproduce:
1. Settings → turn SFX or Music off.
2. Reload the page.

Expected:
Toggle state restored from storage.

Actual:
`soundEnabled` / `musicEnabled` live in Zustand only; `saveProgress` writes `mergehold-td-progress-v1` without audio fields (`useGameStore.ts`).

Notes:
2026-05-18 polish-settings (DEC-022): `soundEnabled` / `musicEnabled` added to `PlayerProgress` in `mergehold-td-progress-v1`; loaded on store init; `toggleSound` / `toggleMusic` call `saveProgress`. Reset local save preserves audio prefs.

Verification:
2026-05-18 — `toggleSound` / `toggleMusic` persist `soundEnabled` / `musicEnabled` in `mergehold-td-progress-v1` via `saveProgress`; `resetProgress` preserves audio prefs (DEC-022). No code regression.

---

ID: BUG-016
Title: End-of-run gem toast only in Phaser — leaving via HUD skips reward feedback
Status: Verified
Severity: S2
Area: Run UI / meta feedback
Found in: Audit 2026-05-18 (AUD-015)
Owner: Run lifecycle + meta agents
Date opened: 2026-05-18
Date closed: 2026-05-18
Related issue: BUG-006, BUG-007, DEC-020, DEC-024

Steps to reproduce:
1. Lose the fort — read “Earned N gems” on canvas.
2. Alternatively, tap Home before game over.

Expected:
Consistent post-run summary in React (gems, best wave) whether player restarts or goes Home.

Actual:
Reward UI was Phaser text overlay only; Home exit never showed earned gems.

Notes:
Phaser fort-lost overlay removed; `RunScene` emits `runEnded` and sets `isGameOver` on HUD state. `RunEndSummaryModal` in `App.tsx` reads `runEndSummary` (defeat: drip + fort bonus; abandon: drip only). Defeat: Play again / Home; abandon: Home.

Verification:
Fort loss → React summary (gems, peak wave, wallet). Abandon via leave confirm → same modal pattern. 2026-05-18 browser @ 390×844. DEC-024.

---

ID: BUG-017
Title: Enemy sprite facing on path corners needs visual QA
Status: Verified
Severity: S4
Area: Graphics / polish
Found in: Audit 2026-05-18 (AUD-014)
Owner: Unassigned
Date opened: 2026-05-18
Related issue: N/A

Steps to reproduce:
1. Play at 390×844; watch runner/grunt on sharp path turns at 1.5× speed.

Expected:
Sprites face travel direction smoothly (`spriteFacingOffset` in `RunScene.ts`).

Actual:
Runner/tank/shield used offset `0` while art faces up at rotation 0 → ~90° wrong on vertical path legs.

Verification:
Graphics QA 2026-05-18: `tank`, `shield` → `+π/2`; `grunt` stays `0`. Runner re-tuned in BUG-018 / DEC-026 (`kenney-enemy-runner` → `0`). Play @ 390×844; enemies track path on vertical/diagonal segments. `docs/GRAPHICS.md` table synced (DEC-021 / DEC-026).

---

## Fixed Bugs (pre-audit)

ID: BUG-005
Title: Built towers cannot be upgraded — "Build pad is occupied"
Status: Fixed
Severity: S1
Area: Gameplay / build pads
Found in: Tower placement after React HUD pass
Owner: Unassigned
Date opened: 2026-05-18
Related issue: N/A

Steps to reproduce:
1. Start a run and place a tower on a build pad.
2. With a tower type still selected, tap the same pad again to merge/upgrade.

Expected:
Spending 15 coins upgrades the tower tier.

Actual:
`tryBuildOrMerge` called `isPadOccupied()` before checking for an existing tower on that pad, so the occupied check fired and blocked the upgrade path.

Notes:
Tower upgrade logic existed but was unreachable when a tower was already on the pad.

Verification:
Tap placed tower with tower mode selected; tier increases for 15 coins.

ID: BUG-003
Title: Upgrade picker hides the run HUD bars
Status: Fixed
Severity: S2
Area: Run UI
Found in: React PlayHud overlay pass
Owner: Unassigned
Date opened: 2026-05-18
Related issue: N/A

Steps to reproduce:
1. Start a run and clear a wave.
2. Wait for the “Choose an upgrade” overlay.

Expected:
The top stat bar and bottom build dock stay visible while the player picks a card (overlay covers the field only).

Actual:
`PlayHud` returns `null` when `isChoosingUpgrade` is true, so the top and bottom UI bars disappear for the whole upgrade step.

Notes:
Regression from moving run chrome into React; Phaser overlay is not the cause—the HUD is explicitly unmounted.

Verification:
PlayHud stays mounted during upgrade; dock shows “Pick an upgrade card” hint.

ID: BUG-004
Title: Start Wave button shows the wrong wave number
Status: Fixed
Severity: S2
Area: Run UI / waves
Found in: Manual start-wave flow after upgrade pick
Owner: Unassigned
Date opened: 2026-05-18
Related issue: N/A

Steps to reproduce:
1. Start a run and clear wave 1.
2. Pick an upgrade.
3. Compare the Wave pill in the top bar with the “Start wave” button label.

Expected:
After wave 1 is cleared, the top bar still shows **Wave 1** (last cleared) and the button reads **Start wave 2** (next wave to fight).

Actual:
`chooseUpgrade()` increments `wave` before the player taps Start Wave, and `PlayHud` labels the button with `wave + 1`, so the UI shows **Wave 2** and **Start wave 3**.

Notes:
Wave should advance when the next wave actually starts (`beginNextWave` / `spawnWave`), not when the upgrade is chosen.

Verification:
Wave increments in `beginNextWave`; button label uses `wave + 1` for the next wave to start.

ID: BUG-001
Title: Enemies could target an earlier path point instead of advancing cleanly through the lane.
Status: Fixed
Severity: S1
Area: Gameplay
Found in: Visual asset pass
Owner: Codex
Date opened: 2026-05-18
Related issue: N/A

Steps to reproduce:
Start a run and observe enemies after they leave the first spawn point.
Expected:
Enemies should advance from waypoint to waypoint toward the fort.
Actual:
The target lookup could choose a previous waypoint, causing unstable movement.
Notes:
Enemies now track their current path index.
Verification:
`npm run build` passes and mobile browser smoke test loads Play with no console errors.

ID: BUG-002
Title: Play screen could scroll inside the mobile frame.
Status: Fixed
Severity: S2
Area: Mobile UI
Found in: Mobile browser smoke test
Owner: Codex
Date opened: 2026-05-18
Related issue: N/A

Steps to reproduce:
Open Play on a 390x844 viewport.
Expected:
The canvas should fit the available play area without an inner scrollbar.
Actual:
The screen body could scroll.
Notes:
Play screen now uses a no-scroll screen body and full-height canvas.
Verification:
Mobile browser check reported no body or screen scrolling.
