// DateField (muten Custom) - the kit's dateField (kit/dates.js).
export function mount(el, inputs, on) {
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/dates.js')]).then(([core, m]) => m.dateField(el, inputs, core, on));
  return () => {};
}
