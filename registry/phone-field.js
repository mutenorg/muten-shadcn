// PhoneField (muten Custom) - a phone with its country (kit/values.js phoneField).
export function mount(el, inputs, on) {
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/values.js')]).then(([core, v]) => v.phoneField(el, inputs, core, on));
  return () => {};
}
