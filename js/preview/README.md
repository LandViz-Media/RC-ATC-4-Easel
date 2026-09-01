# RC-ATC for Easel — NC Preview UI Prototype v0.3.6

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

## v0.3.1

- Replaced the two independent preview checkboxes with a mutually exclusive radio group:
  - No detail preview
  - Show detailed preview
  - Show combined project preview
- Added explicit Tool 1–10 visibility controls to the combined preview for every assigned tool.
- Added working All and None controls for combined tool visibility.
- Newly assigned tools default to visible; visibility choices persist while the project is edited.
- An empty combined visibility set now correctly means no toolpaths are displayed.
- Kept rapid-move controls independent of tool visibility.
- Kept the v0.3.0 rendering approach and proven parser baseline unchanged.

## v0.3.2

- Fixed the preview-mode HTML so it matches the radio-button logic in `app.js`.
- Preview mode is now mutually exclusive:
  - No detail preview
  - Show detailed preview
  - Show combined project preview
- Fixed the combined preview activation.
- Tool 1–10 visibility controls remain available inside the combined preview.
- Newly assigned tools default to visible.
- All/None controls remain available for assigned tools.
- Rapid movement controls remain independent of tool visibility.
- No changes to the proven parser or v0.3.0 rendering geometry.

## v0.3.3

- Added GUI polish to the operation list and preview controls.
- Added an operation/project status line showing assigned and unassigned tools.
- Added an explicit warning on operations without a tool assignment:
  `⚠ Tool not assigned — excluded from combined preview`.
- Kept the mutually exclusive preview modes:
  - No detail preview
  - Show detailed preview
  - Show combined project preview
- Kept Tool 1–10 visibility controls and All/None behavior in the combined preview.
- Added/retained ruler-ready axes behavior for the larger preview; axes remain off by default.
- No changes to the proven parser or cutting-geometry rendering approach.

## v0.3.4

- Fixed the operation-list regression that prevented thumbnails and tool-assignment
  controls from appearing correctly.
- Restored the Assigned Tool dropdown for every operation.
- Restored the unassigned-tool warning beside the operation information.
- Preserved operation reorder/remove controls.
- Clarified the combined-preview empty-state message.
- Kept the mutually exclusive preview-mode radio controls.
- No changes to the proven parser or preview geometry.

## v0.3.5

- Fixed the browser startup regression introduced in v0.3.4.
- Added the missing project-status DOM element required by `app.js`.
- Added a defensive guard so a missing status element cannot stop the preview UI from initializing.
- Added a line break to the combined-preview empty-state message for readability.
- No changes to the parser or toolpath rendering geometry.

## v0.3.6

- Added optional inch rulers/tick marks to the larger Detailed Preview.
- Added matching axes & measurements control to the Combined Project Preview.
- Added tool-specific colors to Combined Project Preview paths.
- Added a matching color legend for assigned tools.
- Rapid moves remain medium-gray dashed lines.
- Individual operation thumbnails remain unchanged and monochrome.
- Kept the proven parser and cutting-geometry fitting approach unchanged.
