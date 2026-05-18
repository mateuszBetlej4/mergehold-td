import { create } from "zustand";
import { DEBUG_UNLOCK_ALL_MAPS } from "../data/maps";

export type AppScreen =
  | "home"
  | "play"
  | "upgrades"
  | "run-upgrades"
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
  highestClearedWave: number;
};

export type RunEndSummary = {
  reason: "defeat" | "abandon";
  peakWave: number;
  sessionGems: number;
  fortBonusGems: number;
};

export type LastRunStatus = "none" | "active" | "lost" | "abandoned";

export type LastRunSummary = {
  peakWave: number;
  status: LastRunStatus;
  sessionGems: number;
};

export type PermanentUpgradeId = "fortHp" | "startingCoins" | "towerDamage" | "coinGain";

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
  {
    id: "coinGain",
    name: "Merchant's Ledger",
    description: "Earn more coins from enemy kills.",
    baseCost: 40,
    valuePerLevel: 0.05,
  },
];

export type PlayerProgress = {
  softCurrency: number;
  bestWave: number;
  selectedHeroId: string;
  selectedMapId: string;
  permanentUpgrades: Record<PermanentUpgradeId, number>;
  soundEnabled: boolean;
  musicEnabled: boolean;
};

type GameStore = {
  activeScreen: AppScreen;
  soundEnabled: boolean;
  musicEnabled: boolean;
  run: RunSnapshot;
  progress: PlayerProgress;
  lastRun: LastRunSummary;
  runEndSummary: RunEndSummary | null;
  setActiveScreen: (screen: AppScreen) => void;
  setRunSnapshot: (snapshot: RunSnapshot) => void;
  beginRun: () => void;
  recordWaveClear: (wave: number) => number;
  claimRunRewards: (wave: number, coins: number, highestClearedWave: number) => number;
  forfeitRun: (currentWave: number, highestClearedWave: number) => void;
  dismissRunEndSummary: () => void;
  buyPermanentUpgrade: (id: PermanentUpgradeId) => boolean;
  selectHero: (id: string, unlockWave: number) => boolean;
  selectMap: (id: string, unlockWave: number) => boolean;
  resetProgress: () => void;
  replaceProgressFromCloud: (progress: PlayerProgress) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
};

const defaultProgress: PlayerProgress = {
  softCurrency: 0,
  bestWave: 1,
  selectedHeroId: "stone-warden",
  selectedMapId: "greenwatch",
  permanentUpgrades: {
    fortHp: 0,
    startingCoins: 0,
    towerDamage: 0,
    coinGain: 0,
  },
  soundEnabled: true,
  musicEnabled: true,
};

const defaultLastRun: LastRunSummary = {
  peakWave: 0,
  status: "none",
  sessionGems: 0,
};

const saveKey = "mergehold-td-progress-v1";

function waveClearGemDrip(wave: number) {
  return Math.max(3, Math.floor(wave * 2));
}

function fortLossGemBonus(wave: number, coins: number) {
  const coinTerm = Math.min(24, Math.floor(coins * 0.04));
  return Math.max(8, Math.floor(wave * 12 + coinTerm));
}

export function previewFortLossBonus(wave: number, coins: number) {
  return fortLossGemBonus(wave, coins);
}

function loadProgress() {
  if (typeof window === "undefined") return defaultProgress;

  try {
    const raw = window.localStorage.getItem(saveKey);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw);

    return {
      ...defaultProgress,
      ...parsed,
      permanentUpgrades: {
        ...defaultProgress.permanentUpgrades,
        ...parsed.permanentUpgrades,
      },
      soundEnabled: typeof parsed.soundEnabled === "boolean" ? parsed.soundEnabled : defaultProgress.soundEnabled,
      musicEnabled: typeof parsed.musicEnabled === "boolean" ? parsed.musicEnabled : defaultProgress.musicEnabled,
    } satisfies PlayerProgress;
  } catch {
    return defaultProgress;
  }
}

function saveProgress(progress: PlayerProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(saveKey, JSON.stringify(progress));
}

export function getDefaultProgress() {
  return {
    ...defaultProgress,
    permanentUpgrades: {
      ...defaultProgress.permanentUpgrades,
    },
  };
}

const initialProgress = loadProgress();

export const useGameStore = create<GameStore>((set) => ({
  activeScreen: "home",
  soundEnabled: initialProgress.soundEnabled,
  musicEnabled: initialProgress.musicEnabled,
  run: {
    fortHp: 100,
    wave: 1,
    coins: 80,
    highestClearedWave: 0,
  },
  progress: initialProgress,
  lastRun: defaultLastRun,
  runEndSummary: null,
  setActiveScreen: (screen) => set({ activeScreen: screen }),
  setRunSnapshot: (snapshot) => set({ run: snapshot }),
  beginRun: () => set({
    runEndSummary: null,
    lastRun: {
      peakWave: 0,
      status: "active",
      sessionGems: 0,
    },
  }),
  recordWaveClear: (wave) => {
    const drip = waveClearGemDrip(wave);
    set((state) => {
      const nextProgress = {
        ...state.progress,
        bestWave: Math.max(state.progress.bestWave, wave),
        softCurrency: state.progress.softCurrency + drip,
      };
      saveProgress(nextProgress);
      return {
        progress: nextProgress,
        lastRun: {
          peakWave: Math.max(state.lastRun.peakWave, wave),
          status: "active",
          sessionGems: state.lastRun.sessionGems + drip,
        },
      };
    });
    return drip;
  },
  claimRunRewards: (wave, coins, highestClearedWave) => {
    const reward = fortLossGemBonus(wave, coins);
    set((state) => {
      const nextProgress = {
        ...state.progress,
        bestWave: Math.max(state.progress.bestWave, highestClearedWave),
        softCurrency: state.progress.softCurrency + reward,
      };
      saveProgress(nextProgress);
      const sessionGems = state.lastRun.sessionGems + reward;
      return {
        progress: nextProgress,
        lastRun: {
          peakWave: Math.max(state.lastRun.peakWave, highestClearedWave, wave),
          status: "lost",
          sessionGems,
        },
        runEndSummary: {
          reason: "defeat",
          peakWave: Math.max(state.lastRun.peakWave, highestClearedWave, wave),
          sessionGems,
          fortBonusGems: reward,
        },
      };
    });
    return reward;
  },
  forfeitRun: (currentWave, highestClearedWave) => {
    set((state) => {
      const peak = Math.max(highestClearedWave, currentWave > 1 ? currentWave - 1 : 0, 1);
      const nextProgress = {
        ...state.progress,
        bestWave: Math.max(state.progress.bestWave, highestClearedWave),
      };
      if (nextProgress.bestWave !== state.progress.bestWave) {
        saveProgress(nextProgress);
      }
      const sessionGems = state.lastRun.sessionGems;
      return {
        progress: nextProgress,
        lastRun: {
          peakWave: peak,
          status: "abandoned",
          sessionGems,
        },
        runEndSummary: {
          reason: "abandon",
          peakWave: peak,
          sessionGems,
          fortBonusGems: 0,
        },
      };
    });
  },
  dismissRunEndSummary: () => set({ runEndSummary: null }),
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
  selectHero: (id, unlockWave) => {
    let didSelect = false;
    set((state) => {
      if (state.progress.bestWave < unlockWave) return state;

      didSelect = true;
      const nextProgress = {
        ...state.progress,
        selectedHeroId: id,
      };
      saveProgress(nextProgress);
      return { progress: nextProgress };
    });
    return didSelect;
  },
  selectMap: (id, unlockWave) => {
    let didSelect = false;
    set((state) => {
      if (!DEBUG_UNLOCK_ALL_MAPS && state.progress.bestWave < unlockWave) return state;

      didSelect = true;
      const nextProgress = {
        ...state.progress,
        selectedMapId: id,
      };
      saveProgress(nextProgress);
      return { progress: nextProgress };
    });
    return didSelect;
  },
  resetProgress: () => set((state) => {
    const nextProgress = {
      ...defaultProgress,
      soundEnabled: state.progress.soundEnabled,
      musicEnabled: state.progress.musicEnabled,
    };
    saveProgress(nextProgress);
    return {
      progress: nextProgress,
      lastRun: defaultLastRun,
      runEndSummary: null,
      soundEnabled: nextProgress.soundEnabled,
      musicEnabled: nextProgress.musicEnabled,
    };
  }),
  replaceProgressFromCloud: (progress) => set(() => {
    const nextProgress = {
      ...defaultProgress,
      ...progress,
      permanentUpgrades: {
        ...defaultProgress.permanentUpgrades,
        ...progress.permanentUpgrades,
      },
      soundEnabled: typeof progress.soundEnabled === "boolean" ? progress.soundEnabled : defaultProgress.soundEnabled,
      musicEnabled: typeof progress.musicEnabled === "boolean" ? progress.musicEnabled : defaultProgress.musicEnabled,
    };
    saveProgress(nextProgress);
    return {
      progress: nextProgress,
      soundEnabled: nextProgress.soundEnabled,
      musicEnabled: nextProgress.musicEnabled,
    };
  }),
  toggleSound: () => set((state) => {
    const soundEnabled = !state.soundEnabled;
    const nextProgress = { ...state.progress, soundEnabled };
    saveProgress(nextProgress);
    return { soundEnabled, progress: nextProgress };
  }),
  toggleMusic: () => set((state) => {
    const musicEnabled = !state.musicEnabled;
    const nextProgress = { ...state.progress, musicEnabled };
    saveProgress(nextProgress);
    return { musicEnabled, progress: nextProgress };
  }),
}));

export function getUnlockWave(unlock: string) {
  const match = unlock.match(/\d+/);
  return match ? Number(match[0]) : 1;
}
