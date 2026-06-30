// ColorPicker host (muten Custom). inputs: { value } (hex). handlers: { input(hex) }.
// A swatch button opens a popover with a saturation/value square + a hue slider + a hex field.
export function mount(el, inputs, handlers) {
  const swatch = document.createElement('button'); swatch.type = 'button'; swatch.className = 'color-swatch';
  const dot = document.createElement('span'); dot.className = 'color-swatch-dot';
  const txt = document.createElement('span'); swatch.appendChild(dot); swatch.appendChild(txt);
  const pop = document.createElement('div'); pop.className = 'color-popover';
  const sv = document.createElement('div'); sv.className = 'color-sv';
  const svc = document.createElement('div'); svc.className = 'color-sv-cursor'; sv.appendChild(svc);
  const hue = document.createElement('div'); hue.className = 'color-hue';
  const huec = document.createElement('div'); huec.className = 'color-hue-cursor'; hue.appendChild(huec);
  const hex = document.createElement('input'); hex.className = 'color-hex'; hex.maxLength = 7;
  pop.appendChild(sv); pop.appendChild(hue); pop.appendChild(hex);
  el.appendChild(swatch); el.appendChild(pop);

  let h = 0, s = 100, v = 100;
  const hsv2rgb = (h, s, v) => { s /= 100; v /= 100; const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c; let r, g, b; if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0]; else if (h < 180) [r, g, b] = [0, c, x]; else if (h < 240) [r, g, b] = [0, x, c]; else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x]; return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]; };
  const toHex = (r, g, b) => '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
  const fromHex = (str) => { const m = /^#?([0-9a-f]{6})$/i.exec(String(str || '')); if (!m) return null; const n = parseInt(m[1], 16); const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let hh = 0; if (d) { if (mx === r) hh = ((g - b) / d) % 6; else if (mx === g) hh = (b - r) / d + 2; else hh = (r - g) / d + 4; hh *= 60; if (hh < 0) hh += 360; } return [hh, mx ? d / mx * 100 : 0, mx * 100]; };
  const curHex = () => toHex.apply(null, hsv2rgb(h, s, v));

  const paint = () => {
    const [r, g, b] = hsv2rgb(h, 100, 100);
    sv.style.background = 'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, rgb(' + r + ',' + g + ',' + b + '))';
    svc.style.left = s + '%'; svc.style.top = (100 - v) + '%';
    huec.style.left = (h / 360 * 100) + '%';
    const hx = curHex(); dot.style.background = hx; txt.textContent = hx; hex.value = hx;
  };
  const emit = () => { paint(); if (handlers.input) handlers.input(curHex()); };

  const init = fromHex(inputs.value || '#3b82f6'); if (init) [h, s, v] = init;
  paint();

  let open = false;
  const show = () => { pop.classList.add('color-popover-open'); open = true; };
  const hide = () => { pop.classList.remove('color-popover-open'); open = false; };
  swatch.addEventListener('click', (e) => { e.stopPropagation(); open ? hide() : show(); });
  pop.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => { if (open) hide(); });

  const svPick = (e) => { const r = sv.getBoundingClientRect(); if (!r.width) return; s = Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100)); v = Math.min(100, Math.max(0, (1 - (e.clientY - r.top) / r.height) * 100)); emit(); };
  let svDrag = false; sv.addEventListener('pointerdown', (e) => { svDrag = true; sv.setPointerCapture(e.pointerId); svPick(e); }); sv.addEventListener('pointermove', (e) => { if (svDrag) svPick(e); }); sv.addEventListener('pointerup', () => svDrag = false);
  const huePick = (e) => { const r = hue.getBoundingClientRect(); if (!r.width) return; h = Math.min(360, Math.max(0, (e.clientX - r.left) / r.width * 360)); emit(); };
  let hueDrag = false; hue.addEventListener('pointerdown', (e) => { hueDrag = true; hue.setPointerCapture(e.pointerId); huePick(e); }); hue.addEventListener('pointermove', (e) => { if (hueDrag) huePick(e); }); hue.addEventListener('pointerup', () => hueDrag = false);
  hex.addEventListener('change', () => { const r = fromHex(hex.value); if (r) { [h, s, v] = r; emit(); } });

  return (n) => { const r = fromHex(n.value); if (r) { [h, s, v] = r; paint(); } };
}
