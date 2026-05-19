# Tech Stack

## Recommendation

Use a web-first stack with a clear path to native mobile.

| Layer | Choice | Reason |
|---|---|---|
| Game engine | Phaser 3 | Strong 2D mobile/web support, spritesheets, tilemaps, input, Arcade Physics |
| App shell | React + TypeScript | Menus, account, inventory, settings, debug panels |
| Build tool | Vite | Fast local development, simple static deployment to Vercel |
| State | Zustand | Small, predictable client store for app/meta state |
| Game state | Phaser scene-local ECS-lite systems | Avoid forcing high-frequency simulation through React |
| Persistence local | localStorage/IndexedDB wrapper | Fast offline MVP saves |
| Cloud backend | Supabase | Auth, Postgres saves, remote config, leaderboards later |
| Hosting | Vercel | Static frontend deploy from `dist` |
| Native wrapper later | Capacitor | Wrap the web app for iOS/Android when gameplay is proven |
| Asset pipeline | Curated runtime assets + manifest files | Avoid committing raw asset packs; keep licensing clean |
| Testing | Vitest for pure systems, Playwright/browser QA for mobile | Keep logic testable outside Phaser where possible |

## Why Phaser 3

Phaser fits this game because it handles:

- Spritesheets and animation.
- Tilemaps.
- Arcade Physics overlap/collision.
- Touch/pointer input.
- Camera follow.
- Particles/FX.
- WebGL canvas rendering.

This game needs many moving items and small entities, but not complex rigid-body physics. Phaser Arcade Physics is enough for:

- Player/node overlaps.
- Pickup collision.
- Deposit zone overlap.
- Worker navigation triggers.
- Enemy/guard contact.

Avoid Matter Physics for MVP unless we need collision shapes beyond circles/rectangles.

## Why React Still Belongs

React should own:

- Home screen.
- Account/auth UI.
- Settings.
- Shop.
- Collection screens.
- Debug panels.
- Save slot UI.
- Upgrade/info modal UI when it is not part of fast gameplay.

React should not own:

- Player movement.
- Resource pickups.
- Worker AI.
- Combat ticks.
- Rendering stacks.

Bridge pattern:

```text
React UI <-> GameBridge events <-> Phaser Scene
```

This current repo already uses that pattern for the TD game. Keep it, but make the new game cleaner from the start.

## Backend Strategy

### MVP

Use local saves only:

- `localStorage` for quick prototype.
- Migrate to IndexedDB if save grows.
- Save every important event or every 10-20 seconds.

### Cloud Phase

Use Supabase:

- Auth.
- `player_saves` table.
- `player_profiles` table.
- `remote_config` table.
- `event_log` table for analytics-lite.
- Later leaderboards.

Supabase Auth persists sessions in local storage by default in browser clients, which is fine for a client-heavy web game MVP. For higher security server flows, use server-side session validation later.

### Realtime

Do not build multiplayer for MVP.

Use Supabase Realtime later for:

- Live events.
- Guild/social features.
- Limited co-op map visits.
- Admin remote config refresh.

Do not sync high-frequency game simulation through Realtime.

## Deployment

### Frontend

Vercel static deployment:

```text
npm run build -> dist -> Vercel
```

Vite documentation assumes static deploys output to `dist`, which matches the current project pattern.

### Backend

No Render service is needed for MVP unless we add:

- Authoritative economy server.
- Anti-cheat validation.
- Scheduled offline earnings.
- Webhook processing.
- Heavy analytics.

Prefer Supabase Edge Functions before adding a separate Render API.

## Native Mobile Path

Build as a mobile web game first.

When the game is fun:

1. Add PWA metadata.
2. Add Capacitor.
3. Wrap the Vite build.
4. Test iOS/Android input latency and canvas performance.
5. Add native plugins only when needed.

Capacitor is a web-native runtime, so the codebase can stay close to web standards while gaining app-store packaging.

## Performance Principles

- Use object pools for pickups, floating text, FX, and damage numbers.
- Prefer spritesheets/atlases over many separate images.
- Keep React rerenders out of the frame loop.
- Use fixed simulation tick where possible.
- Avoid thousands of physics bodies.
- Use broad-phase proximity checks for workers/jobs.
- Cap dropped items per node.
- Merge small resource pickups into stacks quickly.
- Avoid overdraw-heavy full-screen alpha layers on older phones.

## Recommended Libraries

Core:

- `phaser`
- `react`
- `react-dom`
- `zustand`
- `@supabase/supabase-js`

Dev:

- `typescript`
- `vite`
- `tsx`
- `vitest`
- `eslint`
- `prettier`

Optional later:

- `idb-keyval` or a small IndexedDB wrapper.
- `@capacitor/core`, `@capacitor/cli`.
- `zod` for remote config validation.

## Do Not Add Yet

Avoid these until the game proves the loop:

- Complex ECS framework.
- Multiplayer networking.
- Server-authoritative economy.
- Heavy animation state machine libraries.
- Full native mobile project.
- Complex pathfinding library.

Simple, structured TypeScript modules are enough for the first product.
