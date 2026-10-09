// kit/board.js - the order Board and its card (the reference artifact's «Tablero» and «Tarjeta: mínimo y máximo"),
// composed only from atoms. Lanes and cards are data; the card groups its information by what it is about and
// orders it by what needs the owner first. Drag with the mouse, hold on touch, Space/arrows with the keyboard.
//   lanes [{id, title, next}]  next = the label of the step that moves a card INTO the following lane
//   cards [{id, lane, who, sub, total, contact, status [tone,label], request {…} | [{…}], order {count, photos, extras},
//           pay {method transfer|card|cash, tone, label, detail}, delivery {mode ship|pickup, label, when, map, track},
//           note, actions [["advance", label]]}]  photos and request.photo are CSS backgrounds (a gradient or url()).
//   sizes [{title, description, card}]  renders those cards side by side (static) instead of a board.
// on.change(json [{id, lane}]) after a card moves; on.action(json {id, action}) for every card button.
export function orderBoard(root, i, core, on) {
  const { ui, $, $$, lib, openModal: open, closeModal, CONTENT, body, foot, easeHeight, money0, hue, ini } = core;
  const list = (v) => (Array.isArray(v) ? v : []);
  const copy = (x) => JSON.parse(JSON.stringify(x));
  const CARDS = Object.fromEntries(list(i.cards).map((c) => [c.id, { actions: [], ...copy(c) }]));
  const LANES_B = list(i.lanes).map((l) => ({ ...l, cards: list(i.cards).filter((c) => c.lane === l.id).map((c) => c.id) }));
  const SIZES = list(i.sizes).map((s) => [s.title, s.description || '', s.card]);
  const btn = (variant, label, attrs = '') => `<button data-slot="button" class="cn-button cn-button-variant-${variant} cn-button-size-default group/button" ${attrs}>${label}</button>`;
  // one shared modal: this board's content is put in place right before it opens
  const KINDS = {}; const openModal = (kind, mode) => { CONTENT[kind] = KINDS[kind]; open(kind, mode); };
  const emit = () => on.change?.(JSON.stringify($$('.cx-bcard', brd).map((c) => ({ id: c.dataset.card, lane: c.closest('.cx-blane')?.dataset.lane }))));
  root.innerHTML = SIZES.length ? '<div class="cx-card-sizes"></div>' : '<div class="cx-board cx-scroll"></div><p class="sr-only cx-board-live" aria-live="assertive"></p>';
  const TONE_CLS = { ok: 'cx-tone-ok', wait: 'cx-tone-wait', new: 'cx-tone-new', bad: 'cx-tone-bad', info: 'cx-tone-new', muted: 'cn-badge-variant-outline' };
  const badge = ([t, l, dot = t !== 'muted']) => `<span data-slot="badge" class="cn-badge group/badge ${TONE_CLS[t]}">${dot ? '<span class="cx-dot"></span>' : ''}${l}</span>`;
  const bBtn = (act, label, variant = 'outline', icon = '') => `<button data-slot="button" class="cn-button cn-button-variant-${variant} cn-button-size-xs group/button" data-bact="${act}">${icon ? `<svg><use href="#${icon}"/></svg>` : ''}${label}</button>`;
  const miniMap = (m) => `<svg class="cx-map-svg" viewBox="0 0 240 110" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="240" height="110" class="mp-ground"/>
      <path class="mp-park" d="M150 8h52v34h-52z"/><path class="mp-water" d="M0 92c40-10 70 6 110-2s70-14 130-4v24H0z"/>
      <g class="mp-street"><path d="M0 30h240M0 64h240M40 0v110M98 0v110M170 0v110M214 0v110"/></g>
      <g class="mp-minor"><path d="M0 47h240M69 0v110M134 0v110"/></g>
      ${m.route ? '<path class="mp-route" d="M40 64H98V30h72V64h44"/>' : ''}
      <circle cx="40" cy="64" r="5" class="mp-shop"/>
      <g transform="translate(${m.route ? 214 : 170} 64)"><path class="mp-pin" d="M0 0c-6-8-10-12-10-17a10 10 0 0 1 20 0c0 5-4 9-10 17z"/><circle cy="-17" r="3.5" class="mp-pin-dot"/></g>
    </svg>`;
  // ── Order card for Storio, composed only from atoms ──
  // Card > CardHeader (Item: Avatar · name · line · contact Button) + attention Buttons
  //      > CardContent (ItemGroup: Productos · Pago · Entrega, split by ItemSeparator)
  //      > CardFooter (the one Button that changes the state)
  const TONE = { ok: 'ok', wait: 'wait', new: 'info', bad: 'bad', info: 'info', muted: 'muted' };
  const GROUPS = {
    order: (o) => ui.item({
      media: ui.itemMedia(ui.icon('bag')),
      title: `${o.count} ${o.count === 1 ? 'producto' : 'productos'}`,
      footer: `<div class="cx-vstack"><div class="cx-hstack">${o.photos.slice(0, 5).map((x) => ui.avatar(x, { shape: 'square', size: 'lg', bg: x })).join('')}${o.photos.length > 5 ? `<span data-slot="avatar" data-size="lg" data-shape="square" class="cn-avatar group/avatar"><span class="cn-avatar-fallback">+${o.photos.length - 5}</span></span>` : ''}</div>${o.extras?.length ? `<div class="cx-hstack">${o.extras.map((e) => ui.badge(e, { variant: 'outline' })).join('')}</div>` : ''}</div>`,
    }),
    pay: (p, c) => {
      const action = p.method === 'transfer' && p.tone === 'new' ? ['receipt', 'Revisar comprobante', 'image'] : p.method === 'card' ? ['stripe', 'Ver recibo de Stripe', 'card'] : null;
      return ui.item({
        media: ui.itemMedia(ui.icon('card')),
        title: `<span>Pago · ${money0(c.total)}</span>`,
        description: p.detail || '',
        actions: ui.badge(p.label, { tone: TONE[p.tone] }),
        footer: action ? ui.button({ label: action[1], icon: action[2], attrs: `data-bact="${action[0]}"`, cls: 'cx-fill' }) : '',
      });
    },
    delivery: (d) => {
      const info = d.track ? `<b>${d.track.steps[d.track.at]}</b> · ${d.track.courier.split(' ')[0]}, ${d.track.eta}` : d.map ? d.map.address : '';
      const more = (d.track || d.map) ? ui.button({ label: d.track ? 'Ver entrega' : 'Ver mapa', size: 'xs', attrs: 'data-bact="delivery"' }) : '';
      return ui.item({
        media: ui.itemMedia(ui.icon(d.mode === 'pickup' ? 'store' : 'truck')),
        title: `${d.label}${d.when ? ` · ${d.when}` : ''}`,
        description: info,
        actions: more,
        footer: d.track ? ui.progress((d.track.at / (d.track.steps.length - 1)) * 100, `Entrega: ${d.track.steps[d.track.at]}`) : '',
      });
    },
  };
  const GROUP_ORDER = ['order', 'pay', 'delivery'];
  const SIGNAL_TONE = { wait: 'wait', bad: 'bad', info: 'info' };
  const signals = (c) => {
    const list = c.request ? (Array.isArray(c.request) ? c.request : [c.request]) : [];
    const items = list.map((r, i) => ui.button({ icon: r.icon, size: 'icon-sm', variant: 'ghost', tone: SIGNAL_TONE[r.tone] || 'info', cls: 'cx-has-indicator', attrs: `data-bact="request" data-i="${i}" data-name="${r.title}" aria-haspopup="dialog" aria-label="${r.title}${r.text ? ': ' + r.text : ''}"` }).replace('</button>', `${ui.indicator(SIGNAL_TONE[r.tone] || 'info')}</button>`));
    if (c.note) items.push(ui.button({ icon: 'quote', size: 'icon-sm', variant: 'ghost', tone: 'note', cls: 'cx-has-indicator', attrs: `data-bact="note" data-name="Nota del cliente" aria-haspopup="dialog" aria-label="Nota de ${c.who.split(' ')[0]}: ${c.note}"` }).replace('</button>', `${ui.indicator('note')}</button>`));
    return items.length ? `<div class="cx-hstack" role="group" aria-label="Pendientes">${items.join('')}</div>` : '';
  };
  const CONTACT = {
    whatsapp: { icon: 'b-whatsapp', color: '#25D366', name: 'WhatsApp' },
    telegram: { icon: 'b-telegram', color: '#26A5E4', name: 'Telegram' },
    instagram: { icon: 'b-instagram', color: '#E4405F', name: 'Instagram' },
    phone: { icon: 'call', color: 'var(--foreground)', name: 'una llamada' },
  };
  const cardInner = (id) => {
    const c = CARDS[id], via = CONTACT[c.contact];
    const contact = via ? ui.button({ icon: via.icon, size: 'icon-sm', variant: 'ghost', tone: 'brand', attrs: `style="--brand:${via.color}" data-bact="contact" aria-label="Contactar a ${c.who} por ${via.name}, como lo pidió" title="Prefiere ${via.name}"` }) : '';
    const person = ui.item({
      media: ui.itemMedia(ui.avatar(c.who), 'default'),
      title: `<span class="cx-ellipsis" title="${c.who}">${c.who}</span>`,
      description: `<span class="cx-ellipsis" title="${c.sub}">${c.sub}</span>`,
      actions: contact || (c.status ? ui.badge(c.status[1], { tone: TONE[c.status[0]] }) : (c.pay ? '' : `<span class="cx-num cx-strong">${money0(c.total)}</span>`)),
      footer: (c.status && contact ? ui.badge(c.status[1], { tone: TONE[c.status[0]] }) : '') + signals(c),
    });
    const groups = GROUP_ORDER.filter((k) => c[k]).map((k) => GROUPS[k](c[k], c));
    const next = c.actions.find(([a]) => a === 'advance');
    return `<div data-slot="card-header" class="cn-card-header">${person}</div>`
      + (groups.length ? `<div data-slot="card-content" class="cn-card-content"><div data-slot="item-group" class="cn-item-group">${groups.join(ui.itemSeparator())}</div></div>` : '')
      + (next ? `<div data-slot="card-footer" class="cn-card-footer">${ui.button({ label: `${next[1]}<svg><use href="#right"/></svg>`, variant: 'default', size: 'default', attrs: 'data-bact="advance"', cls: 'cx-fill' })}</div>` : '');
  };

  const brd = $('.cx-board', root) || document.createElement('div'), brdLive = $('.cx-board-live', root);
  brd.innerHTML = LANES_B.map((l) => `<section class="cx-blane" data-lane="${l.id}" aria-label="${l.title}"><div class="cx-lane-h"><span>${l.title}</span><span class="cx-count"></span></div><div class="cx-lane-list">${l.cards.map((id) => `<div data-slot="card" data-size="sm" class="cn-card group/card cx-bcard" tabindex="0" data-card="${id}" aria-roledescription="tarjeta que se puede mover" aria-label="Pedido ${id} de ${CARDS[id].who}">${cardInner(id)}</div>`).join('')}</div></section>`).join('');
  const lanesEls = () => $$('.cx-blane', brd);
  const syncLanes = () => lanesEls().forEach((l) => {
    const list = $('.cx-lane-list', l), n = $$('.cx-bcard', list).length;
    $('.cx-count', l).textContent = n;
    const empty = $('.cx-lane-empty-b', list);
    if (!n && !$('.cx-bph', list) && !empty) list.insertAdjacentHTML('beforeend', '<div class="cx-lane-empty-b">Suelta aquí un pedido</div>');
    if ((n || $('.cx-bph', list)) && empty) empty.remove();
  });
  const sayCard = (card) => { const lane = card.closest('.cx-blane'), list = $$('.cx-bcard', lane); brdLive.textContent = `Pedido ${card.dataset.card}: ${lane.getAttribute('aria-label')}, posición ${list.indexOf(card) + 1} de ${list.length}`; };
  const flip = (els, change) => { // animate siblings from their old place to the new one
    const before = new Map(els.map((x) => [x, x.getBoundingClientRect()])); change();
    before.forEach((r, x) => { const n = x.getBoundingClientRect(); const dx = r.left - n.left, dy = r.top - n.top; if (dx || dy) x.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 200, easing: 'cubic-bezier(.22, 1, .36, 1)' }); });
  };
  let bDrag = null;
  brd.addEventListener('pointerdown', (e) => {
    const card = e.target.closest('.cx-bcard'); if (!card || e.button > 0 || card.hasAttribute('data-lifted') || e.target.closest('button, a, input')) return;
    bDrag = { card, x0: e.clientX, y0: e.clientY, lx: e.clientX, ly: e.clientY, live: false, id: e.pointerId, touch: e.pointerType !== 'mouse', held: false, pan: false };
    // on touch, a swipe moves the board and the page; holding still for a moment picks the card up
    if (bDrag.touch) { const d = bDrag; d.timer = setTimeout(() => { if (bDrag === d && !d.pan) { d.held = true; card.setAttribute('data-held', ''); navigator.vibrate?.(8); } }, 260); }
  });
  addEventListener('pointermove', (e) => {
    if (!bDrag || e.pointerId !== bDrag.id) return;
    const d = bDrag;
    if (d.pan) { brd.scrollLeft -= e.clientX - d.lx; scrollBy(0, -(e.clientY - d.ly)); d.lx = e.clientX; d.ly = e.clientY; return; }
    if (!d.live) {
      if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 6) return;
      if (d.touch && !d.held) { clearTimeout(d.timer); d.pan = true; d.lx = e.clientX; d.ly = e.clientY; return; }
      d.card.removeAttribute('data-held');
      d.live = true; const r = d.card.getBoundingClientRect();
      d.dx = d.x0 - r.left; d.dy = d.y0 - r.top;
      d.ph = document.createElement('div'); d.ph.className = 'cx-bph'; d.ph.style.height = r.height + 'px';
      d.card.after(d.ph); d.card.style.width = r.width + 'px'; d.card.classList.add('cx-dragging'); lib.appendChild(d.card);
      d.from = { list: d.ph.parentElement, next: d.ph.nextSibling };
    }
    d.card.style.left = e.clientX - d.dx + 'px'; d.card.style.top = e.clientY - d.dy + 'px';
    const lane = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.cx-blane');
    lanesEls().forEach((l) => l.toggleAttribute('data-over', l === lane));
    if (!lane) return;
    const list = $('.cx-lane-list', lane), cards = $$('.cx-bcard', list);
    const before = cards.find((c) => { const r = c.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; }) || null;
    if (d.ph.parentElement === list && (d.ph.nextElementSibling === before || (!before && d.ph === list.lastElementChild))) return;
    flip($$('.cx-bcard', brd), () => { list.insertBefore(d.ph, before); syncLanes(); });
  });
  const bEnd = () => {
    if (!bDrag) return; const d = bDrag; bDrag = null;
    clearTimeout(d.timer); d.card.removeAttribute('data-held');
    if (!d.live) return;
    lanesEls().forEach((l) => l.removeAttribute('data-over'));
    const to = d.ph.getBoundingClientRect(), from = d.card.getBoundingClientRect();
    d.card.classList.remove('cx-dragging'); d.card.style.cssText = '';
    d.ph.replaceWith(d.card); syncLanes();
    d.card.animate([{ transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) rotate(1.5deg)` }, { transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.22, 1, .36, 1)' });
    sayCard(d.card); emit();
  };
  addEventListener('pointerup', bEnd); addEventListener('pointercancel', bEnd);
  let lifted = null;
  brd.addEventListener('keydown', (e) => {
    const card = e.target.closest('.cx-bcard'); if (!card || e.target !== card) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (lifted === card) { card.removeAttribute('data-lifted'); lifted = null; brdLive.textContent = `Soltado. ${brdLive.textContent}`; sayCard(card); emit(); return; }
      lifted = card; card.setAttribute('data-lifted', ''); card._home = { list: card.parentElement, next: card.nextSibling };
      brdLive.textContent = `Levantaste el pedido ${card.dataset.card}. Flechas para moverlo, Espacio para soltar, Esc para cancelar.`; return;
    }
    if (lifted !== card) return;
    const list = card.parentElement, lane = card.closest('.cx-blane'), ls = lanesEls(), li = ls.indexOf(lane);
    let move = null;
    if (e.key === 'ArrowUp' && card.previousElementSibling?.classList.contains('cx-bcard')) move = () => list.insertBefore(card, card.previousElementSibling);
    if (e.key === 'ArrowDown' && card.nextElementSibling?.classList.contains('cx-bcard')) move = () => list.insertBefore(card.nextElementSibling, card);
    if ((e.key === 'ArrowLeft' && li > 0) || (e.key === 'ArrowRight' && li < ls.length - 1)) {
      const target = $('.cx-lane-list', ls[li + (e.key === 'ArrowLeft' ? -1 : 1)]), idx = $$('.cx-bcard', list).indexOf(card);
      move = () => target.insertBefore(card, $$('.cx-bcard', target)[idx] || null);
    }
    if (e.key === 'Escape') { e.preventDefault(); move = () => card._home.list.insertBefore(card, card._home.next); card.removeAttribute('data-lifted'); lifted = null; }
    if (!move) return;
    e.preventDefault(); flip($$('.cx-bcard', brd), () => { move(); syncLanes(); }); card.focus({ preventScroll: true }); card.scrollIntoView({ block: 'nearest', inline: 'nearest' }); sayCard(card);
  });
  // move the board sideways: drag its background with the mouse (touch pans natively), wheel with Shift,
  // and while a card is being dragged near an edge the board scrolls by itself so every lane is reachable
  let pan = null;
  brd.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button > 0 || e.target.closest('.cx-bcard, button, a')) return;
    pan = { x: e.clientX, left: brd.scrollLeft, moved: false };
  });
  addEventListener('pointermove', (e) => {
    if (!pan) return; const dx = e.clientX - pan.x;
    if (!pan.moved && Math.abs(dx) > 3) { pan.moved = true; brd.classList.add('panning'); }
    if (pan.moved) brd.scrollLeft = pan.left - dx;
  });
  addEventListener('pointerup', () => { if (!pan) return; pan = null; brd.classList.remove('panning'); });
  const boardEdges = () => { brd.toggleAttribute('data-start', brd.scrollLeft > 2); brd.toggleAttribute('data-end', brd.scrollLeft < brd.scrollWidth - brd.clientWidth - 2); };
  brd.addEventListener('scroll', boardEdges, { passive: true }); new ResizeObserver(boardEdges).observe(brd);
  let edgeX = null;
  const edgeTick = () => {
    if (!bDrag?.live) { edgeX = null; return; }
    if (edgeX != null) { const r = brd.getBoundingClientRect(), zone = 70; const v = edgeX < r.left + zone ? -(r.left + zone - edgeX) : edgeX > r.right - zone ? edgeX - (r.right - zone) : 0; if (v) brd.scrollLeft += Math.max(-18, Math.min(18, v / 3)); }
    requestAnimationFrame(edgeTick);
  };
  addEventListener('pointermove', (e) => { if (bDrag?.live) { if (edgeX == null) requestAnimationFrame(edgeTick); edgeX = e.clientX; } });

  // the card's own buttons
  let receiptFor = null, replyFor = null, deliveryFor = null, requestFor = null, requestIdx = 0;
  KINDS.request = () => {
    const c = CARDS[requestFor], list = Array.isArray(c.request) ? c.request : [c.request], r = list[requestIdx] || list[0];
    $('#mdl-title').textContent = r.title; $('#mdl-desc').textContent = `${c.who} · pedido ${requestFor}${r.when ? ' · ' + r.when : ''}`;
    body.innerHTML = `${r.text ? `<blockquote class="cx-req-full" data-tone="${r.tone}">${r.text}</blockquote>` : '<p class="cx-note" style="text-align:left">Sin mensaje del cliente.</p>'}${r.photo ? `<span class="cx-bc-ph" style="width:96px;background:${r.photo}"></span>` : ''}${list.length > 1 ? `<div class="cx-req-next"><b>También por resolver</b>${list.filter((x) => x !== r).map((x) => `<span><svg><use href="#${x.icon}"/></svg>${x.title}</span>`).join('')}</div>` : ''}`;
    const [yes, no] = r.actions;
    foot.innerHTML = (no ? btn('outline', no[1], `data-req-act="${no[0]}"`) : btn('outline', 'Cerrar', 'data-dismiss')) + (yes ? btn('default', yes[1], `data-req-act="${yes[0]}"`) : '');
    foot.firstElementChild.classList.add('cx-exit'); foot.lastElementChild.classList.add('cx-go');
  };
  document.addEventListener('click', (e) => {
    const r = e.target.closest('[data-req-act]'); if (!r || !requestFor) return;
    const card = $(`.cx-bcard[data-card="${requestFor}"]`, root), act = r.dataset.reqAct, idx = requestIdx; requestFor = null; closeModal();
    // run the card's action once the modal (and its history entry) is gone, so a follow-up modal can open
    setTimeout(() => { if (!card) return; const t = document.createElement('button'); t.dataset.bact = act; t.dataset.i = idx; t.hidden = true; card.appendChild(t); t.click(); t.remove(); }, 420);
  });
  let noteFor = null, stripeFor = null;
  KINDS.note = () => {
    const c = CARDS[noteFor];
    $('#mdl-title').textContent = `Nota de ${c.who.split(' ')[0]}`; $('#mdl-desc').textContent = `${c.who} · pedido ${noteFor}`;
    body.innerHTML = `<blockquote class="cx-req-full" data-tone="note">${c.note}</blockquote>`;
    foot.innerHTML = btn('outline', 'Cerrar', 'data-dismiss') + btn('default', 'Copiar nota', 'data-note-copy');
    foot.firstElementChild.classList.add('cx-exit'); foot.lastElementChild.classList.add('cx-go');
  };
  KINDS.stripe = () => {
    const c = CARDS[stripeFor], p = c.pay;
    $('#mdl-title').textContent = 'Recibo de pago'; $('#mdl-desc').textContent = `${c.who} · pedido ${stripeFor}`;
    body.innerHTML = `<div class="cx-stripe"><div class="cx-stripe-top"><span class="cx-stripe-amt cx-num">${money0(c.total)}</span><span data-slot="badge" class="cn-badge group/badge cx-tone-ok"><span class="cx-dot"></span>Pagado</span></div><dl><dt>Medio</dt><dd>${p.detail.split(' · ')[0]}</dd><dt>Procesado por</dt><dd>Stripe</dd><dt>Fecha</dt><dd>8 oct 2026 · 09:14</dd><dt>ID del pago</dt><dd class="cx-num">pi_3Q${stripeFor.slice(1)}xK8aR2</dd><dt>Comisión</dt><dd class="cx-num">${money0(Math.round(c.total * 0.039))}</dd><dt>Recibes</dt><dd class="cx-num"><b>${money0(c.total - Math.round(c.total * 0.039))}</b></dd></dl></div>`;
    foot.innerHTML = btn('outline', 'Cerrar', 'data-dismiss') + `<a data-slot="button" class="cn-button cn-button-variant-default cn-button-size-default group/button cx-go" href="https://dashboard.stripe.com/test/payments" target="_blank" rel="noopener">Abrir en Stripe</a>`;
    foot.firstElementChild.classList.add('cx-exit');
  };
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-note-copy]') || !noteFor) return;
    const t = e.target.closest('[data-note-copy]'), text = CARDS[noteFor].note;
    try { navigator.clipboard.writeText(text).then(() => { t.textContent = 'Copiada'; }, () => { getSelection().selectAllChildren($('.cx-req-full', body)); }); } catch { getSelection().selectAllChildren($('.cx-req-full', body)); }
  });
  KINDS.delivery = () => {
    const c = CARDS[deliveryFor], d = c.delivery;
    $('#mdl-title').textContent = d.label; $('#mdl-desc').textContent = `${c.who} · pedido ${deliveryFor}${d.when ? ' · ' + d.when : ''}`;
    const steps = d.track ? `<div class="cx-dl-steps" style="--n:${d.track.steps.length}">${d.track.steps.map((st, i) => `<div ${i < d.track.at ? 'data-done' : i === d.track.at ? 'data-now aria-current="step"' : ''}><i></i><span>${st}</span></div>`).join('')}</div>` : '';
    const courier = d.track ? `<div class="cx-dl-courier"><span data-slot="avatar" data-size="default" class="cn-avatar cx-av" style="--h:${hue(d.track.courier)}"><span class="cn-avatar-fallback">${ini(d.track.courier)}</span></span><div><b>${d.track.courier}</b><small>Domiciliario · ${d.track.vehicle}</small></div><div class="cx-dl-eta"><small>Llega en</small><b>${d.track.eta}</b></div></div>` : '';
    body.innerHTML = `<div class="cx-dl">${d.map ? `<div class="cx-dl-map">${miniMap(d.map)}</div><div class="cx-dl-addr"><svg><use href="#mappin"/></svg><div><b>${d.map.address}</b><small>${d.map.detail}</small></div></div>` : ''}${steps}${courier}</div>`;
    foot.innerHTML = btn('outline', 'Cerrar', 'data-dismiss') + (d.map ? `<a data-slot="button" class="cn-button cn-button-variant-default cn-button-size-default group/button cx-go" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.map.address)}" target="_blank" rel="noopener"><svg><use href="#mappin"/></svg>Abrir en Maps</a>` : '');
    foot.firstElementChild.classList.add('cx-exit');
  };
  const redraw = (id) => { const card = $(`.cx-bcard[data-card="${id}"]`, root); easeHeight(card, () => { card.innerHTML = cardInner(id); }); card.animate([{ boxShadow: '0 0 0 2px var(--selected)' }, { boxShadow: '0 0 0 1px var(--border)' }], { duration: 700, easing: 'ease-out' }); };
  const onCardButton = (e) => {
    const b = e.target.closest('[data-bact]'); if (!b) return;
    const card = b.closest('.cx-bcard'); if (!card) return; const id = card.dataset.card, act = b.dataset.bact, c = CARDS[id];
    on.action?.(JSON.stringify({ id, action: act }));
    if (act === 'advance') {
      const ls = lanesEls().filter((l) => l.dataset.lane !== 'cancel'), li = ls.indexOf(card.closest('.cx-blane')); if (li < 0 || li >= ls.length - 1) return;
      const NEXT = Object.fromEntries(LANES_B.map((l) => [l.id, l.next ? [['advance', l.next, 'secondary']] : []]));
      const to = ls[li + 1]; c.actions = NEXT[to.dataset.lane] ?? c.actions;
      if (to.dataset.lane === 'done') { if (c.delivery) delete c.delivery.track; c.status = ['ok', 'Entregado']; }
      flip($$('.cx-bcard', brd), () => { $('.cx-lane-list', to).prepend(card); card.innerHTML = cardInner(id); syncLanes(); });
      card.focus({ preventScroll: true }); sayCard(card); emit();
    }
    if (act === 'receipt') { receiptFor = id; openModal('receipt', 'auto'); }
    if (act === 'delivery') { deliveryFor = id; openModal('delivery', 'auto'); }
    if (act === 'request') { requestFor = id; requestIdx = +(b.dataset.i || 0); openModal('request', 'auto'); }
    if (act === 'note') { noteFor = id; openModal('note', 'auto'); }
    if (act === 'stripe') { stripeFor = id; openModal('stripe', 'auto'); }
    if (act === 'contact') brdLive.textContent = `Abriendo ${CONTACT[c.contact].name} con ${c.who}`;
    if (act === 'reply') { replyFor = id; openModal('reply', 'auto'); }
    if (act === 'cancel-yes') { delete c.request; c.status = ['bad', 'Cancelado']; c.pay = { ...c.pay, tone: 'muted', label: `Devuelto ${money0(c.total)}` }; delete c.delivery; c.actions = []; if (!card.closest('.cx-board')) { redraw(id); return; } const to = $('[data-lane=cancel] .cx-lane-list', brd); flip($$('.cx-bcard', brd), () => { to.prepend(card); card.innerHTML = cardInner(id); syncLanes(); }); to.closest('.cx-blane').scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }); brdLive.textContent = `Pedido ${id} cancelado y devuelto`; emit(); }
    if (act === 'cancel-no') { const rest = Array.isArray(c.request) ? c.request.filter((_, i) => i !== +(b.dataset.i || 0)) : []; if (rest.length) c.request = rest.length === 1 ? rest[0] : rest; else delete c.request; c.actions = [['advance', 'Preparar', 'secondary']]; redraw(id); }
    if (act === 'refund') { if (Array.isArray(c.request)) { c.request = c.request.filter((_, i) => i !== +(b.dataset.i || 0)); if (c.request.length === 1) c.request = c.request[0]; } else delete c.request; c.pay = { ...c.pay, tone: 'info', label: `Reembolsado ${money0(c.total)}` }; redraw(id); }
  };
  root.addEventListener('click', onCardButton);
  
  const sizes = $('.cx-card-sizes', root); if (sizes) sizes.innerHTML = SIZES.map(([t, d, id]) => `<div class="cx-cs-col"><div class="cx-cs-h"><b>${t}</b><span>${d}</span></div><div data-slot="card" data-size="sm" class="cn-card group/card cx-bcard cx-bcard-static" data-card="${id}" aria-label="${t}">${cardInner(id)}</div></div>`).join('');
  KINDS.receipt = () => {
    const c = CARDS[receiptFor];
    $('#mdl-title').textContent = 'Comprobante de pago'; $('#mdl-desc').textContent = `${c.who} · pedido ${receiptFor}`;
    body.innerHTML = `<div class="cx-rcpt"><div class="cx-rcpt-shot" role="img" aria-label="Captura de la transferencia"><span class="cx-rcpt-ok"><svg><use href="#check"/></svg></span><b>Transferencia exitosa</b><span class="cx-rcpt-amt">${money0(c.total)}</span><dl><dt>Para</dt><dd>Barbería El Roble</dd><dt>Desde</dt><dd>${c.who}</dd><dt>Referencia</dt><dd class="cx-num">M${receiptFor.slice(1)}7731</dd><dt>Fecha</dt><dd>8 oct 2026 · 10:42</dd></dl></div><div class="cx-rcpt-check"><span>Monto del pedido</span><b class="cx-num">${money0(c.total)}</b><span data-slot="badge" class="cn-badge group/badge cx-tone-ok"><span class="cx-dot"></span>Coincide</span></div></div>`;
    foot.innerHTML = btn('outline', 'Rechazar', 'data-rcpt="no"') + btn('default', 'Aprobar pago', 'data-rcpt="yes"');
    foot.firstElementChild.classList.add('cx-exit'); foot.lastElementChild.classList.add('cx-go');
  };
  KINDS.reply = () => {
    const c = CARDS[replyFor];
    $('#mdl-title').textContent = `Responder a ${c.who}`; $('#mdl-desc').textContent = `Queja del pedido ${replyFor}`;
    body.innerHTML = `<div class="cx-bc-req" data-tone="bad" style="margin:0"><div class="cx-bc-req-h"><svg><use href="#info"/></svg><b>Queja</b><small>${(c.request.when ?? c.request[0]?.when)}</small></div><p>«${(c.request.text ?? c.request[0]?.text)}»</p></div><div data-slot="field" class="cn-field cn-field-orientation-vertical group/field"><label data-slot="label" class="cn-label" for="rp-t">Tu respuesta</label><textarea data-slot="textarea" class="cn-textarea" id="rp-t" rows="4">Hola ${c.who.split(' ')[0]}, lo siento mucho. Te enviamos una nueva hoy sin costo.</textarea><p data-slot="field-description" class="cn-field-description">Le llega por WhatsApp.</p></div>`;
    foot.innerHTML = btn('outline', 'Cancelar', 'data-dismiss') + btn('default', 'Enviar respuesta', 'data-reply-send');
    foot.firstElementChild.classList.add('cx-exit'); foot.lastElementChild.classList.add('cx-go');
  };
  document.addEventListener('click', (e) => {
    const r = e.target.closest('[data-rcpt]');
    if (r && receiptFor) {
      const c = CARDS[receiptFor], ok = r.dataset.rcpt === 'yes';
      c.pay = ok ? { method: 'transfer', tone: 'ok', label: 'Pagado', detail: c.pay?.detail } : { method: 'transfer', tone: 'bad', label: 'Rechazado', detail: c.pay?.detail };
      c.actions = ok ? [['advance', 'Preparar', 'secondary']] : [];
      redraw(receiptFor); brdLive.textContent = ok ? `Pago de ${c.who} aprobado` : `Comprobante de ${c.who} rechazado`;
      receiptFor = null; closeModal();
    }
    if (e.target.closest('[data-reply-send]') && replyFor) {
      const c = CARDS[replyFor]; c.request = { ...(Array.isArray(c.request) ? c.request[0] : c.request), tone: 'info', icon: 'check', title: 'Queja respondida', when: 'ahora', text: c.request.text, actions: [['refund', 'Reembolsar', 'ghost']] };
      redraw(replyFor); replyFor = null; closeModal();
    }
  });
  syncLanes();}
