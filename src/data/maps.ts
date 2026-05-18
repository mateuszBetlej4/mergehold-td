/** Temporary — all maps selectable for layout inspection */
export const DEBUG_UNLOCK_ALL_MAPS = true;

export type MapDefinition = {
  id: string;
  name: string;
  description: string;
  theme: "grass" | "desert" | "snow" | "dungeon";
  unlock: string;
  routeCount: number;
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
    description: "Forked valley — west glade or east ridge, then merge at the fort.",
    theme: "grass",
    unlock: "Starter",
    routeCount: 2,
    palette: { ground: "#83a96d", path: "#d9c59f", accent: "#216869" },
  },
  {
    id: "sunspire",
    name: "Sunspire Dunes",
    description: "Twin dune lanes, faster spawns, enemies favor the open ridge.",
    theme: "desert",
    unlock: "Clear wave 8",
    routeCount: 2,
    palette: { ground: "#c99f67", path: "#ecd6a5", accent: "#b85c38" },
  },
  {
    id: "frostgate",
    name: "Frostgate Road",
    description: "Three ice approaches — west, center road, east — longer waves.",
    theme: "snow",
    unlock: "Clear wave 14",
    routeCount: 3,
    palette: { ground: "#b9cbd0", path: "#e8e0c8", accent: "#365f7a" },
  },
  {
    id: "underkeep",
    name: "Underkeep",
    description: "Gauntlet vs crypt — trap-lined branches, split pressure.",
    theme: "dungeon",
    unlock: "Clear wave 20",
    routeCount: 2,
    palette: { ground: "#5d635c", path: "#9b8c73", accent: "#6856a3" },
  },
];

