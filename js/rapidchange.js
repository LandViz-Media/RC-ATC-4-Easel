// Responsibility: Generate only the calls and measurement positioning needed by the
// already-installed RapidChange/MASSO macros. The ATC macro files remain on MASSO.
export function getRapidChangeCall(tool) {
  const t = Number(tool);
  if (!Number.isInteger(t) || t < 1 || t > 8)
    throw new Error(`RapidChange tool must be 1-8; received ${tool}.`);
  return `M98 P63${t}`;
}

export function getToolMeasureCommand(tool) {
  const t = Number(tool);
  if (!Number.isInteger(t) || t < 1 || t > 8)
    throw new Error(`RapidChange tool must be 1-8; received ${tool}.`);
  return `T${t} M6`;
}

export function toolChangeBlock(tool, s) {
  const lines = [];
  const px=Number(s.parkX).toFixed(3), py=Number(s.parkY).toFixed(3), pz=Number(s.parkZ).toFixed(3);
  const sx=Number(s.setterX).toFixed(3), sy=Number(s.setterY).toFixed(3);

  lines.push("(===== RAPIDCHANGE TOOL CHANGE =====)");
  lines.push(`(Acquire Tool ${tool})`);
  lines.push("M5");
  lines.push("M9");
  lines.push("G04 P4000");

  // Park before removing the dust shoe so sawdust from the shoe does not fall on the carve.
  if (s.dustShoeEnabled) {
    lines.push(`G53 G90 G0 X${px} Y${py}`);
    lines.push(`G53 G90 G0 Z${pz}`);
    lines.push("(Remove dust shoe, then press Cycle Start)");
    lines.push("M0");
  }

  lines.push(getRapidChangeCall(tool));
  lines.push("(--- Measure Tool ---)");
  lines.push("G53 G90 G0 Z-0.010");
  lines.push(`G53 G90 G0 X${sx} Y${sy}`);
  lines.push(getToolMeasureCommand(tool));

  // Return to the same park location for dust-shoe reinstallation.
  if (s.dustShoeEnabled) {
    lines.push(`G53 G90 G0 Z${pz}`);
    lines.push(`G53 G90 G0 X${px} Y${py}`);
    lines.push("(Install dust shoe, then press Cycle Start)");
    lines.push("M0");
  }

  lines.push("S18000 M3");
  lines.push("G04 P6000");
  lines.push("M8");
  lines.push("(===== END RAPIDCHANGE TOOL CHANGE =====)");
  return lines.join("\n");
}