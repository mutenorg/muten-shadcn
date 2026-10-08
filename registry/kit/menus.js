// @muten/shadcn · menus (kit): the reference artifact's Combobox (type, it filters and marks the match, arrows, Enter,
// «Usar …» for something not in the list), the row menu ⋯ (arrows, Home/End, type-ahead, Esc returns focus) and the
// store QR (with the mark in the middle and «Copiar enlace»). Generic: options, items and the link come in.

export function combobox(root, i, core, on) {
  const { $, $$, lib, place, show, hide, fold } = core;
  const OPTIONS = String(i.options || '').split(',').map((x) => x.trim()).filter(Boolean);
  const allowNew = i.allowNew !== 'off', id = 'cb' + Math.random().toString(36).slice(2, 7);
  root.innerHTML = `<div data-slot="field" class="cn-field cn-field-orientation-vertical group/field"><label data-slot="label" class="cn-label" for="${id}">${i.label || ''}</label><div data-slot="input-group" class="cn-input-group group/input-group cx-combo"><input data-slot="input-group-control" class="cn-input cn-input-group-input" id="${id}" role="combobox" aria-expanded="false" aria-controls="${id}-list" aria-autocomplete="list" autocomplete="off" placeholder="${i.placeholder || ''}"><div data-slot="input-group-addon" class="cn-input-group-addon cn-input-group-addon-align-inline-end"><svg><use href="#updown"/></svg></div></div>${i.hint === 'off' ? '' : `<p data-slot="field-description" class="cn-field-description" data-cb-out>Elegida: ${i.value || 'ninguna'}</p>`}</div>`;
  const cIn = $('input', root), cGroup = $('.cx-combo', root), cOut = $('[data-cb-out]', root);
  const cList = document.createElement('div'); cList.className = 'cx-combo-list pg-pop'; cList.id = `${id}-list`; cList.setAttribute('role', 'listbox'); cList.hidden = true; lib.appendChild(cList);
  let cOpts = [], cHl = 0, cValue = i.value || '';
  cIn.value = cValue;
  const mark = (name, typed) => { const k = fold(name).indexOf(fold(typed)); return !typed || k < 0 ? name : name.slice(0, k) + '<mark>' + name.slice(k, k + typed.length) + '</mark>' + name.slice(k + typed.length); };
  const cRender = () => {
    const typed = cIn.value.trim();
    const hits = OPTIONS.filter((c) => fold(c).includes(fold(typed)));
    cOpts = hits.map((c) => ({ value: c, html: `<span>${mark(c, typed)}</span>` + (c === cValue ? '<svg class="cx-tick"><use href="#check"/></svg>' : '') }));
    if (allowNew && typed && !OPTIONS.some((c) => fold(c) === fold(typed))) cOpts.push({ value: typed, html: `<span>Usar «<b>${typed.replace(/</g, '&lt;')}</b>»</span>`, isNew: true });
    cHl = Math.min(cHl, Math.max(0, cOpts.length - 1));
    cList.innerHTML = cOpts.map((o, k) => `<div class="cx-opt${o.isNew ? ' cx-opt-new' : ''}" role="option" id="${id}-o${k}" data-k="${k}" aria-selected="${o.value === cValue}"${k === cHl ? ' data-hl' : ''}>${o.html}</div>`).join('') || '<div class="cx-opt" style="color:var(--muted-foreground)">Escribe para buscar</div>';
    cIn.setAttribute('aria-activedescendant', cOpts.length ? `${id}-o${cHl}` : '');
    $('[data-hl]', cList)?.scrollIntoView({ block: 'nearest' });
  };
  const cOpen = () => { if (!cList.hidden && cList.dataset.state === 'open') return; cRender(); cList.hidden = false; place(cList, cGroup, 'start', 4, cGroup.offsetWidth); show(cList); cIn.setAttribute('aria-expanded', 'true'); };
  const cClose = () => { hide(cList, 110); cIn.setAttribute('aria-expanded', 'false'); };
  const cPick = (k) => { const o = cOpts[k]; if (!o) return; cValue = o.value; cIn.value = o.value; if (cOut) cOut.textContent = `Elegida: ${o.value}${o.isNew ? ' (escrita por ti)' : ''}`; cClose(); on?.change?.(o.value); };
  cIn.addEventListener('focus', cOpen);
  cIn.addEventListener('input', () => { cHl = 0; cOpen(); cRender(); });
  cIn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (cList.hidden) return cOpen(); cHl = (cHl + (e.key === 'ArrowDown' ? 1 : -1) + cOpts.length) % Math.max(1, cOpts.length); cRender(); }
    else if (e.key === 'Enter') { if (!cList.hidden) { e.preventDefault(); cPick(cHl); } }
    else if (e.key === 'Escape') { if (!cList.hidden) { e.stopPropagation(); cClose(); } }
    else if (e.key === 'Tab') cClose();
  });
  cList.addEventListener('pointerdown', (e) => e.preventDefault());
  cList.addEventListener('pointermove', (e) => { const o = e.target.closest('[role=option]'); if (!o) return; const k = +o.dataset.k; if (k !== cHl) { cHl = k; $$('[role=option]', cList).forEach((x) => x.toggleAttribute('data-hl', x === o)); } });
  cList.addEventListener('click', (e) => { const o = e.target.closest('[role=option]'); if (o) cPick(+o.dataset.k); });
  cGroup.addEventListener('pointerdown', (e) => { if (e.target !== cIn) { e.preventDefault(); cIn.focus(); cOpen(); } });
  document.addEventListener('pointerdown', (e) => { if (!cList.hidden && !cList.contains(e.target) && !cGroup.contains(e.target)) cClose(); });
  addEventListener('scroll', () => { if (!cList.hidden) place(cList, cGroup, 'start', 4, cGroup.offsetWidth); }, { passive: true });
}

// Row menu ⋯: the trigger button (in the row's actions) and its menu. i {label, items [{id, label, icon, danger, separator}]}
export function rowMenu(root, i, core, on) {
  const { $, lib, place, show, hide, fold, ui } = core;
  const items = Array.isArray(i.items) ? i.items : [];
  root.innerHTML = ui.button({ icon: 'more', variant: 'ghost', size: 'icon-sm', attrs: `data-menu aria-haspopup="menu" aria-expanded="false" aria-label="${i.label || 'Más opciones'}" title="Más opciones"` });
  const btn = $('[data-menu]', root);
  const menu = document.createElement('div'); menu.dataset.slot = 'dropdown-menu-content'; menu.className = 'cn-dropdown-menu-content pg-pop'; menu.setAttribute('role', 'menu'); menu.hidden = true; menu.style.minWidth = '184px';
  menu.innerHTML = items.map((it) => `${it.separator ? '<div data-slot="dropdown-menu-separator" class="cn-dropdown-menu-separator"></div>' : ''}<div data-slot="dropdown-menu-item" ${it.danger ? 'data-variant="destructive"' : ''} class="cn-dropdown-menu-item group/dropdown-menu-item" role="menuitem" tabindex="-1" data-act="${it.id}">${it.icon ? ui.icon(it.icon) : ''}${it.label}</div>`).join('');
  lib.appendChild(menu);
  const all = () => [...menu.querySelectorAll('[role=menuitem]')];
  let open = false;
  const close = (refocus) => { if (!open) return; open = false; hide(menu, 120); btn.setAttribute('aria-expanded', 'false'); if (refocus) btn.focus(); };
  btn.addEventListener('click', (e) => { e.stopPropagation(); if (open) return close(); open = true; menu.hidden = false; place(menu, btn, 'end', 4); show(menu); btn.setAttribute('aria-expanded', 'true'); all()[0]?.focus({ preventScroll: true }); });
  document.addEventListener('pointerdown', (e) => { if (open && !menu.contains(e.target) && !btn.contains(e.target)) close(); });
  menu.addEventListener('pointermove', (e) => { const m = e.target.closest('[role=menuitem]'); if (m && document.activeElement !== m) m.focus({ preventScroll: true }); });
  menu.addEventListener('keydown', (e) => {
    const list = all(), k = list.indexOf(document.activeElement);
    const to = { ArrowDown: k + 1, ArrowUp: k - 1, Home: 0, End: list.length - 1 }[e.key];
    if (to !== undefined) { e.preventDefault(); list[(to + list.length) % list.length].focus(); return; }
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); return; }
    if (e.key === 'Tab') { close(); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.activeElement.click(); return; }
    if (e.key.length === 1) { const ch = fold(e.key); [...list.slice(k + 1), ...list.slice(0, k + 1)].find((m) => fold(m.textContent.trim()).startsWith(ch))?.focus(); }
  });
  menu.addEventListener('click', (e) => { const m = e.target.closest('[role=menuitem]'); if (!m) return; close(true); on?.pick?.(m.dataset.act); });
  addEventListener('scroll', () => { if (open) place(menu, btn, 'end', 4); }, { passive: true });
}

// Store QR: the code with the shop's mark in the middle, the name, the link and «Copiar enlace».
export function storeQr(root, i, core) {
  const { $ } = core;
  const url = i.url || '', shown = url.replace(/^https?:\/\//, '');
  root.innerHTML = `<div class="cx-qr-card"><div class="cx-qr" role="img" aria-label="Código QR de ${shown}"></div><div class="cx-qr-side"><b>${i.name || ''}</b><span class="cx-qr-url">${shown}</span><button data-slot="button" class="cn-button cn-button-variant-outline cn-button-size-sm group/button cx-copy"><span class="cx-btn-label"><svg><use href="#copyi"/></svg>Copiar enlace</span></button></div></div>`;
  const qrBox = $('.cx-qr', root);
  import('@muten/shadcn/registry/kit/qrcode.js').then(({ default: qrcode }) => {
    const qr = qrcode(0, 'H'); qr.addData(url); qr.make();
    const n = qr.getModuleCount(); let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    qrBox.innerHTML = `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" aria-hidden="true"><path d="${d}" fill="var(--qr-ink)"/></svg>${i.mark ? `<div class="cx-qr-mark"><span>${i.mark}</span></div>` : ''}`;
  });
  const copyBtn = $('.cx-copy', root), copyLabel = $('.cx-btn-label', copyBtn), copyIdle = copyLabel.innerHTML;
  copyBtn.onclick = () => {
    const done = (ok) => { copyBtn.toggleAttribute('data-done', ok); copyLabel.innerHTML = ok ? '<svg><use href="#check"/></svg>Copiado' : 'Selecciónalo y copia'; setTimeout(() => { copyBtn.removeAttribute('data-done'); copyLabel.innerHTML = copyIdle; }, 1800); };
    const fallback = () => { getSelection().selectAllChildren($('.cx-qr-url', root)); done(false); };
    try { navigator.clipboard.writeText(url).then(() => done(true), fallback); } catch { fallback(); }
  };
}
