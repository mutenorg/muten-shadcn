// ResizableBehavior (muten Custom) - drags the handles of a ResizablePanelGroup: each handle resizes the two panels
// beside it (sizes are percentages of the group), never under a panel's min. Keyboard on a focused handle: arrows
// move 5 %, Home / End push to an end. Double-click puts the two panels back to their starting sizes.
export function mount(el) {
  const group = el.parentElement, vertical = () => group.dataset.orientation === 'vertical';
  const panels = () => [...group.children].filter((c) => c.classList.contains('cx-rz-panel'));
  const handles = () => [...group.children].filter((c) => c.classList.contains('cx-rz-handle'));
  const start = new Map();
  const set = (p, v) => { p.style.flex = `${v} 1 0px`; p.dataset.now = String(Math.round(v)); };
  const size = (p) => Number(p.dataset.now ?? p.dataset.size) || 50;
  const min = (p) => Number(p.dataset.min) || 15;
  const init = () => { panels().forEach((p) => { if (!start.has(p)) start.set(p, Number(p.dataset.size) || 50); set(p, size(p)); }); handles().forEach((h) => { h.tabIndex = 0; h.setAttribute('aria-orientation', vertical() ? 'horizontal' : 'vertical'); }); };
  const pair = (h) => [h.previousElementSibling, h.nextElementSibling].map((x) => (x && x.classList.contains('cx-rz-panel') ? x : null));
  const move = (h, delta) => { const [a, b] = pair(h); if (!a || !b) return; const total = size(a) + size(b); const na = Math.min(total - min(b), Math.max(min(a), size(a) + delta)); set(a, na); set(b, total - na); h.setAttribute('aria-valuenow', Math.round(na)); };
  let drag = null;
  group.addEventListener('pointerdown', (e) => {
    const h = e.target.closest('.cx-rz-handle'); if (!h || h.parentElement !== group || e.button > 0) return;
    e.preventDefault(); h.setPointerCapture(e.pointerId); h.dataset.drag = '';
    drag = { h, at: vertical() ? e.clientY : e.clientX, span: vertical() ? group.clientHeight : group.clientWidth, sum: panels().reduce((s, p) => s + size(p), 0) };
  });
  group.addEventListener('pointermove', (e) => {
    if (!drag) return; const at = vertical() ? e.clientY : e.clientX;
    move(drag.h, ((at - drag.at) / drag.span) * drag.sum); drag.at = at;
  });
  const end = () => { if (!drag) return; delete drag.h.dataset.drag; drag = null; };
  group.addEventListener('pointerup', end); group.addEventListener('pointercancel', end);
  group.addEventListener('keydown', (e) => {
    const h = e.target.closest('.cx-rz-handle'); if (!h) return;
    const d = { ArrowLeft: -5, ArrowUp: -5, ArrowRight: 5, ArrowDown: 5, Home: -100, End: 100 }[e.key]; if (d === undefined) return;
    e.preventDefault(); move(h, d);
  });
  group.addEventListener('dblclick', (e) => { const h = e.target.closest('.cx-rz-handle'); if (!h) return; pair(h).forEach((p) => p && set(p, start.get(p))); });
  init();
  new MutationObserver(init).observe(group, { childList: true });
  return () => {};
}
