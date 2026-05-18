# Mergehold TD — Game Balance Reference

> **Last updated:** 2026-05-18  
> **Policy decisions:** [DEC-029](../tracking/DECISION_LOG.md#dec-029-wave-spawn-tables--combat-ability-pass), [DEC-030](../tracking/DECISION_LOG.md#dec-030-distinct-upgrade--enemy-combat-behaviors), [DEC-032](../tracking/DECISION_LOG.md#dec-032-combat--economy-sink-pass)  
> **Economy agent handoff:** [2026-05-18-economy.md](../handoffs/2026-05-18-economy.md) — coin/gem research workflow and tuning scope  
> **Playtest viewport:** 390×844 mobile portrait  
> **Runtime owner:** `src/game/scenes/RunScene.ts` applies all formulas below; `src/data/*` holds base numbers.

---

## 1. Architecture — where numbers live

| Layer | Path | Role |
|-------|------|------|
| Enemy bases | `src/data/enemies.ts` | HP, speed multiplier, reward, fort damage, archetype |
| Wave spawns | `src/data/waves.ts` | **Single source of truth** for who spawns, how many, spawn interval |
| Towers / support | `src/data/buildings.ts` | Damage, range, fire rate, splash, income, etc. |
| Run upgrades | `src/data/upgrades.ts` | Roguelike card `target` + `value` |
| Troops | `src/data/troops.ts` | Barracks unit stats by tier |
| Heroes | `src/data/heroes.ts` | Role, ability, cooldown |
| Meta shop | `src/state/useGameStore.ts` | Gems, permanent upgrades, wave-clear drip |
| Combat runtime | `src/game/scenes/RunScene.ts` | Scaling, damage resolution, abilities, economy hooks |

During a run, `RunScene` copies data on spawn/build and mutates multipliers (`towerDamageMultiplier`, `rewardMultiplier`, `fireRateMultiplier`, `cannonSplashBonus`, `magicPrioritizeArmored`).

---

## 2. Design targets

These guided the 2026-05-18 balance pass:

| Goal | Target |
|------|--------|
| Waves 1–2 | Teach placement; one T1 archer should leak &lt;15% fort HP on grunt waves |
| Wave 5 boss | Gatebreaker threatening but killable with 2–3 towers + light upgrades |
| Wave 10 | Mixed towers + 1–2 roguelike picks; not auto-win |
| No towers | Fort death roughly waves 3–4 (runner/grunt pressure) |
| Wave 8+ | No spawn flood (old system hit 50+ enemies); cap ~16–31 explicit spawns |

---

## 3. Enemies

### 3.1 Base stats (`enemies.ts`)

| ID | Archetype | Base HP | Speed× | Reward | Fort dmg (base) | Ability |
|----|-----------|--------:|-------:|-------:|----------------:|---------|
| grunt | grunt | 30 | 1.00 | 6 | 7 | — |
| runner | runner | 20 | 1.65 | 7 | 5 | Fast |
| tank | tank | 115 | 0.62 | 14 | 12 | High HP |
| shield | shield | 82 | 0.86 | 10 | 9 | Armor (50% vs archer) |
| bat | flyer | 26 | 1.45 | 8 | 6 | Flying (ignores traps) |
| bomber | exploder | 54 | 1.05 | 11 | 18 | Explodes at fort |
| gatebreaker | boss | 520 | 0.48 | 115 | 35 | Boss |

### 3.2 Runtime scaling (on spawn)

```text
maxHp     = baseHp + wave × 6
speed     = (0.046 + wave × 0.0015) × definition.speed
reward    = ceil(baseReward × rewardMultiplier)   // starts at 1.0
damageToFort = ceil(baseFortDamage × 0.55)
```

**Example effective HP @ key waves**

| Enemy | W1 | W5 | W10 | W15 |
|-------|---:|---:|----:|----:|
| grunt | 36 | 60 | 90 | 120 |
| runner | 26 | 50 | 80 | 110 |
| tank | 121 | 145 | 175 | 205 |
| shield | 88 | 112 | 142 | 172 |
| bat | 32 | 56 | 86 | 116 |
| bomber | 60 | 84 | 114 | 144 |
| gatebreaker | 526 | **550** | 580 | 610 |

**Example fort damage per leak (after ×0.55)**

| Enemy | Per leak |
|-------|--------:|
| grunt | 4 |
| runner | 3 |
| tank | 7 |
| shield | 5 |
| bat | 4 |
| bomber | 10 (+ 55% explosion bonus = **16 total**) |
| gatebreaker | 19 |

### 3.3 Enemy abilities (runtime)

| Archetype | Behavior | Implementation |
|-----------|----------|----------------|
| **shield** | Resists arrows | `damage × 0.5` when `source === "archer"`. Cannon, magic, traps, troops, hero: full damage. |
| **flyer** (bat) | Skips traps | `triggerTraps` ignores `archetype === "flyer"`. |
| **exploder** (bomber) | Detonates at fort | On path end: `applyFortDamage(damageToFort)` then `applyFortDamage(ceil(damageToFort × 0.55))` + red flash. |
| **boss** | Milestone fight | Only spawn on waves 5, 10, 15, … (see waves). |

Magic towers **ignore armor** (no reduction vs shield). Building copy: *"Ignores armor and marks priority targets."*

---

## 4. Waves & spawning

### 4.1 Source of truth

`RunScene.spawnWave()` calls `getWaveSpawnGroups(wave)` from `src/data/waves.ts`.

- **Waves 1–15:** explicit `waveDefinitions` tables (counts + `intervalMs` per group).
- **Wave 16+:** procedural groups from tier table + shared budget.
- **Boss waves:** every `wave % 5 === 0` → gatebreaker only.

`offersUpgrade` in wave data is documentary today; upgrade UI still triggers on **every** wave clear via `showUpgradeChoice()`.

### 4.2 Tier introduction (DEC-025)

| First wave | Enemy types in pool (non-boss) |
|------------|--------------------------------|
| 1 | grunt |
| 2+ | grunt, runner |
| 4+ | + tank, shield |
| 6+ | + bat |
| 8+ | + bomber |
| 5, 10, 15… | gatebreaker **only** |

### 4.3 Explicit spawn tables (waves 1–15)

Total enemies = sum of `count` in all groups. Spawn stagger = cumulative `intervalMs` per enemy in group order.

| Wave | Total | Composition (count per type) |
|-----:|------:|------------------------------|
| 1 | 6 | G6 |
| 2 | 8 | G5 R3 |
| 3 | 10 | G4 R6 |
| 4 | 11 | G3 R3 T2 D3 |
| 5 | 1 | **Boss×1** |
| 6 | 11 | G4 R4 F3 |
| 7 | 16 | G4 R5 T2 D2 F3 |
| 8 | 17 | G3 R4 T2 D2 F3 X3 |
| 9 | 21 | G4 R5 T3 D3 F4 X2 |
| 10 | 1 | **Boss×1** |
| 11 | 25 | G5 R5 T3 D3 F4 X3 |
| 12 | 27 | G5 R6 T3 D3 F5 X3 |
| 13 | 28 | G6 R6 T3 D4 F5 X4 |
| 14 | 31 | G6 R7 T4 D4 F6 X4 |
| 15 | 1 | **Boss×1** |

Legend: G=grunt, R=runner, T=tank, D=shield, F=bat, X=bomber.

**Wave-clear timing:** `waveReadyForClear` is set `delay + 2800ms` after last spawn, where `delay` is the sum of all spawn delays.

### 4.4 Procedural waves (16+)

```text
enemyIds = getWaveEnemyIds(wave)     // tier table; boss if wave % 5 === 0
budget   = min(28, 8 + floor(wave × 0.75))
perType  = max(1, floor(budget / enemyIds.length))
interval = 920ms (tank/shield/gatebreaker) or 640ms (others)
```

Example wave 20 (non-boss): 6 types, budget = 23, perType = 3 → **18 enemies**.

### 4.5 Historical note (pre–DEC-029)

Old `getWaveEnemyMix()` used `count = min(6, 1 + wave)` **per archetype** in the mix. Wave 8 could spawn **54** enemies (6 types × 9). Replaced by explicit tables + shared budget.

---

## 5. Towers

### 5.1 Base stats @ tier 1 (`buildings.ts`)

| Tower | Cost | Damage | Range | Fire rate | Extra |
|-------|-----:|-------:|------:|----------:|-------|
| Archer (A) | 30 | 16 | 166 | 520ms | Single target |
| Cannon (C) | 52 | 28 | 136 | 900ms | Splash radius 42 (see §6) |
| Magic (M) | 65 | 22 | 154 | 680ms | Ignores armor; priority targeting with upgrade |

Place: tap tower in dock → tap `+` pad. Unlock: A W1, C W2, M W3.

### 5.2 Tier upgrades (in-run)

- **Cost:** `padTierUpgradeCost` (25 coins) per tier bump on same pad (`buildings.ts`).
- **Max tier:** 5 (towers).
- **Per tier:** `damage += 8 × towerDamageMultiplier`, `range += 4`.

Effective T3 archer (no meta): `(16 + 16) × mult = 32 × mult` damage, ~520ms fire → ~61 DPS @ mult=1.

### 5.3 Targeting

- Default: nearest enemy in range.
- **Magic + Arcane Focus:** prefers shield, tank, then boss (`archetype` sort), then nearest.

### 5.4 Projectiles

- Homing to selected target; hit at distance &lt; 9px.
- Damage routed through `damageEnemy(enemy, damage, source)` with `source` ∈ `archer | cannon | magic | …`.

---

## 6. Cannon splash

On cannon hit:

```text
splashRadius  = stats.splash × (1 + cannonSplashBonus)    // base splash = 42
splashDamage  = max(1, round(primaryDamage × 0.45))
```

- Primary target takes full projectile damage.
- Other enemies within radius take splash damage (`source: cannon`).
- Visual: brown flash circle at impact.
- **Powder Kegs** upgrade: `cannonSplashBonus += 0.22`; cannon tower damage `×= 1.077` (35% of value).

---

## 7. Traps & support buildings

### 7.1 Spike trap

| Stat | Value |
|------|------:|
| Cost | 35 |
| Unlock | Wave 2 |
| Base damage | 10 × tier × `towerDamageMultiplier` |
| Cooldown | 500ms |
| Max tier | 4 |
| Pad upgrade | 25 coins/tier |

Trigger radius grows with tier (`34 + tier × 3`). **Does not affect flyers (bat).**

### 7.2 Stone wall

| Stat | Value |
|------|------:|
| Cost | 42 |
| `fortShield` | 18 × tier per wall |
| Refresh | Shield pool refilled to max at start of each new wave |

Damage hits shield first, then fort HP.

### 7.3 Coin mill

| Stat | Value |
|------|------:|
| Cost | 52 |
| Unlock | Wave 3 |
| Income | `15 × tier` coins per wave clear (in upgrade overlay) |

### 7.4 Barracks

| Stat | Value |
|------|------:|
| Cost | 70 |
| Unlock | Wave 4 |
| Spawn rate | `3600ms` base, scales down with tier |
| Max troops | 10 on field |

Troop stats: `troops.ts` + `barracks.stats.troopHp`, tier bonus `1 + (tier-1)×0.18`, damage × `towerDamageMultiplier`.

| Barracks tier | Troop |
|--------------:|-------|
| 1 | Squire (blocker) |
| 2 | Longbow (ranged) |
| 3+ | Alchemist (burst AoE) |

### 7.5 Healing shrine

| Stat | Value |
|------|------:|
| Cost | 78 |
| Unlock | Wave 5 |
| Repair | `12 × tier` fort HP after clearing a **boss wave** (`wave % 5 === 0`) |

---

## 8. Roguelike upgrades (in-run)

Offered **3 random cards** from all 6 definitions (equal weight — [BUG-022](../tracking/BUG_TRACKER.md)). Picking one grants **+25 coins** (+35 on boss waves) and pauses until **Start Wave**.

| Card | Rarity | Target | Effect |
|------|--------|--------|--------|
| Sharp Arrows | common | `archer-damage` | Archer towers only: `damage ×= 1.15` |
| Quick Hands | common | `fire-rate` | All towers: `fireRateMs ×= 0.9`, `fireRateMultiplier` reduced (floor 0.55) |
| Reinforced Gate | common | `fort-hp` | `maxFortHp += 20`, heal +20 |
| Powder Kegs | rare | `cannon-splash` | Splash radius +22%; cannon damage `×= 1.077` |
| Arcane Focus | rare | `magic-priority` | Magic prioritizes armored; magic damage `×= 1.12`; enables armor-priority targeting |
| Gold Rush | epic | `coin-reward` | `rewardMultiplier += 0.3` for rest of run |

---

## 9. Heroes (run loadout)

Applied in `applyLoadout()` on run start:

| Role | Hero | Passive | Ability |
|------|------|---------|---------|
| guardian | Stone Warden | +35 max fort HP | +55 fort HP (18s CD) |
| ranger | Wild Arrow | +10% tower damage, 8% faster fire (`fireRateMultiplier = 0.92`) | 72 dmg to top 3 HP enemies (16s CD) |
| mage | Ember Sage | +20% coin rewards, +25 start coins | 46 dmg to all enemies (22s CD) |

Default starter: guardian → **215 fort HP** (180+35) with no permanent upgrades.

---

## 10. Permanent upgrades (meta — gems)

Shop: `permanentUpgradeDefinitions` in `useGameStore.ts`.

| ID | Name | Base gem cost | Per-level effect |
|----|------|--------------:|------------------|
| fortHp | Fort Masonry | 35 | `maxFortHp = 180 + level × 18` |
| startingCoins | War Chest | 30 | `coins = 150 + level × 15` |
| towerDamage | Sharper Tools | 45 | `towerDamageMultiplier = 1 + level × 0.08` |
| coinGain | Merchant's Ledger | 40 | `rewardMultiplier = 1 + level × 0.05` (stacks with mage / Gold Rush) |

**Buy cost:** `baseCost + currentLevel × baseCost` (e.g. Fort Masonry L0→L1 = 35 gems).

**Not implemented** (FEATURE_SPEC only — [BUG-021](../tracking/BUG_TRACKER.md)): troop health, upgrade reroll.

---

## 11. Meta gem economy (between runs)

| Event | Formula |
|-------|---------|
| Wave clear drip | `max(3, floor(wave × 2))` gems — banked on overlay; kept on forfeit |
| Fort loss bonus | `max(8, floor(wave × 12 + min(24, floor(coins × 0.04))))` — on defeat only ([DEC-031](../tracking/DECISION_LOG.md#dec-031-economy-rebalance--coin-ledger)) |
| Forfeit | Keeps wave-clear drip already earned; no fort bonus |

See **DEC-020** in decision log.

---

## 12. In-run coin economy

| Source | Amount |
|--------|--------|
| Run start | `150 + permanentStartingCoins + mageBonus(25)` |
| Kill reward | Enemy `reward` × `rewardMultiplier` |
| Wave clear pick | +25 after choosing upgrade (+10 extra on boss waves) |
| Coin mills | `15 × tier` per mill each wave clear |
| Unknown upgrade target | +25 (fallback `default` case) |

**Typical spends:** towers 30–65, pad tier 25, support 35–78.

---

## 13. TTK reference (theory)

Single **T1 archer** (16 dmg, 520ms) vs grunt @ wave 1 (36 HP):

```text
shots to kill = ceil(36 / 16) = 3
time ≈ 3 × 0.52s = 1.56s (if always in range from first shot)
```

Gatebreaker @ wave 5 (550 HP), one T1 archer (~31 DPS):

```text
time ≈ 550 / 31 ≈ 18s continuous fire
```

Expect 2–3 towers or tiers for comfortable boss kills.

---

## 14. Playtest checklist (@ 390×844)

| Check | Pass criteria |
|-------|----------------|
| W1–3 | 6–10 spawns; grunt/runner TTK sane with one archer |
| W5 | Boss only; ~505 HP; killable with 2–3 towers |
| W6–8 | Bat ignores traps; bomber double fort hit if leaked |
| W8 | ~16 spawns (not 50+) |
| Upgrades | Each card has distinct effect (§8) |
| Shield | Archers weak; cannon/magic strong |

---

## 15. Deferred / known gaps

| Item | Tracker |
|------|---------|
| Permanent upgrades: troop HP, upgrade reroll | [BUG-021](../tracking/BUG_TRACKER.md) |
| Roguelike rarity-weighted picks | [BUG-022](../tracking/BUG_TRACKER.md) |
| Remote / live tuning | Future (FEATURE_SPEC) |

---

## 16. Changelog

| Date | Change |
|------|--------|
| 2026-05-18 | **DEC-029:** `waves.ts` wired to runtime; spawn budget fix; HP `+wave×5`; enemy HP tune (tank/shield/boss/grunt). |
| 2026-05-18 | **DEC-030:** Shield armor, bat flyer, bomber explode, cannon splash, magic priority, archer-only Sharp Arrows. |
| 2026-05-18 | **DEC-025:** Tiered enemy introduction (superseded spawn *count* logic in DEC-029). |
| 2026-05-18 | **DEC-031:** Economy pass — grunt/runner/boss rewards, mill income 15, stipend 35 + boss bonus, fort gem coin cap, Merchant's Ledger meta upgrade. |
| 2026-05-18 | **DEC-032:** Combat/economy sinks — higher build/tier costs, HP scale `+wave×6`, tank/shield/boss HP, wave 4/7–9 pressure, stipend 25+10 boss. |

---

## 17. Quick file index

```text
src/data/enemies.ts      — base enemy stats
src/data/waves.ts        — spawn tables + getWaveSpawnGroups()
src/data/buildings.ts    — tower/support bases
src/data/upgrades.ts     — roguelike cards
src/data/troops.ts       — barracks units
src/data/heroes.ts       — hero roster
src/game/scenes/RunScene.ts — all runtime formulas
src/state/useGameStore.ts — gems + permanent upgrades
```
