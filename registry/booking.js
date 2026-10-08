// Booking (muten Custom) - the kit's booking picker (kit/structure.js): week strip and hours in one piece.
// inputs: week [{days, hours}], taken [{day, hours}], wait, cta; handler select("yyyy-mm-dd HH:MM").
export function mount(el, inputs, on) {
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/structure.js')]).then(([core, s]) => s.booking(el, inputs, core, on));
  return () => {};
}
