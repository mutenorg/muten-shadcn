// CanvasHost (muten Custom). A <canvas> with pan (drag) + zoom (wheel). handlers: { view(zoomPercent) }.
// Draws a checkerboard + a sample sprite as a placeholder - replace draw() with your scene render.
export function mount(el, inputs, handlers) {
  const canvas = document.createElement('canvas');
  el.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let scale = 1, ox = 0, oy = 0;
  const dpr = () => window.devicePixelRatio || 1;

  const draw = () => {
    const w = canvas.width / dpr(), h = canvas.height / dpr();
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(ox, oy); ctx.scale(scale, scale);
    const cell = 16;
    const sx = Math.floor((-ox / scale) / cell) - 1, sy = Math.floor((-oy / scale) / cell) - 1;
    const cols = Math.ceil(w / cell / scale) + 3, rows = Math.ceil(h / cell / scale) + 3;
    for (let i = sx; i < sx + cols; i++) for (let j = sy; j < sy + rows; j++) {
      ctx.fillStyle = (i + j) % 2 ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.02)';
      ctx.fillRect(i * cell, j * cell, cell, cell);
    }
    ctx.fillStyle = '#3b82f6'; ctx.fillRect(-32, -32, 64, 64);
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1 / scale; ctx.strokeRect(-32, -32, 64, 64);
    ctx.restore();
  };
  const resize = () => { const r = el.getBoundingClientRect(); canvas.width = r.width * dpr(); canvas.height = r.height * dpr(); ctx.setTransform(dpr(), 0, 0, dpr(), 0, 0); draw(); };

  let drag = false, lx = 0, ly = 0;
  canvas.addEventListener('pointerdown', (e) => { drag = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => { if (!drag) return; ox += e.clientX - lx; oy += e.clientY - ly; lx = e.clientX; ly = e.clientY; draw(); });
  canvas.addEventListener('pointerup', () => drag = false);
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const f = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const r = el.getBoundingClientRect(), cx = e.clientX - r.left, cy = e.clientY - r.top;
    const ns = Math.min(8, Math.max(0.2, scale * f));
    const k = ns / scale; ox = cx - (cx - ox) * k; oy = cy - (cy - oy) * k; scale = ns;
    draw(); if (handlers.view) handlers.view(Math.round(scale * 100));
  }, { passive: false });

  requestAnimationFrame(() => { const r = el.getBoundingClientRect(); ox = r.width / 2; oy = r.height / 2; resize(); });
  window.addEventListener('resize', resize);
  return () => {};
}
