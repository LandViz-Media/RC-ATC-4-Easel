// Responsibility: Integrated preview UI controller.
// The proven v0.1.6 parser and renderer are loaded separately and reused.

const TOOLS=[
  [1,".25 1/4 Up Cut"],[2,".25 1/4 Down Cut"],[3,".25 1/4 Compression"],[4,".25 1/4 Ballnose"],
  [5,".25 1/4 30 V-bit"],[6,".125 1/8 Compression (short)"],[7,".125 1/16 Up Cut (short)"],
  [8,".5 1/2 Ballnose"],[9,"Manual tool 1"],[10,"Manual tool 2"]
];

const operations=[];
const fileInput=document.querySelector("#files");
const dropzone=document.querySelector("#dropzone");
const opsEl=document.querySelector("#operations");
const combinedCanvas=document.querySelector("#combinedCanvas");
const filters=document.querySelector("#toolFilters");
const combinedMeta=document.querySelector("#combinedMeta");
const status=document.querySelector("#status");
const pop=document.createElement("div");
pop.className="popover";pop.hidden=true;document.body.append(pop);

function toolName(n){const t=TOOLS.find(x=>x[0]===n);return t?`Tool ${t[0]}: ${t[1]}`:`Tool ${n}`;}
function escapeHTML(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function toolSelect(value){
  const s=document.createElement("select");
  s.innerHTML='<option value="">Select tool…</option>'+TOOLS.map(t=>`<option value="${t[0]}" ${Number(value)===t[0]?"selected":""}>Tool ${t[0]}: ${t[1]}</option>`).join("");
  return s;
}
async function addFiles(fileList){
  const list=[...fileList].filter(f=>/\.(nc|gcode|txt)$/i.test(f.name));
  if(!list.length){status.textContent="No supported .nc files selected.";return;}
  for(const file of list){
    const text=await file.text();
    operations.push({file,parsed:NCPreviewParser.parseNC(text),tool:null});
  }
  status.textContent=`Loaded ${operations.length} operation${operations.length===1?"":"s"}.`;
  renderUI();
}
function renderUI(){
  opsEl.innerHTML="";
  operations.forEach((op,i)=>{
    const card=document.createElement("article");card.className="operation";
    const thumb=document.createElement("div");thumb.className="thumb";
    const canvas=document.createElement("canvas");thumb.append(canvas);
    NCPreviewRenderer.render(canvas,op.parsed,{showRapid:true,showStart:true,showEnd:true});

    const info=document.createElement("div");info.className="op-info";const b=op.parsed.bounds;
    info.innerHTML=`<h3>${escapeHTML(op.file.name)}</h3><p>${b?`XY: ${(b.maxX-b.minX).toFixed(3)} × ${(b.maxY-b.minY).toFixed(3)} in`:"No XY toolpath"}</p><p>${op.parsed.cutMoves} cutting moves · ${op.parsed.rapidMoves} rapid moves</p>`;
    const label=document.createElement("label");label.textContent="Assigned tool: ";const sel=toolSelect(op.tool);label.append(sel);info.append(label);
    sel.addEventListener("change",()=>{op.tool=sel.value?Number(sel.value):null;renderUI();});

    const actions=document.createElement("div");actions.className="actions";
    for(const [txt,d,title] of [["↑",-1,"Move up"],["↓",1,"Move down"]]){
      const b=document.createElement("button");b.textContent=txt;b.title=title;b.onclick=()=>{const j=i+d;if(j<0||j>=operations.length)return;[operations[i],operations[j]]=[operations[j],operations[i]];renderUI();};actions.append(b);
    }
    const rem=document.createElement("button");rem.textContent="Remove";rem.onclick=()=>{operations.splice(i,1);renderUI();};actions.append(rem);
    card.append(thumb,info,actions);opsEl.append(card);

    thumb.addEventListener("mouseenter",e=>showPopover(e,op));
    thumb.addEventListener("mousemove",movePopover);
    thumb.addEventListener("mouseleave",hidePopover);
  });
  renderCombined();
}
function showPopover(e,op){
  const b=op.parsed.bounds;
  pop.innerHTML=`<strong>${escapeHTML(op.file.name)}</strong><br>${op.tool?toolName(op.tool):"Tool not assigned"}<br>${b?`XY: ${(b.maxX-b.minX).toFixed(3)} × ${(b.maxY-b.minY).toFixed(3)} in`:"No XY toolpath"}<br>${op.parsed.cutMoves} cutting moves · ${op.parsed.rapidMoves} rapid moves${op.parsed.minZ!==null?`<br>Z range: ${op.parsed.minZ.toFixed(3)} to ${op.parsed.maxZ.toFixed(3)}`:""}`;
  pop.hidden=false;movePopover(e);
}
function movePopover(e){pop.style.left=(e.clientX+14)+"px";pop.style.top=(e.clientY+14)+"px";}
function hidePopover(){pop.hidden=true;}

function renderCombined(){
  const used=[...new Set(operations.map(o=>o.tool).filter(Boolean))].sort((a,b)=>a-b);
  filters.innerHTML="";
  used.forEach(t=>{
    const label=document.createElement("label");label.className="tool-filter";
    label.innerHTML=`<input type="checkbox" checked data-tool="${t}"> ${toolName(t)}`;
    filters.append(label);label.querySelector("input").addEventListener("change",drawCombined);
  });
  combinedMeta.textContent=operations.length?`${operations.length} operation${operations.length===1?"":"s"} · ${used.length} tool${used.length===1?"":"s"} assigned`:"Add operations above to see the combined preview.";
  drawCombined();
}

function drawCombined(){
  const visible=new Set([...filters.querySelectorAll("input:checked")].map(x=>Number(x.dataset.tool)));
  const active=operations.filter(o=>o.tool&&visible.has(o.tool)&&o.parsed.bounds);
  const canvas=combinedCanvas,ctx=canvas.getContext("2d"),w=canvas.width=900,h=560;
  ctx.clearRect(0,0,w,h);
  if(!active.length){ctx.fillStyle="#777";ctx.font="18px system-ui";ctx.textAlign="center";ctx.fillText("Assign a tool and select at least one visible tool.",w/2,h/2);return;}

  const bounds=active.reduce((b,o)=>({
    minX:Math.min(b.minX,o.parsed.bounds.minX),minY:Math.min(b.minY,o.parsed.bounds.minY),
    maxX:Math.max(b.maxX,o.parsed.bounds.maxX),maxY:Math.max(b.maxY,o.parsed.bounds.maxY)
  }),{minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity});

  const pad=32,bw=Math.max(bounds.maxX-bounds.minX,.001),bh=Math.max(bounds.maxY-bounds.minY,.001);
  const scale=Math.min((w-2*pad)/bw,(h-2*pad)/bh),ox=(w-bw*scale)/2,oy=(h-bh*scale)/2;
  const map=p=>({x:ox+(p.x-bounds.minX)*scale,y:h-(oy+(p.y-bounds.minY)*scale)});

  function drawLine(a,b,dash=false){
    ctx.save();ctx.strokeStyle=dash?"#888888":"#222";ctx.lineWidth=2;
    if(dash)ctx.setLineDash([6,8]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore();
  }
  function drawArc(m){
    const cx=m.x1+m.i,cy=m.y1+m.j,r=Math.hypot(m.x1-cx,m.y1-cy);
    if(!isFinite(r)||r<1e-8){drawLine(map({x:m.x1,y:m.y1}),map({x:m.x2,y:m.y2}));return;}
    let a1=Math.atan2(m.y1-cy,m.x1-cx),a2=Math.atan2(m.y2-cy,m.x2-cx),d=a2-a1;
    if(m.type==="arcCW"&&d>=0)d-=Math.PI*2;if(m.type==="arcCCW"&&d<=0)d+=Math.PI*2;
    const steps=Math.max(12,Math.ceil(Math.abs(d)/(Math.PI/24)));
    ctx.save();ctx.strokeStyle="#222";ctx.lineWidth=2;ctx.beginPath();
    for(let k=0;k<=steps;k++){const a=a1+d*k/steps,q=map({x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)});if(!k)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);}
    ctx.stroke();ctx.restore();
  }

  active.forEach(o=>o.parsed.moves.forEach(m=>{
    if(m.type==="rapid")drawLine(map({x:m.x1,y:m.y1}),map({x:m.x2,y:m.y2}),true);
    else if(m.type==="cut")drawLine(map({x:m.x1,y:m.y1}),map({x:m.x2,y:m.y2}));
    else drawArc(m);
  }));

  // Mark each operation's actual cutting start and end.
  active.forEach(o=>{
    if(o.parsed.firstXY){const q=map(o.parsed.firstXY);ctx.fillStyle="#228B22";ctx.beginPath();ctx.arc(q.x,q.y,6,0,Math.PI*2);ctx.fill();}
    if(o.parsed.lastXY){const q=map(o.parsed.lastXY);ctx.fillStyle="#CC3333";ctx.beginPath();ctx.arc(q.x,q.y,6,0,Math.PI*2);ctx.fill();}
  });
}

document.querySelector("#allTools").onclick=()=>{filters.querySelectorAll("input").forEach(x=>x.checked=true);drawCombined();};
document.querySelector("#noTools").onclick=()=>{filters.querySelectorAll("input").forEach(x=>x.checked=false);drawCombined();};
fileInput.addEventListener("change",e=>{addFiles(e.target.files);e.target.value="";});
dropzone.addEventListener("dragover",e=>{e.preventDefault();dropzone.classList.add("dragover");});
dropzone.addEventListener("dragleave",()=>dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop",e=>{e.preventDefault();dropzone.classList.remove("dragover");addFiles(e.dataTransfer.files);});
