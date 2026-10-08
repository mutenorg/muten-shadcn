// kit/overlays.js - the one behaviour behind every floating piece made of muten parts: Popover, HoverCard,
// DropdownMenu, ContextMenu, Menubar and NavigationMenu. The parts write a wrapper (.cx-ov) holding a trigger
// (.cx-ov-trigger) and a content panel (.cx-ov-content) side by side; this module opens and closes the panel.
//   · the panel rises to the browser's top layer (the popover API), so no overflow or stacking context clips it,
//     and it never leaves its place in the DOM (muten keeps owning and updating it)
//   · it is placed next to its trigger with the kit's place() and flips up when it does not fit below
//   · it closes on a click outside, on Esc (focus goes back to the trigger), on Tab out, and when the page scrolls
//     it follows its trigger
//   · a menu moves with the arrows, Home/End and the first letter; Enter or Space picks; a picked item closes it
//     (a check or radio item stays open, as in shadcn)
// kinds: popover (click) · hover (hover or focus, with a short delay) · menu (click, keyboard menu) ·
//        context (right click or a long press, placed at the pointer) · menubar / navmenu (one open at a time in
//        their bar, hover moves between them once one is open)

const ITEMS = '[role="menuitem"]:not([aria-disabled="true"]), [role="menuitemcheckbox"]:not([aria-disabled="true"]), [role="menuitemradio"]:not([aria-disabled="true"])';
const KEEP_OPEN = '[role="menuitemcheckbox"], [role="menuitemradio"]';
const openBars = new WeakMap();

export function overlay(host, kind, core) {
  const { place, fold } = core;
  const wrap = host.parentElement;
  const trigger = wrap.querySelector(':scope > .cx-ov-trigger');
  const panel = wrap.querySelector(':scope > .cx-ov-content');
  if (!trigger || !panel) return;
  const isMenu = kind === 'menu' || kind === 'context' || kind === 'menubar';
  const bar = kind === 'menubar' || kind === 'navmenu' ? wrap.parentElement : null;
  const button = () => trigger.querySelector('button, a, [tabindex]') || trigger;
  panel.setAttribute('popover', 'manual');
  panel.hidden = false;
  if (isMenu) panel.setAttribute('role', 'menu');
  else if (kind !== 'navmenu') panel.setAttribute('role', 'dialog');
  const btn = button();
  if (kind !== 'context') { btn.setAttribute('aria-haspopup', isMenu ? 'menu' : 'dialog'); btn.setAttribute('aria-expanded', 'false'); }

  let open = false, at = null, hoverTimer = 0;
  const items = () => [...panel.querySelectorAll(ITEMS)].filter((x) => x.offsetParent !== null || panel.matches(':popover-open'));
  const align = () => panel.dataset.align || (kind === 'menubar' || kind === 'navmenu' ? 'start' : 'center');
  const anchor = () => (at ? { getBoundingClientRect: () => ({ left: at.x, right: at.x, top: at.y, bottom: at.y, width: 0, height: 0 }) } : trigger);
  const position = () => { if (open) place(panel, anchor(), at ? 'start' : align(), Number(panel.dataset.gap) || (kind === 'navmenu' ? 8 : 4)); };
  const show = (focusFirst) => {
    if (open) return; open = true;
    if (bar) { const other = openBars.get(bar); if (other && other !== api) other.close(false); openBars.set(bar, api); }
    try { panel.showPopover(); } catch { /* already in the top layer */ }
    panel.removeAttribute('data-closed'); panel.setAttribute('data-open', ''); panel.dataset.state = 'open';
    position();
    if (kind !== 'context') btn.setAttribute('aria-expanded', 'true');
    trigger.dataset.open = '';
    if (isMenu && focusFirst) items()[0]?.focus({ preventScroll: true });
    else if (kind === 'popover') panel.querySelector('input, textarea, button, [tabindex]:not([tabindex="-1"])')?.focus({ preventScroll: true });
  };
  const close = (refocus) => {
    if (!open) return; open = false; at = null;
    if (bar && openBars.get(bar) === api) openBars.delete(bar);
    panel.removeAttribute('data-open'); panel.setAttribute('data-closed', ''); panel.dataset.state = 'closed';
    if (kind !== 'context') btn.setAttribute('aria-expanded', 'false');
    delete trigger.dataset.open;
    const done = () => { if (!open) { try { panel.hidePopover(); } catch { /* not open */ } } };
    requestAnimationFrame(() => { const runs = panel.getAnimations(); if (!runs.length) return done(); Promise.all(runs.map((a) => a.finished.catch(() => {}))).then(done); });
    setTimeout(done, 500);
    if (refocus) btn.focus({ preventScroll: true });
  };
  const api = { close, show, trigger };

  // ── opening ──
  if (kind === 'hover' || kind === 'navmenu') {
    const enter = () => { clearTimeout(hoverTimer); hoverTimer = setTimeout(() => show(false), kind === 'navmenu' && bar && openBars.get(bar) ? 0 : (Number(panel.dataset.delay) || 250)); };
    const leave = () => { clearTimeout(hoverTimer); hoverTimer = setTimeout(() => close(false), 180); };
    [trigger, panel].forEach((x) => { x.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') enter(); }); x.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') leave(); }); });
    trigger.addEventListener('focusin', () => show(false));
    wrap.addEventListener('focusout', (e) => { if (!wrap.contains(e.relatedTarget) && !panel.contains(e.relatedTarget)) close(false); });
  }
  if (kind === 'popover' || kind === 'menu' || kind === 'menubar' || kind === 'navmenu') {
    trigger.addEventListener('click', (e) => { if (kind === 'navmenu' && !panel.childElementCount) return; e.preventDefault(); if (open) close(false); else show(e.detail === 0); });
    trigger.addEventListener('keydown', (e) => { if (isMenu && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(true); } });
  }
  if (kind === 'menubar') {
    trigger.addEventListener('pointerenter', () => { const other = openBars.get(bar); if (other && other !== api) { show(false); } });
  }
  if (kind === 'context') {
    trigger.addEventListener('contextmenu', (e) => { e.preventDefault(); close(false); at = { x: e.clientX, y: e.clientY }; open = false; show(true); });
    let press = 0;
    trigger.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch') return; press = setTimeout(() => { at = { x: e.clientX, y: e.clientY }; show(true); navigator.vibrate?.(8); }, 500); });
    ['pointerup', 'pointercancel', 'pointermove'].forEach((t) => trigger.addEventListener(t, () => clearTimeout(press)));
    trigger.addEventListener('keydown', (e) => { if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) { e.preventDefault(); const r = trigger.getBoundingClientRect(); at = { x: r.left + 12, y: r.top + 12 }; show(true); } });
  }

  // ── closing and following ──
  document.addEventListener('pointerdown', (e) => { if (open && !panel.contains(e.target) && !trigger.contains(e.target)) close(false); }, true);
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); return; }
    if (e.key === 'Tab' && isMenu) { close(false); return; }
    if (!isMenu) return;
    const list = items(), k = list.indexOf(document.activeElement);
    const to = { ArrowDown: k + 1, ArrowUp: k - 1, Home: 0, End: list.length - 1 }[e.key];
    if (to !== undefined) { e.preventDefault(); list[(to + list.length) % list.length]?.focus(); return; }
    if (bar && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      e.preventDefault(); const menus = [...bar.querySelectorAll(':scope > .cx-ov')]; const i = menus.indexOf(wrap);
      const next = menus[(i + (e.key === 'ArrowRight' ? 1 : -1) + menus.length) % menus.length];
      close(false); next.querySelector(':scope > .cx-ov-trigger button')?.click(); return;
    }
    if (e.key === 'Enter' || e.key === ' ') { if (document.activeElement && list.includes(document.activeElement)) { e.preventDefault(); document.activeElement.click(); } return; }
    if (e.key.length === 1 && /\S/.test(e.key)) { const ch = fold(e.key); [...list.slice(k + 1), ...list.slice(0, k + 1)].find((m) => fold(m.textContent.trim()).startsWith(ch))?.focus(); }
  });
  trigger.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { e.preventDefault(); close(true); } });
  if (isMenu) {
    panel.addEventListener('pointermove', (e) => { const m = e.target.closest(ITEMS); if (m && document.activeElement !== m) m.focus({ preventScroll: true }); });
    panel.addEventListener('click', (e) => { const m = e.target.closest(ITEMS); if (m && !m.matches(KEEP_OPEN)) close(true); });
  } else {
    panel.addEventListener('click', (e) => { if (e.target.closest('[data-ovclose]')) close(true); });
  }
  addEventListener('scroll', position, { passive: true, capture: true });
  addEventListener('resize', position);
  return api;
}
