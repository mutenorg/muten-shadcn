// SortableList host (muten Custom). inputs: { items (comma-joined) }. handlers: { reorder(commaJoined) }.
// Drag a row by its grip to reorder; emits the new order. The page owns a comma-joined text (e.g. layer order).
export function mount(el, inputs, handlers) {
  const GRIP = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="15" cy="18" r="1.4"/></svg>';
  const parse = (v) => String(v == null ? '' : v).split(',').map((s) => s.trim()).filter(Boolean);
  let items = parse(inputs.items);
  let dragIdx = -1;

  const emit = () => { if (handlers.reorder) handlers.reorder(items.join(',')); };
  const render = () => {
    el.innerHTML = '';
    items.forEach((it, i) => {
      const row = document.createElement('div'); row.className = 'sortable-row'; row.draggable = true;
      const handle = document.createElement('span'); handle.className = 'sortable-handle'; handle.innerHTML = GRIP;
      const label = document.createElement('span'); label.className = 'sortable-label'; label.textContent = it;
      row.appendChild(handle); row.appendChild(label);
      row.addEventListener('dragstart', () => { dragIdx = i; row.classList.add('sortable-dragging'); });
      row.addEventListener('dragend', () => row.classList.remove('sortable-dragging'));
      row.addEventListener('dragover', (e) => e.preventDefault());
      row.addEventListener('drop', (e) => { e.preventDefault(); if (dragIdx >= 0 && dragIdx !== i) { const [m] = items.splice(dragIdx, 1); items.splice(i, 0, m); dragIdx = -1; render(); emit(); } });
      el.appendChild(row);
    });
  };

  render();
  return (n) => { items = parse(n.items); render(); };
}
