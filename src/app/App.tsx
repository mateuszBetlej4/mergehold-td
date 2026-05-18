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
import { mapDefinitions } from "../data/maps";
import { troopDefinitions } from "../data/troops";
import { GameCanvas } from "../game/GameCanvas";
import { PlayHud } from "./PlayHud";
import {
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

export function App() {
  const activeScreen = useGameStore((state) => state.activeScreen);
  const setActiveScreen = useGameStore((state) => state.setActiveScreen);

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
          <button type="button" onClick={() => setActiveScreen("settings")} aria-label="Open settings">
            <Cog size={18} />
          </button>
        </div>

        <div className={`screen-body ${activeScreen === "play" ? "is-play" : ""}`}>
          {renderScreen(activeScreen, setActiveScreen)}
        </div>

        <nav className="bottom-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={activeScreen === item.screen ? "active" : ""}
                key={item.screen}
                type="button"
                onClick={() => setActiveScreen(item.screen)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
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

function renderScreen(screen: AppScreen, setActiveScreen: (screen: AppScreen) => void) {
  switch (screen) {
    case "play":
      return <PlayScreen />;
    case "upgrades":
      return <PermanentUpgradesScreen />;
    case "collection":
      return <CollectionScreen setActiveScreen={setActiveScreen} />;
    case "buildings":
      return <CardsScreen title="Buildings" icon={Castle} items={buildingDefinitions} />;
    case "heroes":
      return <HeroesScreen />;
    case "troops":
      return <CardsScreen title="Troops" icon={Trophy} items={troopDefinitions} />;
    case "enemies":
      return <CardsScreen title="Enemies" icon={Skull} items={enemyDefinitions} />;
    case "maps":
      return <MapsScreen />;
    case "settings":
      return <SettingsScreen />;
    case "deploy":
      return <DeployScreen />;
    default:
      return <HomeScreen setActiveScreen={setActiveScreen} />;
  }
}

function HomeScreen({ setActiveScreen }: { setActiveScreen: (screen: AppScreen) => void }) {
  const run = useGameStore((state) => state.run);
  const progress = useGameStore((state) => state.progress);
  const selectedHero = heroDefinitions.find((hero) => hero.id === progress.selectedHeroId) ?? heroDefinitions[0];
  const selectedMap = mapDefinitions.find((map) => map.id === progress.selectedMapId) ?? mapDefinitions[0];

  return (
    <section className="home-screen">
      <div className="hero-card">
        <Shield size={34} />
        <h2>Guard the pass</h2>
        <p>Build, merge, survive waves, and grow your fort between runs.</p>
        <button type="button" onClick={() => setActiveScreen("play")}>
          Start run
        </button>
      </div>

      <div className="quick-stats">
        <Metric label="Best" value={`Wave ${progress.bestWave}`} />
        <Metric label="Gems" value={String(progress.softCurrency)} />
        <Metric label="Run" value={`W${run.wave}`} />
      </div>

      <div className="loadout-strip">
        <button type="button" onClick={() => setActiveScreen("heroes")}>
          <span>Hero</span>
          <strong>{selectedHero.name}</strong>
        </button>
        <button type="button" onClick={() => setActiveScreen("maps")}>
          <span>Map</span>
          <strong>{selectedMap.name}</strong>
        </button>
      </div>

      <div className="screen-grid two">
        <MenuTile icon={Sparkles} label="Permanent Upgrades" onClick={() => setActiveScreen("upgrades")} />
        <MenuTile icon={Castle} label="Buildings" onClick={() => setActiveScreen("buildings")} />
        <MenuTile icon={User} label="Heroes" onClick={() => setActiveScreen("heroes")} />
        <MenuTile icon={Skull} label="Enemies" onClick={() => setActiveScreen("enemies")} />
        <MenuTile icon={Rocket} label="Deploy" onClick={() => setActiveScreen("deploy")} />
      </div>
    </section>
  );
}

function PlayScreen() {
  return (
    <section className="play-screen">
      <GameCanvas />
      <PlayHud />
    </section>
  );
}

function CollectionScreen({ setActiveScreen }: { setActiveScreen: (screen: AppScreen) => void }) {
  return (
    <section className="content-screen">
      <ScreenHeader icon={Archive} title="Collection" />
      <div className="screen-grid">
        <MenuTile icon={Castle} label={`${gameContent.buildings.length} buildings`} onClick={() => setActiveScreen("buildings")} />
        <MenuTile icon={User} label={`${gameContent.heroes.length} heroes`} onClick={() => setActiveScreen("heroes")} />
        <MenuTile icon={Skull} label={`${gameContent.enemies.length} enemies`} onClick={() => setActiveScreen("enemies")} />
        <MenuTile icon={Map} label={`${gameContent.maps.length} maps`} onClick={() => setActiveScreen("maps")} />
        <MenuTile icon={Trophy} label={`${gameContent.troops.length} troops`} onClick={() => setActiveScreen("troops")} />
        <MenuTile icon={Sparkles} label={`${gameContent.upgrades.length} upgrades`} onClick={() => setActiveScreen("upgrades")} />
      </div>
    </section>
  );
}

function CardsScreen({ title, icon: Icon, items }: { title: string; icon: typeof Home; items: Array<Record<string, unknown>> }) {
  return (
    <section className="content-screen">
      <ScreenHeader icon={Icon} title={title} />
      <div className="card-list">
        {items.map((item) => (
          <article className="content-card" key={String(item.id)}>
            <div className="card-token">{String(item.icon ?? item.name).slice(0, 1)}</div>
            <div>
              <h3>{String(item.name)}</h3>
              <p>{String(item.description ?? item.ability ?? item.unlock ?? "Ready for tuning.")}</p>
              <span>{String(item.role ?? item.archetype ?? item.rarity ?? item.theme ?? "starter")}</span>
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
      <div className="card-list">
        {heroDefinitions.map((hero) => {
          const unlockWave = getUnlockWave(hero.unlock);
          const isUnlocked = progress.bestWave >= unlockWave;
          const isSelected = progress.selectedHeroId === hero.id;
          return (
            <article className={`content-card selectable-card ${isSelected ? "selected" : ""} ${isUnlocked ? "" : "locked"}`} key={hero.id}>
              <div className="card-token" style={{ backgroundColor: `#${hero.color.toString(16).padStart(6, "0")}` }}>
                {hero.name.slice(0, 1)}
              </div>
              <div>
                <h3>{hero.name}</h3>
                <p>{hero.ability}: {hero.description}</p>
                <span>{isUnlocked ? hero.role : hero.unlock}</span>
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
          const isUnlocked = progress.bestWave >= unlockWave;
          const isSelected = progress.selectedMapId === map.id;
          return (
            <article className={`content-card selectable-card ${isSelected ? "selected" : ""} ${isUnlocked ? "" : "locked"}`} key={map.id}>
              <div className="card-token map-token" style={{ backgroundColor: map.palette.ground }}>
                <span style={{ backgroundColor: map.palette.path, borderColor: map.palette.accent }} />
              </div>
              <div>
                <h3>{map.name}</h3>
                <p>{map.description}</p>
                <span>{isUnlocked ? map.theme : map.unlock}</span>
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
      <div className="content-card">
        <div className="card-token">CC</div>
        <div>
          <h3>Asset credits</h3>
          <p>Runtime assets are currently procedural placeholders. Imported packs must be logged in asset credits.</p>
          <span>public/assets/licenses</span>
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

  return (
    <section className="content-screen">
      <ScreenHeader icon={Sparkles} title="Permanent Upgrades" />
      <div className="wallet-row">
        <span>Gems</span>
        <strong>{progress.softCurrency}</strong>
      </div>
      <div className="card-list">
        {permanentUpgradeDefinitions.map((upgrade) => {
          const level = progress.permanentUpgrades[upgrade.id];
          const cost = upgrade.baseCost + level * upgrade.baseCost;
          const canAfford = progress.softCurrency >= cost;
          return (
            <button
              className={`upgrade-row ${canAfford ? "" : "locked"}`}
              key={upgrade.id}
              type="button"
              onClick={() => buyPermanentUpgrade(upgrade.id as PermanentUpgradeId)}
            >
              <div>
                <h3>{upgrade.name}</h3>
                <p>{upgrade.description}</p>
                <span>Level {level}</span>
              </div>
              <strong>{canAfford ? cost : `${cost}`}</strong>
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
  return screen.charAt(0).toUpperCase() + screen.slice(1);
}

function getUnlockWave(unlock: string) {
  const match = unlock.match(/\d+/);
  return match ? Number(match[0]) : 1;
}
