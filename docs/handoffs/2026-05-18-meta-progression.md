# Agent handoff — Meta progression & economy (2026-05-18)

> **Role:** Meta agent — fix gem earning, `bestWave`, unlock alignment, and Home progress display. **Do not** change Phaser combat or graphics unless required for reward hooks.
> **Parent audit:** [2026-05-18-audit.md](./2026-05-18-audit.md)
> **Depends on:** Product call on abandon/forfeit (see audit open questions). Run-lifecycle handoff should align UX copy with whatever you implement here.

**Repo:** https://github.com/mateuszBetlej4/mergehold-td.git  
**Branch:** `main`  
**Workspace:** `C:\Users\mateuszb\Documents\AI Projects\TD`  
**Dev:** `npm install` → `npm run dev` → http://127.0.0.1:5173/ (or next free port)  
**Viewport:** 390×844 mobile portrait

---

## Mission

Make the **between-runs loop honest**: players earn and see gems, `bestWave` advances when they meet unlock milestones, and Home/Heroes/Maps copy matches behavior. `buyPermanentUpgrade` already works when `softCurrency > 0`.

---

## Issues in scope

| ID | Title | Acceptance criteria |
|----|-------|---------------------|
| AUD-001 / BUG-006 | No gems unless fort dies | Gems and/or `bestWave` update per agreed design when clearing waves or ending a run (not only `fortHp <= 0`). |
| AUD-002 / BUG-006 | `bestWave` stale mid-run | After reaching wave N, meta unlocks and Home **Best** reflect N without requiring fort death at N. |
| AUD-005 / BUG-006 | Unlock copy vs logic | “Clear wave 5” on heroes/maps matches `getUnlockWave()` + `progress.bestWave` behavior. |
| AUD-003 / BUG-009 | Upgrades feel broken at 0 gems | Rows show affordable vs broke clearly; optional toast on failed buy. |
| AUD-004 / BUG-008 | Home progress thin | Home shows meaningful Best/Gems/last-run or peak-wave metrics (coordinate with run-lifecycle if abandon flow added). |

---

## Files

| Touch | Avoid |
|-------|-------|
| `src/state/useGameStore.ts` — `claimRunRewards`, new helpers (`recordWaveClear`, `syncBestWave`, partial rewards) | `RunScene.ts` combat balance |
| `src/game/scenes/RunScene.ts` — call meta hooks on wave clear / game over only | `PlayHud.tsx` unless HUD needs reward toast |
| `src/app/App.tsx` — Home `quick-stats`, `PermanentUpgradesScreen`, Heroes/Maps locked copy | Graphics assets, `getWaveEnemyMix` |
| `docs/tracking/BUG_TRACKER.md`, `DECISION_LOG.md` (DEC-020+) | Collection thumbnails (other handoff) |

---

## Implementation notes

**Current reward path (fort death only):**

```ts
// RunScene.ts ~1393–1395, ~1758–1762
if (this.fortHp <= 0 && !this.isGameOver) {
  const reward = this.claimEndOfRunRewards(); // → claimRunRewards(wave, coins)
}
```

**Existing formula** (`useGameStore.ts`):

```ts
const reward = Math.max(8, Math.floor(wave * 12 + coins * 0.08));
```

**Suggested approach (pick one with user if unclear):**

1. **Wave milestones:** On `tryCompleteWave` / after upgrade pick, call `recordHighestWave(wave)` and optionally small per-wave gem drip.
2. **End-of-run only but fair:** On abandon confirm (run-lifecycle handoff), call `claimRunRewards` with current wave/coins; on Home without confirm, forfeit.
3. **Hybrid:** `bestWave` updates on wave clear; full gem lump on fort death only.

Unlock check today: `progress.bestWave >= getUnlockWave(hero.unlock)` in `App.tsx`.

---

## Test plan

1. Reset save (Settings) → Home: Gems 0, Best W1.
2. Play → clear wave 1 → Home → verify Best/Gems per design.
3. Play → reach wave 5 milestone → Heroes: Ember Ranger unlocks without dying at wave 5.
4. Lose fort → gems increase; buy Fort Masonry → level 1; new run → higher starting fort HP.
5. `npm run build`

---

## Git workflow

```bash
git status --short --branch
npm run build
git add src/state/useGameStore.ts src/game/scenes/RunScene.ts src/app/App.tsx docs/tracking/
git commit -m "Fix meta progression: gems and bestWave on wave milestones"
git push
```

---

## Prompt for agent

---

You are the **meta progression agent** for **Mergehold TD**.

1. Read `docs/handoffs/2026-05-18-meta-progression.md` and parent [2026-05-18-audit.md](./2026-05-18-audit.md).
2. Fix BUG-006, BUG-008, BUG-009 (AUD-001–005). Implement `bestWave`/gem rules; align unlock copy.
3. Touch `useGameStore.ts`, reward hooks in `RunScene.ts`, Home/Upgrades in `App.tsx`.
4. `npm run build`; browser test @ 390×844.
5. Update `BUG_TRACKER.md` statuses; add DEC-020 if you lock abandon/forfeit policy.

Repo: `C:\Users\mateuszb\Documents\AI Projects\TD`

---
