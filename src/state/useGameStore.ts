import { create } from "zustand";

export type AppScreen =
  | "home"
  | "play"
  | "upgrades"
  | "collection"
  | "buildings"
  | "heroes"
  | "troops"
  | "enemies"
  | "maps"
  | "settings"
  | "deploy";

type RunSnapshot = {
  fortHp: number;
  wave: number;
  coins: number;
};

type GameStore = {
  activeScreen: AppScreen;
  soundEnabled: boolean;
  musicEnabled: boolean;
  run: RunSnapshot;
  setActiveScreen: (screen: AppScreen) => void;
  setRunSnapshot: (snapshot: RunSnapshot) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
};

export const useGameStore = create<GameStore>((set) => ({
  activeScreen: "home",
  soundEnabled: true,
  musicEnabled: true,
  run: {
    fortHp: 100,
    wave: 1,
    coins: 80,
  },
  setActiveScreen: (screen) => set({ activeScreen: screen }),
  setRunSnapshot: (snapshot) => set({ run: snapshot }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
}));
