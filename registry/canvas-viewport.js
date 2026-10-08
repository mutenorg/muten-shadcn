// CanvasHost (muten Custom). A <canvas> with pan (drag) + zoom (wheel). handlers: { view(zoomPercent) }.
// Draws a checkerboard + a sample square as a placeholder in the skin's colours - replace draw() with your scene.
// inputs: zoom (percent; the page can set it, e.g. from a ZoomControl). Double-click puts the view back at 100 %.
export function mount(el, inputs, handlers) {
  const canvas = document.createElement('canvas');
  el.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let scale = 1, ox = 0, oy = 0;
  const dpr = () => window.devicePixelRatio || 1;
  const token = (name, fallback) => getComputedStyle(el).getPropertyValue(name).trim() || fallback;

  const draw = () => {
    const w = canvas.width / dpr(), h = canvas.height / dpr();
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(ox, oy); ctx.scale(scale, scale);
    const cell = 16;
    const sx = Math.floor((-ox / scale) / cell) - 1, sy = Math.floor((-oy / scale) / cell) - 1;
    const cols = Math.ceil(w / cell / scale) + 3, rows = Math.ceil(h / cell / scale) + 3;
    for (let i = sx; i < sx + cols; i++) for (let j = sy; j < sy + rows; j++) {
      ctx.fillStyle = (i + j) % 2 ? token('--muted', '#f4f4f5') : token('--background', '#fff');
      ctx.fillRect(i * cell, j * cell, cell, cell);
    }
    ctx.fillStyle = token('--selected', '#6B46F2'); ctx.fillRect(-32, -32, 64, 64);
    ctx.strokeStyle = token('--foreground', '#111'); ctx.lineWidth = 1 / scale; ctx.strokeRect(-32, -32, 64, 64);
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
  // the page sets the zoom (a ZoomControl): zoom around the centre of the view
  const zoomTo = (pct) => { const ns = Math.min(8, Math.max(0.2, pct / 100)); if (Math.abs(ns - scale) < 1e-3) return; const r = el.getBoundingClientRect(), cx = r.width / 2, cy = r.height / 2, k = ns / scale; ox = cx - (cx - ox) * k; oy = cy - (cy - oy) * k; scale = ns; draw(); };
  canvas.addEventListener('dblclick', () => { zoomTo(100); handlers.view?.(100); });
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['data-theme', 'data-skin'] });
  if (inputs.zoom) requestAnimationFrame(() => zoomTo(Number(inputs.zoom)));
  return (next) => { if (next.zoom) zoomTo(Number(next.zoom)); };
}
