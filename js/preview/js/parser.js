// Responsibility: Parse the small subset of G-code needed for a top-down preview.
// This prototype does not execute G-code and never modifies the source file.

const WORD = /([XYZIJKF])\s*([-+]?(?:\d+(?:\.\d*)?|\.\d+))/gi;

function parseNC(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  let x = 0, y = 0, z = 0;
  let motion = null;
  const moves = [];
  let unitScale = 1; // inches internally
  let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
  let firstXY = null;
  let lastCutXY = null;

  for (const raw of lines) {
    const line = raw.replace(/\([^)]*\)/g, " ").replace(/;.*$/,"").trim();
    if (!line) continue;

    if (/\bG20\b/i.test(line)) unitScale = 1;
    if (/\bG21\b/i.test(line)) unitScale = 25.4;

    const gm = line.match(/\bG0*([0123])\b/i);
    if (gm) motion = Number(gm[1]);

    const words = {};
    for (const m of line.matchAll(WORD)) words[m[1].toUpperCase()] = Number(m[2]);

    const nx = words.X !== undefined ? words.X * unitScale : x;
    const ny = words.Y !== undefined ? words.Y * unitScale : y;
    const nz = words.Z !== undefined ? words.Z * unitScale : z;

    if (motion !== null && (words.X !== undefined || words.Y !== undefined || words.Z !== undefined)) {
      const move = {
        type: motion === 0 ? "rapid" : motion === 1 ? "cut" : motion === 2 ? "arcCW" : "arcCCW",
        x1:x, y1:y, z1:z, x2:nx, y2:ny, z2:nz,
        i:words.I !== undefined ? words.I*unitScale : 0,
        j:words.J !== undefined ? words.J*unitScale : 0
      };
      moves.push(move);

      if (words.X !== undefined || words.Y !== undefined) {
        if ((motion === 1 || motion === 2 || motion === 3) && !firstXY) firstXY = {x:nx,y:ny};
        if (motion === 1 || motion === 2 || motion === 3) lastCutXY = {x:nx,y:ny};
        lastXY = {x:nx,y:ny};
        minX=Math.min(minX,x,nx); maxX=Math.max(maxX,x,nx);
        minY=Math.min(minY,y,ny); maxY=Math.max(maxY,y,ny);
      }
    }

    x=nx; y=ny; z=nz;
  }

  if (!Number.isFinite(minX)) return {moves:[],bounds:null,firstXY:null};
  return {moves,bounds:{minX,minY,maxX,maxY},firstXY,lastXY:lastCutXY};
}

// Expose the parser for the integrated UI controller.
window.NCPreviewParser = { parseNC };
