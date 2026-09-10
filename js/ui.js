// Responsibility: Render the ordered operation list, MASSO tool assignments, and manual-tool selections.
function formatFraction(value){
  if(value===null||value===undefined) return "";
  const n=Number(value);
  const fractions=[[0.0625,"1/16"],[0.125,"1/8"],[0.1875,"3/16"],[0.25,"1/4"],[0.3125,"5/16"],[0.375,"3/8"],[0.5,"1/2"],[0.625,"5/8"],[0.75,"3/4"],[1,"1"]];
  const match=fractions.find(([d])=>Math.abs(n-d)<1e-9);
  return match?match[1]:String(n);
}

export function manualToolName(t){
  if(!t) return "";
  const shaft=formatFraction(t.shaftDiameter);
  const size=t.cuttingSize===null?"":formatFraction(t.cuttingSize);
  const core=t.type==="V-Bit"?`${shaft} V-Bit`:size?`${shaft} ${size} ${t.type}`:`${shaft} ${t.type}`;
  return t.note?`${core} — ${t.note}`:core;
}

export function renderOperations(c,ops,tools,manualTools,h){
  c.innerHTML="";
  if(!ops.length){c.innerHTML='<p class="empty">No files added yet.</p>';return}
  ops.forEach((op,i)=>{
    const r=document.createElement("div");
    r.className="operation";
    const n=document.createElement("strong");
    n.textContent=`${i+1}. ${op.fileName}`;
    const controls=document.createElement("div");
    controls.className="tool-controls";
    const s=document.createElement("select");
    tools.forEach(t=>{const o=document.createElement("option");o.value=t.number;o.textContent=`Tool ${t.number}: ${t.name}`;o.selected=Number(op.tool)===t.number;s.appendChild(o)});
    s.onchange=()=>{
      const tool=Number(s.value);
      h.onChange(i,{tool,manualToolId:op.manualToolId||"BIT-001"});
    };
    controls.appendChild(s);
    const currentTool=tools.find(t=>t.number===Number(op.tool));
    if(currentTool&&!currentTool.automatic){
      const m=document.createElement("select");
      m.className="manual-tool-select";
      manualTools.forEach(t=>{const o=document.createElement("option");o.value=t.toolId;o.textContent=`${t.toolId}: ${manualToolName(t)}`;o.selected=(op.manualToolId||"BIT-001")===t.toolId;m.appendChild(o)});
      m.onchange=()=>h.onChange(i,{manualToolId:m.value});
      controls.appendChild(m);
    }
    const a=document.createElement("span");
    a.className="operation-actions";
    [["↑",-1],["↓",1]].forEach(([x,d])=>{const b=document.createElement("button");b.textContent=x;b.onclick=()=>h.onMove(i,d);a.appendChild(b)});
    const b=document.createElement("button");b.textContent="×";b.onclick=()=>h.onRemove(i);a.appendChild(b);
    r.append(n,controls,a);
    c.appendChild(r);
  });
}
