export type EnemyDefinition = {
  id: string;
  name: string;
  archetype: "grunt" | "runner" | "tank" | "shield" | "flyer" | "exploder" | "boss";
  description: string;
  hp: number;
  speed: number;
  reward: number;
  damageToFort: number;
  color: number;
  icon: string;
  ability: string;
};

export const enemyDefinitions: EnemyDefinition[] = [
  {
    id: "grunt",
    name: "Grunt",
    archetype: "grunt",
    description: "Baseline melee enemy.",
    hp: 32,
    speed: 1,
    reward: 5,
    damageToFort: 7,
    color: 0x703d57,
    icon: "G",
    ability: "None",
  },
  {
    id: "runner",
    name: "Runner",
    archetype: "runner",
    description: "Low HP enemy that tests targeting speed.",
    hp: 20,
    speed: 1.65,
    reward: 6,
    damageToFort: 5,
    color: 0xbe6e46,
    icon: "R",
    ability: "Fast",
  },
  {
    id: "tank",
    name: "Tank",
    archetype: "tank",
    description: "Slow, heavy target for cannon towers.",
    hp: 130,
    speed: 0.62,
    reward: 14,
    damageToFort: 12,
    color: 0x4a5759,
    icon: "T",
    ability: "High HP",
  },
  {
    id: "shield",
    name: "Shield Guard",
    archetype: "shield",
    description: "Resists arrow damage until cracked.",
    hp: 86,
    speed: 0.86,
    reward: 10,
    damageToFort: 9,
    color: 0x546a7b,
    icon: "D",
    ability: "Armor",
  },
  {
    id: "bat",
    name: "Bat",
    archetype: "flyer",
    description: "Skips traps and pressures ranged towers.",
    hp: 26,
    speed: 1.45,
    reward: 8,
    damageToFort: 6,
    color: 0x3f3351,
    icon: "F",
    ability: "Flying",
  },
  {
    id: "bomber",
    name: "Bomber",
    archetype: "exploder",
    description: "Explodes near the fort if not stopped.",
    hp: 54,
    speed: 1.05,
    reward: 11,
    damageToFort: 18,
    color: 0xb5442f,
    icon: "X",
    ability: "Explodes",
  },
  {
    id: "gatebreaker",
    name: "Gatebreaker",
    archetype: "boss",
    description: "Boss enemy for the first milestone.",
    hp: 560,
    speed: 0.48,
    reward: 90,
    damageToFort: 35,
    color: 0x2f1b25,
    icon: "B",
    ability: "Boss",
  },
];

