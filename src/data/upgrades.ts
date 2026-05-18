export type UpgradeDefinition = {
  id: string;
  name: string;
  rarity: "common" | "rare" | "epic";
  description: string;
  target: string;
  value: number;
};

export const upgradeDefinitions: UpgradeDefinition[] = [
  {
    id: "sharp-arrows",
    name: "Sharp Arrows",
    rarity: "common",
    description: "Archer towers deal more damage.",
    target: "archer-damage",
    value: 0.15,
  },
  {
    id: "quick-hands",
    name: "Quick Hands",
    rarity: "common",
    description: "All towers fire slightly faster.",
    target: "fire-rate",
    value: 0.1,
  },
  {
    id: "reinforced-gate",
    name: "Reinforced Gate",
    rarity: "common",
    description: "Restore and increase fort HP.",
    target: "fort-hp",
    value: 20,
  },
  {
    id: "powder-kegs",
    name: "Powder Kegs",
    rarity: "rare",
    description: "Cannon splash radius increases.",
    target: "cannon-splash",
    value: 0.22,
  },
  {
    id: "arcane-focus",
    name: "Arcane Focus",
    rarity: "rare",
    description: "Magic towers prioritize armored enemies.",
    target: "magic-priority",
    value: 1,
  },
  {
    id: "gold-rush",
    name: "Gold Rush",
    rarity: "epic",
    description: "Enemy coin rewards increase for the rest of the run.",
    target: "coin-reward",
    value: 0.3,
  },
];

