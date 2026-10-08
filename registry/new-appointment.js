// NewAppointment (muten Custom) - the kit's 4-step «Nueva cita» (kit/structure.js) in the adaptive modal. It opens
// when `open` turns true; closing it in any way fires close, creating fires create(json {client, service, day, hour}).
export function mount(el, inputs, on) {
  let wiz = null, was = false;
  const sync = (open) => { if (open && !was) wiz?.start(); was = !!open; };
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/structure.js')]).then(([core, s]) => { wiz = s.wizard(core, inputs, on); was = false; sync(inputs.open); });
  return (next) => sync(next.open);
}
