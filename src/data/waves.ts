export type WaveGroup = {
  enemyId: string;
  count: number;
  intervalMs: number;
};

export type WaveDefinition = {
  wave: number;
  groups: WaveGroup[];
  offersUpgrade: boolean;
};

/** Explicit spawn tables for waves 1–15 (DEC-025 tier gates + shared spawn budget). */
export const waveDefinitions: WaveDefinition[] = [
  { wave: 1, groups: [{ enemyId: "grunt", count: 6, intervalMs: 700 }], offersUpgrade: false },
  {
    wave: 2,
    groups: [
      { enemyId: "grunt", count: 5, intervalMs: 650 },
      { enemyId: "runner", count: 3, intervalMs: 560 },
    ],
    offersUpgrade: true,
  },
  {
    wave: 3,
    groups: [
      { enemyId: "grunt", count: 4, intervalMs: 620 },
      { enemyId: "runner", count: 6, intervalMs: 520 },
    ],
    offersUpgrade: false,
  },
  {
    wave: 4,
    groups: [
      { enemyId: "grunt", count: 3, intervalMs: 600 },
      { enemyId: "runner", count: 3, intervalMs: 540 },
      { enemyId: "tank", count: 2, intervalMs: 1100 },
      { enemyId: "shield", count: 2, intervalMs: 900 },
    ],
    offersUpgrade: true,
  },
  { wave: 5, groups: [{ enemyId: "gatebreaker", count: 1, intervalMs: 1000 }], offersUpgrade: true },
  {
    wave: 6,
    groups: [
      { enemyId: "grunt", count: 4, intervalMs: 600 },
      { enemyId: "runner", count: 4, intervalMs: 520 },
      { enemyId: "bat", count: 3, intervalMs: 580 },
    ],
    offersUpgrade: false,
  },
  {
    wave: 7,
    groups: [
      { enemyId: "grunt", count: 4, intervalMs: 580 },
      { enemyId: "runner", count: 4, intervalMs: 500 },
      { enemyId: "tank", count: 2, intervalMs: 1050 },
      { enemyId: "shield", count: 2, intervalMs: 880 },
      { enemyId: "bat", count: 3, intervalMs: 560 },
    ],
    offersUpgrade: true,
  },
  {
    wave: 8,
    groups: [
      { enemyId: "grunt", count: 3, intervalMs: 560 },
      { enemyId: "runner", count: 4, intervalMs: 480 },
      { enemyId: "tank", count: 2, intervalMs: 1000 },
      { enemyId: "shield", count: 2, intervalMs: 860 },
      { enemyId: "bat", count: 3, intervalMs: 540 },
      { enemyId: "bomber", count: 2, intervalMs: 820 },
    ],
    offersUpgrade: false,
  },
  {
    wave: 9,
    groups: [
      { enemyId: "grunt", count: 4, intervalMs: 540 },
      { enemyId: "runner", count: 5, intervalMs: 460 },
      { enemyId: "tank", count: 2, intervalMs: 980 },
      { enemyId: "shield", count: 3, intervalMs: 840 },
      { enemyId: "bat", count: 4, intervalMs: 520 },
      { enemyId: "bomber", count: 2, intervalMs: 800 },
    ],
    offersUpgrade: true,
  },
  { wave: 10, groups: [{ enemyId: "gatebreaker", count: 1, intervalMs: 1000 }], offersUpgrade: true },
  {
    wave: 11,
    groups: [
      { enemyId: "grunt", count: 5, intervalMs: 520 },
      { enemyId: "runner", count: 5, intervalMs: 440 },
      { enemyId: "tank", count: 3, intervalMs: 960 },
      { enemyId: "shield", count: 3, intervalMs: 820 },
      { enemyId: "bat", count: 4, intervalMs: 500 },
      { enemyId: "bomber", count: 3, intervalMs: 780 },
    ],
    offersUpgrade: false,
  },
  {
    wave: 12,
    groups: [
      { enemyId: "grunt", count: 5, intervalMs: 500 },
      { enemyId: "runner", count: 6, intervalMs: 420 },
      { enemyId: "tank", count: 3, intervalMs: 940 },
      { enemyId: "shield", count: 3, intervalMs: 800 },
      { enemyId: "bat", count: 5, intervalMs: 480 },
      { enemyId: "bomber", count: 3, intervalMs: 760 },
    ],
    offersUpgrade: true,
  },
  {
    wave: 13,
    groups: [
      { enemyId: "grunt", count: 6, intervalMs: 480 },
      { enemyId: "runner", count: 6, intervalMs: 400 },
      { enemyId: "tank", count: 3, intervalMs: 920 },
      { enemyId: "shield", count: 4, intervalMs: 780 },
      { enemyId: "bat", count: 5, intervalMs: 460 },
      { enemyId: "bomber", count: 4, intervalMs: 740 },
    ],
    offersUpgrade: false,
  },
  {
    wave: 14,
    groups: [
      { enemyId: "grunt", count: 6, intervalMs: 460 },
      { enemyId: "runner", count: 7, intervalMs: 380 },
      { enemyId: "tank", count: 4, intervalMs: 900 },
      { enemyId: "shield", count: 4, intervalMs: 760 },
      { enemyId: "bat", count: 6, intervalMs: 440 },
      { enemyId: "bomber", count: 4, intervalMs: 720 },
    ],
    offersUpgrade: true,
  },
  { wave: 15, groups: [{ enemyId: "gatebreaker", count: 1, intervalMs: 1000 }], offersUpgrade: true },
];

const heavyEnemyIds = new Set(["tank", "shield", "gatebreaker"]);

/** DEC-025 tier table — used for procedural waves beyond explicit tables. */
export function getWaveEnemyIds(wave: number): string[] {
  if (wave % 5 === 0) return ["gatebreaker"];

  const mix = ["grunt"];
  if (wave >= 2) mix.push("runner");
  if (wave >= 4) mix.push("tank", "shield");
  if (wave >= 6) mix.push("bat");
  if (wave >= 8) mix.push("bomber");
  return mix;
}

function buildProceduralGroups(wave: number): WaveGroup[] {
  const enemyIds = getWaveEnemyIds(wave);
  const budget = Math.min(28, 8 + Math.floor(wave * 0.75));
  const perType = Math.max(1, Math.floor(budget / enemyIds.length));

  return enemyIds.map((enemyId) => ({
    enemyId,
    count: perType,
    intervalMs: heavyEnemyIds.has(enemyId) ? 920 : 640,
  }));
}

export function getWaveSpawnGroups(wave: number): WaveGroup[] {
  const explicit = waveDefinitions.find((entry) => entry.wave === wave);
  if (explicit) return explicit.groups;
  return buildProceduralGroups(wave);
}

export function waveOffersUpgrade(wave: number): boolean {
  const explicit = waveDefinitions.find((entry) => entry.wave === wave);
  if (explicit) return explicit.offersUpgrade;
  return wave % 2 === 0;
}
