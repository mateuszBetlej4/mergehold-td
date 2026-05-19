# Satisfy Kingdom Bug Tracker

Use this file for known bugs, risks, and defects during Satisfy Kingdom development. When GitHub Issues are active, each bug should either link to a GitHub issue or be migrated into one.

Main tracker: [TRACKING.md](./TRACKING.md)

## Status Values

- `New`
- `Confirmed`
- `In Progress`
- `Blocked`
- `Fixed`
- `Verified`
- `Won't Fix`

## Severity Values

- `S0` - Crash, data loss, app cannot load, or native build cannot launch.
- `S1` - Core gameplay loop broken.
- `S2` - Major feature broken but workaround exists.
- `S3` - Minor gameplay bug, visual issue, tuning issue, or documentation mismatch.
- `S4` - Polish, typo, naming inconsistency, small UX issue.

## Area Values

Suggested area labels:

- `Assets`
- `Build / Release`
- `Carry`
- `Combat`
- `Deposits`
- `Input`
- `Production`
- `Save / Sync`
- `Scene`
- `UI`
- `Workers`
- `World / Map`

## Bug Template

```text
ID:
Title:
Status:
Severity:
Area:
Found in:
Owner:
Date opened:
Related issue/doc:

Steps to reproduce:
Expected:
Actual:
Notes:
Verification:
```

## Active Bugs

---

ID: SK-BUG-001
Title: Verify Tiny Swords license terms before public release
Status: New
Severity: S2
Area: Assets
Found in: Satisfy Kingdom documentation setup 2026-05-19
Owner: Unassigned
Date opened: 2026-05-19
Related issue/doc: [Tiny Swords asset guide](../assets/TINY_SWORDS_ASSET_AUDIT.md)

Steps to reproduce:
1. Prepare a public build, public repository, App Store build, Google Play build, or marketing package.
2. Review the current official Tiny Swords page and downloaded pack.
3. Compare public distribution contents with the license terms.

Expected:
Only curated runtime assets required by the game are distributed. The raw source pack and `.aseprite` sources remain local-only. Pixel Frog attribution remains documented.

Actual:
License has been checked during planning, but must be verified again before release because the pack is in development and receives updates.

Notes:
The repo ignores `docs/new-game/assets/Tiny Swords (Free Pack)/` and `public/assets/source/Tiny Swords (Free Pack)/`.

Verification:
Before public release, confirm current license text and public artifact contents.

---

ID: SK-BUG-002
Title: Latest Tiny Swords pack may contain new structures missing from local inventory
Status: New
Severity: S3
Area: Assets
Found in: Official website review 2026-05-19
Owner: Unassigned
Date opened: 2026-05-19
Related issue/doc: [Tiny Swords asset guide](../assets/TINY_SWORDS_ASSET_AUDIT.md)

Steps to reproduce:
1. Open the official Tiny Swords page.
2. Review recent devlog entries.
3. Compare latest official additions with the local `docs/new-game/assets/Tiny Swords (Free Pack)/` folder.

Expected:
Local inventory reflects the latest pack if development depends on newer structures.

Actual:
The official page/devlog references additions such as Fish Hut, Cannon Tower, Goblin Hut with tileable fences, and Troll House. Current local inventory still shows the older 40 building PNG set.

Notes:
This is not blocking the first prototype, but it matters before finalizing the building catalog.

Verification:
Download/check latest pack and repeat inventory.

---

ID: SK-BUG-003
Title: UI assets can distort if scaled directly instead of sliced/stretched correctly
Status: New
Severity: S3
Area: UI
Found in: Tiny Swords TD visual prototype 2026-05-19
Owner: Unassigned
Date opened: 2026-05-19
Related issue/doc: [Tiny Swords asset guide](../assets/TINY_SWORDS_ASSET_AUDIT.md)

Steps to reproduce:
1. Scale paper/button/bar PNGs directly to arbitrary sizes in Phaser or CSS.
2. Inspect text panels and upgrade cards at `390x844`.

Expected:
Paper, buttons, bars, and panels preserve clean corners/borders and readable text.

Actual:
Directly scaled paper assets can create visible stripe/pattern artifacts and reduce text readability.

Notes:
Use CSS border-image/background layering, Phaser NineSlice, or manual sliced sprites for stretchable UI.

Verification:
Future Satisfy Kingdom UI QA should include mobile screenshots of all panel/button/bar states.

---

ID: SK-BUG-004
Title: Audio sources need per-file license/source tracking before implementation
Status: New
Severity: S3
Area: Assets
Found in: Audio planning 2026-05-19
Owner: Unassigned
Date opened: 2026-05-19
Related issue/doc: [Audio asset plan](../assets/AUDIO_ASSET_PLAN.md)

Steps to reproduce:
1. Download sound effects from Pixabay or any similar site.
2. Add them to runtime without recording source URL, author, license, and download date.

Expected:
Every runtime audio asset has a matching credit/license entry before it is committed.

Actual:
No audio assets have been selected yet; risk documented before sourcing starts.

Notes:
Pixabay's license summary allows free use without required attribution and adaptation, but prohibits standalone redistribution and requires us to check whether extra rights apply.

Verification:
Create `AUDIO_CREDITS.md` and require one entry per selected sound.

## Fixed Bugs

No fixed Satisfy Kingdom bugs yet.
