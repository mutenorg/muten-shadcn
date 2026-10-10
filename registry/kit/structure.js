// kit/structure.js - the app's structure from the reference artifact, all data-driven and built from atoms:
//   phoneShell  the phone frame: big title that shrinks on scroll, back + two actions, three fixed bottom tabs
//   share       Storio's share sheet inside the adaptive modal (link or product card, Copiar, brand targets, QR)
//   appShell    Sidebar (store switcher, groups, counts, person) + page header + detail Sheet + Command (⌘K)
//   booking     week strip + hours in one piece (dot = something left, closed days, a full day's empty state)
//   wizard      «Nueva cita» in 4 steps inside the adaptive modal (Stepper, choice lists, day tiles, summary)

const list = (v) => (Array.isArray(v) ? v : []);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// ── phone shell ──
// i: tabs [{label, icon, badge}], rows [{tab, section, title, subtitle, value}]; on.select(label)
export function phoneShell(root, i, core, on) {
  const { $, $$ } = core;
  const tabs = list(i.tabs), rows = list(i.rows);
  root.innerHTML = `<div class="cx-device cx-ph-device" data-kind="phone"><div class="cx-device-screen"><div class="cx-ph-screen">
    <div class="cx-ph-status"><span>9:41</span><span class="cx-ph-island"></span><span>100 %</span></div>
    <header class="cx-ph-head"><div class="cx-ph-bar">
      <button data-slot="button" class="cn-button cn-button-variant-ghost cn-button-size-icon group/button" aria-label="Atrás" title="Atrás"><svg><use href="#left"/></svg></button>
      <b class="cx-ph-small"></b>
      <div class="cx-hstack" style="gap:2px;width:auto;flex-wrap:nowrap"><button data-slot="button" class="cn-button cn-button-variant-ghost cn-button-size-icon group/button" aria-label="Buscar" title="Buscar"><svg><use href="#search"/></svg></button><button data-slot="button" class="cn-button cn-button-variant-ghost cn-button-size-icon group/button" aria-label="Más opciones" title="Más opciones"><svg><use href="#more"/></svg></button></div>
    </div></header>
    <div class="cx-ph-body cx-scroll"></div>
    <nav class="cx-ph-nav" aria-label="Principal">${tabs.map((t, k) => `<button class="cn-button cn-button-variant-ghost cx-size-tile cx-ph-tab" data-tab="${k}" ${k === 0 ? 'aria-current="page"' : ''}>${t.badge ? `<span class="cx-ph-ico"><svg><use href="#${t.icon}"/></svg><i class="cx-ph-badge">${esc(t.badge)}</i></span>` : `<svg><use href="#${t.icon}"/></svg>`}<span>${esc(t.label)}</span></button>`).join('')}</nav>
  </div></div></div>`;
  const head = $('.cx-ph-head', root), phBody = $('.cx-ph-body', root);
  const screen = (label) => {
    const mine = rows.filter((r) => r.tab === label);
    let html = '', section = null;
    mine.forEach((r) => {
      if (r.section && r.section !== section) { section = r.section; html += `<p class="cx-ph-sec">${esc(section)}</p>`; }
      html += `<div class="cx-ph-row">${r.subtitle ? `<div><b>${esc(r.title)}</b><small>${esc(r.subtitle)}</small></div>` : `<b>${esc(r.title)}</b>`}<span class="cx-time">${esc(r.value)}</span></div>`;
    });
    return html;
  };
  const show = (label) => {
    $('.cx-ph-small', root).textContent = label;
    phBody.innerHTML = `<h1 class="cx-ph-big">${esc(label)}</h1>${screen(label)}`; phBody.scrollTop = 0; head.removeAttribute('data-compact');
    phBody.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' });
  };
  phBody.addEventListener('scroll', () => head.toggleAttribute('data-compact', phBody.scrollTop > 30), { passive: true });
  $$('.cx-ph-tab', root).forEach((t) => t.onclick = () => {
    if (t.hasAttribute('aria-current')) { phBody.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    $$('.cx-ph-tab', root).forEach((x) => x.removeAttribute('aria-current')); t.setAttribute('aria-current', 'page');
    const label = tabs[+t.dataset.tab].label; show(label); on.select?.(label);
  });
  if (tabs.length) show(tabs[0].label);
}

// ── share sheet ──
// i: label, variant, kind "link" | "product", name, initials, url, text, product {name, meta, price, image}
const enc = encodeURIComponent;
const targetsFor = (url, text) => [
  { name: 'QR', icon: 'qrc', plain: true, qr: true },
  { name: 'WhatsApp', icon: 'b-whatsapp', color: '#25D366', href: `https://wa.me/?text=${enc(text + ' ' + url)}` },
  { name: 'Instagram', icon: 'b-instagram', color: '#E4405F', copy: 'Enlace copiado. Pégalo en tu bio o en una historia de Instagram.' },
  { name: 'TikTok', icon: 'b-tiktok', color: '#000000', copy: 'Enlace copiado. Pégalo en tu bio de TikTok.' },
  { name: 'Facebook', icon: 'b-facebook', color: '#0866FF', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
  { name: 'X', icon: 'b-x', color: '#000000', href: `https://x.com/intent/post?text=${enc(text)}&url=${enc(url)}` },
  { name: 'Telegram', icon: 'b-telegram', color: '#26A5E4', href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}` },
  { name: 'Gmail', icon: 'b-gmail', color: '#EA4335', href: `https://mail.google.com/mail/?view=cm&su=${enc(text)}&body=${enc(url)}` },
];
// a row you can drag sideways with the mouse too (touch already pans); a drag never fires the tap underneath
const dragScroll = (row) => {
  let d = null;
  row.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || e.button > 0) return; d = { x: e.clientX, left: row.scrollLeft, moved: false }; });
  addEventListener('pointermove', (e) => { if (!d) return; const dx = e.clientX - d.x; if (Math.abs(dx) > 4) { d.moved = true; row.classList.add('dragging'); } if (d.moved) row.scrollLeft = d.left - dx; });
  addEventListener('pointerup', () => { if (!d) return; const moved = d.moved; d = null; row.classList.remove('dragging'); if (moved) row.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); }, { capture: true, once: true }); });
};
export function share(root, i, core) {
  const { ui, $, openModal, CONTENT, body, foot, mdl, easeHeight, money0 } = core;
  const product = i.kind === 'product' && i.product ? i.product : null;
  const url = /^https?:\/\//.test(i.url || '') ? i.url : `https://${i.url || ''}`;
  const shown = url.replace(/^https?:\/\//, '');
  const text = i.text || (product ? `${product.name} en ${i.name}` : `Reserva en ${i.name}`);
  const title = product ? 'Compartir producto' : 'Compartir enlace';
  root.innerHTML = ui.button({ label: `${i.icon === 'none' ? '' : ui.icon('share')}${esc(i.label || 'Compartir')}`, variant: i.variant || 'default', size: 'default' });
  const msg = (t) => { const m = $('.cx-sh-msg', body); if (m) m.textContent = t; };
  const copy = (ok) => {
    const fb = () => { const u = $('.cx-sh-url', body); if (u) getSelection().selectAllChildren(u); msg('Selecciona el enlace y cópialo.'); };
    try { navigator.clipboard.writeText(url).then(() => { msg(ok); const b = $('.cx-sh-copybtn', body); if (b) { b.textContent = 'Copiado'; setTimeout(() => { b.textContent = 'Copiar'; }, 1600); } }, fb); } catch { fb(); }
  };
  const main = () => {
    $('#mdl-title').textContent = title;
    const card = product
      ? `<div class="cx-sh-prod" style="--g:${esc(product.image || 'var(--muted)')}"><span class="cx-sh-tag">${money0(Number(product.price) || 0)}</span><div class="cx-sh-pinfo"><b>${esc(product.name)}</b><span>${esc(product.meta)}</span></div></div>`
      : `<div class="cx-sh-card"><span class="cx-sh-av">${esc(i.initials)}</span><b>${esc(i.name)}</b><span>${esc(shown)}</span></div>`;
    body.innerHTML = `<div class="cx-sh">${card}
      <div class="cx-sh-copy"><span class="cx-sh-url cx-num">${esc(shown)}</span><button class="cn-button cn-button-variant-default cn-button-size-sm cx-sh-copybtn" data-sh-copy>Copiar</button></div>
      <span class="cx-sh-lbl">Compartir en</span>
      <div class="cx-sh-targets">${targetsFor(url, text).map((t, k) => { const ico = `<span class="cx-sh-ic${t.plain ? ' plain' : ''}" style="${t.color ? `--brand:${t.color}` : ''}"><svg><use href="#${t.icon}"/></svg></span><span class="cx-sh-l">${t.name}</span>`; return t.href ? `<a class="cn-button cn-button-variant-ghost cx-size-tile-lg cx-sh-tg" href="${t.href}" target="_blank" rel="noopener" data-t="${k}">${ico}</a>` : `<button class="cn-button cn-button-variant-ghost cx-size-tile-lg cx-sh-tg" data-t="${k}">${ico}</button>`; }).join('')}</div>
      <p class="cx-note cx-sh-msg" aria-live="polite" style="text-align:left"></p></div>`;
    const row = $('.cx-sh-targets', body); dragScroll(row);
    const edge = () => { row.toggleAttribute('data-end', row.scrollLeft >= row.scrollWidth - row.clientWidth - 2); row.toggleAttribute('data-scrolled', row.scrollLeft > 2); };
    row.addEventListener('scroll', edge, { passive: true }); requestAnimationFrame(edge);
    row.addEventListener('click', (e) => { const t = e.target.closest('[data-t]'); if (!t) return; const x = targetsFor(url, text)[+t.dataset.t]; if (x.copy) copy(x.copy); if (x.qr) easeHeight(mdl, qr); });
  };
  const qr = () => {
    $('#mdl-title').textContent = 'Código QR';
    body.innerHTML = `<div class="cx-sh cx-sh-qrview"><div class="cx-qr" style="width:15rem;max-width:72%;aspect-ratio:1;height:auto" role="img" aria-label="Código QR de ${esc(shown)}"><div class="cx-qr-mark"><span>${esc(i.initials)}</span></div></div><span class="cx-sh-qrurl cx-num">${esc(shown)}</span><button data-slot="button" class="cn-button cn-button-variant-outline cn-button-size-sm group/button" data-sh-back><svg><use href="#left"/></svg>Volver</button></div>`;
    import('@muten/shadcn/registry/kit/qrcode.js').then(({ default: qrcode }) => {
      const q = qrcode(0, 'H'); q.addData(url); q.make(); const n = q.getModuleCount(); let d = '';
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
      $('.cx-qr', body)?.insertAdjacentHTML('afterbegin', `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" aria-hidden="true"><path d="${d}" fill="var(--qr-ink)"/></svg>`);
    });
    body.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 });
  };
  const kind = `share-${Math.random().toString(36).slice(2, 8)}`;
  CONTENT[kind] = () => {
    $('#mdl-desc').textContent = ''; main();
    foot.innerHTML = navigator.share ? ui.button({ label: `${ui.icon('share')}Compartir en otra app`, variant: 'default', size: 'default', cls: 'cx-go', attrs: 'data-sh-native' }) : '';
    body.dataset.share = kind;
  };
  root.addEventListener('click', (e) => { if (e.target.closest('button')) openModal(kind, 'auto'); });
  document.addEventListener('click', async (e) => {
    if (body.dataset.share !== kind || !mdl.contains(e.target)) return;
    if (e.target.closest('[data-sh-copy]')) copy('Enlace copiado.');
    if (e.target.closest('[data-sh-back]')) easeHeight(mdl, main);
    if (e.target.closest('[data-sh-native]')) { try { await navigator.share({ title: text, url }); } catch {} }
  });
}

// ── app shell ──
// i: brand {name, plan}, user {name, email}, nav [{group, icon, label, count}], page,
//    pages [{name, title, description, actions [{label, variant, icon}]}], rows [{page, id, title, description,
//    badge, tone, amount, sheet [{icon, title, description, badge, tone, amount, photos}], timeline [{label, when}]}],
//    commands [{icon, label, page}]; on.navigate(page) · on.open(id) · on.action(label)
export function appShell(root, i, core, on) {
  const { ui, $, $$, openModal, closeModal, CONTENT, body, foot, mdl, money0, fold } = core;
  const nav = list(i.nav), pages = list(i.pages), rows = list(i.rows), commands = list(i.commands);
  const groups = [...new Set(nav.map((n) => n.group))].map((g) => [g, nav.filter((n) => n.group === g)]);
  root.classList.add('cx-app'); const app = root;
  let appPage = i.page || nav[0]?.label || '';
  const aside = (r) => `${r.badge ? ui.badge(esc(r.badge), { tone: r.tone || 'muted' }) : ''}${r.amount != null && r.amount !== '' ? ui.text(money0(Number(r.amount)), 'strong') : ''}`;
  const navBtn = (n) => `<li data-slot="sidebar-menu-item" class="group/menu-item cx-sb-li" style="position:relative"><button data-slot="sidebar-menu-button" data-size="default" data-active="${n.label === appPage}" ${n.label === appPage ? 'aria-current="page"' : ''} class="cn-sidebar-menu-button cn-sidebar-menu-button-variant-default cn-sidebar-menu-button-size-default peer/menu-button" data-nav="${esc(n.label)}" data-tipname="${esc(n.label)}">${ui.icon(n.icon)}<span>${esc(n.label)}</span></button>${n.count ? `<div data-slot="sidebar-menu-badge" class="cn-sidebar-menu-badge">${esc(n.count)}</div>` : ''}</li>`;
  const pageBody = () => {
    const mine = rows.filter((r) => r.page === appPage);
    if (mine.length) return `<div data-slot="item-group" class="cn-item-group cx-app-list" role="list">${mine.map((r) => `<button class="cn-item cn-item-variant-outline cn-item-size-sm cx-app-row" ${r.sheet ? `data-open-row="${esc(r.id)}"` : ''}>${ui.itemMedia(ui.avatar(r.title), 'default')}<div class="cn-item-content"><div class="cn-item-title">${esc(r.title)}</div><p class="cn-item-description">${esc(r.description)}</p></div><div class="cn-item-actions">${aside(r)}</div></button>`).join('')}</div>`;
    return `<div data-slot="empty" class="cn-empty" style="padding:48px 12px"><div class="cn-empty-header"><div class="cn-empty-media cn-empty-media-icon">${ui.icon(nav.find((n) => n.label === appPage)?.icon || 'store')}</div><div class="cn-empty-title">${esc(appPage)}</div><div class="cn-empty-description">${esc(i.empty || 'Todavía no hay nada aquí.')}</div></div></div>`;
  };
  const twoLine = (a, b) => `<span class="cx-sb-two">${ui.text(esc(a), 'heading')}${ui.text(esc(b), 'caption')}</span>`;
  const render = () => {
    const meta = pages.find((p) => p.name === appPage) || { title: appPage, description: '', actions: [] };
    app.innerHTML = `
      <div class="group cx-app-sb" data-slot="sidebar" data-state="${app.dataset.collapsed ? 'collapsed' : 'expanded'}" data-collapsible="${app.dataset.collapsed ? 'icon' : ''}" data-side="left" data-variant="sidebar">
        <div data-slot="sidebar-inner" class="cn-sidebar-inner">
          <div data-slot="sidebar-header" class="cn-sidebar-header"><ul class="cn-sidebar-menu"><li class="group/menu-item"><button data-slot="sidebar-menu-button" data-size="lg" class="cn-sidebar-menu-button cn-sidebar-menu-button-variant-default cn-sidebar-menu-button-size-lg peer/menu-button" data-tipname="${esc(i.brand?.name)}">${ui.avatar(i.brand?.short || i.brand?.name || '', { shape: 'square', size: 'default' })}${twoLine(i.brand?.name, i.brand?.plan)}${ui.icon('updown')}</button></li></ul></div>
          <div data-slot="sidebar-content" class="cn-sidebar-content">${groups.map(([label, items]) => `<div data-slot="sidebar-group" class="cn-sidebar-group"><div data-slot="sidebar-group-label" class="cn-sidebar-group-label">${esc(label)}</div><div class="cn-sidebar-group-content"><ul data-slot="sidebar-menu" class="cn-sidebar-menu">${items.map(navBtn).join('')}</ul></div></div>`).join('')}</div>
          <div data-slot="sidebar-footer" class="cn-sidebar-footer"><ul class="cn-sidebar-menu"><li class="group/menu-item"><button data-slot="sidebar-menu-button" data-size="lg" class="cn-sidebar-menu-button cn-sidebar-menu-button-variant-default cn-sidebar-menu-button-size-lg peer/menu-button" data-tipname="${esc(i.user?.name)}">${ui.avatar(i.user?.name || '', { size: 'default' })}${twoLine(i.user?.name, i.user?.email)}${ui.icon('more')}</button></li></ul></div>
        </div>
      </div>
      <div class="cn-sheet-overlay cx-app-scrim" data-app-scrim hidden></div>
      <main data-slot="sidebar-inset" class="cn-sidebar-inset cx-app-main">
        <header class="cx-app-top">
          ${ui.button({ icon: 'menu-lines', variant: 'ghost', size: 'icon-sm', attrs: 'data-sb-toggle aria-label="Mostrar u ocultar el menú" title="Menú (Ctrl B)"' })}
          <div data-slot="separator" class="cn-separator cn-separator-vertical cx-app-vsep"></div>
          <nav aria-label="Migas"><ol data-slot="breadcrumb-list" class="cn-breadcrumb-list"><li class="cn-breadcrumb-item"><a class="cn-breadcrumb-link" href="#" data-home>${esc(i.brand?.short || i.brand?.name)}</a></li><li class="cn-breadcrumb-separator" role="presentation">${ui.icon('right')}</li><li class="cn-breadcrumb-item"><span class="cn-breadcrumb-page" aria-current="page">${esc(meta.title)}</span></li></ol></nav>
          <span class="cx-grow"></span>
          ${ui.button({ label: `${ui.icon('search')}<span class="cx-app-search-t">Buscar…</span><kbd data-slot="kbd" class="cn-kbd">⌘K</kbd>`, size: 'sm', cls: 'cx-app-search', attrs: 'data-cmd-open aria-keyshortcuts="Control+K Meta+K"' })}
        </header>
        <div class="cx-app-page">
          <div class="cx-app-head"><div class="cx-vstack" style="gap:2px">${ui.text(esc(meta.title), 'title', 'h1')}${meta.description ? ui.text(esc(meta.description), 'muted', 'p') : ''}</div><div class="cx-hstack">${list(meta.actions).map((a) => ui.button({ label: `${a.icon ? ui.icon(a.icon) : ''}${esc(a.label)}`, variant: a.variant || 'outline', size: 'sm', attrs: `data-app-act="${esc(a.label)}"` })).join('')}</div></div>
          ${pageBody()}
        </div>
        <div class="cn-sheet-overlay cx-app-scrim" data-sheet-scrim hidden></div>
        <aside data-slot="sheet-content" data-side="right" class="cn-sheet-content cx-app-sheet" role="dialog" aria-modal="false" aria-label="Detalle" hidden></aside>
      </main>`;
    syncTips();
  };
  const syncTips = () => $$('[data-tipname]', app).forEach((b) => { if (app.dataset.collapsed && !app.dataset.mobile) b.dataset.name = b.dataset.tipname; else delete b.dataset.name; });
  const sheet = () => $('.cx-app-sheet', app), sheetScrim = () => $('[data-sheet-scrim]', app);
  const openRow = (id) => {
    const r = rows.find((x) => String(x.id) === String(id)), s = sheet(); if (!r || !s) return;
    const photos = (x) => (list(x.photos).length ? `<div class="cx-hstack">${list(x.photos).map((bg) => ui.avatar('', { shape: 'square', size: 'lg', bg })).join('')}</div>` : '');
    const items = list(r.sheet).map((x) => ui.item({ media: ui.itemMedia(ui.icon(x.icon || 'info')), title: esc(x.title), description: esc(x.description || ''), actions: aside(x), footer: photos(x) }));
    const tl = list(r.timeline);
    if (tl.length) items.push(ui.item({ media: ui.itemMedia(ui.icon('clock')), title: 'Historial', footer: `<ol class="cx-timeline">${tl.map((t, k) => `<li ${k === tl.length - 1 ? 'data-now' : ''}>${ui.text(esc(t.label), k === tl.length - 1 ? 'label' : 'body')}${ui.text(esc(t.when), 'caption')}</li>`).join('')}</ol>` }));
    s.innerHTML = `<div data-slot="sheet-header" class="cn-sheet-header"><div class="cx-hstack" style="justify-content:space-between;flex-wrap:nowrap"><div class="cx-vstack" style="gap:2px">${ui.text(esc(r.sheetTitle || r.title), 'title', 'h2')}${ui.text(esc(r.sheetDescription || r.description), 'muted', 'p')}</div>${ui.button({ icon: 'x', variant: 'ghost', size: 'icon-sm', attrs: 'data-sheet-close aria-label="Cerrar" title="Cerrar"' })}</div></div>
      <div class="cx-app-sheet-body"><div data-slot="item-group" class="cn-item-group">${items.join(ui.itemSeparator())}</div></div>
      ${r.primary || r.secondary ? `<div data-slot="sheet-footer" class="cn-sheet-footer">${r.secondary ? ui.button({ label: esc(r.secondary), size: 'default', cls: 'cx-exit', attrs: `data-app-act="${esc(r.secondary)}"` }) : ''}${r.primary ? ui.button({ label: `${esc(r.primary)}${ui.icon('right')}`, variant: 'default', size: 'default', cls: 'cx-go', attrs: `data-app-act="${esc(r.primary)}"` }) : ''}</div>` : ''}`;
    s.hidden = false; sheetScrim().hidden = false;
    requestAnimationFrame(() => { s.dataset.state = 'open'; sheetScrim().dataset.state = 'open'; });
    $('[data-sheet-close]', s).focus({ preventScroll: true });
    $$('[data-open-row]', app).forEach((x) => x.toggleAttribute('data-active', x.dataset.openRow === String(id)));
    on.open?.(String(id));
  };
  const closeSheet = () => { const s = sheet(); if (!s || s.hidden) return; s.dataset.state = 'closed'; sheetScrim().dataset.state = 'closed'; setTimeout(() => { if (s.dataset.state === 'closed') { s.hidden = true; sheetScrim().hidden = true; } }, 220); $$('[data-open-row]', app).forEach((x) => x.removeAttribute('data-active')); };
  const toggleSidebar = () => {
    if (app.dataset.mobile) { app.toggleAttribute('data-sb-open'); $('[data-app-scrim]', app).hidden = !app.hasAttribute('data-sb-open'); return; }
    if (app.dataset.collapsed) delete app.dataset.collapsed; else app.dataset.collapsed = '1';
    const g = $('.cx-app-sb', app); g.dataset.state = app.dataset.collapsed ? 'collapsed' : 'expanded'; g.dataset.collapsible = app.dataset.collapsed ? 'icon' : ''; syncTips();
  };
  const go = (page) => { appPage = page; const col = app.dataset.collapsed; render(); if (col) app.dataset.collapsed = col; app.removeAttribute('data-sb-open'); on.navigate?.(page); };
  app.addEventListener('click', (e) => {
    if (e.target.closest('[data-sb-toggle]')) return toggleSidebar();
    if (e.target.closest('[data-app-scrim]')) return toggleSidebar();
    if (e.target.closest('[data-home]')) { e.preventDefault(); return go(nav[0]?.label || appPage); }
    const n = e.target.closest('[data-nav]'); if (n) return go(n.dataset.nav);
    const o = e.target.closest('[data-open-row]'); if (o) return openRow(o.dataset.openRow);
    if (e.target.closest('[data-sheet-close], [data-sheet-scrim]')) return closeSheet();
    if (e.target.closest('[data-cmd-open]')) return openCmd();
    const a = e.target.closest('[data-app-act]'); if (a) on.action?.(a.dataset.appAct);
  });
  app.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheet() && !sheet().hidden) { e.stopPropagation(); closeSheet(); } });
  document.addEventListener('keydown', (e) => {
    if (!app.isConnected) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (mdl.hidden) openCmd(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b' && app.contains(document.activeElement)) { e.preventDefault(); toggleSidebar(); }
  });
  new ResizeObserver(() => { const m = app.clientWidth < 720; if (!!app.dataset.mobile !== m) { if (m) { app.dataset.mobile = '1'; delete app.dataset.collapsed; const g = $('.cx-app-sb', app); if (g) { g.dataset.state = 'expanded'; g.dataset.collapsible = ''; } } else { delete app.dataset.mobile; app.removeAttribute('data-sb-open'); const s = $('[data-app-scrim]', app); if (s) s.hidden = true; } syncTips(); } }).observe(app);

  // Command (⌘K): groups of results filtered as you type, arrows + Enter
  const CMD = () => [
    ['Acciones', commands.map((c) => [c.icon || 'right', c.label, () => (c.page ? go(c.page) : on.action?.(c.label))])],
    ...[...new Set(rows.map((r) => r.page))].map((p) => [p, rows.filter((r) => r.page === p).map((r) => [nav.find((n) => n.label === p)?.icon || 'user', r.command || r.title, () => { go(p); if (r.sheet) { app.scrollIntoView({ block: 'center', behavior: 'smooth' }); openRow(r.id); } }])]),
  ];
  let cmdItems = [], cmdHl = 0;
  const kind = `cmd-${Math.random().toString(36).slice(2, 8)}`;
  const paint = (q = '') => {
    const t = fold(q.trim()); cmdItems = [];
    const html = CMD().map(([g, items]) => { const hits = items.filter(([, l]) => !t || fold(l).includes(t)); if (!hits.length) return ''; return `<div data-slot="command-group" class="cn-command-group" role="group" aria-label="${esc(g)}"><div class="cx-cmd-label">${ui.text(esc(g), 'caption')}</div>${hits.map((h) => { cmdItems.push(h); const k = cmdItems.length - 1; return `<div data-slot="command-item" class="cn-command-item" role="option" id="cmd-${k}" data-ci="${k}" ${k === cmdHl ? 'data-selected="true" aria-selected="true"' : ''}>${ui.icon(h[0])}${ui.text(esc(h[1]))}</div>`; }).join('')}</div>`; }).join('');
    $('.cx-cmd-list', body).innerHTML = html || `<div data-slot="command-empty" class="cn-command-empty">Nada con «${esc(q)}»</div>`;
    $('.cx-cmd-in', body).setAttribute('aria-activedescendant', cmdItems.length ? `cmd-${cmdHl}` : '');
    $(`#cmd-${cmdHl}`, body)?.scrollIntoView({ block: 'nearest' });
  };
  CONTENT[kind] = () => {
    $('#mdl-title').textContent = 'Buscar'; $('#mdl-desc').textContent = '';
    body.dataset.cmd = kind;
    body.innerHTML = `<div data-slot="command" class="cn-command cx-cmd"><div data-slot="command-input-wrapper" class="cn-command-input-wrapper"><div data-slot="input-group" class="cn-input-group cn-command-input-group"><input data-slot="input-group-control" class="cn-command-input cn-input-group-input cx-cmd-in" placeholder="${esc(i.placeholder || 'Busca o salta a…')}" role="combobox" aria-expanded="true" aria-controls="cmd-list" autocomplete="off"><div class="cn-input-group-addon cn-input-group-addon-align-inline-start"><svg class="cn-command-input-icon"><use href="#search"/></svg></div></div></div><div data-slot="command-list" class="cn-command-list cx-cmd-list" id="cmd-list" role="listbox"></div></div>`;
    foot.innerHTML = `<span class="cx-hstack cx-cmd-help">${ui.text('<kbd class="cn-kbd">↑</kbd><kbd class="cn-kbd">↓</kbd> moverte', 'caption')}${ui.text('<kbd class="cn-kbd">Enter</kbd> abrir', 'caption')}${ui.text('<kbd class="cn-kbd">Esc</kbd> cerrar', 'caption')}</span>`;
    cmdHl = 0; paint();
    setTimeout(() => $('.cx-cmd-in', body)?.focus(), 30);
  };
  const openCmd = () => openModal(kind, 'auto');
  const mine = () => body.dataset.cmd === kind && !mdl.hidden;
  const run = (k) => { const f = cmdItems[k]?.[2]; if (!f) return; closeModal(); setTimeout(f, 380); };
  body.addEventListener('input', (e) => { if (mine() && e.target.matches('.cx-cmd-in')) { cmdHl = 0; paint(e.target.value); } });
  body.addEventListener('keydown', (e) => {
    if (!mine() || !e.target.matches('.cx-cmd-in')) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!cmdItems.length) return; cmdHl = (cmdHl + (e.key === 'ArrowDown' ? 1 : -1) + cmdItems.length) % cmdItems.length; paint(e.target.value); }
    if (e.key === 'Enter') { e.preventDefault(); run(cmdHl); }
  });
  body.addEventListener('click', (e) => { if (!mine()) return; const it = e.target.closest('[data-ci]'); if (it) run(+it.dataset.ci); });
  body.addEventListener('pointermove', (e) => { if (!mine()) return; const it = e.target.closest('[data-ci]'); if (it && +it.dataset.ci !== cmdHl) { cmdHl = +it.dataset.ci; $$('[data-ci]', body).forEach((x) => { const on1 = x === it; x.toggleAttribute('data-selected', on1); x.setAttribute('aria-selected', on1); }); } });
  // the modal is shared: forget this command's marker once another content takes it
  const watch = new MutationObserver(() => { if (mdl.hidden && body.dataset.cmd === kind) delete body.dataset.cmd; }); watch.observe(mdl, { attributes: true, attributeFilter: ['hidden'] });
  render();
  return { narrow: (on1) => app.toggleAttribute('data-narrow', !!on1) };
}

// ── booking picker ──
// i: week [{days [0..6], hours ["09:00", …]}] (what the shop offers each weekday), taken [{day, hours}] (day = days
//    from today or "yyyy-mm-dd"; hours empty = the whole day is booked), wait (ms the server takes: shows the
//    skeleton), cta; on.select("yyyy-mm-dd HH:MM") on «Continuar»
export function booking(root, i, core, on) {
  const { $, $$, today, addDays, DAY, MON, DAYLONG } = core;
  const key = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const dayOf = (v) => (/^-?\d+$/.test(String(v)) ? addDays(today, Number(v)) : new Date(String(v) + 'T00:00:00'));
  const week = list(i.week), taken = new Map(list(i.taken).map((t) => [key(dayOf(t.day)), list(t.hours)]));
  const slotsFor = (d) => {
    const offer = week.find((w) => list(w.days).includes(d.getDay()));
    if (!offer || d < today) return null; // closed or past
    const busy = taken.get(key(d));
    if (busy && !busy.length) return []; // the whole day is booked
    let s = list(offer.hours).filter((h) => !(busy || []).includes(h));
    if (key(d) === key(today)) { const now = new Date(); const hm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`; s = s.filter((h) => h > hm); }
    return s;
  };
  root.innerHTML = `<div class="cx-book">
    <div class="cx-book-head">
      <button data-slot="button" class="cn-button cn-button-variant-outline cn-button-size-icon-sm group/button" data-wk="-1" aria-label="Semana anterior" title="Semana anterior"><svg><use href="#left"/></svg></button>
      <b class="cx-wk-label" aria-live="polite"></b>
      <button data-slot="button" class="cn-button cn-button-variant-outline cn-button-size-icon-sm group/button" data-wk="1" aria-label="Semana siguiente" title="Semana siguiente"><svg><use href="#right"/></svg></button>
    </div>
    <div class="cx-week" role="group" aria-label="Día"></div>
    <div class="cx-hours" aria-live="polite"></div>
    <div class="cx-book-sum"><span class="cx-book-say">Elige un día y una hora</span><button data-slot="button" class="cn-button cn-button-variant-default cn-button-size-default group/button cx-book-go" disabled>${esc(i.cta || 'Continuar')}</button></div>
  </div>`;
  let weekStart = addDays(today, -((today.getDay() + 6) % 7)); // monday
  let picked = { day: null, hour: null }, loadTimer = 0;
  const weekEl = $('.cx-week', root), hours = $('.cx-hours', root), go = $('.cx-book-go', root);
  const firstOpen = (from) => { for (let k = 0; k < 60; k++) { const d = addDays(from, k); const s = slotsFor(d); if (s && s.length) return d; } return null; };
  const sum = () => {
    const d = picked.day;
    $('.cx-book-say', root).innerHTML = d ? `<b>${DAYLONG[d.getDay()]} ${d.getDate()} de ${MON[d.getMonth()]}</b>${picked.hour ? ` · <b>${picked.hour}</b>` : ' · elige una hora'}` : 'Elige un día y una hora';
    go.disabled = !(d && picked.hour);
  };
  const paintWeek = () => {
    const end = addDays(weekStart, 6);
    $('.cx-wk-label', root).textContent = weekStart.getMonth() === end.getMonth() ? `${weekStart.getDate()} al ${end.getDate()} de ${MON[end.getMonth()]}` : `${weekStart.getDate()} de ${MON[weekStart.getMonth()]} al ${end.getDate()} de ${MON[end.getMonth()]}`;
    $('[data-wk="-1"]', root).disabled = weekStart <= today;
    weekEl.innerHTML = '';
    for (let k = 0; k < 7; k++) {
      const d = addDays(weekStart, k), s = slotsFor(d);
      const b = document.createElement('button');
      b.className = 'cn-button cn-button-variant-outline cx-size-tile cx-day'; b.disabled = s === null;
      if (s && !s.length) b.dataset.full = '';
      b.setAttribute('aria-pressed', !!picked.day && key(d) === key(picked.day));
      // the name starts with what the tile shows («vie 9»), so a voice user can say it; the long day and the state follow
      b.setAttribute('aria-label', `${key(d) === key(today) ? 'hoy' : DAY[d.getDay()]} ${d.getDate()}, ${DAYLONG[d.getDay()]}${s === null ? ', cerrado' : s.length ? `, ${s.length} horarios` : ', sin horarios'}`);
      b.innerHTML = `<small>${key(d) === key(today) ? 'hoy' : DAY[d.getDay()]}</small> <b>${d.getDate()}</b><i></i>`;
      b.onclick = () => pickDay(d);
      weekEl.appendChild(b);
    }
  };
  const paintHours = (d) => {
    const s = slotsFor(d) || [];
    if (!s.length) {
      const next = firstOpen(addDays(d, 1));
      hours.innerHTML = `<div class="cx-hours-empty"><svg><use href="#caloff"/></svg><span>No quedan horarios este día.</span>${next ? `<button data-slot="button" class="cn-button cn-button-variant-outline cn-button-size-sm group/button" data-jump>Ver el ${DAYLONG[next.getDay()].toLowerCase()} ${next.getDate()}</button>` : ''}</div>`;
      if (next) $('[data-jump]', hours).onclick = () => { if (next > addDays(weekStart, 6)) weekStart = addDays(next, -((next.getDay() + 6) % 7)); pickDay(next); };
      return;
    }
    const am = s.filter((h) => h < '13:00'), pm = s.filter((h) => h >= '13:00');
    // the part of the day is a label, not a heading: the picker sits inside pages whose outline it must not break
    const grid = (label, hs) => hs.length ? `<p class="cx-hours-h">${label}</p><div class="cx-hour-grid">${hs.map((h) => `<button class="cn-button cn-button-variant-outline cn-button-size-sm cx-hour" aria-pressed="${h === picked.hour}">${h}</button>`).join('')}</div>` : '';
    hours.innerHTML = `<div class="cx-panel" style="display:flex;flex-direction:column;gap:10px">${grid('Mañana', am)}${grid('Tarde', pm)}</div>`;
    $$('.cx-hour', hours).forEach((b) => b.onclick = () => { picked.hour = b.textContent; $$('.cx-hour', hours).forEach((x) => x.setAttribute('aria-pressed', x === b)); sum(); });
  };
  const skeleton = () => { hours.innerHTML = `<h4 style="visibility:hidden">Mañana</h4><div class="cx-hour-grid">${'<div data-slot="skeleton" class="cn-skeleton cx-hour-skel"></div>'.repeat(8)}</div>`; };
  function pickDay(d) {
    if (!d) return;
    picked = { day: d, hour: null }; paintWeek(); sum();
    const wait = Number(i.wait) || 0;
    clearTimeout(loadTimer); if (wait) { skeleton(); loadTimer = setTimeout(() => paintHours(d), wait); } else paintHours(d);
  }
  $('[data-wk="-1"]', root).onclick = () => { weekStart = addDays(weekStart, -7); paintWeek(); };
  $('[data-wk="1"]', root).onclick = () => { weekStart = addDays(weekStart, 7); paintWeek(); };
  go.onclick = () => { if (picked.day && picked.hour) on.select?.(`${iso(picked.day)} ${picked.hour}`); };
  paintWeek(); pickDay(firstOpen(today));
}

// ── «Nueva cita» in 4 steps ──
// i: clients [{name, description}], services [{name, duration, price}], hours ["09:00", …], closed [0] (weekdays),
//    note (under the summary); opened by start(); on.create(json {client, service, day, hour}) · on.close()
export function wizard(core, i, on) {
  const { ui, $, $$, openModal, closeModal, CONTENT, body, foot, mdl, easeHeight, today, addDays, DAY, MON, DAYLONG, money0 } = core;
  const STEPS = ['Cliente', 'Servicio', 'Día y hora', 'Confirmar'];
  const clients = list(i.clients), services = list(i.services), hoursList = list(i.hours), closed = list(i.closed);
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const days = () => Array.from({ length: 10 }, (_, k) => addDays(today, k + 1)).filter((d) => !closed.includes(d.getDay())).slice(0, 5);
  let wiz = null, q = '';
  const kind = `wizard-${Math.random().toString(36).slice(2, 8)}`;
  const valid = () => [wiz.client != null, wiz.service != null, wiz.day != null && wiz.hour != null, true][wiz.at];
  const clientRows = () => clients.map((c, k) => [c, k]).filter(([c]) => !q || core.fold(`${c.name} ${c.description}`).includes(core.fold(q)))
    .map(([c, k]) => ui.choice({ media: ui.itemMedia(ui.avatar(c.name), 'default'), title: esc(c.name), description: esc(c.description), checked: wiz.client === k, attrs: `data-v="${k}"` })).join('') || ui.text(`Nadie con «${esc(q)}»`, 'muted', 'p');
  const stepBody = () => {
    const at = wiz.at;
    if (at === 0) return `<div class="cx-vstack" style="gap:12px">${ui.field({ id: 'wz-q', label: 'Busca o elige', control: ui.input({ id: 'wz-q', placeholder: 'Nombre o teléfono', value: esc(q) }) })}<div class="cx-vstack" role="radiogroup" aria-label="Cliente" data-wz="client">${clientRows()}</div></div>`;
    if (at === 1) return `<div class="cx-vstack" role="radiogroup" aria-label="Servicio" data-wz="service">${services.map((s, k) => ui.choice({ media: ui.itemMedia(ui.icon(s.icon || 'scissors')), title: esc(s.name), description: esc(s.duration), aside: ui.text(money0(Number(s.price) || 0), 'strong'), checked: wiz.service === k, attrs: `data-v="${k}"` })).join('')}</div>`;
    if (at === 2) return `<div class="cx-vstack" style="gap:14px">${ui.text('Día', 'label')}<div class="cx-wz-days" role="group" aria-label="Día">${days().map((d, k) => `<button class="cn-button cn-button-variant-outline cx-size-tile cx-day" aria-pressed="${wiz.day === k}" data-wz-day="${k}"><small>${DAY[d.getDay()]}</small><b>${d.getDate()}</b><i></i></button>`).join('')}</div>${ui.text('Hora', 'label')}<div class="cx-hour-grid" role="group" aria-label="Hora">${hoursList.map((h) => `<button class="cn-button cn-button-variant-outline cn-button-size-sm cx-hour" aria-pressed="${wiz.hour === h}" data-wz-hour="${h}">${h}</button>`).join('')}</div></div>`;
    const c = clients[wiz.client], s = services[wiz.service], d = days()[wiz.day];
    return `<div data-slot="item-group" class="cn-item-group cx-wz-sum">${[
      ui.item({ media: ui.itemMedia(ui.avatar(c.name), 'default'), title: esc(c.name), description: 'Cliente' }),
      ui.item({ media: ui.itemMedia(ui.icon(s.icon || 'scissors')), title: esc(s.name), description: esc(s.duration), actions: ui.text(money0(Number(s.price) || 0), 'strong') }),
      ui.item({ media: ui.itemMedia(ui.icon('cal')), title: `${DAYLONG[d.getDay()]} ${d.getDate()} de ${MON[d.getMonth()]}`, description: wiz.hour }),
    ].join(ui.itemSeparator())}</div>${i.note ? ui.text(esc(i.note), 'caption', 'p') : ''}`;
  };
  const paintFoot = () => {
    const last = wiz.at === STEPS.length - 1;
    foot.innerHTML = ui.button({ label: wiz.at === 0 ? 'Cancelar' : 'Atrás', size: 'default', attrs: wiz.at === 0 ? 'data-dismiss' : 'data-wz-back', cls: 'cx-exit' })
      + ui.button({ label: last ? 'Crear cita' : 'Siguiente<svg><use href="#right"/></svg>', variant: 'default', size: 'default', attrs: `data-wz-next ${valid() ? '' : 'disabled'}`, cls: 'cx-go' });
  };
  const render = (dir = 0) => {
    $('#mdl-title').textContent = i.title || 'Nueva cita';
    $('#mdl-desc').innerHTML = ui.stepper(STEPS, wiz.at);
    const paint = () => { body.innerHTML = stepBody(); };
    if (dir) { easeHeight(mdl, paint); body.animate([{ opacity: 0, transform: `translateX(${dir * 14}px)` }, { opacity: 1, transform: 'none' }], { duration: 200, easing: 'cubic-bezier(.22, 1, .36, 1)' }); } else paint();
    paintFoot();
  };
  CONTENT[kind] = () => { wiz = { at: 0, client: null, service: null, day: null, hour: null }; q = ''; body.dataset.wizard = kind; render(); };
  const mine = () => wiz && body.dataset.wizard === kind && !mdl.hidden;
  const pick = (attr, value, el, scope) => { $$(`[${attr}]`, scope).forEach((x) => x.setAttribute('aria-pressed', x === el)); $('[data-wz-next]', foot).disabled = !valid(); };
  body.addEventListener('input', (e) => { if (!mine() || e.target.id !== 'wz-q') return; q = e.target.value; $('[data-wz="client"]', body).innerHTML = clientRows(); });
  document.addEventListener('click', (e) => {
    if (!mine() || !mdl.contains(e.target)) return;
    const choice = e.target.closest('.cx-choice'), group = choice?.closest('[data-wz]');
    if (group) { wiz[group.dataset.wz] = +choice.dataset.v; $$('.cx-choice', group).forEach((x) => { const on1 = x === choice; x.setAttribute('aria-checked', on1); x.tabIndex = on1 ? 0 : -1; }); $('[data-wz-next]', foot).disabled = !valid(); return; }
    const day = e.target.closest('[data-wz-day]'); if (day) { wiz.day = +day.dataset.wzDay; pick('data-wz-day', wiz.day, day, body); return; }
    const hour = e.target.closest('[data-wz-hour]'); if (hour) { wiz.hour = hour.dataset.wzHour; pick('data-wz-hour', wiz.hour, hour, body); return; }
    if (e.target.closest('[data-wz-back]')) { wiz.at--; render(-1); return; }
    const next = e.target.closest('[data-wz-next]');
    if (next && !next.disabled) {
      if (wiz.at < STEPS.length - 1) { wiz.at++; render(1); return; }
      const c = clients[wiz.client], s = services[wiz.service], d = days()[wiz.day];
      next.innerHTML = '<svg class="animate-spin"><use href="#loader"/></svg>Creando…'; next.disabled = true;
      on.create?.(JSON.stringify({ client: c.name, service: s.name, day: iso(d), hour: wiz.hour }));
      setTimeout(() => { closeModal(); wiz = null; }, 700);
    }
  });
  // closing by Esc, the overlay or «Cancelar» tells the page, so its own «open» state can go back to false
  new MutationObserver(() => { if (mdl.hidden && body.dataset.wizard === kind) { delete body.dataset.wizard; wiz = null; on.close?.(); } }).observe(mdl, { attributes: true, attributeFilter: ['hidden'] });
  return { start: () => openModal(kind, 'auto') };
}
