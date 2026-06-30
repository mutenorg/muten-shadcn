// Context Menu host component (muten Custom). inputs: { label, items }. handlers: { select(label) }.
// Right-clicking the area opens a menu of items at the cursor; choosing one emits its label.
export function mount(el, inputs, handlers) {
  const area = document.createElement('div'); area.className = 'context-area';
  area.textContent = inputs.label == null ? 'Right-click here' : String(inputs.label);
  el.appendChild(area);
  const menu = document.createElement('div'); menu.className = 'context-menu';
  el.appendChild(menu);

  let open = false;
  const hide = () => { menu.classList.remove('context-menu-open'); open = false; };
  const build = (items) => {
    menu.innerHTML = '';
    (Array.isArray(items) ? items : []).forEach((it) => {
      const label = (it && typeof it === 'object') ? (it.label == null ? '' : String(it.label)) : String(it);
      const b = document.createElement('button'); b.type = 'button'; b.className = 'context-item'; b.textContent = label;
      b.addEventListener('click', () => { hide(); if (handlers.select) handlers.select(label); });
      menu.appendChild(b);
    });
  };

  area.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const r = el.getBoundingClientRect();
    menu.style.left = (e.clientX - r.left) + 'px';
    menu.style.top = (e.clientY - r.top) + 'px';
    menu.classList.add('context-menu-open');
    open = true;
  });
  document.addEventListener('click', () => { if (open) hide(); });

  build(inputs.items);
  return (n) => { area.textContent = n.label == null ? 'Right-click here' : String(n.label); build(n.items); };
}
