// Responsibility: Render parsed top-down G-code into a thumbnail canvas.
// Rendering is intentionally approximate; it is a visual aid, not a machining simulator.

function mapFactory(bounds, width, height) {
  const pad=28;
  const bw=Math.max(bounds.maxX-bounds.minX,0.001);
  const bh=Math.max(bounds.maxY-bounds.minY,0.001);
  const scale=Math.min((width-2*pad)/bw,(height-2*pad)/bh);
  const ox=(width-bw*scale)/2;
  const oy=(height-bh*scale)/2;
  return p => ({
    x:ox+(p.x-bounds.minX)*scale,
    y:height-(oy+(p.y-bounds.minY)*scale)
  });
}

function drawLine(ctx,a,b,dash=false) {
  ctx.save();
  if(dash) ctx.setLineDash([6,8]);
  ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
  ctx.restore();
}

function drawArc(ctx,m,map) {
  const cx=m.x1+m.i, cy=m.y1+m.j;
  const r=Math.hypot(m.x1-cx,m.y1-cy);
  if(!isFinite(r) || r<1e-8) { drawLine(ctx,map({x:m.x1,y:m.y1}),map({x:m.x2,y:m.y2})); return; }
  let a1=Math.atan2(m.y1-cy,m.x1-cx);
  let a2=Math.atan2(m.y2-cy,m.x2-cx);
  let delta=a2-a1;
  if(m.type==="arcCW" && delta>=0) delta-=Math.PI*2;
  if(m.type==="arcCCW" && delta<=0) delta+=Math.PI*2;
  const steps=Math.max(12,Math.ceil(Math.abs(delta)/(Math.PI/24)));
  ctx.beginPath();
  for(let k=0;k<=steps;k++){
    const a=a1+delta*k/steps;
    const p=map({x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)});
    if(k===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y);
  }
  ctx.stroke();
}

function render(canvas, parsed, opts={showRapid:true,showStart:true,showAxes:true}) {
  const ctx=canvas.getContext("2d");
  const w=canvas.width=900, h=canvas.height=560;
  ctx.clearRect(0,0,w,h);
  ctx.lineWidth=2;
  ctx.strokeStyle="#222";

  if(!parsed.bounds){
    ctx.fillStyle="#777"; ctx.font="18px system-ui"; ctx.textAlign="center";
    ctx.fillText("No XY toolpath detected",w/2,h/2); return;
  }

  const map=mapFactory(parsed.bounds,w,h);

  if(opts.showAxes){
    ctx.save(); ctx.strokeStyle="#bbb"; ctx.lineWidth=1;
    const o=map({x:parsed.bounds.minX,y:parsed.bounds.minY});
    ctx.beginPath(); ctx.moveTo(18,o.y); ctx.lineTo(w-18,o.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(o.x,18); ctx.lineTo(o.x,h-18); ctx.stroke();
    ctx.fillStyle="#777"; ctx.font="12px system-ui"; ctx.fillText("X",w-28,o.y-6); ctx.fillText("Y",o.x+6,28);
    ctx.restore();
  }

  for(const m of parsed.moves){
    if(m.type==="rapid"){
      if(opts.showRapid){
        ctx.save();
        ctx.strokeStyle="#888888";
        drawLine(ctx,map({x:m.x1,y:m.y1}),map({x:m.x2,y:m.y2}),true);
        ctx.restore();
      }
    } else if(m.type==="cut"){
      drawLine(ctx,map({x:m.x1,y:m.y1}),map({x:m.x2,y:m.y2}));
    } else {
      drawArc(ctx,m,map);
    }
  }

  if(opts.showStart && parsed.firstXY){
    const p=map(parsed.firstXY);
    ctx.save(); ctx.fillStyle="#228B22"; ctx.beginPath(); ctx.arc(p.x,p.y,6,0,Math.PI*2); ctx.fill(); ctx.restore();
  }

  if(opts.showEnd && parsed.lastXY){
    const p=map(parsed.lastXY);
    ctx.save(); ctx.fillStyle="#CC3333"; ctx.beginPath(); ctx.arc(p.x,p.y,6,0,Math.PI*2); ctx.fill(); ctx.restore();
  }
}
