// Responsibility: Generate RapidChange ATC calls and operator prompts.
// Tool 1-8 use the RapidChange subroutine convention from the Carveco post: M98 P63[T].
// T9 and T10 are reserved for future custom/manual tool-change handling.

export function getRapidChangeCall(tool) {
  const t = Number(tool);
  if (!Number.isInteger(t) || t < 1 || t > 8) {
    throw new Error(`RapidChange tool must be 1-8; received ${tool}.`);
  }
  return `M98 P63${t}`;
}

export function toolChangeBlock(tool, settings, previousTool = null) {
  const lines = [];
  lines.push("(===== RAPIDCHANGE TOOL CHANGE =====)");
  lines.push(`(Acquire Tool ${tool})`);
  lines.push("M5");
  lines.push("M9");
  lines.push("G04 P4000");

  if (settings.dustShoeEnabled) {
    lines.push(`G53 G90 G0 X${Number(settings.parkX).toFixed(3)} Y${Number(settings.parkY).toFixed(3)}`);
    lines.push(`G53 G90 G0 Z${Number(settings.parkZ).toFixed(3)}`);
    lines.push("(Remove dust shoe, then press Cycle Start)");
    lines.push("M0");
  }

  lines.push(getRapidChangeCall(tool));

  if (settings.dustShoeEnabled) {
    lines.push("(Install dust shoe, then press Cycle Start)");
    lines.push("M0");
  }

  lines.push(`S18000 M3`);
  lines.push("G04 P6000");
  lines.push("M8");
  lines.push("(===== END RAPIDCHANGE TOOL CHANGE =====)");
  return lines.join("\n");
}
