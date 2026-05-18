# Project Plan

## Product Goal

Build a polished mobile-first web game where players defend a central fort from waves of enemies by placing, merging, and upgrading defensive buildings, traps, and friendly troops.

The first version should be simple, readable on mobile, and fun in short sessions. The long-term version should support persistent progression, collectible units, unlockable maps, events, and monetization hooks without making the codebase hard to work in.

## Design Pillars

- One-hand mobile play.
- Fast decisions every few seconds.
- Clear merge and upgrade feedback.
- Short runs with roguelike variety.
- Simple systems that can be tuned from data files.
- Free or permissively licensed assets only until custom art is justified.

## Recommended Tech Stack

- **Frontend:** Vite, React, TypeScript.
- **Game Runtime:** Phaser 3.
- **State:** Zustand for lightweight app/game state shared with React UI.
- **Styling:** Plain CSS modules or scoped CSS first; add Tailwind only if UI complexity grows.
- **Deployment:** Vercel for the static web app.
- **Backend Later:** Supabase for auth, saved progress, leaderboards, player inventory, and remote balancing.
- **Backend Jobs Later:** Render only if we need scheduled jobs, matchmaking workers, asset processing, or heavier services outside Supabase.
- **Planning/Source:** GitHub repository, GitHub Issues, GitHub Projects, and in-repo documentation.

## Why This Stack

Phaser gives us a proven game loop, input handling, camera, animations, particles, collisions, and audio. React gives us clean menus, overlays, upgrade cards, settings, and account UI. Vite keeps development fast and deploys simply to Vercel. Supabase can be added only when persistent online features are needed.

## Delivery Phases

### Phase 0: Foundation

- Project scaffold.
- Documentation system.
- Asset source list and license rules.
- Basic app shell.
- Vercel-ready build.

### Phase 1: Playable Prototype

- Portrait game screen.
- Central fort.
- Enemy spawning.
- Towers shooting enemies.
- Basic wave system.
- Build slots.
- Merge mechanic.
- Game over and restart.

### Phase 2: Core Loop

- Coins during run.
- Three-choice upgrade screen after waves.
- Multiple tower types.
- Multiple enemy archetypes.
- Boss wave.
- End-of-run rewards.
- Local persistent save.

### Phase 3: Content Expansion

- Friendly barracks troops.
- Traps and walls.
- Map themes.
- Permanent upgrades.
- Unlockable buildings.
- Enemy ability variants.
- Audio and VFX pass.

### Phase 4: Online Features

- Supabase auth.
- Cloud saves.
- Leaderboards.
- Daily missions.
- Remote config for tuning.
- Analytics events.

### Phase 5: Production Readiness

- Performance budget.
- Mobile QA checklist.
- Accessibility pass.
- Error logging.
- Asset compression.
- Deployment environments.
- GitHub release process.

## Milestone Definition Of Done

A milestone is complete only when:

- The feature is playable on mobile viewport sizes.
- The build passes.
- Known bugs are logged in `docs/tracking/BUG_TRACKER.md`.
- Any new asset has a source and license entry.
- Any meaningful product or technical choice is recorded in `docs/tracking/DECISION_LOG.md`.
- The feature has clear tuning values in data/config where practical.

