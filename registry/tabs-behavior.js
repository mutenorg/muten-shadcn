// TabsBehavior (muten Custom) - the indicator under the chosen tab slides to the next one (the kit's 260 ms
// transition), and Arrow/Home/End move between tabs and pick them. The chosen tab is the page's state (aria-selected
// or aria-pressed); this only follows it. Same behaviour as the reference artifact's tabs.
export function mount(el) {
  const list = el.parentElement;
  const ind = document.createElement('span'); ind.className = 'cx-tab-ind'; ind.setAttribute('aria-hidden', 'true'); list.prepend(ind);
  const tabs = () => [...list.querySelectorAll(':scope > .cx-tab')];
  const chosen = () => tabs().find((t) => t.getAttribute('aria-selected') === 'true' || t.getAttribute('aria-pressed') === 'true');
  let first = true;
  const place = () => {
    const t = chosen(); if (!t) { ind.style.opacity = '0'; return; }
    ind.style.opacity = '';
    if (first) ind.style.transition = 'none';
    ind.style.left = t.offsetLeft + 'px'; ind.style.width = t.offsetWidth + 'px';
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
