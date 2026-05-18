import type { WaveDefinition, WaveGroup } from "./waves";
import { getWaveSpawnGroups as getBaseWaveSpawnGroups, waveDefinitions } from "./waves";

export type MapWaveProfile = {
  /** Multiply spawn counts */
  countMult: number;
  /** Multiply intervalMs (<1 = faster spawns) */
  intervalMult: number;
  /** Extra HP per enemy on top of wave scaling */
  hpBonus: number;
};

const profiles: Record<string, MapWaveProfile> = {
  greenwatch: { countMult: 1, intervalMult: 1, hpBonus: 0 },
  sunspire: { countMult: 1.2, intervalMult: 0.88, hpBonus: 2 },
  frostgate: { countMult: 1.15, intervalMult: 0.95, hpBonus: 4 },
  underkeep: { countMult: 1.25, intervalMult: 0.9, hpBonus: 0 },
};

function scaleGroups(groups: WaveGroup[], profile: MapWaveProfile): WaveGroup[] {
  return groups.map((group) => ({
    enemyId: group.enemyId,
    count: Math.max(1, Math.ceil(group.count * profile.countMult)),
    intervalMs: Math.max(320, Math.floor(group.intervalMs * profile.intervalMult)),
  }));
}

function scaleWaveTable(base: WaveDefinition[], profile: MapWaveProfile): WaveDefinition[] {
  return base.map((wave) => ({
    ...wave,
    groups: scaleGroups(wave.groups, profile),
  }));
}

const sunspireOverrides: Partial<Record<number, WaveGroup[]>> = {
  3: [
    { enemyId: "grunt", count: 5, intervalMs: 580 },
    { enemyId: "runner", count: 8, intervalMs: 460 },
  ],
  6: [
    { enemyId: "runner", count: 6, intervalMs: 480 },
    { enemyId: "bat", count: 5, intervalMs: 520 },
  ],
};

const frostgateOverrides: Partial<Record<number, WaveGroup[]>> = {
  4: [
    { enemyId: "grunt", count: 4, intervalMs: 620 },
    { enemyId: "shield", count: 5, intervalMs: 860 },
    { enemyId: "tank", count: 3, intervalMs: 1050 },
  ],
  10: [{ enemyId: "gatebreaker", count: 1, intervalMs: 900 }],
};

const underkeepOverrides: Partial<Record<number, WaveGroup[]>> = {
  2: [
    { enemyId: "grunt", count: 8, intervalMs: 600 },
    { enemyId: "runner", count: 4, intervalMs: 540 },
  ],
  7: [
    { enemyId: "grunt", count: 6, intervalMs: 520 },
    { enemyId: "runner", count: 6, intervalMs: 460 },
    { enemyId: "shield", count: 4, intervalMs: 820 },
    { enemyId: "bat", count: 4, intervalMs: 520 },
  ],
  8: [
    { enemyId: "grunt", count: 5, intervalMs: 500 },
    { enemyId: "runner", count: 5, intervalMs: 440 },
    { enemyId: "bomber", count: 5, intervalMs: 760 },
    { enemyId: "bat", count: 4, intervalMs: 500 },
  ],
};

function buildMapWaveTable(
  mapId: string,
  overrides: Partial<Record<number, WaveGroup[]>>,
): WaveDefinition[] {
  const profile = profiles[mapId] ?? profiles.greenwatch;
  const scaled = scaleWaveTable(waveDefinitions, profile);
  return scaled.map((wave) => {
    const custom = overrides[wave.wave];
    if (!custom) return wave;
    return { ...wave, groups: scaleGroups(custom, profile) };
  });
}

const mapWaveTables: Record<string, WaveDefinition[]> = {
  greenwatch: buildMapWaveTable("greenwatch", {}),
  sunspire: buildMapWaveTable("sunspire", sunspireOverrides),
  frostgate: buildMapWaveTable("frostgate", frostgateOverrides),
  underkeep: buildMapWaveTable("underkeep", underkeepOverrides),
};

export function getMapWaveProfile(mapId: string): MapWaveProfile {
  return profiles[mapId] ?? profiles.greenwatch;
}

export function getMapWaveDefinition(mapId: string, wave: number): WaveDefinition | undefined {
  return mapWaveTables[mapId]?.find((entry) => entry.wave === wave);
}

export function getMapWaveSpawnGroups(mapId: string, wave: number): WaveGroup[] {
  const explicit = getMapWaveDefinition(mapId, wave);
  if (explicit) return explicit.groups;

  const profile = getMapWaveProfile(mapId);
  return scaleGroups(getBaseWaveSpawnGroups(wave), profile);
}

export function mapWaveOffersUpgrade(mapId: string, wave: number): boolean {
  const explicit = getMapWaveDefinition(mapId, wave);
  if (explicit) return explicit.offersUpgrade;
  return wave % 2 === 0;
}
