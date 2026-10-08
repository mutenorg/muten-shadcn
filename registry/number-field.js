// NumberField (muten Custom) - a number with − and + inside one Nova InputGroup. inputs: value, min, max, step,
// prefix (a short label inside, like «X»), unit (after the number, like «min»), label (accessible name).
// handlers: input(value). Clamps to [min, max]; buttons, arrow keys and the wheel (while focused) step; holding a
// button repeats. The buttons switch off at the ends.
const ICON = { minus: '<path d="M5 12h14"/>', plus: '<path d="M5 12h14"/><path d="M12 5v14"/>' };
const svg = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;
export function mount(el, inputs, on) {
  const num = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
  let min = num(inputs.min, -Infinity), max = num(inputs.max, Infinity), step = num(inputs.step, 1) || 1;
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const btn = (k, name) => `<button type="button" data-slot="button" class="cn-button cn-button-variant-ghost cn-button-size-icon-xs group/button cx-nf-btn" data-step="${k}" aria-label="${name}">${svg(k)}</button>`;
  el.innerHTML = `<div data-slot="input-group" role="group" class="cn-input-group group/input-group cx-nf">
    ${inputs.prefix ? `<div data-slot="input-group-addon" class="cn-input-group-addon cn-input-group-addon-align-inline-start cx-nf-prefix">${esc(inputs.prefix)}</div>` : ''}
    <input data-slot="input-group-control" class="cn-input cn-input-group-input cx-num cx-nf-input" inputmode="decimal" aria-label="${esc(inputs.label || inputs.prefix || 'Número')}" role="spinbutton">
    ${inputs.unit ? `<div data-slot="input-group-addon" class="cn-input-group-addon cn-input-group-addon-align-inline-end cx-nf-unit">${esc(inputs.unit)}</div>` : ''}
    <div data-slot="input-group-addon" class="cn-input-group-addon cn-input-group-addon-align-inline-end cx-nf-steps">${btn('minus', 'Menos')}${btn('plus', 'Más')}</div>
  </div>`;
  const input = el.querySelector('input'), dec = el.querySelector('[data-step="minus"]'), inc = el.querySelector('[data-step="plus"]');
  const clamp = (v) => Math.min(max, Math.max(min, v));
  const decimals = (String(step).split('.')[1] || '').length;
  let value = clamp(num(inputs.value, 0));
  const paint = () => {
    input.value = decimals ? value.toFixed(decimals) : String(value);
    input.setAttribute('aria-valuenow', value);
    if (Number.isFinite(min)) input.setAttribute('aria-valuemin', min); if (Number.isFinite(max)) input.setAttribute('aria-valuemax', max);
    dec.disabled = value <= min; inc.disabled = value >= max;
  };
  const emit = (v) => { const next = clamp(Math.round(v / step) * step); if (next === value) { paint(); return; } value = next; paint(); on.input?.(value); };
  // holding a button repeats, slowly first and then faster
  let hold = 0;
  const press = (d) => { emit(value + d * step); let wait = 380; const again = () => { hold = setTimeout(() => { emit(value + d * step); wait = Math.max(50, wait * 0.7); again(); }, wait); }; again(); };
  const release = () => clearTimeout(hold);
  [[dec, -1], [inc, 1]].forEach(([b, d]) => { b.addEventListener('pointerdown', (e) => { if (e.button > 0) return; e.preventDefault(); press(d); }); b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); emit(value + d * step); } }); });
  addEventListener('pointerup', release); addEventListener('pointercancel', release);
  input.addEventListener('change', () => emit(num(input.value.replace(',', '.'), value)));
  input.addEventListener('keydown', (e) => { const d = { ArrowUp: 1, ArrowDown: -1 }[e.key]; if (d) { e.preventDefault(); emit(value + d * step * (e.shiftKey ? 10 : 1)); } });
  input.addEventListener('wheel', (e) => { if (document.activeElement !== input) return; e.preventDefault(); emit(value + (e.deltaY < 0 ? step : -step)); }, { passive: false });
  paint();
  return (n) => { min = num(n.min, min); max = num(n.max, max); step = num(n.step, step) || step; const v = clamp(num(n.value, value)); if (v !== value) { value = v; paint(); } };
}
