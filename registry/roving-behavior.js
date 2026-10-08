// RovingBehavior (muten Custom) - a radio group's keyboard: arrows move to the next/previous option and pick it,
// Space picks the focused one, and only the chosen option sits in the Tab order. The choice itself is the page's
// state (aria-checked); picking = clicking, so the page's action runs. Same rules as the reference artifact.
export function mount(el) {
  const group = el.parentElement;
  const options = () => [...group.querySelectorAll(':scope > [role="radio"]')];
  const sync = () => { const all = options(); const on = all.find((o) => o.getAttribute('aria-checked') === 'true') || all[0]; all.forEach((o) => { o.tabIndex = o === on ? 0 : -1; }); };
  new MutationObserver(sync).observe(group, { subtree: true, attributes: true, attributeFilter: ['aria-checked'], childList: true });
  group.addEventListener('keydown', (e) => {
    const all = options(), i = all.indexOf(document.activeElement); if (i < 0) return;
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (e.key === ' ') { e.preventDefault(); all[i].click(); }
    if (d) { e.preventDefault(); const next = all[(i + d + all.length) % all.length]; next.focus(); next.click(); }
  });
  sync();
}
