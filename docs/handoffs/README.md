# Agent handoffs

This folder holds **dated session handoffs** for Cursor agents continuing work on Mergehold TD.

## When a handoff is created

**The user decides when.** Do not write or update a handoff automatically at the end of every task.

When the user asks for a handoff (e.g. “make a handoff”, “hand off to the next agent”, “continue in a new agent”):

1. Finish or stabilize current work (build passing if code changed).
2. Create a **new file**: `docs/handoffs/YYYY-MM-DD.md` (use today’s date; if one exists for today, use `YYYY-MM-DD-2.md` or add a short suffix).
3. Include as much context as possible (see template below).
4. Update `docs/handoffs/LATEST.md` to point at the new file (one line: path + date).
5. Commit the handoff with the rest of the session work, or in a small “docs: handoff” commit if the user prefers.

## For the next agent

1. Read `docs/handoffs/LATEST.md` for the current handoff path.
2. Read that dated handoff file in full.
3. Then read `docs/DEVELOPMENT_CHECKLIST.md` and `docs/tracking/DECISION_LOG.md`.
4. Do **not** restart the project from scratch.

## File naming

| File | Purpose |
|------|---------|
| `README.md` | This process (unchanging) |
| `LATEST.md` | Single pointer to the newest handoff |
| `YYYY-MM-DD.md` | Snapshot for that session / date |

Older handoffs stay in the folder for history; prefer the file linked from `LATEST.md`.

## What each handoff should include

- Date, branch, repo URL, dev URL
- What changed **this session** (commits, features, bugs fixed)
- Current architecture reminder (short table)
- What is implemented vs not in-run
- Open checklist / recommended next steps
- Browser testing notes, git workflow, quirks
- Copy-paste **prompt block** for the next chat

Keep handoffs factual and dense; the next agent should be able to continue in one read.
