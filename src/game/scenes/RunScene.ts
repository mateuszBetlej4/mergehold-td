import Phaser from "phaser";
import { buildingDefinitions } from "../../data/buildings";
import { enemyDefinitions, type EnemyDefinition } from "../../data/enemies";
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

const path = [
  new Phaser.Math.Vector2(195, 38),
  new Phaser.Math.Vector2(195, 132),
  new Phaser.Math.Vector2(96, 236),
  new Phaser.Math.Vector2(286, 346),
  new Phaser.Math.Vector2(195, 504),
];

const starterTowers = buildingDefinitions.filter((building) => building.role === "tower").slice(0, 3);

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
  private towers: Tower[] = [];
  private towerPickerButtons: Phaser.GameObjects.Rectangle[] = [];
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
  private hudText?: Phaser.GameObjects.Text;
  private waveText?: Phaser.GameObjects.Text;
  private toastText?: Phaser.GameObjects.Text;
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
  }

  create() {
    this.applyPermanentProgress();
    this.drawMap();
    this.drawHud();
    this.createBuildSlots();
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
    this.moveProjectiles(delta);
    this.towers.forEach((tower) => this.shootNearestEnemy(tower, time));
    this.updateHud();
  }

  private drawMap() {
    this.add.rectangle(195, 347, 390, 694, this.palette.ground);
    this.add.image(36, 104, "kenney-tree").setScale(0.72).setDepth(1);
    this.add.image(345, 104, "kenney-tree").setScale(0.64).setDepth(1);
    this.add.image(52, 526, "kenney-tree").setScale(0.6).setDepth(1);
    this.add.image(345, 565, "kenney-tree").setScale(0.74).setDepth(1);

    const graphics = this.add.graphics();
    graphics.setDepth(2);
    graphics.lineStyle(44, this.palette.path, 1);
    graphics.beginPath();
    graphics.moveTo(path[0].x, path[0].y);
    path.slice(1).forEach((point) => graphics.lineTo(point.x, point.y));
    graphics.strokePath();

    graphics.lineStyle(4, 0x8b6f47, 0.72);
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

    this.add.text(306, 656, "Tap slot", {
      color: "#17202b",
      fontFamily: "Arial",
      fontSize: "13px",
      fontStyle: "bold",
    }).setOrigin(0.5);
  }

  private createHero() {
    this.add.image(195, 530, "hero-guardian").setScale(0.48).setDepth(14);
  }

  private tryBuildOrMerge(x: number, y: number) {
    if (this.isChoosingUpgrade) return;

    if (this.isGameOver) {
      this.scene.restart();
      return;
    }

    const slot = this.towerSlots.find((candidate) => {
      return Phaser.Math.Distance.Between(x, y, candidate.x, candidate.y) < 32;
    });

    if (!slot) return;

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
      damage: definition.stats.damage,
      range: definition.stats.range,
      fireRateMs: Math.round(definition.stats.fireRateMs * this.fireRateMultiplier),
      lastShotAt: 0,
    });
    this.showToast(`${definition.name} built`);
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

    this.selectedTowerIndex = index;
    this.towerPickerButtons.forEach((button, buttonIndex) => {
      button.setStrokeStyle(buttonIndex === index ? 4 : 2, 0xffffff);
    });
    this.showToast(`${starterTowers[index]?.name ?? "Tower"} selected`);
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
    this.showToast(`${upgrade.name} gained`);
    this.spawnWave();
  }

  private applyUpgrade(upgrade: UpgradeDefinition) {
    switch (upgrade.target) {
      case "archer-damage":
        this.towerDamageMultiplier += upgrade.value;
        this.towers.forEach((tower) => {
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
      case "magic-priority":
        this.towerDamageMultiplier += upgrade.value * 0.5;
        this.towers.forEach((tower) => {
          tower.damage *= 1 + upgrade.value * 0.5;
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

  private applyPermanentProgress() {
    const { permanentUpgrades } = useGameStore.getState().progress;
    this.maxFortHp = 180 + permanentUpgrades.fortHp * 18;
    this.fortHp = this.maxFortHp;
    this.coins = 150 + permanentUpgrades.startingCoins * 15;
    this.towerDamageMultiplier = 1 + permanentUpgrades.towerDamage * 0.08;
  }

  private claimEndOfRunRewards() {
    if (this.runRewardClaimed) return 0;

    this.runRewardClaimed = true;
    return useGameStore.getState().claimRunRewards(this.wave, this.coins);
  }
}
