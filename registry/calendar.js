// Calendar host (muten Custom). Variants via inputs:
//   mode: "single" | "range" | "multiple"   months: 1 | 2   caption: "label" | "dropdown"
// `selected` encodes the value: single -> "yyyy-mm-dd"; range -> "from/to"; multiple -> "d1,d2,...".
// handlers: { select(encoded) }.
export function mount(el, inputs, handlers) {
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const parse = (s) => { const d = new Date(s + 'T00:00:00'); return isNaN(d.getTime()) ? null : d; };
  const same = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const num = (d) => d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();

  const mode = inputs.mode || 'single';
  const months = Math.min(2, Math.max(1, Number(inputs.months) || 1));
  const dropdown = inputs.caption === 'dropdown';
  const today = new Date();

  let selected = [];
  const readSelected = (val) => {
    selected = [];
    const s = String(val || '');
    if (!s) return;
    const parts = mode === 'range' ? s.split('/') : mode === 'multiple' ? s.split(',') : [s];
    for (const p of parts) { const d = parse(p); if (d) selected.push(d); }
  };
  readSelected(inputs.selected);
  const anchor = selected[0] || today;
  let vy = anchor.getFullYear();
  let vm = anchor.getMonth();

  const emit = () => {
    const out = mode === 'range' ? selected.map(iso).join('/') : mode === 'multiple' ? selected.map(iso).join(',') : (selected[0] ? iso(selected[0]) : '');
    if (handlers.select) handlers.select(out);
  };
  const isSel = (d) => selected.some((s) => same(s, d));
  const inRange = (d) => { if (mode !== 'range' || selected.length < 2) return false; const x = num(d), a = num(selected[0]), b = num(selected[1]); return x > Math.min(a, b) && x < Math.max(a, b); };
  const pick = (d) => {
    if (mode === 'single') selected = [d];
    else if (mode === 'multiple') { const i = selected.findIndex((s) => same(s, d)); if (i >= 0) selected.splice(i, 1); else selected.push(d); }
    else { if (selected.length !== 1) selected = [d]; else { const a = selected[0]; selected = num(d) < num(a) ? [d, a] : [a, d]; } }
    render(); emit();
  };

  const monthGrid = (y, m) => {
    const wrap = document.createElement('div'); wrap.className = 'calendar-month';
    const cap = document.createElement('div'); cap.className = 'calendar-caption';
    if (dropdown) {
      const ms = document.createElement('select'); ms.className = 'calendar-select';
      MONTHS.forEach((name, i) => { const o = document.createElement('option'); o.value = String(i); o.textContent = name; if (i === m) o.selected = true; ms.appendChild(o); });
      ms.addEventListener('change', () => { vm = Number(ms.value); render(); });
      const ys = document.createElement('select'); ys.className = 'calendar-select';
      for (let yy = y - 10; yy <= y + 10; yy++) { const o = document.createElement('option'); o.value = String(yy); o.textContent = String(yy); if (yy === y) o.selected = true; ys.appendChild(o); }
      ys.addEventListener('change', () => { vy = Number(ys.value); render(); });
      cap.appendChild(ms); cap.appendChild(ys);
    } else {
      const l = document.createElement('div'); l.className = 'calendar-label'; l.textContent = MONTHS[m] + ' ' + y; cap.appendChild(l);
    }
    wrap.appendChild(cap);

    const grid = document.createElement('div'); grid.className = 'calendar-grid';
    for (const d of DOW) { const c = document.createElement('div'); c.className = 'calendar-dow'; c.textContent = d; grid.appendChild(c); }
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    for (let i = 0; i < first; i++) grid.appendChild(document.createElement('div'));
    for (let day = 1; day <= days; day++) {
      const d = new Date(y, m, day);
      const cell = document.createElement('button'); cell.type = 'button'; cell.className = 'calendar-day'; cell.textContent = String(day);
      if (isSel(d)) cell.classList.add('calendar-day-selected');
      else if (inRange(d)) cell.classList.add('calendar-day-range');
      else if (same(d, today)) cell.classList.add('calendar-day-today');
      cell.addEventListener('click', () => pick(d));
      grid.appendChild(cell);
    }
    wrap.appendChild(grid);
    return wrap;
  };

  function render() {
    el.innerHTML = '';
    const prev = document.createElement('button'); prev.type = 'button'; prev.className = 'calendar-nav-prev'; prev.textContent = '‹';
    const next = document.createElement('button'); next.type = 'button'; next.className = 'calendar-nav-next'; next.textContent = '›';
    prev.addEventListener('click', () => { vm--; if (vm < 0) { vm = 11; vy--; } render(); });
    next.addEventListener('click', () => { vm++; if (vm > 11) { vm = 0; vy++; } render(); });
    el.appendChild(prev); el.appendChild(next);
    const wrap = document.createElement('div'); wrap.className = 'calendar-months';
    for (let i = 0; i < months; i++) { let yy = vy, mm = vm + i; while (mm > 11) { mm -= 12; yy++; } wrap.appendChild(monthGrid(yy, mm)); }
    el.appendChild(wrap);
  }

  render();
  return (n) => { readSelected(n.selected); render(); };
}
