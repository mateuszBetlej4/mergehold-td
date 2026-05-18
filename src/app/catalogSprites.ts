/** Mirrors RunScene tower/enemy keys — see docs/GRAPHICS.md */
const towerAssetKeys: Record<string, string> = {
  "archer-tower": "kenney-tower-archer",
  "cannon-tower": "kenney-tower-cannon",
  "magic-tower": "kenney-tower-magic",
};

const enemyAssetKeys: Record<string, string> = {
  grunt: "kenney-enemy-grunt",
  runner: "kenney-enemy-runner",
  tank: "kenney-enemy-tank",
  shield: "kenney-enemy-shield",
  bat: "enemy-runner",
  bomber: "enemy-grunt",
  gatebreaker: "kenney-enemy-boss",
};

const troopRoleTints: Record<string, number> = {
  blocker: 0x546a7b,
  ranged: 0x2f5d8c,
  burst: 0xb85c38,
};

export type CatalogCategory = "building" | "enemy" | "troop" | "hero";

export type CatalogSprite = {
  src: string;
  tint?: number;
};

function assetExtension(key: string): "png" | "svg" {
  return key.startsWith("kenney-") ? "png" : "svg";
}

export function getCatalogSprite(
  itemId: string,
  category: CatalogCategory,
  options?: { tint?: number; role?: string },
): CatalogSprite {
  if (category === "building") {
    const towerKey = towerAssetKeys[itemId];
    if (towerKey) {
      return { src: `/assets/optimized/sprites/${towerKey}.png` };
    }
    return { src: `/assets/optimized/sprites/${itemId}.svg` };
  }

  if (category === "enemy") {
    const key = enemyAssetKeys[itemId] ?? "kenney-enemy-grunt";
    const ext = assetExtension(key);
    const tint = ext === "svg" && options?.tint !== undefined ? options.tint : undefined;
    return { src: `/assets/optimized/sprites/${key}.${ext}`, tint };
  }

  if (category === "troop") {
    const role = options?.role ?? "blocker";
    return {
      src: "/assets/optimized/sprites/hero-guardian.svg",
      tint: troopRoleTints[role] ?? troopRoleTints.blocker,
    };
  }

  return {
    src: "/assets/optimized/sprites/hero-guardian.svg",
    tint: options?.tint,
  };
}
