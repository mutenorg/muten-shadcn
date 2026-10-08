// Island (muten Custom) - drives the kit's one floating notice (kit/core.js island): each new text morphs it.
export function mount(el, inputs) {
  let core = null, last = '';
  const show = (i) => { if (!core || !i.text || i.text + i.tone === last) return; last = i.text + i.tone; core.island(i.tone || 'info', i.text, Number(i.ms) || 0); };
  import('@muten/shadcn/registry/kit/core.js').then((c) => { core = c; show(inputs); });
  return (next) => show(next);
}
