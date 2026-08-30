// Responsibility: Parse the limited portions of Easel G-code needed by the composer.
// We deliberately do not interpret the cutting toolpath itself in this first version.

export function parseEaselFile(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  let toolDescription = "";

  for (const line of lines) {
    const match = line.match(/(?:Tool|tool).*?[:=]\s*(.+)/);
    if (match) {
      toolDescription = match[1].trim();
      break;
    }
  }

  return {
    lines,
    toolDescription,
    body: text
  };
}

// Initial footer strategy: remove program-ending commands and everything after M30.
// We will refine this after examining the three uploaded Easel files.
export function stripEaselFooter(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const kept = [];

  for (const line of lines) {
    const trimmed = line.trim().toUpperCase();
    if (trimmed === "M30" || trimmed.startsWith("M30 ")) break;
    kept.push(line);
  }

  // Remove the common final X/Y return-to-zero if it is the last motion before shutdown.
  while (kept.length && !kept[kept.length - 1].trim()) kept.pop();

  if (kept.length >= 2) {
    const last = kept[kept.length - 1].trim().toUpperCase();
    const previous = kept[kept.length - 2].trim().toUpperCase();
    if (/^G0+\s*X0(?:\.0*)?\s*Y0(?:\.0*)?$/.test(last) &&
        (/^G0+\s*Z/.test(previous) || /^G0+\s*X/.test(previous))) {
      kept.pop();
    }
  }

  return kept.join("\n").trimEnd();
}
