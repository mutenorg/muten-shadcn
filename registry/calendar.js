// Calendar (muten Custom) - the kit's month grid (one or two months, a day or a range), from kit/core.js.
// inputs: selected  "yyyy-mm-dd" · "from/to" · or relative to today: "today", "0", "-6/0" (days from today)
//         mode "single" | "range" · months 1 | 2 · min "today" | "yyyy-mm-dd"
//         presets "reports" → Hoy · Últimos 7 días · Este mes · Mes pasado beside a range
//         caption "on" → the sentence under it («Elegiste el jueves 8 de octubre» / «Del 2 oct al 8 oct · 7 días»)
// handlers: select("yyyy-mm-dd" | "from/to"). Same component as the reference artifact's Calendar.
export function mount(el, inputs, on) {
  let cal = null;
  import('@muten/shadcn/registry/kit/core.js').then(({ kit, ui, today, addDays, DAYLONG, MON, fmtDay }) => {
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const one = (s) => { const t = String(s).trim(); if (t === 'today') return new Date(today); if (/^-?\d+$/.test(t)) return addDays(today, Number(t)); const d = new Date(t + 'T00:00:00'); return Number.isNaN(d.getTime()) ? null : d; };
    const mode = inputs.mode === 'range' ? 'range' : 'single';
    const decode = (v) => { const s = String(v ?? ''); if (!s) return null; if (mode === 'range') { const [a, b] = s.split('/').map(one); return a ? [a, b || a] : null; } return one(s); };
    const sayOne = (d) => (d ? `Elegiste el ${DAYLONG[d.getDay()].toLowerCase()} ${d.getDate()} de ${MON[d.getMonth()]}` : '');
    const sayRange = (r) => (r?.[0] && r?.[1] ? `Del ${fmtDay(r[0])} al ${fmtDay(r[1])} · ${Math.round((r[1] - r[0]) / 864e5) + 1} días` : r?.[0] ? `Desde el ${fmtDay(r[0])}: elige el último día` : '');
    const say = (v) => (mode === 'range' ? sayRange(v) : sayOne(v));
    const PRESETS = [['Hoy', () => [today, today]], ['Últimos 7 días', () => [addDays(today, -6), today]], ['Este mes', () => [new Date(today.getFullYear(), today.getMonth(), 1), today]], ['Mes pasado', () => [new Date(today.getFullYear(), today.getMonth() - 1, 1), new Date(today.getFullYear(), today.getMonth(), 0)]]];
    const withPresets = mode === 'range' && inputs.presets === 'reports';
    el.innerHTML = `${withPresets ? `<div class="cx-range-wrap"><div class="cx-vstack cx-range-presets" style="width:auto;gap:2px">${PRESETS.map(([l], i) => ui.button({ label: l, variant: 'ghost', size: 'sm', cls: 'cx-left', attrs: `data-preset="${i}" aria-pressed="${i === 1}"` })).join('')}</div><div data-cal></div></div>` : '<div data-cal></div>'}${inputs.caption === 'on' ? '<span class="cx-text" data-variant="caption" data-out></span>' : ''}`;
    const out = el.querySelector('[data-out]');
    const value = decode(inputs.selected);
    const emit = (v) => on.select?.(Array.isArray(v) ? (v[0] ? `${iso(v[0])}/${iso(v[1] || v[0])}` : '') : v ? iso(v) : '');
    cal = kit.calendar(el.querySelector('[data-cal]'), { mode, months: Number(inputs.months) === 2 ? 2 : 1, value, min: inputs.min ? one(inputs.min) : null,
      onChange: (v) => { if (out) out.textContent = say(v); el.querySelectorAll('[data-preset]').forEach((b) => b.setAttribute('aria-pressed', 'false')); emit(v); } });
    if (out) out.textContent = say(value);
    el.addEventListener('click', (e) => { const b = e.target.closest('[data-preset]'); if (!b) return; const r = PRESETS[+b.dataset.preset][1](); cal.set(r); if (out) out.textContent = sayRange(r); el.querySelectorAll('[data-preset]').forEach((x) => x.setAttribute('aria-pressed', x === b)); emit(r); });
  });
  return () => {};
}
