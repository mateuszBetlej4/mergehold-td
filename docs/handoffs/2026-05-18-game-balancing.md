# Agent handoff — Game balancing & combat systems (2026-05-18)

> **Role:** Game balancing agent — **research first**, then tune numbers and **wire missing gameplay effects** so towers, enemies, troops, buildings, waves, and upgrades behave as described. Do not change graphics/sprites unless a stat fix requires a one-line hook.
> **Depends on:** [2026-05-18-gameplay-content.md](./2026-05-18-gameplay-content.md) (wave mix — **done**, DEC-025), [2026-05-18-meta-progression.md](./2026-05-18-meta-progression.md) (gem economy — **done**, DEC-020)
> **Avoid:** [2026-05-18-graphics.md](./2026-05-18-graphics.md) rotation tables, [2026-05-18-bug-fix.md](./2026-05-18-bug-fix.md) unless you file new bugs

**Repo:** https://github.com/mateuszBetlej4/mergehold-td.git  
**Branch:** `main`  
**Dev:** `npm run dev` → http://127.0.0.1:5173/ (next free port if busy)  
**Viewport:** **390×844** mobile portrait for all playtests  
**Tracking:** `docs/tracking/BUG_TRACKER.md`, `docs/tracking/DECISION_LOG.md`

---

## Mission

1. **Research** current combat math end-to-end (data files → `RunScene` application → player-facing copy).
2. **Document** findings (short table or DEC-028) before large rebalance commits.
3. **Rebalance** HP/DPS/economy so waves 1–15 feel fair with starter loadout + light building.
4. **Implement** upgrades/enemy abilities that are **described but stubbed** (see gap list below).
5. Leave the game **functional** — every card/description in Collection and upgrade picker should do what it says (or update copy if scope-cut).

**Research is key.** Do not only tweak `enemies.ts` HP in isolation; trace how a change propagates through wave spawn count, scaling, and time-to-kill.

---

## Architecture — where numbers live

| Layer | Path | Balancing relevance |
|-------|------|---------------------|
| **Data definitions** | `src/data/enemies.ts` | Base HP, speed, reward, `damageToFort`, archetype |
| | `src/data/buildings.ts` | Tower/trap/support `stats` (damage, range, fireRateMs, splash, income, etc.) |
| | `src/data/upgrades.ts` | Roguelike card `target` + `value` |
| | `src/data/troops.ts` | Barracks troop HP/damage/role |
| | `src/data/heroes.ts` | Role, ability name, cooldown |
| | `src/data/waves.ts` | **⚠ Not used at runtime** — design doc only |
| | `src/data/maps.ts` | Palette only (no combat stats today) |
| **Runtime combat** | `src/game/scenes/RunScene.ts` | Spawn mix, scaling, damage, upgrades, buildings, hero ability |
| **Meta shop** | `src/state/useGameStore.ts` | `permanentUpgradeDefinitions`, gem costs, `applyLoadout` hooks |
| **UI copy** | `src/app/App.tsx`, Collection screens | Must match real behavior after your pass |
| **Design intent** | `docs/FEATURE_SPEC.md` | Towers, enemies, waves, upgrades — some features still future |

**Single source of truth for a run:** `RunScene` reads `src/data/*` on boot and mutates multipliers during the run (`towerDamageMultiplier`, `rewardMultiplier`, `fireRateMultiplier`, etc.).

---

## Runtime formulas (verify in code before changing)

### Enemy spawn (`getWaveEnemyMix` + `spawnWave`)

**Mix table (DEC-025)** — `RunScene.ts` ~1235–1246:

| Waves | Types in pool |
|-------|----------------|
| 1 | grunt |
| 2+ | grunt, runner |
| 4+ | tank, shield |
| 6+ | bat |
| 8+ | bomber |
| 5, 10, 15… | gatebreaker **only** |

**Per-type count:** `min(6, 1 + wave)` spawns **for each** definition in the mix (not split across types). Wave 8 with 5 types → up to 5 × 9 = 45 enemies — major difficulty spike; research this first.

**On spawn** (~1268–1274):

```ts
hp: definition.hp + this.wave * 6
speed: (0.046 + this.wave * 0.0015) * definition.speed
reward: ceil(definition.reward * rewardMultiplier)
damageToFort: ceil(definition.damageToFort * 0.55)
```

### Towers & tier upgrades

- Place cost: `buildingDefinitions[].baseCost` (dock shows $20 / $35 / $45 for A/C/M).
- Pad upgrade: **15 coins**, +1 tier, max 5 (towers) or `maxTier` (support).
- Tier bump: `tower.damage += 8 * towerDamageMultiplier` (~611–614).
- Projectiles: single-target hit; **no AoE** unless you implement cannon splash.

### Roguelike upgrades (`applyUpgrade` ~1706–1743)

| `target` | Advertised | Actual today |
|----------|------------|--------------|
| `archer-damage` | Archer towers | **All** towers + traps get `damage *= 1 + value` |
| `fire-rate` | All towers faster | `fireRateMs` reduced, `fireRateMultiplier` |
| `fort-hp` | Fort HP | Works |
| `coin-reward` | Coin rewards | `rewardMultiplier` — works |
| `cannon-splash` | Splash radius | **Stub:** generic +50% damage to all towers/traps |
| `magic-priority` | Prioritize armored | **Stub:** same as cannon-splash |
| `default` | — | +25 coins |

### Permanent upgrades (`applyLoadout` ~1751–1784)

| ID | Effect per level |
|----|------------------|
| `fortHp` | `maxFortHp = 180 + level * 18` |
| `startingCoins` | `coins = 150 + level * 15` |
| `towerDamage` | `towerDamageMultiplier = 1 + level * 0.08` |

Costs: `permanentUpgradeDefinitions` in `useGameStore.ts` (`baseCost` 30–45, scales per buy).

### Hero loadout (same function)

| Role | Passive / ability |
|------|-------------------|
| `guardian` | +35 max HP; ability: +55 fort HP (cooldown from `heroes.ts`) |
| `ranger` | +10% tower damage, 8% faster fire; ability: 72 dmg × 3 highest-HP enemies |
| `mage` | +20% reward mult, +25 start coins; ability: 46 dmg to **all** enemies |

### Support buildings

| Building | Stat key | Runtime |
|----------|----------|---------|
| Coin mill | `income` | `income * tier` between waves |
| Stone wall | `fortShield` | Shield HP pool (absorbs fort damage) |
| Healing shrine | `repair` | After boss waves |
| Barracks | `spawnRateMs`, troops from `troops.ts` | Tier picks troop type by barracks tier |
| Spike trap | `damage`, `cooldownMs` | Path trigger |

### Enemy abilities (data says — code may not)

| Enemy | Description | Implement? |
|-------|-------------|------------|
| shield | Resists arrow damage | **Not implemented** — all towers same damage |
| bat | Flying, skips traps | **Not implemented** |
| bomber | Explodes near fort | **Not implemented** — uses normal `damageToFort` on reach |
| gatebreaker | Boss | Works as high-HP single spawn |

---

## Known gaps — prioritize for “make it functional”

1. **`src/data/waves.ts` unused** — either wire it into `spawnWave` or delete/annotate; today spawn logic contradicts the static wave table (e.g. wave 3 in data is runner-only; live mix is grunt+runner from wave 2).
2. **Spawn count formula** — `min(6, 1 + wave)` per archetype in mix; likely overtuned by wave 6+.
3. **Upgrade stubs** — `cannon-splash`, `magic-priority`; misnamed `archer-damage`.
4. **Shield / bat / bomber** abilities missing.
5. **Cannon splash** — `buildings.ts` has `splash: 42` but projectiles never apply AoE.
6. **FEATURE_SPEC** lists permanent upgrades (troop HP, coin gain, reroll) — **not in** `permanentUpgradeDefinitions`; out of scope unless user expands mission.
7. **No rarity weights** on upgrade pick (`pickUpgrades` shuffles all 6 equally) — checklist item.

File new bugs in `BUG_TRACKER.md` if you defer an advertised feature; implement or fix copy in the same pass.

---

## Research workflow (required)

### Phase 1 — Audit (no code or docs-only table)

1. Export a **balance sheet** (markdown table in handoff comment or `docs/balance/` if you add a file — ask user before new top-level docs):
   - Columns: entity, base stat, runtime modifier, effective value @ wave 1 / 5 / 10.
2. Play **waves 1–15** @ 1× and 1.5× with minimal strategy:
   - A) no towers (leak test — fort damage),
   - B) one archer tier 2,
   - C) archer + cannon by wave 6,
   - D) full economy run (mill + wall) if time.
3. Record: wave clear time, fort HP remaining, coins at wave 5/10, first death wave.
4. Note which upgrades players actually pick and whether they feel impactful.

### Phase 2 — Design targets (propose in DEC-028)

Example targets (tune to taste):

- Wave 1–2: learn placement; fort loses &lt;15% HP with one T1 archer.
- Wave 5 boss: gatebreaker threatening but killable with 2–3 towers.
- Wave 10: needs mixed towers + 1–2 roguelike picks; not auto-win.
- Run length to fort death (no towers): ~wave 3–4.

### Phase 3 — Implement

- Adjust `src/data/*.ts` for base stats.
- Adjust `RunScene` formulas only when scaling is wrong globally (prefer data-first).
- Implement missing **behavior** (splash, armor, flyer, explode) in `RunScene` with small, testable diffs.
- Align `upgrades.ts` descriptions with behavior.

### Phase 4 — Verify

```bash
npm run build
```

Playtest matrix @ 390×844:

| Check | Pass criteria |
|-------|----------------|
| W1–3 | Grunt/runner TTK sane |
| W5 | Boss only, gatebreaker killable |
| W6–8 | Bat/bomber appear; abilities work if implemented |
| Upgrades | Each of 6 cards has distinct, noticeable effect |
| Permanent shop | Levels 0–3 feel meaningful in next run |
| Meta | Don’t break DEC-020 gem drip / forfeit |

Update `BUG_TRACKER.md` / `DECISION_LOG.md` (DEC-028+ for balance policy).

---

## Files — touch vs avoid

| Touch | Avoid |
|-------|-------|
| `src/data/enemies.ts`, `buildings.ts`, `upgrades.ts`, `troops.ts` | `spriteFacingOffset`, assets, `App.css` |
| `src/game/scenes/RunScene.ts` — combat, spawn, `applyUpgrade`, `damageEnemy` | React shell except copy fixes for wrong upgrade text |
| `src/state/useGameStore.ts` — permanent upgrade costs/values only | `GameCanvas` lifecycle, Phaser preload |
| `docs/tracking/DECISION_LOG.md`, optional `docs/balance/` | Graphics handoffs, Deploy/Supabase |
| `docs/FEATURE_SPEC.md` — only if you change spec to match shipped behavior | `getWaveEnemyMix` unless spawn policy is in scope |

**Do not** change `kenney-enemy-runner` facing offset — locked at `0` per DEC-026/027 (user-verified).

---

## Base stat reference (starting point — verify in repo)

### Enemies (`enemies.ts`)

| id | hp | speed | reward | fort dmg |
|----|-----|-------|--------|----------|
| grunt | 32 | 1.0 | 5 | 7 |
| runner | 20 | 1.65 | 6 | 5 |
| tank | 130 | 0.62 | 14 | 12 |
| shield | 86 | 0.86 | 10 | 9 |
| bat | 26 | 1.45 | 8 | 6 |
| bomber | 54 | 1.05 | 11 | 18 |
| gatebreaker | 560 | 0.48 | 90 | 35 |

### Towers (`buildings.ts` stats)

| id | damage | range | fireRateMs | notes |
|----|--------|-------|------------|-------|
| archer-tower | 16 | 166 | 520 | |
| cannon-tower | 28 | 136 | 900 | splash 42 unused |
| magic-tower | 22 | 154 | 680 | |
| spike-trap | 10 | — | cooldown 500 | |

### Roguelike upgrades (`upgrades.ts`)

All `value` fields are fractional except `magic-priority` (`value: 1` → still only damage stub).

---

## Product decisions already locked

- **DEC-020:** Gem drip on wave clear + fort bonus; forfeit keeps drip.
- **DEC-025:** Wave enemy tier table (bat W6+, bomber W8+, boss every 5).
- **DEC-027:** Runner offset `0`; waypoint rotation snap; upgrade overlay spacing.

Rebalance must not zero out meta progression or revert wave mix without explicit DEC.

---

## Suggested first tasks (ordered)

1. **Spawn economy** — fix per-archetype count (e.g. shared budget per wave vs `min(6, 1+wave)` × N types).
2. **Wire or remove `waves.ts`** — single spawn design doc.
3. **Implement cannon splash** using `stats.splash` + upgrade modifier.
4. **Implement shield armor** (e.g. 50% vs archer projectile key only).
5. **Implement bat** (ignore trap triggers) and **bomber** (AoE on fort reach).
6. **Fix upgrade targets** — split `archer-damage` to archer-only; real `magic-priority` targeting.
7. **Pass** tower/enemy HP for waves 1–10 playtest curve.
8. **Permanent upgrade** cost curve vs gem income (DEC-020 formulas).

---

## Git workflow

```bash
npm run build
git add src/data/ src/game/scenes/RunScene.ts src/state/useGameStore.ts docs/tracking/
git commit -m "Balance wave spawn curve and implement missing combat effects"
```

Do **not** commit unless user asks (repo rule). Leave changes ready with a short balance changelog in commit body.

---

## Prompt for agent (copy-paste)

---

You are the **game balancing agent** for **Mergehold TD**.

1. Read **`docs/handoffs/2026-05-18-game-balancing.md`** in full.
2. Read **`docs/FEATURE_SPEC.md`** (gameplay systems) and trace stats in **`src/data/*`** → **`RunScene.ts`**.
3. **Research first:** play waves 1–15 @ **390×844**; document TTK, fort HP, coin flow, spawn counts.
4. Fix **stub upgrades** and **missing enemy abilities**; rebalance HP/DPS/economy as needed.
5. Resolve **`waves.ts` vs `getWaveEnemyMix`** inconsistency.
6. `npm run build`; update **`DECISION_LOG.md`** (DEC-028+) and **`BUG_TRACKER.md`** for any deferred items.
7. Do **not** change graphics/sprite facing or meta UX unless required for balance hooks.

Repo: `C:\Users\mateuszb\Documents\AI Projects\TD`

---

## Balance documentation (shipped)

Full reference for designers and future agents:

**[`docs/balance/GAME_BALANCE.md`](../balance/GAME_BALANCE.md)** — spawn tables, formulas, enemy/tower stats, upgrades, meta gems, TTK notes, and deferred gaps.

**Economy follow-up:** [`docs/handoffs/2026-05-18-economy.md`](./2026-05-18-economy.md) — dedicated agent brief for coin/gem tuning and shop pacing.

---
