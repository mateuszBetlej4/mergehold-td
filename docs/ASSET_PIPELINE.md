# Asset Pipeline

## Asset Direction

Use stylized low-poly fantasy assets for the first version. This is readable on mobile, performs well, and matches the free sources available.

## Starting Asset Stack

### Kenney

Use for:

- Tower-defense buildings.
- UI packs.
- Mobile controls.
- Icons and simple effects.
- Extra environment kits.

Primary sources:

- https://kenney.nl/assets/tower-defense-kit
- https://www.kenney.nl/assets/blocky-characters
- https://www.kenney.nl/assets

License:

- CC0 on selected packs. Record the license per downloaded pack.

### Quaternius

Use for:

- Animated enemies.
- Friendly troops.
- Fantasy props.
- Medieval buildings.
- Humanoid animation libraries.

Primary sources:

- https://quaternius.com/
- https://quaternius.com/packs/ultimatemonsters.html
- https://quaternius.com/packs/cutemonsters.html

License:

- CC0 on selected packs. Record the license per downloaded pack.

### Mixamo

Use for:

- Humanoid animation prototyping.
- Retargeting animations to custom or free humanoid models.

Important:

- Good for game usage, but do not redistribute raw Mixamo assets as a standalone asset pack.
- Use only inside the game build.

### Game-icons.net

Use for:

- Upgrade icons.
- Ability icons.
- Building type icons.

License:

- Mostly CC-BY. Attribution required.

### Freesound

Use for:

- SFX only after filtering by CC0 or acceptable attribution license.

## Asset Folder Structure

```text
public/assets/
  source/
    kenney/
    quaternius/
    mixamo/
    game-icons/
    freesound/
  optimized/
    sprites/
    atlases/
    audio/
    ui/
  licenses/
    ASSET_CREDITS.md
```

## Asset Intake Checklist

- Download source archive.
- Save original source URL.
- Save license name and license URL.
- Add pack to `public/assets/licenses/ASSET_CREDITS.md`.
- Convert or optimize for web.
- Keep filenames lowercase and hyphenated.
- Test asset loads in browser.
- Remove unused large files before release.

## Naming Rules

Use:

```text
category-name-variant.ext
```

Examples:

```text
tower-archer-tier-01.png
enemy-slime-walk.png
ui-icon-upgrade-damage.svg
sfx-merge-01.ogg
```

## Optimization Rules

- Prefer PNG/WebP for 2D.
- Prefer OGG/MP3 for audio.
- Keep source files separate from optimized runtime files.
- For 3D models later, prefer glTF/GLB.
- Use texture atlases for repeated sprites.
- Avoid shipping unused source archives in production.

## Credits

Every asset used in the game must be listed in:

- `public/assets/licenses/ASSET_CREDITS.md`

