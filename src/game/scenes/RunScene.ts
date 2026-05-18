import Phaser from "phaser";
import { buildingDefinitions } from "../../data/buildings";
import { enemyDefinitions, type EnemyDefinition } from "../../data/enemies";
import { heroDefinitions } from "../../data/heroes";
import { mapDefinitions } from "../../data/maps";
import { troopDefinitions, type TroopDefinition } from "../../data/troops";
import { upgradeDefinitions, type UpgradeDefinition } from "../../data/upgrades";
import { getWaveSpawnGroups } from "../../data/waves";
import { useGameStore } from "../../state/useGameStore";
import {
  gameBridge,
  type RunBuildMode,
  type RunDockTab,
  type RunUiStruct,
} from "../gameBridge";

type DamageSource = "archer" | "cannon" | "magic" | "trap" | "troop" | "hero" | "other";

type Enemy = {
  body: Phaser.GameObjects.Image;
  hpBar: Phaser.GameObjects.Rectangle;
  pathIndex: number;
  enemyId: string;
  archetype: EnemyDefinition["archetype"];
  hp: number;
  maxHp: number;
  speed: number;
  reward: number;
  damageToFort: number;
  tint: number;
  isBoss: boolean;
  facingOffset: number;
};

type Tower = {
  body: Phaser.GameObjects.Image;
  badgeBg: Phaser.GameObjects.Arc;
  badge: Phaser.GameObjects.Text;
  towerId: string;
  tier: number;
  damage: number;
  range: number;
  fireRateMs: number;
  lastShotAt: number;
};

type Projectile = {
  body: Phaser.GameObjects.Image;
  target: Enemy;
  towerId: string;
  damage: number;
  speed: number;
};

type Trap = {
  body: Phaser.GameObjects.Image;
  badgeBg: Phaser.GameObjects.Arc;
  badge: Phaser.GameObjects.Text;
  tier: number;
  damage: number;
  cooldownMs: number;
  triggerRadius: number;
  lastTriggeredAt: number;
};

type Barracks = {
  body: Phaser.GameObjects.Image;
  badgeBg: Phaser.GameObjects.Arc;
  badge: Phaser.GameObjects.Text;
  tier: number;
  spawnRateMs: number;
  lastSpawnAt: number;
};

type CoinMill = {
  body: Phaser.GameObjects.Image;
  badgeBg: Phaser.GameObjects.Arc;
  badge: Phaser.GameObjects.Text;
  tier: number;
};

type StoneWall = {
  body: Phaser.GameObjects.Image;
  badgeBg: Phaser.GameObjects.Arc;
  badge: Phaser.GameObjects.Text;
  tier: number;
};

type HealingShrine = {
  body: Phaser.GameObjects.Image;
  badgeBg: Phaser.GameObjects.Arc;
  badge: Phaser.GameObjects.Text;
  tier: number;
};

type FriendlyTroop = {
  body: Phaser.GameObjects.Image;
  hpBar: Phaser.GameObjects.Rectangle;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  attackRange: number;
  attackCooldownMs: number;
  lastAttackAt: number;
  lastHurtAt: number;
  role: TroopDefinition["role"];
  tint: number;
};

const path = [
  new Phaser.Math.Vector2(195, 28),
  new Phaser.Math.Vector2(195, 108),
  new Phaser.Math.Vector2(96, 200),
  new Phaser.Math.Vector2(286, 300),
  new Phaser.Math.Vector2(195, 448),
];

const starterTowers = buildingDefinitions.filter((building) => building.role === "tower").slice(0, 3);
const spikeTrapDefinition =
  buildingDefinitions.find((building) => building.id === "spike-trap") ?? buildingDefinitions[3];
const barracksDefinition =
  buildingDefinitions.find((building) => building.id === "barracks") ?? buildingDefinitions[4];
const coinMillDefinition =
  buildingDefinitions.find((building) => building.id === "coin-mill") ?? buildingDefinitions[5];
const stoneWallDefinition =
  buildingDefinitions.find((building) => building.id === "stone-wall") ?? buildingDefinitions[6];
const healingShrineDefinition =
  buildingDefinitions.find((building) => building.id === "healing-shrine") ?? buildingDefinitions[7];

const maxFriendlyTroops = 10;

const trapPadPositions: [number, number][] = [
  [168, 82],
  [72, 188],
  [318, 288],
  [248, 372],
  [168, 418],
];

const towerAssetKeys: Record<string, string> = {
  "archer-tower": "kenney-tower-archer",
  "cannon-tower": "kenney-tower-cannon",
  "magic-tower": "kenney-tower-magic",
};

const enemyAssetKeys: Record<string, string> = {
  grunt: "kenney-enemy-grunt",
  runner: "kenney-enemy-runner",
  tank: "kenney-enemy-tank",
  shield: "kenney-enemy-shield",
  bat: "enemy-runner",
  bomber: "enemy-grunt",
  gatebreaker: "kenney-enemy-boss",
};

const projectileAssetKeys: Record<string, string> = {
  "archer-tower": "projectile-arrow",
  "cannon-tower": "kenney-projectile",
  "magic-tower": "kenney-projectile",
};

const troopRoleTints: Record<TroopDefinition["role"], number> = {
  blocker: 0x546a7b,
  ranged: 0x2f5d8c,
  burst: 0xb85c38,
};

const groundTileSize = 64;
const pathDotSpacing = 26;

/** Added to Phaser aim angle so texture "forward" matches target (0° = east in Phaser). */
const spriteFacingOffset: Record<string, number> = {
  "kenney-tower-archer": Math.PI / 2,
  "kenney-tower-cannon": Math.PI / 2,
  "kenney-tower-magic": 0,
  "kenney-enemy-grunt": 0,
  "kenney-enemy-runner": 0,
  "kenney-enemy-tank": 0,
  "kenney-enemy-shield": 0,
  "kenney-enemy-boss": Math.PI / 2,
  "enemy-grunt": Math.PI / 2,
  "enemy-runner": Math.PI / 2,
  "projectile-arrow": 0,
  "hero-guardian": Math.PI / 2,
};

const rotationTurnSpeed = 0.045;

export class RunScene extends Phaser.Scene {
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private towerSlots: Phaser.GameObjects.Rectangle[] = [];
  private trapSlots: Phaser.GameObjects.Rectangle[] = [];
  private towers: Tower[] = [];
  private traps: Trap[] = [];
  private barracks: Barracks[] = [];
  private coinMills: CoinMill[] = [];
  private stoneWalls: StoneWall[] = [];
  private healingShrines: HealingShrine[] = [];
  private friendlyTroops: FriendlyTroop[] = [];
  private selectedBuildMode: RunBuildMode = "tower";
  private dockTab: RunDockTab = "towers";
  private toastMessage = "";
  private fortHp = 180;
  private maxFortHp = 180;
  private fortShieldMax = 0;
  private fortShieldRemaining = 0;
  private waveReadyForClear = false;
  private waitingToStartWave = false;
  private coins = 150;
  private wave = 1;
  private isGameOver = false;
  private isPaused = false;
  private runSpeed = 1;
  private isChoosingUpgrade = false;
  private selectedTowerIndex = 0;
  private towerDamageMultiplier = 1;
  private fireRateMultiplier = 1;
  private rewardMultiplier = 1;
  private cannonSplashBonus = 0;
  private magicPrioritizeArmored = false;
  private runRewardClaimed = false;
  private highestClearedWave = 0;
  private lastMetaWaveRewarded = 0;
  private selectedHeroRole: "guardian" | "ranger" | "mage" = "guardian";
  private selectedHeroAbility = "Fort Shield";
  private heroCooldownMs = 18000;
  private nextHeroAbilityAt = 0;
  private heroTint = 0x4a5759;
  private upgradeOverlay?: Phaser.GameObjects.Container;
  private palette = {
    ground: 0x83a96d,
    path: 0xd9c59f,
    hud: 0x17202b,
  };

  constructor() {
    super("RunScene");
  }

  preload() {
    this.load.svg("fort", "/assets/optimized/sprites/fort.svg", { width: 128, height: 128 });
    this.load.svg("hero-guardian", "/assets/optimized/sprites/hero-guardian.svg", { width: 96, height: 96 });
    this.load.image("kenney-tower-archer", "/assets/optimized/sprites/kenney-tower-archer.png");
    this.load.image("kenney-tower-cannon", "/assets/optimized/sprites/kenney-tower-cannon.png");
    this.load.image("kenney-tower-magic", "/assets/optimized/sprites/kenney-tower-magic.png");
    this.load.image("kenney-enemy-grunt", "/assets/optimized/sprites/kenney-enemy-grunt.png");
    this.load.image("kenney-enemy-runner", "/assets/optimized/sprites/kenney-enemy-runner.png");
    this.load.image("kenney-enemy-tank", "/assets/optimized/sprites/kenney-enemy-tank.png");
    this.load.image("kenney-enemy-shield", "/assets/optimized/sprites/kenney-enemy-shield.png");
    this.load.image("kenney-enemy-boss", "/assets/optimized/sprites/kenney-enemy-boss.png");
    this.load.image("kenney-tree", "/assets/optimized/sprites/kenney-tree.png");
    this.load.image("kenney-grass", "/assets/optimized/sprites/kenney-grass.png");
    this.load.image("kenney-path-dot", "/assets/optimized/sprites/kenney-path-dot.png");
    this.load.image("kenney-projectile", "/assets/optimized/sprites/kenney-projectile.png");
    this.load.svg("enemy-runner", "/assets/optimized/sprites/enemy-runner.svg", { width: 64, height: 64 });
    this.load.svg("enemy-grunt", "/assets/optimized/sprites/enemy-grunt.svg", { width: 64, height: 64 });
    this.load.svg("projectile-arrow", "/assets/optimized/sprites/projectile-arrow.svg", { width: 32, height: 32 });
    this.load.svg("spike-trap", "/assets/optimized/sprites/spike-trap.svg", { width: 64, height: 64 });
    this.load.svg("barracks", "/assets/optimized/sprites/barracks.svg", { width: 64, height: 64 });
    this.load.svg("coin-mill", "/assets/optimized/sprites/coin-mill.svg", { width: 64, height: 64 });
    this.load.svg("stone-wall", "/assets/optimized/sprites/stone-wall.svg", { width: 64, height: 64 });
    this.load.svg("healing-shrine", "/assets/optimized/sprites/healing-shrine.svg", { width: 64, height: 64 });
  }

  create() {
    useGameStore.getState().beginRun();
    this.applyLoadout();
    this.drawMap();
    this.bindGameBridge();
    this.syncTimeScale();
    this.createBuildSlots();
    this.createTrapSlots();
    this.createHero();
    this.publishRunUiState();
    this.showToast("Pick a tower, then tap a + pad");
    this.spawnWave();

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.tryBuildOrMerge(pointer.x, pointer.y);
    });
  }

  update(time: number, delta: number) {
    if (this.isGameOver) return;

    if (this.isChoosingUpgrade || this.isPaused) {
      this.updateHud();
      return;
    }

    this.tryCompleteWave();

    this.moveEnemies(delta);
    this.triggerTraps(time);
    this.spawnBarracksTroops(time);
    this.updateFriendlyTroops(time, delta);
    this.moveProjectiles(delta);
    this.aimTowers(delta);
    this.towers.forEach((tower) => this.shootNearestEnemy(tower, time));
    this.updateHud();
  }

  private drawMap() {
    this.drawGroundTiles();
    this.drawPathTiles();
    this.add.image(36, 104, "kenney-tree").setScale(0.72).setTint(this.palette.hud).setDepth(1);
    this.add.image(345, 104, "kenney-tree").setScale(0.64).setTint(this.palette.hud).setDepth(1);
    this.add.image(52, 526, "kenney-tree").setScale(0.6).setTint(this.palette.hud).setDepth(1);
    this.add.image(345, 565, "kenney-tree").setScale(0.74).setTint(this.palette.hud).setDepth(1);
    this.add.image(195, 500, "fort").setScale(0.78).setDepth(12);
  }

  private drawGroundTiles() {
    const cols = Math.ceil(390 / groundTileSize);
    const rows = Math.ceil(694 / groundTileSize);

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = col * groundTileSize + groundTileSize / 2;
        const y = row * groundTileSize + groundTileSize / 2;
        this.add
          .image(x, y, "kenney-grass")
          .setDisplaySize(groundTileSize + 1, groundTileSize + 1)
          .setTint(this.palette.ground)
          .setAlpha(0.9)
          .setDepth(0);
      }
    }
  }

  private drawPathTiles() {
    for (let index = 0; index < path.length - 1; index += 1) {
      const start = path[index];
      const end = path[index + 1];
      const segmentLength = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y);
      const steps = Math.max(1, Math.floor(segmentLength / pathDotSpacing));

      for (let step = 0; step <= steps; step += 1) {
        const t = step / steps;
        const x = Phaser.Math.Linear(start.x, end.x, t);
        const y = Phaser.Math.Linear(start.y, end.y, t);
        this.add
          .image(x, y, "kenney-path-dot")
          .setScale(0.42)
          .setTint(this.palette.path)
          .setAlpha(0.88)
          .setDepth(2);
      }
    }
  }

  private bindGameBridge() {
    const onTogglePause = () => this.togglePause();
    const onToggleSpeed = () => this.toggleRunSpeed();
    const onStartWave = () => this.beginNextWave();
    const onSetDockTab = (tab: unknown) => {
      if (tab !== "towers" && tab !== "support") return;
      this.dockTab = tab as RunDockTab;
      if (tab === "towers") {
        this.selectedBuildMode = "tower";
      }
      this.publishRunUiState();
    };
    const onSelectTower = (index: unknown) => this.selectTower(Number(index));
    const onSelectStruct = (mode: unknown) => {
      if (typeof mode !== "string") return;
      if (mode === "trap") this.selectTrap();
      if (mode === "mill") this.selectCoinMill();
      if (mode === "barracks") this.selectBarracks();
      if (mode === "wall") this.selectStoneWall();
      if (mode === "shrine") this.selectHealingShrine();
    };
    const onUseAbility = () => this.useHeroAbility();
    const onRestartRun = () => {
      if (!this.isGameOver) return;
      useGameStore.getState().dismissRunEndSummary();
      this.scene.restart();
    };

    gameBridge.on("togglePause", onTogglePause);
    gameBridge.on("toggleSpeed", onToggleSpeed);
    gameBridge.on("startWave", onStartWave);
    gameBridge.on("setDockTab", onSetDockTab);
    gameBridge.on("selectTower", onSelectTower);
    gameBridge.on("selectStruct", onSelectStruct);
    gameBridge.on("useAbility", onUseAbility);
    gameBridge.on("restartRun", onRestartRun);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameBridge.off("togglePause", onTogglePause);
      gameBridge.off("toggleSpeed", onToggleSpeed);
      gameBridge.off("startWave", onStartWave);
      gameBridge.off("setDockTab", onSetDockTab);
      gameBridge.off("selectTower", onSelectTower);
      gameBridge.off("selectStruct", onSelectStruct);
      gameBridge.off("useAbility", onUseAbility);
      gameBridge.off("restartRun", onRestartRun);
    });
  }

  private publishRunUiState() {
    const remainingMs = this.nextHeroAbilityAt - this.time.now;
    const abilityReady = remainingMs <= 0;

    const structs: RunUiStruct[] = [
      { mode: "trap", def: spikeTrapDefinition, sprite: "spike-trap" },
      { mode: "mill", def: coinMillDefinition, sprite: "coin-mill" },
      { mode: "barracks", def: barracksDefinition, sprite: "barracks" },
      { mode: "wall", def: stoneWallDefinition, sprite: "stone-wall" },
      { mode: "shrine", def: healingShrineDefinition, sprite: "healing-shrine" },
    ].map(({ mode, def, sprite }) => ({
      mode: mode as RunUiStruct["mode"],
      id: def.id,
      name: def.name,
      icon: def.icon,
      cost: def.baseCost,
      color: def.color,
      sprite,
      unlockWave: def.unlockWave,
      unlocked: this.wave >= def.unlockWave,
      selected: this.selectedBuildMode === mode,
    }));

    gameBridge.emit("state", {
      fortHp: this.fortHp,
      maxFortHp: this.maxFortHp,
      fortShieldMax: this.fortShieldMax,
      fortShieldRemaining: this.fortShieldRemaining,
      wave: this.wave,
      highestClearedWave: this.highestClearedWave,
      coins: this.coins,
      isGameOver: this.isGameOver,
      isPaused: this.isPaused,
      runSpeed: this.runSpeed,
      waitingToStartWave: this.waitingToStartWave,
      isChoosingUpgrade: this.isChoosingUpgrade,
      abilityLabel: this.selectedHeroAbility,
      abilityReady,
      abilityCooldownSec: abilityReady ? 0 : Math.ceil(remainingMs / 1000),
      dockTab: this.dockTab,
      buildMode: this.selectedBuildMode,
      towers: starterTowers.map((tower, index) => ({
        index,
        id: tower.id,
        name: tower.name,
        icon: tower.icon,
        cost: tower.baseCost,
        color: tower.color,
        sprite: towerAssetKeys[tower.id] ?? "kenney-tower-archer",
        selected: this.selectedBuildMode === "tower" && this.selectedTowerIndex === index,
      })),
      structs,
      toast: this.toastMessage,
    });
  }

  private togglePause() {
    if (this.isGameOver || this.isChoosingUpgrade) return;

    this.isPaused = !this.isPaused;
    this.syncTimeScale();
    this.publishRunUiState();
    this.showToast(this.isPaused ? "Run paused" : "Run resumed");
  }

  private toggleRunSpeed() {
    if (this.isGameOver || this.isChoosingUpgrade || this.isPaused) {
      this.showToast(this.isPaused ? "Resume to change speed" : "Speed locked during upgrades");
      return;
    }

    this.runSpeed = this.runSpeed === 1 ? 1.5 : 1;
    this.syncTimeScale();
    this.publishRunUiState();
    this.showToast(`Speed ${this.runSpeed}x`);
  }

  private syncTimeScale() {
    if (this.isGameOver) {
      this.time.timeScale = 1;
      return;
    }

    if (this.isPaused || this.isChoosingUpgrade) {
      this.time.timeScale = 0;
      return;
    }

    this.time.timeScale = this.runSpeed;
  }

  private createBuildSlots() {
    const slots = [
      [98, 128],
      [292, 142],
      [75, 318],
      [315, 408],
      [124, 448],
      [278, 228],
    ];

    slots.forEach(([x, y]) => {
      const slot = this.add.circle(x, y, 26, 0xffffff, 0.12)
        .setStrokeStyle(2, 0xffffff, 0.35)
        .setDepth(3)
        .setInteractive({ useHandCursor: true });

      this.towerSlots.push(slot as unknown as Phaser.GameObjects.Rectangle);
      this.add.circle(x, y, 4, 0xffffff, 0.45).setDepth(4);
    });
  }

  private createTrapSlots() {
    trapPadPositions.forEach(([x, y]) => {
      const slot = this.add.circle(x, y, 18, 0x17202b, 0.22)
        .setStrokeStyle(1.5, 0xffffff, 0.28)
        .setDepth(3);

      this.trapSlots.push(slot as unknown as Phaser.GameObjects.Rectangle);
    });
  }

  private createHero() {
    this.add.image(195, 508, "hero-guardian").setScale(0.44).setTint(this.heroTint).setDepth(14);
  }

  private tryBuildOrMerge(x: number, y: number) {
    if (this.isChoosingUpgrade) return;

    if (this.isGameOver) return;

    const trapSlot = this.trapSlots.find((candidate) => {
      return Phaser.Math.Distance.Between(x, y, candidate.x, candidate.y) < 28;
    });

    if (trapSlot) {
      const existingTrap = this.traps.find((trap) => trap.body.x === trapSlot.x && trap.body.y === trapSlot.y);
      if (!existingTrap && this.selectedBuildMode !== "trap") {
        this.showToast("Select Spike Trap first");
        return;
      }
      this.tryBuildOrMergeTrap(trapSlot);
      return;
    }

    if (this.selectedBuildMode === "trap") {
      this.showToast("Tap a trap pad on the path");
      return;
    }

    const slot = this.towerSlots.find((candidate) => {
      return Phaser.Math.Distance.Between(x, y, candidate.x, candidate.y) < 32;
    });

    if (!slot) return;

    const existingCoinMill = this.coinMills.find((mill) => mill.body.x === slot.x && mill.body.y === slot.y);

    if (existingCoinMill) {
      this.tryBuildOrMergeCoinMill(slot);
      return;
    }

    const existingBarracks = this.barracks.find(
      (barracksBuilding) => barracksBuilding.body.x === slot.x && barracksBuilding.body.y === slot.y,
    );

    if (existingBarracks) {
      this.tryBuildOrMergeBarracks(slot);
      return;
    }

    const existingWall = this.stoneWalls.find((wall) => wall.body.x === slot.x && wall.body.y === slot.y);

    if (existingWall) {
      this.tryBuildOrMergeStoneWall(slot);
      return;
    }

    const existingShrine = this.healingShrines.find(
      (shrine) => shrine.body.x === slot.x && shrine.body.y === slot.y,
    );

    if (existingShrine) {
      this.tryBuildOrMergeHealingShrine(slot);
      return;
    }

    if (this.selectedBuildMode === "mill") {
      this.tryBuildOrMergeCoinMill(slot);
      return;
    }

    if (this.selectedBuildMode === "barracks") {
      this.tryBuildOrMergeBarracks(slot);
      return;
    }

    if (this.selectedBuildMode === "wall") {
      this.tryBuildOrMergeStoneWall(slot);
      return;
    }

    if (this.selectedBuildMode === "shrine") {
      this.tryBuildOrMergeHealingShrine(slot);
      return;
    }

    const existingTower = this.towers.find((tower) => tower.body.x === slot.x && tower.body.y === slot.y);

    if (existingTower) {
      if (this.selectedBuildMode !== "tower") {
        this.showToast("Build pad is occupied");
        return;
      }

      if (this.coins >= 15 && existingTower.tier < 5) {
        this.coins -= 15;
        existingTower.tier += 1;
        existingTower.damage += 8 * this.towerDamageMultiplier;
        existingTower.range += 4;
        existingTower.body.setScale(0.58 + existingTower.tier * 0.05);
        existingTower.badgeBg.setPosition(existingTower.body.x + 19, existingTower.body.y - 18);
        existingTower.badge.setPosition(existingTower.badgeBg.x, existingTower.badgeBg.y);
        existingTower.badge.setText(String(existingTower.tier));
        this.showToast(`${existingTower.tier === 5 ? "Max" : "Tier"} ${existingTower.tier} tower`);
      } else if (existingTower.tier >= 5) {
        this.showToast("Tower is already max tier");
      } else {
        this.showToast("Need 15 coins to upgrade");
      }
      return;
    }

    if (this.isPadOccupied(slot)) {
      this.showToast("Build pad is occupied");
      return;
    }

    const definition = starterTowers[this.selectedTowerIndex] ?? starterTowers[0];
    if (this.coins < definition.baseCost) {
      this.showToast(`Need ${definition.baseCost} coins`);
      return;
    }

    this.coins -= definition.baseCost;
    const body = this.add.image(slot.x, slot.y, towerAssetKeys[definition.id]).setScale(0.58).setDepth(8);
    const badgeBg = this.add.circle(slot.x + 19, slot.y - 18, 10, 0x17202b).setDepth(9);
    const badge = this.add.text(badgeBg.x, badgeBg.y, "1", {
      color: "#ffffff",
      fontFamily: "Arial",
      fontSize: "12px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(10);

    this.towers.push({
      body,
      badgeBg,
      badge,
      towerId: definition.id,
      tier: 1,
      damage: definition.stats.damage * this.towerDamageMultiplier,
      range: definition.stats.range,
      fireRateMs: Math.round(definition.stats.fireRateMs * this.fireRateMultiplier),
      lastShotAt: 0,
    });
    this.showToast(`${definition.name} built`);
  }

  private tryBuildOrMergeTrap(slot: Phaser.GameObjects.Rectangle) {
    if (this.wave < spikeTrapDefinition.unlockWave) {
      this.showToast(`Unlocks at wave ${spikeTrapDefinition.unlockWave}`);
      return;
    }

    const existingTrap = this.traps.find((trap) => trap.body.x === slot.x && trap.body.y === slot.y);

    if (existingTrap) {
      const maxTier = spikeTrapDefinition.maxTier;
      if (this.coins >= 15 && existingTrap.tier < maxTier) {
        this.coins -= 15;
        existingTrap.tier += 1;
        existingTrap.damage = spikeTrapDefinition.stats.damage * existingTrap.tier * this.towerDamageMultiplier;
        existingTrap.cooldownMs = Math.max(
          220,
          Math.round(spikeTrapDefinition.stats.cooldownMs / (1 + (existingTrap.tier - 1) * 0.2)),
        );
        existingTrap.triggerRadius = 34 + existingTrap.tier * 3;
        existingTrap.body.setScale(0.42 + existingTrap.tier * 0.05);
        existingTrap.badgeBg.setPosition(existingTrap.body.x + 16, existingTrap.body.y - 14);
        existingTrap.badge.setPosition(existingTrap.badgeBg.x, existingTrap.badgeBg.y);
        existingTrap.badge.setText(String(existingTrap.tier));
        this.showToast(`${existingTrap.tier === maxTier ? "Max" : "Tier"} ${existingTrap.tier} trap`);
      } else if (existingTrap.tier >= maxTier) {
        this.showToast("Trap is already max tier");
      } else {
        this.showToast("Need 15 coins to upgrade trap");
      }
      return;
    }

    if (this.coins < spikeTrapDefinition.baseCost) {
      this.showToast(`Need ${spikeTrapDefinition.baseCost} coins`);
      return;
    }

    this.coins -= spikeTrapDefinition.baseCost;
    const body = this.add.image(slot.x, slot.y, "spike-trap").setScale(0.42).setDepth(7);
    const badgeBg = this.add.circle(slot.x + 16, slot.y - 14, 9, 0x17202b).setDepth(8);
    const badge = this.add.text(badgeBg.x, badgeBg.y, "1", {
      color: "#ffffff",
      fontFamily: "Arial",
      fontSize: "11px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(9);

    this.traps.push({
      body,
      badgeBg,
      badge,
      tier: 1,
      damage: spikeTrapDefinition.stats.damage * this.towerDamageMultiplier,
      cooldownMs: spikeTrapDefinition.stats.cooldownMs,
      triggerRadius: 34,
      lastTriggeredAt: 0,
    });
    this.showToast(`${spikeTrapDefinition.name} armed`);
  }

  private isPadOccupied(slot: Phaser.GameObjects.Rectangle) {
    const hasTower = this.towers.some((tower) => tower.body.x === slot.x && tower.body.y === slot.y);
    const hasBarracks = this.barracks.some(
      (barracksBuilding) => barracksBuilding.body.x === slot.x && barracksBuilding.body.y === slot.y,
    );
    const hasMill = this.coinMills.some((mill) => mill.body.x === slot.x && mill.body.y === slot.y);
    const hasWall = this.stoneWalls.some((wall) => wall.body.x === slot.x && wall.body.y === slot.y);
    const hasShrine = this.healingShrines.some((shrine) => shrine.body.x === slot.x && shrine.body.y === slot.y);
    return hasTower || hasBarracks || hasMill || hasWall || hasShrine;
  }

  private tryBuildOrMergeCoinMill(slot: Phaser.GameObjects.Rectangle) {
    if (this.wave < coinMillDefinition.unlockWave) {
      this.showToast(`Unlocks at wave ${coinMillDefinition.unlockWave}`);
      return;
    }

    const existingMill = this.coinMills.find((mill) => mill.body.x === slot.x && mill.body.y === slot.y);
    const occupiedByOther = this.isPadOccupied(slot) && !existingMill;

    if (!existingMill && occupiedByOther) {
      this.showToast("Build pad is occupied");
      return;
    }

    if (existingMill) {
      const maxTier = coinMillDefinition.maxTier;
      if (this.coins >= 15 && existingMill.tier < maxTier) {
        this.coins -= 15;
        existingMill.tier += 1;
        existingMill.body.setScale(0.48 + existingMill.tier * 0.05);
        existingMill.badgeBg.setPosition(existingMill.body.x + 19, existingMill.body.y - 18);
        existingMill.badge.setPosition(existingMill.badgeBg.x, existingMill.badgeBg.y);
        existingMill.badge.setText(String(existingMill.tier));
        this.showToast(`${existingMill.tier === maxTier ? "Max" : "Tier"} ${existingMill.tier} coin mill`);
      } else if (existingMill.tier >= maxTier) {
        this.showToast("Coin mill already max tier");
      } else {
        this.showToast("Need 15 coins to upgrade mill");
      }
      return;
    }

    if (this.selectedBuildMode !== "mill") {
      this.showToast("Select Coin Mill first");
      return;
    }

    if (this.coins < coinMillDefinition.baseCost) {
      this.showToast(`Need ${coinMillDefinition.baseCost} coins`);
      return;
    }

    this.coins -= coinMillDefinition.baseCost;
    const body = this.add.image(slot.x, slot.y, "coin-mill").setScale(0.48).setDepth(8);
    const badgeBg = this.add.circle(slot.x + 19, slot.y - 18, 10, 0x17202b).setDepth(9);
    const badge = this.add.text(badgeBg.x, badgeBg.y, "1", {
      color: "#ffffff",
      fontFamily: "Arial",
      fontSize: "12px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(10);

    this.coinMills.push({ body, badgeBg, badge, tier: 1 });
    this.showToast(`${coinMillDefinition.name} built`);
  }

  private collectCoinMillIncome() {
    let total = 0;

    this.coinMills.forEach((mill) => {
      const income = coinMillDefinition.stats.income * mill.tier;
      total += income;
      this.pulseCoinMill(mill);
    });

    if (total > 0) {
      this.coins += total;
    }

    return total;
  }

  private pulseCoinMill(mill: CoinMill) {
    this.tweens.add({
      targets: mill.body,
      scale: mill.body.scale * 1.14,
      duration: 120,
      yoyo: true,
      ease: "Sine.easeOut",
    });
    this.flashCircle(mill.body.x, mill.body.y, 36, coinMillDefinition.color);
  }

  private tryBuildOrMergeBarracks(slot: Phaser.GameObjects.Rectangle) {
    if (this.wave < barracksDefinition.unlockWave) {
      this.showToast(`Unlocks at wave ${barracksDefinition.unlockWave}`);
      return;
    }

    const existingBarracks = this.barracks.find(
      (barracksBuilding) => barracksBuilding.body.x === slot.x && barracksBuilding.body.y === slot.y,
    );
    const occupiedByOther = this.isPadOccupied(slot) && !existingBarracks;

    if (!existingBarracks && occupiedByOther) {
      this.showToast("Build pad is occupied");
      return;
    }

    if (existingBarracks) {
      const maxTier = barracksDefinition.maxTier;
      if (this.coins >= 15 && existingBarracks.tier < maxTier) {
        this.coins -= 15;
        existingBarracks.tier += 1;
        existingBarracks.spawnRateMs = Math.max(
          1400,
          Math.round(barracksDefinition.stats.spawnRateMs / (1 + (existingBarracks.tier - 1) * 0.22)),
        );
        existingBarracks.body.setScale(0.5 + existingBarracks.tier * 0.05);
        existingBarracks.badgeBg.setPosition(existingBarracks.body.x + 19, existingBarracks.body.y - 18);
        existingBarracks.badge.setPosition(existingBarracks.badgeBg.x, existingBarracks.badgeBg.y);
        existingBarracks.badge.setText(String(existingBarracks.tier));
        this.showToast(`${existingBarracks.tier === maxTier ? "Max" : "Tier"} ${existingBarracks.tier} barracks`);
      } else if (existingBarracks.tier >= maxTier) {
        this.showToast("Barracks already max tier");
      } else {
        this.showToast("Need 15 coins to upgrade barracks");
      }
      return;
    }

    if (this.selectedBuildMode !== "barracks") {
      this.showToast("Select Barracks first");
      return;
    }

    if (this.coins < barracksDefinition.baseCost) {
      this.showToast(`Need ${barracksDefinition.baseCost} coins`);
      return;
    }

    this.coins -= barracksDefinition.baseCost;
    const body = this.add.image(slot.x, slot.y, "barracks").setScale(0.5).setDepth(8);
    const badgeBg = this.add.circle(slot.x + 19, slot.y - 18, 10, 0x17202b).setDepth(9);
    const badge = this.add.text(badgeBg.x, badgeBg.y, "1", {
      color: "#ffffff",
      fontFamily: "Arial",
      fontSize: "12px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(10);

    this.barracks.push({
      body,
      badgeBg,
      badge,
      tier: 1,
      spawnRateMs: barracksDefinition.stats.spawnRateMs,
      lastSpawnAt: 0,
    });
    this.showToast(`${barracksDefinition.name} ready`);
  }

  private tryBuildOrMergeStoneWall(slot: Phaser.GameObjects.Rectangle) {
    if (this.wave < stoneWallDefinition.unlockWave) {
      this.showToast(`Unlocks at wave ${stoneWallDefinition.unlockWave}`);
      return;
    }

    const existingWall = this.stoneWalls.find((wall) => wall.body.x === slot.x && wall.body.y === slot.y);
    const occupiedByOther = this.isPadOccupied(slot) && !existingWall;

    if (!existingWall && occupiedByOther) {
      this.showToast("Build pad is occupied");
      return;
    }

    if (existingWall) {
      const maxTier = stoneWallDefinition.maxTier;
      if (this.coins >= 15 && existingWall.tier < maxTier) {
        this.coins -= 15;
        existingWall.tier += 1;
        existingWall.body.setScale(0.46 + existingWall.tier * 0.05);
        existingWall.badgeBg.setPosition(existingWall.body.x + 19, existingWall.body.y - 18);
        existingWall.badge.setPosition(existingWall.badgeBg.x, existingWall.badgeBg.y);
        existingWall.badge.setText(String(existingWall.tier));
        this.refreshFortShield();
        this.showToast(`${existingWall.tier === maxTier ? "Max" : "Tier"} ${existingWall.tier} wall`);
      } else if (existingWall.tier >= maxTier) {
        this.showToast("Wall already max tier");
      } else {
        this.showToast("Need 15 coins to upgrade wall");
      }
      return;
    }

    if (this.selectedBuildMode !== "wall") {
      this.showToast("Select Stone Wall first");
      return;
    }

    if (this.coins < stoneWallDefinition.baseCost) {
      this.showToast(`Need ${stoneWallDefinition.baseCost} coins`);
      return;
    }

    this.coins -= stoneWallDefinition.baseCost;
    const body = this.add.image(slot.x, slot.y, "stone-wall").setScale(0.46).setDepth(8);
    const badgeBg = this.add.circle(slot.x + 19, slot.y - 18, 10, 0x17202b).setDepth(9);
    const badge = this.add.text(badgeBg.x, badgeBg.y, "1", {
      color: "#ffffff",
      fontFamily: "Arial",
      fontSize: "12px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(10);

    this.stoneWalls.push({ body, badgeBg, badge, tier: 1 });
    this.refreshFortShield();
    this.showToast(`${stoneWallDefinition.name} built`);
  }

  private tryBuildOrMergeHealingShrine(slot: Phaser.GameObjects.Rectangle) {
    if (this.wave < healingShrineDefinition.unlockWave) {
      this.showToast(`Unlocks at wave ${healingShrineDefinition.unlockWave}`);
      return;
    }

    const existingShrine = this.healingShrines.find(
      (shrine) => shrine.body.x === slot.x && shrine.body.y === slot.y,
    );
    const occupiedByOther = this.isPadOccupied(slot) && !existingShrine;

    if (!existingShrine && occupiedByOther) {
      this.showToast("Build pad is occupied");
      return;
    }

    if (existingShrine) {
      const maxTier = healingShrineDefinition.maxTier;
      if (this.coins >= 15 && existingShrine.tier < maxTier) {
        this.coins -= 15;
        existingShrine.tier += 1;
        existingShrine.body.setScale(0.46 + existingShrine.tier * 0.05);
        existingShrine.badgeBg.setPosition(existingShrine.body.x + 19, existingShrine.body.y - 18);
        existingShrine.badge.setPosition(existingShrine.badgeBg.x, existingShrine.badgeBg.y);
        existingShrine.badge.setText(String(existingShrine.tier));
        this.showToast(`${existingShrine.tier === maxTier ? "Max" : "Tier"} ${existingShrine.tier} shrine`);
      } else if (existingShrine.tier >= maxTier) {
        this.showToast("Shrine already max tier");
      } else {
        this.showToast("Need 15 coins to upgrade shrine");
      }
      return;
    }

    if (this.selectedBuildMode !== "shrine") {
      this.showToast("Select Healing Shrine first");
      return;
    }

    if (this.coins < healingShrineDefinition.baseCost) {
      this.showToast(`Need ${healingShrineDefinition.baseCost} coins`);
      return;
    }

    this.coins -= healingShrineDefinition.baseCost;
    const body = this.add.image(slot.x, slot.y, "healing-shrine").setScale(0.46).setDepth(8);
    const badgeBg = this.add.circle(slot.x + 19, slot.y - 18, 10, 0x17202b).setDepth(9);
    const badge = this.add.text(badgeBg.x, badgeBg.y, "1", {
      color: "#ffffff",
      fontFamily: "Arial",
      fontSize: "12px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(10);

    this.healingShrines.push({ body, badgeBg, badge, tier: 1 });
    this.showToast(`${healingShrineDefinition.name} built`);
  }

  private refreshFortShield() {
    this.fortShieldMax = this.stoneWalls.reduce(
      (total, wall) => total + stoneWallDefinition.stats.fortShield * wall.tier,
      0,
    );
    this.fortShieldRemaining = this.fortShieldMax;
  }

  private applyFortDamage(rawDamage: number) {
    let damage = rawDamage;

    if (this.fortShieldRemaining > 0) {
      const absorbed = Math.min(this.fortShieldRemaining, damage);
      this.fortShieldRemaining -= absorbed;
      damage -= absorbed;

      if (absorbed > 0) {
        this.flashCircle(195, 584, 42, stoneWallDefinition.color);
      }
    }

    this.fortHp = Math.max(0, this.fortHp - damage);
  }

  private collectShrineRepair() {
    if (this.wave % 5 !== 0 || this.healingShrines.length === 0) return 0;

    const repair = this.healingShrines.reduce(
      (total, shrine) => total + healingShrineDefinition.stats.repair * shrine.tier,
      0,
    );
    const before = this.fortHp;
    this.fortHp = Math.min(this.maxFortHp, this.fortHp + repair);
    const healed = this.fortHp - before;

    if (healed > 0) {
      this.healingShrines.forEach((shrine) => {
        this.tweens.add({
          targets: shrine.body,
          scale: shrine.body.scale * 1.12,
          duration: 140,
          yoyo: true,
          ease: "Sine.easeOut",
        });
      });
      this.flashCircle(195, 584, 52, healingShrineDefinition.color);
    }

    return healed;
  }

  private getTroopDefinitionForTier(tier: number) {
    return troopDefinitions[Math.min(troopDefinitions.length - 1, Math.max(0, tier - 1))];
  }

  private spawnBarracksTroops(time: number) {
    if (this.barracks.length === 0 || this.friendlyTroops.length >= maxFriendlyTroops) return;

    this.barracks.forEach((barracksBuilding) => {
      if (time - barracksBuilding.lastSpawnAt < barracksBuilding.spawnRateMs) return;
      if (this.friendlyTroops.length >= maxFriendlyTroops) return;

      barracksBuilding.lastSpawnAt = time;
      this.spawnFriendlyTroop(barracksBuilding);
    });
  }

  private spawnFriendlyTroop(barracksBuilding: Barracks) {
    const troopDefinition = this.getTroopDefinitionForTier(barracksBuilding.tier);
    const spawnX = barracksBuilding.body.x + Phaser.Math.Between(-10, 10);
    const spawnY = barracksBuilding.body.y + Phaser.Math.Between(-8, 8);
    const troopTint = troopRoleTints[troopDefinition.role];
    const body = this.add
      .image(spawnX, spawnY, "hero-guardian")
      .setScale(0.28)
      .setTint(troopTint)
      .setDepth(13);
    const hpBar = this.add
      .rectangle(body.x, body.y - 18, 20, 3, 0x216869)
      .setOrigin(0.5)
      .setDepth(14);
    const tierBonus = 1 + (barracksBuilding.tier - 1) * 0.18;
    const attackRange = troopDefinition.role === "ranged" ? 92 : troopDefinition.role === "burst" ? 54 : 28;

    this.friendlyTroops.push({
      body,
      hpBar,
      hp: Math.round((barracksDefinition.stats.troopHp + troopDefinition.hp * 0.35) * tierBonus),
      maxHp: Math.round((barracksDefinition.stats.troopHp + troopDefinition.hp * 0.35) * tierBonus),
      damage: Math.round(troopDefinition.damage * tierBonus * this.towerDamageMultiplier),
      speed: troopDefinition.role === "blocker" ? 0.05 : 0.062,
      attackRange,
      attackCooldownMs: troopDefinition.role === "burst" ? 920 : troopDefinition.role === "ranged" ? 720 : 580,
      lastAttackAt: 0,
      lastHurtAt: 0,
      role: troopDefinition.role,
      tint: troopTint,
    });
  }

  private updateFriendlyTroops(time: number, delta: number) {
    this.friendlyTroops = this.friendlyTroops.filter((troop) => {
      if (troop.hp <= 0) {
        troop.body.destroy();
        troop.hpBar.destroy();
        return false;
      }

      const target = this.findTroopTarget(troop);
      if (target) {
        const distance = Phaser.Math.Distance.Between(troop.body.x, troop.body.y, target.body.x, target.body.y);
        const angle = Phaser.Math.Angle.Between(troop.body.x, troop.body.y, target.body.x, target.body.y);
        this.rotateSpriteToward(troop.body, angle, spriteFacingOffset["hero-guardian"], delta);

        if (distance > troop.attackRange) {
          troop.body.x += Math.cos(angle) * troop.speed * delta;
          troop.body.y += Math.sin(angle) * troop.speed * delta;
        } else if (time - troop.lastAttackAt >= troop.attackCooldownMs) {
          troop.lastAttackAt = time;
          if (troop.role === "burst") {
            this.enemies
              .filter(
                (enemy) =>
                  Phaser.Math.Distance.Between(troop.body.x, troop.body.y, enemy.body.x, enemy.body.y) < troop.attackRange,
              )
              .forEach((enemy) => this.damageEnemy(enemy, troop.damage, "troop"));
            this.flashCircle(troop.body.x, troop.body.y, troop.attackRange, 0xf2c14e);
          } else {
            this.damageEnemy(target, troop.damage, "troop");
          }
        }
      }

      this.enemies.forEach((enemy) => {
        const contactDistance = Phaser.Math.Distance.Between(troop.body.x, troop.body.y, enemy.body.x, enemy.body.y);
        if (contactDistance < 22 && time - troop.lastHurtAt > 700) {
          troop.lastHurtAt = time;
          troop.hp -= 10;
          troop.body.setTintFill(0xff6b6b);
          this.time.delayedCall(80, () => {
            if (troop.body.active) troop.body.setTint(troop.tint);
          });
          if (troop.role === "blocker" && contactDistance < 18) {
            enemy.body.x -= (enemy.body.x - troop.body.x) * 0.04;
            enemy.body.y -= (enemy.body.y - troop.body.y) * 0.04;
          }
        }
      });

      troop.hpBar.setPosition(troop.body.x, troop.body.y - 18);
      troop.hpBar.width = Math.max(3, 20 * (troop.hp / troop.maxHp));
      return troop.hp > 0;
    });
  }

  private findTroopTarget(troop: FriendlyTroop) {
    return [...this.enemies]
      .filter((enemy) => Phaser.Math.Distance.Between(troop.body.x, troop.body.y, enemy.body.x, enemy.body.y) < 220)
      .sort((a, b) => {
        const distanceA = Phaser.Math.Distance.Between(troop.body.x, troop.body.y, a.body.x, a.body.y);
        const distanceB = Phaser.Math.Distance.Between(troop.body.x, troop.body.y, b.body.x, b.body.y);
        return distanceA - distanceB;
      })[0];
  }

  private triggerTraps(time: number) {
    if (this.traps.length === 0 || this.enemies.length === 0) return;

    this.traps.forEach((trap) => {
      if (time - trap.lastTriggeredAt < trap.cooldownMs) return;

      const target = this.enemies.find((enemy) => {
        if (enemy.archetype === "flyer") return false;
        return (
          Phaser.Math.Distance.Between(trap.body.x, trap.body.y, enemy.body.x, enemy.body.y) < trap.triggerRadius
        );
      });

      if (!target) return;

      trap.lastTriggeredAt = time;
      this.damageEnemy(target, trap.damage, "trap");
      this.pulseTrap(trap);
    });
  }

  private pulseTrap(trap: Trap) {
    this.tweens.add({
      targets: trap.body,
      scale: trap.body.scale * 1.18,
      duration: 90,
      yoyo: true,
      ease: "Sine.easeOut",
    });
    this.flashCircle(trap.body.x, trap.body.y, trap.triggerRadius, spikeTrapDefinition.color);
  }

  private spawnWave() {
    this.waveReadyForClear = false;
    const groups = getWaveSpawnGroups(this.wave);
    let delay = 0;

    groups.forEach((group) => {
      const definition = enemyDefinitions.find((enemy) => enemy.id === group.enemyId);
      if (!definition) return;

      for (let index = 0; index < group.count; index += 1) {
        this.time.delayedCall(delay, () => this.spawnEnemy(definition));
        delay += group.intervalMs;
      }
    });

    this.time.delayedCall(delay + 2800, () => {
      this.waveReadyForClear = true;
    });
  }

  private tryCompleteWave() {
    if (!this.waveReadyForClear || this.isChoosingUpgrade || this.waitingToStartWave) return;
    if (this.fortHp <= 0 || this.enemies.length > 0) return;

    this.waveReadyForClear = false;
    this.showUpgradeChoice();
  }

  private beginNextWave() {
    if (!this.waitingToStartWave || this.isChoosingUpgrade || this.isGameOver) return;

    this.waitingToStartWave = false;
    this.wave += 1;
    this.refreshFortShield();
    this.spawnWave();
    this.showToast(`Wave ${this.wave} incoming`);
  }

  private spawnEnemy(definition: EnemyDefinition) {
    const assetKey = enemyAssetKeys[definition.id] ?? "kenney-enemy-grunt";
    const isBoss = definition.archetype === "boss";
    const usesSvg = assetKey === "enemy-runner" || assetKey === "enemy-grunt";
    const body = this.add
      .image(path[0].x, path[0].y, assetKey)
      .setScale(isBoss ? 0.58 : 0.46)
      .setDepth(16);

    if (usesSvg) {
      body.setTint(definition.color);
    }

    const hpBar = this.add.rectangle(body.x, body.y - 28, 28, 4, 0x4f9d69)
      .setOrigin(0.5)
      .setDepth(17);

    const scaledHp = definition.hp + this.wave * 5;

    this.enemies.push({
      body,
      hpBar,
      pathIndex: 1,
      enemyId: definition.id,
      archetype: definition.archetype,
      hp: scaledHp,
      maxHp: scaledHp,
      speed: (0.046 + this.wave * 0.0015) * definition.speed,
      reward: Math.ceil(definition.reward * this.rewardMultiplier),
      damageToFort: Math.ceil(definition.damageToFort * 0.55),
      tint: usesSvg ? definition.color : 0xffffff,
      isBoss,
      facingOffset: spriteFacingOffset[assetKey] ?? 0,
    });
  }

  private moveEnemies(delta: number) {
    this.enemies = this.enemies.filter((enemy) => {
      const currentTarget = path[enemy.pathIndex];

      if (!currentTarget) {
        enemy.body.destroy();
        enemy.hpBar.destroy();
        if (enemy.archetype === "exploder") {
          this.applyFortDamage(enemy.damageToFort);
          this.applyFortDamage(Math.ceil(enemy.damageToFort * 0.55));
          this.flashCircle(195, 584, 72, 0xb5442f);
        } else {
          this.applyFortDamage(enemy.damageToFort);
        }
        return false;
      }

      if (Phaser.Math.Distance.Between(enemy.body.x, enemy.body.y, currentTarget.x, currentTarget.y) < 8) {
        enemy.pathIndex += 1;
        const nextTarget = path[enemy.pathIndex];
        if (nextTarget) {
          const nextAngle = Phaser.Math.Angle.Between(
            enemy.body.x,
            enemy.body.y,
            nextTarget.x,
            nextTarget.y,
          );
          enemy.body.rotation = nextAngle + enemy.facingOffset;
        }
        return true;
      }

      const angle = Phaser.Math.Angle.Between(enemy.body.x, enemy.body.y, currentTarget.x, currentTarget.y);
      enemy.body.x += Math.cos(angle) * enemy.speed * delta;
      enemy.body.y += Math.sin(angle) * enemy.speed * delta;
      this.rotateSpriteToward(enemy.body, angle, enemy.facingOffset, delta);
      enemy.body.scale = (enemy.isBoss ? 0.82 : 0.9) + (enemy.hp / enemy.maxHp) * 0.08;
      enemy.hpBar.setPosition(enemy.body.x, enemy.body.y - 30);
      enemy.hpBar.width = Math.max(3, 28 * (enemy.hp / enemy.maxHp));
      return enemy.hp > 0 && this.fortHp > 0;
    });
  }

  private findTowerTarget(tower: Tower) {
    const inRange = this.enemies.filter(
      (enemy) => Phaser.Math.Distance.Between(tower.body.x, tower.body.y, enemy.body.x, enemy.body.y) < tower.range,
    );

    return inRange.sort((a, b) => {
      if (tower.towerId === "magic-tower" && this.magicPrioritizeArmored) {
        const armorScore = (enemy: Enemy) => {
          if (enemy.archetype === "shield" || enemy.archetype === "tank" || enemy.archetype === "boss") return 0;
          return 1;
        };
        const armorDelta = armorScore(a) - armorScore(b);
        if (armorDelta !== 0) return armorDelta;
      }

      const distanceA = Phaser.Math.Distance.Between(tower.body.x, tower.body.y, a.body.x, a.body.y);
      const distanceB = Phaser.Math.Distance.Between(tower.body.x, tower.body.y, b.body.x, b.body.y);
      return distanceA - distanceB;
    })[0];
  }

  private aimTowers(delta: number) {
    this.towers.forEach((tower) => {
      const target = this.findTowerTarget(tower);
      if (!target) return;

      const angle = Phaser.Math.Angle.Between(tower.body.x, tower.body.y, target.body.x, target.body.y);
      const facingOffset = spriteFacingOffset[tower.body.texture.key] ?? Math.PI / 2;
      this.rotateSpriteToward(tower.body, angle, facingOffset, delta);
    });
  }

  private shootNearestEnemy(tower: Tower, time: number) {
    if (time - tower.lastShotAt < tower.fireRateMs || this.enemies.length === 0) return;

    const target = this.findTowerTarget(tower);
    if (!target) return;

    tower.lastShotAt = time;
    const projectileKey = projectileAssetKeys[tower.towerId] ?? "kenney-projectile";
    const projectileScale = projectileKey === "projectile-arrow" ? 0.62 : 0.55;
    const projectile = this.add.image(tower.body.x, tower.body.y, projectileKey).setScale(projectileScale).setDepth(18);
    const shotAngle = Phaser.Math.Angle.Between(tower.body.x, tower.body.y, target.body.x, target.body.y);
    projectile.rotation = shotAngle + (spriteFacingOffset[projectileKey] ?? 0);

    this.projectiles.push({
      body: projectile,
      target,
      towerId: tower.towerId,
      damage: tower.damage,
      speed: 0.42,
    });
  }

  private getProjectileDamageSource(towerId: string): DamageSource {
    if (towerId === "archer-tower") return "archer";
    if (towerId === "cannon-tower") return "cannon";
    if (towerId === "magic-tower") return "magic";
    return "other";
  }

  private applyCannonSplash(primary: Enemy, damage: number, hitX: number, hitY: number) {
    const cannonDefinition = buildingDefinitions.find((building) => building.id === "cannon-tower");
    const baseSplash = cannonDefinition?.stats.splash ?? 42;
    const splashRadius = baseSplash * (1 + this.cannonSplashBonus);
    const splashDamage = Math.max(1, Math.round(damage * 0.45));

    this.enemies.forEach((enemy) => {
      if (enemy === primary || !enemy.body.active) return;
      const distance = Phaser.Math.Distance.Between(hitX, hitY, enemy.body.x, enemy.body.y);
      if (distance <= splashRadius) {
        this.damageEnemy(enemy, splashDamage, "cannon");
      }
    });

    this.flashCircle(hitX, hitY, splashRadius, 0x81523f);
  }

  private moveProjectiles(delta: number) {
    this.projectiles = this.projectiles.filter((projectile) => {
      if (!projectile.target.body.active) {
        projectile.body.destroy();
        return false;
      }

      const distance = Phaser.Math.Distance.Between(
        projectile.body.x,
        projectile.body.y,
        projectile.target.body.x,
        projectile.target.body.y,
      );

      if (distance < 9) {
        const source = this.getProjectileDamageSource(projectile.towerId);
        const hitX = projectile.target.body.x;
        const hitY = projectile.target.body.y;
        this.damageEnemy(projectile.target, projectile.damage, source);

        if (projectile.towerId === "cannon-tower") {
          this.applyCannonSplash(projectile.target, projectile.damage, hitX, hitY);
        }

        projectile.body.destroy();
        return false;
      }

      const angle = Phaser.Math.Angle.Between(
        projectile.body.x,
        projectile.body.y,
        projectile.target.body.x,
        projectile.target.body.y,
      );
      const projectileOffset = spriteFacingOffset[projectile.body.texture.key] ?? 0;
      projectile.body.rotation = angle + projectileOffset;
      projectile.body.x += Math.cos(angle) * projectile.speed * delta;
      projectile.body.y += Math.sin(angle) * projectile.speed * delta;
      return true;
    });
  }

  private updateHud() {
    useGameStore.getState().setRunSnapshot({
      fortHp: this.fortHp,
      wave: this.wave,
      coins: this.coins,
      highestClearedWave: this.highestClearedWave,
    });

    this.publishRunUiState();

    if (this.fortHp <= 0 && !this.isGameOver) {
      this.isGameOver = true;
      const fortBonusGems = this.claimEndOfRunRewards();
      const { lastRun } = useGameStore.getState();
      gameBridge.emit("runEnded", {
        reason: "defeat",
        wave: this.wave,
        highestClearedWave: this.highestClearedWave,
        coins: this.coins,
        fortBonusGems,
        sessionGems: lastRun.sessionGems,
      });
      this.publishRunUiState();
      this.syncTimeScale();
    }
  }

  private selectTower(index: number) {
    if (this.isChoosingUpgrade) return;

    this.dockTab = "towers";
    this.selectedBuildMode = "tower";
    this.selectedTowerIndex = index;
    this.publishRunUiState();
    this.showToast(`${starterTowers[index]?.name ?? "Tower"} selected`);
  }

  private selectTrap() {
    if (this.isChoosingUpgrade) return;

    if (this.wave < spikeTrapDefinition.unlockWave) {
      this.showToast(`Spike Trap unlocks at wave ${spikeTrapDefinition.unlockWave}`);
      return;
    }

    this.dockTab = "support";
    this.selectedBuildMode = "trap";
    this.publishRunUiState();
    this.showToast("Tap a trap pad on the path");
  }

  private selectCoinMill() {
    if (this.isChoosingUpgrade) return;

    if (this.wave < coinMillDefinition.unlockWave) {
      this.showToast(`Coin Mill unlocks at wave ${coinMillDefinition.unlockWave}`);
      return;
    }

    this.dockTab = "support";
    this.selectedBuildMode = "mill";
    this.publishRunUiState();
    this.showToast("Tap a build pad for coin mill");
  }

  private selectBarracks() {
    if (this.isChoosingUpgrade) return;

    if (this.wave < barracksDefinition.unlockWave) {
      this.showToast(`Barracks unlock at wave ${barracksDefinition.unlockWave}`);
      return;
    }

    this.dockTab = "support";
    this.selectedBuildMode = "barracks";
    this.publishRunUiState();
    this.showToast("Tap a build pad for barracks");
  }

  private selectStoneWall() {
    if (this.isChoosingUpgrade) return;

    if (this.wave < stoneWallDefinition.unlockWave) {
      this.showToast(`Stone Wall unlocks at wave ${stoneWallDefinition.unlockWave}`);
      return;
    }

    this.dockTab = "support";
    this.selectedBuildMode = "wall";
    this.publishRunUiState();
    this.showToast("Tap a build pad for stone wall");
  }

  private selectHealingShrine() {
    if (this.isChoosingUpgrade) return;

    if (this.wave < healingShrineDefinition.unlockWave) {
      this.showToast(`Healing Shrine unlocks at wave ${healingShrineDefinition.unlockWave}`);
      return;
    }

    this.dockTab = "support";
    this.selectedBuildMode = "shrine";
    this.publishRunUiState();
    this.showToast("Tap a build pad for healing shrine");
  }

  private showToast(message: string) {
    this.toastMessage = message;
    this.publishRunUiState();
    this.time.delayedCall(1400, () => {
      if (this.toastMessage === message) {
        this.toastMessage = "";
        this.publishRunUiState();
      }
    });
  }

  private useHeroAbility() {
    if (this.isGameOver || this.isChoosingUpgrade) return;

    if (this.time.now < this.nextHeroAbilityAt) {
      this.showToast("Hero ability is cooling down");
      return;
    }

    this.nextHeroAbilityAt = this.time.now + this.heroCooldownMs;

    if (this.selectedHeroRole === "guardian") {
      this.fortHp = Math.min(this.maxFortHp, this.fortHp + 55);
      this.flashCircle(195, 584, 92, 0xf2c14e);
      this.showToast("Fort shield restored HP");
      return;
    }

    if (this.selectedHeroRole === "ranger") {
      const targets = [...this.enemies]
        .sort((a, b) => b.hp - a.hp)
        .slice(0, 3);
      targets.forEach((enemy) => {
        this.damageEnemy(enemy, 72, "hero");
        const tracer = this.add.line(0, 0, 195, 530, enemy.body.x, enemy.body.y, 0xf2c14e, 0.85).setOrigin(0).setDepth(50);
        this.tweens.add({ targets: tracer, alpha: 0, duration: 260, onComplete: () => tracer.destroy() });
      });
      this.showToast("Piercing volley fired");
      return;
    }

    this.enemies.forEach((enemy) => this.damageEnemy(enemy, 46, "hero"));
    this.flashCircle(195, 326, 170, 0xb85c38);
    this.showToast("Meteor sigil burned the lane");
  }

  private resolveDamage(enemy: Enemy, damage: number, source: DamageSource) {
    if (enemy.archetype === "shield" && source === "archer") {
      return damage * 0.5;
    }
    return damage;
  }

  private damageEnemy(enemy: Enemy, damage: number, source: DamageSource = "other") {
    if (!enemy.body.active) return;

    enemy.hp -= this.resolveDamage(enemy, damage, source);
    enemy.body.setTintFill(0xffffff);
    this.time.delayedCall(80, () => {
      if (!enemy.body.active) return;
      if (enemy.tint === 0xffffff) {
        enemy.body.clearTint();
      } else {
        enemy.body.setTint(enemy.tint);
      }
    });

    if (enemy.hp <= 0) {
      this.coins += enemy.reward;
      enemy.body.destroy();
      enemy.hpBar.destroy();
    }
  }

  private flashCircle(x: number, y: number, radius: number, color: number) {
    const circle = this.add.circle(x, y, radius, color, 0.22).setDepth(49);
    this.tweens.add({
      targets: circle,
      alpha: 0,
      scale: 1.2,
      duration: 360,
      ease: "Sine.easeOut",
      onComplete: () => circle.destroy(),
    });
  }

  private showUpgradeChoice() {
    if (this.isChoosingUpgrade || this.isGameOver) return;

    let waveGemDrip = 0;
    if (this.wave > this.lastMetaWaveRewarded) {
      waveGemDrip = useGameStore.getState().recordWaveClear(this.wave);
      this.lastMetaWaveRewarded = this.wave;
      this.highestClearedWave = Math.max(this.highestClearedWave, this.wave);
    }

    const millIncome = this.collectCoinMillIncome();
    const shrineHeal = this.collectShrineRepair();
    this.refreshFortShield();
    this.isChoosingUpgrade = true;
    this.publishRunUiState();
    this.syncTimeScale();
    const offeredUpgrades = this.pickUpgrades();
    const overlay = this.add.container(0, 0).setDepth(80);
    overlay.add(this.add.rectangle(195, 347, 390, 694, 0x17202b, 0.64));
    overlay.add(this.add.text(195, 150, "Choose an upgrade", {
      color: "#ffffff",
      fontFamily: "Arial",
      fontSize: "24px",
      fontStyle: "bold",
    }).setOrigin(0.5));
    overlay.add(this.add.text(195, 181, `Wave ${this.wave} cleared`, {
      color: "#f2c14e",
      fontFamily: "Arial",
      fontSize: "15px",
      fontStyle: "bold",
    }).setOrigin(0.5));

    let bonusY = 206;
    if (waveGemDrip > 0) {
      overlay.add(this.add.text(195, bonusY, `+${waveGemDrip} gems banked`, {
        color: "#f2c14e",
        fontFamily: "Arial",
        fontSize: "14px",
        fontStyle: "bold",
      }).setOrigin(0.5));
      bonusY += 22;
    }
    if (millIncome > 0) {
      overlay.add(this.add.text(195, bonusY, `Coin mills +${millIncome}`, {
        color: "#fff7da",
        fontFamily: "Arial",
        fontSize: "14px",
        fontStyle: "bold",
      }).setOrigin(0.5));
      bonusY += 22;
    }

    if (shrineHeal > 0) {
      overlay.add(this.add.text(195, bonusY, `Shrines repaired +${shrineHeal} HP`, {
        color: "#b8f5cc",
        fontFamily: "Arial",
        fontSize: "14px",
        fontStyle: "bold",
      }).setOrigin(0.5));
      bonusY += 22;
    }

    const upgradeCardHalfHeight = 41;
    const cardStartY =
      bonusY > 206 ? bonusY + upgradeCardHalfHeight + 24 : 247;
    offeredUpgrades.forEach((upgrade, index) => {
      const y = cardStartY + index * 106;
      overlay.add(this.createUpgradeCard(upgrade, 195, y));
    });

    this.upgradeOverlay = overlay;
  }

  private createUpgradeCard(upgrade: UpgradeDefinition, x: number, y: number) {
    const rarityColor = {
      common: 0xffffff,
      rare: 0x8fd0ff,
      epic: 0xcaa8ff,
    }[upgrade.rarity];
    const container = this.add.container(x, y);
    const card = this.add.rectangle(0, 0, 318, 82, rarityColor, 1)
      .setStrokeStyle(4, 0x216869)
      .setInteractive({ useHandCursor: true });
    const title = this.add.text(-136, -26, upgrade.name, {
      color: "#17202b",
      fontFamily: "Arial",
      fontSize: "18px",
      fontStyle: "bold",
    });
    const description = this.add.text(-136, 0, upgrade.description, {
      color: "#26313a",
      fontFamily: "Arial",
      fontSize: "13px",
      wordWrap: { width: 250 },
    });
    const rarity = this.add.text(126, -28, upgrade.rarity.toUpperCase(), {
      color: "#216869",
      fontFamily: "Arial",
      fontSize: "10px",
      fontStyle: "bold",
    }).setOrigin(1, 0);

    card.on("pointerdown", () => this.chooseUpgrade(upgrade));
    container.add([card, title, description, rarity]);
    return container;
  }

  private chooseUpgrade(upgrade: UpgradeDefinition) {
    this.applyUpgrade(upgrade);
    this.upgradeOverlay?.destroy(true);
    this.upgradeOverlay = undefined;
    this.isChoosingUpgrade = false;
    this.syncTimeScale();
    this.coins += 30;
    this.showToast(`${upgrade.name} gained — tap Start Wave`);
    this.waitingToStartWave = true;
    this.publishRunUiState();
  }

  private applyUpgrade(upgrade: UpgradeDefinition) {
    switch (upgrade.target) {
      case "archer-damage":
        this.towers
          .filter((tower) => tower.towerId === "archer-tower")
          .forEach((tower) => {
            tower.damage *= 1 + upgrade.value;
          });
        break;
      case "fire-rate":
        this.fireRateMultiplier = Math.max(0.55, this.fireRateMultiplier - upgrade.value);
        this.towers.forEach((tower) => {
          tower.fireRateMs = Math.max(220, Math.round(tower.fireRateMs * (1 - upgrade.value)));
        });
        break;
      case "fort-hp":
        this.maxFortHp += upgrade.value;
        this.fortHp = Math.min(this.maxFortHp, this.fortHp + upgrade.value);
        break;
      case "coin-reward":
        this.rewardMultiplier += upgrade.value;
        break;
      case "cannon-splash":
        this.cannonSplashBonus += upgrade.value;
        this.towers
          .filter((tower) => tower.towerId === "cannon-tower")
          .forEach((tower) => {
            tower.damage *= 1 + upgrade.value * 0.35;
          });
        break;
      case "magic-priority":
        this.magicPrioritizeArmored = true;
        this.towers
          .filter((tower) => tower.towerId === "magic-tower")
          .forEach((tower) => {
            tower.damage *= 1 + upgrade.value * 0.12;
          });
        break;
      default:
        this.coins += 25;
        break;
    }
  }

  private pickUpgrades() {
    const shuffled = Phaser.Utils.Array.Shuffle([...upgradeDefinitions]);
    return shuffled.slice(0, 3);
  }

  private applyLoadout() {
    const { permanentUpgrades, selectedHeroId, selectedMapId } = useGameStore.getState().progress;
    const selectedHero = heroDefinitions.find((hero) => hero.id === selectedHeroId) ?? heroDefinitions[0];
    const selectedMap = mapDefinitions.find((map) => map.id === selectedMapId) ?? mapDefinitions[0];

    this.selectedHeroRole = selectedHero.role;
    this.selectedHeroAbility = selectedHero.ability;
    this.heroCooldownMs = selectedHero.cooldownSeconds * 1000;
    this.heroTint = selectedHero.color;
    this.palette = {
      ground: parseHexColor(selectedMap.palette.ground, 0x83a96d),
      path: parseHexColor(selectedMap.palette.path, 0xd9c59f),
      hud: parseHexColor(selectedMap.palette.accent, 0x17202b),
    };

    this.maxFortHp = 180 + permanentUpgrades.fortHp * 18;
    this.fortHp = this.maxFortHp;
    this.coins = 150 + permanentUpgrades.startingCoins * 15;
    this.towerDamageMultiplier = 1 + permanentUpgrades.towerDamage * 0.08;

    if (selectedHero.role === "guardian") {
      this.maxFortHp += 35;
      this.fortHp = this.maxFortHp;
    }

    if (selectedHero.role === "ranger") {
      this.towerDamageMultiplier += 0.1;
      this.fireRateMultiplier = 0.92;
    }

    if (selectedHero.role === "mage") {
      this.rewardMultiplier += 0.2;
      this.coins += 25;
    }
  }

  private claimEndOfRunRewards() {
    if (this.runRewardClaimed) return 0;

    this.runRewardClaimed = true;
    return useGameStore.getState().claimRunRewards(this.wave, this.coins, this.highestClearedWave);
  }

  private rotateSpriteToward(
    sprite: Phaser.GameObjects.Image,
    aimAngle: number,
    facingOffset: number,
    delta: number,
  ) {
    const targetRotation = aimAngle + facingOffset;
    sprite.rotation = Phaser.Math.Angle.RotateTo(sprite.rotation, targetRotation, rotationTurnSpeed * delta);
  }
}

function parseHexColor(value: string, fallback: number) {
  const parsed = Number.parseInt(value.replace("#", ""), 16);
  return Number.isNaN(parsed) ? fallback : parsed;
}
