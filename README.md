# Easel → MASSO RapidChange ATC Job Composer v0.3.0

## What's new in v0.3.0

- Visible application version number on the page.
- Starting spindle tool selection.
- The first operation skips RapidChange when its assigned tool matches the confirmed starting tool.
- Easel trailing `G0 X0.00000 Y0.00000` return is removed from the shutdown block.
- Easel trailing `G4`/`M5` shutdown commands are removed while retaining the final safe Z raise.
- Dust shoe sequence is park → pause/remove → RapidChange → measure → park → pause/install → spindle start → machining.
- RapidChange logic continues to call the existing MASSO/RapidChange macros rather than embedding ATC routines in the generated cut file.

## Confirmed RapidChange pattern

For Tool 3:

```gcode
M98 P633
G53 G90 G0 Z-0.010
G53 G90 G0 X0.315 Y0.273
T3 M6
```

Tools 1–8 use `M98 P631` through `M98 P638`.

## Safety

This is still a development/test application. Inspect generated G-code and air-test it before cutting material.
