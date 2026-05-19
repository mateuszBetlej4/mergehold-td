# Product Research

## Genre Definition

The target genre is best described as:

**Mobile-first hybrid casual idle arcade builder**

It blends:

- **Arcade movement:** drag joystick, move hero, collect items.
- **Idle builder:** workers automate repeated tasks over time.
- **Resource conversion:** raw materials become processed materials.
- **Base expansion:** spend resources to unlock land, buildings, roads, helpers, and combat areas.
- **Visible carrying:** items stack above or behind the player, making progress readable instantly.
- **Playable-ad clarity:** every action is obvious from a screenshot.

This is the same family as the ad examples the user provided: collect wood, carry stacks, donate to pads, build or upgrade structures, unlock automation, expand territory, and sometimes fight enemies.

## Reference Signals

Sources checked:

- Tiny Swords official asset page: https://pixelfrog-assets.itch.io/tiny-swords
- Phaser official getting-started documentation: https://phaser.io/tutorials/getting-started-phaser3
- Phaser Arcade Physics documentation: https://docs.phaser.io/api-documentation/3.88.2/namespace/physics-arcade
- Vite static deployment documentation: https://vite.dev/guide/static-deploy.html
- Capacitor documentation: https://capacitorjs.com/docs/next
- Supabase JavaScript Auth reference: https://supabase.com/docs/reference/javascript/auth-api
- Supabase Realtime guide: https://supabase.com/docs/guides/realtime
- Town Builder Idle Arcade Google Play listing: https://play.google.com/store/apps/details?id=com.townbuilder.towngame
- Builder Idle Arcade web listing: https://simple.game/play/builder-idle-arcade/
- Casual gaming report discussion of hybrid-casual idle arcade: https://investgame.net/wp-content/uploads/2024/06/2024-Casual-Gaming-Apps-Report-EN.pdf
- Paragon Pioneers article describing idle city-builder + supply-chain appeal: https://www.pocketgamer.com/paragon-pioneers/android-release/

## Common Mechanics Observed

### Movement

- One-finger drag joystick.
- Player follows finger direction.
- Camera usually follows player or uses a fixed isometric/top-down framed base.
- Speed is tuned for short loops: fast enough to feel responsive, slow enough to make upgrades meaningful.

### Collection

- Resources sit in small piles or spawn from nodes.
- Walking into a pickup radius pulls resources into the player.
- Collection is satisfying because the player visibly carries a stack.
- Stack height or trailing objects is a core feedback system.

### Carry Capacity

- Player starts with low capacity.
- Capacity upgrades are immediately visible.
- Overflow is blocked or left on ground.
- Capacity affects both pacing and monetization opportunities.

### Deposit Zones

- Build/upgrade zones are usually dashed rectangles or circles with a cost label.
- Player stands inside the zone to auto-deposit carried items.
- The cost number ticks down quickly as items are transferred.
- Finished zones spawn a building, worker, bridge, gate, farm, or new area.

### Conversion

- Raw resources become processed materials:
  - Wood -> Planks
  - Stone -> Blocks
  - Wheat -> Bread
  - Gold ore -> Coins
  - Meat -> Rations
- Conversion buildings create a reason to move between areas.
- Later automation removes repeated manual hauling.

### Workers And Automation

- Workers are hired or unlocked with resources.
- They can gather, haul, process, build, defend, or repair.
- Early workers should be visibly slower than the player.
- Upgrades improve worker count, speed, carry capacity, and task range.

### Base Expansion

- New land is blocked by fog, fences, rubble, bridges, gates, or forest.
- Expansion costs processed materials, not only raw resources.
- Each new zone introduces one new mechanic or resource.
- Expansion should avoid becoming a static menu; the player physically walks into the new area.

### Combat Pressure

This genre often adds light combat to prevent pure chore loops:

- Enemy raids arrive periodically.
- Player can fight directly or recruit guards.
- Defensive buildings and troops reduce manual pressure.
- Combat rewards resources or expansion keys.

For Tiny Swords, combat should be faction-based:

- Blue kingdom = player.
- Red raiders = early enemies.
- Black faction = elite enemies.
- Purple/yellow variants = magic, elite, skins, or later biomes.

## Why Tiny Swords Fits

Tiny Swords includes:

- Buildings: castle, barracks, archery, tower, monastery, houses.
- Units: workers/pawns, warriors, archers, monks, lancers.
- Resources: gold, wood, tools, meat/sheep.
- Terrain: grass tilemaps, rocks, bushes, water elements.
- UI: buttons, bars, paper panels, banners, icons.
- FX: dust, fire, explosion.

This means the pack can support a full vertical slice:

- Gather wood.
- Convert to planks.
- Build a barracks.
- Recruit a guard.
- Expand into a forest.
- Defend against a red raid.

## Product Opportunity

The TD version uses the pack as a visual layer. The new game can use it as the entire design language.

The strongest product angle:

**A satisfying tiny kingdom logistics game where every building and worker exists physically in the world.**

This gives us:

- Better retention than a pure ad clone.
- A natural progression system.
- Strong asset reuse.
- Clear expansion roadmap.
- A game that feels playable, not only watchable.

## Design Risks

- Too many resources too early can confuse players.
- If automation arrives too late, the game feels grindy.
- If automation arrives too early, the player has nothing tactile to do.
- If combat is too strong, it becomes a defense game again.
- If the map is too large, mobile navigation becomes annoying.
- If every building uses generic config, feature work becomes messy.

The architecture must keep systems generic but content-specific files organized.

## Recommended Genre Pillars

1. **Tactile Carrying**
   The player must always look like they are carrying something meaningful.

2. **Physical Economy**
   Resources are objects in the world, not just counters.

3. **Small Clear Goals**
   Every 20-60 seconds, the player should finish a zone, unlock a worker, open a gate, build a structure, or upgrade something.

4. **Automation As Reward**
   Workers remove old chores and open new chores.

5. **Kingdom Personality**
   The base should visually become busier and warmer as systems unlock.
