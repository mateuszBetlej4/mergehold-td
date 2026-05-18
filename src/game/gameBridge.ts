export type RunBuildMode = "tower" | "trap" | "mill" | "barracks" | "wall" | "shrine";
export type RunDockTab = "towers" | "support";

export type RunUiTower = {
  index: number;
  id: string;
  name: string;
  icon: string;
  cost: number;
  color: number;
  sprite: string;
  selected: boolean;
};

export type RunUiStruct = {
  mode: Exclude<RunBuildMode, "tower">;
  id: string;
  name: string;
  icon: string;
  cost: number;
  color: number;
  sprite: string;
  unlockWave: number;
  unlocked: boolean;
  selected: boolean;
};

export type RunEndEvent = {
  reason: "defeat";
  wave: number;
  highestClearedWave: number;
  coins: number;
  fortBonusGems: number;
  sessionGems: number;
};

export type RunUiState = {
  fortHp: number;
  maxFortHp: number;
  fortShieldMax: number;
  fortShieldRemaining: number;
  wave: number;
  highestClearedWave: number;
  coins: number;
  isGameOver: boolean;
  isPaused: boolean;
  runSpeed: number;
  waitingToStartWave: boolean;
  isChoosingUpgrade: boolean;
  abilityLabel: string;
  abilityReady: boolean;
  abilityCooldownSec: number;
  dockTab: RunDockTab;
  buildMode: RunBuildMode;
  towers: RunUiTower[];
  structs: RunUiStruct[];
  toast: string;
};

type Listener = (...args: unknown[]) => void;

class GameBridge {
  private listeners = new Map<string, Set<Listener>>();

  on(event: string, listener: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(listener);
  }

  off(event: string, listener: Listener) {
    this.listeners.get(event)?.delete(listener);
  }

  emit(event: string, ...args: unknown[]) {
    this.listeners.get(event)?.forEach((listener) => listener(...args));
  }
}

export const gameBridge = new GameBridge();

export function colorToCss(color: number) {
  return `#${color.toString(16).padStart(6, "0")}`;
}
