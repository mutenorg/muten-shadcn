// Spark (muten Custom) - a tiny line for a series, the kit's sparkline. inputs: series "3,5,4,6", tone ok|bad|info|wait.
// Same drawing as the artifact's kit.stat: 100x28 viewBox, stretched, a 2px non-scaling stroke in the tone's color.
export function mount(el, inputs) {
  const TONE = { ok: 'success', bad: 'destructive', info: 'info', wait: 'warning' };
  const draw = (series, tone) => {
    const values = String(series || '').split(',').map(Number).filter((v) => !Number.isNaN(v));
    if (values.length < 2) { el.innerHTML = ''; return; }
    const max = Math.max(...values), min = Math.min(...values), w = 100, h = 28;
    const points = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`).join(' ');
    el.innerHTML = `<svg class="cx-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${points}" fill="none" stroke="var(--${TONE[tone] || 'success'})" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
  };
  draw(inputs.series, inputs.tone);
  return (next) => draw(next.series, next.tone);
}
