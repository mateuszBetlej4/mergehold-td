# Satisfy Kingdom Audio Asset Plan

This document defines how Satisfy Kingdom will source, organize, license, and implement sound effects and music.

Audio is a core part of the product. The game is about satisfaction: chopping, collecting, stacking, depositing, building, upgrading, automating, and defending should all sound good.

## Source Policy

Approved starting sources:

- Pixabay sound effects: https://pixabay.com/sound-effects/
- Pixabay music: https://pixabay.com/music/
- Kenney audio packs, where already suitable.
- Original/project-created audio.
- Other free/paid sources only after license review.

Example research source:

- Pixabay wood chop search: https://pixabay.com/sound-effects/search/wood%20chop/

## Pixabay License Notes

Pixabay's current license summary says content can be used for free, attribution is not required, and content can be modified/adapted. It also prohibits selling or distributing Pixabay content on a standalone basis, and says users are responsible for checking whether any extra rights are needed.

Practical rules for Satisfy Kingdom:

- Use downloaded sounds inside the game as part of a creative product.
- Do not redistribute raw Pixabay audio as a standalone sound pack.
- Keep source URL, author, filename, license page, and download date for every selected sound.
- Prefer short game-ready SFX, not long ambience recordings, unless we intentionally edit them.
- Re-check the license page before public release.

Reference pages:

- Pixabay license summary: https://pixabay.com/service/license-summary/
- Pixabay terms: https://pixabay.com/service/terms/

## Audio Goals

Satisfy Kingdom should sound:

- Warm.
- Tactile.
- Snappy.
- Friendly.
- Slightly toy-like.
- Not harsh or noisy after repeated actions.

Every repeated action needs variation so it does not become annoying.

## Core Sound Categories

### Movement

| Event | Sound Direction |
|---|---|
| Footstep grass | Soft dry grass taps, low volume |
| Footstep road | Slightly firmer dirt/stone taps |
| Carry heavy stack | Subtle wobble/creak every few steps |
| Joystick start | Tiny UI tick or soft whoosh |
| Dash/speed boost later | Short airy swipe |

### Gathering

| Event | Search Terms |
|---|---|
| Chop wood hit | `wood chop`, `axe wood`, `tree chop`, `log split` |
| Tree depleted | `wood crack`, `tree fall small`, `wood snap` |
| Mine gold | `pickaxe rock`, `stone hit`, `mining`, `metal rock` |
| Collect gold | `coin pickup`, `gold collect`, `coin sparkle` |
| Harvest food | `knife cut`, `soft pop`, `collect food` |
| Sheep | `sheep baa`, `cartoon sheep`, `farm animal` |

### Pickup And Carry

| Event | Sound Direction |
|---|---|
| Resource pickup | Soft pop/click with resource tone |
| Stack add | Tiny layered tick, pitch rises slightly |
| Stack full | Friendly blocked/full sound |
| Stack drop | Soft thud |
| Auto-magnet pickup | Light whoosh into stack |

### Deposit And Build

| Event | Sound Direction |
|---|---|
| Deposit item | Click/drop/tick, very short |
| Cost milestone | Brighter chime |
| Build complete | Dust puff + wooden build flourish |
| Upgrade complete | Chime + hammer sparkle |
| Zone unlock | Gate/wood creak + success swell |
| Bridge complete | Wood plank placement + success |

### Production

| Event | Sound Direction |
|---|---|
| Sawmill processing | Gentle saw/wood loop, low volume |
| Plank produced | Wooden pop/drop |
| Quarry processing | Stone scrape/clink |
| Worker assigned | Small confirmation chirp |
| Output ready | Soft bell/chime |

### Workers

| Event | Sound Direction |
|---|---|
| Worker hired | Cheer/pop/chime |
| Worker starts job | Tiny voice/tick |
| Worker delivers | Deposit tick |
| Worker blocked | Soft confused UI note |
| Worker upgraded | Cheer + sparkle |

### Combat

| Event | Search Terms |
|---|---|
| Sword hit | `sword hit`, `blade impact`, `cartoon sword` |
| Arrow fire | `bow shot`, `arrow whoosh` |
| Arrow hit | `arrow impact`, `thud` |
| Guard hurt | Soft impact, not gory |
| Enemy defeated | Dust poof / pop |
| Raid warning | Drum/tension sting |
| Building damaged | Fire crackle, wood hit |

### UI

| Event | Sound Direction |
|---|---|
| Button tap | Wooden click |
| Confirm | Bright click/chime |
| Cancel/back | Soft low click |
| Error/not enough resource | Gentle thunk |
| New objective | Small bell |
| Reward claimed | Coin sparkle |
| Menu open | Paper/wood slide |

### Music And Ambience

| Area | Direction |
|---|---|
| Main base | Warm cozy loop, light medieval/fantasy |
| Forest | Soft nature ambience, birds, wind |
| Quarry | Low sparse ambience, distant taps |
| Raid | Light percussion tension |
| Victory/build complete | Short flourish |

Music should stay quiet and loop cleanly. SFX must remain readable over music.

## First Audio Shopping List

These are the first sounds to gather when audio implementation starts:

| ID | Priority | Event | Search Terms | Variations Needed |
|---|---|---|---|---:|
| `wood_chop` | P0 | Axe hits tree | `wood chop`, `axe wood` | 4 |
| `wood_pickup` | P0 | Wood enters stack | `wood pickup`, `pop`, `wood click` | 3 |
| `deposit_wood` | P0 | Wood deposited to zone | `wood drop`, `wood plank`, `click` | 3 |
| `build_complete` | P0 | First building appears | `construction complete`, `hammer build`, `success chime` | 2 |
| `ui_tap` | P0 | Button tap | `wood click`, `button click` | 3 |
| `not_enough` | P0 | Missing resources | `soft error`, `wood thunk` | 2 |
| `coin_pickup` | P1 | Gold/coin pickup | `coin pickup`, `coin collect` | 4 |
| `stone_hit` | P1 | Mining | `pickaxe rock`, `stone hit` | 4 |
| `worker_hired` | P1 | Worker unlocked | `tiny cheer`, `success pop` | 2 |
| `raid_warning` | P2 | Raid incoming | `drum warning`, `battle horn` | 2 |
| `sword_hit` | P2 | Combat hit | `sword hit`, `blade impact` | 4 |

## File Organization

Runtime audio should be curated and committed, not dumped wholesale.

```text
public/assets/optimized/satisfy-kingdom/audio/
  sfx/
    gathering/
      wood_chop_01.ogg
      wood_chop_02.ogg
    pickups/
      wood_pickup_01.ogg
    deposits/
      deposit_wood_01.ogg
    building/
      build_complete_01.ogg
    ui/
      ui_tap_01.ogg
    combat/
      sword_hit_01.ogg
  music/
    base_loop.ogg
    raid_loop.ogg
  ambience/
    forest_loop.ogg
```

Source/download notes:

```text
docs/new-game/assets/audio/
  AUDIO_ASSET_PLAN.md
  AUDIO_CREDITS.md
  source-candidates/
    pixabay-wood-chop.md
```

Do not commit large raw browsing dumps or unedited source libraries unless licenses and repo size are explicitly approved.

## Naming Rules

Use snake_case:

```text
<event>_<variant>.ogg
```

Examples:

```text
wood_chop_01.ogg
wood_chop_02.ogg
deposit_wood_01.ogg
build_complete_01.ogg
ui_tap_01.ogg
```

Loop naming:

```text
base_loop.ogg
forest_ambience_loop.ogg
raid_tension_loop.ogg
```

## Format Rules

Preferred runtime format:

- `.ogg` for web/runtime where supported.
- Keep `.wav` only as editable source if needed.
- Normalize loudness so repeated sounds are comfortable.
- Trim silence.
- Export short SFX as mono unless stereo adds meaningful space.
- Avoid huge files for mobile.

## Implementation Rules

Audio should support variation:

```text
playRandom("wood_chop", ["wood_chop_01", "wood_chop_02", "wood_chop_03"])
```

Audio manager should support:

- SFX volume.
- Music volume.
- Mute.
- Pause/resume.
- Random pitch variation.
- Cooldowns for spammy repeated sounds.
- Pooling/reuse for frequent SFX.
- Save settings locally.

## Audio Credits Template

Every chosen sound needs an entry:

```text
Asset:
Runtime filename:
Source URL:
Author:
Platform:
License:
License URL:
Downloaded:
Edited by project:
Notes:
```

## QA Checklist

- [ ] Sounds do not clip.
- [ ] Repeated chopping is satisfying, not harsh.
- [ ] Pickup stack sounds have variation.
- [ ] Deposit tick matches visual transfer rate.
- [ ] Build complete feels rewarding.
- [ ] UI sounds are quiet enough.
- [ ] Mute works.
- [ ] Volume settings persist.
- [ ] No missing audio asset console errors.
- [ ] Audio works on iPhone Safari and Android Chrome.
- [ ] Native wrapper audio resumes after app pause.

## Open Tasks

- [ ] Create `AUDIO_CREDITS.md`.
- [ ] Gather first wood chop candidates from Pixabay.
- [ ] Gather pickup/deposit candidates.
- [ ] Decide final runtime audio format.
- [ ] Design `SatisfyKingdomAudioManager`.
- [ ] Add audio tasks to tracking backlog.
- [ ] Add audio bugs to bug tracker when implementation starts.
