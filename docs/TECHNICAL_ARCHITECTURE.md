# Technical Architecture

## Architecture Summary

The app is a static web game served by Vercel. React owns the application shell, menus, overlays, and settings. Phaser owns the real-time game scene. Zustand provides a small shared state bridge between Phaser and React.

## Runtime Boundaries

### React

Responsible for:

- Home menu.
- Settings.
- Upgrade cards.
- Permanent upgrades.
- Collection screens.
- Pause/game over overlays.
- Supabase auth UI later.

### Phaser

Responsible for:

- Game loop.
- Enemy movement.
- Tower targeting.
- Projectiles.
- Collision/combat.
- Particles and visual feedback.
- Audio playback.
- Touch/pointer input inside the game board.

### Zustand

Responsible for:

- Current screen.
- Run status.
- HUD values exposed to React.
- Settings.
- Local progression snapshot.

## Proposed Folder Structure

```text
src/
  app/
    App.tsx
    App.css
  game/
    GameCanvas.tsx
    config.ts
    events.ts
    scenes/
      BootScene.ts
      RunScene.ts
    systems/
      combat.ts
      economy.ts
      merge.ts
      waves.ts
    entities/
      Enemy.ts
      Tower.ts
      Projectile.ts
  ui/
    HomeScreen.tsx
    Hud.tsx
    UpgradeChoice.tsx
    GameOverDialog.tsx
    SettingsScreen.tsx
  data/
    buildings.ts
    enemies.ts
    upgrades.ts
    waves.ts
    maps.ts
  state/
    useGameStore.ts
  assets/
    assetManifest.ts
```

## Data-Driven Rules

Gameplay numbers should live in `src/data` where possible. Avoid hard-coding damage, HP, wave size, costs, or upgrade effects inside scene code unless the value is purely visual.

## Run Scene Graphics

Visual wiring is concentrated in `RunScene.ts` (`preload`, `drawMap`, asset key maps, `spriteFacingOffset`, `aimTowers`, `rotateSpriteToward`). React dock images use the same filenames via `gameBridge` / `PlayHud.tsx`.

Full inventory, rotation table, depth order, and test checklist: **`docs/GRAPHICS.md`**.

Key rules:

- Map colors from `maps.ts` → `applyLoadout()` palette; grass and path dots are tinted, not replaced per map.
- Phaser texture keys must match React `/assets/optimized/sprites/` paths.
- Do not stack vector path strokes on path-dot tiles (see DEC-016).

## Persistence Plan

### Phase 1

Use browser local storage for:

- Settings.
- Best wave.
- Permanent upgrades.
- Unlocked content.

### Phase 4

Add Supabase for:

- Auth.
- Cloud saves.
- Leaderboards.
- Remote config.
- Player inventory.
- Event participation.

## Supabase Tables Later

```text
profiles
player_saves
leaderboard_runs
remote_config
player_inventory
events
```

## Deployment Environments

- Local: developer machine.
- Preview: Vercel preview deployment per branch/PR.
- Production: Vercel production deployment from main branch.

## Render Usage

Render is not needed for the first version. Keep it reserved for future needs such as:

- Scheduled leaderboard processing.
- Heavy analytics jobs.
- Asset processing.
- Custom backend APIs that do not fit Supabase Edge Functions.

## Performance Targets

- First load under 3 MB compressed for early prototype.
- 60 FPS on modern mobile devices.
- 30 FPS minimum on low-end devices.
- No single texture atlas over 2048x2048 for broad compatibility.
- Avoid unbounded particles, enemies, or projectiles.

## Testing Strategy

- TypeScript build for every change.
- Manual mobile viewport QA for gameplay.
- Unit tests later for pure systems: waves, economy, merge, upgrade selection.
- Browser visual check before release.
- Bug tracker entry for every known issue.

