export type HeroDefinition = {
  id: string;
  name: string;
  role: "guardian" | "ranger" | "mage";
  description: string;
  ability: string;
  cooldownSeconds: number;
  color: number;
  unlock: string;
};

export const heroDefinitions: HeroDefinition[] = [
  {
    id: "stone-warden",
    name: "Stone Warden",
    role: "guardian",
    description: "Starter hero that shields the fort.",
    ability: "Fort Shield",
    cooldownSeconds: 18,
    color: 0x4a5759,
    unlock: "Starter",
  },
  {
    id: "wild-arrow",
    name: "Wild Arrow",
    role: "ranger",
    description: "Ranged hero that focuses the strongest enemy.",
    ability: "Piercing Volley",
    cooldownSeconds: 16,
    color: 0x2f5d8c,
    unlock: "Clear wave 5",
  },
  {
    id: "ember-sage",
    name: "Ember Sage",
    role: "mage",
    description: "Magic hero that burns clustered enemies.",
    ability: "Meteor Sigil",
    cooldownSeconds: 22,
    color: 0xb85c38,
    unlock: "Clear wave 10",
  },
];

