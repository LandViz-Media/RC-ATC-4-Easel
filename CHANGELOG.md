## v0.5.6 — Simplified startup workflow and job metadata

- Fixed the v0.5.5 UI regression that prevented loaded files from being reordered and assigned tools.
- Combined the workpiece-origin and MASSO Sync Pocket instructions into a single reminder step with no checkbox or current-spindle-tool selector.
- Added a job output file-name field; `.nc` is appended automatically.
- Added an optional brief job description written as comments at the top of the generated `.nc` file.
- Added a local computer/browser timestamp to the generated `.nc` header.
- Preserved the v0.5.4 safe final shutdown order: retract Z, stop spindle, then move to final machine-coordinate X/Y.
- Preserved Easel path commands and RapidChange macro calls.
- Updated the visible application version to v0.5.6.

# Change Log — Easel → MASSO RapidChange ATC Job Composer

## v0.5.2 — Safe pre-positioning and MASSO operator messages

- Defaulted ATC Park Z to machine Z `0.000`.
- Added MASSO `MSG` prompts for dust-shoe removal and reinstallation.
- Added a safe pre-position before each Easel operation: identify the first XY rapid and move there at machine-safe Z before the untouched Easel toolpath begins.
- Kept Easel's toolpath body unchanged, including its final `G0 Z0.20000` retract.
- Continued removing only Easel's file-level `G0 X0.00000 Y0.00000` return and shutdown commands required to combine files.
- Kept Easel spindle RPM/feed/depth values unchanged.
- Updated application version to v0.5.2.

## v0.5.4 — Startup origin confirmation and safe final shutdown

- Added an initial MASSO `MSG` prompt requiring confirmation that the workpiece X/Y/Z origin has been set before job motion begins.
- Changed the absolute end-of-job sequence so Z retracts first, then `M5`/`M9` stop the spindle, and only afterward does any final machine-coordinate X/Y travel.
- Preserved the existing v0.5.3 machine-coordinate Park Z defaults and UI notes.
- Preserved Easel's own path commands and Z retracts.
- No change to RapidChange macro calls or tool measurement logic.
- Updated application version to v0.5.4.

## v0.5.3 — Machine Z defaults and coordinate documentation

- Fixed the UI/default mismatch so ATC Park Z defaults to machine Z `0.000`.
- Fixed the end-Z override default to machine Z `0.000`.
- Added UI notes explaining that `0.000` is the top of Z travel and more-negative machine Z values are possible.
- Clarified that Easel's Safety Height and Origin Safety Height remain controlled by Easel.
- Preserved Easel's own Z retracts and cutting commands unchanged.
- No change to the v0.5.2 safe pre-positioning logic or RapidChange macro calls.
- Updated application version to v0.5.3.

## v0.4.0 — Tool configuration and job-state workflow

- Added editable `config/tools.json`.
- Tool dropdowns now read from the JSON inventory and display `Tool #: Name`.
- Added the current T1–T10 tool assignments.
- Added starting-tool confirmation tied to the operator's RapidChange Sync Pocket workflow.
- Track current tool across operations and skip changes when consecutive paths use the same tool.
- Automatic T1–T8 operations call existing `M98 P63x` RapidChange macros.
- T9/T10 are represented as manual/custom tools.
- Preserved Easel spindle RPM/feed/cutting values rather than imposing a global spindle speed.
- Refined dust-shoe park/remove/change/measure/park/install sequence.
- Added end-of-job park/custom/X-Y-unchanged options and end-Z override.
- Park and tool-setter coordinates are explicitly treated as machine coordinates.
- Displayed v0.4.0 on the application interface.

## v0.3.0 — Job sequencing and dust-shoe workflow

- Added visible application version.
- Added starting spindle-tool selection.
- Added skip-first-change behavior when the starting tool matches the first operation.
- Added tool-setter X `0.315`, Y `0.273`.
- Added dust-shoe transition workflow.
- Removed Easel's final `G0 X0.00000 Y0.00000` return from operation shutdown.
- Retained the safe Z raise.
- Removed Easel trailing `G4`/`M5` shutdown commands so the composer controls transitions.
- Kept RapidChange logic on MASSO.

## v0.2.0 — RapidChange measurement sequence

- Added known-good RapidChange/MASSO tool-change pattern.
- T1–T8 mapped to `M98 P631` through `M98 P638` with corresponding `T# M6`.

## v0.1.0 — Initial project

- Created the initial HTML/CSS/JavaScript GitHub Pages application.
- Added multi-file import, ordering, tool assignment, combination, and basic RapidChange orchestration.
