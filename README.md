# Easel → MASSO RapidChange ATC Job Composer

**Current version: v0.4.0**

A browser-based utility for combining individual Easel CNC `.nc` files into one ordered job for a Onefinity Elite / MASSO controller / RapidChange ATC.

Easel supplies the cutting path, spindle speed, feeds, depths, and geometry. The composer assigns each path to a MASSO tool and inserts only the machine-level transitions required to move between tools.

RapidChange ATC geometry and measurement logic remain in the existing MASSO macros installed by the RapidChange wizard. The web application calls those macros rather than reproducing their logic.

## Current workflow

1. Run the appropriate RapidChange Sync Pocket macro on MASSO.
2. Confirm the physical spindle tool in the application.
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
