// ModalBehavior (muten Custom) - the behaviour of the adaptive modal; the markup, open/close and the animation are
// the Modal part's (muten state + kit.css). This only does what markup cannot: history (Back closes), Esc, the focus
// trap, the scroll lock, the auto mode (dialog on a wide screen, drawer on a phone) and the drawer's drag to close.
// Same rules as the reference artifact's modal.
export function mount(el, inputs, on) {
  const mdl = el.closest('.cx-modal'), root = mdl.parentElement, ov = root.querySelector(':scope > .cx-overlay');
  const body = mdl.querySelector(':scope > .cx-modal-body');
  const phone = matchMedia('(max-width: 640px)');
  const auto = mdl.dataset.mode === 'auto';
  // the auto mode is resolved NOW (and again when the width crosses the phone line while closed), never at the moment
  // of opening: a dialog that only learns it is a dialog as it opens animates its centring from the corner
  const resolve = () => { if (auto && !isOpen) mdl.dataset.mode = phone.matches ? 'drawer' : 'dialog'; };
  let isOpen = false, pushed = false, lastFocus = null;
  queueMicrotask(() => resolve()); phone.addEventListener('change', resolve);
  // the footer sticks under the scrolling body, not inside it
  const placeFooter = () => { const f = body.querySelector('.cx-modal-foot'); if (f) mdl.appendChild(f); };
  const focusables = () => [...mdl.querySelectorAll('button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
  const close = () => on.close?.();
  // ANCHORED: a card beside what was tapped ("x,y,w,h" in the viewport): on its right when it fits, else its left, and
  // kept on screen; it grows from that side. No anchor (or a phone) makes it the dialog.
  let anchor = String(inputs.anchor || '');
  // `want` is the mode the page asked for; `mode` is what it is now (an anchor with nothing to hold on to is a dialog)
  const wantsAnchor = () => mdl.dataset.want === 'anchor';
  const place = () => {
    const at = anchor.split(',').map(Number);
    if (!wantsAnchor() || phone.matches || at.length !== 4 || at.some((n) => !Number.isFinite(n))) { if (wantsAnchor()) mdl.dataset.mode = phone.matches ? 'drawer' : 'dialog'; return; }
    mdl.dataset.mode = 'anchor';
    const [x, y, w] = at, gap = 12, edge = 16;
    const width = mdl.offsetWidth, height = Math.min(mdl.scrollHeight, innerHeight - edge * 2);
    const right = x + w + gap + width <= innerWidth - edge;
    const left = right ? x + w + gap : Math.max(edge, x - gap - width);
    const top = Math.min(Math.max(edge, y - 24), innerHeight - height - edge);
    mdl.style.left = `${left}px`; mdl.style.top = `${top}px`;
    mdl.style.transformOrigin = `${right ? 'left' : 'right'} ${Math.max(0, y - top + 12)}px`;
  };
  const open = () => {
    if (isOpen) return; isOpen = true; placeFooter();
    if (auto) mdl.dataset.mode = phone.matches ? 'drawer' : 'dialog';
    if (wantsAnchor()) place();
    lastFocus = document.activeElement;
    document.documentElement.classList.add('cx-locked');
    // on the phone, focusing a field would throw the keyboard over the sheet: focus the sheet itself
    requestAnimationFrame(() => { ((mdl.dataset.mode === 'dialog' && focusables().find((x) => x.matches('input, textarea'))) || mdl).focus({ preventScroll: true }); });
    history.pushState({ cxModal: 1 }, ''); pushed = true;
  };
  const shut = () => {
    if (!isOpen) return; isOpen = false;
    mdl.style.transform = ''; if (ov) ov.style.opacity = '';
    document.documentElement.classList.remove('cx-locked');
    lastFocus?.focus?.({ preventScroll: true });
    if (pushed) { pushed = false; history.back(); }
  };
  mdl.tabIndex = -1;
  // A link inside (a menu in a drawer): close first, then go. Closing undoes the history entry the modal pushed, and
  // doing that after the link's own navigation would take the person straight back to where they were.
  mdl.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || !isOpen || !pushed || a.target || e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.getAttribute('href'), location.href); if (url.origin !== location.origin) return;
    e.preventDefault(); e.stopPropagation();
    const go = () => { removeEventListener('popstate', go); history.pushState({ muDepth: (history.state?.muDepth ?? 0) + 1 }, '', url.pathname + url.search + url.hash); dispatchEvent(new PopStateEvent('popstate')); };
    pushed = false; addEventListener('popstate', go);
    close(); history.back();
  }, true);
  addEventListener('popstate', () => { if (isOpen) { pushed = false; close(); } });
  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Tab') { const f = focusables(); if (!f.length) return; const first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
  });
  // drawer: drag the handle or the header down; closes past 30 % or on a flick, rubber-bands upward
  let drag = null;
  mdl.addEventListener('pointerdown', (e) => { if (mdl.dataset.mode !== 'drawer' || !e.target.closest('.cx-handle, [data-drag]')) return; drag = { y: e.clientY, t: performance.now(), dy: 0, live: false, id: e.pointerId }; });
  addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dy = e.clientY - drag.y; if (!drag.live && Math.abs(dy) < 5) return;
    if (!drag.live) { drag.live = true; mdl.classList.add('dragging'); ov?.classList.add('dragging'); }
    drag.dy = dy; mdl.style.transform = `translateY(${dy > 0 ? dy : -Math.sqrt(-dy) * 2}px)`;
    if (ov) ov.style.opacity = String(Math.max(0, 1 - Math.max(0, dy) / mdl.offsetHeight));
  });
  const endDrag = () => { if (!drag) return; const d = drag; drag = null; if (!d.live) return; mdl.classList.remove('dragging'); ov?.classList.remove('dragging'); const v = d.dy / (performance.now() - d.t); if (d.dy > mdl.offsetHeight * 0.3 || v > 0.5) close(); else { mdl.style.transform = ''; if (ov) ov.style.opacity = ''; } };
  addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);

  // a finger can also pull the sheet down from ANYWHERE in it while its content sits at the top, like the phone's own
  // sheets: the body pans vertically (touch-action: pan-y), so this listens to touch events and takes the gesture
  // (preventDefault) only once it is a pull down with nothing above to scroll back to
  let pull = null;
  const scrollerOf = (el) => { for (let x = el; x && x !== mdl; x = x.parentElement) { if (x.scrollHeight > x.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(x).overflowY)) return x; } return null; };
  mdl.addEventListener('touchstart', (e) => {
    if (mdl.dataset.mode !== 'drawer' || e.touches.length !== 1 || drag) return;
    if (e.target.closest('input, textarea, select, [contenteditable="true"], [role="slider"], .cx-wheel, .cx-slider')) return;
    const t = e.touches[0]; pull = { y: t.clientY, x: t.clientX, t: performance.now(), dy: 0, live: false, sc: scrollerOf(e.target) };
  }, { passive: true });
  mdl.addEventListener('touchmove', (e) => {
    if (!pull) return;
    const t = e.touches[0], dy = t.clientY - pull.y, dx = t.clientX - pull.x;
    if (!pull.live) {
      if (Math.abs(dy) < 6 && Math.abs(dx) < 6) return;
      if (dy < 0 || Math.abs(dx) > Math.abs(dy) || (pull.sc && pull.sc.scrollTop > 0)) { pull = null; return; }
      pull.live = true; mdl.classList.add('dragging'); ov?.classList.add('dragging');
    }
    e.preventDefault(); pull.dy = dy; mdl.style.transform = `translateY(${dy}px)`;
    if (ov) ov.style.opacity = String(Math.max(0, 1 - dy / mdl.offsetHeight));
  }, { passive: false });
  const endPull = () => { if (!pull) return; const d = pull; pull = null; if (!d.live) return; mdl.classList.remove('dragging'); ov?.classList.remove('dragging'); const v = d.dy / (performance.now() - d.t); if (d.dy > mdl.offsetHeight * 0.3 || v > 0.5) close(); else { mdl.style.transform = ''; if (ov) ov.style.opacity = ''; } };
  mdl.addEventListener('touchend', endPull); mdl.addEventListener('touchcancel', endPull);
  if (inputs.open === true || inputs.open === 'true') open();
  // the card follows the window, and its own height when a step inside changes it (it only moves when it would leave
  // the screen: the top stays by the cita while there is room below)
  addEventListener('resize', () => { if (isOpen && wantsAnchor()) place(); });
  new ResizeObserver(() => { if (isOpen && mdl.dataset.mode === 'anchor') place(); }).observe(body);
  return (next) => { anchor = String(next.anchor || ''); (next.open === true || next.open === 'true') ? open() : shut(); };
}
