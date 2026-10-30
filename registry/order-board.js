// OrderBoard / OrderCards (muten Custom) - the kit's order Board and card (kit/board.js). inputs: lanes, cards, sizes;
// handlers change(json [{id, lane}]) · action(json {id, action}).
export function mount(el, inputs, on) {
  // the board is painted once (and again when the language changes); new cards after that go through its update, so a
  // live list or a refetch shows on the board in place instead of being ignored
  let current = inputs, board = null, last = JSON.stringify(inputs.cards);
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/board.js')]).then(([core, b]) => core.relang(el, inputs, () => { board = b.orderBoard(el, current, core, on); }));
  return (next) => { const sig = JSON.stringify(next.cards); if (sig === last) return; last = sig; current = next; if (board && board.update) board.update(next); };
}
