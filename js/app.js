// Responsibility: Load configuration, manage the UI, import Easel files, and generate the combined job.
import {parseEaselFile,stripEaselFooter} from "./parser.js";
import {buildJob} from "./generator.js";
import {loadSettings,saveSettings} from "./settings.js";
import {renderOperations} from "./ui.js";

const S={operations:[],settings:loadSettings(),tools:[]};
const $=s=>document.querySelector(s);
const file=$("#fileInput"), list=$("#operationList"), gen=$("#generateButton"), status=$("#status");

async function loadTools(){
  const r=await fetch("./config/tools.json",{cache:"no-store"});
  if(!r.ok) throw Error(`Unable to load config/tools.json (${r.status}).`);
  S.tools=(await r.json()).tools;
  if(!S.tools?.length) throw Error("No tools found.");
}

function refresh(){
  renderOperations(list,S.operations,S.tools,{
    onChange:(i,p)=>{Object.assign(S.operations[i],p);refresh()},
    onRemove:i=>{S.operations.splice(i,1);refresh()},
    onMove:(i,d)=>{
      const j=i+d;
      if(j<0||j>=S.operations.length)return;
      [S.operations[i],S.operations[j]]=[S.operations[j],S.operations[i]];
      refresh();
    }
  });
  gen.disabled=!S.operations.length;
}

file.onchange=async e=>{
  for(const f of e.target.files){
    const text=await f.text();
    S.operations.push({fileName:f.name,body:stripEaselFooter(parseEaselFile(text).body),tool:1});
  }
  status.textContent=`Loaded ${S.operations.length} operation(s). Assign each operation a MASSO tool.`;
  refresh();
  e.target.value="";
};

["parkX","parkY","parkZ","setterX","setterY","dustShoeEnabled","endMode","endX","endY","endZOverrideEnabled","endZ"].forEach(id=>{
  const e=$("#"+id);
  e.value=S.settings[id];
  if(e.type==="checkbox")e.checked=!!S.settings[id];
  e.onchange=()=>{
    S.settings[id]=e.type==="checkbox"?e.checked:(e.type==="number"?Number(e.value):e.value);
    saveSettings(S.settings);
    toggleEnd();
  };
});

function toggleEnd(){
  $("#customEnd").classList.toggle("hidden",$("#endMode").value!=="custom");
  $("#endZWrap").classList.toggle("hidden",!$("#endZOverrideEnabled").checked);
}

toggleEnd();

$("#outputFileName").oninput=()=>{};
$("#jobDescription").oninput=()=>{};

gen.onclick=()=>{
  try{
    const fileBase=$("#outputFileName").value.trim().replace(/\.nc$/i,"")||"combined-masso-rapidchange";
    const description=$("#jobDescription").value.trim();
    const g=buildJob(S.operations,S.settings,S.tools,{fileName:fileBase,description});
    const u=URL.createObjectURL(new Blob([g],{type:"text/plain"}));
    const a=document.createElement("a");
    a.href=u;
    a.download=`${fileBase}.nc`;
    a.click();
    URL.revokeObjectURL(u);
    status.textContent=`Combined G-code generated: ${fileBase}.nc`;
  }catch(e){status.textContent=`ERROR: ${e.message}`}
};

loadTools().then(refresh).catch(e=>{status.textContent=`ERROR: ${e.message}`;refresh()});
refresh();
