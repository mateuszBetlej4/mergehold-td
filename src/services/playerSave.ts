import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "../lib/supabaseClient";
import { getDefaultProgress, type PlayerProgress } from "../state/useGameStore";

type PlayerSaveRow = {
  user_id: string;
  save_version: number;
  best_wave: number;
  soft_currency: number;
  hard_currency: number;
  unlocked_content: Record<string, unknown>;
  permanent_upgrades: Partial<PlayerProgress["permanentUpgrades"]>;
  settings: {
    soundEnabled?: boolean;
    musicEnabled?: boolean;
    selectedHeroId?: string;
    selectedMapId?: string;
  };
};

const saveVersion = 1;

export function mapRowToProgress(row: PlayerSaveRow): PlayerProgress {
  const defaults = getDefaultProgress();
  return {
    ...defaults,
    bestWave: row.best_wave,
    softCurrency: row.soft_currency,
    selectedHeroId: row.settings?.selectedHeroId ?? defaults.selectedHeroId,
    selectedMapId: row.settings?.selectedMapId ?? defaults.selectedMapId,
    permanentUpgrades: {
      ...defaults.permanentUpgrades,
      ...row.permanent_upgrades,
    },
    soundEnabled: typeof row.settings?.soundEnabled === "boolean" ? row.settings.soundEnabled : defaults.soundEnabled,
    musicEnabled: typeof row.settings?.musicEnabled === "boolean" ? row.settings.musicEnabled : defaults.musicEnabled,
  };
}

export function mergeProgress(localProgress: PlayerProgress, cloudProgress: PlayerProgress): PlayerProgress {
  const defaults = getDefaultProgress();
  return {
    ...defaults,
    ...cloudProgress,
    bestWave: Math.max(localProgress.bestWave, cloudProgress.bestWave),
    softCurrency: Math.max(localProgress.softCurrency, cloudProgress.softCurrency),
    selectedHeroId: cloudProgress.selectedHeroId || localProgress.selectedHeroId,
    selectedMapId: cloudProgress.selectedMapId || localProgress.selectedMapId,
    soundEnabled: cloudProgress.soundEnabled,
    musicEnabled: cloudProgress.musicEnabled,
    permanentUpgrades: {
      fortHp: Math.max(localProgress.permanentUpgrades.fortHp, cloudProgress.permanentUpgrades.fortHp),
      startingCoins: Math.max(localProgress.permanentUpgrades.startingCoins, cloudProgress.permanentUpgrades.startingCoins),
      towerDamage: Math.max(localProgress.permanentUpgrades.towerDamage, cloudProgress.permanentUpgrades.towerDamage),
      coinGain: Math.max(localProgress.permanentUpgrades.coinGain, cloudProgress.permanentUpgrades.coinGain),
    },
  };
}

export function mapProgressToRow(userId: string, progress: PlayerProgress) {
  return {
    user_id: userId,
    save_version: saveVersion,
    best_wave: progress.bestWave,
    soft_currency: progress.softCurrency,
    hard_currency: 0,
    permanent_upgrades: progress.permanentUpgrades,
    settings: {
      soundEnabled: progress.soundEnabled,
      musicEnabled: progress.musicEnabled,
      selectedHeroId: progress.selectedHeroId,
      selectedMapId: progress.selectedMapId,
    },
    updated_at: new Date().toISOString(),
  };
}

export async function ensureProfile(user: User) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  await supabase.from("profiles").upsert({
    id: user.id,
    display_name: user.email?.split("@")[0] ?? "Guardian",
    updated_at: new Date().toISOString(),
  });
}

export async function loadPlayerSave(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("player_saves")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<PlayerSaveRow>();

  if (error) throw error;
  return data ? mapRowToProgress(data) : null;
}

export async function upsertPlayerSave(userId: string, progress: PlayerProgress) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.from("player_saves").upsert(mapProgressToRow(userId, progress), {
    onConflict: "user_id",
  });

  if (error) throw error;
}
