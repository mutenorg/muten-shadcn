// MoneyField (muten Custom) - a price with its currency (kit/values.js moneyField).
export function mount(el, inputs, on) {
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/values.js')]).then(([core, v]) => v.moneyField(el, inputs, core, on));
  return () => {};
}
