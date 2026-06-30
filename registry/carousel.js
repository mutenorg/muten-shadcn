// Carousel host component (muten Custom). inputs: { items } (a list). Renders one slide per item with prev/next.
// Slides show the item as text; edit this file for image/rich slides (e.g. an <img> per item).
export function mount(el, inputs, handlers) {
  const viewport = document.createElement('div'); viewport.className = 'carousel-viewport';
  const track = document.createElement('div'); track.className = 'carousel-track';
  viewport.appendChild(track); el.appendChild(viewport);
  const prev = document.createElement('button'); prev.type = 'button'; prev.className = 'carousel-prev'; prev.textContent = '‹';
  const next = document.createElement('button'); next.type = 'button'; next.className = 'carousel-next'; next.textContent = '›';
  el.appendChild(prev); el.appendChild(next);

  let idx = 0;
  let items = [];
  // Move by exact viewport widths (px). A `%` translate is relative to the multi-slide track, not the viewport.
  const paint = () => {
    const w = viewport.clientWidth || el.clientWidth || 0;
    for (const s of track.children) s.style.width = w + 'px';
    track.style.transform = 'translateX(' + (-idx * w) + 'px)';
  };
  const build = (list) => {
    items = Array.isArray(list) ? list : [];
    track.innerHTML = '';
    for (const it of items) {
      const s = document.createElement('div'); s.className = 'carousel-slide';
      s.textContent = (it && typeof it === 'object') ? (it.label ?? it.title ?? '') : String(it);
      track.appendChild(s);
    }
    if (idx > items.length - 1) idx = Math.max(0, items.length - 1);
    paint();
  };
  window.addEventListener('resize', paint);
  prev.addEventListener('click', () => { if (items.length) { idx = (idx - 1 + items.length) % items.length; paint(); } });
  next.addEventListener('click', () => { if (items.length) { idx = (idx + 1) % items.length; paint(); } });

  build(inputs.items);
  return (n) => build(n.items);
}
