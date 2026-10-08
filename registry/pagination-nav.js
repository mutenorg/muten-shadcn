// PaginationNav (muten Custom) - server pages' nav (kit/collections.js paginationNav): 7 fixed slots, range line.
export function mount(el, inputs, on) {
  let update = null;
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/collections.js')]).then(([core, c]) => { update = c.paginationNav(el, inputs, core, on); });
  return (next) => update?.(next);
}
