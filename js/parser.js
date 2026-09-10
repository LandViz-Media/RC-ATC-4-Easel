// Responsibility: Parse Easel G-code conservatively and remove only file-level termination.
// Easel's actual path and motion commands remain unchanged except for the
// single initial positive-Z positioning move optimized by optimizeInitialSafeZ().
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
// Convert only the initial positive-Z, Z-only positioning move from a slow G1
// to a rapid G0. Easel commonly emits G1 Z0.20000 F9.0 immediately before
// the first XY rapid. Cutting/plunge Z moves are intentionally left untouched.
export function optimizeInitialSafeZ(text){
  const lines=text.replace(/\r\n?/g,"\n").split("\n");
  let seenXYRapid=false;
  let seenCuttingMove=false;

  for(let i=0;i<lines.length;i++){
    const t=lines[i].trim();
    if(!t) continue;

    if(/^G0+\b/i.test(t) && /(?:^|\s)X[-+]?\d*\.?\d+/i.test(t) && /(?:^|\s)Y[-+]?\d*\.?\d+/i.test(t)){
      seenXYRapid=true;
      continue;
    }

    if(/^G0*1\b/i.test(t) && (/(?:^|\s)X[-+]?\d*\.?\d+/i.test(t) || /(?:^|\s)Y[-+]?\d*\.?\d+/i.test(t))){
      seenCuttingMove=true;
      continue;
    }

    const zOnly=t.match(/^G0*1\s+Z([-+]?\d*\.?\d+)(?:\s+F[-+]?\d*\.?\d+)?\s*$/i);
    if(zOnly){
      const z=Number(zOnly[1]);
      if(Number.isFinite(z) && z>0 && !seenCuttingMove){
        // This is the first positive Z-only positioning move. In the normal
        // Easel sequence it is the safe-height move before cutting begins.
        lines[i]=t.replace(/^G0*1/i,"G0");
        return lines.join("\n");
      }
    }
  }

  return text;
}

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
