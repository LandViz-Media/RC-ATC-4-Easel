// Responsibility: Parse Easel G-code conservatively and remove only file-level termination.
export function parseEaselFile(text){return {lines:text.replace(/\r\n?/g,"\n").split("\n"),toolDescription:"",body:text}}
export function stripEaselFooter(text){
  const lines=text.replace(/\r\n?/g,"\n").split("\n"), m30=lines.findIndex(x=>/^\s*M30\b/i.test(x));
  const out=(m30>=0?lines.slice(0,m30):lines).slice(); let i=out.length-1, remove=[];
  while(i>=0&&!out[i].trim())i--;
  while(i>=0){const t=out[i].trim().toUpperCase(); if(/^M5\b/.test(t)||/^M9\b/.test(t)||/^G4\b/.test(t)||/^G0+\s*X0(?:\.0*)?\s*Y0(?:\.0*)?$/.test(t)){remove.push(i);i--}else break}
  for(const n of remove)out[n]=null; return out.filter(x=>x!==null).join("\n").trimEnd();
}
