// SortableList (muten Custom) - a list of plain names you reorder (layers, steps), from comma-joined text. It draws
// the same rows as Sortable and lends them Sortable's behaviour (grip, pointer, Up/Down, the announcement).
// inputs: items ("Fondo,Jugador,Interfaz"), label. handlers: reorder(the names in their new order, comma-joined).
export function mount(el, inputs, on) {
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const GRIP = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>';
  const names = String(inputs.items || '').split(',').map((s) => s.trim()).filter(Boolean);
  el.innerHTML = `<div class="cx-sortable" aria-label="${esc(inputs.label || 'Orden')}">${names.map((n) => `<div class="cn-item cn-item-variant-outline cn-item-size-sm group/item cx-item" data-slot="item" data-key="${esc(n)}"><span class="cn-button cn-button-variant-ghost cn-button-size-icon-xs cx-grip" role="button" aria-label="Mover ${esc(n)}" data-grip="true">${GRIP}</span><div class="cn-item-content"><span class="cn-item-title">${esc(n)}</span></div></div>`).join('')}<span class="cx-sl-anchor"></span></div>`;
  import('@muten/shadcn/registry/sortable-behavior.js').then((b) => b.mount(el.querySelector('.cx-sl-anchor'), {}, { reorder: (v) => on.reorder?.(v) }));
  return () => {};
}
