// LiveStack (muten Custom) - a pile of news that keeps arriving (see live-stack.muten). Plain DOM, no kit needed:
// every `every` ms the next item drops in at the front; the older ones step back (--i) and the fourth leaves.
export function mount(el, inputs) {
  let items = Array.isArray(inputs.items) ? inputs.items : [];
  const every = Number(inputs.every) || 2800;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  el.setAttribute('role', 'log'); el.setAttribute('aria-live', 'polite'); if (inputs.label) el.setAttribute('aria-label', inputs.label);
  const card = (it) => {
    const n = document.createElement('div');
    n.className = 'cx-live-card'; n.dataset.tone = it.tone || '';
    n.innerHTML = `<span class="cx-live-ic">${it.icon ? `<svg><use href="#${esc(it.icon)}"></use></svg>` : ''}</span><span class="cx-live-tx"><b>${esc(it.title)}</b>${it.text ? `<span>${esc(it.text)}</span>` : ''}</span>${it.time ? `<small>${esc(it.time)}</small>` : ''}`;
    return n;
  };
  const layout = () => [...el.children].forEach((c, i) => { c.style.setProperty('--i', i); if (i > 3) c.remove(); });
  let k = 0, timer = 0, paused = false;
  const push = () => {
    if (!items.length) return;
    const n = card(items[k % items.length]); k++;
    n.dataset.enter = ''; el.prepend(n); layout();
    requestAnimationFrame(() => requestAnimationFrame(() => delete n.dataset.enter));
  };
  const loop = () => { if (!paused) push(); timer = setTimeout(loop, every); };
  if (still) { items.slice(0, 3).reverse().forEach((it) => { el.prepend(card(it)); }); layout(); }
  else { push(); timer = setTimeout(loop, every); }
  el.addEventListener('pointerenter', () => { paused = true; });
  el.addEventListener('pointerleave', () => { paused = false; });
  return (next) => { items = Array.isArray(next.items) ? next.items : items; };
}
