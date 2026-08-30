# Change Log — Easel → MASSO RapidChange ATC Job Composer

## v0.1.0 — Initial project

Created the initial JavaScript/GitHub Pages project for combining individual Easel `.nc` files into a single MASSO/RapidChange ATC job.

Initial structure:
- `index.html`
- `README.md`
- `css/styles.css`
- `js/app.js`
- `js/generator.js`
- `js/parser.js`
- `js/rapidchange.js`
- `js/settings.js`
- `js/ui.js`
- `test-files/outline.nc`
- `test-files/box.nc`
- `test-files/vCarve.nc`

Initial capabilities:
- Import multiple Easel `.nc` files.
- Reorder operations.
- Assign RapidChange Tools 1–8.
- Combine operations into one `.nc` file.
- Remove individual `M30` endings.
- Add optional dust-shoe parking pauses.
- Use the RapidChange `M98 P63x` convention.

## v0.2.0 — RapidChange measurement sequence

Updated tool-change handling based on the known-good MASSO/Onefinity RapidChange test.

Tool mapping:
- T1 → `M98 P631` → `T1 M6`
- T2 → `M98 P632` → `T2 M6`
- T3 → `M98 P633` → `T3 M6`
- T4 → `M98 P634` → `T4 M6`
- T5 → `M98 P635` → `T5 M6`
- T6 → `M98 P636` → `T6 M6`
- T7 → `M98 P637` → `T7 M6`
- T8 → `M98 P638` → `T8 M6`

The composer calls the existing RapidChange/MASSO routines rather than embedding the ATC routines into the generated cut file.

## v0.3.0 — Job sequencing and dust-shoe workflow

Added:
- Visible application version number.
- Starting spindle-tool selection.
- Skip the first tool change when the selected starting tool matches the first operation.
- Tool setter position: X `0.315`, Y `0.273`.
- Dust-shoe sequence: finish → raise Z → park → pause/remove shoe → RapidChange → measure → raise Z → park → pause/install shoe → spindle start → continue.
- Removal of Easel's final `G0 X0.00000 Y0.00000` return from the operation shutdown sequence.
- Retention of the final safe Z raise.
- Removal of Easel trailing `G4`/`M5` shutdown commands so the composer controls transitions.
- RapidChange logic remains on MASSO; the generated job calls the existing macros.

Known limitations:
- MASSO's current tool state is not read directly by the browser. The operator runs the RapidChange Sync Pocket routine and confirms the starting tool.
- Tools 9 and 10 remain custom/manual and are not yet automated.
- G-code thumbnails/previews are not yet implemented.
- Generated G-code must be reviewed and air-tested before cutting.
