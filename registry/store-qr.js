// StoreQr (muten Custom) - the kit's storeQr (kit/menus.js).
export function mount(el, inputs, on) {
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/menus.js')]).then(([core, m]) => m.storeQr(el, inputs, core, on));
  return () => {};
}
