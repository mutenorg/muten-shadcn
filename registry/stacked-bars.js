// StackedBars (muten Custom) - bars over time with one or more series stacked in each (appointments + pedidos by month), an
// axis in the page's unit (USD 8K), a bar you can pick (it says so with aria-pressed and sends its id), a note over the
// plot while there is nothing to show, and a skeleton while it loads. The data changes in place: the bars slide to their
// new height, nothing blinks. inputs: rows [{id, label, <key>: number, …}], series [{key, label, tone}], selected,
// unit ("USD", "$" or empty for plain numbers), locale, empty, emptyTitle, busy, readonly, label. on: pick(id).
const NS = 'cx-stb';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const list = (v) => (Array.isArray(v) ? v : []);
const SKELETON = [38, 52, 44, 61, 57, 70, 48, 66, 59, 74, 30, 22];

// a round top for the axis: 4 steps of 1, 2, 2.5 or 5 × a power of ten
const niceTop = (max) => {
  if (max <= 0) return 4;
  const rough = max / 4, mag = Math.pow(10, Math.floor(Math.log10(rough))), norm = rough / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  return step * 4;
};

export function mount(el, inputs, on) {
  let state = { ...inputs }, sel = inputs.selected ?? '', drawn = false;
  const num = (locale) => new Intl.NumberFormat(locale || 'es', { useGrouping: 'always' });   // 1.800, not 1800 (es leaves 4 digits ungrouped)
  // a word unit takes a space (USD 40), a symbol does not ($40)
  const withUnit = (text, unit) => (!unit ? text : /^[A-Za-z]{2,}$/.test(unit) ? `${unit} ${text}` : `${unit}${text}`);
  const fmt = (v, unit, locale) => withUnit(num(locale).format(v), unit);
  const short = (v, unit, locale) => {
    const a = Math.abs(v), r = (x) => num(locale).format(Math.round(x * 10) / 10);
    const s = a >= 1e6 ? r(v / 1e6) + 'M' : a >= 1e3 ? r(v / 1e3) + 'K' : num(locale).format(v);
    return v === 0 ? '0' : withUnit(s, unit);
  };

  const paint = () => {
    const rows = list(state.rows), series = list(state.series), unit = state.unit || '', locale = state.locale || (el.closest('[lang]')?.getAttribute('lang')) || 'en';
    const totals = rows.map((r) => series.reduce((sum, s) => sum + (Number(r[s.key]) || 0), 0));
    const top = niceTop(Math.max(0, ...totals)), busy = !!state.busy, none = !busy && totals.every((t) => t === 0);
    const legend = series.length > 1 ? `<ul class="${NS}-legend">${series.map((s) => `<li data-tone="${esc(s.tone || 'brand')}">${esc(s.label)}</li>`).join('')}</ul>` : '';
    // nothing to measure yet: only the 0 stays on the axis
    const ticks = [4, 3, 2, 1, 0].map((k) => `<span>${busy || (none && k) ? '' : esc(short((top / 4) * k, unit, locale))}</span>`).join('');
    const bars = busy
      ? SKELETON.slice(0, Math.max(rows.length, 7)).map((h) => `<span class="${NS}-bar"><span class="cn-skeleton ${NS}-sk" style="height:${h}%"></span></span>`).join('')
      : rows.map((r, i) => {
        const tip = `${r.label}: ${series.map((s) => `${s.label} ${fmt(Number(r[s.key]) || 0, unit, locale)}`).join(' · ')}`;
        const segs = series.map((s) => { const v = Number(r[s.key]) || 0; return v > 0 ? `<span class="${NS}-seg" data-tone="${esc(s.tone || 'brand')}" style="flex-grow:${v}"></span>` : ''; }).join('');
        return `<button type="button" class="${NS}-bar" data-id="${esc(r.id)}" aria-pressed="${String(r.id) === String(sel)}" aria-label="${esc(tip)}"${totals[i] && !state.readonly ? ` data-name="${esc(tip)}"` : ' disabled'}><span class="${NS}-stack" style="height:${(totals[i] / top) * 100}%">${segs}</span></button>`;
      }).join('');
    const xs = (busy ? SKELETON.slice(0, Math.max(rows.length, 7)).map(() => ({ label: '' })) : rows).map((r) => `<span data-id="${esc(r.id ?? '')}"${String(r.id) === String(sel) ? ' data-on' : ''}>${esc(r.label)}</span>`).join('');
    const n = busy ? Math.max(rows.length, 7) : rows.length;
    el.innerHTML = `${legend}<div class="${NS}-body"><div class="${NS}-y" aria-hidden="true">${ticks}</div><div class="${NS}-plot"><div class="${NS}-grid" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="${NS}-bars" role="group" aria-label="${esc(state.label || '')}" style="--n:${n}"${busy ? ' aria-busy="true"' : ''}>${bars}</div>${none && state.empty ? `<div class="cx-veil-note"><div class="cx-veil-box">${state.emptyTitle ? `<span class="cx-veil-t">${esc(state.emptyTitle)}</span>` : ''}<span class="cx-veil-s">${esc(state.empty)}</span></div></div>` : ''}</div><span></span><div class="${NS}-x" aria-hidden="true" style="--n:${n}">${xs}</div></div>`;
    if (!drawn && !busy && rows.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.querySelectorAll(`.${NS}-stack`).forEach((s, i) => s.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 480, delay: i * 24, easing: 'cubic-bezier(.23, 1, .32, 1)', fill: 'backwards' }));
      drawn = true;
    }
  };

  // only the pressed state moves on a pick: the bars stay where they are
  const mark = () => {
    el.querySelectorAll(`.${NS}-bar[data-id]`).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === String(sel))));
    el.querySelectorAll(`.${NS}-x > span`).forEach((x) => x.toggleAttribute('data-on', x.dataset.id === String(sel)));
  };
  el.addEventListener('click', (e) => {
    const bar = e.target.closest(`.${NS}-bar[data-id]`);
    if (!bar || bar.disabled) return;
    sel = bar.dataset.id; mark(); on?.pick?.(sel);
  });

  paint();
  return (next) => {
    const selChanged = (next.selected ?? '') !== (state.selected ?? '');
    state = { ...next };
    if (selChanged) sel = next.selected ?? '';
    // same rows and series, only the pick moved: no repaint
    const old = el.querySelectorAll(`.${NS}-bar[data-id]`).length;
    paint();
    if (old && !state.busy) mark();
  };
}
