# Tiny Swords Asset Catalog And Usage Guide

Game: **Satisfy Kingdom**

Local source folder: `docs/new-game/assets/Tiny Swords (Free Pack)/`

Official source page: https://pixelfrog-assets.itch.io/tiny-swords

Tilemap guide: https://pixelfrog-assets.itch.io/tiny-swords/devlog/1138989/tilemap-guide

## Purpose

This document is the general asset reference for using Pixel Frog's **Tiny Swords** pack in Satisfy Kingdom.

It is not a tower-defense retrofit plan. It describes what exists in the asset pack, how the official page says the pack is intended to be used, how the local folder is organized, and how the assets can support a satisfying resource-collection, base-building, automation, and light-combat kingdom game.

## Official Pack Intent

The official Tiny Swords page describes the pack as a kingdom adventure set for collecting resources, battling enemies, and building a prosperous kingdom. That is very close to the Satisfy Kingdom direction.

Important official notes:

- The asset pack is split into a **Free Pack** and a paid **Enemy Pack**.
- The Free Pack includes human units, buildings, resources, terrain tiles, decorations, and UI elements.
- The Free Pack includes multiple faction colors for units, pawns, and buildings.
- The paid Enemy Pack adds special enemy characters.
- All assets are PNG images, and Aseprite files are included.
- Tilemap grid is `64x64`.
- Animation speed is listed as `10fps` / `100ms`.
- License allows personal/commercial use and modification.
- Credit is not required, but is welcome.
- Redistribution, resale, or repackaging is not allowed, even if modified.

## Repo Policy

The raw pack must remain local-only unless the repo visibility/licensing strategy changes.

Rules:

- Do not commit the whole raw source pack to GitHub.
- Do not commit `.aseprite` files.
- Do not redistribute the original pack inside the repository.
- Commit only curated runtime exports that are actually used by the game.
- Keep Pixel Frog attribution in asset credits.
- Re-check the official page before public release because Tiny Swords is still listed as in development and is being updated.

Local-only source:

```text
docs/new-game/assets/Tiny Swords (Free Pack)/
```

Committed runtime subset:

```text
public/assets/optimized/tiny-swords/
```

Future Satisfy Kingdom runtime target:

```text
public/assets/optimized/satisfy-kingdom/
```

## Current Local Inventory

Local file count:

| Type | Count |
|---|---:|
| PNG | 410 |
| Aseprite | 18 |
| `.DS_Store` | 34 |

Top-level PNG count:

| Folder | PNGs | Role In Satisfy Kingdom |
|---|---:|---|
| `Buildings` | 40 | Core base structures, faction buildings, unlockable facilities |
| `Units` | 225 | Hero, workers, guards, enemies, helper jobs, faction variants |
| `Terrain` | 60 | World map, resources, nodes, harvestables, decorations |
| `UI Elements` | 77 | HUD, buttons, panels, bars, upgrade cards, icons |
| `Particle FX` | 8 | Construction, harvesting, damage, explosions, water effects |

## Official Update Awareness

The official page is actively updated. As of this documentation pass on **May 19, 2026**, the website lists recent or upcoming additions such as:

- Fish Hut.
- Cannon Tower.
- Goblin Hut with tileable fences.
- Troll House inside a dead tree.
- Paid Enemy Pack with special enemy characters.

The current local Free Pack inventory still shows the original 40 building PNGs under the five building color folders. Before implementation starts, download/check the latest pack version and repeat this inventory.

## Folder Structure

```text
Tiny Swords (Free Pack)/
  Buildings/
    Black Buildings/
    Blue Buildings/
    Purple Buildings/
    Red Buildings/
    Yellow Buildings/
  Particle FX/
  Terrain/
    Decorations/
    Resources/
    Tileset/
  UI Elements/
    UI Banners from the store page/
    UI Elements/
  Units/
    Black Units/
    Blue Units/
    Purple Units/
    Red Units/
    Yellow Units/
    Units (aseprite in Blue only)/
```

## Building Assets

### Available Faction Colors

Building colors:

- Black.
- Blue.
- Purple.
- Red.
- Yellow.

Each color has:

- `Archery.png`
- `Barracks.png`
- `Castle.png`
- `House1.png`
- `House2.png`
- `House3.png`
- `Monastery.png`
- `Tower.png`

Total: `5 colors x 8 buildings = 40 PNGs`.

### Satisfy Kingdom Use

| Asset | Suggested Use |
|---|---|
| `Castle` | Main home base, kingdom hub, save point, global upgrades |
| `House1` | Worker house, villager housing, early storage |
| `House2` | Upgraded housing, worker hut variant, market stall base |
| `House3` | Advanced house, merchant building, production support |
| `Barracks` | Guards, melee troops, raid defense |
| `Archery` | Archers, ranged guard training, watch post |
| `Monastery` | Healing, repair, blessings, revive/boost station |
| `Tower` | Watch tower, defensive tower, unlock marker |

### Faction Language

Recommended palette roles:

| Color | Role |
|---|---|
| Blue | Player kingdom / default build color |
| Yellow | Prosperity, premium upgrades, merchant/wealth district |
| Purple | Magic, monastery, special boosts, rare upgrades |
| Red | Rival faction, raiders, hostile outposts |
| Black | Elite faction, danger zones, late-game raids |

Use color variants as meaningful game language, not random cosmetic swaps.

## Unit Assets

### Available Faction Colors

Unit colors:

- Black.
- Blue.
- Purple.
- Red.
- Yellow.

Each color includes the same broad unit classes:

- Archer.
- Lancer.
- Monk.
- Pawn.
- Warrior.

There is also `Units (aseprite in Blue only)` for source/editing workflows.

## Unit Classes

### Archer

Files per faction:

- `Archer_Idle.png`
- `Archer_Run.png`
- `Archer_Shoot.png`
- `Arrow.png`

Use cases:

- Ranged guard.
- Watchtower defender.
- Patrol helper.
- Tutorial guard.
- Enemy ranged raider in red/black.

Satisfy Kingdom mapping:

```text
Blue Archer = player ranged guard
Red Archer = enemy ranged raider
Yellow Archer = elite hired mercenary or cosmetic
Purple Archer = magic/rare ranged unit
Black Archer = late-game elite enemy
```

### Lancer

Files per faction include:

- `Lancer_Idle.png`
- `Lancer_Run.png`
- Directional attack sheets.
- Directional defence sheets.

Directional examples:

- Down.
- DownRight.
- Right.
- Up.
- UpRight.

Use cases:

- Defensive guard.
- Gate defender.
- Escort for workers.
- Blocking enemy path.
- Shield/tank enemy.

Satisfy Kingdom mapping:

```text
Lancer = defensive unit that protects buildings and resource depots
```

### Monk

Files per faction:

- `Idle.png`
- `Run.png`
- `Heal.png`
- `Heal_Effect.png`

Use cases:

- Building repair.
- Guard healing.
- Production blessing.
- Temporary speed boost.
- Shrine/monastery worker.

Satisfy Kingdom mapping:

```text
Monk = repair/heal automation unit, unlocked after monastery
```

### Pawn

Pawn is the most important class for the builder/automation game.

Files per faction include:

- Basic idle/run.
- Idle with tools/resources.
- Run with tools/resources.
- Interact with tools.

Observed local file themes:

- Axe.
- Gold.
- Hammer.
- Knife.
- Meat.
- Pickaxe.
- Wood.

Official page/devlog says pawns support essential economy actions:

- Chopping wood.
- Mining gold.
- Hunting sheep for food.
- Repairing buildings.
- Building.

Satisfy Kingdom mapping:

```text
Pawn = gatherer, hauler, builder, repairer, hunter, miner
```

This is the backbone of automation.

### Warrior

Files per faction:

- `Warrior_Idle.png`
- `Warrior_Run.png`
- `Warrior_Attack1.png`
- `Warrior_Attack2.png`
- `Warrior_Guard.png`

Use cases:

- Player hero.
- Melee guard.
- Raider.
- Camp defender.
- Boss-style human enemy by scaling.

Satisfy Kingdom mapping:

```text
Blue Warrior = starter hero or guard
Red Warrior = basic raider
Black Warrior = elite raider
```

## Terrain Assets

Terrain contains three major categories:

- Tileset.
- Decorations.
- Resources.

## Terrain Tileset

Files:

- `Tilemap_color1.png`
- `Tilemap_color2.png`
- `Tilemap_color3.png`
- `Tilemap_color4.png`
- `Tilemap_color5.png`
- `Water Background color.png`
- `Water Foam.png`
- `Shadow.png`

Official tilemap notes:

- Grid is `64x64`.
- Use background color first.
- Add water foam where terrain touches water.
- Add flat ground as the lowest terrain.
- Repeat shadow and elevated ground layers for height.
- `Shadow.png` is `128x128`, but used on a `64x64` tile grid.
- Move the shadow one tile downward to create the illusion of height.
- Water foam is animated and should not all start on the same frame.

Satisfy Kingdom use:

- Base area should start flat and readable.
- Later expansions can use elevation to create satisfying unlock moments.
- Use color variants to make zones visually distinct.
- Water/foam can support bridges, fishing hut, river crossing, or island expansions.
- Shadows are important for depth and should be part of the tile renderer, not optional decoration.

## Terrain Decorations

Decorations include:

- 4 bushes.
- 8 clouds.
- 4 ground rocks.
- 4 water rocks.
- Rubber duck.

Use cases:

- Bushes as soft map blockers and visual density.
- Rocks as harvest nodes or decoration.
- Clouds for high elevation/sky-map flavor.
- Water rocks for rivers/lakes.
- Rubber duck as hidden fun collectible or small Easter egg.

## Resource Assets

### Wood

Local assets:

- `Tree1.png`
- `Tree2.png`
- `Tree3.png`
- `Tree4.png`
- `Stump 1.png`
- `Stump 2.png`
- `Stump 3.png`
- `Stump 4.png`
- `Wood Resource.png`

Satisfy Kingdom use:

- Trees are harvest nodes.
- Stumps show depleted trees.
- Wood Resource is the carried/pickup item.
- Pawns with axe/wood animations gather and haul.

### Gold

Local assets:

- `Gold_Resource.png`
- `Gold_Resource_Highlight.png`
- `Gold Stone 1.png` through `Gold Stone 6.png`
- Highlight variants for all six gold stones.

Satisfy Kingdom use:

- Gold stones are mining nodes.
- Highlight variants can show selected/active nodes.
- Gold Resource is carried/picked up.
- Coins or gold can pay for upgrades, hiring, and zone unlocks.

### Meat / Food

Local assets:

- `Meat Resource.png`
- `Sheep_Grass.png`
- `Sheep_Idle.png`
- `Sheep_Move.png`

Satisfy Kingdom use:

- Sheep are food nodes or roaming livestock.
- Meat resource is carried food.
- Food can hire guards, feed workers, or recover after raids.

### Tools

Local assets:

- `Tool_01.png`
- `Tool_02.png`
- `Tool_03.png`
- `Tool_04.png`

Satisfy Kingdom use:

- Tool upgrade icons.
- Builder/worker unlock costs.
- Repair/build station output.
- Tutorial markers for job type.

## UI Assets

UI assets include:

- Banners.
- Store-page banners/ribbons.
- Big and small bars.
- Blue/red big buttons.
- Blue/red small round buttons.
- Blue/red small square buttons.
- Tiny round/square buttons.
- Cursors.
- 25 human avatars.
- 12 icons.
- Regular/special papers.
- Big/small ribbons.
- Swords.
- Wood table panels.

Official UI notes:

- Paper banner is stretchable in all directions.
- Wood table is stretchable in all directions.
- Sword is stretchable horizontally.
- Big ribbons are stretchable horizontally.
- Small ribbons are stretchable horizontally.
- Small papers are stretchable in all directions.
- Life bars are stretchable horizontally.
- Square buttons are stretchable in all directions.
- Round buttons exist in two colors.

Implementation guidance:

- Use CSS or Phaser nine-slice style treatment for stretchable UI.
- Do not simply scale UI PNGs if the borders/patterns become distorted.
- Use bars as composited base/fill elements.
- Use ribbons for rarity, zone unlocks, or “new” tags.
- Use paper panels for menus, upgrade cards, build info, worker cards.
- Use wood table panels for inventories, warehouse, and market.
- Use avatars for worker/hero selection and dialog.

Satisfy Kingdom mapping:

| UI Asset Type | Use |
|---|---|
| Paper panels | Building cards, upgrade cards, tutorial popups |
| Wood table | Inventory, market, warehouse, production queues |
| Bars | Worker stamina, building production, health, raid timer |
| Buttons | Build, upgrade, hire, collect, confirm/cancel |
| Ribbons | Rare upgrade, completed, locked, new area |
| Icons | Resources, settings, combat, workers |
| Avatars | Hero/worker portraits, tutorial speaker |
| Cursors | Tutorial taps, drag joystick hints |

## Particle FX

Local particle files:

- `Dust_01.png`
- `Dust_02.png`
- `Explosion_01.png`
- `Explosion_02.png`
- `Fire_01.png`
- `Fire_02.png`
- `Fire_03.png`
- `Water Splash.png`

Official particle notes:

- Dust is good for unit appearance/disappearance.
- Water splash fits units falling into water.
- Fire can show buildings taking damage.
- Explosion is ideal for destroying buildings.
- Fire effects can be combined and looped.
- Dust/explosion variants can be combined for larger effects.

Satisfy Kingdom mapping:

| Event | FX |
|---|---|
| Resource pickup | Small dust or sparkle-like feedback |
| Tree chopped | Dust |
| Rock/gold mined | Dust |
| Building constructed | Dust burst |
| Building upgraded | Dust + banner flash |
| Building damaged | Fire loop |
| Building destroyed | Explosion |
| Enemy defeated | Dust |
| Bridge/water interaction | Water splash |
| Worker spawned | Dust |

## What The Free Pack Supports Well

The Free Pack strongly supports:

- Worker economy.
- Wood/gold/food collection.
- Building and repair actions.
- Human faction combat.
- Base-building progression.
- UI-heavy mobile game menus.
- Tilemap-based kingdom zones.
- Light RTS / idle builder / automation gameplay.

## What The Free Pack Does Not Fully Cover

Potential gaps:

- Stone/crop resource chains are not fully represented in the current local free pack.
- Dedicated planks/boards may need to be represented by `Wood Resource` or custom derived exports.
- Monster variety is limited in the Free Pack.
- Newer official structures may require downloading the latest pack.
- Paid Enemy Pack may be needed for more enemy variety.
- UI assets need nine-slice/stretched handling, not naive scaling.

## Recommended Satisfy Kingdom Asset Language

### Player Kingdom

- Blue buildings.
- Blue hero/guards/workers.
- Paper/wood UI.
- Gold/yellow accents for progress and rewards.

### Resources

- Wood: trees, stumps, wood resource, pawn axe/wood animations.
- Gold: gold stones, highlight variants, gold resource, pawn pickaxe/gold animations.
- Food: sheep, meat resource, pawn knife/meat animations.
- Tools: upgrade/build/repair icons.

### Automation

- Pawns are workers.
- Tool-specific pawn sheets communicate job type.
- Blue workers serve player base.
- Yellow workers can represent upgraded/special workers.

### Buildings

- Castle = hub.
- Houses = worker population / storage / shop variants.
- Barracks = guard recruitment.
- Archery = ranged guards.
- Monastery = repair/healing.
- Tower = defense/watch/unlock structure.

### Opposition

- Red faction = early raiders.
- Black faction = elite raiders.
- Purple faction = magic/rare faction or special NPCs.

## Recommended First Runtime Subset For Builder MVP

Curate only what is needed for the first prototype:

### Buildings

- `Buildings/Blue Buildings/Castle.png`
- `Buildings/Blue Buildings/House1.png`
- `Buildings/Blue Buildings/House2.png`
- `Buildings/Blue Buildings/Barracks.png`
- `Buildings/Blue Buildings/Archery.png`
- `Buildings/Blue Buildings/Monastery.png`
- `Buildings/Blue Buildings/Tower.png`
- `Buildings/Red Buildings/House1.png`
- `Buildings/Red Buildings/Barracks.png`

### Units

- `Units/Blue Units/Warrior/Warrior_Idle.png`
- `Units/Blue Units/Warrior/Warrior_Run.png`
- `Units/Blue Units/Pawn/Pawn_Run.png`
- `Units/Blue Units/Pawn/Pawn_Run Wood.png`
- `Units/Blue Units/Pawn/Pawn_Interact Axe.png`
- `Units/Blue Units/Pawn/Pawn_Run Gold.png`
- `Units/Blue Units/Pawn/Pawn_Interact Pickaxe.png`
- `Units/Blue Units/Pawn/Pawn_Run Hammer.png`
- `Units/Red Units/Warrior/Warrior_Run.png`
- `Units/Red Units/Warrior/Warrior_Attack1.png`

### Resources / Terrain

- `Terrain/Resources/Wood/Trees/Tree1.png`
- `Tree2.png`
- `Tree3.png`
- `Tree4.png`
- `Stump 1.png`
- `Terrain/Resources/Wood/Wood Resource/Wood Resource.png`
- `Terrain/Resources/Gold/Gold Resource/Gold_Resource.png`
- `Terrain/Resources/Gold/Gold Stones/Gold Stone 1.png`
- `Terrain/Resources/Meat/Sheep/Sheep_Idle.png`
- `Terrain/Resources/Meat/Meat Resource/Meat Resource.png`
- `Terrain/Tileset/Tilemap_color1.png`
- `Terrain/Tileset/Shadow.png`
- `Terrain/Decorations/Bushes/Bushe1.png`
- `Terrain/Decorations/Rocks/Rock1.png`

### UI / FX

- `UI Elements/UI Elements/Papers/RegularPaper.png`
- `UI Elements/UI Elements/Wood Table/WoodTable.png`
- `UI Elements/UI Elements/Bars/SmallBar_Base.png`
- `UI Elements/UI Elements/Bars/SmallBar_Fill.png`
- `UI Elements/UI Elements/Buttons/BigBlueButton_Regular.png`
- `UI Elements/UI Elements/Buttons/BigBlueButton_Pressed.png`
- `UI Elements/UI Elements/Ribbons/SmallRibbons.png`
- `Particle FX/Dust_01.png`
- `Particle FX/Fire_01.png`
- `Particle FX/Explosion_01.png`

## Implementation Notes

### Animation Speed

Use `10fps` as the default animation rate because the official page lists `10fps` / `100ms`.

### Tilemaps

Use the official layer model:

```text
BG color
Water foam
Flat ground
Shadow
Elevated ground
Shadow
Elevated ground
...
```

Do not treat the tilesheet as only a random grass texture. It includes elevation, water, foam, stairs, and shadow logic.

### UI Scaling

Use:

- CSS `border-image`, `background-size`, or layered DOM elements for React UI.
- Phaser `NineSlice` or manual sliced sprites for Phaser UI.

Avoid:

- Scaling paper/bar/button PNGs directly to arbitrary sizes if edges become distorted.

### Carry Stack Visuals

Use resource item sprites as stack units:

- Wood resource stacked vertically or in a trailing pile.
- Gold resource stacked as coins/gold chunks.
- Meat resource carried as food bundles.
- Tool icons carried for builder/tutorial moments.

### Worker Visuals

Use the pawn sheets to make jobs legible:

| Job | Pawn Visual |
|---|---|
| Chop wood | Axe / Wood |
| Mine gold | Pickaxe / Gold |
| Build | Hammer |
| Repair | Hammer |
| Hunt / gather food | Knife / Meat |
| Haul generic goods | Basic run or carried resource |

## Open Follow-Up Tasks

- [ ] Re-download/check the latest official pack because the source page was updated recently.
- [ ] Verify whether the latest local pack includes Fish Hut, Cannon Tower, Goblin Hut, fences, and Troll House.
- [ ] Build `satisfyKingdomAssets.ts` manifest from curated runtime paths.
- [ ] Create a runtime export checklist for every MVP asset.
- [ ] Create preview contact sheets for buildings, units, resources, terrain, UI, and FX.
- [ ] Decide whether to buy/use the paid Enemy Pack for enemy variety.
- [ ] Verify final license wording again before public release.
