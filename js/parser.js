// Responsibility: Parse Easel G-code conservatively and remove only file-level termination.
// Easel's actual path and motion commands remain untouched, including its final G0 Z0.20000.
export function parseEaselFile(text){
  return {lines:text.replace(/\r\n?/g,"\n").split("\n"),toolDescription:"",body:text};
}

export function stripEaselFooter(text){
  const lines=text.replace(/\r\n?/g,"\n").split("\n");
  const m30=lines.findIndex(x=>/^\s*M30\b/i.test(x));
  const out=(m30>=0?lines.slice(0,m30):lines).slice();

  // Remove only shutdown/return commands at the file level.
  // Do NOT remove or move the Easel G0 Z0.20000 retract.
  let i=out.length-1;
  while(i>=0 && !out[i].trim()) i--;

  const remove=[];
  while(i>=0){
    const t=out[i].trim().toUpperCase();
    if(
      /^M5\b/.test(t) ||
      /^M9\b/.test(t) ||
      /^G4\b/.test(t) ||
      /^G0+\s*X0(?:\.0*)?\s*Y0(?:\.0*)?$/.test(t)
    ){
      remove.push(i);
      i--;
    } else {
      break;
    }
  }
  for(const n of remove) out[n]=null;
  return out.filter(x=>x!==null).join("\n").trimEnd();
}

// Find the first XY rapid positioning command in an Easel operation.
// This is used only to add a safe pre-position before the untouched Easel body.
export function findFirstXYRapid(text){
  const lines=text.replace(/\r\n?/g,"\n").split("\n");
  for(const line of lines){
    const t=line.trim();
    if(!/^G0+\b/i.test(t)) continue;
    const xm=t.match(/(?:^|\s)X([-+]?\d*\.?\d+)/i);
    const ym=t.match(/(?:^|\s)Y([-+]?\d*\.?\d+)/i);
    if(xm && ym) return {x:Number(xm[1]),y:Number(ym[1]),line:t};
  }
  return null;
}
