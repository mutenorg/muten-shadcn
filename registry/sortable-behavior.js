// SortableBehavior (muten Custom) - reorder the Items of a Sortable: pointer (mouse + touch) on the grip, the others
// slide to make room; or focus the grip and use Up/Down. Announces «<title>: posición n de m» and emits the keys in
// their new order. Same feel as the reference artifact's sortable list.
export function mount(el, inputs, on) {
  const sort = el.parentElement;
  const live = document.createElement('span'); live.className = 'cx-sr'; live.setAttribute('aria-live', 'polite'); sort.after(live);
  const items = () => [...sort.querySelectorAll(':scope > .cx-item')];
  sort.querySelectorAll('.cx-grip').forEach((g) => { g.tabIndex = 0; g.title = 'Arrastra para ordenar'; });
  const done = (item) => {
    const all = items(); live.textContent = `${item.querySelector('.cn-item-title')?.textContent || ''}: posición ${all.indexOf(item) + 1} de ${all.length}`;
    on.reorder?.(all.map((x) => x.dataset.key).join(','));
  };
  sort.addEventListener('pointerdown', (e) => {
    const grip = e.target.closest('.cx-grip'); if (!grip) return;
    e.preventDefault();
    const item = grip.closest('.cx-item'), all = items();
    const rects = all.map((x) => x.getBoundingClientRect()), start = e.clientY, from = all.indexOf(item);
    const step = rects[1] ? rects[1].top - rects[0].top : rects[0].height + 8;
    let to = from;
    item.classList.add('lifting'); grip.setPointerCapture(e.pointerId);
    const move = (ev) => {
      const dy = ev.clientY - start; item.style.transform = `translateY(${dy}px)`;
      to = Math.max(0, Math.min(all.length - 1, from + Math.round(dy / step)));
      all.forEach((x, i) => { if (x === item) return; let shift = 0; if (from < to && i > from && i <= to) shift = -step; if (from > to && i < from && i >= to) shift = step; x.style.transform = shift ? `translateY(${shift}px)` : ''; });
    };
    const up = () => {
      grip.removeEventListener('pointermove', move); grip.removeEventListener('pointerup', up); grip.removeEventListener('pointercancel', up);
      all.forEach((x) => { x.style.transition = 'none'; x.style.transform = ''; });
      const ref = all[to]; if (to !== from) sort.insertBefore(item, from < to ? ref.nextSibling : ref);
      item.classList.remove('lifting'); void sort.offsetWidth; all.forEach((x) => { x.style.transition = ''; });
      if (to !== from) done(item);
    };
    grip.addEventListener('pointermove', move); grip.addEventListener('pointerup', up); grip.addEventListener('pointercancel', up);
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
