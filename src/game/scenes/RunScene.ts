import Phaser from "phaser";
import { buildingDefinitions } from "../../data/buildings";
import { enemyDefinitions, type EnemyDefinition } from "../../data/enemies";
import { useGameStore } from "../../state/useGameStore";

type Enemy = {
  body: Phaser.GameObjects.Image;
  hp: number;
  maxHp: number;
  speed: number;
  reward: number;
  damageToFort: number;
};

type Tower = {
  body: Phaser.GameObjects.Image;
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
  private fortHp = 100;
  private coins = 100;
  private wave = 1;
  private selectedTowerIndex = 0;
  private hudText?: Phaser.GameObjects.Text;
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
    this.drawMap();
    this.drawHud();
    this.createBuildSlots();
    this.createTowerPicker();
    this.createHero();
    this.spawnWave();

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.tryBuildOrMerge(pointer.x, pointer.y);
    });
  }

  update(time: number, delta: number) {
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
  }

  private drawHud() {
    this.add.rectangle(195, 20, 360, 34, this.palette.hud, 0.82).setOrigin(0.5);
    this.hudText = this.add.text(195, 20, "", {
      color: "#ffffff",
      fontFamily: "Arial",
      fontSize: "14px",
      fontStyle: "bold",
    }).setOrigin(0.5);
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
      this.add.image(x - 13, 656, towerAssetKeys[tower.id]).setScale(0.26).setDepth(31);
      this.add.text(x, 656, `${tower.icon} $${tower.baseCost}`, {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: "13px",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(32);

      button.on("pointerdown", () => {
        this.selectedTowerIndex = index;
        this.scene.restart();
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
    const slot = this.towerSlots.find((candidate) => {
      return Phaser.Math.Distance.Between(x, y, candidate.x, candidate.y) < 32;
    });

    if (!slot) return;

    const existingTower = this.towers.find((tower) => tower.body.x === slot.x && tower.body.y === slot.y);

    if (existingTower) {
      if (this.coins >= 15 && existingTower.tier < 5) {
        this.coins -= 15;
        existingTower.tier += 1;
        existingTower.damage += 8;
        existingTower.range += 4;
        existingTower.body.setScale(0.58 + existingTower.tier * 0.05);
        existingTower.badge.setText(String(existingTower.tier));
      }
      return;
    }

    const definition = starterTowers[this.selectedTowerIndex] ?? starterTowers[0];
    if (this.coins < definition.baseCost) return;

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
      badge,
      tier: 1,
      damage: definition.stats.damage,
      range: definition.stats.range,
      fireRateMs: definition.stats.fireRateMs,
      lastShotAt: 0,
    });
  }

  private spawnWave() {
    const definitions = this.getWaveEnemyMix();
    let delay = 0;

    definitions.forEach((definition) => {
      const count = definition.archetype === "boss" ? 1 : 2 + this.wave;
      for (let index = 0; index < count; index += 1) {
        this.time.delayedCall(delay, () => this.spawnEnemy(definition));
        delay += definition.archetype === "boss" ? 1200 : 560;
      }
    });

    this.time.delayedCall(delay + 2800, () => {
      if (this.fortHp > 0) {
        this.wave += 1;
        this.coins += 24;
        this.spawnWave();
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

    this.enemies.push({
      body,
      hp: definition.hp + this.wave * 6,
      maxHp: definition.hp + this.wave * 6,
      speed: (0.052 + this.wave * 0.002) * definition.speed,
      reward: definition.reward,
      damageToFort: definition.damageToFort,
    });
  }

  private moveEnemies(delta: number) {
    this.enemies = this.enemies.filter((enemy) => {
      const currentTarget = path.find((point) => {
        return Phaser.Math.Distance.Between(enemy.body.x, enemy.body.y, point.x, point.y) > 8;
      });

      if (!currentTarget) {
        enemy.body.destroy();
        this.fortHp = Math.max(0, this.fortHp - enemy.damageToFort);
        return false;
      }

      const angle = Phaser.Math.Angle.Between(enemy.body.x, enemy.body.y, currentTarget.x, currentTarget.y);
      enemy.body.x += Math.cos(angle) * enemy.speed * delta;
      enemy.body.y += Math.sin(angle) * enemy.speed * delta;
      enemy.body.rotation = angle + Math.PI / 2;
      enemy.body.scale = (enemy.body.texture.key === "kenney-enemy-boss" ? 0.82 : 0.9) + (enemy.hp / enemy.maxHp) * 0.08;
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

    if (this.fortHp <= 0) {
      this.add.rectangle(195, 347, 308, 132, 0x17202b, 0.9);
      this.add.text(195, 320, "FORT LOST", {
        color: "#ffffff",
        fontFamily: "Arial",
        fontSize: "26px",
        fontStyle: "bold",
      }).setOrigin(0.5);
      this.add.text(195, 362, "Refresh to restart this shell", {
        color: "#f7f2e8",
        fontFamily: "Arial",
        fontSize: "15px",
      }).setOrigin(0.5);
      this.scene.pause();
    }
  }
}
