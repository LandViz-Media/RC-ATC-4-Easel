// Responsibility: Assemble ordered Easel operations while preserving Easel spindle speeds, feeds, depths and moves.
import {toolChangeBlock,manualToolBlock} from "./rapidchange.js";

// Responsibility: keep the first Easel vertical move over the work area.
// If Easel exported an initial Z move before its initial XY positioning move,
// move that exact XY rapid ahead of the Z move without changing Easel's values.
function moveInitialXYBeforeZ(body){
  const lines=body.replace(/\r\n?/g,"\n").split("\n");
  let zIndex=-1, xyIndex=-1;
  for(let i=0;i<lines.length;i++){
    const t=lines[i].trim().toUpperCase();
    if(zIndex<0 && /\bG0+\b/.test(t) && /(?:^|\s)Z[-+]?\d/.test(t)) zIndex=i;
    if(xyIndex<0 && /\bG0+\b/.test(t) && /(?:^|\s)X[-+]?\d/.test(t) && /(?:^|\s)Y[-+]?\d/.test(t)) xyIndex=i;
  }
  if(zIndex>=0 && xyIndex>zIndex){
    const xy=lines.splice(xyIndex,1)[0];
    lines.splice(zIndex,0,xy);
  }
  return lines.join("\n").trimEnd();
}
export function buildJob(ops,s,tools){
 if(!ops.length)throw Error("Add at least one .nc file."); if(!s.startingToolConfirmed)throw Error("Confirm MASSO has been synchronized and the selected starting tool is physically in the spindle.");
 const get=n=>tools.find(t=>t.number===Number(n)), start=Number(s.startingTool);
 const out=["(Easel -> MASSO RapidChange ATC Job Composer)","(Version 0.5.0)","G17","G20","G80","G90","G54",`(Starting spindle tool: ${start===0?"Empty":`Tool ${start}`})`]; let prev=start;
 ops.forEach((op,i)=>{const t=Number(op.tool),info=get(t);if(!info)throw Error(`Operation ${i+1} has invalid tool ${op.tool}.`);
  out.push("",`(===== START OPERATION ${i+1}: ${op.fileName} =====)`,`(Assigned MASSO Tool ${t}: ${info.name})`);
  if(prev!==t)out.push(info.automatic?toolChangeBlock(t,s,info):manualToolBlock(t,s,info));else out.push("(Tool already in spindle - no tool change)");
  out.push(moveInitialXYBeforeZ(op.body),`(===== END OPERATION ${i+1}: ${op.fileName} =====)`);prev=t;
 });
 const z=s.endZOverrideEnabled?Number(s.endZ):Number(s.parkZ);if(!Number.isFinite(z))throw Error("End Z height is invalid.");
 out.push("","(===== JOB END =====)",`G53 G90 G0 Z${z.toFixed(3)}`);
 if(s.endMode==="park")out.push(`G53 G90 G0 X${Number(s.parkX).toFixed(3)} Y${Number(s.parkY).toFixed(3)}`);
 else if(s.endMode==="custom"){if(!Number.isFinite(Number(s.endX))||!Number.isFinite(Number(s.endY)))throw Error("Custom end X/Y must both be specified.");out.push(`G53 G90 G0 X${Number(s.endX).toFixed(3)} Y${Number(s.endY).toFixed(3)}`)}
 out.push("M5","M9","M30");return out.join("\n")+"\n";
}
