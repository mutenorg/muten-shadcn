// TabsBehavior (muten Custom) - the indicator under the chosen tab slides to the next one (the kit's 260 ms
// transition), and Arrow/Home/End move between tabs and pick them. The chosen tab is the page's state (aria-selected
// or aria-pressed); this only follows it. Same behaviour as the reference artifact's tabs.
export function mount(el) {
  const list = el.parentElement;
  const ind = document.createElement('span'); ind.className = 'cx-tab-ind'; ind.setAttribute('aria-hidden', 'true'); list.prepend(ind);
  const tabs = () => [...list.querySelectorAll(':scope > .cx-tab')];
  const chosen = () => tabs().find((t) => t.getAttribute('aria-selected') === 'true' || t.getAttribute('aria-pressed') === 'true');
  let first = true, lastIdx = -1;
  // once the person switches (never on the first paint), the panels' container learns it and which way they went, so
  // the new panel comes in from that side (kit.css “Tab panels”)
  const mark = (t) => {
    const k = tabs().indexOf(t); const box = list.parentElement;
    if (lastIdx >= 0 && k !== lastIdx && box) { box.setAttribute('data-tabs-moved', ''); box.setAttribute('data-tabs-dir', k < lastIdx ? 'back' : 'forward'); }
    lastIdx = k;
  };
  const place = () => {
    const t = chosen(); if (!t) { ind.style.opacity = '0'; return; }
    mark(t);
    ind.style.opacity = '';
    if (first) ind.style.transition = 'none';
    ind.style.left = t.offsetLeft + 'px'; ind.style.width = t.offsetWidth + 'px';
    // the pill takes the tab's own height, so a large SegmentedControl (52px) is not left with a 28px pill at its top
    if (!list.classList.contains('line')) { ind.style.top = t.offsetTop + 'px'; ind.style.height = t.offsetHeight + 'px'; }
    if (first) { void ind.offsetWidth; ind.style.transition = ''; first = false; }
    tabs().forEach((x) => { x.tabIndex = x === t ? 0 : -1; });
    if (list.scrollWidth > list.clientWidth) t.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  };
  new MutationObserver(place).observe(list, { subtree: true, attributes: true, attributeFilter: ['aria-selected', 'aria-pressed'] });
  new ResizeObserver(place).observe(list);
  list.addEventListener('keydown', (e) => {
    const all = tabs(), i = all.indexOf(document.activeElement); if (i < 0) return;
    const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: all.length - 1 }[e.key]; if (to === undefined) return;
    e.preventDefault(); const t = all[(to + all.length) % all.length]; t.focus(); t.click();
  });
  document.fonts?.ready.then(place); requestAnimationFrame(place);
}
