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
  const open = () => {
    if (isOpen) return; isOpen = true; placeFooter();
    if (auto) mdl.dataset.mode = phone.matches ? 'drawer' : 'dialog';
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
  if (inputs.open === true || inputs.open === 'true') open();
  return (next) => { (next.open === true || next.open === 'true') ? open() : shut(); };
}
