// ScaleSlider (muten Custom) - the kit's slider with the value riding on the thumb (kit/values.js).
export function mount(el, inputs, on) {
  el.dataset.bubble = inputs.bubble || 'always'; el.dataset.ends = inputs.ends || 'on';   // optional value bubble and end labels (kit.css)
  let update = null;
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/values.js')]).then(([core, v]) => { update = v.scaleSlider(el, inputs, core, on); });
  return (next) => update?.(next);
}
