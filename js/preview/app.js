// Responsibility: Manage operation files, tool assignment, ordering, hover details,
// and optional detailed/combined previews. This prototype does not generate G-code.

const TOOLS=[
  [1,".25 1/4 Up Cut"],[2,".25 1/4 Down Cut"],[3,".25 1/4 Compression"],[4,".25 1/4 Ballnose"],
  [5,".25 1/4 30 V-bit"],[6,".125 1/8 Compression (short)"],[7,".125 1/16 Up Cut (short)"],
  [8,".5 1/2 Ballnose"],[9,"Manual tool 1"],[10,"Manual tool 2"]
];
const operations=[];let selectedDetail=-1;
const fileInput=document.querySelector("#files"),dropzone=document.querySelector("#dropzone"),
opsEl=document.querySelector("#operations"),status=document.querySelector("#status"),
detailSection=document.querySelector("#detailedSection"),combinedSection=document.querySelector("#combinedSection"),
detailChooser=document.querySelector("#detailChooser"),detailCanvas=document.querySelector("#detailCanvas"),
combinedCanvas=document.querySelector("#combinedCanvas"),filters=document.querySelector("#toolFilters"),
combinedMeta=document.querySelector("#combinedMeta");
const pop=document.createElement("div");pop.className="popover";pop.hidden=true;document.body.append(pop);

function toolName(n){const t=TOOLS.find(x=>x[0]===n);return t?`Tool ${t[0]}: ${t[1]}`:`Tool ${n}`;}
function escapeHTML(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function toolSelect(value){
  const s=document.createElement("select");
  s.innerHTML='<option value="">Select tool…</option>'+
    TOOLS.map(t=>`<option value="${t[0]}" ${Number(value)===t[0]?"selected":""}>Tool ${t[0]}: ${t[1]}</option>`).join("");
  return s;
}
async function addFiles(fileList){
  const list=[...fileList].filter(f=>/\.(nc|gcode|txt)$/i.test(f.name));
  if(!list.length){status.textContent="No supported .nc files selected.";return;}
  for(const file of list){const text=await file.text();operations.push({file,parsed:NCPreviewParser.parseNC(text),tool:null});}
  if(selectedDetail<0&&operations.length)selectedDetail=0;
  status.textContent=`Loaded ${operations.length} operation${operations.length===1?"":"s"}.`;renderUI();
}
function renderUI(){
  opsEl.innerHTML="";
  operations.forEach((op,i)=>{
    const card=document.createElement("article");card.className="operation";
    const thumb=document.createElement("div");thumb.className="thumb";
    const canvas=document.createElement("canvas");thumb.append(canvas);
    NCPreviewRenderer.render(canvas,op.parsed,{showRapid:true,showStart:true,showEnd:true});
    const info=document.createElement("div");info.className="op-info";const b=op.parsed.bounds;
    info.innerHTML=`<h3>${escapeHTML(op.file.name)}</h3>`+
      `<p>${b?`XY: ${(b.maxX-b.minX).toFixed(3)} × ${(b.maxY-b.minY).toFixed(3)} in`:"No XY toolpath"}</p>`+
      `<p>${op.parsed.cutMoves} cutting moves · ${op.parsed.rapidMoves} rapid moves</p>`;
    const label=document.createElement("label");label.textContent="Assigned tool: ";const sel=toolSelect(op.tool);label.append(sel);info.append(label);
    sel.addEventListener("change",()=>{op.tool=sel.value?Number(sel.value):null;renderUI();});
    const actions=document.createElement("div");actions.className="actions";
    [["↑",-1],["↓",1]].forEach(([txt,d])=>{const b=document.createElement("button");b.textContent=txt;b.title=d<0?"Move up":"Move down";b.onclick=()=>{
      const j=i+d;if(j<0||j>=operations.length)return;[operations[i],operations[j]]=[operations[j],operations[i]];
      if(selectedDetail===i)selectedDetail=j;else if(selectedDetail===j)selectedDetail=i;renderUI();
    };actions.append(b);});
    const rem=document.createElement("button");rem.textContent="Remove";rem.onclick=()=>{operations.splice(i,1);if(!operations.length)selectedDetail=-1;else if(selectedDetail>=operations.length)selectedDetail=operations.length-1;renderUI();};actions.append(rem);
    card.append(thumb,info,actions);opsEl.append(card);
    thumb.addEventListener("mouseenter",e=>showPopover(e,op));thumb.addEventListener("mousemove",movePopover);thumb.addEventListener("mouseleave",hidePopover);
  });
  renderDetailChooser();renderDetailed();renderCombined();
}
function showPopover(e,op){
  const b=op.parsed.bounds;
  pop.innerHTML=`<strong>${escapeHTML(op.file.name)}</strong><br>${op.tool?toolName(op.tool):"Tool not assigned"}<br>`+
    `${b?`XY: ${(b.maxX-b.minX).toFixed(3)} × ${(b.maxY-b.minY).toFixed(3)} in`:"No XY toolpath"}<br>`+
    `${op.parsed.cutMoves} cutting moves · ${op.parsed.rapidMoves} rapid moves`+
    `${op.parsed.minZ!==null?`<br>Z range: ${op.parsed.minZ.toFixed(3)} to ${op.parsed.maxZ.toFixed(3)}`:""}`;
  pop.hidden=false;movePopover(e);
}
function movePopover(e){pop.style.left=(e.clientX+14)+"px";pop.style.top=(e.clientY+14)+"px";}
function hidePopover(){pop.hidden=true;}
function renderDetailChooser(){
  detailChooser.innerHTML="";
  operations.forEach((op,i)=>{
    const b=document.createElement("button");
    b.textContent=op.file.name;
    b.className=i===selectedDetail?"active":"";
    b.onclick=()=>{
      selectedDetail=i;
      renderDetailChooser();
      renderDetailed();
    };
    detailChooser.append(b);
  });
}

function renderDetailed(){
  const show=document.querySelector("#showDetailed").checked;
  detailSection.classList.toggle("hidden",!show);
  if(!show) return;

  if(selectedDetail<0 || !operations[selectedDetail]){
    const ctx=detailCanvas.getContext("2d");
    ctx.clearRect(0,0,detailCanvas.width,detailCanvas.height);
    return;
  }

  const op=operations[selectedDetail];
  NCPreviewRenderer.render(detailCanvas,op.parsed,{
    showRapid:document.querySelector("#detailRapid").checked,
    showStart:document.querySelector("#detailStart").checked,
    showEnd:document.querySelector("#detailEnd").checked,
    showAxes:document.querySelector("#detailAxes").checked
  });
}

function renderCombined(){
  const show=document.querySelector("#showCombined").checked;
  combinedSection.classList.toggle("hidden",!show);
  if(!show) return;

  const used=[...new Set(
    operations.map(o=>o.tool).filter(t=>Number.isInteger(t))
  )].sort((a,b)=>a-b);

  // Rebuild the tool filters from the current operations each time the
  // combined preview is shown or an operation/tool assignment changes.
  filters.innerHTML="";
  used.forEach(t=>{
    const label=document.createElement("label");
    label.className="tool-filter";
    label.innerHTML=`<input type="checkbox" checked data-tool="${t}"> ${toolName(t)}`;
    filters.append(label);
    label.querySelector("input").addEventListener("change",drawCombined);
  });

  combinedMeta.textContent=operations.length
    ? `${operations.length} operation${operations.length===1?"":"s"} · ${used.length} tool${used.length===1?"":"s"} assigned`
    : "Assign tools to operations to populate the combined preview.";

  drawCombined();
}

function drawCombined(){
  const visible=new Set(
    [...filters.querySelectorAll("input:checked")].map(x=>Number(x.dataset.tool))
  );

  const entries=operations
    .filter(o=>o.parsed)
    .map(o=>({parsed:o.parsed,tool:o.tool}));

  NCPreviewRenderer.renderCombined(combinedCanvas,entries,visible,{
    showRapid:document.querySelector("#combinedRapid").checked,
    showStart:document.querySelector("#combinedStart").checked,
    showEnd:document.querySelector("#combinedEnd").checked
  });
}

function redrawCurrentPreview(){
  if(document.querySelector("#showDetailed").checked) renderDetailed();
  if(document.querySelector("#showCombined").checked) drawCombined();
}

document.querySelector("#allTools").onclick=()=>{filters.querySelectorAll("input").forEach(x=>x.checked=true);drawCombined();};
document.querySelector("#noTools").onclick=()=>{filters.querySelectorAll("input").forEach(x=>x.checked=false);drawCombined();};
fileInput.addEventListener("change",e=>{addFiles(e.target.files);e.target.value="";});
dropzone.addEventListener("dragover",e=>{e.preventDefault();dropzone.classList.add("dragover");});
dropzone.addEventListener("dragleave",()=>dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop",e=>{e.preventDefault();dropzone.classList.remove("dragover");addFiles(e.dataTransfer.files);});
