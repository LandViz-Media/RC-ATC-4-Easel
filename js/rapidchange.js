// Responsibility: Generate the known-good RapidChange sequence for MASSO.
// Verified pattern: M98 P63[T], then machine-Z clearance, setter XY, and T[T] M6 measurement.
export function getRapidChangeCall(tool){const t=Number(tool);if(!Number.isInteger(t)||t<1||t>8)throw new Error(`RapidChange tool must be 1-8; received ${tool}.`);return `M98 P63${t}`}
export function getToolMeasureCommand(tool){const t=Number(tool);if(!Number.isInteger(t)||t<1||t>8)throw new Error(`RapidChange tool must be 1-8; received ${tool}.`);return `T${t} M6`}

export function toolChangeBlock(tool,s){const lines=[],px=Number(s.parkX).toFixed(3),py=Number(s.parkY).toFixed(3),pz=Number(s.parkZ).toFixed(3);
const sx=Number(s.setterX).toFixed(3),sy=Number(s.setterY).toFixed(3);
lines.push("(===== RAPIDCHANGE TOOL CHANGE =====)",`(Acquire Tool ${tool})`,"M5","M9","G04 P4000");
if(s.dustShoeEnabled){lines.push(`G53 G90 G0 X${px} Y${py}`,`G53 G90 G0 Z${pz}`,"(Remove dust shoe, then press Cycle Start)","M0")}
lines.push(getRapidChangeCall(tool),"(--- Measure Tool ---)","G53 G90 G0 Z-0.010",`G53 G90 G0 X${sx} Y${sy}`,getToolMeasureCommand(tool));
if(s.dustShoeEnabled){lines.push(`G53 G90 G0 Z${pz}`,`G53 G90 G0 X${px} Y${py}`,"(Install dust shoe, then press Cycle Start)","M0")}
lines.push("S18000 M3","G04 P6000","M8","(===== END RAPIDCHANGE TOOL CHANGE =====)");return lines.join("\n")}