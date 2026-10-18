// Agenda / AgendaLive (muten Custom) - the kit's agenda (kit/core.js): day columns per person, week, list; drag to move,
// edge to resize. Everything is data:
//   resources [{id, name, photo, kind, capacity, group}] - each one is an AGENDA: kind "business" (the shop's own, shown
//     first), "person" (a worker, the default) or any other (a room: say its `group`, “Rooms”). capacity = how many appointments
//     it holds at once: 1 (default, never overlap) · 3 (a class of three) · 0 (no limit). overlap "never" | "allow"
//     overrides every capacity. Citas that break one (the server sent them crossed) say “Se cruza”.
//   resources [{id, name, photo}] · hours [{id, days: [1..6], ranges: [[540, 780], [840, 1140]]}]  (minutes from midnight);
//     a person can have several entries, one per group of days, when the days do not share one schedule
//   events [{id, resource, with: [ids], day, start "HH:MM", dur, title, subtitle, price, status, tint, ink, tone, steps, actions, at, payment, contact}]
//     day = "yyyy-mm-dd", or a number of days from today (it lands on the next day that person works)
//     with = the other agendas the appointment also takes (the room it uses, a second worker): checked and shown in each
//     status = awaiting_payment | confirmed | started | done | noshow | cancelled · tint/ink = the service's colours
//   blocks [{id, resource | "all", day, start, dur, reason}] · from / to (hours) · slot (minutes) · view: day | week | list
//   free [{resource, day, start, end}] - the server's free hours; when sent they are the only free hours shown
//   queue [{day, name, photo}] - who waits for a free hour that day · closed ["yyyy-mm-dd"] - days the shop is shut
//     (blocks, queue and closed take a number of days from today too)
//   lang es | en · currency (ISO, e.g. "USD") + locale · cents "yes" (prices in cents) · sheet "app" · drag "off"
//   loading "yes" (the calendar's shape in grey until the data arrives) · start "yyyy-mm-dd" (the day it opens on)
//   actions [{id, label, icon, primary}] - the toolbar's buttons (default: block and new); any other id fires `action`
//   phone "nav" - on a phone the actions and the arrows leave the agenda's toolbar: the app's phone bar carries them and
//     sends them back through `command`: "new", "block", "prev", "next", "today", "view:list", or an action id. The
//     agenda runs a command when its value changes, so repeat one with a suffix after # ("new#1", "new#2"…)
//   hour12 "yes" - times written 3:00 PM (the data stays "HH:MM") · timeZone "America/Bogota" - today and now are the shop's
//   fit "yes" - the hours share the height the app gives the agenda (give it one: a flex parent), never under 56px
//   phoneStrip "dots" - the phone's week strip marks each day with a dot per appointment in its service's colour (default: the count)
//   phoneView "list" - a phone opens on the list until a view is picked · blockScope "all" - blocks are for the whole
//     business (no “Para” picker: a backend with no per-person blocks)
//   events also take tags ["At home", "Arrived 10:02"] (words next to the time) and photo (the client's face, in the list)
//   resources also take role (read under the name), hideEmpty (the column shows only on days it has appointments) and
//     bookable false (an agenda that only holds appointments, “Unassigned”: never offered as free)
//   resize "off" - a appointment's length is not dragged (a backend that only moves day and time) · moveAcross "off" - a
//     dragged appointment stays in its own agenda (only its time, and its day in the week view, change)
//   placing [{resource, day, start, dur, title, tint}] - while the app's “new appointment” sheet is open, where it will land
//   create "sheet" - a showcase: “new” and a tap on a free hour open a short built-in form and the appointment lands at once
// handlers: create(json {resource, day, start}) · open(json event) · block(json {resource, day, start, dur, reason})
//   move(json {id, resource, day, start, dur}) · range(json {from, to, view}: view is day | week | list | range) · change(json [...]) · action(id)
//   ranges "yes" - the month under the title also offers “Several days” (a range listed day by day); off by default
// The title opens a month (floating; a sheet on a phone) to jump to a day.
// LIVE: new inputs repaint the same agenda (same day, view and person): an app sends its data again and it shows;
//   lang, currency, locale and cents change live too.
export function mount(el, inputs, on) {
  let api = null, map = null, pending = null, lastCmd = String(inputs.command || '');   // the command it was born with never runs
  // an app sends its inputs again on every change of its own, often the same data: repaint only when something drawn
  // changed (`start` only places the first paint, `command` runs apart)
  const SKIP = new Set(['command', 'start']);
  const sigOf = (i) => JSON.stringify(Object.keys(i).filter((k) => !SKIP.has(k)).sort().map((k) => [k, i[k]]));
  let lastSig = sigOf(inputs);
  import('@muten/shadcn/registry/kit/core.js').then(({ kit, today, addDays, langOf }) => {
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const list = (v) => (Array.isArray(v) ? v : []);
    const at = (s) => new Date(String(s) + 'T00:00:00');
    const yes = (v) => v === true || v === 'yes' || v === 'true';
    const data = (i) => {
      // a person can have several entries, one per group of days (Monday 9 to 18, Saturday 9 to 13): the first that names the day wins
      const hours = list(i.hours);
      const work = (rid, d) => { const h = hours.find((x) => x.id === rid && list(x.days).includes(d.getDay())); return h ? list(h.ranges) : []; };
      const land = (rid, off) => { let o = Number(off); for (let k = 0; k < 14 && !work(rid, addDays(today, o)).length; k++) o++; return addDays(today, o); };
      const plain = (d) => (typeof d === 'number' || /^-?\d+$/.test(String(d)) ? addDays(today, Number(d)) : at(d));
      const dayOf = (rid, d) => (typeof d === 'number' || /^-?\d+$/.test(String(d)) ? land(rid, d) : at(d));
      const free = Array.isArray(i.free) && i.free.length ? i.free.map((f) => ({ ...f, day: dayOf(f.resource, f.day) })) : null;
      return {
        resources: list(i.resources), availability: work, free,
        events: list(i.events).map((e) => ({ tone: 'ok', at: 0, ...e, day: dayOf(e.resource, e.day) })),
        blocks: list(i.blocks).map((b) => ({ ...b, day: plain(b.day) })),
        queue: list(i.queue).map((q) => ({ ...q, day: plain(q.day) })), closed: list(i.closed).map(plain), loading: yes(i.loading),
        placing: (() => { const g = list(i.placing)[0]; return g && g.start ? { ...g, day: dayOf(g.resource, g.day) } : null; })(),
        from: Number(i.from) || 9, to: Number(i.to) || 19,
        // the language passed (Storio passes it), else the page's (the nearest lang), English by default
        lang: i.lang === 'en' || i.lang === 'es' ? i.lang : (langOf(el) === 'es' ? 'es' : 'en'), overlap: ['never', 'allow'].includes(i.overlap) ? i.overlap : 'auto', currency: i.currency || '', locale: i.locale || '', cents: yes(i.cents),
      };
    };
    map = data;
    const send = (name, value) => on[name]?.(typeof value === 'string' ? value : JSON.stringify(value));
    const day1 = (x) => ({ ...x, day: x.day instanceof Date ? iso(x.day) : x.day });
    el.innerHTML = '';
    api = kit.agenda(el, {
      ...data(inputs),
      actions: list(inputs.actions).length ? list(inputs.actions) : null,
      from: Number(inputs.from) || 9, to: Number(inputs.to) || 19, slot: Number(inputs.slot) || 30, view: inputs.view || 'day',
      createSheet: inputs.create === 'sheet', services: list(inputs.services),
      sheet: inputs.sheet === 'app' ? 'app' : 'built-in', drag: inputs.drag !== 'off', start: inputs.start ? at(inputs.start) : null, phone: inputs.phone === 'nav' ? 'nav' : '', fit: yes(inputs.fit), ranges: yes(inputs.ranges),
      resize: inputs.resize === 'off' ? 'off' : 'on', moveAcross: inputs.moveAcross === 'off' ? 'off' : 'on', hour12: yes(inputs.hour12), timeZone: inputs.timeZone || '', phoneStrip: inputs.phoneStrip === 'dots' ? 'dots' : '', phoneView: ['list', 'day'].includes(inputs.phoneView) ? inputs.phoneView : '', blockScope: inputs.blockScope === 'all' ? 'all' : 'each',
      onAction: (id) => send('action', id),
      onCreate: (x) => send('create', day1(x)),
      onOpen: on.open ? (e) => send('open', day1({ id: e.id, resource: e.resource, day: e.day, start: e.start, dur: e.dur, status: e.status || '' })) : null,
      onBlock: on.block ? (b) => send('block', day1(b)) : null,
      onMove: (m) => send('move', day1(m)),
      onRange: (r) => send('range', { from: iso(r.from), to: iso(r.to), view: r.view }),
      onChange: (evs) => send('change', evs.map((e) => ({ id: e.id, resource: e.resource, day: iso(e.day), start: e.start, dur: e.dur, status: e.status || '' }))),
    });
    if (pending) { const sig = sigOf(pending); if (sig !== lastSig) { lastSig = sig; api.update(data(pending)); } pending = null; }
    // with no lang of its own it follows the page's: switched live when a lang changes
    document.addEventListener('kit:lang', () => { if (el.isConnected && inputs.lang !== 'en' && inputs.lang !== 'es') api.update({ lang: langOf(el) === 'es' ? 'es' : 'en' }); });
  });
  const command = (next) => { const c = String(next.command || ''); if (c === lastCmd) return; lastCmd = c; if (c) api.run(c.split('#')[0]); };
  return (next) => { inputs = next; if (!api || !map) { pending = next; return; } const sig = sigOf(next); if (sig !== lastSig) { lastSig = sig; api.update(map(next)); } command(next); };
}
