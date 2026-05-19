# Implementation Plan

## Phase 0: Product Setup

Goal: prepare a clean product foundation.

Tasks:

- [x] Choose final working name: **Satisfy Kingdom**.
- [ ] Decide new repo vs branch.
- [ ] Create fresh app shell or isolated `/src/builder-game`.
- [ ] Keep existing TD safe until the new direction is proven.
- [ ] Document Windows local setup commands.
- [ ] Document phone-over-LAN test setup from Windows.
- [ ] Document future iPhone release requirement: macOS/Xcode, remote Mac, or CI signing path.
- [ ] Copy only curated Tiny Swords runtime assets needed for the builder MVP.
- [ ] Add asset credits.
- [ ] Create audio credits file.
- [ ] Define MVP map dimensions and camera behavior.

Exit criteria:

- New game can run independently from TD code.
- Asset license handling is documented.

## Phase 1: Movement Prototype

Goal: make movement feel good on phone.

Tasks:

- [ ] Create `KingdomScene`.
- [ ] Add fixed/mobile camera.
- [ ] Add virtual joystick.
- [ ] Add hero sprite and run animation.
- [ ] Add collision bounds.
- [ ] Add placeholder terrain.
- [ ] Test at `390x844`.

Acceptance:

- Player can move smoothly with one finger.
- Camera framing feels correct.
- No HUD overlap.

## Phase 2: Collection And Carry

Goal: prove the tactile stack loop.

Tasks:

- [ ] Add wood resource node.
- [ ] Add pickup objects.
- [ ] Add magnet radius.
- [ ] Add carry component.
- [ ] Add stack renderer.
- [ ] Add capacity limit.
- [ ] Add floating pickup feedback.

Acceptance:

- Player collects wood.
- Wood visibly stacks.
- Stack decreases when removed.
- Carry capacity is readable.

## Phase 3: Deposit Zones And First Build

Goal: complete the first satisfying build.

Tasks:

- [ ] Add sawmill build zone.
- [ ] Add dashed outline and cost label.
- [ ] Add auto-deposit tick.
- [ ] Add cost countdown.
- [ ] Spawn sawmill on completion.
- [ ] Add dust FX.
- [ ] Add tutorial arrow.

Acceptance:

- Player understands what to do without text-heavy instructions.
- Sawmill appears after depositing resources.

## Phase 4: Production

Goal: add first resource conversion.

Tasks:

- [ ] Add sawmill input storage.
- [ ] Add plank output storage.
- [ ] Add production timer.
- [ ] Add visual progress bar.
- [ ] Add plank pickup.
- [ ] Add recipe system.

Acceptance:

- Wood becomes planks.
- Player can collect planks.
- Production state saves/loads.

## Phase 5: Worker Hut And Automation

Goal: prove automation as reward.

Tasks:

- [ ] Add Worker Hut build zone.
- [ ] Add gatherer unit.
- [ ] Add job board.
- [ ] Add gather wood job.
- [ ] Add deliver-to-sawmill job.
- [ ] Add worker upgrade path.

Acceptance:

- Worker gathers wood automatically.
- Player still has useful things to do.

## Phase 6: Expansion

Goal: create spatial progression.

Tasks:

- [ ] Add locked forest/quarry zone.
- [ ] Add gate/bridge unlock zone.
- [ ] Add stone resource.
- [ ] Add quarry building.
- [ ] Add second production chain.

Acceptance:

- The world grows physically.
- New zone introduces a new resource and new choice.

## Phase 7: Light Combat

Goal: add pressure without turning into tower defense.

Tasks:

- [ ] Add raid timer.
- [ ] Add red pawn enemy.
- [ ] Add guard unit.
- [ ] Add barracks building.
- [ ] Add building damage/repair.
- [ ] Add raid reward.

Acceptance:

- Raids feel like an event.
- Guards matter.
- Resource loop remains primary.

## Phase 8: Save, Cloud, And Meta

Goal: make it deployable and persistent.

Tasks:

- [ ] Local save system.
- [ ] Save migration system.
- [ ] Supabase auth.
- [ ] Supabase player save table.
- [ ] Cloud sync with conflict strategy.
- [ ] Remote config table.
- [ ] Basic analytics event log.

Acceptance:

- Player can close/reopen and keep progress.
- Signed-in player can sync across devices.

## Phase 9: Polish Vertical Slice

Goal: make a product-quality demo.

Tasks:

- [ ] Add UI skin.
- [ ] Add first satisfying sound effects: chop, pickup, deposit, build complete, UI tap.
- [ ] Add music and ambience after the core loop sounds good.
- [ ] Add haptics later for native.
- [ ] Add tutorial sequence.
- [ ] Add balanced first 10 minutes.
- [ ] Add QA checklist.

Acceptance:

- A new player can play five minutes without help.
- The loop feels satisfying.
- Screenshots communicate the game instantly.

## Phase 10: Deployment

Goal: get it on phone.

Tasks:

- [ ] Vercel web deploy.
- [ ] Phone browser QA on iPhone Safari and Android Chrome.
- [ ] Supabase production env.
- [ ] Optional PWA manifest.
- [ ] Android Capacitor smoke build.
- [ ] iPhone Capacitor build plan using macOS/Xcode, remote Mac, or CI.
- [ ] Later App Store / Google Play release checklist.

Acceptance:

- Phone URL works from Vercel.
- Save/load works.
- No console errors.
- Performance holds on mobile.
- Native release path is documented before store work begins.

## Suggested First Sprint

Sprint name: **Wood To Sawmill**

Scope:

- KingdomScene.
- Hero movement.
- Tree node.
- Wood pickups.
- Carry stack.
- Sawmill deposit zone.
- Sawmill construction.

Do not include:

- Combat.
- Cloud save.
- Worker automation.
- Shop.
- More than one resource.

The first sprint is about feel.
