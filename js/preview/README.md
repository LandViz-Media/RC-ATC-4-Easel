# NC Thumbnail Integrated UI Prototype v0.2.8

This prototype keeps the visualization based on the proven standalone v0.1.6 engine.

## v0.2.6

- Compact thumbnails remain visible for each operation.
- Added optional Detailed Preview toggle.
- Added optional Combined Project Preview toggle.
- Detailed preview supports rapid/start/end/axes controls.
- Combined preview supports Tool 1–10 visibility with All/None controls.
- Individual and combined previews use one shared renderer.
- No G-code generation is included.

Keep this separate from the machine-tested composer until the visualization is approved.


## v0.2.7

- Fixed preview checkbox redraw behavior.
- Detailed-preview controls now redraw the existing canvas immediately.
- Combined-preview controls now redraw immediately without rebuilding the entire operation list.
- Tool visibility filters are rebuilt from current operation assignments whenever the combined preview is opened or an assignment changes.
- Preview controls remain isolated from the machine/G-code composer.


## v0.2.8

- Fixed the operation metadata display showing `undefined` cutting/rapid move counts.
- Added parser compatibility fields for cutting moves, rapid moves, and Z range.
- Added a little more consistent visual margin around thumbnail geometry.
- Preserved aspect-ratio-aware scaling and the existing start/end markers.
- Preview-only change; no machine-control or G-code composer files were modified.
