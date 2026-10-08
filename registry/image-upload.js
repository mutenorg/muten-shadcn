// ImageUpload (muten Custom) - the kit's imageUpload (kit/dates.js).
export function mount(el, inputs, on) {
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/dates.js')]).then(([core, m]) => m.imageUpload(el, inputs, core, on));
  return () => {};
}
