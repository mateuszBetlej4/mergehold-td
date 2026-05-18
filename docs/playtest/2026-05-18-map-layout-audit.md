# Map layout playtest audit — 2026-05-18

Screenshots: `docs/playtest/map-*.png`  
Audit script: `npm run audit:maps`

## TD design research (applied)

| Principle | Implementation |
|-----------|----------------|
| Multiple paths with **different lengths** | Frostgate center 440px vs sides 576px (runners take center) |
| **Merge chokepoints** | Greenwatch single merge pad at (195, 318) |
| **Limited, non-overlapping build spots** | Explicit tower coords; min 54px gap |
| **Traps on lane, towers off lane** | `trapOnPath` snaps to segment; towers 58–94px from path |
| **Distinct silhouettes per map** | Y-fork / teardrop / 3-highway / S-maze |

Sources: Kingdom Rush–style forks, Bloons parallel lanes, TD design guides (chokepoints, path splitting).

## Per-map summary

| Map | Lanes | Route lengths | Towers | Traps (on-path) | Silhouette |
|-----|-------|---------------|--------|-----------------|------------|
| **Greenwatch** | 2 | 525 / 525 | 7 | 5 @ 0px | Y-fork → merge → fort |
| **Sunspire** | 2 | 497 / 497 | 6 | 5 @ 0px | Early horizontal split, teardrop |
| **Frostgate** | 3 | 576 / **440** / 576 | 6 | 6 @ 0px | Side serpentines + center rush lane |
| **Underkeep** | 2 | 524 / 524 | 5 | 7 @ 0px | Tight zig-zag gauntlet vs crypt |

## Pad audit (post-fix)

- **Trap overlap:** fixed (merge traps no longer duplicate at same coords)
- **Tower overlap:** none &lt; 54px on any map
- **Tower coverage:** all pads ≤94px from nearest lane (archer range 166)
- **Frostgate:** center lane towers moved off spine to (148,168) / (242,398)

## Strategic pad roles

### Greenwatch
- Outer pads (128,118) / (262,118): cover fork legs
- Bend pads (48,218) / (342,218): choke DPS
- **Merge pad (195,318):** covers both branches + shared approach
- Rear pads (118,408) / (272,408): final leg

### Sunspire
- Wide outer pads (305,95) / (85,95): parallel highway start
- Mid pads (335,200) / (55,200): lane-exclusive coverage
- (195,290): between lanes before funnel
- (248,385): final bend

### Frostgate
- Side pads (52,188) / (338,188): serpentine bends
- Mid pads (118,278) / (272,278): second bend
- Center flanks (148,168) / (242,398): cover rush lane without blocking it

### Underkeep
- Outer (42,178) / (348,178): early zig
- Mid (68,318) / (322,318): corner holds
- (195,248): between branches (mage AoE center)

## Screenshots captured @ 390×844

1. `map-greenwatch.png` — forked diamond merge
2. `map-sunspire-v2.png` — wide teardrop split
3. `map-frostgate.png` — 3-lane with center spine
4. `map-underkeep.png` — dual zig corridors + purple pillars

## Remaining polish (optional)

- Dedicated trap glyph on path (spike icon at pad)
- Route labels at fork
- `DEBUG_UNLOCK_ALL_MAPS` → `false` before release
