import Phaser from "phaser";
import {
  soundDefinitionByKey,
  soundDefinitions,
  type GameSoundKey,
} from "../../data/sounds";
import { useGameStore } from "../../state/useGameStore";

export function preloadSounds(scene: Phaser.Scene) {
  soundDefinitions.forEach((definition) => {
    scene.load.audio(definition.key, definition.paths);
  });
}

export class AudioManager {
  private readonly scene: Phaser.Scene;
  private readonly lastPlayedAt = new Map<string, number>();
  private runMusic?: Phaser.Sound.BaseSound;
  private musicUnsubscribe?: () => void;
  private soundUnsubscribe?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.musicUnsubscribe = useGameStore.subscribe((state, prev) => {
      if (state.musicEnabled === prev.musicEnabled) return;

      if (!state.musicEnabled) {
        this.stopRunMusic();
        return;
      }
      if (!this.scene.scene.isActive()) return;
      this.startRunMusic();
    });

    this.soundUnsubscribe = useGameStore.subscribe((state, prev) => {
      if (state.soundEnabled === prev.soundEnabled) return;
      if (!state.soundEnabled) {
        this.scene.sound.stopAll();
      }
    });
  }

  destroy() {
    this.stopRunMusic();
    this.musicUnsubscribe?.();
    this.soundUnsubscribe?.();
    this.lastPlayedAt.clear();
  }

  startRunMusic() {
    if (!useGameStore.getState().musicEnabled) return;

    const definition = soundDefinitionByKey["music-run"];
    if (!definition) return;

    if (this.runMusic?.isPlaying) return;

    this.runMusic?.destroy();
    this.runMusic = this.scene.sound.add("music-run", {
      loop: true,
      volume: definition.volume,
    });
    this.runMusic.play();
  }

  stopRunMusic() {
    if (!this.runMusic) return;
    this.runMusic.stop();
    this.runMusic.destroy();
    this.runMusic = undefined;
  }

  playDefeatSting() {
    this.stopRunMusic();
    if (!useGameStore.getState().musicEnabled) return;

    const definition = soundDefinitionByKey["sting-defeat"];
    if (!definition) return;

    this.scene.sound.play("sting-defeat", { volume: definition.volume });
  }

  play(key: GameSoundKey, options?: { rate?: number }) {
    if (!useGameStore.getState().soundEnabled) return;

    const definition = soundDefinitionByKey[key];
    if (!definition || definition.category !== "sfx") return;

    const now = this.scene.time.now;
    const throttleMs = definition.throttleMs ?? 0;
    const lastAt = this.lastPlayedAt.get(key) ?? 0;
    if (now - lastAt < throttleMs) return;

    this.lastPlayedAt.set(key, now);
    this.scene.sound.play(key, {
      volume: definition.volume,
      rate: options?.rate,
    });
  }

  playTowerFire(towerId: string) {
    if (towerId === "archer-tower") {
      this.play("tower-archer-fire");
    } else if (towerId === "cannon-tower") {
      this.play("tower-cannon-fire");
    } else if (towerId === "magic-tower") {
      this.play("tower-magic-fire");
    }
  }
}
