# Agent handoff — Settings, deploy tile & persistence (2026-05-18)

> **Role:** Shell polish agent — hide dev Deploy from Home, persist audio toggles. Small, isolated changes.
> **Parent audit:** [2026-05-18-audit.md](./2026-05-18-audit.md)
> **Depends on:** None (Settings copy overlap with collection-ui — coordinate to avoid duplicate edits)

**Repo:** https://github.com/mateuszBetlej4/mergehold-td.git  
**Branch:** `main`  
**Dev:** `npm run dev` → http://127.0.0.1:5173/

---

## Mission

Remove **player-facing Deploy scaffolding** from Home; **persist** SFX/Music toggles across reloads. Optional: `import.meta.env.DEV` gate for Deploy screen.

---

## Issues in scope

| ID | Title | Acceptance criteria |
|----|-------|---------------------|
| AUD-012 / BUG-014 | Deploy on Home | Deploy tile hidden in production UI or moved under Settings (dev-only). |
| AUD-013 / BUG-015 | Audio toggles not saved | Reload preserves SFX/Music; stored in `mergehold-td-progress-v1` or `mergehold-td-settings-v1`. |

---

## Files

| Touch | Avoid |
|-------|-------|
| `src/app/App.tsx` — Home grid, optional Settings link to Deploy | `RunScene.ts` |
| `src/state/useGameStore.ts` — extend `loadProgress`/`saveProgress` or separate settings key | Wave mix |
| `src/app/App.css` — only if layout changes | Collection sprites |

---

## Implementation notes

**Deploy today:** `MenuTile icon={Rocket} label="Deploy"` on Home (`App.tsx` ~197); `DeployScreen` shows Vercel/Supabase/Render copy.

**Persistence pattern:**

```ts
// Option A: extend progress blob
{ softCurrency, bestWave, ..., soundEnabled, musicEnabled }

// Option B: mergehold-td-settings-v1
```

Wire toggles to actual Phaser/audio only if a sound system exists; storing state is still valuable for future SFX.

**DEV gate example:** `import.meta.env.DEV && <MenuTile ... Deploy />`

---

## Test plan

1. Home — no Deploy tile in prod build (`npm run build` + preview).
2. Settings — toggle SFX off → reload → still Off.
3. DEV: Deploy still reachable if gated behind flag.
4. `npm run build`

---

## Git workflow

```bash
npm run build
git add src/app/App.tsx src/state/useGameStore.ts
git commit -m "Hide deploy tile and persist audio settings"
```

---

## Prompt for agent

---

You are the **settings polish agent** for **Mergehold TD**.

1. Read `docs/handoffs/2026-05-18-polish-settings.md`.
2. Fix BUG-014, BUG-015 (AUD-012, AUD-013).
3. Hide Deploy from Home; persist sound/music toggles.
4. `npm run build`; verify Settings reload.

Repo: `C:\Users\mateuszb\Documents\AI Projects\TD`

---
