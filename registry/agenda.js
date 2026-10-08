// Agenda (muten Custom) - the kit's agenda (day columns per person, week, list; drag to move, edge to resize, the
// appointment sheet with its lifecycle, payment, move and cancel), from kit/core.js. Everything is data:
//   resources [{id, name}] · hours [{id, days: [1..6], ranges: [[540, 780], [840, 1140]]}]  (minutes from midnight)
//   events [{id, resource, day, start "HH:MM", dur, title, subtitle, price, tone, steps, actions, at, payment, contact}]
//     day = "yyyy-mm-dd", or a number of days from today (it lands on the next day that person works)
//   blocks [{id, resource | "all", day, start, dur, reason}] · from / to (hours) · slot (minutes)
//   actions [{id, label, icon, primary}] - the toolbar's buttons (default: block and new); «block» and «new» keep their
//   built-in behaviour, any other id fires the action handler with that id
// handlers: create(json {resource, day, start}) · change(json [{id, resource, day, start, dur, status}]) · action(id)
export function mount(el, inputs, on) {
  let latest = inputs;
  import('@muten/shadcn/registry/kit/core.js').then(({ kit, today, addDays }) => {
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const list = (v) => (Array.isArray(v) ? v : []);
    const build = (i) => {
      const hours = Object.fromEntries(list(i.hours).map((h) => [h.id, h]));
      const work = (rid, d) => { const h = hours[rid]; return h && list(h.days).includes(d.getDay()) ? list(h.ranges) : []; };
      const land = (rid, off) => { let o = Number(off); for (let k = 0; k < 14 && !work(rid, addDays(today, o)).length; k++) o++; return addDays(today, o); };
      const dayOf = (rid, d) => (typeof d === 'number' || /^-?\d+$/.test(String(d)) ? land(rid, d) : new Date(String(d) + 'T00:00:00'));
      const events = list(i.events).map((e) => ({ tone: 'ok', at: 0, ...e, day: dayOf(e.resource, e.day) }));
      const blocks = list(i.blocks).map((b) => ({ ...b, day: typeof b.day === 'number' || /^-?\d+$/.test(String(b.day)) ? addDays(today, Number(b.day)) : new Date(String(b.day) + 'T00:00:00') }));
      el.innerHTML = '';
      kit.agenda(el, {
        resources: list(i.resources), events, blocks, availability: work,
        actions: list(i.actions).length ? list(i.actions) : null,
        onAction: (id) => on.action?.(id),
        from: Number(i.from) || 9, to: Number(i.to) || 19, slot: Number(i.slot) || 30,
        onCreate: (x) => on.create?.(JSON.stringify({ resource: x.resource, day: iso(x.day), start: x.start })),
        onChange: (evs) => on.change?.(JSON.stringify(evs.map((e) => ({ id: e.id, resource: e.resource, day: iso(e.day), start: e.start, dur: e.dur, status: e.status || '' })))),
      });
    };
    build(latest);
  });
  return (next) => { latest = next; };
}
