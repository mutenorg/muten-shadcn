// @muten/shadcn · dates & files (kit): the reference artifact's date and time fields (a field-like button that opens
// the wheels in the ONE adaptive modal) and the image upload (validate, decode first, crop square, shrink to WebP,
// upload with progress). Generic: values, ranges, limits and the upload address come in.

const pad = (n) => String(n).padStart(2, '0');

// DateField: i {label, value "yyyy-mm-dd" | "today", min "today" | "", years 2} → on.change("yyyy-mm-dd")
export function dateField(root, i, core, on) {
  const { $, ui, today, makeWheel, openModal, closeModal, CONTENT, body, foot } = core;
  // its language: the nearest lang (the page's), English by default; months and days from the kit's date words
  const L = core.langOf(root), T = (k, ...a) => core.t(L, k, ...a), W = core.kit.words(L), DAYLONG = W.dayL, MON = W.mon;
  const MONTHS = MON.map((m) => m[0].toUpperCase() + m.slice(1));
  const parse = (s) => { if (!s || s === 'today') return new Date(today); const d = new Date(String(s) + 'T00:00:00'); return Number.isNaN(d.getTime()) ? new Date(today) : d; };
  let value = parse(i.value), draft = null, wheels = [];
  const min = i.min === 'today' ? today : i.min ? parse(i.min) : null;
  const YEARS = Array.from({ length: Number(i.years) || 2 }, (_, k) => today.getFullYear() + k);
  const longDate = (d) => (L === 'es' ? `${DAYLONG[d.getDay()]} ${d.getDate()} de ${MON[d.getMonth()]} de ${d.getFullYear()}` : `${DAYLONG[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`);
  const id = 'dp' + Math.random().toString(36).slice(2, 7), kind = 'date' + id;
  root.innerHTML = `<div data-slot="field" class="cn-field cn-field-orientation-vertical group/field"><span class="cn-label" id="${id}-l">${T(i.label || 'Date')}</span><button class="cn-button cn-button-variant-outline cn-button-size-default cx-picker-field" aria-labelledby="${id}-l ${id}-v"><svg><use href="#cal"/></svg><span id="${id}-v"></span><svg class="cx-pf-chev"><use href="#chev"/></svg></button></div>`;
  const out = $(`#${id}-v`, root), paint = () => { out.textContent = longDate(value); };
  const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();
  CONTENT[kind] = () => {
    document.getElementById('mdl-title').textContent = i.title || T('Pick the date'); document.getElementById('mdl-desc').textContent = T('Drag each wheel, tap a value or use the arrows.');
    body.innerHTML = '<div class="cx-wheels"><div class="cx-wheel" data-w="d"></div><div class="cx-wheel" data-flex="2" data-w="m"></div><div class="cx-wheel" data-w="y"></div></div><p class="cx-wheel-sum"></p>';
    foot.innerHTML = ui.button({ label: T('Cancel'), size: 'default', attrs: 'data-dismiss', cls: 'cx-exit' }) + ui.button({ label: T('Done'), variant: 'default', size: 'default', attrs: `data-dp-ok="${id}"`, cls: 'cx-go' });
    draft = { y: value.getFullYear(), m: value.getMonth(), d: value.getDate() };
    const sumEl = $('.cx-wheel-sum', body);
    const sum = () => { const d = new Date(draft.y, draft.m, draft.d), past = min && d < min; sumEl.textContent = past ? T('That date has passed') : longDate(d); sumEl.style.color = past ? 'var(--destructive)' : ''; $(`[data-dp-ok]`, foot).disabled = !!past; if (min) wD.offs((k) => new Date(draft.y, draft.m, k + 1) < min); };
    const days = () => Array.from({ length: daysIn(draft.y, draft.m) }, (_, k) => k + 1);
    const wD = makeWheel($('[data-w=d]', body), days(), draft.d - 1, (k) => { draft.d = k + 1; sum(); }, T('Day'));
    const fixDays = () => { const max = daysIn(draft.y, draft.m); if (draft.d > max) draft.d = max; wD.relabel(days()); sum(); };
    const wM = makeWheel($('[data-w=m]', body), MONTHS, draft.m, (k) => { draft.m = k; fixDays(); }, T('Month'));
    const wY = makeWheel($('[data-w=y]', body), YEARS, Math.max(0, YEARS.indexOf(draft.y)), (k) => { draft.y = YEARS[k]; fixDays(); }, T('Year'));
    wheels = [wD, wM, wY]; sum();
  };
  $('button', root).addEventListener('click', () => { openModal(kind, 'auto'); requestAnimationFrame(() => requestAnimationFrame(() => { wheels.forEach((w) => w.place()); $('.cx-wheel', body)?.focus({ preventScroll: true }); })); });
  document.addEventListener('click', (e) => { const ok = e.target.closest(`[data-dp-ok="${id}"]`); if (!ok || ok.disabled) return; value = new Date(draft.y, draft.m, draft.d); paint(); closeModal(); on?.change?.(`${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`); });
  paint();
}

// TimeField: i {label, value "10:30", from 9, to 19, step 15} → on.change("HH:MM")
export function timeField(root, i, core, on) {
  const { $, ui, makeWheel, openModal, closeModal, CONTENT, body, foot } = core, T = (k, ...a) => core.t(core.langOf(root), k, ...a);
  const from = Number(i.from ?? 9), to = Number(i.to ?? 19), step = Number(i.step) || 15;
  const HOURS = Array.from({ length: to - from + 1 }, (_, k) => k + from), MINS = Array.from({ length: Math.ceil(60 / step) }, (_, k) => k * step);
  const [h0, m0] = String(i.value || `${pad(from)}:00`).split(':').map(Number);
  let value = { h: HOURS.includes(h0) ? h0 : from, m: MINS.includes(m0) ? m0 : 0 }, draft = null, wheels = [];
  const hm = (t) => `${pad(t.h)}:${pad(t.m)}`, part = (t) => (t.h < 12 ? T('morning') : T('afternoon'));
  const id = 'tp' + Math.random().toString(36).slice(2, 7), kind = 'time' + id;
  root.innerHTML = `<div data-slot="field" class="cn-field cn-field-orientation-vertical group/field"><span class="cn-label" id="${id}-l">${T(i.label || 'Time')}</span><button class="cn-button cn-button-variant-outline cn-button-size-default cx-picker-field" aria-labelledby="${id}-l ${id}-v"><svg><use href="#clock"/></svg><span id="${id}-v"></span><svg class="cx-pf-chev"><use href="#chev"/></svg></button></div>`;
  const out = $(`#${id}-v`, root), paint = () => { out.textContent = `${hm(value)} · ${part(value)}`; };
  CONTENT[kind] = () => {
    document.getElementById('mdl-title').textContent = i.title || T('Pick the time'); document.getElementById('mdl-desc').textContent = i.description || T('Hours: {0} to {1}. Drag or tap.', `${pad(from)}:00`, `${pad(to)}:${pad(MINS.at(-1))}`);
    body.innerHTML = '<div class="cx-wheels"><div class="cx-wheel" data-w="h"></div><div class="cx-wheel" data-w="mi"></div></div><p class="cx-wheel-sum"></p>';
    foot.innerHTML = ui.button({ label: T('Cancel'), size: 'default', attrs: 'data-dismiss', cls: 'cx-exit' }) + ui.button({ label: T('Done'), variant: 'default', size: 'default', attrs: `data-tp-ok="${id}"`, cls: 'cx-go' });
    draft = { ...value };
    const sumEl = $('.cx-wheel-sum', body), sum = () => { sumEl.textContent = `${hm(draft)} · ${part(draft)}`; };
    wheels = [makeWheel($('[data-w=h]', body), HOURS.map(pad), HOURS.indexOf(draft.h), (k) => { draft.h = HOURS[k]; sum(); }, T('Hour')), makeWheel($('[data-w=mi]', body), MINS.map(pad), MINS.indexOf(draft.m), (k) => { draft.m = MINS[k]; sum(); }, T('Minutes'))];
    sum();
  };
  $('button', root).addEventListener('click', () => { openModal(kind, 'auto'); requestAnimationFrame(() => requestAnimationFrame(() => { wheels.forEach((w) => w.place()); $('.cx-wheel', body)?.focus({ preventScroll: true }); })); });
  document.addEventListener('click', (e) => { const ok = e.target.closest(`[data-tp-ok="${id}"]`); if (!ok) return; value = { ...draft }; paint(); closeModal(); on?.change?.(hm(value)); });
  paint();
}

// ImageUpload: i {title, hint, maxMb 10, size 1200, uploadUrl, sample "on"} → on.ready(json {dataUrl | url, width, height, kb})
// Without uploadUrl the processed image is handed back as a data URL; with it, the WebP is POSTed with real progress.
export function imageUpload(root, i, core, on) {
  const { $ } = core, L = core.langOf(root), T = (k, ...a) => core.t(L, k, ...a);
  const MAX = (Number(i.maxMb) || 10) * 1024 * 1024, SIZE = Number(i.size) || 1200, idle = i.hint || T('JPG, PNG or WebP · up to {0} MB', Number(i.maxMb) || 10);
  root.innerHTML = `<div class="cx-drop" tabindex="0" role="button"><input type="file" accept="image/*" hidden><div class="cx-drop-empty"><svg><use href="#upload"/></svg><b>${T(i.title || 'Upload the photo')}</b><span>${T('Tap, drag or paste here')}</span></div><canvas class="cx-drop-img" width="600" height="600" hidden></canvas><div class="cx-drop-bar" hidden><i></i></div></div><p class="cx-note cx-drop-msg" style="text-align:left">${idle}</p><div class="cx-line cx-line-start">${i.sample === 'on' ? `<button data-slot="button" class="cn-button cn-button-variant-outline cn-button-size-sm group/button" data-drop-sample><svg><use href="#image"/></svg>${T('Use a sample')}</button>` : ''}<button data-slot="button" class="cn-button cn-button-variant-ghost cn-button-size-sm group/button" data-drop-remove hidden><svg><use href="#trash"/></svg>${T('Remove')}</button></div>`;
  const drop = $('.cx-drop', root), dropFile = $('input', root), dropMsg = $('.cx-drop-msg', root), dropCanvas = $('canvas', root), dropBar = $('.cx-drop-bar', root), dropProg = $('.cx-drop-bar i', root), removeB = $('[data-drop-remove]', root);
  const say = (text, tone) => { dropMsg.textContent = text; if (tone) dropMsg.dataset.tone = tone; else dropMsg.removeAttribute('data-tone'); };
  const coverDraw = (ctx, bmp, size) => { const s = Math.min(bmp.width, bmp.height); ctx.drawImage(bmp, (bmp.width - s) / 2, (bmp.height - s) / 2, s, s, 0, 0, size, size); };
  const progress = (p) => { dropProg.style.width = p + '%'; say(T('Uploading… {0} %', Math.round(p))); };
  const takeFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return say(T('“{0}” is not an image. Use JPG, PNG or WebP.', file.name), 'bad');
    if (file.size > MAX) return say(T('It weighs {0} MB; the limit is {1} MB.', (file.size / 1048576).toFixed(1).replace('.', L === 'es' ? ',' : '.'), Number(i.maxMb) || 10), 'bad');
    say(T('Preparing the image…'));
    let bmp; try { bmp = await createImageBitmap(file); } catch { return say(T('We could not read that image. Try another.'), 'bad'); }
    coverDraw(dropCanvas.getContext('2d'), bmp, dropCanvas.width);
    const out = document.createElement('canvas'); out.width = out.height = Math.min(SIZE, Math.min(bmp.width, bmp.height)); coverDraw(out.getContext('2d'), bmp, out.width);
    const blob = await new Promise((r) => out.toBlob(r, 'image/webp', 0.86));
    dropCanvas.hidden = false; drop.setAttribute('data-has', ''); removeB.hidden = false; dropBar.hidden = false; progress(0);
    const done = (extra) => { dropBar.hidden = true; say(T('Ready · {0} × {1} px, {2} KB', out.width, out.height, Math.max(1, Math.round(blob.size / 1024))), 'ok'); on?.ready?.(JSON.stringify({ width: out.width, height: out.height, kb: Math.round(blob.size / 1024), ...extra })); };
    if (i.uploadUrl) {
      const xhr = new XMLHttpRequest(); xhr.open('POST', i.uploadUrl); xhr.upload.onprogress = (e) => { if (e.lengthComputable) progress((e.loaded / e.total) * 100); };
      xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) { progress(100); setTimeout(() => done({ url: xhr.responseText }), 250); } else say(T('It could not be uploaded. Try again.'), 'bad'); };
      xhr.onerror = () => say(T('It could not be uploaded. Check your connection.'), 'bad'); xhr.send(blob);
    } else { const r = new FileReader(); r.onload = () => { progress(100); setTimeout(() => done({ dataUrl: r.result }), 200); }; r.readAsDataURL(blob); }
  };
  drop.addEventListener('click', () => { if (!drop.hasAttribute('data-has')) dropFile.click(); });
  drop.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !drop.hasAttribute('data-has')) { e.preventDefault(); dropFile.click(); } });
  dropFile.addEventListener('change', () => { takeFile(dropFile.files[0]); dropFile.value = ''; });
  ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.setAttribute('data-over', ''); }));
  ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, () => drop.removeAttribute('data-over')));
  drop.addEventListener('drop', (e) => { e.preventDefault(); takeFile(e.dataTransfer.files[0]); });
  document.addEventListener('paste', (e) => { if (e.target.closest?.('input, textarea')) return; const f = [...(e.clipboardData?.files || [])].find((x) => x.type.startsWith('image/')); if (f && root.isConnected) { drop.scrollIntoView({ block: 'center', behavior: 'smooth' }); takeFile(f); } });
  removeB.onclick = () => { drop.removeAttribute('data-has'); dropCanvas.hidden = true; dropBar.hidden = true; removeB.hidden = true; say(idle); on?.ready?.(''); };
  $('[data-drop-sample]', root)?.addEventListener('click', () => {
    const c = document.createElement('canvas'); c.width = 1600; c.height = 1100; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 1600, 1100); gr.addColorStop(0, '#d9b48c'); gr.addColorStop(1, '#5e3f27'); g.fillStyle = gr; g.fillRect(0, 0, 1600, 1100);
    g.fillStyle = 'rgba(255,255,255,.18)'; for (let k = 0; k < 9; k++) { g.beginPath(); g.arc(300 + k * 130, 550 + Math.sin(k) * 160, 60 + (k % 3) * 30, 0, 7); g.fill(); }
    g.fillStyle = '#fff'; g.font = '600 110px sans-serif'; g.textAlign = 'center'; g.fillText('El Roble', 800, 590);
    c.toBlob((b) => takeFile(new File([b], 'sample.png', { type: 'image/png' })), 'image/png');
  });
}
