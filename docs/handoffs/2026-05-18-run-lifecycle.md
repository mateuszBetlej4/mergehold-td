# Agent handoff — Run lifecycle & leave flow (2026-05-18)

> **Role:** Run session agent — abandon confirm, optional persistence, unified end-run UX. Coordinate with meta-progression handoff for gem/forfeit rules.
> **Parent audit:** [2026-05-18-audit.md](./2026-05-18-audit.md)
> **Depends on:** [2026-05-18-meta-progression.md](./2026-05-18-meta-progression.md) for what happens to gems/`bestWave` on leave

**Repo:** https://github.com/mateuszBetlej4/mergehold-td.git  
**Branch:** `main`  
**Dev:** `npm run dev` → http://127.0.0.1:5173/

---

## Mission

Fix **leave run = silent wipe**: today Home unmounts Phaser and starts fresh on next Play. Add explicit player-facing abandon/resume rules and post-run feedback in React.

---

## Issues in scope

| ID | Title | Acceptance criteria |
|----|-------|---------------------|
| AUD-006 / BUG-007 | Home resets run | Leave flow documented; confirm before destroy OR keep canvas mounted / snapshot resume. |
| AUD-007 / BUG-007 | No run persistence | Either `localStorage` run snapshot **or** intentional roguelike “leave = abandon” with clear copy. |
| AUD-015 / BUG-016 | Game over only in Phaser | React summary (gems, wave) when run ends or player leaves after rewards policy. |

---

## Files

| Touch | Avoid |
|-------|-------|
| `src/app/PlayHud.tsx` — Home button, confirm modal | Wave tables, enemy mix |
| `src/game/GameCanvas.tsx` — mount strategy (keep alive vs remount) | `drawMap`, sprite preload |
| `src/app/App.tsx` — Play screen layout, optional `RunSummary` modal | Collection card art |
| `src/state/useGameStore.ts` — optional `run-v1` persist | Meta gem formula (meta handoff) unless abandon claims rewards |
| `src/game/scenes/RunScene.ts` — serialize/deserialize minimal state if resuming | Graphics offsets |

---

## Implementation notes

**Reset chain today:**

1. `PlayHud` Home → `setActiveScreen("home")`
2. `PlayScreen` unmounts → `GameCanvas` cleanup → `game.destroy(true)`
3. Next Play → new Phaser `RunScene`, wave 1

**Options:**

- **A — Confirm abandon:** Modal: “Leave run? Progress this run will be lost.” / “You keep gems for wave X” per meta handoff. Still destroy canvas.
- **B — Keep Phaser mounted:** Hide play section with CSS; don’t unmount `GameCanvas` when navigating Home (larger change).
- **C — Snapshot:** Save `{ wave, coins, fortHp, towers... }` to `mergehold-td-run-v1`; restore on Play (high effort).

`setRunSnapshot` is HUD-only and not persisted.

---

## Test plan

1. Start run → build → clear wave 1 → tap Home → confirm dialog appears (if A).
2. Cancel confirm → still in run at same wave.
3. Confirm abandon → Play again → behavior matches design (fresh vs resume).
4. Lose fort → see React and/or Phaser “Earned N gems”; navigate Home → summary still visible if applicable.
5. `npm run build`

---

## Git workflow

```bash
npm run build
git add src/app/PlayHud.tsx src/game/GameCanvas.tsx src/app/App.tsx
git commit -m "Add run leave confirm and end-run summary UX"
```

---

## Prompt for agent

---

You are the **run lifecycle agent** for **Mergehold TD**.

1. Read `docs/handoffs/2026-05-18-run-lifecycle.md` and meta-progression handoff for reward rules.
2. Fix BUG-007, BUG-016 (AUD-006, AUD-007, AUD-015).
3. Implement abandon confirm and/or resume; unify end-run feedback.
4. Do not break Play HUD pause/speed/upgrade flow.
5. `npm run build`; test leave + re-enter @ 390×844.

Repo: `C:\Users\mateuszb\Documents\AI Projects\TD`

---
