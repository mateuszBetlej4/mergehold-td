import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { gameConfig } from "./config";

export function GameCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hostRef.current) return undefined;

    const game = new Phaser.Game({
      ...gameConfig,
      parent: hostRef.current,
    });

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={hostRef} className="game-canvas" />;
}

