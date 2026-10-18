// SortableBehavior (muten Custom) - reorder the Items of a Sortable, with a GHOST of the row already where it will
// land. Pointer (mouse + touch) on the grip, or focus the grip and use Up/Down. Announces “<title>: position n of m”
// and emits the keys in their new order. Motion on the kit's tokens (kit.css “Sortable”):
//   · the row taken lifts (2 % bigger, a deeper shadow) and follows the pointer, kept within the list
//   · the others slide apart (--t-move) and the ghost (the row's own copy, dashed, its content faded) glides to the
//     slot the row will take, in step with them; rows of different heights are measured, not assumed
//   · on release the row settles exactly onto the ghost (200 ms), the ghost fades, THEN the order is committed with
//     nothing moving, so there is no jump; Escape puts it back where it was
//   · the keyboard moves it with no drag animation (keyboard actions never animate)
export function mount(el, inputs, on) {
  const sort = el.parentElement;
  let I = null; const T = (k, ...a) => (I ? I.t(I.langOf(sort), k, ...a) : a.reduce((x, v, n) => x.replace(`{${n}}`, v), k));
  // the grips' names: “Move <title>” in the list's language (muten cannot interpolate inside aria(label: "…")), said
  // again when a lang changes
  const name = () => sort.querySelectorAll('.cx-grip').forEach((g) => { const it = g.closest('.cx-item'); const title = g.dataset.title || it?.querySelector('.cn-item-title')?.textContent || ''; g.setAttribute('aria-label', T('Move {0}', title)); g.title = T('Drag to reorder'); });
  import('@muten/shadcn/registry/kit/i18n.js').then((m) => { I = m; name(); });
  document.addEventListener('kit:lang', () => { if (sort.isConnected) name(); });
  const live = document.createElement('span'); live.className = 'cx-sr'; live.setAttribute('aria-live', 'polite'); sort.after(live);
  const items = () => [...sort.querySelectorAll(':scope > .cx-item')];
  const settleMs = () => (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--t-move')) > 1 ? 200 : 1);
  sort.querySelectorAll('.cx-grip').forEach((g) => { g.tabIndex = 0; });
  name();
  const done = (item) => {
    const all = items(); live.textContent = T('{0}: position {1} of {2}', item.querySelector('.cn-item-title')?.textContent || '', all.indexOf(item) + 1, all.length);
    on.reorder?.(all.map((x) => x.dataset.key).join(','));
  };

  sort.addEventListener('pointerdown', (e) => {
    const grip = e.target.closest('.cx-grip'); if (!grip || e.button > 0) return;
    e.preventDefault();
    const item = grip.closest('.cx-item'), all = items(), from = all.indexOf(item);
    const tops = all.map((x) => x.offsetTop), heights = all.map((x) => x.offsetHeight);
    const gap = parseFloat(getComputedStyle(sort).rowGap) || 0, h = heights[from], room = h + gap;
    const others = all.filter((x) => x !== item);
    const mids = others.map((x) => x.offsetTop + x.offsetHeight / 2);
    // where the row's top lands when it takes index k among the others
    const topAt = (k) => tops[0] + others.slice(0, k).reduce((sum, x) => sum + x.offsetHeight + gap, 0);
    const startY = e.clientY, minDy = tops[0] - tops[from] - room / 2, maxDy = topAt(others.length) - tops[from] + room / 2;
    let to = from;

    // the ghost: the row's own copy, the same box in the same place, dashed and faded; inert and silent
    const ghost = item.cloneNode(true);
    ghost.classList.add('cx-sort-ghost'); ghost.removeAttribute('data-key'); ghost.setAttribute('aria-hidden', 'true'); ghost.inert = true;
    ghost.style.left = item.offsetLeft + 'px'; ghost.style.width = item.offsetWidth + 'px'; ghost.style.translate = `0 ${tops[from]}px`;
    sort.appendChild(ghost);
    requestAnimationFrame(() => ghost.classList.add('on'));

    item.classList.add('lifting'); document.documentElement.classList.add('cx-sorting');
    grip.setPointerCapture(e.pointerId);
    const place = () => {
      others.forEach((x, k) => { const i = all.indexOf(x); let shift = 0; if (from < to && i > from && i <= to) shift = -room; if (from > to && i < from && i >= to) shift = room; x.style.translate = shift ? `0 ${shift}px` : ''; });
      ghost.style.translate = `0 ${topAt(to)}px`;
    };
    const move = (ev) => {
      const dy = Math.max(minDy, Math.min(maxDy, ev.clientY - startY));
      item.style.translate = `0 ${dy}px`;
      const center = tops[from] + h / 2 + dy;
      const next = mids.filter((m) => m < center).length;
      if (next !== to) { to = next; place(); }
    };
    const finish = (commit) => {
      grip.removeEventListener('pointermove', move); grip.removeEventListener('pointerup', up); grip.removeEventListener('pointercancel', cancel); removeEventListener('keydown', esc, true);
      if (!commit) { to = from; place(); }
      item.classList.remove('lifting'); item.classList.add('settling');
      item.style.translate = `0 ${topAt(to) - tops[from]}px`;
      ghost.classList.remove('on');
      setTimeout(() => {
        all.forEach((x) => { x.style.transition = 'none'; x.style.translate = ''; });
        item.classList.remove('settling'); ghost.remove(); document.documentElement.classList.remove('cx-sorting');
        // right before the row it now precedes, or right after the last one (never past the list's own markers)
        if (to !== from) { if (others[to]) sort.insertBefore(item, others[to]); else others[others.length - 1].after(item); }
        void sort.offsetWidth; all.forEach((x) => { x.style.transition = ''; });
        if (to !== from) done(item);
      }, settleMs());
    };
    const up = () => finish(true);
    const cancel = () => finish(false);
    const esc = (ev) => { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); finish(false); } };
    grip.addEventListener('pointermove', move); grip.addEventListener('pointerup', up); grip.addEventListener('pointercancel', cancel); addEventListener('keydown', esc, true);
  });

  sort.addEventListener('keydown', (e) => {
    const grip = e.target.closest('.cx-grip'); if (!grip || !['ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault(); const item = grip.closest('.cx-item');
    if (e.key === 'ArrowUp' && item.previousElementSibling?.classList.contains('cx-item')) sort.insertBefore(item, item.previousElementSibling);
    else if (e.key === 'ArrowDown' && item.nextElementSibling?.classList.contains('cx-item')) sort.insertBefore(item.nextElementSibling, item);
    else return;
    grip.focus(); done(item);
  });
}
