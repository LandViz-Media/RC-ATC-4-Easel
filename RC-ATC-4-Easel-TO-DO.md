# RC-ATC-4-Easel — To-Do / Test List

## Project Status

**Current machine-tested baseline:** v0.5.6  
**Current preview prototype:** v0.2.6

The core Easel → MASSO → RapidChange ATC workflow has been successfully air-tested with v0.5.6.

The preview prototype is separate from the machine-control code while the visualization UI is being developed.

---

## Priority Bugs / Issues to Investigate

### 1. MASSO / RapidChange behavior when no tool is loaded

**Observed:**  
When MASSO was synchronized to indicate that no tool was in the spindle, the job successfully acquired the next tool, but the RapidChange sequence appeared to skip the tool-setter measurement. MASSO also retained the newly loaded tool as the active tool.

**Current status:**  
Not considered a composer failure at this point. There is a workaround, and this may be a MASSO/RapidChange behavior.

**To investigate:**
- Repeat with no tool loaded.
- Record exactly which RapidChange macro is called.
- Observe whether the measurement macro is entered.
- Record the MASSO active-tool state before and after.
- Determine whether this behavior changes depending on the starting tool/state.

---

### 2. RapidChange ATC alignment

Double-check physical alignment of the RapidChange ATC.

**Particular concern:**  
Tools/collets in slots **6–8** have occasionally had loading/unloading problems.

**To verify:**
- ATC is square/aligned to the machine.
- Individual pockets are correctly positioned.
- Tool holders/collets enter and leave pockets without side loading.
- Slots 6–8 behave the same as slots 1–5.

---

### 3. Tool loaded that is not represented in an ATC slot

Test the condition where a tool is physically installed in the spindle but is not associated with a valid RapidChange pocket.

**Questions:**
- What does MASSO believe is active?
- What does the RapidChange macro do?
- Does it attempt an unload?
- Does it produce a useful error/message?
- Can the composer safely recover?

---

### 4. Endmill / collet retention while stored in ATC

Contact **PwnCNC**.

**Question:**  
What is the recommended way to prevent an endmill from slipping out of a loose collet while the tool is stored in the RapidChange ATC?

This is especially important for tools that may remain stored in the ATC between jobs.

---

### 5. Verify Z-axis speeds before production cutting

We intentionally kept the current motion logic conservative and avoided changing Easel's cutting/plunge feed settings.

Before actual production cutting, verify:

- MASSO rapid Z speed.
- Any controlled Z movement used by the RapidChange sequence.
- Easel plunge/feed values for representative tools.
- Whether any Z movement is unexpectedly slow or fast.

This is currently a **minor verification item**, not a known failure.

---

## Workflow / UI Improvements

### 6. Startup delay investigation

There is a slight additional delay after the operator presses Start following the initial job-confirmation message.

**Current status:**  
Not a problem; simply an observation.

**Investigate later:**
- MASSO `MSG` / `M0` behavior.
- Controller processing/state transition.
- RapidChange initialization.
- Whether the generated G-code contains anything unnecessary at startup.

---

### 7. Project completion message

Add a final MASSO message:

```text
Project <project title> has completed.
```

The project title should come from the composer/project information.

This should occur after:
1. Z retracts.
2. Spindle stops.
3. Final machine-coordinate movement completes.

---

### 8. Starting job confirmation

The composer should display an operator reminder before job motion begins:

> Confirm X, Y, and Z workpiece origin is set.

This is intended as a reminder only.

The operator must still run the appropriate RapidChange **Sync Pocket** macro on MASSO before running the generated job so that MASSO knows which tool is physically in the spindle.

The GUI should not permanently store the physical starting spindle tool.

---

### 9. End-of-job machine movement

Current desired behavior:

```text
Raise Z
Stop spindle
Move to final X/Y position
End program
```

The spindle should never be running during the final machine-coordinate rapid movement.

---

## Confirmed / Keep As-Is

### 10. Full Z retract between operations

**KEEP THIS BEHAVIOR.**

Even when the same tool is used for consecutive operations, the composer should fully retract to the configured machine-coordinate safe Z before moving to the next operation.

Example:

```text
Tool 5 path 1
    ↓
Retract to machine Z0
    ↓
Move to next operation XY
    ↓
Tool 5 path 2
```

This protects against:
- hold-downs
- clamps
- raised portions of the work
- bowls/concave work
- other obstacles between operations

---

### 11. Easel's own Z retract

**Do not modify Easel's normal retract commands.**

For example:

```gcode
G0 Z0.20000
```

belongs to Easel and should remain exactly where Easel places it.

This allows Easel to retract slightly above the completed path before spindle shutdown or transition.

---

### 12. Easel spindle speed and feeds

**Do not replace Easel's spindle speeds or feeds with global values.**

Easel's configured:
- RPM
- feed rate
- plunge rate
- cutting depth

should be preserved.

The composer should add only the machine/tool-transition logic required for RapidChange.

---

## Preview / Visualization Development

### 13. Preview operation thumbnails

The working standalone renderer is the basis for the integrated preview.

Current useful information:
- File name
- XY extent / workpiece size
- Tool assignment
- Green start point
- Red end point
- Gray dashed rapid moves

The workpiece-size information is useful and should remain for now.

---

### 14. Preview checkbox controls

**Current issue:**  
In integrated preview v0.2.6, the checkbox controls are present but are not currently functioning correctly.

Controls include:
- Show rapid moves
- Show start point
- Show end point
- Show axes
- Combined tool visibility

**Next action:**  
Fix these controls without changing the proven visualization geometry.

---

### 15. Detailed preview toggle

Desired behavior:

- Keep compact thumbnail visible in the operation list.
- Hide the large detailed preview by default.
- Provide a toggle to show the large preview.
- Large preview should expose the visualization controls.

Potential controls:
- Show rapid moves
- Show start point
- Show end point
- Show axes

---

### 16. Combined project preview

Desired behavior:

- Hidden by default.
- Optional toggle to display it.
- Show all assigned paths together.
- Allow visibility to be turned on/off by Tool 1–10.
- Show only tools actually used in the project.
- Provide **All** and **None** controls.

The combined preview should use the **same parser and renderer** as the individual preview.

---

### 17. Preview hover / detail information

Hovering over an operation thumbnail may eventually show:

- Filename
- Assigned tool
- Tool name
- XY dimensions
- Cutting move count
- Rapid move count
- Minimum / maximum Z
- Brief project/path description

A future "larger preview" action may also be included.

---

### 18. Future G-code simulator

Later, investigate linking the composer to an external NC/G-code simulation utility.

Possible workflow:

```text
Compose job
    ↓
Generate NC
    ↓
Preview thumbnail
    ↓
Optional full simulation
```

The thumbnail renderer/parser may eventually provide the groundwork for an internal simulator, but a full material-removal simulator does not need to be built immediately.

---

## Tool Configuration

### 19. Tool inventory

Current tool definitions are stored in:

```text
config/tools.json
```

Current inventory:

| Tool | Description |
|---|---|
| T1 | 1/4 Up Cut |
| T2 | 1/4 Down Cut |
| T3 | 1/4 Compression |
| T4 | 1/4 Ballnose |
| T5 | 1/4 30 V-bit |
| T6 | 1/8 Compression (short) |
| T7 | 1/16 Up Cut (short) |
| T8 | 1/2 Ballnose |
| T9 | Manual tool 1 |
| T10 | Manual tool 2 |

The application should continue reading this information from JSON rather than hard-coding it in the UI.

---

## Development Rules

### 20. Preserve the known-good machine baseline

**v0.5.6 is currently the known-good composer baseline.**

When adding preview/UI features:
- Do not casually modify the G-code generation logic.
- Do not modify RapidChange macro calls unless specifically required.
- Do not change tested park/tool-setter coordinate behavior without a test.
- Keep preview code separate from machine-critical code whenever practical.

### 21. Version every release

Every update should have an explicit version number.

The version should appear:
- On the application page.
- In the generated documentation.
- In the changelog.

### 22. Maintain a change log

Use:

```text
CHANGELOG.md
```

for release-specific changes.

Use this document for:
- outstanding bugs
- tests
- investigations
- future enhancements
- confirmed behaviors to preserve

---

## Testing Philosophy

For machine-related changes:

1. Inspect generated G-code.
2. Air-test.
3. Repeat with multiple starting-tool states.
4. Test tool changes in both directions.
5. Test repeated operations using the same tool.
6. Test manual-tool scenarios separately.
7. Only then move toward production cutting.

Always keep a known-good `.nc` test file for comparison when changing the composer.
