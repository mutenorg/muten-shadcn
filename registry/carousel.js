// CarouselBehavior (muten Custom) - the kit's carousel behaviour over the slides muten rendered (kit/collections.js).
export function mount(el, inputs) {
  const root = el.closest('.cx-car');
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/collections.js')]).then(([core, c]) => c.carouselBehavior(root, inputs, core));
  return () => {};
}
