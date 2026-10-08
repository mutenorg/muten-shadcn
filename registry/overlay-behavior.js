// OverlayBehavior (muten Custom) - opens and closes the floating panel of the part it sits in (kit/overlays.js).
// inputs: kind popover | hover | menu | context | menubar | navmenu. Used by Popover, HoverCard, DropdownMenu,
// ContextMenu, Menubar and NavigationMenu; you never call it yourself.
export function mount(el, inputs) {
  const wrap = el.parentElement, panel = wrap?.querySelector(':scope > .cx-ov-content');
  if (panel) panel.hidden = true;   // closed until the kit takes over (no flash of an open panel)
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/overlays.js')]).then(([core, o]) => {
    o.overlay(el, inputs.kind || 'popover', core);
    // menu items are reached with the arrows, not the Tab key
    wrap.querySelectorAll(':scope > .cx-ov-content [role^="menuitem"]').forEach((m) => { m.tabIndex = -1; });
  });
  return () => {};
}
