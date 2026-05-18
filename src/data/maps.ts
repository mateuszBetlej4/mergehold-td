export type MapDefinition = {
  id: string;
  name: string;
  description: string;
  theme: "grass" | "desert" | "snow" | "dungeon";
  unlock: string;
  palette: {
    ground: string;
    path: string;
    accent: string;
  };
};

export const mapDefinitions: MapDefinition[] = [
  {
    id: "greenwatch",
    name: "Greenwatch Pass",
    description: "Starter valley with a single winding route.",
    theme: "grass",
    unlock: "Starter",
    palette: { ground: "#83a96d", path: "#d9c59f", accent: "#216869" },
  },
  {
    id: "sunspire",
    name: "Sunspire Dunes",
    description: "Open desert lanes with fast enemy pressure.",
    theme: "desert",
    unlock: "Clear wave 8",
    palette: { ground: "#c99f67", path: "#ecd6a5", accent: "#b85c38" },
  },
  {
    id: "frostgate",
    name: "Frostgate Road",
    description: "Slower enemies but tougher bosses.",
    theme: "snow",
    unlock: "Clear wave 14",
    palette: { ground: "#b9cbd0", path: "#e8e0c8", accent: "#365f7a" },
  },
  {
    id: "underkeep",
    name: "Underkeep",
    description: "Dungeon layout with trap-focused strategy.",
    theme: "dungeon",
    unlock: "Clear wave 20",
    palette: { ground: "#5d635c", path: "#9b8c73", accent: "#6856a3" },
  },
];

