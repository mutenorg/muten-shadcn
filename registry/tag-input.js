// TagInput (muten Custom) - the kit's tags field (kit/collections.js tagInput): chips in/out, height eases, a cap.
export function mount(el, inputs, on) {
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/collections.js')]).then(([core, c]) => c.tagInput(el, { ...inputs, tags: inputs.value ?? inputs.tags }, core, on));
  return () => {};
}
