import {
  Archive,
  Bug,
  Castle,
  Cloud,
  Cog,
  Database,
  Hammer,
  Home,
  Map,
  Rocket,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Trophy,
  User,
} from "lucide-react";
import { buildingDefinitions } from "../data/buildings";
import { enemyDefinitions } from "../data/enemies";
import { gameContent } from "../data/gameContent";
import { heroDefinitions } from "../data/heroes";
import { DEBUG_UNLOCK_ALL_MAPS, mapDefinitions } from "../data/maps";
import { troopDefinitions } from "../data/troops";
import { upgradeDefinitions } from "../data/upgrades";
import { GameCanvas } from "../game/GameCanvas";
import { CatalogStatGrid } from "./CatalogStatGrid";
import { CatalogThumb } from "./CatalogThumb";
import {
  getBuildingCatalogStats,
  getEnemyCatalogStats,
  getHeroCatalogStats,
  getPermanentUpgradeCatalogStats,
  getTroopCatalogStats,
  getUpgradeCatalogStats,
} from "./catalogStats";
import { PlayHud } from "./PlayHud";
import { useCallback, useEffect, useState } from "react";
import { primeMenuMusic, stopMenuMusic, syncMenuMusic } from "../game/audio/menuMusic";
import { gameBridge } from "../game/gameBridge";
import {
  getUnlockWave,
  permanentUpgradeDefinitions,
  type AppScreen,
  type PermanentUpgradeId,
  useGameStore,
} from "../state/useGameStore";

const navItems: Array<{ screen: AppScreen; label: string; icon: typeof Home }> = [
  { screen: "home", label: "Home", icon: Home },
  { screen: "play", label: "Play", icon: Swords },
  { screen: "upgrades", label: "Upgrades", icon: Sparkles },
  { screen: "collection", label: "Collection", icon: Archive },
  { screen: "settings", label: "Settings", icon: Cog },
];

type LeavePlayHandlers = {
  leaveConfirmOpen: boolean;
  onRequestLeave: () => void;
  onCancelLeave: () => void;
  onConfirmLeave: () => void;
};

export function App() {
  const activeScreen = useGameStore((state) => state.activeScreen);
  const musicEnabled = useGameStore((state) => state.musicEnabled);
  const setActiveScreen = useGameStore((state) => state.setActiveScreen);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [pendingLeaveScreen, setPendingLeaveScreen] = useState<AppScreen | null>(null);

  useEffect(() => {
    syncMenuMusic(activeScreen);
  }, [activeScreen, musicEnabled]);

  useEffect(() => () => stopMenuMusic(), []);

  const confirmLeaveRun = useCallback(() => {
    const { run, forfeitRun, runEndSummary, dismissRunEndSummary } = useGameStore.getState();
    if (!runEndSummary) {
      forfeitRun(run.wave, run.highestClearedWave);
    } else {
      dismissRunEndSummary();
    }
    setLeaveConfirmOpen(false);
    const target = pendingLeaveScreen ?? "home";
    setPendingLeaveScreen(null);
    setActiveScreen(target);
  }, [pendingLeaveScreen, setActiveScreen]);

  const navigateTo = useCallback((screen: AppScreen) => {
    if (activeScreen === "play" && screen !== "play") {
      const { runEndSummary, run } = useGameStore.getState();
      if (runEndSummary) {
        useGameStore.getState().dismissRunEndSummary();
        setActiveScreen(screen);
        return;
      }
      if (run.fortHp <= 0) {
        useGameStore.getState().dismissRunEndSummary();
        setActiveScreen(screen);
        return;
      }
      setPendingLeaveScreen(screen);
      setLeaveConfirmOpen(true);
      return;
    }
    setActiveScreen(screen);
  }, [activeScreen, setActiveScreen]);

  const leaveHandlers: LeavePlayHandlers = {
    leaveConfirmOpen,
    onRequestLeave: () => {
      setPendingLeaveScreen("home");
      setLeaveConfirmOpen(true);
    },
    onCancelLeave: () => {
      setLeaveConfirmOpen(false);
      setPendingLeaveScreen(null);
    },
    onConfirmLeave: confirmLeaveRun,
  };

  return (
    <main className="app-shell">
      <section
        className={`mobile-frame ${activeScreen === "play" ? "is-play-mode" : ""}`}
        aria-label="Game app"
      >
        <div className="mobile-topbar">
          <div>
            <span>Mergehold TD</span>
            <strong>{screenTitle(activeScreen)}</strong>
          </div>
          <button type="button" onClick={() => navigateTo("settings")} aria-label="Open settings">
            <Cog size={18} />
          </button>
        </div>

        <div className={`screen-body ${activeScreen === "play" ? "is-play" : ""}`}>
          {renderScreen(activeScreen, navigateTo, leaveHandlers)}
        </div>

        <nav className="bottom-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={activeScreen === item.screen ? "active" : ""}
                key={item.screen}
                type="button"
                onClick={() => {
                  primeMenuMusic();
                  navigateTo(item.screen);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <RunEndSummaryModal />
      </section>

      <aside className="builder-panel" aria-label="Starter status">
        <div className="brand-block">
          <p className="eyebrow">Deployable starter</p>
          <h1>Mobile merge defense starter</h1>
          <p>
            Minimal but complete foundation: screens, game loop, heroes, enemies,
            towers, buildings, maps, Supabase schema, Vercel config, and an optional
            Render API service.
          </p>
        </div>

        <div className="status-grid">
          <StatusCard icon={Castle} label="Buildings" value={String(buildingDefinitions.length)} />
          <StatusCard icon={Skull} label="Enemies" value={String(enemyDefinitions.length)} />
          <StatusCard icon={User} label="Heroes" value={String(heroDefinitions.length)} />
          <StatusCard icon={Map} label="Maps" value={String(mapDefinitions.length)} />
        </div>

        <section className="panel-section">
          <h2>
            <Rocket size={18} />
            Deployment setup
          </h2>
          <div className="deploy-list">
            <span>
              <Cloud size={16} />
              Vercel static frontend
            </span>
            <span>
              <Database size={16} />
              Supabase migrations and env template
            </span>
            <span>
              <Hammer size={16} />
              Render optional API blueprint
            </span>
            <span>
              <Bug size={16} />
              In-repo bug tracker
            </span>
          </div>
        </section>
      </aside>
    </main>
  );
}

function renderScreen(
  screen: AppScreen,
  navigateTo: (screen: AppScreen) => void,
  leaveHandlers: LeavePlayHandlers,
) {
  switch (screen) {
    case "play":
      return <PlayScreen {...leaveHandlers} />;
    case "upgrades":
      return <PermanentUpgradesScreen />;
    case "collection":
      return <CollectionScreen navigateTo={navigateTo} />;
    case "buildings":
      return <BuildingsCatalogScreen />;
    case "heroes":
      return <HeroesScreen />;
    case "troops":
      return <TroopsCatalogScreen />;
    case "run-upgrades":
      return <RunUpgradesScreen />;
    case "enemies":
      return <EnemiesCatalogScreen />;
    case "maps":
      return <MapsScreen />;
    case "settings":
      return <SettingsScreen />;
    case "deploy":
      return <DeployScreen />;
    default:
      return <HomeScreen navigateTo={navigateTo} />;
  }
}

function formatUnlockLabel(unlock: string, bestWave: number) {
  const required = getUnlockWave(unlock);
  if (!unlock.match(/\d+/)) return unlock;
  if (bestWave >= required) return unlock;
  return `${unlock} · best W${bestWave}`;
}

function formatLastRunLabel(lastRun: ReturnType<typeof useGameStore.getState>["lastRun"]) {
  if (lastRun.status === "lost") {
    return lastRun.sessionGems > 0 ? `Lost W${lastRun.peakWave} · +${lastRun.sessionGems}` : `Lost W${lastRun.peakWave}`;
  }
  if (lastRun.status === "abandoned") {
    return lastRun.sessionGems > 0 ? `Left W${lastRun.peakWave} · +${lastRun.sessionGems}` : `Left W${lastRun.peakWave}`;
  }
  if (lastRun.status === "active" && lastRun.peakWave > 0) {
    return `Peak W${lastRun.peakWave}`;
  }
  return "—";
}

function HomeScreen({ navigateTo }: { navigateTo: (screen: AppScreen) => void }) {
  const progress = useGameStore((state) => state.progress);
  const lastRun = useGameStore((state) => state.lastRun);
  const selectedHero = heroDefinitions.find((hero) => hero.id === progress.selectedHeroId) ?? heroDefinitions[0];
  const selectedMap = mapDefinitions.find((map) => map.id === progress.selectedMapId) ?? mapDefinitions[0];

  return (
    <section className="home-screen">
      <div className="hero-card">
        <Shield size={34} />
        <h2>Guard the pass</h2>
        <p>Build, merge, survive waves, and grow your fort between runs.</p>
        <button
          type="button"
          onClick={() => {
            primeMenuMusic();
            navigateTo("play");
          }}
        >
          Start run
        </button>
      </div>

      <div className="quick-stats">
        <Metric label="Best" value={`Wave ${progress.bestWave}`} />
        <Metric label="Gems" value={String(progress.softCurrency)} />
        <Metric label="Last" value={formatLastRunLabel(lastRun)} />
      </div>

      <div className="loadout-strip">
        <button type="button" onClick={() => navigateTo("heroes")}>
          <span>Hero</span>
          <strong>{selectedHero.name}</strong>
        </button>
        <button type="button" onClick={() => navigateTo("maps")}>
          <span>Map</span>
          <strong>{selectedMap.name}</strong>
        </button>
      </div>

      <div className="screen-grid two">
        <MenuTile icon={Sparkles} label="Permanent Upgrades" onClick={() => navigateTo("upgrades")} />
        <MenuTile icon={Castle} label="Buildings" onClick={() => navigateTo("buildings")} />
        <MenuTile icon={User} label="Heroes" onClick={() => navigateTo("heroes")} />
        <MenuTile icon={Skull} label="Enemies" onClick={() => navigateTo("enemies")} />
        {import.meta.env.DEV ? (
          <MenuTile icon={Rocket} label="Deploy" onClick={() => navigateTo("deploy")} />
        ) : null}
      </div>
    </section>
  );
}

function PlayScreen(props: LeavePlayHandlers) {
  return (
    <section className="play-screen">
      <GameCanvas />
      <PlayHud {...props} />
    </section>
  );
}

function RunEndSummaryModal() {
  const runEndSummary = useGameStore((state) => state.runEndSummary);
  const progress = useGameStore((state) => state.progress);
  const dismissRunEndSummary = useGameStore((state) => state.dismissRunEndSummary);
  const setActiveScreen = useGameStore((state) => state.setActiveScreen);

  if (!runEndSummary) return null;

  const isDefeat = runEndSummary.reason === "defeat";
  const title = isDefeat ? "Fort lost" : "Run ended";
  const dripGems = Math.max(0, runEndSummary.sessionGems - runEndSummary.fortBonusGems);

  return (
    <div className="run-summary-backdrop" role="dialog" aria-modal="true" aria-labelledby="run-summary-title">
      <div className="run-summary-card">
        <h2 id="run-summary-title">{title}</h2>
        <p className="run-summary-wave">Peak wave {runEndSummary.peakWave}</p>
        <div className="run-summary-gems">
          <strong>+{runEndSummary.sessionGems} gems</strong>
          <span>this run</span>
        </div>
        {isDefeat && runEndSummary.fortBonusGems > 0 ? (
          <p className="run-summary-breakdown">
            {dripGems > 0 ? `${dripGems} from waves · ` : ""}
            +{runEndSummary.fortBonusGems} fort bonus
          </p>
        ) : (
          <p className="run-summary-breakdown">
            {runEndSummary.sessionGems > 0
              ? "Wave-clear gems kept. No fort-death bonus."
              : "No gems earned this run."}
          </p>
        )}
        <p className="run-summary-wallet">Wallet: {progress.softCurrency} gems · Best W{progress.bestWave}</p>
        <div className="run-summary-actions">
          {isDefeat ? (
            <button
              type="button"
              className="run-summary-btn run-summary-btn--primary"
              onClick={() => {
                dismissRunEndSummary();
                gameBridge.emit("restartRun");
              }}
            >
              Play again
            </button>
          ) : null}
          <button
            type="button"
            className={`run-summary-btn ${isDefeat ? "" : "run-summary-btn--primary"}`}
            onClick={() => {
              dismissRunEndSummary();
              setActiveScreen("home");
            }}
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}

function CollectionScreen({ navigateTo }: { navigateTo: (screen: AppScreen) => void }) {
  return (
    <section className="content-screen">
      <ScreenHeader icon={Archive} title="Collection" />
      <div className="screen-grid">
        <MenuTile icon={Castle} label={`${gameContent.buildings.length} buildings`} onClick={() => navigateTo("buildings")} />
        <MenuTile icon={User} label={`${gameContent.heroes.length} heroes`} onClick={() => navigateTo("heroes")} />
        <MenuTile icon={Skull} label={`${gameContent.enemies.length} enemies`} onClick={() => navigateTo("enemies")} />
        <MenuTile icon={Map} label={`${gameContent.maps.length} maps`} onClick={() => navigateTo("maps")} />
        <MenuTile icon={Trophy} label={`${gameContent.troops.length} troops`} onClick={() => navigateTo("troops")} />
        <MenuTile
          icon={Sparkles}
          label={`Run upgrades (${gameContent.upgrades.length})`}
          onClick={() => navigateTo("run-upgrades")}
        />
      </div>
    </section>
  );
}

function BuildingsCatalogScreen() {
  return (
    <section className="content-screen">
      <ScreenHeader icon={Castle} title="Buildings" />
      <p className="screen-lead">Tier 1 base stats. Pad upgrades cost 25 coins per tier in a run.</p>
      <div className="card-list">
        {buildingDefinitions.map((building) => (
          <CatalogEntityCard
            key={building.id}
            itemId={building.id}
            category="building"
            tint={building.color}
            role={building.role}
            name={building.name}
            description={building.description}
            badge={building.role}
            stats={getBuildingCatalogStats(building)}
          />
        ))}
      </div>
    </section>
  );
}

function EnemiesCatalogScreen() {
  return (
    <section className="content-screen">
      <ScreenHeader icon={Skull} title="Enemies" />
      <p className="screen-lead">Base stats at spawn. HP gains +5 per wave; fort leak uses ×0.55 in runs.</p>
      <div className="card-list">
        {enemyDefinitions.map((enemy) => (
          <CatalogEntityCard
            key={enemy.id}
            itemId={enemy.id}
            category="enemy"
            tint={enemy.color}
            name={enemy.name}
            description={enemy.description}
            badge={enemy.archetype}
            stats={getEnemyCatalogStats(enemy)}
          />
        ))}
      </div>
    </section>
  );
}

function TroopsCatalogScreen() {
  return (
    <section className="content-screen">
      <ScreenHeader icon={Trophy} title="Troops" />
      <p className="screen-lead">Barracks spawns these by tier. In-run HP/damage scale with barracks tier.</p>
      <div className="card-list">
        {troopDefinitions.map((troop) => (
          <CatalogEntityCard
            key={troop.id}
            itemId={troop.id}
            category="troop"
            name={troop.name}
            description={troop.description}
            badge={troop.role}
            stats={getTroopCatalogStats(troop)}
          />
        ))}
      </div>
    </section>
  );
}

function CatalogEntityCard({
  itemId,
  category,
  tint,
  role,
  name,
  description,
  badge,
  stats,
}: {
  itemId: string;
  category: "building" | "enemy" | "troop";
  tint?: number;
  role?: string;
  name: string;
  description: string;
  badge: string;
  stats: ReturnType<typeof getBuildingCatalogStats>;
}) {
  return (
    <article className="content-card content-card--stats">
      <CatalogThumb itemId={itemId} category={category} tint={tint} role={role} />
      <div>
        <h3>{name}</h3>
        <p>{description}</p>
        <span>{badge}</span>
        <CatalogStatGrid stats={stats} />
      </div>
    </article>
  );
}

function RunUpgradesScreen() {
  return (
    <section className="content-screen">
      <ScreenHeader icon={Sparkles} title="Run Upgrades" />
      <p className="screen-lead">
        Roguelike picks during a run (boss waves). Use the bottom nav <strong>Upgrades</strong> tab for permanent gem purchases.
      </p>
      <div className="card-list">
        {upgradeDefinitions.map((upgrade) => (
          <article className="content-card content-card--stats" key={upgrade.id}>
            <div className={`card-token upgrade-token rarity-${upgrade.rarity}`}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3>{upgrade.name}</h3>
              <p>{upgrade.description}</p>
              <span>{upgrade.rarity}</span>
              <CatalogStatGrid stats={getUpgradeCatalogStats(upgrade)} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function HeroesScreen() {
  const progress = useGameStore((state) => state.progress);
  const selectHero = useGameStore((state) => state.selectHero);

  return (
    <section className="content-screen">
      <ScreenHeader icon={User} title="Heroes" />
      <p className="screen-lead">Passive bonuses apply at run start. Ability cooldowns are in seconds.</p>
      <div className="card-list">
        {heroDefinitions.map((hero) => {
          const unlockWave = getUnlockWave(hero.unlock);
          const isUnlocked = progress.bestWave >= unlockWave;
          const isSelected = progress.selectedHeroId === hero.id;
          return (
            <article
              className={`content-card content-card--stats selectable-card ${isSelected ? "selected" : ""} ${isUnlocked ? "" : "locked"}`}
              key={hero.id}
            >
              <CatalogThumb itemId={hero.id} category="hero" tint={hero.color} />
              <div>
                <h3>{hero.name}</h3>
                <p>{hero.description}</p>
                <span>{isUnlocked ? hero.role : formatUnlockLabel(hero.unlock, progress.bestWave)}</span>
                <CatalogStatGrid stats={getHeroCatalogStats(hero)} />
                <button className="select-button" type="button" disabled={!isUnlocked} onClick={() => selectHero(hero.id, unlockWave)}>
                  {isSelected ? "Selected" : isUnlocked ? "Select" : "Locked"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MapsScreen() {
  const progress = useGameStore((state) => state.progress);
  const selectMap = useGameStore((state) => state.selectMap);

  return (
    <section className="content-screen">
      <ScreenHeader icon={Map} title="Maps" />
      <div className="card-list">
        {mapDefinitions.map((map) => {
          const unlockWave = getUnlockWave(map.unlock);
          const isUnlocked = DEBUG_UNLOCK_ALL_MAPS || progress.bestWave >= unlockWave;
          const isSelected = progress.selectedMapId === map.id;
          return (
            <article className={`content-card selectable-card ${isSelected ? "selected" : ""} ${isUnlocked ? "" : "locked"}`} key={map.id}>
              <div className="card-token map-token" style={{ backgroundColor: map.palette.ground }}>
                <span style={{ backgroundColor: map.palette.path, borderColor: map.palette.accent }} />
              </div>
              <div>
                <h3>{map.name}</h3>
                <p>{map.description}</p>
                <span>
                  {isUnlocked
                    ? `${map.theme} · ${map.routeCount} lanes`
                    : formatUnlockLabel(map.unlock, progress.bestWave)}
                </span>
                <button className="select-button" type="button" disabled={!isUnlocked} onClick={() => selectMap(map.id, unlockWave)}>
                  {isSelected ? "Selected" : isUnlocked ? "Select" : "Locked"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SettingsScreen() {
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const musicEnabled = useGameStore((state) => state.musicEnabled);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const toggleMusic = useGameStore((state) => state.toggleMusic);
  const resetProgress = useGameStore((state) => state.resetProgress);
  const setActiveScreen = useGameStore((state) => state.setActiveScreen);

  return (
    <section className="content-screen">
      <ScreenHeader icon={Cog} title="Settings" />
      <button className="setting-row" type="button" onClick={toggleSound}>
        <span>SFX</span>
        <strong>{soundEnabled ? "On" : "Off"}</strong>
      </button>
      <button className="setting-row" type="button" onClick={toggleMusic}>
        <span>Music</span>
        <strong>{musicEnabled ? "On" : "Off"}</strong>
      </button>
      {import.meta.env.DEV ? (
        <button className="setting-row" type="button" onClick={() => setActiveScreen("deploy")}>
          <span>Deploy</span>
          <strong>Dev</strong>
        </button>
      ) : null}
      <div className="content-card">
        <div className="card-token">CC</div>
        <div>
          <h3>Asset credits</h3>
          <p>
            Runtime sprites use Kenney CC0 tower-defense art and project-owned SVGs under{" "}
            <code>public/assets/optimized/sprites/</code>. Full attribution:{" "}
            <a href="/assets/licenses/ASSET_CREDITS.md" target="_blank" rel="noreferrer">
              ASSET_CREDITS.md
            </a>
            .
          </p>
          <span>Kenney CC0 + project SVGs</span>
        </div>
      </div>
      <button className="danger-row" type="button" onClick={resetProgress}>
        <span>Reset local save</span>
        <strong>Reset</strong>
      </button>
    </section>
  );
}

function PermanentUpgradesScreen() {
  const progress = useGameStore((state) => state.progress);
  const buyPermanentUpgrade = useGameStore((state) => state.buyPermanentUpgrade);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <section className="content-screen">
      <ScreenHeader icon={Sparkles} title="Permanent Upgrades" />
      <div className="wallet-row">
        <span>Gems</span>
        <strong>{progress.softCurrency}</strong>
      </div>
      <p className="upgrade-hint">Clear waves to bank gems; fort loss adds a completion bonus.</p>
      {toast ? <p className="upgrade-toast" role="status">{toast}</p> : null}
      <div className="card-list">
        {permanentUpgradeDefinitions.map((upgrade) => {
          const level = progress.permanentUpgrades[upgrade.id];
          const cost = upgrade.baseCost + level * upgrade.baseCost;
          const canAfford = progress.softCurrency >= cost;
          return (
            <button
              className={`upgrade-row ${canAfford ? "" : "cant-afford"}`}
              key={upgrade.id}
              type="button"
              onClick={() => {
                if (!canAfford) {
                  setToast(`Need ${cost} gems — clear waves to earn more`);
                  return;
                }
                const didBuy = buyPermanentUpgrade(upgrade.id as PermanentUpgradeId);
                setToast(didBuy ? `${upgrade.name} upgraded to Lv ${level + 1}` : null);
              }}
            >
              <div>
                <h3>{upgrade.name}</h3>
                <p>{upgrade.description}</p>
                <span>Level {level}</span>
                <CatalogStatGrid stats={getPermanentUpgradeCatalogStats(upgrade)} />
              </div>
              <strong>{canAfford ? cost : `${cost} gems`}</strong>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DeployScreen() {
  return (
    <section className="content-screen">
      <ScreenHeader icon={Rocket} title="Deploy" />
      <div className="card-list">
        <DeployCard icon={Cloud} title="Vercel" text="Frontend static deployment from dist." />
        <DeployCard icon={Database} title="Supabase" text="Auth, saves, leaderboard, inventory, and remote config migration included." />
        <DeployCard icon={Hammer} title="Render" text="Optional API service blueprint with a health endpoint." />
      </div>
    </section>
  );
}

function ScreenHeader({ icon: Icon, title }: { icon: typeof Home; title: string }) {
  return (
    <header className="screen-header">
      <Icon size={20} />
      <h2>{title}</h2>
    </header>
  );
}

function MenuTile({ icon: Icon, label, onClick }: { icon: typeof Home; label: string; onClick: () => void }) {
  return (
    <button className="menu-tile" type="button" onClick={onClick}>
      <Icon size={22} />
      <span>{label}</span>
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusCard({ icon: Icon, label, value }: { icon: typeof Home; label: string; value: string }) {
  return (
    <div className="status-card">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DeployCard({ icon: Icon, title, text }: { icon: typeof Home; title: string; text: string }) {
  return (
    <article className="content-card">
      <div className="card-token">
        <Icon size={19} />
      </div>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
        <span>configured</span>
      </div>
    </article>
  );
}

function screenTitle(screen: AppScreen) {
  if (screen === "run-upgrades") return "Run upgrades";
  return screen.charAt(0).toUpperCase() + screen.slice(1);
}



