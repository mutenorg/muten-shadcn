// CommandBehavior (muten Custom) - the Command's list: as you type it keeps the items whose label (or keywords)
// holds what you wrote, accent-insensitive; a group with nothing left hides, and «empty» shows when nothing matches.
// The arrows move the highlight, Enter picks it, the pointer highlights what it rests on.
export function mount(el) {
  const root = el.parentElement;
  const input = root.querySelector('.cx-command-input input, input');
  const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const items = () => [...root.querySelectorAll('.cx-cmd-item')];
  const visible = () => items().filter((x) => !x.hidden);
  let hl = 0;
  const mark = () => { const v = visible(); hl = Math.max(0, Math.min(hl, v.length - 1)); items().forEach((x) => { const on = x === v[hl]; x.toggleAttribute('data-selected', on); x.setAttribute('aria-selected', on); }); v[hl]?.scrollIntoView({ block: 'nearest' }); if (input) input.setAttribute('aria-activedescendant', v[hl]?.id || ''); };
  const filter = () => {
    const q = fold(input?.value.trim());
    items().forEach((x, i) => { if (!x.id) x.id = `cmd-${Math.random().toString(36).slice(2, 7)}-${i}`; x.hidden = !!q && !fold(`${x.textContent} ${x.dataset.keywords || ''}`).includes(q); });
    root.querySelectorAll('.cx-cmd-group').forEach((g) => { g.hidden = !g.querySelector('.cx-cmd-item:not([hidden])'); });
    root.querySelectorAll('.cx-cmd-sep').forEach((s) => { s.hidden = !!q; });
    const empty = root.querySelector('.cx-command-empty'); if (empty) empty.hidden = visible().length > 0;
    hl = 0; mark();
  };
  input?.setAttribute('role', 'combobox'); input?.setAttribute('aria-expanded', 'true'); input?.setAttribute('autocomplete', 'off');
  input?.addEventListener('input', filter);
  root.addEventListener('keydown', (e) => {
    const v = visible(); if (!v.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); hl = (hl + (e.key === 'ArrowDown' ? 1 : -1) + v.length) % v.length; mark(); }
    if (e.key === 'Enter' && e.target === input) { e.preventDefault(); v[hl]?.click(); }
  });
  root.addEventListener('pointermove', (e) => { const it = e.target.closest('.cx-cmd-item'); if (!it) return; const k = visible().indexOf(it); if (k >= 0 && k !== hl) { hl = k; mark(); } });
  items().forEach((x) => { x.tabIndex = -1; });
  new MutationObserver(() => filter()).observe(root.querySelector('.cx-command-list') || root, { childList: true, subtree: true });
  filter();
  return () => {};
}
