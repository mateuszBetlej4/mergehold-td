# Project Structure

This structure is designed to avoid one giant `GameScene.ts`.

The key rule:

**Shared systems are generic. Game content owns its own config, visuals, upgrades, recipes, jobs, and interactions.**

## Proposed Root

```text
src/
  app/
    App.tsx
    routes/
    screens/
    components/
    hud/
    debug/
  game/
    GameRoot.ts
    scenes/
    bridge/
    config/
    systems/
    world/
    content/
    save/
    ui/
    utils/
  data/
    generated/
  services/
    supabase/
    analytics/
  assets/
    manifests/
```

## Game Folder

```text
src/game/
  GameRoot.ts
  scenes/
    BootScene.ts
    PreloadScene.ts
    KingdomScene.ts
    UIScene.ts
  bridge/
    gameBridge.ts
    gameEvents.ts
    uiCommands.ts
  config/
    gameConstants.ts
    tuning.ts
    cameraConfig.ts
  systems/
    input/
    movement/
    carry/
    resources/
    deposits/
    buildings/
    production/
    workers/
    jobs/
    combat/
    expansion/
    economy/
    save/
    tutorial/
    feedback/
  world/
    maps/
    zones/
    navigation/
    spawnPoints/
  content/
    resources/
    buildings/
    units/
    upgrades/
    recipes/
    raids/
  save/
    saveTypes.ts
    saveSerializer.ts
    saveMigrator.ts
  ui/
    worldLabels/
    buildPads/
    resourceCounters/
  utils/
    math.ts
    ids.ts
    objectPool.ts
```

## Content-First Building Structure

The user specifically requested structure like:

```text
towers > archery > all files for the archery tower, upgrades, attacks, all related in separated files
```

For this new game, use:

```text
src/game/content/buildings/
  castle/
    castle.definition.ts
    castle.visuals.ts
    castle.upgrades.ts
    castle.actions.ts
    castle.recipes.ts
    castle.behavior.ts
    castle.copy.ts
    index.ts
  sawmill/
    sawmill.definition.ts
    sawmill.visuals.ts
    sawmill.upgrades.ts
    sawmill.actions.ts
    sawmill.recipes.ts
    sawmill.behavior.ts
    sawmill.copy.ts
    index.ts
  worker-hut/
    workerHut.definition.ts
    workerHut.visuals.ts
    workerHut.upgrades.ts
    workerHut.actions.ts
    workerHut.recipes.ts
    workerHut.behavior.ts
    workerHut.copy.ts
    index.ts
  barracks/
    barracks.definition.ts
    barracks.visuals.ts
    barracks.upgrades.ts
    barracks.actions.ts
    barracks.recipes.ts
    barracks.behavior.ts
    barracks.copy.ts
    index.ts
  archery-range/
    archeryRange.definition.ts
    archeryRange.visuals.ts
    archeryRange.upgrades.ts
    archeryRange.actions.ts
    archeryRange.attacks.ts
    archeryRange.recipes.ts
    archeryRange.behavior.ts
    archeryRange.copy.ts
    index.ts
```

Each building module exports a single composed object:

```ts
export const archeryRangeBuilding = {
  definition,
  visuals,
  upgrades,
  actions,
  attacks,
  recipes,
  behavior,
  copy,
};
```

Then a registry imports all buildings:

```text
src/game/content/buildings/buildingRegistry.ts
```

This keeps content discoverable while allowing generic systems to consume a common shape.

## Example Building Module

```text
src/game/content/buildings/archery-range/
  archeryRange.definition.ts
  archeryRange.visuals.ts
  archeryRange.upgrades.ts
  archeryRange.actions.ts
  archeryRange.attacks.ts
  archeryRange.recipes.ts
  archeryRange.behavior.ts
  archeryRange.copy.ts
  index.ts
```

### `archeryRange.definition.ts`

Contains:

- id
- display name
- category
- unlock zone
- base cost
- footprint size
- max level
- tags

### `archeryRange.visuals.ts`

Contains:

- building sprite key
- construction ghost sprite
- build FX
- upgrade FX
- UI icon
- scale/depth

### `archeryRange.upgrades.ts`

Contains:

- level costs
- unlocks
- production bonuses
- guard bonuses
- UI copy for each level

### `archeryRange.actions.ts`

Contains:

- `recruitArcher`
- `assignWorker`
- `collectOutput`
- `upgrade`

### `archeryRange.attacks.ts`

Contains if building participates in combat:

- projectile
- range
- cooldown
- damage
- target priority

### `archeryRange.recipes.ts`

Contains:

- input resources
- output unit/resource
- duration

### `archeryRange.behavior.ts`

Contains:

- production tick behavior
- idle animation choice
- worker assignment behavior

### `archeryRange.copy.ts`

Contains:

- name
- short description
- locked text
- tutorial hints

## Resource Content Structure

```text
src/game/content/resources/
  wood/
    wood.definition.ts
    wood.visuals.ts
    wood.pickup.ts
    index.ts
  planks/
    planks.definition.ts
    planks.visuals.ts
    planks.pickup.ts
    index.ts
  stone/
  blocks/
  coins/
  food/
  rations/
  resourceRegistry.ts
```

Resource modules own:

- id
- stackable rules
- carry visual
- pickup visual
- inventory icon
- deposit compatibility
- value

## Unit Content Structure

```text
src/game/content/units/
  hero/
    hero.definition.ts
    hero.visuals.ts
    hero.upgrades.ts
    hero.controller.ts
    index.ts
  workers/
    gatherer/
      gatherer.definition.ts
      gatherer.visuals.ts
      gatherer.jobs.ts
      gatherer.upgrades.ts
      index.ts
    hauler/
    builder/
  guards/
    warrior/
    archer/
    monk/
  enemies/
    red-pawn/
    red-warrior/
    black-warrior/
```

## Systems

Systems should be generic and content-agnostic.

### Carry System

```text
src/game/systems/carry/
  CarryComponent.ts
  CarrySystem.ts
  CarryStackRenderer.ts
  carryTypes.ts
```

Responsibilities:

- Track carried resources.
- Enforce capacity.
- Render stack.
- Remove items on deposit.
- Emit carry events.

### Deposit System

```text
src/game/systems/deposits/
  DepositZone.ts
  DepositSystem.ts
  DepositZoneRenderer.ts
  depositTypes.ts
```

Responsibilities:

- Detect overlap.
- Validate resource type.
- Tick transfer.
- Update progress label.
- Trigger completion.

### Production System

```text
src/game/systems/production/
  ProductionComponent.ts
  ProductionSystem.ts
  RecipeRunner.ts
  productionTypes.ts
```

Responsibilities:

- Consume inputs.
- Run timers.
- Produce outputs.
- Handle storage capacity.

### Worker Job System

```text
src/game/systems/jobs/
  JobBoard.ts
  JobReservation.ts
  JobSystem.ts
  jobTypes.ts
```

Responsibilities:

- Create jobs from resource nodes/buildings/deposits.
- Let workers reserve jobs.
- Prevent multiple workers taking same target.
- Prioritize jobs.

### Combat System

```text
src/game/systems/combat/
  CombatSystem.ts
  HealthComponent.ts
  AttackComponent.ts
  TargetingSystem.ts
  ProjectileSystem.ts
  combatTypes.ts
```

Keep combat modular so it never contaminates resource systems.

## Scene Responsibilities

### BootScene

- Initialize config.
- Validate device.
- Set scale mode.

### PreloadScene

- Load manifests.
- Load Tiny Swords runtime assets.
- Create animations.

### KingdomScene

- Own world simulation.
- Instantiate systems.
- Update systems each frame.
- Render world entities.

### UIScene

- Phaser-native in-world UI.
- Deposit labels.
- Tutorial arrows.
- Floating text.

React still owns app screens and meta UI.

## Asset Structure

Do not commit raw source pack wholesale.

Runtime assets:

```text
public/assets/optimized/tiny-swords-builder/
  buildings/
  units/
  resources/
  terrain/
  ui/
  fx/
```

Source remains local-only:

```text
public/assets/source/Tiny Swords (Free Pack)/
```

Manifests:

```text
src/assets/manifests/tinySwordsBuilderAssets.ts
```

## Save Structure

```ts
type BuilderSave = {
  version: number;
  player: {
    coins: number;
    gems: number;
    carryCapacityLevel: number;
    movementSpeedLevel: number;
  };
  world: {
    unlockedZones: string[];
    resourceNodes: Record<string, ResourceNodeSave>;
    buildings: Record<string, BuildingSave>;
    workers: Record<string, WorkerSave>;
  };
  tutorial: {
    completedSteps: string[];
    activeStep?: string;
  };
  timers: {
    lastSavedAt: string;
  };
};
```

Use migrations:

```text
src/game/save/migrations/
  v1.ts
  v2.ts
```

## Naming Rules

- File names are feature-specific: `archeryRange.upgrades.ts`, not `upgrades.ts` in a huge folder.
- Registries end in `Registry.ts`.
- Pure logic files do not import Phaser.
- Renderer files may import Phaser.
- Content definitions should be serializable where possible.
- IDs use kebab-case: `archery-range`, `worker-hut`, `stone-blocks`.
- TypeScript symbols use camelCase/PascalCase.

## Why This Structure Matters

The game will grow through content. If content is organized by system only, it becomes hard to answer:

- What does Archery Range do?
- What upgrades belong to Sawmill?
- What visuals does Worker Hut use?
- What recipes does Barracks consume?

Feature folders make the game easier to expand and debug.
