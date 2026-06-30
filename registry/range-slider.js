// RangeSlider host (muten Custom). inputs: { lo, hi, min, max, step }. handlers: { lo(v), hi(v) }.
// Two thumbs; drag the nearer one. The page owns two numbers (the low + high bounds).
export function mount(el, inputs, handlers) {
  const num = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
  const min = num(inputs.min, 0), max = num(inputs.max, 100), step = num(inputs.step, 1) || 1;
  let lo = num(inputs.lo, min), hi = num(inputs.hi, max);

  const fill = document.createElement('div'); fill.className = 'range-slider-fill';
  const tlo = document.createElement('div'); tlo.className = 'range-slider-thumb';
  const thi = document.createElement('div'); thi.className = 'range-slider-thumb';
  el.appendChild(fill); el.appendChild(tlo); el.appendChild(thi);

  const pct = (v) => (max === min ? 0 : (v - min) / (max - min) * 100);
  const paint = () => { fill.style.left = pct(lo) + '%'; fill.style.width = (pct(hi) - pct(lo)) + '%'; tlo.style.left = pct(lo) + '%'; thi.style.left = pct(hi) + '%'; };
  paint();

  const valAt = (clientX) => { const r = el.getBoundingClientRect(); if (!r.width) return lo; const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width)); return Math.round((min + ratio * (max - min)) / step) * step; };
  let dragging = null;
  const move = (e) => { const v = valAt(e.clientX); if (dragging === 'lo') { lo = Math.min(v, hi); if (handlers.lo) handlers.lo(lo); } else { hi = Math.max(v, lo); if (handlers.hi) handlers.hi(hi); } paint(); };
  el.addEventListener('pointerdown', (e) => { const v = valAt(e.clientX); dragging = Math.abs(v - lo) <= Math.abs(v - hi) ? 'lo' : 'hi'; el.setPointerCapture(e.pointerId); move(e); });
  el.addEventListener('pointermove', (e) => { if (dragging) move(e); });
  el.addEventListener('pointerup', () => dragging = null);

  return (n) => { lo = num(n.lo, lo); hi = num(n.hi, hi); paint(); };
}
