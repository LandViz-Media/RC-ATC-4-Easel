// Responsibility: Render top-down CNC toolpaths for thumbnails and detailed/combined previews.
// This is a visual aid only and does not simulate machining.

function mapFactory(bounds,width,height){
  const pad=32;
  const bw=Math.max(bounds.maxX-bounds.minX,0.001);
  const bh=Math.max(bounds.maxY-bounds.minY,0.001);
  const scale=Math.min((width-2*pad)/bw,(height-2*pad)/bh);
  const ox=(width-bw*scale)/2;
  const oy=(height-bh*scale)/2;
  return p=>({x:ox+(p.x-bounds.minX)*scale,y:height-(oy+(p.y-bounds.minY)*scale)});
}
function drawLine(ctx,a,b,dash=false){
  ctx.save();
  ctx.strokeStyle=dash?"#888888":"#222222";
  ctx.lineWidth=2;
  if(dash)ctx.setLineDash([6,8]);
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  ctx.restore();
}
function drawArc(ctx,m,map){
  const cx=m.x1+m.i,cy=m.y1+m.j,r=Math.hypot(m.x1-cx,m.y1-cy);
  if(!isFinite(r)||r<1e-8){drawLine(ctx,map({x:m.x1,y:m.y1}),map({x:m.x2,y:m.y2}));return;}
  let a1=Math.atan2(m.y1-cy,m.x1-cx),a2=Math.atan2(m.y2-cy,m.x2-cx),d=a2-a1;
  if(m.type==="arcCW"&&d>=0)d-=Math.PI*2;
  if(m.type==="arcCCW"&&d<=0)d+=Math.PI*2;
  const steps=Math.max(12,Math.ceil(Math.abs(d)/(Math.PI/24)));
  ctx.save();ctx.strokeStyle="#222222";ctx.lineWidth=2;ctx.beginPath();
  for(let k=0;k<=steps;k++){
    const a=a1+d*k/steps,q=map({x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)});
    if(k===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);
  }
  ctx.stroke();ctx.restore();
}
function calculateBounds(entries,showRapid){
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(const e of entries){
    for(const m of e.parsed.moves){
      if(m.type==="rapid"&&!showRapid)continue;
      if(m.x1===m.x2&&m.y1===m.y2)continue;
      minX=Math.min(minX,m.x1,m.x2);maxX=Math.max(maxX,m.x1,m.x2);
      minY=Math.min(minY,m.y1,m.y2);maxY=Math.max(maxY,m.y1,m.y2);
    }
  }
  return Number.isFinite(minX)?{minX,minY,maxX,maxY}:null;
}
function drawParsed(ctx,parsed,map,opts){
  for(const m of parsed.moves){
    if(m.type==="rapid"){
      if(opts.showRapid)drawLine(ctx,map({x:m.x1,y:m.y1}),map({x:m.x2,y:m.y2}),true);
    } else if(m.type==="cut"){
      drawLine(ctx,map({x:m.x1,y:m.y1}),map({x:m.x2,y:m.y2}));
    } else {
      drawArc(ctx,m,map);
    }
  }
  if(opts.showStart&&parsed.firstXY){
    const q=map(parsed.firstXY);ctx.save();ctx.fillStyle="#228B22";
    ctx.beginPath();ctx.arc(q.x,q.y,6,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  if(opts.showEnd&&parsed.lastXY){
    const q=map(parsed.lastXY);ctx.save();ctx.fillStyle="#CC3333";
    ctx.beginPath();ctx.arc(q.x,q.y,6,0,Math.PI*2);ctx.fill();ctx.restore();
  }
}
function render(canvas,parsed,opts={}){
  const ctx=canvas.getContext("2d"),w=canvas.width=900,h=560;
  ctx.clearRect(0,0,w,h);
  if(!parsed.bounds){
    ctx.fillStyle="#777";ctx.font="18px system-ui";ctx.textAlign="center";
    ctx.fillText("No XY toolpath detected",w/2,h/2);return;
  }
  const map=mapFactory(parsed.bounds,w,h);
  if(opts.showAxes){
    ctx.save();ctx.strokeStyle="#bbb";ctx.lineWidth=1;
    const o=map({x:parsed.bounds.minX,y:parsed.bounds.minY});
    ctx.beginPath();ctx.moveTo(18,o.y);ctx.lineTo(w-18,o.y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(o.x,18);ctx.lineTo(o.x,h-18);ctx.stroke();
    ctx.fillStyle="#777";ctx.font="12px system-ui";
    ctx.fillText("X",w-28,o.y-6);ctx.fillText("Y",o.x+6,28);ctx.restore();
  }
  drawParsed(ctx,parsed,map,{
    showRapid:opts.showRapid!==false,
    showStart:opts.showStart!==false,
    showEnd:opts.showEnd!==false
  });
}
function renderCombined(canvas,entries,visibleTools,opts={}){
  const ctx=canvas.getContext("2d"),w=canvas.width=900,h=560;
  ctx.clearRect(0,0,w,h);
  const active=entries.filter(e=>e.parsed&&e.parsed.bounds&&(!visibleTools.size||visibleTools.has(Number(e.tool))));
  if(!active.length){
    ctx.fillStyle="#777";ctx.font="18px system-ui";ctx.textAlign="center";
    ctx.fillText("Assign a tool and select at least one visible tool.",w/2,h/2);return;
  }
  const bounds=calculateBounds(active,true);
  if(!bounds)return;
  const map=mapFactory(bounds,w,h);
  active.forEach(e=>drawParsed(ctx,e.parsed,map,{
    showRapid:opts.showRapid!==false,
    showStart:opts.showStart!==false,
    showEnd:opts.showEnd!==false
  }));
}
window.NCPreviewRenderer={render,renderCombined};
