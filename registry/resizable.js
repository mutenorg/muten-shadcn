// Resizable host component (muten Custom). inputs: { left, right } (panel labels). A draggable splitter
// resizes the two panels. Edit this file to render real content per panel instead of the label text.
export function mount(el, inputs, handlers) {
  const a = document.createElement('div'); a.className = 'resizable-panel';
  const handle = document.createElement('div'); handle.className = 'resizable-handle';
  const b = document.createElement('div'); b.className = 'resizable-panel';
  el.appendChild(a); el.appendChild(handle); el.appendChild(b);

  let pct = 50;
  const paint = () => { a.style.flexBasis = pct + '%'; b.style.flexBasis = (100 - pct) + '%'; };
  const setText = (left, right) => { a.textContent = left == null ? 'One' : String(left); b.textContent = right == null ? 'Two' : String(right); };
  setText(inputs.left, inputs.right);
  paint();

  let drag = false;
  handle.addEventListener('pointerdown', (e) => { drag = true; handle.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    pct = Math.min(85, Math.max(15, ((e.clientX - r.left) / r.width) * 100));
    paint();
  });
  const stop = () => { drag = false; };
  handle.addEventListener('pointerup', stop);
  handle.addEventListener('pointercancel', stop);

  return (n) => setText(n.left, n.right);
}
