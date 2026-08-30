# Easel → MASSO RapidChange ATC Job Composer

Initial prototype for combining single-tool Easel `.nc` files into one multi-operation MASSO job.

## Confirmed RapidChange sequence

Based on the known-good Onefinity/MASSO/RapidChange test:

```gcode
M98 P633
G53 G90 G0 Z-0.010
G53 G90 G0 X0.315 Y0.273
T3 M6
```

Tools 1–8 map to `M98 P631` through `M98 P638`, followed by the corresponding `Tn M6`.

## Current behavior

- Import multiple Easel `.nc` files.
- Reorder operations.
- Assign RapidChange Tools 1–8.
- Remove each file's M30.
- Remove Easel's final X0/Y0 return when it is the final motion.
- Insert RapidChange acquisition and measurement.
- Optional dust-shoe removal/reinstallation pauses.
- Export one combined `.nc`.

Review and air-test generated G-code before cutting material.
