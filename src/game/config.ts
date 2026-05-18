import Phaser from "phaser";
import { RunScene } from "./scenes/RunScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 390,
  height: 694,
  backgroundColor: "#83a96d",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [RunScene],
};

