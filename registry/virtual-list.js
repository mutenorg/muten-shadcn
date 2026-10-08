// VirtualList (muten Custom) - only the visible rows exist in the DOM (kit/collections.js virtualList).
export function mount(el, inputs) {
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/collections.js')]).then(([core, c]) => c.virtualList(el, inputs, core));
  return () => {};
}
