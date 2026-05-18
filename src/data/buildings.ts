export type BuildingRole = "tower" | "trap" | "spawner" | "economy" | "wall" | "support";

export type BuildingDefinition = {
  id: string;
  name: string;
  role: BuildingRole;
  description: string;
  baseCost: number;
  maxTier: number;
  unlockWave: number;
  color: number;
  icon: string;
  stats: Record<string, number>;
};

export const buildingDefinitions: BuildingDefinition[] = [
  {
    id: "archer-tower",
    name: "Archer Tower",
    role: "tower",
    description: "Fast single-target shots for early waves.",
    baseCost: 20,
    maxTier: 5,
    unlockWave: 1,
    color: 0x2f5d8c,
    icon: "A",
    stats: { damage: 16, range: 166, fireRateMs: 520 },
  },
  {
    id: "cannon-tower",
    name: "Cannon Tower",
    role: "tower",
    description: "Slow splash damage against grouped enemies.",
    baseCost: 35,
    maxTier: 5,
    unlockWave: 2,
    color: 0x81523f,
    icon: "C",
    stats: { damage: 28, range: 136, fireRateMs: 900, splash: 42 },
  },
  {
    id: "magic-tower",
    name: "Magic Tower",
    role: "tower",
    description: "Ignores armor and marks priority targets.",
    baseCost: 45,
    maxTier: 5,
    unlockWave: 3,
    color: 0x6856a3,
    icon: "M",
    stats: { damage: 22, range: 154, fireRateMs: 680 },
  },
  {
    id: "spike-trap",
    name: "Spike Trap",
    role: "trap",
    description: "Damages enemies passing over the path.",
    baseCost: 25,
    maxTier: 4,
    unlockWave: 2,
    color: 0x5f6f52,
    icon: "S",
    stats: { damage: 10, cooldownMs: 500 },
  },
  {
    id: "barracks",
    name: "Barracks",
    role: "spawner",
    description: "Spawns friendly troops that hold the lane.",
    baseCost: 55,
    maxTier: 4,
    unlockWave: 4,
    color: 0xb66d35,
    icon: "B",
    stats: { troopHp: 60, spawnRateMs: 3600 },
  },
  {
    id: "coin-mill",
    name: "Coin Mill",
    role: "economy",
    description: "Generates coins between waves.",
    baseCost: 40,
    maxTier: 4,
    unlockWave: 3,
    color: 0xd9a441,
    icon: "$",
    stats: { income: 12 },
  },
  {
    id: "stone-wall",
    name: "Stone Wall",
    role: "wall",
    description: "Absorbs pressure when enemies reach the fort.",
    baseCost: 30,
    maxTier: 4,
    unlockWave: 2,
    color: 0x777f87,
    icon: "W",
    stats: { fortShield: 18 },
  },
  {
    id: "healing-shrine",
    name: "Healing Shrine",
    role: "support",
    description: "Repairs the fort after every boss wave.",
    baseCost: 60,
    maxTier: 3,
    unlockWave: 5,
    color: 0x4f9d69,
    icon: "+",
    stats: { repair: 12 },
  },
];

