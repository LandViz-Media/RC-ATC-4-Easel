# RC-ATC for Easel — NC Preview UI Prototype v0.3.0

This is a standalone preview prototype for the RC-ATC for Easel project.

It is intentionally separate from the machine-tested G-code composer. It reads
Easel-generated `.nc` files locally in the browser and provides simple top-down
toolpath thumbnails and optional detailed/combined previews.

## v0.2.9

- Cleaned the preview deployment into one internally consistent six-file package.
- Restored `parser.js` to the proven v0.1.6 parser contract.
- The parser now remains responsible only for parsing toolpath geometry.
- Cutting/rapid move counts and Z-range information are calculated by `app.js`
  instead of modifying the proven parser.
- Retained compact operation thumbnails.
- Retained optional detailed preview.
- Retained optional combined project preview.
- Retained Tool 1–10 visibility controls for combined preview.
- Retained start/end markers and rapid-move controls.
- Added cache-busting query strings to the three JavaScript files.
- No machine composer or G-code generation code is included.

## Version history

### v0.2.8

The previous prototype attempted to add metadata fields directly to the parser.
That created a mismatch when files were deployed separately. This version
deliberately avoids that architecture.

### v0.2.7

- Added/fixed immediate redraw behavior for preview controls.
- Added optional detailed and combined preview controls.

### v0.2.6

- Integrated compact operation thumbnails with optional detailed/combined previews.
- Added tool assignment and Tool 1–10 visibility controls.

### v0.1.6 baseline

The original standalone parser/renderer that successfully displayed the supplied
NC test files is the geometry baseline for this project.

## Deployment

The `preview` directory should contain exactly these six files:

```text
preview/
├── index.html
├── app.js
├── parser.js
├── renderer.js
├── css.css
└── README.md
```

Do not add another `js` directory inside `preview`.

## Safety

This prototype is a visualization aid only. It does not execute G-code and does
not generate or modify the machine-control `.nc` output used by the RC-ATC
composer.


## v0.3.0

- Fixed thumbnail/detail viewport fitting.
- Cutting geometry now determines the preview scale.
- Rapid travel moves no longer shrink the cutting geometry to accommodate distant travel coordinates.
- Rapid moves are still drawn using the same coordinate transform when enabled.
- The proven parser remains unchanged.
- UI-only move statistics remain calculated in `app.js`.
- Version references were checked for consistency across the deployment.
