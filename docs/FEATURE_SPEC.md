# Feature Specification

## Core Game Loop

1. Player starts a run.
2. Enemies spawn in waves and move toward the fort.
3. Player spends coins to place defenses on limited slots.
4. Matching defenses can be merged into stronger versions.
5. Towers, traps, and friendly troops fight automatically.
6. After selected waves, player chooses one roguelike upgrade.
7. Run ends when the fort HP reaches zero or the player clears the target wave.
8. Player earns meta currency and unlocks permanent upgrades.

## MVP Features

- Mobile portrait layout.
- Start run button.
- Fort HP.
- Wave counter.
- Coins.
- Build slots.
- One tower type.
- One enemy type.
- Tap to build.
- Drag or tap to merge.
- Basic tower targeting.
- Game over screen.
- Restart.

## Version 1 Features

- Three tower types: archer, cannon, magic.
- Three trap/building types: spikes, wall, barracks.
- Four enemy types: grunt, runner, tank, shield.
- One boss.
- Roguelike upgrade cards.
- Permanent upgrade menu.
- Local save.
- Settings menu.
- Sound and music toggles.
- Asset attribution screen.

## Future Features

- Player guardian hero.
- Hero abilities.
- Daily missions.
- Cloud saves.
- Leaderboards.
- Seasonal maps.
- More enemies with abilities.
- Rewarded ad hooks if packaged for mobile later.
- Cosmetic skins.
- Remote balancing.

## Menus

### Home

- Play.
- Upgrades.
- Collection.
- Settings.
- Credits.

### Run HUD

- Fort HP.
- Current wave.
- Coins.
- Speed toggle.
- Pause.
- Build/merge controls.

### Upgrade Choice

- Three upgrade cards.
- Rarity color.
- Short effect text.
- Confirm on tap.

### Permanent Upgrades

- Fort HP.
- Starting coins.
- Tower damage.
- Troop health.
- Coin gain.
- Upgrade reroll chance.

### Collection

- Buildings.
- Troops.
- Enemies.
- Maps.
- Locked/unlocked state.

### Settings

- Music.
- SFX.
- Vibration-ready flag.
- Graphics quality.
- Reset local save.
- Credits/licenses.

## Gameplay Systems

### Towers

Each tower has:

- ID.
- Name.
- Tier.
- Cost.
- Range.
- Fire rate.
- Damage.
- Targeting rule.
- Projectile type.
- Merge result.

### Enemies

Each enemy has:

- ID.
- Name.
- HP.
- Speed.
- Armor.
- Reward.
- Damage to fort.
- Ability tags.

### Waves

Each wave has:

- Spawn groups.
- Enemy type.
- Count.
- Spawn interval.
- Reward.
- Upgrade choice trigger.
- Boss flag.

### Roguelike Upgrades

Each upgrade has:

- ID.
- Rarity.
- Affected system.
- Stack behavior.
- Description.
- Numeric effect.

## Monetization Hooks For Later

Do not build monetization first. Prepare clean extension points only:

- Reward multiplier after run.
- Revive once per run.
- Daily reward.
- Cosmetic skins.
- Starter bundle placeholder.

