export type SoundCategory = "music" | "sfx";

export type SoundDefinition = {
  key: string;
  paths: string[];
  volume: number;
  category: SoundCategory;
  /** Min ms between plays of this key (global throttle). */
  throttleMs?: number;
  loop?: boolean;
};

const audioRoot = "/assets/optimized/audio";

export const soundDefinitions: SoundDefinition[] = [
  {
    key: "music-menu",
    paths: [`${audioRoot}/music/menu-loop.ogg`],
    volume: 0.28,
    category: "music",
    loop: true,
  },
  {
    key: "music-run",
    paths: [`${audioRoot}/music/run-loop.ogg`],
    volume: 0.3,
    category: "music",
    loop: true,
  },
  {
    key: "sting-defeat",
    paths: [`${audioRoot}/music/sting-defeat.ogg`],
    volume: 0.4,
    category: "music",
  },
  {
    key: "tower-archer-fire",
    paths: [`${audioRoot}/sfx/tower-archer-fire.ogg`],
    volume: 0.32,
    category: "sfx",
    throttleMs: 120,
  },
  {
    key: "tower-cannon-fire",
    paths: [`${audioRoot}/sfx/tower-cannon-fire.ogg`],
    volume: 0.38,
    category: "sfx",
    throttleMs: 180,
  },
  {
    key: "tower-magic-fire",
    paths: [`${audioRoot}/sfx/tower-magic-fire.ogg`],
    volume: 0.34,
    category: "sfx",
    throttleMs: 140,
  },
  {
    key: "enemy-kill",
    paths: [`${audioRoot}/sfx/enemy-kill.ogg`],
    volume: 0.36,
    category: "sfx",
    throttleMs: 50,
  },
  {
    key: "enemy-leak",
    paths: [`${audioRoot}/sfx/enemy-leak.ogg`],
    volume: 0.42,
    category: "sfx",
    throttleMs: 200,
  },
  {
    key: "fort-hit",
    paths: [`${audioRoot}/sfx/fort-hit.ogg`],
    volume: 0.44,
    category: "sfx",
    throttleMs: 150,
  },
  {
    key: "enemy-bomber-explode",
    paths: [`${audioRoot}/sfx/enemy-bomber-explode.ogg`],
    volume: 0.48,
    category: "sfx",
    throttleMs: 300,
  },
  {
    key: "trap-trigger",
    paths: [`${audioRoot}/sfx/trap-trigger.ogg`],
    volume: 0.4,
    category: "sfx",
    throttleMs: 120,
  },
  {
    key: "build-place",
    paths: [`${audioRoot}/sfx/build-place.ogg`],
    volume: 0.38,
    category: "sfx",
  },
  {
    key: "build-upgrade",
    paths: [`${audioRoot}/sfx/build-upgrade.ogg`],
    volume: 0.36,
    category: "sfx",
  },
  {
    key: "wave-start",
    paths: [`${audioRoot}/sfx/wave-start.ogg`],
    volume: 0.4,
    category: "sfx",
  },
  {
    key: "wave-clear",
    paths: [`${audioRoot}/sfx/wave-clear.ogg`],
    volume: 0.42,
    category: "sfx",
  },
];

export const soundDefinitionByKey = Object.fromEntries(
  soundDefinitions.map((definition) => [definition.key, definition]),
) as Record<string, SoundDefinition>;

export type GameSoundKey =
  | "music-menu"
  | "music-run"
  | "sting-defeat"
  | "tower-archer-fire"
  | "tower-cannon-fire"
  | "tower-magic-fire"
  | "enemy-kill"
  | "enemy-leak"
  | "fort-hit"
  | "enemy-bomber-explode"
  | "trap-trigger"
  | "build-place"
  | "build-upgrade"
  | "wave-start"
  | "wave-clear";

const towerFireKeys: Record<string, GameSoundKey> = {
  "archer-tower": "tower-archer-fire",
  "cannon-tower": "tower-cannon-fire",
  "magic-tower": "tower-magic-fire",
};

export function getTowerFireSoundKey(towerId: string): GameSoundKey | undefined {
  return towerFireKeys[towerId];
}
