// Calendar (muten Custom) - the kit's month grid (one or two months, a day or a range), from kit/core.js.
// inputs: selected  "yyyy-mm-dd" · "from/to" · or relative to today: "today", "0", "-6/0" (days from today)
//         mode "single" | "range" · months 1 | 2 · min "today" | "yyyy-mm-dd"
//         presets "reports" → Today · Last 7 days · This month · Last month beside a range
//         caption "on" → the sentence under it (“You picked Thursday, October 8” / “From Oct 2 to Oct 8 · 7 days”)
// lang (optional) es | en, else the nearest lang. handlers: select("yyyy-mm-dd" | "from/to"). Same component as the reference artifact's Calendar.
export function mount(el, inputs, on) {
  let cal = null;
  import('@muten/shadcn/registry/kit/core.js').then((core) => core.relang(el, inputs, () => {
    const { kit, ui, today, addDays, t, langOf } = core;
    // the language: the one passed, else the nearest lang (the page's), English by default; repainted when it changes
    const lang = inputs.lang || langOf(el), w = kit.words(lang), es = lang === 'es';
    const fmtDay = (d) => (es ? `${d.getDate()} ${w.mon[d.getMonth()].slice(0, 3)}` : `${w.mon[d.getMonth()].slice(0, 3)} ${d.getDate()}`);
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const one = (s) => { const t = String(s).trim(); if (t === 'today') return new Date(today); if (/^-?\d+$/.test(t)) return addDays(today, Number(t)); const d = new Date(t + 'T00:00:00'); return Number.isNaN(d.getTime()) ? null : d; };
    const mode = inputs.mode === 'range' ? 'range' : 'single';
    const decode = (v) => { const s = String(v ?? ''); if (!s) return null; if (mode === 'range') { const [a, b] = s.split('/').map(one); return a ? [a, b || a] : null; } return one(s); };
    const sayOne = (d) => (d ? (es ? t(lang, 'You picked {0}, {1}', w.dayL[d.getDay()].toLowerCase(), `${d.getDate()} de ${w.mon[d.getMonth()]}`) : t(lang, 'You picked {0}, {1}', w.dayL[d.getDay()], `${w.mon[d.getMonth()]} ${d.getDate()}`)) : '');
    const sayRange = (r) => (r?.[0] && r?.[1] ? t(lang, 'From {0} to {1} · {2} days', fmtDay(r[0]), fmtDay(r[1]), Math.round((r[1] - r[0]) / 864e5) + 1) : r?.[0] ? t(lang, 'From {0}: pick the last day', fmtDay(r[0])) : '');
    const say = (v) => (mode === 'range' ? sayRange(v) : sayOne(v));
    const PRESETS = [[t(lang, 'Today'), () => [today, today]], [t(lang, 'Last 7 days'), () => [addDays(today, -6), today]], [t(lang, 'This month'), () => [new Date(today.getFullYear(), today.getMonth(), 1), today]], [t(lang, 'Last month'), () => [new Date(today.getFullYear(), today.getMonth() - 1, 1), new Date(today.getFullYear(), today.getMonth(), 0)]]];
    const withPresets = mode === 'range' && inputs.presets === 'reports';
    el.innerHTML = `${withPresets ? `<div class="cx-range-wrap"><div class="cx-vstack cx-range-presets" style="width:auto;gap:2px">${PRESETS.map(([l], i) => ui.button({ label: l, variant: 'ghost', size: 'sm', cls: 'cx-left', attrs: `data-preset="${i}" aria-pressed="${i === 1}"` })).join('')}</div><div data-cal></div></div>` : '<div data-cal></div>'}${inputs.caption === 'on' ? '<span class="cx-text" data-variant="caption" data-out></span>' : ''}`;
    const out = el.querySelector('[data-out]');
    const value = decode(inputs.selected);
    const emit = (v) => on.select?.(Array.isArray(v) ? (v[0] ? `${iso(v[0])}/${iso(v[1] || v[0])}` : '') : v ? iso(v) : '');
    cal = kit.calendar(el.querySelector('[data-cal]'), { ...kit.calWords(lang), mode, months: Number(inputs.months) === 2 ? 2 : 1, value, min: inputs.min ? one(inputs.min) : null,
      onChange: (v) => { if (out) out.textContent = say(v); el.querySelectorAll('[data-preset]').forEach((b) => b.setAttribute('aria-pressed', 'false')); emit(v); } });
    if (out) out.textContent = say(value);
    // on the presets' own box (made again on a repaint), so a repaint never stacks a second listener
    el.querySelector('.cx-range-presets')?.addEventListener('click', (e) => { const b = e.target.closest('[data-preset]'); if (!b) return; const r = PRESETS[+b.dataset.preset][1](); cal.set(r); if (out) out.textContent = sayRange(r); el.querySelectorAll('[data-preset]').forEach((x) => x.setAttribute('aria-pressed', x === b)); emit(r); });
  }));
  return () => {};
}
