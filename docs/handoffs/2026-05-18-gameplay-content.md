# Agent handoff — Gameplay content & waves (2026-05-18)

> **Role:** Gameplay agent — wave enemy mix and content exposure. **Do not** change meta economy unless unlock copy requires wave-table doc updates.
> **Parent audit:** [2026-05-18-audit.md](./2026-05-18-audit.md)
> **Depends on:** [2026-05-18-meta-progression.md](./2026-05-18-meta-progression.md) if unlock behavior changes (AUD-005)

**Repo:** https://github.com/mateuszBetlej4/mergehold-td.git  
**Branch:** `main`  
**Dev:** `npm run dev` → http://127.0.0.1:5173/

---

## Mission

Spawn **bat** and **bomber** in live waves per design. Assets and definitions already exist; `getWaveEnemyMix()` excludes them.

---

## Issues in scope

| ID | Title | Acceptance criteria |
|----|-------|---------------------|
| AUD-011 / BUG-013 | bat/bomber never spawn | Waves include bat/bomber at agreed tiers; sprites match Collection (after collection-ui handoff). |
| AUD-005 | Unlock alignment | If meta handoff changes `bestWave` rules, verify hero unlock waves still feel fair — no duplicate work here unless wave difficulty shifts. |

---

## Files

| Touch | Avoid |
|-------|-------|
| `src/game/scenes/RunScene.ts` — `getWaveEnemyMix()` | React menus |
| `src/data/enemies.ts` — tuning HP/speed if needed | `useGameStore` economy |
| `docs/FEATURE_SPEC.md` or checklist — note wave table | Graphics rotation table |

---

## Implementation notes

**Current mix** (`RunScene.ts` ~1226–1239):

- Wave % 5 === 0 → gatebreaker only
- wave ≥ 4 → grunt, runner, tank, shield
- wave ≥ 2 → grunt, runner
- else grunt

**Assets already mapped** (`enemyAssetKeys`): bat → `enemy-runner` + tint; bomber → `enemy-grunt` + tint.

**Suggested table (tune with playtest):**

| Waves | Mix |
|-------|-----|
| 1 | grunt |
| 2–3 | grunt, runner |
| 4+ | grunt, runner, tank, shield |
| 6+ | add bat |
| 8+ | add bomber |
| 5,10,15… | gatebreaker boss |

Keep boss every 5 waves (DEC-015). Balance HP scaling `definition.hp + wave * 6` still applies.

---

## Test plan

1. Play with 2× speed to wave 8+.
2. Confirm bat (fast, tinted runner SVG) and bomber appear.
3. Wave 5 boss still gatebreaker only.
4. `npm run build`; no console texture errors.

---

## Git workflow

```bash
npm run build
git add src/game/scenes/RunScene.ts src/data/enemies.ts
git commit -m "Add bat and bomber to wave spawn mix"
```

---

## Prompt for agent

---

You are the **gameplay content agent** for **Mergehold TD**.

1. Read `docs/handoffs/2026-05-18-gameplay-content.md`.
2. Fix BUG-013 (AUD-011): extend `getWaveEnemyMix()`.
3. Light balance pass only if waves feel unfair.
4. `npm run build`; playtest waves 1–10 @ 390×844.

Repo: `C:\Users\mateuszb\Documents\AI Projects\TD`

---
