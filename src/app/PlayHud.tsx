import { useEffect, useState } from "react";
import { Home, Pause, Play } from "lucide-react";
import {
  colorToCss,
  gameBridge,
  type RunUiState,
} from "../game/gameBridge";
import { useGameStore } from "../state/useGameStore";
import "./PlayHud.css";

export function PlayHud() {
  const setActiveScreen = useGameStore((state) => state.setActiveScreen);
  const [ui, setUi] = useState<RunUiState | null>(null);

  useEffect(() => {
    const onState = (state: unknown) => setUi(state as RunUiState);
    gameBridge.on("state", onState);
    return () => gameBridge.off("state", onState);
  }, []);

  if (!ui || ui.isChoosingUpgrade) return null;

  const nextWave = ui.waitingToStartWave ? ui.wave + 1 : ui.wave;

  return (
    <div className="play-hud" aria-label="Run controls">
      <header className="play-hud__top">
        <div className="play-hud__controls">
          <button
            type="button"
            className="play-hud__icon-btn"
            aria-label="Leave run"
            onClick={() => setActiveScreen("home")}
          >
            <Home size={16} />
          </button>
          <button
            type="button"
            className={`play-hud__icon-btn ${ui.isPaused ? "is-active" : ""}`}
            aria-label={ui.isPaused ? "Resume" : "Pause"}
            onClick={() => gameBridge.emit("togglePause")}
          >
            {ui.isPaused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button
            type="button"
            className="play-hud__icon-btn"
            aria-label="Toggle speed"
            disabled={ui.isPaused}
            onClick={() => gameBridge.emit("toggleSpeed")}
          >
            {ui.runSpeed}x
          </button>
        </div>

        <div className="play-hud__stats">
          <div className="play-hud__stat is-wave">
            <span>Wave</span>
            <strong>{ui.wave}</strong>
          </div>
          <div className="play-hud__stat">
            <span>HP</span>
            <strong>
              {ui.fortHp}
              {ui.fortShieldMax > 0 ? ` +${ui.fortShieldRemaining}` : ""}
            </strong>
          </div>
          <div className="play-hud__stat is-coins">
            <span>Coins</span>
            <strong>{ui.coins}</strong>
          </div>
        </div>
      </header>

      {ui.toast ? <div className="play-hud__toast">{ui.toast}</div> : null}

      <footer className="play-hud__dock">
        {ui.waitingToStartWave ? (
          <button type="button" className="play-hud__start-wave" onClick={() => gameBridge.emit("startWave")}>
            Start wave {nextWave}
          </button>
        ) : null}

        <div className="play-hud__tabs" role="tablist" aria-label="Build category">
          <DockTab
            label="Towers"
            active={ui.dockTab === "towers"}
            onClick={() => gameBridge.emit("setDockTab", "towers")}
          />
          <DockTab
            label="Support"
            active={ui.dockTab === "support"}
            onClick={() => gameBridge.emit("setDockTab", "support")}
          />
        </div>

        {ui.dockTab === "towers" ? (
          <div className="play-hud__grid play-hud__grid--towers">
            {ui.towers.map((tower) => (
              <button
                key={tower.id}
                type="button"
                className={`play-hud__chip ${tower.selected ? "is-selected" : ""}`}
                style={{ backgroundColor: `${colorToCss(tower.color)}33` }}
                onClick={() => gameBridge.emit("selectTower", tower.index)}
              >
                <img src={`/assets/optimized/sprites/${tower.sprite}.png`} alt="" />
                <span className="play-hud__chip-label">{tower.icon}</span>
                <span className="play-hud__chip-cost">${tower.cost}</span>
              </button>
            ))}
            <button
              type="button"
              className={`play-hud__ability ${ui.abilityReady ? "is-ready" : ""}`}
              disabled={!ui.abilityReady}
              onClick={() => gameBridge.emit("useAbility")}
            >
              {ui.abilityReady ? ui.abilityLabel : `${ui.abilityCooldownSec}s`}
            </button>
          </div>
        ) : (
          <div className="play-hud__grid play-hud__grid--support">
            {ui.structs.map((struct) => (
              <button
                key={struct.id}
                type="button"
                className={`play-hud__chip ${struct.selected ? "is-selected" : ""} ${struct.unlocked ? "" : "is-locked"}`}
                style={{ backgroundColor: struct.unlocked ? `${colorToCss(struct.color)}33` : undefined }}
                disabled={!struct.unlocked}
                onClick={() => gameBridge.emit("selectStruct", struct.mode)}
              >
                <img src={`/assets/optimized/sprites/${struct.sprite}.svg`} alt="" />
                <span className="play-hud__chip-label">{struct.icon}</span>
                {struct.unlocked ? (
                  <span className="play-hud__chip-cost">${struct.cost}</span>
                ) : (
                  <span className="play-hud__chip-lock">W{struct.unlockWave}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </footer>
    </div>
  );
}

function DockTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`play-hud__tab ${active ? "is-active" : ""}`} onClick={onClick}>
      {label}
    </button>
  );
}
