// Responsibility: Parse Easel G-code conservatively and remove only file-level termination.
export function parseEaselFile(text) {
  const lines = text.replace(/\r\n?/g,"\n").split("\n");
  let toolDescription = "";
  for (const line of lines) {
    const m = line.match(/(?:Tool|tool).*?[:=]\s*(.+)/);
    if (m) { toolDescription = m[1].trim(); break; }
  }
  return {lines, toolDescription, body:text};
}

export function stripEaselFooter(text) {
  const lines = text.replace(/\r\n?/g,"\n").split("\n");
  const m30 = lines.findIndex(x => /^\s*M30\b/i.test(x));
  const out = m30 >= 0 ? lines.slice(0,m30) : lines;

  // Easel normally ends its operation with a safe Z move followed by
  // G0 X0 Y0, G4, and M5. The X/Y return is not wanted in a combined job.
  // Remove the X0/Y0 line wherever it occurs in this trailing shutdown block.
  let i = out.length - 1;
  while (i >= 0 && !out[i].trim()) i--;

  // Remove trailing shutdown commands while retaining the final Z raise.
  const removable = [];
  while (i >= 0) {
    const t = out[i].trim().toUpperCase();
    if (/^M5\b/.test(t) || /^M9\b/.test(t) || /^G4\b/.test(t) ||
        /^G0+\s*X0(?:\.0*)?\s*Y0(?:\.0*)?$/.test(t)) {
      removable.push(i);
      i--;
      continue;
    }
    break;
  }
  for (const idx of removable) out[idx] = null;

  return out.filter(x => x !== null).join("\n").trimEnd();
}