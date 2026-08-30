// Responsibility: Assemble ordered Easel operations while preserving Easel spindle speeds, feeds, depths and moves.
import {toolChangeBlock,manualToolBlock} from "./rapidchange.js";
export function buildJob(ops,s,tools){
 if(!ops.length)throw Error("Add at least one .nc file."); if(!s.startingToolConfirmed)throw Error("Confirm MASSO has been synchronized and the selected starting tool is physically in the spindle.");
 const get=n=>tools.find(t=>t.number===Number(n)), start=Number(s.startingTool);
 const out=["(Easel -> MASSO RapidChange ATC Job Composer)","(Version 0.4.0)","G17","G20","G80","G90","G54",`(Starting spindle tool: ${start===0?"Empty":`Tool ${start}`})`]; let prev=start;
 ops.forEach((op,i)=>{const t=Number(op.tool),info=get(t);if(!info)throw Error(`Operation ${i+1} has invalid tool ${op.tool}.`);
  out.push("",`(===== START OPERATION ${i+1}: ${op.fileName} =====)`,`(Assigned MASSO Tool ${t}: ${info.name})`);
  if(prev!==t)out.push(info.automatic?toolChangeBlock(t,s,info):manualToolBlock(t,s,info));else out.push("(Tool already in spindle - no tool change)");
  out.push(op.body,`(===== END OPERATION ${i+1}: ${op.fileName} =====)`);prev=t;
 });
 const z=s.endZOverrideEnabled?Number(s.endZ):Number(s.parkZ);if(!Number.isFinite(z))throw Error("End Z height is invalid.");
 out.push("","(===== JOB END =====)",`G53 G90 G0 Z${z.toFixed(3)}`);
 if(s.endMode==="park")out.push(`G53 G90 G0 X${Number(s.parkX).toFixed(3)} Y${Number(s.parkY).toFixed(3)}`);
 else if(s.endMode==="custom"){if(!Number.isFinite(Number(s.endX))||!Number.isFinite(Number(s.endY)))throw Error("Custom end X/Y must both be specified.");out.push(`G53 G90 G0 X${Number(s.endX).toFixed(3)} Y${Number(s.endY).toFixed(3)}`)}
 out.push("M5","M9","M30");return out.join("\n")+"\n";
}
