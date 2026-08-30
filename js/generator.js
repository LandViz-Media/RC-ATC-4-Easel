// Responsibility: Assemble ordered Easel operations while preserving the Easel
// toolpath body exactly. The composer adds machine-level transitions around it.
import {toolChangeBlock,manualToolBlock} from "./rapidchange.js";
import {findFirstXYRapid} from "./parser.js";

export function buildJob(ops,s,tools){
  if(!ops.length) throw Error("Add at least one .nc file.");
  if(!s.startingToolConfirmed)
    throw Error("Confirm that MASSO has been synchronized and the selected starting tool is physically in the spindle.");

  const get=n=>tools.find(t=>t.number===Number(n));
  const start=Number(s.startingTool);
  const pz=Number(s.parkZ);

  if(!Number.isFinite(pz))
    throw Error("ATC Park Z must be a valid machine-coordinate value.");

  const out=[
    "(Easel -> MASSO RapidChange ATC Job Composer)",
    "(Version 0.5.2)",
    "G17",
    "G20",
    "G80",
    "G90",
    "G54",
    `(Starting spindle tool: ${start===0?"Empty":`Tool ${start}`})`
  ];

  let previous=start;

  ops.forEach((op,i)=>{
    const tool=Number(op.tool);
    const info=get(tool);
    if(!info) throw Error(`Operation ${i+1} has invalid tool ${op.tool}.`);

    out.push(
      "",
      `(===== START OPERATION ${i+1}: ${op.fileName} =====)`,
      `(Assigned MASSO Tool ${tool}: ${info.name})`
    );

    if(previous!==tool){
      out.push(
        info.automatic
          ? toolChangeBlock(tool,s,info)
          : manualToolBlock(tool,s,info)
      );
    }else{
      out.push("(Tool already in spindle - no tool change)");
    }

    // Important: Easel's spindle startup and entire path remain untouched.
    // We only pre-position X/Y at machine-safe Z before handing control to Easel.
    const startXY=findFirstXYRapid(op.body);
    if(startXY){
      out.push(
        "(--- Safe pre-position for next Easel path ---)",
        `G53 G90 G0 Z${pz.toFixed(3)}`,
        `G0 X${startXY.x.toFixed(5)} Y${startXY.y.toFixed(5)}`
      );
    }else{
      out.push("(WARNING: Could not identify first XY rapid in Easel file; no pre-position added.)");
    }

    out.push(
      "(--- BEGIN UNCHANGED EASEL TOOLPATH ---)",
      op.body,
      "(--- END UNCHANGED EASEL TOOLPATH ---)",
      `(===== END OPERATION ${i+1}: ${op.fileName} =====)`
    );

    previous=tool;
  });

  const z=s.endZOverrideEnabled?Number(s.endZ):Number(s.parkZ);
  if(!Number.isFinite(z)) throw Error("End Z height is invalid.");

  out.push(
    "",
    "(===== JOB END =====)",
    `G53 G90 G0 Z${z.toFixed(3)}`
  );

  if(s.endMode==="park"){
    out.push(`G53 G90 G0 X${Number(s.parkX).toFixed(3)} Y${Number(s.parkY).toFixed(3)}`);
  }else if(s.endMode==="custom"){
    if(!Number.isFinite(Number(s.endX))||!Number.isFinite(Number(s.endY)))
      throw Error("Custom end X/Y must both be specified.");
    out.push(`G53 G90 G0 X${Number(s.endX).toFixed(3)} Y${Number(s.endY).toFixed(3)}`);
  }

  out.push("M5","M9","M30");
  return out.join("\n")+"\n";
}
