# Easel → MASSO RapidChange ATC Job Composer

**Current version: v0.5.8**

A browser-based utility for combining individual Easel CNC `.nc` files into one ordered job for a Onefinity Elite / MASSO controller / RapidChange ATC.

Easel supplies the cutting path, spindle speed, feeds, depths, and geometry. The composer assigns each path to a MASSO tool and inserts only the machine-level transitions required to move between tools.

RapidChange ATC geometry and measurement logic remain in the existing MASSO macros installed by the RapidChange wizard. The web application calls those macros rather than reproducing their logic.

## v0.5.8 update

- Optimized only the initial positive-Z safe-positioning move in each Easel path: the common `G1 Z0.20000 F9.0` positioning move is emitted as `G0 Z0.20000`. Actual plunge and cutting Z moves remain unchanged.
- Added RapidChange manual-tool calls for T9 and T10 using the RapidChange P63<tool> subroutine convention (`M98 P639` and `M98 P6310`). The RapidChange-generated manual-tool macro remains responsible for unloading/loading/measuring the tool.
- Manual-tool changes return to the configured machine park position after the RapidChange macro and retain the existing dust-shoe pause workflow.
- Preserved all v0.5.7 completion-message, shutdown-order, startup-reminder, metadata, and automatic-tool behavior.

## v0.5.7 update

- The generated job now ends with a MASSO completion message using the output/project title: `Project <title> has completed.`
- The completion message is emitted after final Z retraction, spindle shutdown, and final machine-coordinate X/Y positioning, immediately before `M30`.
- Removed the extra explanatory startup sentence from the GUI; the two required operator reminders remain.
- No changes were made to the v0.5.6 RapidChange sequencing or Easel toolpath handling.

## Current workflow

1. Set the X, Y, and Z workpiece origin in MASSO.
2. Run the appropriate RapidChange Sync Pocket macro on MASSO so MASSO knows which tool is physically in the spindle.
3. Import Easel `.nc` files.
4. Assign each path a MASSO tool from `config/tools.json`.
5. Order the operations.
6. Configure the machine-coordinate park/tool-setter positions and dust-shoe pauses.
7. Configure the desired end position/Z.
8. Generate one combined `.nc` file.
9. Inspect and air-test before cutting.

Consecutive operations using the same tool do not cause an unnecessary tool change.

## Tool configuration

`config/tools.json` is the editable tool inventory. The application reads it at startup and displays `Tool #: Name` in the operation dropdown.

Current tools are T1–T8 automatic RapidChange tools and T9–T10 manual/custom tools.

## Coordinates

The park position and tool-setter position are **machine coordinates** and are emitted with `G53`.

Current tool-setter position:
- X `0.315`
- Y `0.273`

## Dust-shoe sequence

For a tool change, the intended physical sequence is:

finish path → raise/park → spindle stop → pause to remove shoe → RapidChange change → measure → return to park → pause to reinstall shoe → Start → Easel's own spindle startup → next path.

The application does not impose a global spindle speed; Easel's own RPM and feed values are preserved.

## End-of-job options

The job may:
- finish at the park machine coordinates,
- finish at custom machine X/Y,
- leave X/Y unchanged and raise Z only,
- optionally override the final Z height.

## Safety

This application generates CNC G-code for a physical machine. Always inspect generated files and air-test new versions before cutting. Verify tools, work offsets, machine-coordinate positions, spindle speeds, feeds, safe Z heights, and RapidChange configuration.

## Development

Plain HTML/CSS/JavaScript using ES modules. No build system is required.

For local testing:

```bash
python3 -m http.server 8000
```

Every update receives an explicit version number. Version-specific changes are recorded in `CHANGELOG.md`.


### Easel safety height

Easel's own Safety Height / Origin Safety Height settings remain the responsibility of Easel. The composer does not replace or rewrite those values. Easel's operation code, including its normal `G0 Z...` retracts, is preserved when the files are combined.


### Startup confirmation

Before any job motion, the generated file displays a MASSO message asking the operator to confirm that the X, Y, and Z workpiece origin has been set.

### Final shutdown sequence

At job completion the composer retracts Z, stops the spindle, and only then makes any final machine-coordinate XY move. This prevents the spindle from remaining on during final rapid transport.


### Job output metadata

The composer accepts an optional output file name and brief description. The `.nc` extension is added automatically. The description is written as comments at the top of the generated file for future preview/simulation use. A generated timestamp uses the computer/browser's local date and time.

### Operator reminders

The startup screen reminds the operator to set the workpiece X/Y/Z origin and to run the appropriate RapidChange Sync Pocket macro before running the generated job. The composer does not store or ask for a specific current spindle tool.
