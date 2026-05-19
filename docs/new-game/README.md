# Tiny Swords Builder Game Documentation

This folder defines a new game direction using the Tiny Swords asset pack as the primary identity.

The proposed game is not a tower defense reskin. It is a mobile-first idle arcade builder where the player runs around a small kingdom, collects resources, carries visible stacks, donates resources into build pads, unlocks production chains, recruits helpers, expands the base, and eventually defends or raids with the army they have built.

Working title options:

- **Tiny Kingdom Works**
- **Carryhold Kingdom**
- **Stackshire**
- **Mergehold Kingdoms**
- **Tiny Realm Runner**

Recommended working title for documentation: **Tiny Kingdom Works**.

## Folder Map

- [PRODUCT_RESEARCH.md](./PRODUCT_RESEARCH.md)
  Market/genre research, observed mechanics, reference games/ads, and why this idea fits Tiny Swords.

- [GAME_DESIGN.md](./GAME_DESIGN.md)
  Core fantasy, gameplay loop, player actions, resources, buildings, helpers, progression, combat, monetization-safe hooks, and MVP scope.

- [TECH_STACK.md](./TECH_STACK.md)
  Recommended stack for web/mobile, deployment, backend, persistence, tooling, and why.

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
  Proposed file/folder architecture with highly separated feature modules, including the requested structure where each building owns its config, upgrades, actions, visuals, and behavior.

- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
  Phased build plan from prototype to deployable product.

- [assets/TINY_SWORDS_ASSET_AUDIT.md](./assets/TINY_SWORDS_ASSET_AUDIT.md)
  Tiny Swords pack inventory, license notes, curated runtime subset, and art-direction mapping.

- [tracking/TRACKING.md](./tracking/TRACKING.md)
  Documentation-native bug tracker, task tracker, decision log pattern, QA checklist, and acceptance criteria.

## Product Thesis

Tiny Swords is strongest when it is allowed to be a small living kingdom:

- Human factions make sense as workers, villagers, guards, raiders, and unlockable skins.
- Buildings are coherent enough for a base-building loop.
- Resources and UI assets support collection, deposit pads, production bars, and upgrade cards.
- The pack can support short playable-ad style moments but also a deeper actual product.

The best direction is a **hybrid casual base-builder with idle arcade controls**, not a deeper RTS at first.

## Immediate Recommendation

Build a new branch or new repo when implementation starts. Keep this documentation as the source of truth, then create a fresh game shell with:

- `Phaser 3` for game simulation/rendering.
- `React + Vite + TypeScript` for menus, meta UI, account, shop, settings, and debug/admin panels.
- `Zustand` for client state coordination.
- `Supabase` for auth, cloud saves, event snapshots, remote config, and later leaderboards.
- `Vercel` for frontend hosting.
- `Capacitor` later if native iOS/Android wrappers are needed.

The MVP should prove fun before adding backend complexity.
