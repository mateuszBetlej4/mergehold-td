# Development Checklist

## Foundation

- [x] Choose initial stack.
- [x] Create project scaffold.
- [x] Add Phaser.
- [x] Add planning documentation.
- [x] Convert starter scaffold to React app shell.
- [x] Add game folder structure.
- [x] Add first Phaser scene.
- [x] Add Vercel config if needed.
- [x] Add asset credits file.
- [x] Add imported Kenney runtime sprites.
- [x] Add mobile no-scroll play layout.
- [x] Add tower selection and gameplay feedback.

## Prototype Gameplay

- [x] Mobile portrait canvas.
- [x] Fort/core entity.
- [x] Hero ability button.
- [x] Enemy path.
- [x] Enemy spawn timer.
- [x] Manual start-wave button.
- [x] Enemy reaches fort and deals damage.
- [x] Tower placement slot.
- [x] Tower shoots enemy.
- [x] Enemy death reward.
- [x] Wave counter.
- [x] Game over state.
- [x] Restart flow.
- [x] Pause control.
- [x] Speed toggle.

## Merge System

- [x] Building tiers.
- [x] Build costs.
- [x] Merge validation.
- [x] Merge visual feedback.
- [x] Tier stat scaling.
- [x] Max tier rules.

## Roguelike Upgrade System

- [x] Upgrade data model.
- [x] Upgrade selection between waves.
- [x] Three-card UI.
- [x] Basic rarity display.
- [x] Stackable effects.
- [ ] Rarity weights.
- [ ] Reroll hook.

## Content

- [x] Archer tower.
- [x] Cannon tower.
- [x] Magic tower.
- [x] Spike trap.
- [x] Barracks.
- [x] Coin mill.
- [x] Stone wall.
- [x] Healing shrine.
- [x] Grunt enemy.
- [x] Runner enemy.
- [x] Tank enemy.
- [x] Shield enemy.
- [x] First boss.

## Progression

- [x] End-of-run rewards.
- [x] Local save.
- [x] Permanent upgrade menu.
- [x] Hero selection.
- [x] Hero loadout affects gameplay.
- [x] Map selection.
- [x] Map loadout affects gameplay.
- [x] Unlock conditions.
- [x] Reset save in settings.

## Assets

- [x] Download Kenney Tower Defense Kit.
- [ ] Download Quaternius enemy pack.
- [ ] Download UI pack.
- [ ] Choose SFX source.
- [x] Add asset credits.
- [x] Optimize runtime assets.
- [x] Replace core tower/enemy placeholders.

## Graphics (Run scene)

- [x] Tiled Kenney grass ground (map palette tint).
- [x] Kenney path-dot lane (no vector path overlay).
- [x] Bat / bomber SVG differentiation + tint.
- [x] Archer `projectile-arrow` vs Kenney blob for cannon/magic.
- [x] Troop role tints on shared hero silhouette.
- [x] Tower / enemy / troop facing rotation (`spriteFacingOffset`).
- [ ] Collection screen thumbnails from existing sprites.
- [ ] Kenney pad tiles for build / trap slots.
- [ ] Per-hero unique sprites (still one guardian SVG + tint).

## Deployment

- [x] Build passes.
- [ ] Vercel project created.
- [ ] Preview deployment works.
- [ ] Production deployment works.
- [x] Mobile viewport checked.
- [ ] Asset credits visible.

## Meta progression (audit 2026-05-18 — gaps)

- [x] `claimRunRewards` + localStorage save (`useGameStore.ts`).
- [x] Permanent upgrade purchase logic + apply in `RunScene.applyLoadout`.
- [ ] Gems / `bestWave` on wave clear (not only fort death).
- [ ] Leave-run flow (confirm, partial rewards, or resume).
- [ ] Home screen: accurate run/progress display after leaving Play.
- [ ] Collection card art from `optimized/sprites`.
- [ ] Align unlock UX with “Clear wave N” copy.

See `docs/handoffs/2026-05-18-audit.md`.

## Supabase Later

- [ ] Create Supabase project.
- [x] Add Supabase migration starter.
- [ ] Add auth.
- [ ] Add cloud save schema.
- [ ] Add leaderboard schema.
- [ ] Add remote config schema.
- [ ] Add RLS policies.
