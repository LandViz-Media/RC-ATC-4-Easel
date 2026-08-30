// Responsibility: Call the existing RapidChange/MASSO macros; ATC geometry remains on MASSO.
export function getRapidChangeCall(t){t=Number(t);if(!Number.isInteger(t)||t<1||t>8)throw Error(`Automatic RapidChange tool must be 1-8; received ${t}.`);return `M98 P63${t}`}
export function getToolMeasureCommand(t){return `T${Number(t)} M6`}
export function toolChangeBlock(t,s,info){
 const px=Number(s.parkX).toFixed(3),py=Number(s.parkY).toFixed(3),pz=Number(s.parkZ).toFixed(3),sx=Number(s.setterX).toFixed(3),sy=Number(s.setterY).toFixed(3);
 const a=["(===== RAPIDCHANGE TOOL CHANGE =====)",`(Acquire Tool ${t}: ${info.name})`,"M5","M9","G04 P4000"];
 if(s.dustShoeEnabled)a.push(`G53 G90 G0 Z${pz}`,`G53 G90 G0 X${px} Y${py}`,"(Remove dust shoe, then press Cycle Start)","M0");
 a.push(getRapidChangeCall(t),"(--- Measure Tool ---)","G53 G90 G0 Z-0.010",`G53 G90 G0 X${sx} Y${sy}`,getToolMeasureCommand(t));
 if(s.dustShoeEnabled)a.push(`G53 G90 G0 Z${pz}`,`G53 G90 G0 X${px} Y${py}`,"(Install dust shoe, then press Cycle Start)","M0");
 a.push("(===== END RAPIDCHANGE TOOL CHANGE =====)"); return a.join("\n");
}
export function manualToolBlock(t,s,info){
 const px=Number(s.parkX).toFixed(3),py=Number(s.parkY).toFixed(3),pz=Number(s.parkZ).toFixed(3);
 return ["(===== MANUAL TOOL CHANGE =====)",`(Manual Tool ${t}: ${info.name})`,"M5","M9","G04 P4000",`G53 G90 G0 Z${pz}`,`G53 G90 G0 X${px} Y${py}`,`(Remove dust shoe and manually install ${info.name}, then press Cycle Start)`,"M0","(Install dust shoe, then press Cycle Start)","M0"].join("\n");
}
