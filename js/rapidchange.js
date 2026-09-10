// Responsibility: Call the existing RapidChange/MASSO macros and handle only
// composer-level park/dust-shoe transitions. RapidChange owns pocket geometry,
// manual load/unload, tool measurement, and tool-number state.

export function getRapidChangeCall(t){
  t=Number(t);
  if(!Number.isInteger(t)||t<1||t>8)
    throw Error(`Automatic RapidChange tool must be 1-8; received ${t}.`);
  return `M98 P63${t}`;
}

export function getManualRapidChangeCall(t){
  t=Number(t);
  if(!Number.isInteger(t)||t<9||t>10)
    throw Error(`Manual RapidChange tool must be 9-10; received ${t}.`);
  // RapidChange generates one numbered subroutine for each tool. The Masso G3
  // integration documents the P63<tool> convention, including manual tools.
  return `M98 P63${t}`;
}

function cleanPathName(name){
  return String(name||"").replace(/\.nc$/i,"").replace(/[()]/g,"").trim() || "path";
}

// MASSO MSG is limited to one displayed line of 34 characters. Keep the
// operator instruction and a short path identifier together rather than
// emitting two MSG commands that would overwrite one another.
function installShoeMessage(pathName){
  const prefix="MSG Shoe on; Start; ";
  const max=34-prefix.length;
  const path=cleanPathName(pathName);
  const shown=path.slice(0,max);
  return prefix+shown;
}

function transitionStart(t,info,s){
  const px=Number(s.parkX).toFixed(3);
  const py=Number(s.parkY).toFixed(3);
  const pz=Number(s.parkZ).toFixed(3);
  const a=[
    "(===== RAPIDCHANGE TOOL CHANGE =====)",
    `(Acquire Tool ${t}: ${info.name})`,
    "M5",
    "M9",
    `G53 G90 G0 Z${pz}`,
    `G53 G90 G0 X${px} Y${py}`
  ];
  if(s.dustShoeEnabled){
    a.push(
      "MSG Remove shoe; Cycle Start",
      "M0"
    );
  }
  return a;
}

function transitionEnd(s,pathName){
  const px=Number(s.parkX).toFixed(3);
  const py=Number(s.parkY).toFixed(3);
  const pz=Number(s.parkZ).toFixed(3);
  const a=[
    "(--- Return to machine park after RapidChange macro ---)",
    `G53 G90 G0 Z${pz}`,
    `G53 G90 G0 X${px} Y${py}`
  ];
  if(s.dustShoeEnabled){
    a.push(
      installShoeMessage(pathName),
      "M0"
    );
  }
  return a;
}

export function toolChangeBlock(t,s,info,pathName){
  const a=transitionStart(t,info,s);
  a.push(
    // RapidChange owns unloading/loading, setter positioning, Auto Tool Zero,
    // and T# M6. Do not duplicate any of that logic here.
    getRapidChangeCall(t),
    ...transitionEnd(s,pathName),
    "(===== END RAPIDCHANGE TOOL CHANGE =====)"
  );
  return a.join("\n");
}

function manualAdvanceMessage(currentTool,nextTool,nextManual){
  if(!nextTool||!nextManual) return null;

  // Advance guidance only. RapidChange still owns the actual manual unload/load
  // pause, manual position, setter, measurement, and T# M6 sequence.
  // Keep the operator message within MASSO's documented 34-character limit.
  const note=String(nextManual.note||"").replace(/\s*°\s*/g,"°");
  const detail=note ? ` ${note}` : "";
  const full=`MSG After T${currentTool}: Load T${nextTool}${detail}; Start`;
  if(full.length<=34) return full;
  return `MSG After T${currentTool}: Load T${nextTool}; Start`;
}

export function manualToolBlock(t,s,info,pathName,manual=null,nextInfo=null,nextManual=null){
  const a=transitionStart(t,info,s);
  a[0]="(===== RAPIDCHANGE MANUAL TOOL CHANGE =====)";
  a[1]=`(Acquire Manual Tool ${t}: ${manual?.toolId||"unknown"}${manual?`: ${manual.type}${manual.note?` - ${manual.note}`:""}`:""})`;

  const advance=manualAdvanceMessage(t,nextInfo?.number,nextManual);
  if(advance){
    a.push(advance,"M0");
  }

  a.push(
    // RapidChange owns the manual-tool prompt, manual position, pocket-state
    // handling, setter position, measurement, and T# M6 sequence.
    getManualRapidChangeCall(t),
    ...transitionEnd(s,pathName),
    "(===== END RAPIDCHANGE MANUAL TOOL CHANGE =====)"
  );
  return a.join("\n");
}
