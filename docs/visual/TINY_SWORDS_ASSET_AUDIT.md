# Tiny Swords Visual Redesign Audit

Branch: `visual/tiny-swords-redesign`  
Source folder inspected locally: `public/assets/source/Tiny Swords (Free Pack)/`  
Source page: https://pixelfrog-assets.itch.io/tiny-swords

## Summary

Tiny Swords is strong enough to become the main visual identity for Mergehold TD. It has a coherent top-down fantasy kingdom style, matching buildings, animated human units, terrain tiles, decorations, UI elements, and particle effects. It is a much better fit for a polished mobile game than the mixed Kenney/procedural look currently in runtime.

The pack is not just a sprite swap. It supports a fuller redesign:

- Real castle/settlement center instead of abstract fort SVG.
- Faction-colored buildings and units.
- Animated troops and enemies using sprite sheets.
- Grass/cliff/water tilemap look instead of simple tinted rectangles/path dots.
- Real UI buttons, bars, banners, icons, avatars, and paper panels.
- Combat feedback with dust, fire, explosion, and water splash FX.

## Important License Note

No license or readme file was found inside the local folder. The official itch page says the pack can be used in personal/commercial projects and modified, with credit optional, but assets may not be redistributed, resold, or repackaged.

Practical rule for this repo:

- Do not commit the whole raw source pack to a public repository.
- Do not commit `.aseprite` source files unless the license/export workflow is clarified.
- Commit only curated runtime files that the game actually uses.
- Keep `public/assets/source/Tiny Swords (Free Pack)/` as local-only source material unless the repo visibility/licensing decision changes.
- Add Pixel Frog attribution in `public/assets/licenses/ASSET_CREDITS.md` when runtime Tiny Swords files are introduced.

## Inventory

Local file count:

| Type | Count |
|------|------:|
| PNG | 410 |
| Aseprite | 18 |
| `.DS_Store` | 34 |

Top-level PNG count:

| Folder | PNGs | Usefulness |
|--------|-----:|------------|
| `Buildings` | 40 | Excellent for fort, towers, barracks, shrine, economy/support structures |
| `Units` | 225 | Excellent for animated troops/heroes/enemies |
| `Terrain` | 60 | Excellent for map tile redesign and decorations |
| `UI Elements` | 77 | Excellent for menus, buttons, HUD, bars, cards |
| `Particle FX` | 8 | Good for tower hits, explosions, leaks, ability effects |

## Building Assets

Five faction palettes exist:

- `Black Buildings`
- `Blue Buildings`
- `Purple Buildings`
- `Red Buildings`
- `Yellow Buildings`

Each faction has:

- `Archery.png`
- `Barracks.png`
- `Castle.png`
- `House1.png`
- `House2.png`
- `House3.png`
- `Monastery.png`
- `Tower.png`

Recommended mapping:

| Current Game Object | Tiny Swords Asset |
|---------------------|-------------------|
| Fort / keep | `Blue Buildings/Castle.png` |
| Archer Tower | `Blue Buildings/Archery.png` |
| Cannon Tower | Keep Kenney cannon short-term or use `Tower.png` with projectile/FX |
| Magic Tower | `Purple Buildings/Monastery.png` or `Purple Buildings/Tower.png` |
| Barracks | `Blue Buildings/Barracks.png` |
| Healing Shrine | `Blue Buildings/Monastery.png` |
| Coin Mill | `House1/House2/House3` plus gold resource decoration |
| Enemy spawn camps | `Red/Black Buildings` variants |

Gap: there is no obvious cannon building in the free pack. The visual solution is to either keep the current cannon sprite temporarily, treat `Tower.png` as cannon, or use an FX/projectile-first read for cannon identity.

## Unit Assets

Five faction palettes exist:

- `Black Units`
- `Blue Units`
- `Purple Units`
- `Red Units`
- `Yellow Units`

Each faction includes:

| Unit | Animations / Files |
|------|--------------------|
| Archer | `Archer_Idle`, `Archer_Run`, `Archer_Shoot`, `Arrow` |
| Lancer | Directional attack/defence sheets |
| Monk | `Idle`, `Run`, `Heal`, `Heal_Effect` |
| Pawn | Idle/interact/run sheets with axe, gold, hammer, knife, meat, wood |
| Warrior | `Warrior_Idle`, `Warrior_Run`, `Warrior_Attack1`, `Warrior_Attack2`, `Warrior_Guard` |

Recommended mapping:

| Current Game Concept | Tiny Swords Asset |
|----------------------|-------------------|
| Hero: Stone Warden | `Blue Units/Warrior` |
| Hero: Wild Arrow | `Blue Units/Archer` |
| Hero: Ember Sage | `Purple Units/Monk` |
| Friendly troop: blocker | `Blue Units/Warrior` or `Lancer` |
| Friendly troop: ranged | `Blue Units/Archer` |
| Friendly troop: healer/support | `Blue Units/Monk` |
| Enemy grunt | `Red Units/Pawn` or `Black Units/Pawn` |
| Enemy runner | `Red Units/Warrior_Run` with higher speed |
| Enemy tank/shield | `Red Units/Lancer` or `Warrior_Guard` |
| Enemy bomber | `Black Units/Pawn` with fire/explosion FX |
| Boss/gatebreaker | Large scaled `Black Units/Warrior` or enemy building/castle siege marker |

Gap: this free pack is mostly humans/factions, not monsters. That is fine for a first real-looking game: reframe enemies as rival factions rather than monsters. If monster variety is still desired, add Tiny Swords Enemy Pack later or use another licensed enemy pack.

## Terrain Assets

Terrain includes:

- `Tileset/Tilemap_color1.png` through `Tilemap_color5.png`
- `Tileset/Water Background color.png`
- `Tileset/Water Foam.png`
- `Tileset/Shadow.png`
- Decorations: bushes, clouds, rocks, water rocks, rubber duck
- Resources: gold, meat/sheep, tools, wood/trees

Recommended mapping:

| Current Map Feature | Tiny Swords Asset Direction |
|---------------------|-----------------------------|
| Grass map base | Tilemap grass tiles |
| Path lanes | Use tilemap edge/cliff/ground pieces or stamp custom path strips |
| Map obstacles | Rocks, bushes, trees |
| Coin Mill/economy read | Gold/resource tiles |
| Water/river maps | Water background + foam + water rocks |
| Pad shadows | `Shadow.png` |

The tilemap grid is 64x64. Current Phaser layout uses 390x694 logical canvas; this can work with 64px tiles if we render roughly 7x11 tile coverage and crop/scale cleanly.

## UI Assets

UI includes:

- Large and small button states
- Blue/red round and square buttons
- Big/small bars
- Banners and ribbons
- Icons
- 25 human avatars
- Paper panels
- Wood table panels
- Swords

Recommended mapping:

| Current UI | Tiny Swords Upgrade |
|------------|---------------------|
| Hero card | Paper/wood panel with castle/hero sprite |
| Bottom nav | Keep React icons for now, add parchment/wood styling |
| Upgrade cards | Paper panels + rarity ribbons |
| HP/coin/wave HUD | Tiny bars + icon row |
| Settings/account | Paper panel with blue/red buttons |
| Collection cards | Avatar/sprite thumbnails on wood/paper cards |

## Particle FX

Particle files:

- `Dust_01.png`
- `Dust_02.png`
- `Explosion_01.png`
- `Explosion_02.png`
- `Fire_01.png`
- `Fire_02.png`
- `Fire_03.png`
- `Water Splash.png`

Recommended mapping:

| Event | FX |
|-------|----|
| Enemy hit/death | Dust |
| Cannon/bomber | Explosion |
| Mage/Ember Sage | Fire |
| Water map interaction | Water splash |
| Build placement | Dust |

## Redesign Direction

Preferred art direction:

**Mergehold TD becomes a tiny kingdom defense game.** The player controls the blue kingdom defending a castle against red/black faction raids. Purple/yellow variants become unlockable skins, elite enemy waves, or later seasonal maps.

This avoids forcing monster language onto human faction sprites and gives the game a clean identity:

- Blue = player kingdom
- Red/Black = enemy factions
- Purple = magic/elite
- Yellow = premium/unlocked/merchant visual language

## Implementation Plan

### Phase 1: Safe Runtime Import

- Create `public/assets/optimized/tiny-swords/`.
- Copy only chosen runtime PNGs, not the whole pack.
- Add an asset manifest file in `src/data/tinySwordsAssets.ts`.
- Add Pixel Frog credit to `public/assets/licenses/ASSET_CREDITS.md`.
- Add `.DS_Store` cleanup/ignore.

Suggested first runtime set:

- `Buildings/Blue Buildings/Castle.png`
- `Buildings/Blue Buildings/Archery.png`
- `Buildings/Blue Buildings/Barracks.png`
- `Buildings/Blue Buildings/Tower.png`
- `Buildings/Blue Buildings/Monastery.png`
- `Buildings/Red Buildings/Castle.png`
- `Units/Blue Units/Archer/Archer_*`
- `Units/Blue Units/Warrior/Warrior_*`
- `Units/Blue Units/Monk/*`
- `Units/Red Units/Pawn/Pawn_Run.png`
- `Units/Red Units/Warrior/Warrior_Run.png`
- `Units/Red Units/Lancer/*`
- `Particle FX/Dust_01.png`
- `Particle FX/Explosion_01.png`
- `Particle FX/Fire_01.png`
- `Terrain/Tileset/Tilemap_color1.png`
- `Terrain/Tileset/Shadow.png`
- selected rocks/bushes/trees/resources
- selected UI buttons/bars/paper panels

### Phase 2: Phaser Scene Visual Swap

- Load Tiny Swords runtime assets in `RunScene`.
- Replace fort SVG with castle PNG.
- Replace tower sprites with building PNGs.
- Replace enemy static sprites with animated sprite sheets.
- Replace friendly troops with animated warrior/archer/monk sprites.
- Use `Shadow.png` under units/buildings.
- Add FX sprites for build, hit, death, cannon, and ability events.

### Phase 3: Map Tile Pass

- Use `Tilemap_color1.png` as the first map tilesheet.
- Keep current `mapLayouts.ts` route geometry.
- Render the background as tile stamps behind the existing routes.
- Preserve tower/trap pad validation from `npm run audit:maps`.
- Replace path-dot look with terrain/path tile styling.

### Phase 4: Menu/HUD Skin

- Convert collection thumbnails to Tiny Swords sprites.
- Restyle cards/buttons to parchment/wood style using CSS first.
- Use UI PNGs selectively where they improve polish without making text layout fragile.
- Replace HP/coin/wave HUD elements with Tiny Swords bars/icons.

### Phase 5: Verify And Decide

- Run `npm run build`.
- Run `npm run audit:maps`.
- QA at `390x844`.
- Capture before/after screenshots.
- Decide whether to merge this branch or keep it as a visual prototype.

## Main Risks

- Licensing: do not push the whole raw pack into a public repo.
- Sprite sheet slicing: many sheets are wide strips; Phaser needs exact frame sizes.
- Directionality: some Tiny Swords units have directional sheets, some do not.
- Cannon identity: no obvious cannon building in free pack.
- Monster variety: free pack is human faction focused.
- UI PNGs can fight responsive text if overused; CSS skinning may be safer for mobile.

## Recommendation

Proceed with the Tiny Swords redesign. Use it as the primary art direction for this branch, but do it as a curated runtime import rather than committing the raw pack.

First build target: one polished mobile run screen with:

- Blue castle fort
- Blue archery/tower/barracks/monastery buildings
- Red/black animated raiders
- Tiny Swords grass/terrain/decor
- Dust/explosion/fire FX
- Parchment/wood HUD skin

That will make the game look like a real product quickly without changing the core gameplay systems.

## Implementation Status

- [x] Branch created away from `main`: `visual/tiny-swords-redesign`.
- [x] Raw pack audited and kept local-only under `public/assets/source/Tiny Swords (Free Pack)/`.
- [x] Curated runtime subset copied to `public/assets/optimized/tiny-swords/`.
- [x] Runtime manifest added in `src/data/tinySwordsAssets.ts`.
- [x] Pixel Frog credit added to `public/assets/licenses/ASSET_CREDITS.md`.
- [x] Phaser run scene loads Tiny Swords buildings, units, projectiles, terrain props, and FX.
- [x] Run scene now uses Blue kingdom buildings, animated Blue troops, animated Red/Black raiders, castle fort, shadows, decor, and combat FX.
- [x] React HUD/catalog thumbnails point at the curated Tiny Swords runtime assets where relevant.
- [x] First map tile pass using the 64px Tiny Swords tilesheet plus a painted route layer.
- [x] First parchment/wood run HUD skin and readable upgrade-card treatment.
- [ ] Full menu-wide parchment/wood skin.
- [ ] Add before/after screenshots once QA is complete.
