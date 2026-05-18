# Agent handoff — Graphics QA (rotation & corners) (2026-05-18)

> **Role:** Graphics QA agent — visual regression on sprite facing only. **No new assets.** Adjust `spriteFacingOffset` if needed.
> **Parent audit:** [2026-05-18-audit.md](./2026-05-18-audit.md)
> **Depends on:** [2026-05-18-gameplay-content.md](./2026-05-18-gameplay-content.md) if bat/bomber added (verify their facing on path)

**Repo:** https://github.com/mateuszBetlej4/mergehold-td.git  
**Branch:** `main`  
**Dev:** `npm run dev` → http://127.0.0.1:5173/  
**Viewport:** 390×844, test at 1× and 2× speed

---

## Mission

Regression-test **unit rotation** after the 2026-05-18 graphics pass. Fix magic-tower, runner, bat, or corner cases where sprites face wrong direction.

---

## Issues in scope

| ID | Title | Acceptance criteria |
|----|-------|---------------------|
| AUD-014 / BUG-017 | Facing offsets on corners | Enemies/towers/troops face movement or target on sharp path turns; table in `docs/GRAPHICS.md` updated if offsets change. |

---

## Files

| Touch | Avoid |
|-------|-------|
| `src/game/scenes/RunScene.ts` — `spriteFacingOffset`, `rotateSpriteToward` | React menus, economy |
| `docs/GRAPHICS.md` — offset table | New downloads |

---

## Implementation notes

Canonical table: `docs/GRAPHICS.md` § Sprite rotation.

Known fixes from graphics session: magic tower `0`, runner `0` (was `π/2`). If a unit looks 90° off, toggle between `0` and `+π/2` for that texture key only.

**Checklist:**

- [ ] grunt, runner, tank, shield on S-curve path
- [ ] gatebreaker boss on wave 5
- [ ] archer/cannon/magic aim at targets in range
- [ ] barracks troops face combat target
- [ ] bat/bomber (if spawned) — SVG tint enemies use `+π/2` offset

---

## Test plan

1. Play waves 1–6 at 2× speed; screenshot corners.
2. Place each tower type; confirm barrel points at enemy.
3. `npm run build`
4. Update `BUG-017` → Fixed/Verified in tracker if no issues.

---

## Git workflow

```bash
npm run build
git add src/game/scenes/RunScene.ts docs/GRAPHICS.md docs/tracking/BUG_TRACKER.md
git commit -m "Tune sprite facing offsets on path corners"
```

---

## Prompt for agent

---

You are the **graphics QA agent** for **Mergehold TD**.

1. Read `docs/handoffs/2026-05-18-graphics-qa.md` and **`docs/GRAPHICS.md`**.
2. Visual pass BUG-017 (AUD-014); minimal offset tweaks only.
3. Do not add assets or change wave/meta systems.
4. `npm run build`; Play @ 390×844.

Repo: `C:\Users\mateuszb\Documents\AI Projects\TD`

---
