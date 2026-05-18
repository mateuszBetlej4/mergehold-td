import { soundDefinitionByKey } from "../../data/sounds";
import { useGameStore } from "../../state/useGameStore";

let menuAudio: HTMLAudioElement | null = null;
let started = false;

function getMenuAudio() {
  if (!menuAudio) {
    const definition = soundDefinitionByKey["music-menu"];
    menuAudio = new Audio(definition?.paths[0] ?? "/assets/optimized/audio/music/menu-loop.ogg");
    menuAudio.loop = true;
    menuAudio.preload = "auto";
    menuAudio.volume = definition?.volume ?? 0.28;
  }
  return menuAudio;
}

export function primeMenuMusic() {
  if (started) return;
  const audio = getMenuAudio();
  audio.play()
    .then(() => {
      started = true;
      syncMenuMusic();
    })
    .catch(() => {
      /* Autoplay blocked until user gesture — Start run / nav will retry. */
    });
}

export function syncMenuMusic(activeScreen?: string) {
  const audio = getMenuAudio();
  const screen = activeScreen ?? useGameStore.getState().activeScreen;
  const { musicEnabled } = useGameStore.getState();
  const shouldPlay = musicEnabled && screen !== "play";

  if (!shouldPlay) {
    audio.pause();
    return;
  }

  if (!started) return;

  if (audio.paused) {
    audio.play().catch(() => undefined);
  }
}

export function stopMenuMusic() {
  getMenuAudio().pause();
}

export function disposeMenuMusic() {
  if (!menuAudio) return;
  menuAudio.pause();
  menuAudio.src = "";
  menuAudio = null;
  started = false;
}
