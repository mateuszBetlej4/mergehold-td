# Bug Tracker

Use this file for known bugs during development. When GitHub Issues are active, each bug should either link to a GitHub issue or be migrated into one.

## Status Values

- `New`
- `Confirmed`
- `In Progress`
- `Blocked`
- `Fixed`
- `Verified`
- `Won't Fix`

## Severity Values

- `S0` - Crash, data loss, app cannot load.
- `S1` - Core gameplay broken.
- `S2` - Major feature broken but workaround exists.
- `S3` - Minor bug, visual issue, tuning issue.
- `S4` - Polish, typo, small inconsistency.

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
Related issue:

Steps to reproduce:
Expected:
Actual:
Notes:
Verification:
```

## Active Bugs

No active bugs.

## Fixed Bugs

ID: BUG-005
Title: Built towers cannot be upgraded — "Build pad is occupied"
Status: Fixed
Severity: S1
Area: Gameplay / build pads
Found in: Tower placement after React HUD pass
Owner: Unassigned
Date opened: 2026-05-18
Related issue: N/A

Steps to reproduce:
1. Start a run and place a tower on a build pad.
2. With a tower type still selected, tap the same pad again to merge/upgrade.

Expected:
Spending 15 coins upgrades the tower tier.

Actual:
`tryBuildOrMerge` called `isPadOccupied()` before checking for an existing tower on that pad, so the occupied check fired and blocked the upgrade path.

Notes:
Tower upgrade logic existed but was unreachable when a tower was already on the pad.

Verification:
Tap placed tower with tower mode selected; tier increases for 15 coins.

ID: BUG-003
Title: Upgrade picker hides the run HUD bars
Status: Fixed
Severity: S2
Area: Run UI
Found in: React PlayHud overlay pass
Owner: Unassigned
Date opened: 2026-05-18
Related issue: N/A

Steps to reproduce:
1. Start a run and clear a wave.
2. Wait for the “Choose an upgrade” overlay.

Expected:
The top stat bar and bottom build dock stay visible while the player picks a card (overlay covers the field only).

Actual:
`PlayHud` returns `null` when `isChoosingUpgrade` is true, so the top and bottom UI bars disappear for the whole upgrade step.

Notes:
Regression from moving run chrome into React; Phaser overlay is not the cause—the HUD is explicitly unmounted.

Verification:
PlayHud stays mounted during upgrade; dock shows “Pick an upgrade card” hint.

ID: BUG-004
Title: Start Wave button shows the wrong wave number
Status: Fixed
Severity: S2
Area: Run UI / waves
Found in: Manual start-wave flow after upgrade pick
Owner: Unassigned
Date opened: 2026-05-18
Related issue: N/A

Steps to reproduce:
1. Start a run and clear wave 1.
2. Pick an upgrade.
3. Compare the Wave pill in the top bar with the “Start wave” button label.

Expected:
After wave 1 is cleared, the top bar still shows **Wave 1** (last cleared) and the button reads **Start wave 2** (next wave to fight).

Actual:
`chooseUpgrade()` increments `wave` before the player taps Start Wave, and `PlayHud` labels the button with `wave + 1`, so the UI shows **Wave 2** and **Start wave 3**.

Notes:
Wave should advance when the next wave actually starts (`beginNextWave` / `spawnWave`), not when the upgrade is chosen.

Verification:
Wave increments in `beginNextWave`; button label uses `wave + 1` for the next wave to start.

ID: BUG-001
Title: Enemies could target an earlier path point instead of advancing cleanly through the lane.
Status: Fixed
Severity: S1
Area: Gameplay
Found in: Visual asset pass
Owner: Codex
Date opened: 2026-05-18
Related issue: N/A

Steps to reproduce:
Start a run and observe enemies after they leave the first spawn point.
Expected:
Enemies should advance from waypoint to waypoint toward the fort.
Actual:
The target lookup could choose a previous waypoint, causing unstable movement.
Notes:
Enemies now track their current path index.
Verification:
`npm run build` passes and mobile browser smoke test loads Play with no console errors.

ID: BUG-002
Title: Play screen could scroll inside the mobile frame.
Status: Fixed
Severity: S2
Area: Mobile UI
Found in: Mobile browser smoke test
Owner: Codex
Date opened: 2026-05-18
Related issue: N/A

Steps to reproduce:
Open Play on a 390x844 viewport.
Expected:
The canvas should fit the available play area without an inner scrollbar.
Actual:
The screen body could scroll.
Notes:
Play screen now uses a no-scroll screen body and full-height canvas.
Verification:
Mobile browser check reported no body or screen scrolling.
