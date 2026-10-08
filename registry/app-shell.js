// AppShell (muten Custom) - the kit's app structure (kit/structure.js): Sidebar, page header, detail Sheet and the
// Command (⌘K). inputs: brand, plan, user, email, page, nav, pages, rows, commands, width ("narrow" = a narrow box);
// handlers navigate(page) · open(id) · action(label).
export function mount(el, inputs, on) {
  let shell = null, narrow = inputs.width === "narrow";
  const map = (i) => ({ ...i, brand: { name: i.brand, short: i.short, plan: i.plan }, user: { name: i.user, email: i.email } });
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/structure.js')]).then(([core, s]) => { shell = s.appShell(el, map(inputs), core, on); shell.narrow(narrow); });
  return (next) => { narrow = next.width === "narrow"; shell?.narrow(narrow); };
}
