// ListMotion (muten Custom) - the rows of the list it sits in open and close their place (kit.css “List rows”).
//   · a row added after the first paint opens its place and fades in (cx-row-enter)
//   · a row muten removes stays a moment, closing its gap (cx-row-leave), then goes; it is already disposed, so it
//     is only a picture of the row and takes no clicks
//   · a row muten only MOVES (it leaves and comes back in the same update) is not an entrance
// Nothing moves on the first paint, and with reduced motion the kit's tokens make it instant.
export function mount(el) {
  const box = el.parentElement;
  if (!box) return;
  let ready = false;
  requestAnimationFrame(() => requestAnimationFrame(() => { ready = true; }));
  const isRow = (n) => n.nodeType === 1 && n !== el && !n.classList.contains('cx-row-leave');
  const settle = (n, cls) => {
    const done = () => { clearTimeout(t); n.removeEventListener('animationend', end); if (cls === 'cx-row-leave') n.remove(); else n.classList.remove(cls); };
    const end = (e) => { if (e.target === n) done(); };
    n.addEventListener('animationend', end);
    const t = setTimeout(done, 900);   // a safety net if the animation never reports back
  };
  const mo = new MutationObserver((records) => {
    if (!ready) return;
    const removed = new Set(), added = new Set();
    for (const r of records) r.removedNodes.forEach((n) => { if (isRow(n)) removed.add(n); });
    for (const r of records) r.addedNodes.forEach((n) => { if (isRow(n) && !removed.has(n)) added.add(n); });
    const gone = [...removed].filter((n) => n.parentNode !== box);
    // A WHOLE PAGE SWAPPED (a page turned, a filter changed most rows): closing ten rows while ten open would make
    // the list jump in height, so the old ones go at once and the new ones only fade in where they land
    const swap = gone.length > 1 && added.size > 1;
    if (swap) { added.forEach((n) => { n.classList.add('cx-row-swap'); settle(n, 'cx-row-swap'); }); return; }
    for (const r of records) {
      r.addedNodes.forEach((n) => {
        if (!added.has(n)) return;   // a move, not an entrance
        n.classList.add('cx-row-enter'); settle(n, 'cx-row-enter');
      });
      r.removedNodes.forEach((n) => {
        if (!isRow(n) || n.parentNode === box) return;   // moved back in: not leaving
        const ref = r.nextSibling && r.nextSibling.parentNode === box ? r.nextSibling : (r.previousSibling && r.previousSibling.parentNode === box ? r.previousSibling.nextSibling : null);
        n.classList.remove('cx-row-enter'); n.classList.add('cx-row-leave'); n.inert = true;
        box.insertBefore(n, ref);
        n.style.setProperty('--mu-h', n.offsetHeight + 'px');
        settle(n, 'cx-row-leave');
      });
    }
  });
  mo.observe(box, { childList: true });
  // nothing returned: in muten a Custom's returned function is its UPDATER (called with new inputs), not a cleanup
}
