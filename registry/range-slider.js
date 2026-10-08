// RangeSlider (muten Custom) - two thumbs (lo / hi) on the kit's ScaleSlider; keeps the plugin's lo/hi handlers.
export function mount(el, inputs, on) {
  el.dataset.bubble = inputs.bubble || 'always'; el.dataset.ends = inputs.ends || 'on';   // optional value bubble and end labels (kit.css)
  let update = null;
  const values = (i) => `${i.lo},${i.hi}`;
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/values.js')]).then(([core, v]) => {
    update = v.scaleSlider(el, { ...inputs, values: values(inputs) }, core, { change: (s) => { const [lo, hi] = s.split(',').map(Number); on.lo?.(lo); on.hi?.(hi); } });
  });
  return (next) => update?.({ ...next, values: values(next) });
}
