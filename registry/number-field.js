// NumberField host (muten Custom). inputs: { value, min, max, step }. handlers: { input(value) }.
// [-] <input type=number> [+] - clamps to [min,max], steps on buttons / arrows / wheel, emits on change.
const ico = (p) => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
export function mount(el, inputs, handlers) {
  const num = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
  let min = num(inputs.min, -Infinity), max = num(inputs.max, Infinity), step = num(inputs.step, 1) || 1;

  const dec = document.createElement('button'); dec.type = 'button'; dec.className = 'number-field-btn'; dec.innerHTML = ico('<path d="M5 12h14"/>'); // lucide minus
  const input = document.createElement('input'); input.type = 'number'; input.className = 'number-field-input';
  const inc = document.createElement('button'); inc.type = 'button'; inc.className = 'number-field-btn'; inc.innerHTML = ico('<path d="M5 12h14"/><path d="M12 5v14"/>'); // lucide plus
  el.appendChild(dec); el.appendChild(input); el.appendChild(inc);
  if (Number.isFinite(min)) input.min = String(min);
  if (Number.isFinite(max)) input.max = String(max);
  input.step = String(step);

  const clamp = (v) => Math.min(max, Math.max(min, v));
  let value = clamp(num(inputs.value, 0));
  input.value = String(value);

  const emit = (v) => { value = clamp(v); input.value = String(value); if (handlers.input) handlers.input(value); };
  dec.addEventListener('click', () => emit(value - step));
  inc.addEventListener('click', () => emit(value + step));
  input.addEventListener('change', () => emit(num(input.value, value)));
  input.addEventListener('wheel', (e) => { if (document.activeElement === input) { e.preventDefault(); emit(value + (e.deltaY < 0 ? step : -step)); } }, { passive: false });

  return (n) => {
    min = num(n.min, min); max = num(n.max, max); step = num(n.step, step) || step;
    value = clamp(num(n.value, value)); input.value = String(value);
  };
}
