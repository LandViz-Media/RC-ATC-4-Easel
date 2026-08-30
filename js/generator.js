// Responsibility: Assemble the ordered Easel operations into one MASSO/RapidChange job.
// The first operation is compared with the confirmed starting spindle tool so an unnecessary
// tool change is not generated.
import {toolChangeBlock} from "./rapidchange.js";

export function buildJob(ops,s) {
  if (!ops.length) throw new Error("Add at least one .nc file.");
  const lines = [
    "(Easel -> MASSO RapidChange ATC Job Composer)",
    "(Version 0.3.0)",
    "G17","G20","G80","G90","G54",
    `(Starting spindle tool: ${Number(s.startingTool) === 0 ? "Empty" : "Tool " + Number(s.startingTool)})`
  ];

  let previous = Number(s.startingTool);

  ops.forEach((op,i) => {
    const tool = Number(op.tool);
    if (!Number.isInteger(tool) || tool < 1 || tool > 8)
      throw new Error(`Operation ${i+1} has invalid RapidChange tool ${op.tool}.`);

    lines.push("",`(===== START OPERATION ${i+1}: ${op.fileName} =====)`,
      `(Tool ${tool}${op.description ? ": " + op.description : ""})`);

    if (previous !== tool) {
      lines.push(toolChangeBlock(tool,s));
    } else {
      lines.push("(Starting/previous spindle tool matches operation - no tool change)");
    }

    lines.push(op.body,`(===== END OPERATION ${i+1}: ${op.fileName} =====)`);
    previous = tool;
  });

  lines.push("","(===== JOB END =====)",
    `G00 Z${Number(s.parkZ).toFixed(3)}`,"M5","M9","M30");
  return lines.join("\n")+"\n";
}