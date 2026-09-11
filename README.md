# Easel → MASSO RapidChange ATC Job Composer

**Current version: v0.5.14**

A browser-based utility for combining individual Easel CNC `.nc` files into one ordered job for a Onefinity Elite / MASSO controller / RapidChange ATC.

Easel supplies the cutting path, spindle speed, feeds, depths, and geometry. The composer assigns each path to a MASSO tool and inserts only the machine-level transitions required to move between tools.

RapidChange ATC geometry and measurement logic remain in the existing MASSO macros installed by the RapidChange wizard. The web application calls those macros rather than reproducing their logic.

## v0.5.10 update

- Corrected the RapidChange integration architecture based on the RapidChange Masso G3 documentation supplied with this project. The composer now treats the RapidChange `M98 P63<tool>` subroutine as the owner of unloading/loading, pocket tracking, tool-setter positioning, Auto Tool Zero, and `T# M6`.
- Removed the composer's duplicate tool-setter coordinates and measurement commands. Tool-setter X/Y are no longer stored in browser settings or emitted by the composer. RapidChange/MASSO remains the source of truth for those machine coordinates.
- Removed the composer's fixed 4-second tool-change dwell. RapidChange controls its own tool-change timing and internal dwell behavior.
- Preserved the successful v0.5.8 initial positive-Z safe-position optimization.
- Kept the optional dust-shoe removal/reinstallation pauses. The reinstall message now includes a compact next-path identifier because MASSO `MSG` supports one displayed line of 34 characters.
- Preserved the v0.5.7 completion message, final shutdown order, startup reminders, metadata, and ordered Easel toolpaths.

- Added `name` and `shortName` fields to the manual-tool inventory.
- `name` is the full cutter description shown in the composer UI; `shortName` is reserved for MASSO operator messages and is limited to 10 characters.
- When a tool-change transition is about to acquire a manual tool (after the first operation), the shoe-off message identifies that tool, for example `MSG Shoe off; Next T10: 90° V`.
- Removed the separate pre-RapidChange manual-tool advance message. RapidChange macro files remain unchanged and continue to own the actual manual unload/load/measurement sequence.

- Added `config/manual-tools.json` as a small working inventory/catalog for manual tools T9/T10.
- Added seven starter cutters using `toolId`, `shaftDiameter`, `cuttingSize`, `type`, and `note`; V-bit cutting size is represented as `null`.
- Manual-tool operations now provide a second dropdown for selecting a cutter from the manual-tool catalog.
- Manual cutter identity is preserved in generated G-code comments without changing RapidChange macro behavior.
- Shortened the dust-shoe reinstall message from `Cycle Start` to `Start` so more of the upcoming Easel filename can be displayed: `MSG Shoe on; Start; <filename>`.
- Preserved the v0.5.10 machine-tested RapidChange sequencing and composer-side measurement/configuration boundaries.

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
6. Configure the machine-coordinate park position and dust-shoe pauses. RapidChange owns the tool-setter position.
7. Configure the desired end position/Z.
8. Generate one combined `.nc` file.
9. Inspect and air-test before cutting.

Consecutive operations using the same tool do not cause an unnecessary tool change.

## Tool configuration

`config/tools.json` is the editable tool inventory. The application reads it at startup and displays `Tool #: Name` in the operation dropdown.

`config/manual-tools.json` is the small working catalog used when T9 or T10 is assigned. It is intentionally separate from the T1–T8 RapidChange slot definitions for now; a future inventory manager may unify physical cutter inventory and slot assignment.

Current tools are T1–T8 automatic RapidChange tools and T9–T10 manual/custom tools.

## Coordinates

The composer emits the park position as machine coordinates with `G53`.

The RapidChange tool-setter position is **not configured in this application**. RapidChange documentation requires the setter position to be configured in the RapidChange Web UI and corresponding MASSO Type 2 tool-changer settings; every tool, including manual tools, uses that configured setter position.

## Dust-shoe sequence

For a tool change, the intended physical sequence is:

finish path → raise/park → spindle stop → pause to remove shoe → RapidChange change/measurement → return to park → pause to reinstall shoe → Start → Easel's own spindle startup → next path.

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
