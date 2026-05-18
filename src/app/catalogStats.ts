import type { BuildingDefinition } from "../data/buildings";
import type { EnemyDefinition } from "../data/enemies";
import type { HeroDefinition } from "../data/heroes";
import type { TroopDefinition } from "../data/troops";
import type { UpgradeDefinition } from "../data/upgrades";

export type CatalogStat = {
  label: string;
  value: string;
};

function formatMs(ms: number) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function formatSpeedMultiplier(speed: number) {
  return `${speed.toFixed(2)}×`;
}

/** Fort damage applied when an enemy reaches the fort (×0.55 in RunScene). */
export function scaledFortLeak(damageToFort: number) {
  return Math.ceil(damageToFort * 0.55);
}

export function getBuildingCatalogStats(building: BuildingDefinition): CatalogStat[] {
  const stats: CatalogStat[] = [
    { label: "Cost", value: `${building.baseCost} coins` },
    { label: "Unlock", value: `Wave ${building.unlockWave}` },
    { label: "Max tier", value: String(building.maxTier) },
  ];

  const { stats: s } = building;

  if (building.role === "tower") {
    stats.push(
      { label: "Damage", value: String(s.damage) },
      { label: "Range", value: String(s.range) },
      { label: "Fire rate", value: formatMs(s.fireRateMs) },
    );
    if (s.splash) {
      stats.push({ label: "Splash", value: String(s.splash) });
    }
    stats.push({ label: "Pad upgrade", value: "25 coins / tier" });
  } else if (building.role === "trap") {
    stats.push(
      { label: "Damage", value: String(s.damage) },
      { label: "Cooldown", value: formatMs(s.cooldownMs) },
      { label: "Pad upgrade", value: "25 coins / tier" },
    );
  } else if (building.role === "spawner") {
    stats.push(
      { label: "Troop HP base", value: String(s.troopHp) },
      { label: "Spawn rate", value: formatMs(s.spawnRateMs) },
      { label: "Pad upgrade", value: "25 coins / tier" },
    );
  } else if (building.role === "economy") {
    stats.push(
      { label: "Income", value: `${s.income} coins / wave` },
      { label: "Pad upgrade", value: "25 coins / tier" },
    );
  } else if (building.role === "wall") {
    stats.push(
      { label: "Fort shield", value: `${s.fortShield} / tier` },
      { label: "Pad upgrade", value: "25 coins / tier" },
    );
  } else if (building.role === "support") {
    stats.push(
      { label: "Fort repair", value: `${s.repair} HP / boss wave` },
      { label: "Pad upgrade", value: "25 coins / tier" },
    );
  }

  return stats;
}

export function getEnemyCatalogStats(enemy: EnemyDefinition): CatalogStat[] {
  const stats: CatalogStat[] = [
    { label: "HP", value: `${enemy.hp} (+5 / wave)` },
    { label: "Speed", value: formatSpeedMultiplier(enemy.speed) },
    { label: "Reward", value: `${enemy.reward} coins` },
    {
      label: "Fort leak",
      value: `${scaledFortLeak(enemy.damageToFort)} (${enemy.damageToFort} base)`,
    },
  ];

  if (enemy.ability && enemy.ability !== "None") {
    stats.push({ label: "Ability", value: enemy.ability });
  }

  if (enemy.archetype === "shield") {
    stats.push({ label: "Armor", value: "50% vs archer" });
  }
  if (enemy.archetype === "flyer") {
    stats.push({ label: "Flying", value: "Ignores traps" });
  }
  if (enemy.archetype === "exploder") {
    stats.push({ label: "Explosion", value: "+55% leak dmg" });
  }

  return stats;
}

export function getTroopCatalogStats(troop: TroopDefinition): CatalogStat[] {
  return [
    { label: "HP", value: String(troop.hp) },
    { label: "Damage", value: String(troop.damage) },
    { label: "Role", value: troop.role },
    { label: "Unlock", value: troop.unlock },
  ];
}

export function getHeroCatalogStats(hero: HeroDefinition): CatalogStat[] {
  const stats: CatalogStat[] = [
    { label: "Role", value: hero.role },
    { label: "Ability CD", value: `${hero.cooldownSeconds}s` },
    { label: "Ability", value: hero.ability },
  ];

  if (hero.role === "guardian") {
    stats.push(
      { label: "Passive", value: "+35 max fort HP" },
      { label: "Ability fx", value: "+55 fort HP" },
    );
  } else if (hero.role === "ranger") {
    stats.push(
      { label: "Passive", value: "+10% tower dmg, 8% fire rate" },
      { label: "Ability fx", value: "72 dmg × 3 targets" },
    );
  } else if (hero.role === "mage") {
    stats.push(
      { label: "Passive", value: "+20% coin rewards, +25 start" },
      { label: "Ability fx", value: "46 dmg all enemies" },
    );
  }

  return stats;
}

export function getPermanentUpgradeCatalogStats(upgrade: {
  id: string;
  valuePerLevel: number;
}): CatalogStat[] {
  switch (upgrade.id) {
    case "fortHp":
      return [{ label: "Per level", value: `+${upgrade.valuePerLevel} max fort HP` }];
    case "startingCoins":
      return [{ label: "Per level", value: `+${upgrade.valuePerLevel} start coins` }];
    case "towerDamage":
      return [{ label: "Per level", value: `+${Math.round(upgrade.valuePerLevel * 100)}% tower damage` }];
    default:
      return [];
  }
}

export function getUpgradeCatalogStats(upgrade: UpgradeDefinition): CatalogStat[] {
  const stats: CatalogStat[] = [{ label: "Rarity", value: upgrade.rarity }];

  switch (upgrade.target) {
    case "archer-damage":
      stats.push({ label: "Effect", value: `Archer dmg +${Math.round(upgrade.value * 100)}%` });
      break;
    case "fire-rate":
      stats.push({ label: "Effect", value: `Fire rate +${Math.round(upgrade.value * 100)}%` });
      break;
    case "fort-hp":
      stats.push({ label: "Effect", value: `+${upgrade.value} fort HP` });
      break;
    case "coin-reward":
      stats.push({ label: "Effect", value: `Kill rewards +${Math.round(upgrade.value * 100)}%` });
      break;
    case "cannon-splash":
      stats.push({ label: "Effect", value: `Splash radius +${Math.round(upgrade.value * 100)}%` });
      break;
    case "magic-priority":
      stats.push({ label: "Effect", value: "Magic targets armor first" });
      break;
    default:
      stats.push({ label: "Effect", value: upgrade.description });
  }

  return stats;
}
