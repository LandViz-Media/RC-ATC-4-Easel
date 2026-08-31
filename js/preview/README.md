# NC Thumbnail Integrated UI Prototype v0.2.3

Integrated UI prototype built from the **proven v0.1.6 parser and renderer**.

This prototype does not generate G-code. It tests how the visualization can live inside the future RC-ATC-4-Easel composer.

Features:
- Multiple NC file import and drag/drop.
- Individual operation thumbnails using the v0.1.6 parser/renderer.
- Green start and red end markers.
- Rapid moves in gray dashes.
- Tool assignment using Tools 1–10.
- Operation ordering/removal.
- Hover details.
- Combined project preview with per-tool visibility.
- All/None visibility controls.

The combined preview reuses the same parsing rules as the individual previews. No machine/G-code generation logic is included in this prototype.

## v0.2.3

Restored the exact v0.1.6 parsing behavior as the visualization baseline. The earlier integrated prototype had introduced a second simplified renderer; this version keeps the proven geometry rules and only adds UI orchestration around them.
