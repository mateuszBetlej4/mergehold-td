const basePath = "/assets/optimized/tiny-swords";

export const tinySwordsAssets = {
  buildings: {
    fort: `${basePath}/buildings/blue-castle.png`,
    archerTower: `${basePath}/buildings/blue-archery.png`,
    cannonTower: `${basePath}/buildings/blue-tower.png`,
    magicTower: `${basePath}/buildings/blue-monastery.png`,
    barracks: `${basePath}/buildings/blue-barracks.png`,
    coinMill: `${basePath}/buildings/blue-house1.png`,
    stoneWall: `${basePath}/buildings/blue-tower.png`,
    healingShrine: `${basePath}/buildings/blue-monastery.png`,
    enemyCamp: `${basePath}/buildings/red-castle.png`,
  },
  units: {
    blueWarriorRun: `${basePath}/units/blue-warrior-run.png`,
    blueArcherRun: `${basePath}/units/blue-archer-run.png`,
    blueArcherShoot: `${basePath}/units/blue-archer-shoot.png`,
    blueLancerRun: `${basePath}/units/blue-lancer-run.png`,
    blueMonkRun: `${basePath}/units/blue-monk-run.png`,
    redPawnRun: `${basePath}/units/red-pawn-run.png`,
    redWarriorRun: `${basePath}/units/red-warrior-run.png`,
    redLancerRun: `${basePath}/units/red-lancer-run.png`,
    blackWarriorRun: `${basePath}/units/black-warrior-run.png`,
  },
  projectiles: {
    arrow: `${basePath}/projectiles/blue-arrow.png`,
  },
  terrain: {
    tilemapGrass: `${basePath}/terrain/tilemap-grass.png`,
    shadow: `${basePath}/terrain/shadow.png`,
    bush1: `${basePath}/terrain/bush-1.png`,
    bush2: `${basePath}/terrain/bush-2.png`,
    rock1: `${basePath}/terrain/rock-1.png`,
    rock2: `${basePath}/terrain/rock-2.png`,
    goldResource: `${basePath}/terrain/gold-resource.png`,
  },
  fx: {
    dust: `${basePath}/fx/dust-01.png`,
    explosion: `${basePath}/fx/explosion-01.png`,
    fire: `${basePath}/fx/fire-01.png`,
  },
  ui: {
    paper: `${basePath}/ui/regular-paper.png`,
    blueButton: `${basePath}/ui/big-blue-button.png`,
    redButton: `${basePath}/ui/big-red-button.png`,
    smallBarBase: `${basePath}/ui/smallbar-base.png`,
    smallBarFill: `${basePath}/ui/smallbar-fill.png`,
  },
} as const;
