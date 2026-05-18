import Phaser from "phaser";
import { buildingDefinitions } from "../../data/buildings";
import { enemyDefinitions, type EnemyDefinition } from "../../data/enemies";
import { heroDefinitions } from "../../data/heroes";
import { mapDefinitions } from "../../data/maps";
import { troopDefinitions, type TroopDefinition } from "../../data/troops";
import { upgradeDefinitions, type UpgradeDefinition } from "../../data/upgrades";
import { useGameStore } from "../../state/useGameStore";

type Enemy = {
  body: Phaser.GameObjects.Image;
  hpBar: Phaser.GameObjects.Rectangle;
  pathIndex: number;
  hp: number;
  maxHp: number;
  speed: number;
  reward: number;
  damageToFort: number;
};

type Tower = {
  body: Phaser.GameObjects.Image;
  badgeBg: Phaser.GameObjects.Arc;
  badge: Phaser.GameObjects.Text;
  tier: number;
  damage: number;
  range: number;
  fireRateMs: number;
  lastShotAt: number;
};

type Projectile = {
  body: Phaser.GameObjects.Image;
  target: Enemy;
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
};

const path = [
  new Phaser.Math.Vector2(195, 38),
  new Phaser.Math.Vector2(195, 132),
  new Phaser.Math.Vector2(96, 236),
  new Phaser.Math.Vector2(286, 346),
  new Phaser.Math.Vector2(195, 504),
];

const starterTowers = buildingDefinitions.filter((building) => building.role === "tower").slice(0, 3);
const spikeTrapDefinition =
  buildingDefinitions.find((building) => building.id === "spike-trap") ?? buildingDefinitions[3];
const barracksDefinition =
  buildingDefinitions.find((building) => building.id === "barracks") ?? buildingDefinitions[4];

const maxFriendlyTroops = 10;

const trapPadPositions: [number, number][] = [
  [168, 98],
  [72, 218],
  [318, 328],
  [248, 418],
  [168, 468],
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
  bat: "kenney-enemy-runner",
  bomber: "kenney-enemy-grunt",
  gatebreaker: "kenney-enemy-boss",
};

export class RunScene extends Phaser.Scene {
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private towerSlots: Phaser.GameObjects.Rectangle[] = [];
  private trapSlots: Phaser.GameObjects.Rectangle[] = [];
  private towers: Tower[] = [];
  private traps: Trap[] = [];
  private barracks: Barracks[] = [];
  private friendlyTroops: FriendlyTroop[] = [];
  private towerPickerButtons: Phaser.GameObjects.Rectangle[] = [];
  private trapPickerButton?: Phaser.GameObjects.Rectangle;
  private barracksPickerButton?: Phaser.GameObjects.Rectangle;
  private selectedBuildMode: "tower" | "trap" | "barracks" = "tower";
  private fortHp = 180;
  private maxFortHp = 180;
  private coins = 150;
  private wave = 1;
  private isGameOver = false;
  private isChoosingUpgrade = false;
  private selectedTowerIndex = 0;
  private towerDamageMultiplier = 1;
  private fireRateMultiplier = 1;
  private rewardMultiplier = 1;
  private runRewardClaimed = false;
  private selectedHeroName = "Stone Warden";
  private selectedMapName = "Greenwatch Pass";
  private selectedHeroRole: "guardian" | "ranger" | "mage" = "guardian";
  private selectedHeroAbility = "Fort Shield";
  private heroCooldownMs = 18000;
  private nextHeroAbilityAt = 0;
  private heroTint = 0x4a5759;
  private hudText?: Phaser.GameObjects.Text;
  private waveText?: Phaser.GameObjects.Text;
  private toastText?: Phaser.GameObjects.Text;
  private abilityText?: Phaser.GameObjects.Text;
  private abilityButton?: Phaser.GameObjects.Rectangle;
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
    this.load.image("kenney-projectile", "/assets/optimized/sprites/kenney-projectile.png");
    this.load.svg("spike-trap", "/assets/optimized/sprites/spike-trap.svg", { width: 64, height: 64 });
    this.load.svg("barracks", "/assets/optimized/sprites/barracks.svg", { width: 64, height: 64 });
  }

  create() {
    this.applyLoadout();
    this.drawMap();
    this.drawHud();
    this.createBuildSlots();
    this.createTrapSlots();
    this.createTowerPicker();
    this.createHero();
    this.showToast("Tap a build pad to place a tower");
    this.spawnWave();

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.tryBuildOrMerge(pointer.x, pointer.y);
    });
  }

  update(time: number, delta: number) {
    if (this.isGameOver) return;

    if (this.isChoosingUpgrade) {
      this.updateHud();
      return;
    }

    this.moveEnemies(delta);
    this.triggerTraps(time);
    this.spawnBarracksTroops(time);
    this.updateFriendlyTroops(time, delta);
    this.moveProjectiles(delta);
    this.towers.forEach((tower) => this.shootNearestEnemy(tower, time));
    this.updateHud();
  }

  private drawMap() {
    this.add.rectangle(195, 347, 390, 694, this.palette.ground);
    this.add.image(36, 104, "kenney-tree").setScale(0.72).setTint(this.palette.hud).setDepth(1);
    this.add.image(345, 104, "kenney-tree").setScale(0.64).setTint(this.palette.hud).setDepth(1);
    this.add.image(52, 526, "kenney-tree").setScale(0.6).setTint(this.palette.hud).setDepth(1);
    this.add.image(345, 565, "kenney-tree").setScale(0.74).setTint(this.palette.hud).setDepth(1);

    const graphics = this.add.graphics();
    graphics.setDepth(2);
    graphics.lineStyle(44, this.palette.path, 1);
    graphics.beginPath();
    graphics.moveTo(path[0].x, path[0].y);
    path.slice(1).forEach((point) => graphics.lineTo(point.x, point.y));
    graphics.strokePath();

    graphics.lineStyle(4, this.palette.hud, 0.54);
    graphics.strokePath();

    this.add.image(195, 584, "fort").setScale(0.86).setDepth(12);
    this.add.text(195, 623, "Protect the keep", {
      color: "#fff7da",
      fontFamily: "Arial",
      fontSize: "14px",
      fontStyle: "bold",
      stroke: "#17202b",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);
    this.add.text(195, 681, this.selectedMapName, {
      color: "#fff7da",
      fontFamily: "Arial",
      fontSize: "12px",
      fontStyle: "bold",
      stroke: "#17202b",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);
  }

  private drawHud() {
    this.add.rectangle(195, 20, 360, 34, this.palette.hud, 0.82).setOrigin(0.5);
    this.hudText = this.add.text(195, 20, "", {
      color: "#ffffff",
      fontFamily: "Arial",
      fontSize: "14px",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.waveText = this.add.text(195, 58, "Wave 1", {
      color: "#17202b",
      fontFamily: "Arial",
      fontSize: "18px",
      fontStyle: "bold",
      backgroundColor: "#f2c14e",
      padding: { x: 14, y: 5 },
    }).setOrigin(0.5).setDepth(40);
    this.toastText = this.add.text(195, 92, "", {
      color: "#ffffff",
      fontFamily: "Arial",
      fontSize: "14px",
      fontStyle: "bold",
      backgroundColor: "#216869",
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(40).setAlpha(0);
  }

  private createBuildSlots() {
    const slots = [
      [98, 152],
      [292, 168],
      [75, 355],
      [315, 452],
      [124, 494],
      [278, 262],
    ];

    slots.forEach(([x, y]) => {
      const slot = this.add.rectangle(x, y, 58, 58, 0xf7f2e8, 0.72)
        .setStrokeStyle(3, 0x216869)
        .setDepth(3)
        .setInteractive({ useHandCursor: true });

      this.towerSlots.push(slot);
      this.add.text(x, y + 1, "+", {
        color: "#216869",
        fontFamily: "Arial",
        fontSize: "30px",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(4);
    });
  }

  private createTrapSlots() {
    trapPadPositions.forEach(([x, y]) => {
      const slot = this.add.rectangle(x, y, 46, 46, spikeTrapDefinition.color, 0.28)
        .setStrokeStyle(2, spikeTrapDefinition.color, 0.9)
        .setDepth(3);

      this.trapSlots.push(slot);
      this.add.text(x, y, "!", {
        color: "#3d4a35",
        fontFamily: "Arial",
        fontSize: "22px",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(4);
    });
  }

  private createTowerPicker() {
    starterTowers.forEach((tower, index) => {
      const x = 76 + index * 72;
      const button = this.add.rectangle(x, 656, 58, 44, tower.color)
        .setStrokeStyle(index === this.selectedTowerIndex ? 4 : 2, 0xffffff)
        .setDepth(30)
        .setInteractive({ useHandCursor: true });
      this.towerPickerButtons.push(button);
      this.add.image(x - 13, 656, towerAssetKeys[tower.id]).setScale(0.26).setDepth(31);
      this.add.text(x, 656, `${tower.icon} $${tower.baseCost}`, {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: "13px",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(32);

      button.on("pointerdown", () => {
        this.selectTower(index);
      });
    });

    const trapUnlocked = this.wave >= spikeTrapDefinition.unlockWave;
    this.trapPickerButton = this.add
      .rectangle(76, 612, 64, 36, trapUnlocked ? spikeTrapDefinition.color : 0x4b5563)
      .setStrokeStyle(this.selectedBuildMode === "trap" ? 4 : 2, 0xffffff)
      .setDepth(30)
      .setInteractive({ useHandCursor: true });
    this.add.image(50, 612, "spike-trap").setScale(0.32).setDepth(31).setAlpha(trapUnlocked ? 1 : 0.45);
    this.add
      .text(76, 612, trapUnlocked ? `${spikeTrapDefinition.icon} $${spikeTrapDefinition.baseCost}` : "W2", {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: "12px",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(32);

    this.trapPickerButton.on("pointerdown", () => this.selectTrap());

    const barracksUnlocked = this.wave >= barracksDefinition.unlockWave;
    this.barracksPickerButton = this.add
      .rectangle(160, 612, 64, 36, barracksUnlocked ? barracksDefinition.color : 0x4b5563)
      .setStrokeStyle(this.selectedBuildMode === "barracks" ? 4 : 2, 0xffffff)
      .setDepth(30)
      .setInteractive({ useHandCursor: true });
    this.add.image(134, 612, "barracks").setScale(0.32).setDepth(31).setAlpha(barracksUnlocked ? 1 : 0.45);
    this.add
      .text(160, 612, barracksUnlocked ? `${barracksDefinition.icon} $${barracksDefinition.baseCost}` : "W4", {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: "12px",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(32);

    this.barracksPickerButton.on("pointerdown", () => this.selectBarracks());

    this.abilityButton = this.add.rectangle(319, 656, 80, 44, this.heroTint)
      .setStrokeStyle(3, 0xffffff)
      .setDepth(30)
      .setInteractive({ useHandCursor: true });
    this.abilityText = this.add.text(319, 656, "Ability", {
      color: "#ffffff",
      fontFamily: "Arial",
      fontSize: "12px",
      fontStyle: "bold",
      align: "center",
      wordWrap: { width: 70 },
    }).setOrigin(0.5).setDepth(31);

    this.abilityButton.on("pointerdown", () => this.useHeroAbility());
  }

  private createHero() {
    this.add.image(195, 530, "hero-guardian").setScale(0.48).setTint(this.heroTint).setDepth(14);
    this.add.text(195, 492, this.selectedHeroName, {
      color: "#ffffff",
      fontFamily: "Arial",
      fontSize: "12px",
      fontStyle: "bold",
      stroke: "#17202b",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);
  }

  private tryBuildOrMerge(x: number, y: number) {
    if (this.isChoosingUpgrade) return;

    if (this.isGameOver) {
      this.scene.restart();
      return;
    }

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

    const existingBarracks = this.barracks.find(
      (barracksBuilding) => barracksBuilding.body.x === slot.x && barracksBuilding.body.y === slot.y,
    );

    if (existingBarracks) {
      this.tryBuildOrMergeBarracks(slot);
      return;
    }

    if (this.selectedBuildMode === "barracks") {
      this.tryBuildOrMergeBarracks(slot);
      return;
    }

    const existingTower = this.towers.find((tower) => tower.body.x === slot.x && tower.body.y === slot.y);

    if (existingTower) {
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

  private tryBuildOrMergeBarracks(slot: Phaser.GameObjects.Rectangle) {
    if (this.wave < barracksDefinition.unlockWave) {
      this.showToast(`Unlocks at wave ${barracksDefinition.unlockWave}`);
      return;
    }

    const existingBarracks = this.barracks.find(
      (barracksBuilding) => barracksBuilding.body.x === slot.x && barracksBuilding.body.y === slot.y,
    );
    const occupiedByTower = this.towers.some((tower) => tower.body.x === slot.x && tower.body.y === slot.y);

    if (!existingBarracks && occupiedByTower) {
      this.showToast("Remove the tower first");
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
    const body = this.add
      .image(spawnX, spawnY, "hero-guardian")
      .setScale(0.28)
      .setTint(barracksDefinition.color)
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
        if (distance > troop.attackRange) {
          const angle = Phaser.Math.Angle.Between(troop.body.x, troop.body.y, target.body.x, target.body.y);
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
              .forEach((enemy) => this.damageEnemy(enemy, troop.damage));
            this.flashCircle(troop.body.x, troop.body.y, troop.attackRange, 0xf2c14e);
          } else {
            this.damageEnemy(target, troop.damage);
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
            if (troop.body.active) troop.body.setTint(barracksDefinition.color);
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
        return (
          Phaser.Math.Distance.Between(trap.body.x, trap.body.y, enemy.body.x, enemy.body.y) < trap.triggerRadius
        );
      });

      if (!target) return;

      trap.lastTriggeredAt = time;
      this.damageEnemy(target, trap.damage);
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
    const definitions = this.getWaveEnemyMix();
    let delay = 0;

    definitions.forEach((definition) => {
      const count = definition.archetype === "boss" ? 1 : Math.min(6, 1 + this.wave);
      for (let index = 0; index < count; index += 1) {
        this.time.delayedCall(delay, () => this.spawnEnemy(definition));
        delay += definition.archetype === "boss" ? 1300 : 760;
      }
    });

    this.time.delayedCall(delay + 2800, () => {
      if (this.fortHp > 0) {
        this.showUpgradeChoice();
      }
    });
  }

  private getWaveEnemyMix() {
    if (this.wave % 5 === 0) {
      return enemyDefinitions.filter((enemy) => enemy.id === "gatebreaker");
    }

    if (this.wave >= 4) {
      return enemyDefinitions.filter((enemy) => ["grunt", "runner", "tank", "shield"].includes(enemy.id));
    }

    if (this.wave >= 2) {
      return enemyDefinitions.filter((enemy) => ["grunt", "runner"].includes(enemy.id));
    }

    return enemyDefinitions.filter((enemy) => enemy.id === "grunt");
  }

  private spawnEnemy(definition: EnemyDefinition) {
    const assetKey = enemyAssetKeys[definition.id] ?? "kenney-enemy-grunt";
    const body = this.add.image(path[0].x, path[0].y, assetKey)
      .setScale(definition.archetype === "boss" ? 0.58 : 0.46)
      .setDepth(16);
    const hpBar = this.add.rectangle(body.x, body.y - 28, 28, 4, 0x4f9d69)
      .setOrigin(0.5)
      .setDepth(17);

    this.enemies.push({
      body,
      hpBar,
      pathIndex: 1,
      hp: definition.hp + this.wave * 6,
      maxHp: definition.hp + this.wave * 6,
      speed: (0.046 + this.wave * 0.0015) * definition.speed,
      reward: Math.ceil(definition.reward * this.rewardMultiplier),
      damageToFort: Math.ceil(definition.damageToFort * 0.55),
    });
  }

  private moveEnemies(delta: number) {
    this.enemies = this.enemies.filter((enemy) => {
      const currentTarget = path[enemy.pathIndex];

      if (!currentTarget) {
        enemy.body.destroy();
        enemy.hpBar.destroy();
        this.fortHp = Math.max(0, this.fortHp - enemy.damageToFort);
        return false;
      }

      if (Phaser.Math.Distance.Between(enemy.body.x, enemy.body.y, currentTarget.x, currentTarget.y) < 8) {
        enemy.pathIndex += 1;
        return true;
      }

      const angle = Phaser.Math.Angle.Between(enemy.body.x, enemy.body.y, currentTarget.x, currentTarget.y);
      enemy.body.x += Math.cos(angle) * enemy.speed * delta;
      enemy.body.y += Math.sin(angle) * enemy.speed * delta;
      enemy.body.rotation = angle + Math.PI / 2;
      enemy.body.scale = (enemy.body.texture.key === "kenney-enemy-boss" ? 0.82 : 0.9) + (enemy.hp / enemy.maxHp) * 0.08;
      enemy.hpBar.setPosition(enemy.body.x, enemy.body.y - 30);
      enemy.hpBar.width = Math.max(3, 28 * (enemy.hp / enemy.maxHp));
      return enemy.hp > 0 && this.fortHp > 0;
    });
  }

  private shootNearestEnemy(tower: Tower, time: number) {
    if (time - tower.lastShotAt < tower.fireRateMs || this.enemies.length === 0) return;

    const target = this.enemies
      .filter((enemy) => Phaser.Math.Distance.Between(tower.body.x, tower.body.y, enemy.body.x, enemy.body.y) < tower.range)
      .sort((a, b) => {
        const distanceA = Phaser.Math.Distance.Between(tower.body.x, tower.body.y, a.body.x, a.body.y);
        const distanceB = Phaser.Math.Distance.Between(tower.body.x, tower.body.y, b.body.x, b.body.y);
        return distanceA - distanceB;
      })[0];

    if (!target) return;

    tower.lastShotAt = time;
    this.projectiles.push({
      body: this.add.image(tower.body.x, tower.body.y, "kenney-projectile").setScale(0.55).setDepth(18),
      target,
      damage: tower.damage,
      speed: 0.42,
    });
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
        projectile.target.hp -= projectile.damage;
        projectile.body.destroy();

        if (projectile.target.hp <= 0) {
          this.coins += projectile.target.reward;
          projectile.target.body.destroy();
          projectile.target.hpBar.destroy();
        }

        return false;
      }

      const angle = Phaser.Math.Angle.Between(
        projectile.body.x,
        projectile.body.y,
        projectile.target.body.x,
        projectile.target.body.y,
      );
      projectile.body.rotation = angle;
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
    });

    if (!this.hudText) return;
    this.hudText.setText(`HP ${this.fortHp}   Wave ${this.wave}   Coins ${this.coins}`);
    this.waveText?.setText(`Wave ${this.wave}`);
    this.updateAbilityButton();

    if (this.fortHp <= 0 && !this.isGameOver) {
      this.isGameOver = true;
      const reward = this.claimEndOfRunRewards();
      this.add.rectangle(195, 347, 308, 132, 0x17202b, 0.9);
      this.add.text(195, 320, "FORT LOST", {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: "26px",
        fontStyle: "bold",
      }).setOrigin(0.5);
      this.add.text(195, 356, `Earned ${reward} gems`, {
        color: "#f2c14e",
        fontFamily: "Arial",
        fontSize: "17px",
        fontStyle: "bold",
      }).setOrigin(0.5);
      this.add.text(195, 384, "Tap anywhere to restart", {
        color: "#f7f2e8",
        fontFamily: "Arial",
        fontSize: "15px",
      }).setOrigin(0.5);
    }
  }

  private selectTower(index: number) {
    if (this.isChoosingUpgrade) return;

    this.selectedBuildMode = "tower";
    this.selectedTowerIndex = index;
    this.towerPickerButtons.forEach((button, buttonIndex) => {
      button.setStrokeStyle(buttonIndex === index ? 4 : 2, 0xffffff);
    });
    this.clearSecondaryPickerSelection();
    this.showToast(`${starterTowers[index]?.name ?? "Tower"} selected`);
  }

  private selectTrap() {
    if (this.isChoosingUpgrade) return;

    if (this.wave < spikeTrapDefinition.unlockWave) {
      this.showToast(`Spike Trap unlocks at wave ${spikeTrapDefinition.unlockWave}`);
      return;
    }

    this.selectedBuildMode = "trap";
    this.towerPickerButtons.forEach((button) => button.setStrokeStyle(2, 0xffffff));
    this.clearSecondaryPickerSelection();
    this.trapPickerButton?.setStrokeStyle(4, 0xffffff);
    this.showToast("Tap a trap pad on the path");
  }

  private selectBarracks() {
    if (this.isChoosingUpgrade) return;

    if (this.wave < barracksDefinition.unlockWave) {
      this.showToast(`Barracks unlock at wave ${barracksDefinition.unlockWave}`);
      return;
    }

    this.selectedBuildMode = "barracks";
    this.towerPickerButtons.forEach((button) => button.setStrokeStyle(2, 0xffffff));
    this.clearSecondaryPickerSelection();
    this.barracksPickerButton?.setStrokeStyle(4, 0xffffff);
    this.showToast("Tap a build pad for barracks");
  }

  private clearSecondaryPickerSelection() {
    this.trapPickerButton?.setStrokeStyle(2, 0xffffff);
    this.barracksPickerButton?.setStrokeStyle(2, 0xffffff);
  }

  private showToast(message: string) {
    if (!this.toastText) return;

    this.toastText.setText(message).setAlpha(1);
    this.tweens.killTweensOf(this.toastText);
    this.tweens.add({
      targets: this.toastText,
      alpha: 0,
      duration: 450,
      delay: 1200,
      ease: "Sine.easeIn",
    });
  }

  private updateAbilityButton() {
    if (!this.abilityText || !this.abilityButton) return;

    const remainingMs = this.nextHeroAbilityAt - this.time.now;
    if (remainingMs > 0) {
      this.abilityText.setText(`${Math.ceil(remainingMs / 1000)}s`);
      this.abilityButton.setFillStyle(0x4b5563, 0.88);
      return;
    }

    this.abilityText.setText(this.selectedHeroAbility);
    this.abilityButton.setFillStyle(this.heroTint, 1);
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
        this.damageEnemy(enemy, 72);
        const tracer = this.add.line(0, 0, 195, 530, enemy.body.x, enemy.body.y, 0xf2c14e, 0.85).setOrigin(0).setDepth(50);
        this.tweens.add({ targets: tracer, alpha: 0, duration: 260, onComplete: () => tracer.destroy() });
      });
      this.showToast("Piercing volley fired");
      return;
    }

    this.enemies.forEach((enemy) => this.damageEnemy(enemy, 46));
    this.flashCircle(195, 326, 170, 0xb85c38);
    this.showToast("Meteor sigil burned the lane");
  }

  private damageEnemy(enemy: Enemy, damage: number) {
    if (!enemy.body.active) return;

    enemy.hp -= damage;
    enemy.body.setTintFill(0xffffff);
    this.time.delayedCall(80, () => {
      if (enemy.body.active) enemy.body.clearTint();
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

    this.isChoosingUpgrade = true;
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

    offeredUpgrades.forEach((upgrade, index) => {
      const y = 247 + index * 106;
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
    this.wave += 1;
    this.coins += 30;
    this.refreshSecondaryPickerLocks();
    this.showToast(`${upgrade.name} gained`);
    this.spawnWave();
  }

  private refreshSecondaryPickerLocks() {
    if (this.trapPickerButton) {
      const trapUnlocked = this.wave >= spikeTrapDefinition.unlockWave;
      this.trapPickerButton.setFillStyle(trapUnlocked ? spikeTrapDefinition.color : 0x4b5563);
    }

    if (this.barracksPickerButton) {
      const barracksUnlocked = this.wave >= barracksDefinition.unlockWave;
      this.barracksPickerButton.setFillStyle(barracksUnlocked ? barracksDefinition.color : 0x4b5563);
    }
  }

  private applyUpgrade(upgrade: UpgradeDefinition) {
    switch (upgrade.target) {
      case "archer-damage":
        this.towerDamageMultiplier += upgrade.value;
        this.towers.forEach((tower) => {
          tower.damage *= 1 + upgrade.value;
        });
        this.traps.forEach((trap) => {
          trap.damage *= 1 + upgrade.value;
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
      case "magic-priority":
        this.towerDamageMultiplier += upgrade.value * 0.5;
        this.towers.forEach((tower) => {
          tower.damage *= 1 + upgrade.value * 0.5;
        });
        this.traps.forEach((trap) => {
          trap.damage *= 1 + upgrade.value * 0.5;
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

    this.selectedHeroName = selectedHero.name;
    this.selectedHeroRole = selectedHero.role;
    this.selectedHeroAbility = selectedHero.ability;
    this.heroCooldownMs = selectedHero.cooldownSeconds * 1000;
    this.selectedMapName = selectedMap.name;
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
    return useGameStore.getState().claimRunRewards(this.wave, this.coins);
  }
}

function parseHexColor(value: string, fallback: number) {
  const parsed = Number.parseInt(value.replace("#", ""), 16);
  return Number.isNaN(parsed) ? fallback : parsed;
}
