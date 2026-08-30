# Change Log — Easel → MASSO RapidChange ATC Job Composer

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
