export type TroopDefinition = {
  id: string;
  name: string;
  description: string;
  hp: number;
  damage: number;
  role: "blocker" | "ranged" | "burst";
  unlock: string;
};

export const troopDefinitions: TroopDefinition[] = [
  {
    id: "squire",
    name: "Squire",
    description: "Blocks one enemy at a time near the fort.",
    hp: 70,
    damage: 8,
    role: "blocker",
    unlock: "Barracks tier 1",
  },
  {
    id: "longbow",
    name: "Longbow",
    description: "Adds light ranged pressure behind walls.",
    hp: 38,
    damage: 12,
    role: "ranged",
    unlock: "Barracks tier 2",
  },
  {
    id: "alchemist",
    name: "Alchemist",
    description: "Throws splash flasks into crowded lanes.",
    hp: 42,
    damage: 18,
    role: "burst",
    unlock: "Barracks tier 3",
  },
];

