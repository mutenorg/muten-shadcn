// KitSkeleton (muten Custom) - the kit's skeletons (kit.sk in kit/core.js): the shape of the content, built from the
// same atoms and layout classes as the real thing. inputs: kind (list · item · stat · stats · card · products ·
// bubbles · table · messaging · agenda), count, media (avatar · icon · none).
export function mount(el, inputs) {
  const n = Number(inputs.count) || 4;
  const KINDS = {
    list: (sk) => `<div class="cn-item-group">${sk.list(n, { media: inputs.media || 'avatar', aside: 44 })}</div>`,
    item: (sk) => sk.item({ media: inputs.media || 'avatar' }),
    stat: (sk) => sk.stat(),
    stats: (sk) => `<div class="cx-stats">${Array.from({ length: n }, sk.stat).join('')}</div>`,
    card: (sk) => sk.card({ media: 140, lines: 2 }),
    products: (sk) => sk.products(n),
    bubbles: (sk) => `<div class="cx-sk-chatbox">${sk.bubbles(n)}</div>`,
    table: (sk) => sk.table(n),
    messaging: (sk) => `<div class="cx-mx">${sk.messaging()}</div>`,
    agenda: (sk) => sk.agenda({ columns: 3 }),
  };
  import('@muten/shadcn/registry/kit/core.js').then(({ kit }) => {
    el.innerHTML = `<span class="cx-sr">Cargando…</span>${(KINDS[inputs.kind] || KINDS.list)(kit.sk)}`;
    // the inbox lays itself out by its own width, like the real one
    const mx = el.querySelector('.cx-mx'); if (mx) { mx.dataset.view = 'list'; kit.watchWidth(mx, [[720, 'narrow'], [1060, 'mid']], 'wide'); }
  });
  return () => {};
}
