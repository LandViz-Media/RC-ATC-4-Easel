// Responsibility: Render top-down CNC toolpaths for thumbnails and detailed/combined previews.
// This is a visual aid only and does not execute or generate machine G-code.
//
// v0.3.6 additions: optional inch rulers/measurement ticks and tool-specific
// colors in the combined preview. The parser contract remains unchanged.

const TOOL_COLORS = {
  1:"#111111", // black
  2:"#2563eb", // blue
  3:"#ea580c", // orange
  4:"#16a34a", // green
  5:"#db2777", // pink
  6:"#0891b2", // turquoise
  7:"#111111", // repeat black
  8:"#2563eb", // repeat blue
  9:"#ea580c", // repeat orange
  10:"#16a34a" // repeat green
};

function cuttingBounds(parsed){
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(const m of (parsed.moves||[])){
    if(m.type==='rapid') continue;
    if(m.x1===m.x2 && m.y1===m.y2) continue;
    minX=Math.min(minX,m.x1,m.x2); maxX=Math.max(maxX,m.x1,m.x2);
    minY=Math.min(minY,m.y1,m.y2); maxY=Math.max(maxY,m.y1,m.y2);
  }
  return Number.isFinite(minX)?{minX,minY,maxX,maxY}:parsed.bounds;
}

function combinedCuttingBounds(entries){
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(const e of entries){
    for(const m of (e.parsed.moves||[])){
      if(m.type==='rapid') continue;
      if(m.x1===m.x2 && m.y1===m.y2) continue;
      minX=Math.min(minX,m.x1,m.x2); maxX=Math.max(maxX,m.x1,m.x2);
      minY=Math.min(minY,m.y1,m.y2); maxY=Math.max(maxY,m.y1,m.y2);
    }
  }
  return Number.isFinite(minX)?{minX,minY,maxX,maxY}:null;
}

function mapFactory(bounds,width,height,showRulers=false){
  const left=showRulers?68:48, top=showRulers?42:48, right=showRulers?30:48, bottom=showRulers?58:48;
  const bw=Math.max(bounds.maxX-bounds.minX,0.001), bh=Math.max(bounds.maxY-bounds.minY,0.001);
  const scale=Math.min((width-left-right)/bw,(height-top-bottom)/bh);
  const ox=left+(width-left-right-bw*scale)/2;
  const oy=top+(height-top-bottom-bh*scale)/2;
  return {point:p=>({x:ox+(p.x-bounds.minX)*scale,y:height-(oy+(p.y-bounds.minY)*scale)}),
          scale,bounds,width,height,left,top,right,bottom};
}

function drawLine(ctx,a,b,dash=false,stroke='#222222'){
  ctx.save(); ctx.strokeStyle=dash?'#888888':stroke; ctx.lineWidth=2;
  if(dash)ctx.setLineDash([6,8]);
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore();
}

function drawArc(ctx,m,map,stroke='#222222'){
  const cx=m.x1+m.i,cy=m.y1+m.j,r=Math.hypot(m.x1-cx,m.y1-cy);
  if(!isFinite(r)||r<1e-8){drawLine(ctx,map.point({x:m.x1,y:m.y1}),map.point({x:m.x2,y:m.y2}),false,stroke);return;}
  let a1=Math.atan2(m.y1-cy,m.x1-cx),a2=Math.atan2(m.y2-cy,m.x2-cx),d=a2-a1;
  if(m.type==='arcCW'&&d>=0)d-=Math.PI*2;
  if(m.type==='arcCCW'&&d<=0)d+=Math.PI*2;
  const steps=Math.max(12,Math.ceil(Math.abs(d)/(Math.PI/24)));
  ctx.save();ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.beginPath();
  for(let k=0;k<=steps;k++){
    const a=a1+d*k/steps,q=map.point({x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)});
    if(k===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);
  }
  ctx.stroke();ctx.restore();
}

function niceStep(span){
  const target=span/7,power=Math.pow(10,Math.floor(Math.log10(Math.max(target,1e-9)))),n=target/power;
  const m=n<=1?1:n<=2?2:n<=5?5:10; return m*power;
}

function drawRulers(ctx,map){
  const b=map.bounds,step=niceStep(Math.max(b.maxX-b.minX,b.maxY-b.minY)),minor=step/2;
  const xBase=map.height-map.bottom+25,yBase=map.left-25;
  ctx.save();ctx.strokeStyle='#aaa';ctx.fillStyle='#666';ctx.lineWidth=1;ctx.font='11px system-ui';
  for(let x=Math.ceil(b.minX/minor)*minor;x<=b.maxX+1e-9;x+=minor){
    const q=map.point({x,y:b.minY}),major=Math.abs(x/step-Math.round(x/step))<1e-7,tick=major?10:5;
    ctx.beginPath();ctx.moveTo(q.x,xBase-tick);ctx.lineTo(q.x,xBase);ctx.stroke();
    if(major){ctx.textAlign='center';ctx.fillText(Number(x.toFixed(3)).toString(),q.x,xBase+16);}
  }
  for(let y=Math.ceil(b.minY/minor)*minor;y<=b.maxY+1e-9;y+=minor){
    const q=map.point({x:b.minX,y}),major=Math.abs(y/step-Math.round(y/step))<1e-7,tick=major?10:5;
    ctx.beginPath();ctx.moveTo(yBase,q.y);ctx.lineTo(yBase+tick,q.y);ctx.stroke();
    if(major){ctx.textAlign='right';ctx.fillText(Number(y.toFixed(3)).toString(),yBase-5,q.y+4);}
  }
  ctx.textAlign='left';ctx.fillText('in',map.width-27,xBase+16);ctx.restore();
}

function drawAxes(ctx,map){
  const b=map.bounds,o=map.point({x:b.minX,y:b.minY});
  ctx.save();ctx.strokeStyle='#bbb';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(map.left,o.y);ctx.lineTo(map.width-map.right,o.y);ctx.stroke();
  ctx.beginPath();ctx.moveTo(o.x,map.top);ctx.lineTo(o.x,map.height-map.bottom);ctx.stroke();
  ctx.fillStyle='#777';ctx.font='12px system-ui';ctx.fillText('X',map.width-map.right+4,o.y-6);ctx.fillText('Y',o.x+6,map.top+10);ctx.restore();
}

function drawParsed(ctx,parsed,map,opts){
  const stroke=opts.stroke||'#222222';
  for(const m of (parsed.moves||[])){
    if(m.type==='rapid'){
      if(opts.showRapid)drawLine(ctx,map.point({x:m.x1,y:m.y1}),map.point({x:m.x2,y:m.y2}),true);
    } else if(m.type==='cut'){
      drawLine(ctx,map.point({x:m.x1,y:m.y1}),map.point({x:m.x2,y:m.y2}),false,stroke);
    } else drawArc(ctx,m,map,stroke);
  }
  if(opts.showStart&&parsed.firstXY){const q=map.point(parsed.firstXY);ctx.save();ctx.fillStyle='#228B22';ctx.beginPath();ctx.arc(q.x,q.y,6,0,Math.PI*2);ctx.fill();ctx.restore();}
  if(opts.showEnd&&parsed.lastXY){const q=map.point(parsed.lastXY);ctx.save();ctx.fillStyle='#CC3333';ctx.beginPath();ctx.arc(q.x,q.y,6,0,Math.PI*2);ctx.fill();ctx.restore();}
}

function render(canvas,parsed,opts={}){
  const ctx=canvas.getContext('2d'),w=canvas.width=900,h=canvas.height=560;ctx.clearRect(0,0,w,h);
  if(!parsed||!parsed.bounds){ctx.fillStyle='#777';ctx.font='18px system-ui';ctx.textAlign='center';ctx.fillText('No XY toolpath detected',w/2,h/2);return;}
  const bounds=cuttingBounds(parsed),showRulers=opts.showRulers===true,map=mapFactory(bounds,w,h,showRulers);
  if(showRulers)drawRulers(ctx,map);if(opts.showAxes)drawAxes(ctx,map);
  drawParsed(ctx,parsed,map,{showRapid:opts.showRapid!==false,showStart:opts.showStart!==false,showEnd:opts.showEnd!==false,stroke:'#222222'});
}

function renderCombined(canvas,entries,visibleTools,opts={}){
  const ctx=canvas.getContext('2d'),w=canvas.width=900,h=canvas.height=560;ctx.clearRect(0,0,w,h);
  const active=entries.filter(e=>e.parsed&&e.parsed.bounds&&visibleTools.has(Number(e.tool)));
  if(!active.length){ctx.fillStyle='#777';ctx.font='18px system-ui';ctx.textAlign='center';ctx.fillText('No assigned toolpaths are selected for display.',w/2,h/2-12);ctx.fillText('Assign tools to operations, then turn on the tools you want to see.',w/2,h/2+16);return;}
  const bounds=combinedCuttingBounds(active);if(!bounds)return;
  const showRulers=opts.showRulers===true,map=mapFactory(bounds,w,h,showRulers);
  if(showRulers)drawRulers(ctx,map);if(opts.showAxes)drawAxes(ctx,map);
  active.forEach(e=>drawParsed(ctx,e.parsed,map,{showRapid:opts.showRapid!==false,showStart:opts.showStart===true,showEnd:opts.showEnd===true,stroke:TOOL_COLORS[Number(e.tool)]||'#222222'}));
}

window.NCPreviewRenderer={render,renderCombined,TOOL_COLORS};
