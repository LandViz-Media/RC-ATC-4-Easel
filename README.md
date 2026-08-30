# Easel → MASSO RapidChange ATC Job Composer

Initial JavaScript prototype for combining single-tool Easel `.nc` files into one multi-operation MASSO job.

## Initial goals

- Import multiple Easel `.nc` files.
- Order operations.
- Assign RapidChange Tools 1–8.
- Use the RapidChange subroutine convention from `Masso_RC_ATC_inch.con`:
  - Tool 1 → `M98 P631`
  - Tool 2 → `M98 P632`
  - ...
  - Tool 8 → `M98 P638`
- Remove Easel's final program-ending section.
- Insert operator pauses for removal/reinstallation of the dust shoe.
- Export one `.nc` file.

## Important

This is an **initial test version**, not yet a production-ready CNC post processor.

Do not run generated G-code on the machine until it has been reviewed and air-tested.

## Test files

The three uploaded Easel examples are included in `test-files/`:

- `outline.nc`
- `box.nc`
- `vCarve.nc`

## Run locally

Because this uses ES modules, serve the folder from a local web server rather than opening `index.html` directly.

For example:

```bash
python3 -m http.server 8000
```

Then open:

http://localhost:8000/

## Next development step

Inspect the three actual Easel files and refine `parser.js` so the exact Easel header/footer structure is handled safely. Then test a three-operation generated file before adding more advanced MASSO/RapidChange logic.
