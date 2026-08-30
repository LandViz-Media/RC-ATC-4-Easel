# Easel → MASSO RapidChange ATC Job Composer

A browser-based utility for combining multiple single-tool Easel CNC `.nc` files into one ordered job for a Onefinity Elite / MASSO controller / RapidChange ATC setup.

## Project purpose

Easel is convenient for creating individual toolpaths, but a multi-tool project normally requires exporting separate `.nc` files and manually loading each file on MASSO.

This project provides a job-composer layer between Easel and MASSO:

Easel files → order operations → assign tools → manage RapidChange transitions → generate one combined `.nc` file.

## Current status

**Development version: v0.3.0**

The project is being developed and tested against a real Onefinity Elite with MASSO and RapidChange ATC.

The application is intended to orchestrate the existing RapidChange/MASSO macros rather than duplicate the ATC logic inside generated G-code.

## RapidChange architecture

The RapidChange wizard installs detailed ATC routines on MASSO. The composer calls those existing routines.

For Tools 1–8:

```text
Tool 1 → M98 P631
Tool 2 → M98 P632
Tool 3 → M98 P633
...
Tool 8 → M98 P638
```

Tool measurement uses the MASSO/RapidChange mechanism already installed by the RapidChange setup.

Known tool-setter position:

```text
X = 0.315
Y = 0.273
```

RapidChange recommends synchronizing MASSO's active pocket/tool state before beginning a job. The application therefore asks the operator to confirm the starting spindle tool rather than attempting direct communication with MASSO.

## Dust-shoe workflow

The current physical workflow is:

1. Complete the current Easel toolpath.
2. Raise the tool to a safe Z height.
3. Move to the configured dust-shoe park location.
4. Stop the spindle.
5. Pause so the operator can remove the dust shoe.
6. Operator presses Start on MASSO.
7. RapidChange acquires the next tool.
8. The tool is measured.
9. Machine raises Z and returns to the park location.
10. Pause so the operator can reinstall the dust shoe.
11. Operator presses Start.
12. Spindle starts.
13. Next Easel toolpath runs.

This keeps dust from the shoe from falling onto the carved work while the shoe is being removed.

## Easel file handling

Individual Easel files are treated as toolpath sources.

The composer removes file-level termination so one Easel file does not terminate the entire combined job.

Easel's final return:

```gcode
G0 X0.00000 Y0.00000
```

is not wanted between operations and is removed. The safe Z raise is retained.

The actual cutting moves are intentionally passed through without reinterpretation at this stage.

## Future development

Possible future features include:
- More robust Easel header/footer recognition.
- Tools 9 and 10/custom manual changes.
- Startup/current-tool synchronization assistance.
- G-code validation.
- 2D toolpath thumbnails.
- Approximate visual carve previews.
- Job summaries and warnings.
- Additional MASSO/RapidChange configuration options.

## Safety

This project generates CNC G-code for a physical machine.

**Do not assume generated G-code is safe simply because it was produced by this application.**

Review generated files before running them. Air-test new versions and workflows before cutting material. Verify tool numbers, work offsets, safe Z heights, park positions, spindle speeds, feeds, and RapidChange configuration.

## Repository structure

```text
RC-ATC-4-Easel/
├── index.html
├── README.md
├── CHANGELOG.md
├── css/
├── js/
└── examples/
```

## Development

The application is plain HTML, CSS, and JavaScript using ES modules. No build system or framework is currently required.

For local testing:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Versioning

Every update receives an explicit version number. The current version is displayed on `index.html` so the deployed GitHub Pages version can be verified visually.

Version-specific changes are recorded in `CHANGELOG.md`.
