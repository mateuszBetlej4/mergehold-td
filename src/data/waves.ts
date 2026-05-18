export type WaveDefinition = {
  wave: number;
  groups: Array<{
    enemyId: string;
    count: number;
    intervalMs: number;
  }>;
  offersUpgrade: boolean;
};

export const waveDefinitions: WaveDefinition[] = [
  { wave: 1, groups: [{ enemyId: "grunt", count: 6, intervalMs: 700 }], offersUpgrade: false },
  { wave: 2, groups: [{ enemyId: "grunt", count: 9, intervalMs: 620 }], offersUpgrade: true },
  { wave: 3, groups: [{ enemyId: "runner", count: 8, intervalMs: 560 }], offersUpgrade: false },
  { wave: 4, groups: [{ enemyId: "tank", count: 3, intervalMs: 1100 }], offersUpgrade: true },
  { wave: 5, groups: [{ enemyId: "gatebreaker", count: 1, intervalMs: 1000 }], offersUpgrade: true },
];

