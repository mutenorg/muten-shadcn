// OrderBoard / OrderCards (muten Custom) - the kit's order Board and card (kit/board.js). inputs: lanes, cards, sizes;
// handlers change(json [{id, lane}]) · action(json {id, action}).
export function mount(el, inputs, on) {
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/board.js')]).then(([core, b]) => b.orderBoard(el, inputs, core, on));
  return () => {};
}
