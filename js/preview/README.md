# NC Thumbnail Integrated UI Prototype v0.2.5

This prototype integrates the **proven v0.1.6 parser and renderer** into the composer-style interface.

## Important deployment structure

Keep all prototype files together:

```text
js/
└── preview/
    ├── index.html
    ├── css.css
    ├── parser.js
    ├── renderer.js
    ├── app.js
    └── README.md
```

`index.html` loads `parser.js`, `renderer.js`, and then `app.js` from the same directory.

## Features

- Multiple `.nc` file import and drag/drop.
- Individual operation thumbnails using the proven v0.1.6 visualization engine.
- Green start and red end markers.
- Rapid moves in gray dashes.
- Tool assignment using Tools 1–10.
- Operation ordering/removal.
- Hover details.
- Combined project preview.
- Per-tool visibility with All/None controls.

## v0.2.4

Fixed the browser wiring by explicitly exposing the proven parser and renderer as `window.NCPreviewParser` and `window.NCPreviewRenderer`, which is what the integrated UI controller uses.

No changes were made to the underlying visualization geometry logic.


## Exact GitHub deployment structure

Place the files directly in:

```text
RC-ATC-4-Easel/js/preview/
├── index.html
├── app.js
├── parser.js
├── renderer.js
├── css.css
└── README.md
```

There should be **no `js/` directory inside `preview/`**.
