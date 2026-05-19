# Asset Credits

This file tracks every third-party asset used in the game.

## Required Fields

```text
Asset or pack:
Author:
Source URL:
License:
License URL:
Runtime path:
Notes:
```

## Current Runtime Assets

Asset or pack: Mergehold TD starter vector sprites
Author: Project-created placeholder assets
Source URL: Local repository
License: Project owned
License URL: N/A
Runtime path: `public/assets/optimized/sprites`
Notes: Custom fort, hero, and fallback sprites used alongside imported Kenney assets.

## Imported Third-Party Packs

Asset or pack: Tower Defense (Top-Down)
Author: Kenney
Source URL: https://opengameart.org/content/tower-defense-300-tilessprites
License: Creative Commons CC0
License URL: https://creativecommons.org/publicdomain/zero/1.0/
Runtime path: `public/assets/source/kenney/tower-defense-top-down`, `public/assets/optimized/sprites/kenney-*.png`
Notes: Original pack by Kenney.nl. Runtime selection uses towers, enemy units, grass/path-dot tiles, projectiles, and trees. Path is tiled `kenney-path-dot` (no vector overlay). Bat and bomber use project SVG silhouettes tinted per enemy data; archer shots use `projectile-arrow.svg`. Full wiring and rotation table: `docs/GRAPHICS.md`.

Asset or pack: Tiny Swords (Free Pack)
Author: Pixel Frog
Source URL: https://pixelfrog-assets.itch.io/tiny-swords
License: Itch.io asset terms; personal/commercial project use stated on source page, redistribution/repackaging prohibited.
License URL: https://pixelfrog-assets.itch.io/tiny-swords
Runtime path: `public/assets/optimized/tiny-swords`
Notes: Curated runtime subset for the visual redesign branch only. Raw source folder is intentionally local-only and ignored; verify current source-page terms before public release.

Asset or pack: Kenney Music Loops (German Virtue, Mission Plausible, Game Over)
Author: Kenney
Source URL: https://kenney.nl/assets/music-loops
License: Creative Commons CC0
License URL: https://creativecommons.org/publicdomain/zero/1.0/
Runtime path: `public/assets/optimized/audio/music/menu-loop.ogg`, `run-loop.ogg`, `sting-defeat.ogg`
Notes: Menu loop, in-run combat loop, defeat sting. Sourced via gamesounds.xyz mirror of Kenney pack.

Asset or pack: Kenney Interface Sounds
Author: Kenney
Source URL: https://kenney.nl/assets/interface-sounds
License: Creative Commons CC0
License URL: https://creativecommons.org/publicdomain/zero/1.0/
Runtime path: `public/assets/optimized/audio/sfx/tower-archer-fire.ogg`, `tower-magic-fire.ogg`, `build-place.ogg`, `build-upgrade.ogg`, `wave-start.ogg`, `enemy-leak.ogg`, `wave-clear.ogg`
Notes: Mapped from pluck_001, glass_003, confirmation_001, maximize_007, switch_003, error_004, jingles-hit_06 (Music Jingles Hit).

Asset or pack: Kenney Impact Sounds
Author: Kenney
Source URL: https://kenney.nl/assets/impact-sounds
License: Creative Commons CC0
License URL: https://creativecommons.org/publicdomain/zero/1.0/
Runtime path: `public/assets/optimized/audio/sfx/enemy-kill.ogg`, `fort-hit.ogg`
Notes: Mapped from impactGeneric_light_002, impactWood_heavy_002.

Asset or pack: Kenney Sci-Fi Sounds
Author: Kenney
Source URL: https://kenney.nl/assets/sci-fi-sounds
License: Creative Commons CC0
License URL: https://creativecommons.org/publicdomain/zero/1.0/
Runtime path: `public/assets/optimized/audio/sfx/tower-cannon-fire.ogg`, `enemy-bomber-explode.ogg`
Notes: Mapped from lowFrequency_explosion_001, explosionCrunch_000.

Asset or pack: Kenney RPG Audio
Author: Kenney
Source URL: https://kenney.nl/assets/rpg-audio
License: Creative Commons CC0
License URL: https://creativecommons.org/publicdomain/zero/1.0/
Runtime path: `public/assets/optimized/audio/sfx/trap-trigger.ogg`
Notes: Mapped from metalLatch.ogg.
