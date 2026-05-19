# Tracking System

This file defines how the new game should track decisions, tasks, bugs, and QA inside documentation until a dedicated issue tracker is created.

## Status Values

Use:

- `TODO`
- `IN_PROGRESS`
- `BLOCKED`
- `DONE`
- `WONT_DO`

## Priority Values

Use:

- `P0`: blocks playable build.
- `P1`: important for MVP.
- `P2`: polish or useful improvement.
- `P3`: later idea.

## Decision Log

Add decisions here or split into `DECISION_LOG.md` later.

| ID | Date | Decision | Reason | Status |
|---|---|---|---|---|
| BLD-001 | 2026-05-19 | New game direction is idle arcade builder, not TD reskin | Tiny Swords supports full kingdom economy better than simple TD | DONE |
| BLD-002 | 2026-05-19 | Use Phaser + React + Vite + TypeScript | Fits current repo and mobile web prototype needs | DONE |
| BLD-003 | 2026-05-19 | Keep high-frequency simulation inside Phaser, not React | Better performance and cleaner game loop | DONE |
| BLD-004 | 2026-05-19 | Organize content by feature folder | Makes buildings/resources/units easier to expand | DONE |
| BLD-005 | 2026-05-19 | Use local saves before cloud saves | MVP should prove fun before backend complexity | DONE |
| BLD-006 | 2026-05-19 | Build on Windows, prototype on mobile web, release later through Capacitor | Windows is ideal for daily development; iPhone release requires Apple signing/Xcode access later | DONE |
| BLD-007 | 2026-05-19 | Use Satisfy Kingdom as the working product name | Matches satisfying resource loops and kingdom theme | DONE |

## Task Backlog

| ID | Priority | Status | Area | Task | Acceptance |
|---|---|---|---|---|---|
| TASK-001 | P0 | TODO | Setup | Choose branch/repo strategy | New game work cannot break TD production |
| TASK-002 | P0 | TODO | Scene | Create `KingdomScene` | Scene boots on mobile viewport |
| TASK-003 | P0 | TODO | Input | Add virtual joystick | Player moves with one finger |
| TASK-004 | P0 | TODO | Carry | Add carry stack system | Wood visibly stacks on player |
| TASK-005 | P0 | TODO | Resources | Add tree node and wood pickups | Player collects wood from world |
| TASK-006 | P0 | TODO | Deposits | Add sawmill build zone | Depositing wood completes build |
| TASK-007 | P1 | TODO | Production | Add sawmill recipe wood -> planks | Planks output over time |
| TASK-008 | P1 | TODO | Buildings | Add Worker Hut | Player can unlock first worker |
| TASK-009 | P1 | TODO | Workers | Add gatherer AI | Worker gathers wood automatically |
| TASK-010 | P1 | TODO | Saves | Add local save | Refresh preserves progress |
| TASK-011 | P2 | TODO | Combat | Add first red raid | Raider event creates light pressure |
| TASK-012 | P2 | TODO | Cloud | Add Supabase save sync | Signed-in player syncs save |
| TASK-013 | P1 | TODO | Release | Add Windows setup and phone LAN QA guide | Developer can test on phone from Windows |
| TASK-014 | P2 | TODO | Release | Add Capacitor iPhone/Android release checklist | Native release blockers are known before store work |

## Bug Tracker

| ID | Priority | Status | Area | Bug | Repro | Expected |
|---|---|---|---|---|---|---|
| BUG-001 | P1 | TODO | Assets | Verify Tiny Swords license terms before public release | Review official itch page before launch | Runtime subset remains compliant |

## QA Checklist

### Mobile Browser

- [ ] Loads at `390x844`.
- [ ] No console errors.
- [ ] No clipped top HUD.
- [ ] No clipped bottom controls.
- [ ] Joystick works with touch.
- [ ] Player remains visible.
- [ ] Carry stack remains readable.
- [ ] Deposit labels are readable.
- [ ] FPS feels stable.

### Core Loop

- [ ] Player can collect wood.
- [ ] Player can carry wood.
- [ ] Player can deposit wood.
- [ ] Build zone decrements.
- [ ] Building appears on completion.
- [ ] Resource stack decreases correctly.
- [ ] Save/load restores state.

### Visual Quality

- [ ] Tiny Swords assets are not stretched badly.
- [ ] Sprite sheets use correct frame sizes.
- [ ] Depth sorting looks correct.
- [ ] FX do not obscure controls.
- [ ] UI text has enough contrast.

### Product Feel

- [ ] First goal is obvious.
- [ ] First completion happens quickly.
- [ ] Player has a reason to keep moving.
- [ ] Automation feels like a reward.

## Bug Report Template

```text
ID:
Priority:
Status:
Area:
Build/Commit:
Device/Viewport:
Steps:
Expected:
Actual:
Screenshot/Video:
Notes:
```

## Feature Spec Template

```text
Feature:
Owner folder:
Goal:
Player-facing behavior:
Systems touched:
Content files:
Save impact:
UI impact:
Assets:
Acceptance criteria:
Risks:
```

## Implementation Rule

Every new gameplay feature should update:

- Relevant content folder.
- Relevant system folder.
- Save types if persistent.
- QA checklist if player-facing.
- This tracker if not complete in one commit.
