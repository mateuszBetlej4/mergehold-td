import { tinySwordsAssets } from "../data/tinySwordsAssets";

/** Mirrors RunScene tower/enemy keys — see docs/GRAPHICS.md */
const towerAssetKeys: Record<string, string> = {
  "archer-tower": tinySwordsAssets.buildings.archerTower,
  "cannon-tower": tinySwordsAssets.buildings.cannonTower,
  "magic-tower": tinySwordsAssets.buildings.magicTower,
  "coin-mill": tinySwordsAssets.buildings.coinMill,
  barracks: tinySwordsAssets.buildings.barracks,
  "stone-wall": tinySwordsAssets.buildings.stoneWall,
  "healing-shrine": tinySwordsAssets.buildings.healingShrine,
  "spike-trap": "/assets/optimized/sprites/spike-trap.svg",
};

const enemyAssetPaths: Record<string, string> = {
  grunt: tinySwordsAssets.units.redPawnRun,
  runner: tinySwordsAssets.units.redWarriorRun,
  tank: tinySwordsAssets.units.redLancerRun,
  shield: tinySwordsAssets.units.redLancerRun,
  bat: tinySwordsAssets.units.redWarriorRun,
  bomber: tinySwordsAssets.units.blackWarriorRun,
  gatebreaker: tinySwordsAssets.units.blackWarriorRun,
};

const troopAssetPaths: Record<string, string> = {
  blocker: tinySwordsAssets.units.blueWarriorRun,
  ranged: tinySwordsAssets.units.blueArcherRun,
  burst: tinySwordsAssets.units.blueMonkRun,
};

export type CatalogCategory = "building" | "enemy" | "troop" | "hero";

export type CatalogSprite = {
  src: string;
  tint?: number;
};

export function getCatalogSprite(
  itemId: string,
  category: CatalogCategory,
  options?: { tint?: number; role?: string },
): CatalogSprite {
  if (category === "building") {
    return { src: towerAssetKeys[itemId] ?? `/assets/optimized/sprites/${itemId}.svg` };
  }

  if (category === "enemy") {
    return { src: enemyAssetPaths[itemId] ?? tinySwordsAssets.units.redPawnRun };
  }

  if (category === "troop") {
    const role = options?.role ?? "blocker";
    return { src: troopAssetPaths[role] ?? tinySwordsAssets.units.blueWarriorRun };
  }

  return {
    src: tinySwordsAssets.units.blueWarriorRun,
    tint: undefined,
  };
}
