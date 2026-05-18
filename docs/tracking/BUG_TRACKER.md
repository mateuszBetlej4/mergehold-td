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

No active bugs yet.

## Fixed Bugs

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
