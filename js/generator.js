// Responsibility: Assemble ordered Easel operations while preserving the Easel
// toolpath body exactly. The composer adds machine-level transitions around it.
import {toolChangeBlock,manualToolBlock} from "./rapidchange.js";
import {findFirstXYRapid,optimizeInitialSafeZ} from "./parser.js";

function localTimestamp(){
  const d=new Date();
  const p=n=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function commentLines(text){
  return String(text||"").split(/\r?\n/).map(x=>`(${x.replace(/[()]/g,"")})`).join("\n");
}

export function buildJob(ops,s,tools,manualTools,meta={}){
  if(!ops.length) throw Error("Add at least one .nc file.");

  const get=n=>tools.find(t=>t.number===Number(n));
  const getManual=id=>manualTools.find(t=>t.toolId===id);
  const pz=Number(s.parkZ);
  if(!Number.isFinite(pz)) throw Error("ATC Park Z must be a valid machine-coordinate value.");

  const out=[
    "(Easel -> MASSO RapidChange ATC Job Composer)",
    "(Version 0.5.14)",
    `(Generated: ${localTimestamp()} local computer time)`,
    `(Output file: ${(meta.fileName||"combined-masso-rapidchange").replace(/[()]/g,"")}.nc)`
  ];
  if(meta.description) out.push("(Description:)",commentLines(meta.description));
  out.push(
    "G17",
    "G20",
    "G80",
    "G90",
    "G54",
    "MSG Confirm X/Y/Z origin; Cycle Start",
    "M0",
    "(Before running: run the appropriate RapidChange Sync Pocket macro so MASSO knows the physical spindle tool.)"
  );

  // The GUI does not store the current spindle tool. Sync Pocket establishes the
  // real starting tool in MASSO immediately before the job. The first assigned
  // operation therefore gets its normal RapidChange/manual acquisition block.
  let previous=null;

  ops.forEach((op,i)=>{
    const tool=Number(op.tool);
    const info=get(tool);
    if(!info) throw Error(`Operation ${i+1} has invalid tool ${op.tool}.`);
    const manual=getManual(op.manualToolId||"BIT-001");
    if(!info.automatic&&!manual) throw Error(`Operation ${i+1} has invalid manual tool ${op.manualToolId||"(none)"}.`);
    if(!info.automatic){
      const shortName=String(manual.shortName||"").trim();
      if(!shortName) throw Error(`Manual tool ${manual.toolId} is missing shortName.`);
      if(shortName.length>14) throw Error(`Manual tool ${manual.toolId} shortName must be 14 characters or fewer.`);
      if(!String(manual.name||"").trim()) throw Error(`Manual tool ${manual.toolId} is missing name.`);
    }

    const nextOp=ops[i+1];
    const nextTool=nextOp?Number(nextOp.tool):null;
    const nextInfo=Number.isInteger(nextTool)?get(nextTool):null;
    const nextManual=(nextInfo&&!nextInfo.automatic)?getManual(nextOp.manualToolId||"BIT-001"):null;

    out.push(
      "",
      `(===== START OPERATION ${i+1}: ${op.fileName} =====)`,
      `(Assigned MASSO Tool ${tool}: ${info.name})`,
      ...(info.automatic?[]:[`(Manual cutter ${manual.toolId}: ${manual.shaftDiameter} in shaft, ${manual.cuttingSize===null?"N/A":manual.cuttingSize+" in cutting size"}, ${manual.type}${manual.note?`, ${manual.note}`:""})`])
    );

    if(previous!==tool){
      // The shoe-off message belongs to the tool-change transition itself.
      // It identifies the tool that is about to be acquired, not the tool
      // after the current operation. Suppress the guidance on operation 1
      // because there is no prior tool being removed.
      out.push(info.automatic?toolChangeBlock(tool,s,info,op.fileName,i===0,manual):manualToolBlock(tool,s,info,op.fileName,manual,i===0));
    }else{
      out.push("(Tool already in spindle - no tool change)");
    }

    // Responsibility: move to the next Easel path's first XY location while Z is
    // at machine-safe height, without rearranging or editing Easel's own commands.
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
      optimizeInitialSafeZ(op.body),
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
    `G53 G90 G0 Z${z.toFixed(3)}`,
    "M5",
    "M9"
  );

  if(s.endMode==="park"){
    out.push(`G53 G90 G0 X${Number(s.parkX).toFixed(3)} Y${Number(s.parkY).toFixed(3)}`);
  }else if(s.endMode==="custom"){
    if(!Number.isFinite(Number(s.endX))||!Number.isFinite(Number(s.endY))) throw Error("Custom end X/Y must both be specified.");
    out.push(`G53 G90 G0 X${Number(s.endX).toFixed(3)} Y${Number(s.endY).toFixed(3)}`);
  }

  const projectTitle=(meta.fileName||"combined-masso-rapidchange")
    .replace(/[()]/g,"")
    .trim() || "combined-masso-rapidchange";

  // Responsibility: Report successful completion after all final machine motion
  // and spindle shutdown have occurred, immediately before program end.
  out.push(`MSG Project ${projectTitle} has completed.`, "M30");
  return out.join("\n")+"\n";
}
