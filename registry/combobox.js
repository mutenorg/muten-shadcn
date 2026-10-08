// Combobox (muten Custom) - the kit's combobox (kit/menus.js).
export function mount(el, inputs, on) {
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/menus.js')]).then(([core, m]) => m.combobox(el, inputs, core, on));
  return () => {};
}
