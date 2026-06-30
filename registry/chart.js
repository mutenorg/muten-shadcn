// Chart host component (muten Custom). inputs: { data } (a list of { label, value }). Renders an SVG bar chart.
// Edit this file for line/area/pie variants; this default is a clean bar chart driven by the page's data.
export function mount(el, inputs, handlers) {
  const NS = 'http://www.w3.org/2000/svg';
  const render = (data) => {
    el.innerHTML = '';
    const items = Array.isArray(data) ? data : [];
    const W = 480, H = 200, pad = 24, gap = 10;
    const max = Math.max(1, ...items.map((d) => Number(d.value) || 0));
    const bw = items.length ? (W - pad * 2 - gap * (items.length - 1)) / items.length : 0;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('class', 'chart-svg');
    items.forEach((d, i) => {
      const v = Number(d.value) || 0;
      const bh = (v / max) * (H - pad * 2);
      const x = pad + i * (bw + gap);
      const y = H - pad - bh;
      const rect = document.createElementNS(NS, 'rect');
      rect.setAttribute('x', x); rect.setAttribute('y', y);
      rect.setAttribute('width', bw); rect.setAttribute('height', bh);
      rect.setAttribute('rx', 4); rect.setAttribute('class', 'chart-bar');
      svg.appendChild(rect);
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', x + bw / 2); t.setAttribute('y', H - pad + 14);
      t.setAttribute('text-anchor', 'middle'); t.setAttribute('class', 'chart-label');
      t.textContent = d.label == null ? '' : String(d.label);
      svg.appendChild(t);
    });
    el.appendChild(svg);
  };
  render(inputs.data);
  return (n) => render(n.data);
}
