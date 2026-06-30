// Slider host component (muten Custom). inputs: { value, min, max }. handlers: { input(value) }.
// Returns a reactive updater so the thumb follows the page's value when it changes elsewhere.
export function mount(el, inputs, handlers) {
  const min = Number(inputs.min ?? 0);
  const max = Number(inputs.max ?? 100);
  const range = document.createElement('div'); range.className = 'slider-range';
  const thumb = document.createElement('div'); thumb.className = 'slider-thumb';
  el.append(range, thumb);

  let value = Number(inputs.value ?? min);
  const pct = (v) => (max === min ? 0 : ((v - min) / (max - min)) * 100);
  const paint = (v) => { const p = pct(v); range.style.width = p + '%'; thumb.style.left = p + '%'; };
  paint(value);

  const setFromX = (clientX) => {
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    const v = Math.round(min + ratio * (max - min));
    if (v !== value) { value = v; paint(v); if (handlers.input) handlers.input(v); }
  };

  let dragging = false;
  el.addEventListener('pointerdown', (e) => { dragging = true; el.setPointerCapture(e.pointerId); setFromX(e.clientX); });
  el.addEventListener('pointermove', (e) => { if (dragging) setFromX(e.clientX); });
  const stop = () => { dragging = false; };
  el.addEventListener('pointerup', stop);
  el.addEventListener('pointercancel', stop);

  return (next) => { const v = Number(next.value ?? value); if (v !== value) { value = v; paint(v); } };
}
