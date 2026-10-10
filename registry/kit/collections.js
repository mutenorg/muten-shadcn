// @muten/shadcn · collections (kit): the reference artifact's Tags field, Pagination nav, Virtual list and the
// Carousel's behaviour, generic. Data and labels come in; nothing about a product is inside.

// Tags: chips animate in and out, the field's height eases; suggestions; a cap with its count. i {label, tags
// "Barba,Corte clásico", suggestions "Fade,Navaja", max, hint} → on.change("Barba,Corte clásico,Fade")
export function tagInput(root, i, core, on) {
  const { $, $$, fold, easeHeight } = core;
  const split = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
  const MAXT = Number(i.max) || 8, SUG = split(i.suggestions), id = 'tg' + Math.random().toString(36).slice(2, 7);
  let tags = split(i.tags);
  root.innerHTML = `<div data-slot="field" class="cn-field cn-field-orientation-vertical group/field"><label data-slot="label" class="cn-label" for="${id}">${i.label || 'Etiquetas'}</label><div class="cx-taginput"><input id="${id}" class="cx-tag-field" placeholder="${i.placeholder || 'Agrega y presiona Enter'}" autocomplete="off"></div><p data-slot="field-description" class="cn-field-description cx-count-line"><span>${i.hint || ''}</span><span data-tg-n></span></p></div>${SUG.length ? '<div class="cx-suggest"><span>Sugerencias</span><div class="cx-line" style="justify-content:flex-start" data-tg-sug></div></div>' : ''}`;
  const tgBox = $('.cx-taginput', root), tgIn = $('input', root), tgN = $('[data-tg-n]', root), tgSug = $('[data-tg-sug]', root);
  const chipHtml = (t) => `<span data-slot="badge" class="cn-badge cn-badge-variant-secondary cx-chip" data-tag="${t}">${t}<button class="cn-button cn-button-variant-ghost cn-button-size-icon-xs cx-chip-x" aria-label="Quitar ${t}" title="Quitar" tabindex="-1"><svg style="width:12px;height:12px"><use href="#x"/></svg></button></span>`;
  const emit = () => on?.change?.(tags.join(','));
  const tgMeta = () => {
    tgN.textContent = `${tags.length}/${MAXT}`; tgN.parentElement.toggleAttribute('data-near', tags.length >= MAXT);
    tgIn.placeholder = tags.length >= MAXT ? `Llegaste al tope de ${MAXT}` : tags.length ? '' : (i.placeholder || 'Agrega y presiona Enter');
    if (tgSug) $$('.cx-sug', tgSug).forEach((b) => { b.disabled = tags.some((t) => fold(t) === fold(b.textContent)) || tags.length >= MAXT; });
  };
  const tgAdd = (raw) => {
    const t = raw.trim().replace(/\s+/g, ' '); if (!t) return;
    const same = tags.find((x) => fold(x) === fold(t));
    if (same) { const c = $(`[data-tag="${same}"]`, tgBox); c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash'); tgIn.value = ''; return; }
    if (tags.length >= MAXT) return;
    const tag = t[0].toUpperCase() + t.slice(1); tags.push(tag); tgIn.value = '';
    easeHeight(tgBox, () => { tgIn.insertAdjacentHTML('beforebegin', chipHtml(tag)); tgMeta(); });
    $(`[data-tag="${tag}"]`, tgBox).classList.add('in'); emit();
  };
  const tgRemove = (chip) => { tags = tags.filter((t) => t !== chip.dataset.tag); tgMeta(); chip.classList.add('out'); chip.addEventListener('animationend', () => easeHeight(tgBox, () => chip.remove()), { once: true }); emit(); };
  tgIn.addEventListener('keydown', (e) => {
    const marked = $('.cx-chip[data-marked]', tgBox);
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); tgAdd(tgIn.value); }
    else if (e.key === 'Backspace' && !tgIn.value && tags.length) { e.preventDefault(); const last = $$('.cx-chip:not(.out)', tgBox).at(-1); if (marked) tgRemove(marked); else last?.setAttribute('data-marked', ''); }
    else marked?.removeAttribute('data-marked');
  });
  tgIn.addEventListener('blur', () => { $('.cx-chip[data-marked]', tgBox)?.removeAttribute('data-marked'); if (tgIn.value.trim()) tgAdd(tgIn.value); });
  tgBox.addEventListener('click', (e) => { const x = e.target.closest('.cx-chip .cx-chip-x'); if (x) tgRemove(x.parentElement); tgIn.focus(); });
  if (tgSug) { tgSug.innerHTML = SUG.map((s) => `<button class="cn-button cn-button-variant-outline cn-button-size-xs cx-sug"><svg style="width:12px;height:12px"><use href="#plus"/></svg>${s}</button>`).join(''); tgSug.addEventListener('click', (e) => { const b = e.target.closest('.cx-sug'); if (b) tgAdd(b.textContent); }); }
  tags.forEach((t) => tgIn.insertAdjacentHTML('beforebegin', chipHtml(t))); tgMeta();
}

// Pagination nav for server pages: always 7 slots once there are more than 7 pages (the buttons never slide),
// «Página n de N» on a phone, and the range line. i {total, per, page, noun} → on.page(n)
export function paginationNav(root, i, core, on) {
  const { $ } = core;
  root.innerHTML = '<div class="cx-pg-foot"><nav class="cn-pagination cx-pagination" aria-label="Páginas"><ul class="cn-pagination-content" style="list-style:none;margin:0;padding:0"></ul></nav><span class="cx-num" aria-live="polite" data-pg-range></span></div>';
  const pgNav = $('ul', root), pgRange = $('[data-pg-range]', root);
  let total = Number(i.total) || 0, per = Number(i.per) || 10, page = Number(i.page) || 1, noun = i.noun || 'resultados';
  const pages = () => Math.max(1, Math.ceil(total / per));
  const nums = () => { const P = pages(); if (P <= 7) return Array.from({ length: P }, (_, k) => k + 1); if (page <= 4) return [1, 2, 3, 4, 5, '…', P]; if (page >= P - 3) return [1, '…', P - 4, P - 3, P - 2, P - 1, P]; return [1, '…', page - 1, page, page + 1, '…', P]; };
  const paint = (focus) => {
    const P = pages();
    const nav = (dir, p, off) => `<li><button data-slot="button" class="cn-button cn-button-variant-ghost cn-button-size-default cn-pagination-${dir === -1 ? 'previous' : 'next'} group/button" data-page="${p}" ${off ? 'disabled' : ''} aria-label="Página ${dir === -1 ? 'anterior' : 'siguiente'}">${dir === -1 ? '<svg><use href="#left"/></svg><span>Anterior</span>' : '<span>Siguiente</span><svg><use href="#right"/></svg>'}</button></li>`;
    pgNav.innerHTML = nav(-1, page - 1, page === 1) + nums().map((p) => (p === '…' ? '<li class="cx-pg-num"><span class="cn-pagination-ellipsis cx-pg-gap" aria-hidden="true"><svg><use href="#more"/></svg></span></li>' : `<li class="cx-pg-num"><button data-slot="button" class="cn-button ${p === page ? 'cn-button-variant-outline' : 'cn-button-variant-ghost'} cn-button-size-icon group/button cx-num" data-page="${p}" ${p === page ? 'aria-current="page"' : ''} aria-label="Página ${p}">${p}</button></li>`)).join('') + `<li class="cx-pg-compact">Página ${page} de ${P}</li>` + nav(1, page + 1, page === P);
    pgRange.textContent = `${(page - 1) * per + 1}–${Math.min(total, page * per)} de ${total} ${noun}`;
    if (focus) pgNav.querySelector('[aria-current]')?.focus({ preventScroll: true });
  };
  pgNav.addEventListener('click', (e) => { const b = e.target.closest('[data-page]'); if (!b || b.disabled) return; page = +b.dataset.page; paint(true); on?.page?.(page); });
  paint();
  return (next) => { const np = Number(next.page) || page, nt = Number(next.total) || total; if (np === page && nt === total) return; page = np; total = nt; per = Number(next.per) || per; paint(); };
}

// Virtual list: only the visible rows (+ a margin) exist in the DOM. i {rows [{title, subtitle, value}], total
// (rows repeat up to it, for a long demo), rowHeight, label} → on.jump not needed: «Ir al n» via inputs.jump.
export function virtualList(root, i, core) {
  const { $ } = core;
  const rows = Array.isArray(i.rows) ? i.rows : [];
  const VTOTAL = Math.max(Number(i.total) || 0, rows.length), VROW = Number(i.rowHeight) || 52, VOVER = 6;
  root.innerHTML = `<div class="cx-pages-wrap"><div class="cx-vlist cx-scroll" tabindex="0" role="list" aria-label="${i.label || 'Lista'}"><div class="cx-vspace"><div class="cx-vwin"></div></div></div><div class="cx-pg-foot"><span class="cx-num" data-vl-info></span>${i.jump ? `<button data-slot="button" class="cn-button cn-button-variant-outline cn-button-size-sm group/button" data-vl-jump>Ir al ${Number(i.jump).toLocaleString('es-CO')}</button>` : ''}</div></div>`;
  const vBox = $('.cx-vlist', root), vSpace = $('.cx-vspace', root), vWin = $('.cx-vwin', root), vInfo = $('[data-vl-info]', root);
  vSpace.style.height = VTOTAL * VROW + 'px';
  let vFirst = -1, vRaf = 0;
  const vPaint = () => {
    const top = vBox.scrollTop, h = vBox.clientHeight;
    const first = Math.max(0, Math.floor(top / VROW) - VOVER), last = Math.min(VTOTAL, Math.ceil((top + h) / VROW) + VOVER);
    if (first !== vFirst) {
      vFirst = first; vWin.style.transform = `translateY(${first * VROW}px)`;
      let html = '';
      for (let k = first; k < last; k++) { const c = rows[k % rows.length] || {}; html += `<div class="cx-vrow" role="listitem" aria-setsize="${VTOTAL}" aria-posinset="${k + 1}"><span class="cx-vn cx-num">${(k + 1).toLocaleString('es-CO')}</span><span>${c.title ?? ''}<small>${c.subtitle ?? ''}</small></span><b>${c.value ?? ''}</b></div>`; }
      vWin.innerHTML = html;
    }
    const a = Math.floor(top / VROW) + 1, b = Math.min(VTOTAL, Math.ceil((top + h) / VROW));
    vInfo.textContent = `${a.toLocaleString('es-CO')}–${b.toLocaleString('es-CO')} de ${VTOTAL.toLocaleString('es-CO')} · ${vWin.childElementCount} filas en el DOM`;
  };
  vBox.addEventListener('scroll', () => { cancelAnimationFrame(vRaf); vRaf = requestAnimationFrame(vPaint); }, { passive: true });
  vBox.addEventListener('keydown', (e) => { const d = { ArrowDown: VROW, ArrowUp: -VROW, PageDown: vBox.clientHeight, PageUp: -vBox.clientHeight }[e.key]; if (d) { e.preventDefault(); vBox.scrollTop += d; } if (e.key === 'Home') { e.preventDefault(); vBox.scrollTop = 0; } if (e.key === 'End') { e.preventDefault(); vBox.scrollTop = vBox.scrollHeight; } });
  $('[data-vl-jump]', root)?.addEventListener('click', () => vBox.scrollTo({ top: Number(i.jump) * VROW - VROW, behavior: 'smooth' }));
  new ResizeObserver(() => { vFirst = -1; vPaint(); }).observe(vBox);
}

// Carousel behaviour over the slides muten rendered inside a `.cx-car` (the Carousel part): pages, indicator
// (dots · progress · count · thumbs), loop, autoplay with its own pause, arrows (bar | overlay), keys and mouse drag.
export function carouselBehavior(root, i, core) {
  const { $, $$, ui } = core;
  const perView = String(i.perView || '1').split(',').map(Number), [perSm, perLg] = perView.length > 1 ? perView : [Math.min(perView[0], 2), perView[0]];
  const center = i.center === 'on', loop = i.loop === 'on', autoplay = Number(i.autoplay) || 0, indicator = i.indicator || 'dots', arrows = i.arrows || 'bar';
  root.style.setProperty('--per', perLg); root.style.setProperty('--per-sm', perSm);
  if (center) root.dataset.center = '';
  const view = $('.cx-car-view', root); view.dataset.arrows = arrows;
  const prevB = ui.button({ icon: 'left', size: 'icon-sm', attrs: 'data-car="prev" aria-label="Anterior" title="Anterior"', cls: 'cx-car-arrow' });
  const nextB = ui.button({ icon: 'right', size: 'icon-sm', attrs: 'data-car="next" aria-label="Siguiente" title="Siguiente"', cls: 'cx-car-arrow' });
  if (arrows === 'overlay') view.insertAdjacentHTML('beforeend', prevB + nextB);
  root.insertAdjacentHTML('beforeend', `<div class="cx-car-bar"><div class="cx-car-ind" data-ind="${indicator}"></div><div class="cx-hstack" style="gap:6px">${autoplay ? ui.button({ icon: 'pause', size: 'icon-sm', variant: 'ghost', attrs: 'data-car="play" aria-label="Pausar" title="Pausar"' }) : ''}${arrows === 'bar' ? prevB + nextB : ''}</div></div>`);
  const track = $('.cx-car-track', root), ind = $('.cx-car-ind', root), cards = $$('.cx-car-slide', track);
  cards.forEach((c, k) => { c.setAttribute('role', 'group'); c.setAttribute('aria-roledescription', 'diapositiva'); c.setAttribute('aria-label', `${k + 1} de ${cards.length}`); });
  const step = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth);
  const perPage = () => (center ? 1 : Math.max(1, Math.round(track.clientWidth / step())));
  const pages = () => (center ? cards.length : Math.max(1, Math.ceil(cards.length / perPage())));
  const current = () => {
    if (center) { const mid = track.scrollLeft + track.clientWidth / 2; let best = 0, d = Infinity; cards.forEach((c, k) => { const cd = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (cd < d) { d = cd; best = k; } }); return best; }
    if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 4) return pages() - 1;
    return Math.round(track.scrollLeft / (step() * perPage()));
  };
  const go = (p) => { const n = pages(); if (loop) p = (p + n) % n; else p = Math.max(0, Math.min(n - 1, p)); const target = center ? cards[p].offsetLeft + cards[p].offsetWidth / 2 - track.clientWidth / 2 : p * step() * perPage(); track.scrollTo({ left: target, behavior: 'smooth' }); };
  const thumbOf = (k) => { const media = cards[k].querySelector('img, [role=img], .cx-gallery-img'); const bg = media ? getComputedStyle(media).backgroundImage : ''; return media?.tagName === 'IMG' ? `<img src="${media.src}" alt="">` : `<span class="cx-thumb-fill" style="background-image:${bg}"></span>`; };
  const paint = () => {
    const n = pages(), cur = current();
    // the dots are tabs, so their holder is the tablist (a tab without one fails the a11y check)
    if (indicator === 'dots') { ind.setAttribute('role', 'tablist'); ind.setAttribute('aria-label', 'Diapositivas'); if (ind.childElementCount !== n) ind.innerHTML = Array.from({ length: n }, (_, k) => ui.button({ variant: 'ghost', size: 'icon-xs', cls: 'cx-dotb', attrs: `role="tab" data-go="${k}" aria-label="Ir a ${k + 1} de ${n}"`, label: '<span class="cx-dot-mark"></span>' })).join(''); $$('[data-go]', ind).forEach((d, k) => d.setAttribute('aria-selected', k === cur)); }
    if (indicator === 'progress') ind.innerHTML = `<div class="cx-hstack" style="gap:10px;flex-wrap:nowrap">${ui.progress(((cur + 1) / n) * 100, `Diapositiva ${cur + 1} de ${n}`)}${ui.text(`${cur + 1} / ${n}`, 'caption')}</div>`;
    if (indicator === 'count') ind.innerHTML = ui.text(`${cur + 1} de ${n}`, 'caption');
    if (indicator === 'thumbs') { if (!ind.childElementCount) ind.innerHTML = `<div class="cx-hstack" role="tablist" aria-label="Miniaturas">${cards.map((_, k) => ui.button({ variant: 'ghost', size: 'icon-lg', cls: 'cx-thumb', attrs: `role="tab" data-go="${k}" aria-label="Foto ${k + 1}"`, label: thumbOf(k) })).join('')}</div>`; $$('[data-go]', ind).forEach((d, k) => { d.setAttribute('aria-selected', k === cur); d.setAttribute('aria-pressed', k === cur); }); }
    if (center) cards.forEach((c, k) => c.toggleAttribute('data-active', k === cur));
    if (!loop) { $$('[data-car="prev"]', root).forEach((b) => { b.disabled = cur === 0; }); $$('[data-car="next"]', root).forEach((b) => { b.disabled = cur >= n - 1; }); }
  };
  let raf = 0; track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); }, { passive: true });
  root.addEventListener('click', (e) => {
    const g = e.target.closest('[data-go]'); if (g) { go(+g.dataset.go); return; }
    const a = e.target.closest('[data-car]'); if (!a) return;
    if (a.dataset.car === 'prev') go(current() - 1);
    if (a.dataset.car === 'next') go(current() + 1);
    if (a.dataset.car === 'play') { playing = !playing; a.innerHTML = ui.icon(playing ? 'pause' : 'play'); a.setAttribute('aria-label', playing ? 'Pausar' : 'Reproducir'); a.title = a.getAttribute('aria-label'); }
  });
  track.tabIndex = 0;
  track.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(current() + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(current() - 1); } });
  let drag = null;
  track.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || e.button > 0) return; drag = { x: e.clientX, left: track.scrollLeft, moved: false }; track.classList.add('dragging'); });
  addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 4) drag.moved = true; track.scrollLeft = drag.left - dx; });
  // A drag lets go between two pages (snapping is off while dragging): settle on the nearest one, as a swipe does,
  // or the track rests half-way and the dots and arrows disagree about where it is.
  const nearest = () => {
    if (center) return current();
    if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 4) return pages() - 1;
    return Math.max(0, Math.min(pages() - 1, Math.round(track.scrollLeft / (step() * perPage()))));
  };
  addEventListener('pointerup', () => { if (!drag) return; const moved = drag.moved; drag = null; track.classList.remove('dragging'); if (moved) { go(nearest()); track.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); }, { capture: true, once: true }); } });
  let playing = !!autoplay && !matchMedia('(prefers-reduced-motion: reduce)').matches, hold = false;
  if (autoplay) {
    if (!playing) { const b = $('[data-car="play"]', root); b.innerHTML = ui.icon('play'); b.setAttribute('aria-label', 'Reproducir'); }
    ['pointerenter', 'focusin', 'touchstart'].forEach((t) => root.addEventListener(t, () => { hold = true; }, { passive: true }));
    ['pointerleave', 'focusout'].forEach((t) => root.addEventListener(t, () => { hold = false; }));
    setInterval(() => { if (playing && !hold && !document.hidden) go(loop || current() < pages() - 1 ? current() + 1 : 0); }, autoplay);
  }
  new ResizeObserver(() => { if (indicator !== 'thumbs') ind.innerHTML = ''; paint(); }).observe(track);
  paint();
}
