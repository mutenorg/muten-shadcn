// @muten/shadcn · DataTable (kit). The reference artifact's DataTable, made generic: columns, rows, filters, statuses
// and bulk actions are data. Everything else is the artifact's: filters from their type (search · facet · date ·
// range) with counts, chips that leave with a fade, rows that fade out / slide / enter, the height easing, sort by
// header, selection with its own bulk bar, the phone's «buscar + Filtros» sheet, and a narrow box becoming Items.
//   columns  [{key, label, type: person|text|date|status|money, sub (person: the key under the name), sortable}]
//   rows     [{id, …keys}]   (a date is "yyyy-mm-ddTHH:MM"; a row's date may be "+N" days from today too)
//   filters  [{id, type: search|facet|date|range, label, key | keys (search)}]
//   statuses [{id, label, tone: ok|wait|info|bad}] · noun ["cita", "citas"] · bulk [{id, label, variant}]
//   on.action(json {action, ids})
export function dataTable(root, cfg, core, on) {
  const { ui, $, $$, lib, place, show, hide, easeHeight, setCheck, CB_CHECK, money0, fold, reformat, groupThousands, today, addDays, DAY, openModal, CONTENT, body, foot } = core;
  const list = (v) => (Array.isArray(v) ? v : []);
  const COLS = list(cfg.columns), STATUS = Object.fromEntries(list(cfg.statuses).map((s) => [s.id, s]));
  const [ONE, MANY] = list(cfg.noun).length === 2 ? cfg.noun : ['fila', 'filas'];
  const ST_ORDER = list(cfg.statuses).map((s) => s.id);
  const asDate = (v) => { const s = String(v ?? ''); const m = /^\+(\d+)(?:T(\d\d:\d\d))?$/.exec(s); if (m) { const d = addDays(today, +m[1]); if (m[2]) { const [h, mi] = m[2].split(':'); d.setHours(+h, +mi); } return d; } return new Date(s); };
  const DT = list(cfg.rows).map((r, i) => ({ id: r.id ?? i, ...r }));
  const colOf = (type) => COLS.find((c) => c.type === type);
  const dateCol = colOf('date'), statusCol = colOf('status');
  const whenText = (v) => { const d = asDate(v); return `${DAY[d.getDay()]} ${d.getDate()} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const DATE_PRESETS = { today: ['Hoy', (d) => +d === +today], tomorrow: ['Mañana', (d) => +d === +addDays(today, 1)], week: ['Próximos 7 días', (d) => d >= today && d < addDays(today, 7)], later: ['Más adelante', (d) => d >= addDays(today, 7)] };
  const dayOf = (v) => { const d = asDate(v); d.setHours(0, 0, 0, 0); return d; };
  const FILTERS = list(cfg.filters).map((f) => ({
    ...f,
    read: f.type === 'search' ? (r) => list(f.keys || [f.key]).map((k) => r[k]).join(' ') : f.type === 'date' ? (r) => dayOf(r[f.key]) : (r) => r[f.key],
    name: (v) => (f.key === statusCol?.key && STATUS[v] ? STATUS[v].label : v),
    fmt: f.money === false ? (v) => v : money0,
  }));
  const fState = Object.fromEntries(FILTERS.map((f) => [f.id, f.type === 'search' ? '' : f.type === 'facet' ? new Set() : null]));
  const PASS = {
    search: (f, v, r) => !v || fold(f.read(r)).includes(fold(v)),
    facet: (f, v, r) => !v.size || v.has(f.read(r)),
    date: (f, v, r) => !v || DATE_PRESETS[v][1](f.read(r)),
    range: (f, v, r) => !v || ((v[0] == null || f.read(r) >= v[0]) && (v[1] == null || f.read(r) <= v[1])),
  };
  const SORTERS = Object.fromEntries(COLS.map((c) => [c.key, c.type === 'status' ? (r) => ST_ORDER.indexOf(r[c.key]) : c.type === 'date' ? (r) => +asDate(r[c.key]) : (r) => r[c.key]]));
  const cbHtml = (label, on) => `<button data-slot="checkbox" role="checkbox" data-state="${on ? 'checked' : 'unchecked'}" aria-checked="${on}" class="cn-checkbox" aria-label="${label}"><span data-slot="checkbox-indicator" class="cn-checkbox-indicator"><svg class="cb-mark" viewBox="0 0 24 24">${CB_CHECK}</svg></span></button>`;
  const firstSort = dateCol ? { key: dateCol.key, dir: 1 } : { key: COLS[0]?.key, dir: 1 };
  const bulk = list(cfg.bulk);
  const CELL_CLASS = { person: 'cx-dt-who', text: 'cx-dt-svc', date: 'cx-dt-when', status: 'cx-dt-st', money: 'cx-dt-num' };
  root.innerHTML = `<div class="cx-dt-host"><div class="cx-dt-toolbar"><div class="cx-hstack cx-dt-tools" role="toolbar" aria-label="Filtros"></div><span class="cx-text" data-variant="caption" data-dt-shown aria-live="polite"></span></div><div class="cx-hstack cx-dt-chips" hidden></div><div class="cx-dt-bulk" aria-live="polite"><div><span data-dt-count></span><div class="cx-hstack" style="gap:6px">${bulk.map((b) => ui.button({ label: b.label, variant: b.variant || 'outline', size: 'xs', attrs: `data-dt-bulk="${b.id}"` })).join('')}${ui.button({ label: 'Quitar selección', variant: 'ghost', size: 'xs', attrs: 'data-dt-unselect' })}</div></div></div><div class="cx-dt-scroll cx-scroll"><table class="cx-dt"><thead><tr><th class="cx-dt-check">${cbHtml('Seleccionar todas', false).replace('class="cn-checkbox"', 'class="cn-checkbox" data-dt-all')}</th>${COLS.map((c) => `<th aria-sort="${c.key === firstSort.key ? 'ascending' : 'none'}" ${c.type === 'money' ? 'class="cx-dt-num"' : ''}>${c.sortable === false ? ui.text(c.label, 'label') : `<button class="cn-button cn-button-variant-ghost cn-button-size-xs cx-th" data-sort="${c.key}">${c.label}<svg><use href="#${c.key === firstSort.key ? 'arrowup' : 'sort'}"/></svg></button>`}</th>`).join('')}</tr></thead><tbody></tbody></table></div></div>`;
  const host = $('.cx-dt-host', root), dtTools = $('.cx-dt-tools', root), dtChips = $('.cx-dt-chips', root), dtCountEl = $('[data-dt-shown]', root), dtBody = $('tbody', root), dtAll = $('[data-dt-all]', root), dtBulk = $('.cx-dt-bulk', root);
  const dtSel = new Set(); let dtSort = firstSort;
  const passes = (r, except) => FILTERS.every((f) => f.id === except || PASS[f.type](f, fState[f.id], r));
  const isActive = (f) => { const v = fState[f.id]; return f.type === 'facet' ? v.size > 0 : f.type === 'range' ? !!v && (v[0] != null || v[1] != null) : !!v; };
  const summary = (f) => { const v = fState[f.id]; if (f.type === 'facet') return v.size === 1 ? f.name([...v][0]) : `${v.size}`; if (f.type === 'date') return DATE_PRESETS[v][0]; if (f.type === 'range') return v[0] != null && v[1] != null ? `${f.fmt(v[0])}–${f.fmt(v[1])}` : v[0] != null ? `desde ${f.fmt(v[0])}` : `hasta ${f.fmt(v[1])}`; return v; };
  let dtMobile = false;
  const searchF = FILTERS.find((x) => x.type === 'search');
  const activeCount = () => FILTERS.filter((f) => f.type !== 'search' && isActive(f)).reduce((n, f) => n + (f.type === 'facet' ? fState[f.id].size : 1), 0);
  const searchHtml = () => (searchF ? `<div data-slot="input-group" class="cn-input-group group/input-group cx-dt-search"><div data-slot="input-group-addon" class="cn-input-group-addon cn-input-group-addon-align-inline-start">${ui.icon('search')}</div><input data-slot="input-group-control" class="cn-input cn-input-group-input" data-filter="${searchF.id}" placeholder="${searchF.label}" aria-label="${searchF.label}" value="${String(fState[searchF.id]).replace(/"/g, '&quot;')}"></div>` : '');
  const paintTools = () => {
    if (dtMobile) {
      const n = activeCount(), focused = document.activeElement?.dataset?.filter === searchF?.id;
      dtTools.innerHTML = searchHtml() + ui.button({ label: `${ui.icon('filter')}Filtros${n ? ui.badge(String(n), { variant: 'default' }) : ''}`, size: 'sm', cls: 'cx-fbtn-m', attrs: 'data-fmobile aria-haspopup="dialog"' });
      if (focused) { const i = dtTools.querySelector('[data-filter]'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
      return;
    }
    dtTools.innerHTML = FILTERS.map((f) => (f.type === 'search' ? searchHtml()
      : ui.button({ label: `${isActive(f) ? '' : ui.icon('plus')}${f.label}${isActive(f) ? `<span data-slot="separator" class="cn-separator cn-separator-vertical cx-fsep"></span>${ui.badge(summary(f), { variant: 'secondary' })}` : ''}`, size: 'sm', cls: `cx-fbtn ${isActive(f) ? '' : 'cx-dashed'}`, attrs: `data-fopen="${f.id}" aria-haspopup="dialog" aria-expanded="false"` }))).join('')
      + (FILTERS.some(isActive) ? ui.button({ label: 'Limpiar', size: 'sm', variant: 'ghost', attrs: 'data-fclear' }) : '');
  };
  const fPop = document.createElement('div'); fPop.className = 'cn-popover-content pg-pop cx-fpop'; fPop.setAttribute('role', 'dialog'); fPop.hidden = true; lib.appendChild(fPop);
  let fOpen = null, fBtn = null;
  const fClose = (refocus) => { if (!fOpen) return; hide(fPop, 120); fBtn?.setAttribute('aria-expanded', 'false'); if (refocus) fBtn?.focus(); fOpen = null; };
  const rangeInputs = (f, prefix) => { const v = fState[f.id] || [null, null]; return `<div class="cx-frange">${['Desde', 'Hasta'].map((lab, i) => ui.field({ id: `${prefix}${f.id}${i}`, label: lab, control: `<div data-slot="input-group" class="cn-input-group"><div class="cn-input-group-addon cn-input-group-addon-align-inline-start">$</div><input class="cn-input cn-input-group-input cx-num" id="${prefix}${f.id}${i}" inputmode="numeric" data-frange="${i}" data-frid="${f.id}" value="${v[i] != null ? groupThousands(String(v[i]), '.') : ''}" placeholder="${i ? 'Sin tope' : '0'}"></div>` })).join('')}</div>`; };
  const facetItems = (f, sheet) => { const counts = new Map(); DT.filter((r) => passes(r, f.id)).forEach((r) => counts.set(f.read(r), (counts.get(f.read(r)) || 0) + 1)); return [...new Set(DT.map(f.read))].map((v) => sheet
    ? `<button type="button" class="cn-command-item cx-fsheet-opt" role="checkbox" aria-checked="${fState[f.id].has(v)}" data-fs-facet="${f.id}" data-fval="${v}"><span data-slot="checkbox" class="cn-checkbox" data-state="${fState[f.id].has(v) ? 'checked' : 'unchecked'}"><span class="cn-checkbox-indicator"><svg class="cb-mark" viewBox="0 0 24 24">${CB_CHECK}</svg></span></span>${ui.text(f.name(v))}<span class="cx-fcount">${counts.get(v) || 0}</span></button>`
    : `<div data-slot="command-item" class="cn-command-item group/command-item" role="option" aria-selected="${fState[f.id].has(v)}" data-fval="${v}" tabindex="-1"><span data-slot="checkbox" class="cn-checkbox" data-state="${fState[f.id].has(v) ? 'checked' : 'unchecked'}"><span class="cn-checkbox-indicator"><svg class="cb-mark" viewBox="0 0 24 24">${CB_CHECK}</svg></span></span>${ui.text(f.name(v))}<span class="cx-fcount">${counts.get(v) || 0}</span></div>`).join(''); };
  const popBody = (f) => {
    if (f.type === 'facet') return `<div data-slot="command" class="cn-command"><div data-slot="command-input-wrapper" class="cn-command-input-wrapper"><div data-slot="input-group" class="cn-input-group cn-command-input-group group/input-group"><input data-slot="input-group-control" class="cn-command-input cn-input-group-input" placeholder="${f.label}…" data-fsearch aria-label="Buscar en ${f.label}"><div class="cn-input-group-addon cn-input-group-addon-align-inline-start" data-align="inline-start"><svg class="cn-command-input-icon"><use href="#search"/></svg></div></div></div><div data-slot="command-list" class="cn-command-list" role="listbox" aria-multiselectable="true">${facetItems(f)}</div>${fState[f.id].size ? `<div data-slot="separator" class="cn-separator cn-separator-horizontal"></div><button class="cn-command-item cx-fclear-one" data-fclear-one>Quitar filtro</button>` : ''}</div>`;
    if (f.type === 'date') return `<div class="cx-vstack" style="gap:4px">${Object.entries(DATE_PRESETS).map(([k, [n]]) => ui.button({ label: n, variant: 'ghost', size: 'sm', cls: 'cx-fill cx-left', attrs: `aria-pressed="${fState[f.id] === k}" data-fdate="${k}"` })).join('')}${fState[f.id] ? ui.button({ label: 'Cualquier fecha', variant: 'ghost', size: 'sm', cls: 'cx-fill cx-left', attrs: 'data-fdate=""' }) : ''}</div>`;
    if (f.type === 'range') return `<div class="cx-vstack" style="gap:10px">${ui.text(f.label, 'label')}${rangeInputs(f, 'f-')}</div>`;
    return '';
  };
  const fOpenPop = (id, btn) => { fClose(); fOpen = id; fBtn = btn; const f = FILTERS.find((x) => x.id === id); fPop.innerHTML = popBody(f); fPop.hidden = false; place(fPop, btn, 'start', 6); show(fPop); btn.setAttribute('aria-expanded', 'true'); (fPop.querySelector('[data-fsearch], input, [data-fdate], .cn-command-item') || fPop).focus({ preventScroll: true }); };
  const refresh = (keepPop) => { dtPaint(); paintTools(); if (keepPop && fOpen) { const f = FILTERS.find((x) => x.id === fOpen); const scroll = fPop.querySelector('.cn-command-list')?.scrollTop; const focused = document.activeElement?.dataset?.frange; fPop.innerHTML = popBody(f); if (scroll) fPop.querySelector('.cn-command-list').scrollTop = scroll; fBtn = dtTools.querySelector(`[data-fopen="${fOpen}"]`); fBtn?.setAttribute('aria-expanded', 'true'); if (focused != null) { const i = fPop.querySelector(`[data-frange="${focused}"]`); i?.focus(); i?.setSelectionRange(i.value.length, i.value.length); } } };
  let mobileCount = DT.length, sheetOpen = false;
  const syncMobileCount = (n) => { mobileCount = n; const go = $('[data-fsheet-go]', foot); if (go && sheetOpen) go.innerHTML = `Ver ${n} ${n === 1 ? ONE : MANY}`; };
  const sheetBody = () => FILTERS.filter((f) => f.type !== 'search').map((f) => {
    const ctrl = f.type === 'facet' ? `<div class="cx-vstack" style="gap:2px">${facetItems(f, true)}</div>` : f.type === 'date' ? `<div class="cx-hstack">${Object.entries(DATE_PRESETS).map(([k, [n]]) => ui.button({ label: n, size: 'sm', attrs: `aria-pressed="${fState[f.id] === k}" data-fs-date="${f.id}|${k}"` })).join('')}</div>` : f.type === 'range' ? rangeInputs(f, 'fs-') : '';
    return `<section class="cx-vstack" style="gap:10px">${ui.text(f.label, 'label')}${ctrl}</section>`;
  }).join('<div data-slot="separator" class="cn-separator cn-separator-horizontal"></div>');
  const sheetKind = 'dtFilters' + Math.random().toString(36).slice(2, 7);
  CONTENT[sheetKind] = () => { sheetOpen = true; document.getElementById('mdl-title').textContent = 'Filtros'; document.getElementById('mdl-desc').textContent = 'Se aplican mientras eliges.'; body.innerHTML = sheetBody(); foot.innerHTML = ui.button({ label: 'Limpiar', size: 'default', attrs: 'data-fsheet-clear', cls: 'cx-exit' }) + ui.button({ label: `Ver ${mobileCount} ${mobileCount === 1 ? ONE : MANY}`, variant: 'default', size: 'default', attrs: 'data-dismiss data-fsheet-go', cls: 'cx-go' }); };
  const sheetRefresh = () => { if (!sheetOpen) return; const st = body.scrollTop, focused = document.activeElement?.dataset?.frange; body.innerHTML = sheetBody(); body.scrollTop = st; if (focused != null) { const i = body.querySelector(`[data-frange="${focused}"]`); i?.focus(); i?.setSelectionRange(i.value.length, i.value.length); } };
  const clearAll = () => FILTERS.forEach((f) => { fState[f.id] = f.type === 'search' ? (f.id === searchF?.id ? fState[f.id] : '') : f.type === 'facet' ? new Set() : null; });
  body.addEventListener('click', (e) => {
    if (!sheetOpen) return;
    const o = e.target.closest('[data-fs-facet]'); if (o) { const set = fState[o.dataset.fsFacet], v = o.dataset.fval; set.has(v) ? set.delete(v) : set.add(v); dtPaint(); paintTools(); sheetRefresh(); return; }
    const d = e.target.closest('[data-fs-date]'); if (d) { const [id, k] = d.dataset.fsDate.split('|'); fState[id] = fState[id] === k ? null : k; dtPaint(); paintTools(); sheetRefresh(); }
  });
  const onRange = (e) => { const r = e.target.dataset.frange, id = e.target.dataset.frid; if (r == null || !id) return false; reformat(e.target, (v) => groupThousands(v.replace(/\D/g, '').slice(0, 9), '.'), /\d/); const n = e.target.value ? Number(e.target.value.replace(/\D/g, '')) : null; const v = fState[id] ? [...fState[id]] : [null, null]; v[+r] = n; fState[id] = v[0] == null && v[1] == null ? null : v; dtPaint(); paintTools(); return true; };
  body.addEventListener('input', (e) => { if (sheetOpen && e.target.id?.startsWith('fs-')) onRange(e); });
  foot.addEventListener('click', (e) => { if (sheetOpen && e.target.closest('[data-fsheet-clear]')) { clearAll(); dtPaint(); paintTools(); sheetRefresh(); } });
  addEventListener('popstate', () => { sheetOpen = false; });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-dismiss]')) sheetOpen = false; });
  new ResizeObserver(() => { const m = host.clientWidth < 600; host.toggleAttribute('data-narrow', host.clientWidth < 600); if (m !== dtMobile) { dtMobile = m; fClose(); paintTools(); } }).observe(host);
  dtTools.addEventListener('click', (e) => {
    if (e.target.closest('[data-fmobile]')) { openModal(sheetKind, 'auto'); return; }
    const b = e.target.closest('[data-fopen]'); if (b) { if (fOpen === b.dataset.fopen) fClose(); else fOpenPop(b.dataset.fopen, b); return; }
    if (e.target.closest('[data-fclear]')) { FILTERS.forEach((f) => { fState[f.id] = f.type === 'search' ? '' : f.type === 'facet' ? new Set() : null; }); fClose(); refresh(); }
  });
  dtTools.addEventListener('input', (e) => { if (e.target.dataset.filter) { fState[e.target.dataset.filter] = e.target.value; dtPaint(); paintChips(); } });
  fPop.addEventListener('click', (e) => {
    const f = FILTERS.find((x) => x.id === fOpen); if (!f) return;
    const it = e.target.closest('[data-fval]'); if (it) { const set = fState[f.id], v = it.dataset.fval; set.has(v) ? set.delete(v) : set.add(v); refresh(true); return; }
    if (e.target.closest('[data-fclear-one]')) { fState[f.id].clear(); refresh(true); return; }
    const d = e.target.closest('[data-fdate]'); if (d) { fState[f.id] = d.dataset.fdate || null; fClose(true); refresh(); }
  });
  fPop.addEventListener('input', (e) => {
    if (e.target.dataset.fsearch != null) { const q = fold(e.target.value); $$('[data-fval]', fPop).forEach((x) => { x.hidden = !fold(x.textContent).includes(q); }); return; }
    if (onRange(e)) { paintChips(); fBtn = dtTools.querySelector(`[data-fopen="${e.target.dataset.frid}"]`); fBtn?.setAttribute('aria-expanded', 'true'); }
  });
  fPop.addEventListener('keydown', (e) => {
    const items = $$('[data-fval]:not([hidden])', fPop), i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); (items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length] || items[0])?.focus(); }
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement?.dataset?.fval != null) { e.preventDefault(); document.activeElement.click(); }
    if (e.key === 'Escape') { e.stopPropagation(); fClose(true); }
  });
  document.addEventListener('pointerdown', (e) => { if (fOpen && !fPop.contains(e.target) && !dtTools.contains(e.target)) fClose(); });
  addEventListener('scroll', () => { if (fOpen && fBtn) place(fPop, fBtn, 'start', 6); }, { passive: true });
  const paintChips = () => {
    const chips = [];
    FILTERS.forEach((f) => { if (f.type === 'facet') fState[f.id].forEach((v) => chips.push([`${f.label}: ${f.name(v)}`, `${f.id}|${v}`])); else if (f.type !== 'search' && isActive(f)) chips.push([`${f.label}: ${summary(f)}`, f.id]); });
    const have = new Map($$('.cx-chip', dtChips).map((c) => [c.dataset.key, c])), want = new Set(chips.map(([, k]) => k));
    have.forEach((c, k) => { if (!want.has(k) && !c.classList.contains('out')) { c.classList.add('out'); c.addEventListener('animationend', () => easeHeight(dtChips, () => { c.remove(); dtChips.hidden = !dtChips.children.length; }), { once: true }); } });
    easeHeight(dtChips, () => {
      chips.forEach(([t, k]) => {
        const html = `${t}${ui.button({ icon: 'x', variant: 'ghost', size: 'icon-xs', cls: 'cx-chip-x', attrs: `data-fchip="${k}" aria-label="Quitar ${t}" title="Quitar"` })}`;
        const c = have.get(k);
        if (c) { if (c.dataset.text !== t) { c.innerHTML = html; c.dataset.text = t; } dtChips.appendChild(c); return; }
        const el = document.createElement('span'); el.dataset.slot = 'badge'; el.className = 'cn-badge cn-badge-variant-secondary cx-chip in'; el.dataset.key = k; el.dataset.text = t; el.innerHTML = html; dtChips.appendChild(el);
      });
      if (chips.length) dtChips.hidden = false;
    });
  };
  dtChips.addEventListener('click', (e) => { const b = e.target.closest('[data-fchip]'); if (!b) return; b.closest('.cx-chip').classList.add('out'); const [id, v] = b.dataset.fchip.split('|'); const f = FILTERS.find((x) => x.id === id); if (f.type === 'facet') fState[id].delete(v); else fState[id] = null; refresh(); });
  const cell = (c, r) => {
    const v = r[c.key];
    if (c.type === 'person') return `<td class="cx-dt-who"><b>${v}</b>${c.sub ? `<small class="cx-num">${r[c.sub] ?? ''}</small>` : ''}</td>`;
    if (c.type === 'date') return `<td class="cx-dt-when">${whenText(v)}</td>`;
    if (c.type === 'status') return `<td class="cx-dt-st">${STATUS[v] ? ui.badge(STATUS[v].label, { tone: STATUS[v].tone }) : ''}</td>`;
    if (c.type === 'money') return `<td class="cx-dt-num">${money0(v)}</td>`;
    return `<td class="cx-dt-svc" ${dateCol ? `data-when="${whenText(r[dateCol.key])}"` : ''}>${v ?? ''}</td>`;
  };
  const who = (r) => r[colOf('person')?.key ?? COLS[0]?.key] ?? '';
  const rowCells = (r) => `<td class="cx-dt-check">${cbHtml('Seleccionar ' + who(r), dtSel.has(r.id))}</td>${COLS.map((c) => cell(c, r)).join('')}`;
  const EASE = 'cubic-bezier(.22, 1, .36, 1)';
  let dtAnim = 0;
  const dtPaint = () => {
    const f = SORTERS[dtSort.key] || (() => 0);
    const rows = DT.filter((r) => passes(r)).sort((a, b) => (f(a) > f(b) ? 1 : f(a) < f(b) ? -1 : 0) * dtSort.dir);
    const token = ++dtAnim, scroller = dtBody.closest('.cx-dt-scroll');
    const before = new Map([...dtBody.children].map((tr) => [tr.dataset.id, tr.getBoundingClientRect().top]));
    const keep = new Set(rows.map((r) => String(r.id)));
    const leaving = [...dtBody.children].filter((tr) => !keep.has(tr.dataset.id));
    const apply = () => {
      if (token !== dtAnim) return;
      const fromH = scroller.offsetHeight;
      const byId = new Map([...dtBody.children].map((tr) => [tr.dataset.id, tr]));
      const frag = document.createDocumentFragment(), entering = [];
      rows.forEach((r) => { let tr = byId.get(String(r.id)); if (!tr) { tr = document.createElement('tr'); tr.dataset.id = r.id; entering.push(tr); } tr.toggleAttribute('data-selected', dtSel.has(r.id)); tr.innerHTML = rowCells(r); frag.appendChild(tr); });
      if (!rows.length) { let tr = byId.get('empty'); if (!tr) { tr = document.createElement('tr'); tr.dataset.id = 'empty'; tr.innerHTML = `<td colspan="${COLS.length + 1}"><div data-slot="empty" class="cn-empty cx-dt-empty"><div class="cn-empty-header"><div class="cn-empty-media cn-empty-media-icon">${ui.icon('search')}</div><div class="cn-empty-title">Nada coincide con los filtros</div><div class="cn-empty-description">Quita alguno o límpialos todos.</div></div><div class="cn-empty-content">${ui.button({ label: 'Limpiar filtros', attrs: 'data-fclear-empty' })}</div></div></td>`; entering.push(tr); } frag.appendChild(tr); }
      dtBody.replaceChildren(frag);
      dtBody.querySelectorAll('tr').forEach((tr) => { const old = before.get(tr.dataset.id); if (old == null) return; const dy = old - tr.getBoundingClientRect().top; if (dy) tr.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 240, easing: EASE }); });
      entering.forEach((tr, i) => tr.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 220, delay: Math.min(i, 6) * 18, easing: EASE, fill: 'backwards' }));
      const toH = scroller.offsetHeight; if (fromH !== toH) scroller.animate([{ height: fromH + 'px' }, { height: toH + 'px' }], { duration: 240, easing: EASE });
    };
    if (leaving.length && dtBody.children.length) { leaving.forEach((tr) => tr.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 130, easing: 'ease-out', fill: 'forwards' })); setTimeout(apply, 130); } else apply();
    dtCountEl.textContent = rows.length === DT.length ? `${DT.length} ${DT.length === 1 ? ONE : MANY}` : `${rows.length} de ${DT.length} ${MANY}`; paintChips();
    setCheck(dtAll, dtSel.size === 0 ? false : dtSel.size === DT.length ? true : 'mixed');
    dtBulk.toggleAttribute('data-open', dtSel.size > 0);
    if (dtSel.size) $('[data-dt-count]', root).textContent = `${dtSel.size} ${dtSel.size === 1 ? 'seleccionada' : 'seleccionadas'}`;
    syncMobileCount(rows.length);
  };
  $('thead', root).addEventListener('click', (e) => {
    const th = e.target.closest('[data-sort]'); if (!th) return;
    const key = th.dataset.sort; dtSort = { key, dir: dtSort.key === key ? -dtSort.dir : 1 };
    $$('thead [data-sort]', root).forEach((b) => { const on = b.dataset.sort === key; b.parentElement.setAttribute('aria-sort', on ? (dtSort.dir === 1 ? 'ascending' : 'descending') : 'none'); $('use', b).setAttribute('href', on ? (dtSort.dir === 1 ? '#arrowup' : '#arrowdown') : '#sort'); });
    dtPaint();
  });
  dtAll.addEventListener('click', () => { if (dtSel.size === DT.length) dtSel.clear(); else DT.forEach((r) => dtSel.add(r.id)); dtPaint(); });
  dtBody.addEventListener('click', (e) => {
    if (e.target.closest('[data-fclear-empty]')) { dtTools.querySelector('[data-fclear]')?.click(); return; }
    const tr = e.target.closest('tr'); if (!tr || tr.dataset.id === 'empty') return;
    if (!e.target.closest('.cn-checkbox') && !host.hasAttribute('data-narrow') && !matchMedia('(max-width: 640px)').matches) return;
    const raw = tr.dataset.id, id = DT.find((r) => String(r.id) === raw)?.id; dtSel.has(id) ? dtSel.delete(id) : dtSel.add(id); dtPaint();
  });
  dtBulk.addEventListener('click', (e) => {
    if (e.target.closest('[data-dt-unselect]')) { dtSel.clear(); dtPaint(); return; }
    const b = e.target.closest('[data-dt-bulk]'); if (!b) return;
    const def = bulk.find((x) => x.id === b.dataset.dtBulk); const ids = [...dtSel];
    if (def?.set) DT.forEach((r) => { if (dtSel.has(r.id)) Object.assign(r, def.set); });
    dtSel.clear(); dtPaint(); on?.action?.(JSON.stringify({ action: b.dataset.dtBulk, ids }));
  });
  paintTools(); dtPaint();
  return { refresh: () => { dtPaint(); paintTools(); } };
}
