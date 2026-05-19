# Game Design

Working title: **Tiny Kingdom Works**

## One-Sentence Pitch

Run a tiny fantasy kingdom by gathering resources, carrying visible stacks, donating materials to build zones, unlocking workers, automating production chains, expanding the base, and defending your growing settlement from rival factions.

## Core Loop

1. Move hero with one-finger joystick.
2. Collect raw resources from nodes.
3. Carry visible stacked items.
4. Deposit resources into build or production zones.
5. Unlock a building, worker, gate, upgrade, or new resource.
6. Use new systems to produce better materials.
7. Expand the map.
8. Defend against small raids.
9. Repeat with more automation and larger goals.

## Moment-To-Moment Loop

| Step | Player Action | Feedback |
|---|---|---|
| Find resource | Move toward tree/rock/gold/sheep | Node highlight, small arrow if tutorial |
| Collect | Stand near resource | Items pop out and fly to stack |
| Carry | Move with stack | Stack grows on hero/backpack/trailing column |
| Deposit | Enter zone | Cost number counts down, stack shrinks |
| Complete | Cost reaches zero | Dust FX, building appears, worker celebrates |
| Upgrade | Revisit building pad | Better output, more workers, faster process |

## MVP Fantasy

The first playable version should communicate:

> I am rebuilding a small blue kingdom by hand, then slowly teaching the kingdom to work for me.

## Core Resources

### Raw Resources

| Resource | Source | First Use | Tiny Swords Asset Direction |
|---|---|---|---|
| Wood | Trees/log piles | Build plank mill, fences, houses | Wood/log resource sprites |
| Stone | Rocks/quarry | Build tower, bridge, wall | Rock/resource sprites |
| Gold | Mine/gold piles | Hire workers, upgrade buildings | Gold resource sprites |
| Food | Sheep/meat/farm | Hire guards/workers | Meat/sheep resources |

### Processed Resources

| Resource | Produced By | Used For |
|---|---|---|
| Planks | Sawmill | Buildings, bridge, worker hut |
| Stone Blocks | Mason | Towers, walls, monastery |
| Coins | Treasury / market | Upgrades, unlocks, workers |
| Rations | Farm / cookhouse | Troop hiring and raid recovery |

## Carry System

Carry is central. It should be its own system, not a side effect of inventory.

Rules:

- Player has a `carryCapacity`.
- Each carried item has a `resourceId`, visual sprite, quantity, and stack order.
- The visible stack should render above/behind the hero.
- Stack layout depends on resource type:
  - Logs/planks stack vertically.
  - Coins stack in a column.
  - Stone blocks trail in a short cart-like stack.
- Depositing removes from top of stack.
- Mixed-resource carrying can be allowed later, but MVP should allow one resource type at a time for clarity.

Upgrades:

- Backpack capacity.
- Magnet radius.
- Deposit speed.
- Movement speed while carrying.
- Mixed stack unlock.

## Resource Nodes

Resource nodes should be physical world entities.

Types:

- `TreeNode`
- `RockNode`
- `GoldNode`
- `FoodNode`
- `RubbleNode`

Node behavior:

- Has `resourceId`.
- Has `remainingAmount`.
- Has `harvestRate`.
- Can require tool or building unlock.
- Can regenerate or stay depleted.
- Emits pickup items.

MVP:

- Tree nodes produce wood.
- Rock nodes produce stone.
- Gold piles produce coins.
- Nodes respawn slowly to keep the map alive.

## Deposit Zones

Deposit zones are one of the most important UX tools.

Zone types:

- `BuildZone`: creates new building.
- `UpgradeZone`: upgrades existing building.
- `UnlockZone`: opens land, bridge, gate, or path.
- `ExchangeZone`: converts carried resources.
- `SellZone`: turns resources into coins.
- `RecruitZone`: hires worker/troop.

Zone components:

- White dashed outline.
- Required resource icon.
- Remaining cost number.
- Progress ring or fill.
- Preview ghost of result.
- Optional tutorial arrow.

Deposit behavior:

- Detect player overlap.
- Check carried resource type.
- Transfer one item every `depositIntervalMs`.
- Play small tick.
- Update remaining cost.
- When complete, trigger construction event.

## Buildings

Buildings are the heart of progression. Each building should own its own data, actions, upgrades, and visuals.

### MVP Buildings

| Building | Purpose | Unlock |
|---|---|---|
| Castle | Home base, global upgrades, save point | Start |
| Sawmill | Wood -> planks | Tutorial |
| Quarry Yard | Stone -> blocks | Zone 2 |
| Worker Hut | Hire gatherers/haulers | After sawmill |
| Barracks | Hire guards | First raid |
| Archery Range | Hire ranged guards | Forest expansion |
| Market | Sell goods for coins | After coin tutorial |
| Warehouse | Increase storage/carry support | Mid MVP |
| Gate/Fence | Unlocks base defense | First raid |

### Building State

Each building instance needs:

- `buildingId`
- `level`
- `position`
- `status`: `locked | ghost | building | active | damaged`
- `inputInventory`
- `outputInventory`
- `workersAssigned`
- `productionTimer`
- `upgradeState`

## Production Chains

### MVP Chain

```text
Trees -> Wood -> Sawmill -> Planks -> Build Worker Hut -> Hire Workers
Rocks -> Stone -> Quarry Yard -> Blocks -> Build Tower/Gate
Gold -> Coins -> Upgrades/Workers
Food -> Rations -> Guards
```

### Rule

Every new resource should unlock a new decision, not just another counter.

Bad:

```text
Collect blue wood to build blue thing.
```

Good:

```text
Collect wood manually, build sawmill, automate planks, use planks to unlock workers, workers reduce manual wood trips.
```

## Workers

Worker roles:

- Gatherer: harvests resources.
- Hauler: moves resources from node/building to depot.
- Builder: donates resources to construction zones.
- Guard: fights raiders.
- Archer: ranged guard.
- Monk: heals/repairs.

Worker AI should use simple jobs:

```text
Find job -> reserve target -> move -> perform -> deliver/result -> find next job
```

Worker upgrades:

- Count.
- Speed.
- Carry capacity.
- Harvest speed.
- Job radius.
- Priority rules.

## Combat

Combat should be light and supportive.

Raid loop:

1. Warning timer appears.
2. Red raiders enter from edge.
3. Raiders target stored resources or buildings.
4. Player/guards fight.
5. Defeated raiders drop coins/food/materials.
6. Damaged buildings can be repaired with resources.

Combat must not dominate the game. It exists to:

- Give workers/guards purpose.
- Make walls/towers meaningful.
- Create urgency.
- Break up collection loops.

## Expansion

Expansion should be staged.

### Zone 1: Camp

- Castle.
- Trees.
- Sawmill.
- First build pad.
- Sell zone.

### Zone 2: Quarry

- Rocks.
- Quarry Yard.
- Warehouse.
- Bridge/fence unlock.

### Zone 3: Barracks

- Food source.
- Barracks.
- First red raid.
- Guards.

### Zone 4: Forest Gate

- Archery range.
- Worker hut upgrade.
- Larger trees.
- More automated flow.

### Zone 5: Enemy Outpost

- Red camp.
- Optional combat objective.
- Unlock black/elite faction.

## UX Rules

- Never hide the next goal in a menu.
- Every locked thing should show its cost in-world.
- Every resource transfer should have motion.
- Every completed build should create a visible change.
- Every automation unlock should reduce one repeated manual loop.
- Mobile first: readable at 390px width.

## MVP Acceptance Criteria

The first vertical slice is good enough if:

- Player can move with virtual joystick.
- Player can collect wood.
- Wood stacks visually on player.
- Player can deposit wood into a sawmill build zone.
- Sawmill appears with dust FX.
- Sawmill converts wood into planks.
- Player can carry planks to build Worker Hut.
- A worker can be hired.
- Worker gathers wood automatically.
- Player can unlock a second area.
- Save/load works locally.

## Longer-Term Features

- Offline earnings.
- Helper priority controls.
- Multiple maps/biomes.
- Cosmetic skins by faction color.
- Daily orders.
- Timed events.
- Base raids.
- Leaderboards.
- Cloud saves.
- Native app wrapper.
