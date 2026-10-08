// KitWidget (muten Custom) - one host for the system kit's widgets (kit/core.js): it loads the core once and renders
// the widget named by `name` with the page's data. The kit's functions (a bot's answers, a filter, a reply) arrive
// as DATA (rules, ids), never as code. Each widget has its own part (Messaging, Chatbot, BarChart, …); use those.
export function mount(el, inputs, on) {
  const list = (v) => (Array.isArray(v) ? v : []);
  const rx = (s) => { try { return new RegExp(s, 'i'); } catch { return /$^/; } };
  const RENDER = {
    messaging: ({ kit, ui }, i) => {
      const map = (xs) => Object.fromEntries(list(xs).map((x) => [x.id, x]));
      const buttons = (xs) => list(xs).map((b) => ui.button({ label: b.label, variant: b.variant || 'outline', size: 'xs', attrs: `data-kw-act="${b.id || b.label}"` })).join('');
      const conversations = list(i.conversations).map((c) => ({ ...c, messages: list(c.messages).map((m) => (m.event ? { ...m, event: { ...m.event, actions: Array.isArray(m.event.actions) ? buttons(m.event.actions) : m.event.actions || '' } } : m)) }));
      const replies = list(i.replies);
      kit.messaging(el, {
        title: i.title || 'Mensajes', channels: map(i.channels), conversations,
        filters: list(i.filters).map((f) => ({ id: f.id, label: f.label, match: f.state ? (c) => c.state === f.state : () => true })),
        states: map(i.states), control: map(i.controls),
        quick: list(i.quick).map((q) => ({ ...q, card: () => `${ui.text(q.title || q.label, 'label')}${q.subtitle ? ui.text(q.subtitle, 'caption') : ''}` })),
        profile: (c) => c.client, templates: list(i.templates).map((t) => [t.title, t.body]),
        reply: (c, text) => (replies.find((r) => r.match && rx(r.match).test(text || '')) || replies.find((r) => !r.match))?.text || null,
      });
      el.addEventListener('click', (e) => { const b = e.target.closest('[data-kw-act]'); if (b) on.action?.(b.dataset.kwAct); });
    },
    chatbot: ({ kit, ui }, i) => {
      const answers = list(i.answers);
      kit.chatbot(el, { name: i.title || 'Asistente', greeting: i.greeting || '', suggestions: list(i.suggestions).map((s) => s.text ?? s),
        respond: (t) => { const a = answers.find((x) => x.match && rx(x.match).test(t)) || answers.find((x) => !x.match) || { text: '' }; return { text: a.text, actions: a.action ? ui.button({ label: a.action, variant: a.primary ? 'default' : 'outline', size: 'xs', attrs: `data-kw-act="${a.action}"` }) : '' }; } });
      if (!el.__kwBound) { el.__kwBound = true; el.addEventListener('click', (e) => { const b = e.target.closest('[data-kw-act]'); if (b) on.action?.(b.dataset.kwAct); }); }
    },
    barChart: ({ kit, money0, today, addDays, DAY, MON }, i) => {
      // a period is {label, days, values}: the labels are the last `days` days up to today
      const periods = list(i.periods).map((p) => { const n = list(p.values).length; return [p.label, list(p.values).map((v, k) => { const d = addDays(today, k - n + 1); return [n > 14 ? `${d.getDate()} ${MON[d.getMonth()].slice(0, 3)}` : `${DAY[d.getDay()]} ${d.getDate()}`, v]; })]; });
      kit.barChart(el, { title: i.title || '', data: periods[0]?.[1] || [], fmt: i.money === 'on' ? money0 : (v) => v, periods });
    },
    checklist: ({ kit }, i) => { kit.checklist(el, { title: i.title || '', steps: list(i.steps) }); el.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b && !b.disabled && b.closest('[data-slot="item"], .cn-item')) on.action?.(b.textContent.trim()); }); },
    plans: ({ kit }, i) => kit.plans(el, { yearlyNote: i.note || '', plans: list(i.plans) }),
    cardField: ({ kit }) => kit.cardField(el, { onSubmit: (x) => on.action?.(JSON.stringify(x || {})) }),
    memberList: ({ kit }, i) => kit.memberList(el, { members: list(i.members), roles: list(i.roles), ownerRole: i.owner || '', noun: [i.one || 'persona', i.many || 'personas'], invite: { cta: i.cta || 'Invitar', title: i.cta || 'Invitar', description: i.note || '' } }),
    permissionMatrix: ({ kit }, i) => kit.permissionMatrix(el, { roles: list(i.roles).map((r) => r.name ?? r), rows: list(i.rows), lockedRole: i.locked || '', onChange: (rows) => on.action?.(JSON.stringify(rows)) }),
    stampCard: ({ kit }, i) => kit.stampCard(el, { store: i.store || '', owner: i.owner || '', total: Number(i.total) || 10, stamps: Number(i.stamps) || 0, reward: i.reward || '' }),
    bell: ({ kit }, i) => kit.bell(el, { items: list(i.items) }),
    queue: ({ kit }, i) => kit.queue(el, { title: i.title || '', people: list(i.people), offerMinutes: Number(i.minutes) || 10 }),
    password: ({ kit }, i) => kit.password(el, { label: i.label || 'Contraseña' }),
    // days: {name, open, ranges [["09:00","13:00"]]}. Inside a form with a DirtyBar, «Descartar» brings the hours back.
    weeklyHours: ({ kit }, i) => {
      const wh = kit.weeklyHours(el, { days: list(i.days).map((d) => ({ name: d.name, open: !!d.open, ranges: list(d.ranges).map((r) => [...r]) })) });
      let saved = wh.value(); const form = el.closest('.cx-set-form');
      form?.addEventListener('discard', () => wh.set(saved)); form?.addEventListener('kit-saved', () => { saved = wh.value(); });
      el.addEventListener('input', () => on.action?.(JSON.stringify(wh.value())));
    },
  };
  RENDER.table = (core, i) => import('@muten/shadcn/registry/kit/table.js').then(({ dataTable }) => dataTable(el, { columns: i.columns, rows: i.rows, filters: i.filters, statuses: i.statuses, noun: [i.one || 'fila', i.many || 'filas'], bulk: i.bulk }, core, on));
  // until the kit arrives the host keeps its final size with a shimmer (kit.css, :empty), then the widget fades in
  el.classList.add('cx-kw-wait');
  import('@muten/shadcn/registry/kit/core.js').then((core) => {
    const render = RENDER[inputs.name]; if (!render) return;
    render(core, inputs); el.classList.remove('cx-kw-wait');
    el.animate([{ opacity: 0.001 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
    play(core, render);
  });
  // demo "on": the widget plays itself for a landing page - it presses its own control in turn (a stamp, a suggestion)
  // and starts over when it runs out; the first touch hands it to the person. Still under reduced motion.
  const DEMO = { stampCard: { target: '[data-stamp]', every: 1100, steps: () => (Number(inputs.total) || 10) - (Number(inputs.stamps) || 0) + 1 },
                 chatbot: { target: '[data-sug]', every: 5200, steps: () => list(inputs.suggestions).length } };
  function play(core, render) {
    const d = DEMO[inputs.name];
    if (!d || inputs.demo !== 'on' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer = 0, done = 0, stopped = false;
    const tick = () => {
      if (stopped) return;
      const open = [...el.querySelectorAll(d.target)].filter((b) => !b.disabled);
      if (!open.length || done >= d.steps()) { done = 0; timer = setTimeout(() => { if (stopped) return; el.innerHTML = ''; render(core, inputs); timer = setTimeout(tick, d.every); }, d.every * 1.6); return; }
      open[0].click(); done++;
      timer = setTimeout(tick, d.every);
    };
    el.addEventListener('pointerdown', () => { stopped = true; clearTimeout(timer); }, { once: true, capture: true });
    timer = setTimeout(tick, d.every);
  }
  return () => {};
}
