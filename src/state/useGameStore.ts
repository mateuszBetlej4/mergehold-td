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

export type PermanentUpgradeId = "fortHp" | "startingCoins" | "towerDamage";

type PermanentUpgrade = {
  id: PermanentUpgradeId;
  name: string;
  description: string;
  baseCost: number;
  valuePerLevel: number;
};

export const permanentUpgradeDefinitions: PermanentUpgrade[] = [
  {
    id: "fortHp",
    name: "Fort Masonry",
    description: "Increase starting fort HP.",
    baseCost: 35,
    valuePerLevel: 18,
  },
  {
    id: "startingCoins",
    name: "War Chest",
    description: "Start each run with more coins.",
    baseCost: 30,
    valuePerLevel: 15,
  },
  {
    id: "towerDamage",
    name: "Sharper Tools",
    description: "Increase all tower damage.",
    baseCost: 45,
    valuePerLevel: 0.08,
  },
];

type PlayerProgress = {
  softCurrency: number;
  bestWave: number;
  permanentUpgrades: Record<PermanentUpgradeId, number>;
};

type GameStore = {
  activeScreen: AppScreen;
  soundEnabled: boolean;
  musicEnabled: boolean;
  run: RunSnapshot;
  progress: PlayerProgress;
  setActiveScreen: (screen: AppScreen) => void;
  setRunSnapshot: (snapshot: RunSnapshot) => void;
  claimRunRewards: (wave: number, coins: number) => number;
  buyPermanentUpgrade: (id: PermanentUpgradeId) => boolean;
  resetProgress: () => void;
  toggleSound: () => void;
  toggleMusic: () => void;
};

const defaultProgress: PlayerProgress = {
  softCurrency: 0,
  bestWave: 1,
  permanentUpgrades: {
    fortHp: 0,
    startingCoins: 0,
    towerDamage: 0,
  },
};

const saveKey = "mergehold-td-progress-v1";

function loadProgress() {
  if (typeof window === "undefined") return defaultProgress;

  try {
    const raw = window.localStorage.getItem(saveKey);
    if (!raw) return defaultProgress;

    return {
      ...defaultProgress,
      ...JSON.parse(raw),
      permanentUpgrades: {
        ...defaultProgress.permanentUpgrades,
        ...JSON.parse(raw).permanentUpgrades,
      },
    } satisfies PlayerProgress;
  } catch {
    return defaultProgress;
  }
}

function saveProgress(progress: PlayerProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(saveKey, JSON.stringify(progress));
}

export const useGameStore = create<GameStore>((set) => ({
  activeScreen: "home",
  soundEnabled: true,
  musicEnabled: true,
  run: {
    fortHp: 100,
    wave: 1,
    coins: 80,
  },
  progress: loadProgress(),
  setActiveScreen: (screen) => set({ activeScreen: screen }),
  setRunSnapshot: (snapshot) => set({ run: snapshot }),
  claimRunRewards: (wave, coins) => {
    const reward = Math.max(8, Math.floor(wave * 12 + coins * 0.08));
    set((state) => {
      const nextProgress = {
        ...state.progress,
        bestWave: Math.max(state.progress.bestWave, wave),
        softCurrency: state.progress.softCurrency + reward,
      };
      saveProgress(nextProgress);
      return { progress: nextProgress };
    });
    return reward;
  },
  buyPermanentUpgrade: (id) => {
    let didBuy = false;
    set((state) => {
      const definition = permanentUpgradeDefinitions.find((upgrade) => upgrade.id === id);
      if (!definition) return state;

      const currentLevel = state.progress.permanentUpgrades[id];
      const cost = definition.baseCost + currentLevel * definition.baseCost;
      if (state.progress.softCurrency < cost) return state;

      didBuy = true;
      const nextProgress = {
        ...state.progress,
        softCurrency: state.progress.softCurrency - cost,
        permanentUpgrades: {
          ...state.progress.permanentUpgrades,
          [id]: currentLevel + 1,
        },
      };
      saveProgress(nextProgress);
      return { progress: nextProgress };
    });
    return didBuy;
  },
  resetProgress: () => set(() => {
    saveProgress(defaultProgress);
    return { progress: defaultProgress };
  }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
}));
