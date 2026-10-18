// VirtualWindow (muten Custom) - only the rows on screen exist, in a list muten draws (see virtual-window.muten).
// It sits FIRST in the list. It watches where the list is inside the thing that scrolls (an `overflow: auto` parent, or
// the page) and says which rows to draw ("from,to"); it stands in for the rows above with its own height and pads the
// list below for the rows after, so the scrollbar keeps the whole length. Row heights may differ: it learns the real
// average from the rows on screen. Plain DOM, no kit.
export function mount(el, inputs, on) {
  let count = Math.max(0, Number(inputs.count) || 0), guess = Number(inputs.item) || 72, over = Math.max(0, Number(inputs.over ?? 6));
  // -1: the first range is always said, even “0,0” (nothing on screen yet), or the page keeps its own default
  let from = -1, to = -1, step = 0, raf = 0, list = null, scroller = null, basePad = 0, wired = false;
  // the real height (plus gap, screen px) of every row already drawn, by its place in the list. Rows of very different
  // heights (a group of 2 next to one of 50) no longer move the scrollbar as they come and go: a row seen once keeps its
  // own height, and only rows never drawn use the average. A row is what muten marks as one (title + carousel too)
  let sizes = [];
  el.setAttribute('aria-hidden', 'true');

  // the list's gap, read once per pass (getComputedStyle forces the page's styles; it ran several times per scroll frame)
  let gapNow = -1;
  const gapOf = () => { if (gapNow < 0) gapNow = parseFloat(getComputedStyle(list).rowGap) || 0; return gapNow; };
  // the rows muten drew after the marker (anything else the app puts in the list is left alone)
  const rows = () => { const out = []; for (let n = el.nextElementSibling; n; n = n.nextElementSibling) out.push(n); return out; };
  // THE ROWS AS ROWS. Every row of a muten `each` sits between two markers (<!--row--> … <!--/row-->), and a row may be
  // several elements: a store's group is its title AND its carousel. Measured by element, a two-piece row never had its
  // own height learnt (only the average), so a group leaving above the screen left a gap of the wrong size behind and
  // the page jumped under the finger (CLS 3.8 scrolling a 28-group store). A row is measured from its first piece to its
  // last; an element outside any markers is a row of its own.
  const rowParts = () => {
    const out = []; let cur = null;
    for (let n = el.nextSibling; n; n = n.nextSibling) {
      if (n.nodeType === 8) { if (n.data === 'row') cur = []; else if (n.data === '/row' && cur) { out.push(cur); cur = null; } continue; }
      if (n.nodeType === 1) { if (cur) cur.push(n); else out.push([n]); }
    }
    return out;
  };
  // the real height of one row plus its gap, from the rows on screen; the guess until there are some
  const learn = () => {
    const r = rows(); const gap = gapOf() * scale();
    // rows of very different heights (a group of 2 next to one of 12) would make the length jump at each draw: the
    // measure moves the average a little each time instead of replacing it
    // per ROW asked for, not per element: a row may be several elements (a title and its carousel), or none (empty)
    const n = to > from ? to - from : r.length;
    if (r.length && n > 0) { const a = r[0].getBoundingClientRect(), b = r[r.length - 1].getBoundingClientRect(); const span = b.bottom - a.top; if (span > 0) { const seen = (span + gap) / n; step = step ? step * 0.7 + seen * 0.3 : seen; } }
    if (!step) step = (guess + gapOf()) * scale();
    const parts = rowParts();
    if (to > from && parts.length === to - from) {
      for (let i = 0; i < parts.length; i++) {
        const shown = parts[i].filter((n) => n.getClientRects().length);
        // a row with nothing shown (an empty group) takes no room and no gap: it is 0, not “unknown”
        if (!shown.length) { sizes[from + i] = 0; continue; }
        const h = shown[shown.length - 1].getBoundingClientRect().bottom - shown[0].getBoundingClientRect().top;
        if (h > 0) sizes[from + i] = h + gap;
      }
    }
  };
  // where row i starts, from the top of row 0 (screen px): the measured rows, the average for the rest
  const size = (j) => (sizes[j] === undefined ? step : sizes[j]);
  const offset = (i) => { let y = 0; for (let j = 0; j < i; j++) y += size(j); return y; };
  // the row at a distance from the top of row 0
  const indexAt = (y) => { let acc = 0; for (let j = 0; j < count; j++) { const h = size(j); if (acc + h > y) return j; acc += h; } return count; };
  // what is on screen: the scroller's box, never past the window (a scroller taller than the screen grew with the rows)
  const view = () => { if (scroller) { const b = scroller.getBoundingClientRect(); return [Math.max(0, b.top), Math.min(innerHeight, b.bottom)]; } return [0, innerHeight]; };
  // a list inside a scaled box (a phone preview drawn at 80 %): what is measured comes in screen px, what is set goes in
  // CSS px. Every measure stays in screen px; heights are divided by the scale when they are written
  const scale = () => { const h = list.offsetHeight; const r = list.getBoundingClientRect().height; return h > 0 && r > 0 ? r / h : 1; };
  const place = () => {
    const gap = gapOf(), k = scale();
    // the marker is the rows above; flex adds one gap after it, so it gives that gap back (and leaves when it is empty)
    if (from > 0) { el.style.display = 'block'; el.style.height = `${Math.max(0, offset(from) / k - gap)}px`; } else { el.style.display = 'none'; el.style.height = '0px'; }
    list.style.paddingBottom = `${basePad + Math.max(0, (offset(count) - offset(to)) / k)}px`;
  };
  const compute = () => {
    raf = 0; if (!list) return;
    gapNow = -1;
    // a list that is not on the page right now (a hidden panel, a closed tab: no box at all) keeps the rows it has. Its
    // scroller measures 0 × 0, which read as “scrolled to the end” and drew EVERY row into a panel nobody could see
    if (!list.getClientRects().length || (scroller && !scroller.clientHeight)) return;
    learn();
    const [top, bottom] = view();
    // where row 0 starts: the marker's top while it shows, else the first row's (or the list's content box)
    const start = from > 0 ? el.getBoundingClientRect().top : (el.nextElementSibling || list).getBoundingClientRect().top;
    const a = indexAt(top - start) - over, b = indexAt(bottom - start) + 1 + over;
    let nf = Math.max(0, Math.min(count, a)), nt = Math.max(nf, Math.min(count, b));
    // the estimate is an average: check it against the rows really drawn. Blank space showing below the last row (or
    // above the first) means more rows belong there; and at either end of the scroll the list always reaches its end
    const r = rows();
    if (r.length && from >= 0 && to > from) {
      const firstTop = r[0].getBoundingClientRect().top, lastBottom = r[r.length - 1].getBoundingClientRect().bottom;
      if (to < count && lastBottom < bottom) nt = Math.min(count, Math.max(nt, to + Math.ceil((bottom - lastBottom) / step) + 1));
      if (from > 0 && firstTop > top) nf = Math.max(0, Math.min(nf, from - Math.ceil((firstTop - top) / step) - 1));
    }
    const box = scroller || document.scrollingElement;
    if (box && box.scrollTop + box.clientHeight >= box.scrollHeight - 2) nt = count;
    if (box && box.scrollTop <= 2 && start >= top) nf = 0;
    nt = Math.max(nf, nt);
    if (nf === from && nt === to) return;
    from = nf; to = nt; place(); el.dataset.range = `${from},${to}/${count}`;
    on.range?.(`${from},${to}`);
  };
  const soon = () => { if (!raf) raf = requestAnimationFrame(compute); };
  const wire = () => {
    list = el.parentElement; if (!list || wired) return; wired = true;
    for (let n = list.parentElement; n && n !== document.body && n !== document.documentElement; n = n.parentElement) { const o = getComputedStyle(n).overflowY; if (o === 'auto' || o === 'scroll') { scroller = n; break; } }
    basePad = parseFloat(getComputedStyle(list).paddingBottom) || 0;
    // the browser must not “hold” a row in place while rows above it come and go: that fights the window
    list.style.overflowAnchor = 'none';
    // and a flex parent must not shrink the list to fit: its length IS the scrollbar's (the space for the rows not drawn)
    list.style.flexShrink = '0';
    (scroller || window).addEventListener('scroll', soon, { passive: true });
    (scroller || window).addEventListener('scrollend', soon, { passive: true });
    addEventListener('resize', soon, { passive: true });
    new ResizeObserver(soon).observe(list);
    soon();
  };
  // muten mounts the Custom before it is in the page: wait for the list around it
  requestAnimationFrame(wire);
  return (next) => {
    const c = Math.max(0, Number(next.count) || 0), g = Number(next.item) || guess, o = Math.max(0, Number(next.over ?? over));
    if (c === count && g === guess && o === over) return;
    count = c; guess = g; over = o; from = -1; to = -1; sizes = [];   // force a fresh range (a filter changed the list: other rows, other heights)
    if (list) soon(); else requestAnimationFrame(wire);
  };
}
