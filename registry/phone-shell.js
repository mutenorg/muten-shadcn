// PhoneShell (muten Custom) - the kit's phone frame (kit/structure.js): big title that shrinks on scroll, back and two
// actions, three fixed bottom tabs with a count. tabs [{label, icon, badge}], rows [{tab, section, title, subtitle,
// value}]; handler select(label).
export function mount(el, inputs, on) {
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/structure.js')]).then(([core, s]) => s.phoneShell(el, inputs, core, on));
  return () => {};
}
