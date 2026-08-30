// Responsibility: Parse Easel G-code conservatively. Cutting moves are not reinterpreted.
export function parseEaselFile(text){const lines=text.replace(/\r\n?/g,"\n").split("\n");let toolDescription="";
for(const line of lines){const m=line.match(/(?:Tool|tool).*?[:=]\s*(.+)/);if(m){toolDescription=m[1].trim();break}}
return{lines,toolDescription,body:text}}

export function stripEaselFooter(text){const lines=text.replace(/\r\n?/g,"\n").split("\n");
const i=lines.findIndex(x=>/^\s*M30\b/i.test(x));const out=i>=0?lines.slice(0,i):lines;
while(out.length&&!out.at(-1).trim())out.pop();
if(out.length&&/^G0+\s*X0(?:\.0*)?\s*Y0(?:\.0*)?\s*$/i.test(out.at(-1).trim()))out.pop();
while(out.length&&!out.at(-1).trim())out.pop();return out.join("\n")}