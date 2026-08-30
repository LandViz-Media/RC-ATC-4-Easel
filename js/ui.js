// Responsibility: Render the ordered operation list and controls.
export function renderOperations(container,ops,h){container.innerHTML="";if(!ops.length){container.innerHTML='<p class="empty">No files added yet.</p>';return}
ops.forEach((op,i)=>{const row=document.createElement("div");row.className="operation";const name=document.createElement("strong");name.textContent=`${i+1}. ${op.fileName}`;
const tool=document.createElement("select");for(let t=1;t<=8;t++){const o=document.createElement("option");o.value=t;o.textContent=`Tool ${t}`;o.selected=Number(op.tool)===t;tool.appendChild(o)}
tool.addEventListener("change",()=>h.onChange(i,{tool:Number(tool.value)}));const actions=document.createElement("span");actions.className="operation-actions";
for(const [txt,title,d] of [["↑","Move up",-1],["↓","Move down",1]]){const b=document.createElement("button");b.textContent=txt;b.title=title;b.onclick=()=>h.onMove(i,d);actions.appendChild(b)}
const rem=document.createElement("button");rem.textContent="×";rem.title="Remove";rem.onclick=()=>h.onRemove(i);actions.appendChild(rem);row.append(name,tool,actions);container.appendChild(row)})}