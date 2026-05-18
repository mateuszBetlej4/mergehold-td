# Agent handoff — Collection & menu UI (2026-05-18)

> **Role:** Menu UI agent — wire Kenney/SVG thumbs into catalog screens; fix misleading labels and settings copy. **Reuse existing assets only** (see `docs/GRAPHICS.md`).
> **Parent audit:** [2026-05-18-audit.md](./2026-05-18-audit.md)
> **Depends on:** None

**Repo:** https://github.com/mateuszBetlej4/mergehold-td.git  
**Branch:** `main`  
**Dev:** `npm run dev` → http://127.0.0.1:5173/

---

## Mission

Replace **letter `card-token`** placeholders in Collection/Home catalogs with the same sprites used in Play. Clarify roguelike vs permanent upgrade navigation. Update Settings credits blurb.

---

## Issues in scope

| ID | Title | Acceptance criteria |
|----|-------|---------------------|
| AUD-008 / BUG-010 | Collection lacks art | Buildings/Enemies/Troops cards show `<img src="/assets/optimized/sprites/...">` per mapping table. |
| AUD-009 / BUG-011 | Settings blurb outdated | Credits card mentions Kenney CC0 + project SVGs; points to `ASSET_CREDITS.md`. |
| AUD-010 / BUG-012 | Upgrades tab confusion | Collection tile renamed/split so “6 upgrades” ≠ Permanent Upgrades shop. |

---

## Files

| Touch | Avoid |
|-------|-------|
| `src/app/App.tsx` — `CardsScreen`, `CollectionScreen`, `SettingsScreen`, optional shared `CatalogThumb` | `RunScene.ts` gameplay |
| `src/app/App.css` — `.card-token` img sizing | New asset downloads |
| `public/assets/licenses/ASSET_CREDITS.md` — only if new files referenced | Meta economy |

---

## Implementation notes

**Asset mapping** (from `docs/GRAPHICS.md`):

| Catalog | Example path |
|---------|----------------|
| Archer tower | `/assets/optimized/sprites/kenney-tower-archer.png` |
| Grunt | `/assets/optimized/sprites/kenney-enemy-grunt.png` |
| Bat | `/assets/optimized/sprites/enemy-runner.svg` (+ tint from `enemies.ts` color if needed) |
| Barracks | `/assets/optimized/sprites/barracks.svg` |

Add a small helper, e.g. `getCatalogSpriteId(itemId, category)`, mapping `buildings.ts` / `enemies.ts` ids to filenames — mirror `enemyAssetKeys` / tower keys in `RunScene.ts` or `gameBridge.ts` to avoid drift.

**Heroes/Maps:** Can keep colored tokens or use `hero-guardian.svg` + hero color tint.

**Collection tile:** Rename to “Run upgrades (6)” or route to a read-only catalog; keep bottom nav **Upgrades** for permanent shop.

---

## Test plan

1. Collection → Buildings — each card shows tower/structure thumb, not “A/C/M…” letters.
2. Collection → Enemies — grunt/runner/bat thumbs visible.
3. Settings → Asset credits — no “procedural placeholders” text.
4. Collection “upgrades” tile — label clearly in-run vs nav Permanent Upgrades.
5. `npm run build`; 390×844 visual check.

---

## Git workflow

```bash
npm run build
git add src/app/App.tsx src/app/App.css
git commit -m "Add collection menu sprites and fix settings copy"
```

---

## Prompt for agent

---

You are the **collection UI agent** for **Mergehold TD**.

1. Read `docs/handoffs/2026-05-18-collection-ui.md` and **`docs/GRAPHICS.md`**.
2. Fix BUG-010, BUG-011, BUG-012 (AUD-008–010).
3. Reuse `/assets/optimized/sprites/` only; no new packs.
4. `npm run build`; verify Collection + Settings in browser.

Repo: `C:\Users\mateuszb\Documents\AI Projects\TD`

---
