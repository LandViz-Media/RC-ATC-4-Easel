// Responsibility: Call the existing RapidChange/MASSO macros.
// ATC geometry, pocket positions, unloading/loading, and measurement remain on MASSO.

export function getRapidChangeCall(t){
  t=Number(t);
  if(!Number.isInteger(t)||t<1||t>8)
    throw Error(`Automatic RapidChange tool must be 1-8; received ${t}.`);
  return `M98 P63${t}`;
}

export function getToolMeasureCommand(t){
  return `T${Number(t)} M6`;
}

export function toolChangeBlock(t,s,info){
  const px=Number(s.parkX).toFixed(3);
  const py=Number(s.parkY).toFixed(3);
  const pz=Number(s.parkZ).toFixed(3);
  const sx=Number(s.setterX).toFixed(3);
  const sy=Number(s.setterY).toFixed(3);

  const a=[
    "(===== RAPIDCHANGE TOOL CHANGE =====)",
    `(Acquire Tool ${t}: ${info.name})`,
    "M5",
    "M9",
    "G04 P4000",
    `G53 G90 G0 Z${pz}`,
    `G53 G90 G0 X${px} Y${py}`
  ];

  if(s.dustShoeEnabled){
    a.push(
      `MSG Remove dust shoe, then press Cycle Start`,
      "M0"
    );
  }

  a.push(
    getRapidChangeCall(t),
    "(--- Measure Tool ---)",
    `G53 G90 G0 Z${pz}`,
    `G53 G90 G0 X${sx} Y${sy}`,
    getToolMeasureCommand(t),
    `G53 G90 G0 Z${pz}`,
    `G53 G90 G0 X${px} Y${py}`
  );

  if(s.dustShoeEnabled){
    a.push(
      `MSG Install dust shoe, then press Cycle Start`,
      "M0"
    );
  }

  a.push("(===== END RAPIDCHANGE TOOL CHANGE =====)");
  return a.join("\n");
}

export function manualToolBlock(t,s,info){
  const px=Number(s.parkX).toFixed(3);
  const py=Number(s.parkY).toFixed(3);
  const pz=Number(s.parkZ).toFixed(3);

  return [
    "(===== MANUAL TOOL CHANGE =====)",
    `(Manual Tool ${t}: ${info.name})`,
    "M5",
    "M9",
    "G04 P4000",
    `G53 G90 G0 Z${pz}`,
    `G53 G90 G0 X${px} Y${py}`,
    `MSG Remove dust shoe and install ${info.name}, then press Cycle Start`,
    "M0",
    `MSG Install dust shoe, then press Cycle Start`,
    "M0",
    "(===== END MANUAL TOOL CHANGE =====)"
  ].join("\n");
}
