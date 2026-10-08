// @muten/shadcn · dates & files (kit): the reference artifact's date and time fields (a field-like button that opens
// the wheels in the ONE adaptive modal) and the image upload (validate, decode first, crop square, shrink to WebP,
// upload with progress). Generic: values, ranges, limits and the upload address come in.

const pad = (n) => String(n).padStart(2, '0');

// DateField: i {label, value "yyyy-mm-dd" | "today", min "today" | "", years 2} → on.change("yyyy-mm-dd")
export function dateField(root, i, core, on) {
  const { $, ui, today, DAYLONG, MON, makeWheel, openModal, closeModal, CONTENT, body, foot } = core;
  const MONTHS = MON.map((m) => m[0].toUpperCase() + m.slice(1));
  const parse = (s) => { if (!s || s === 'today') return new Date(today); const d = new Date(String(s) + 'T00:00:00'); return Number.isNaN(d.getTime()) ? new Date(today) : d; };
  let value = parse(i.value), draft = null, wheels = [];
  const min = i.min === 'today' ? today : i.min ? parse(i.min) : null;
  const YEARS = Array.from({ length: Number(i.years) || 2 }, (_, k) => today.getFullYear() + k);
  const longDate = (d) => `${DAYLONG[d.getDay()]} ${d.getDate()} de ${MON[d.getMonth()]} de ${d.getFullYear()}`;
  const id = 'dp' + Math.random().toString(36).slice(2, 7), kind = 'date' + id;
  root.innerHTML = `<div data-slot="field" class="cn-field cn-field-orientation-vertical group/field"><span class="cn-label" id="${id}-l">${i.label || 'Fecha'}</span><button class="cn-button cn-button-variant-outline cn-button-size-default cx-picker-field" aria-labelledby="${id}-l ${id}-v"><svg><use href="#cal"/></svg><span id="${id}-v"></span><svg class="cx-pf-chev"><use href="#chev"/></svg></button></div>`;
  const out = $(`#${id}-v`, root), paint = () => { out.textContent = longDate(value); };
  const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();
  CONTENT[kind] = () => {
    document.getElementById('mdl-title').textContent = i.title || 'Elige la fecha'; document.getElementById('mdl-desc').textContent = 'Arrastra cada rueda, toca un valor o usa las flechas.';
    body.innerHTML = '<div class="cx-wheels"><div class="cx-wheel" data-w="d"></div><div class="cx-wheel" data-flex="2" data-w="m"></div><div class="cx-wheel" data-w="y"></div></div><p class="cx-wheel-sum"></p>';
    foot.innerHTML = ui.button({ label: 'Cancelar', size: 'default', attrs: 'data-dismiss', cls: 'cx-exit' }) + ui.button({ label: 'Listo', variant: 'default', size: 'default', attrs: `data-dp-ok="${id}"`, cls: 'cx-go' });
    draft = { y: value.getFullYear(), m: value.getMonth(), d: value.getDate() };
    const sumEl = $('.cx-wheel-sum', body);
    const sum = () => { const d = new Date(draft.y, draft.m, draft.d), past = min && d < min; sumEl.textContent = past ? 'Esa fecha ya pasó' : longDate(d); sumEl.style.color = past ? 'var(--destructive)' : ''; $(`[data-dp-ok]`, foot).disabled = !!past; if (min) wD.offs((k) => new Date(draft.y, draft.m, k + 1) < min); };
    const days = () => Array.from({ length: daysIn(draft.y, draft.m) }, (_, k) => k + 1);
    const wD = makeWheel($('[data-w=d]', body), days(), draft.d - 1, (k) => { draft.d = k + 1; sum(); }, 'Día');
    const fixDays = () => { const max = daysIn(draft.y, draft.m); if (draft.d > max) draft.d = max; wD.relabel(days()); sum(); };
    const wM = makeWheel($('[data-w=m]', body), MONTHS, draft.m, (k) => { draft.m = k; fixDays(); }, 'Mes');
    const wY = makeWheel($('[data-w=y]', body), YEARS, Math.max(0, YEARS.indexOf(draft.y)), (k) => { draft.y = YEARS[k]; fixDays(); }, 'Año');
    wheels = [wD, wM, wY]; sum();
  };
  $('button', root).addEventListener('click', () => { openModal(kind, 'auto'); requestAnimationFrame(() => requestAnimationFrame(() => { wheels.forEach((w) => w.place()); $('.cx-wheel', body)?.focus({ preventScroll: true }); })); });
  document.addEventListener('click', (e) => { const ok = e.target.closest(`[data-dp-ok="${id}"]`); if (!ok || ok.disabled) return; value = new Date(draft.y, draft.m, draft.d); paint(); closeModal(); on?.change?.(`${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`); });
  paint();
}

// TimeField: i {label, value "10:30", from 9, to 19, step 15} → on.change("HH:MM")
export function timeField(root, i, core, on) {
  const { $, ui, makeWheel, openModal, closeModal, CONTENT, body, foot } = core;
  const from = Number(i.from ?? 9), to = Number(i.to ?? 19), step = Number(i.step) || 15;
  const HOURS = Array.from({ length: to - from + 1 }, (_, k) => k + from), MINS = Array.from({ length: Math.ceil(60 / step) }, (_, k) => k * step);
  const [h0, m0] = String(i.value || `${pad(from)}:00`).split(':').map(Number);
  let value = { h: HOURS.includes(h0) ? h0 : from, m: MINS.includes(m0) ? m0 : 0 }, draft = null, wheels = [];
  const hm = (t) => `${pad(t.h)}:${pad(t.m)}`, part = (t) => (t.h < 12 ? 'mañana' : 'tarde');
  const id = 'tp' + Math.random().toString(36).slice(2, 7), kind = 'time' + id;
  root.innerHTML = `<div data-slot="field" class="cn-field cn-field-orientation-vertical group/field"><span class="cn-label" id="${id}-l">${i.label || 'Hora'}</span><button class="cn-button cn-button-variant-outline cn-button-size-default cx-picker-field" aria-labelledby="${id}-l ${id}-v"><svg><use href="#clock"/></svg><span id="${id}-v"></span><svg class="cx-pf-chev"><use href="#chev"/></svg></button></div>`;
  const out = $(`#${id}-v`, root), paint = () => { out.textContent = `${hm(value)} · ${part(value)}`; };
  CONTENT[kind] = () => {
    document.getElementById('mdl-title').textContent = i.title || 'Elige la hora'; document.getElementById('mdl-desc').textContent = i.description || `Horario: ${pad(from)}:00 a ${pad(to)}:${pad(MINS.at(-1))}. Arrastra o toca.`;
    body.innerHTML = '<div class="cx-wheels"><div class="cx-wheel" data-w="h"></div><div class="cx-wheel" data-w="mi"></div></div><p class="cx-wheel-sum"></p>';
    foot.innerHTML = ui.button({ label: 'Cancelar', size: 'default', attrs: 'data-dismiss', cls: 'cx-exit' }) + ui.button({ label: 'Listo', variant: 'default', size: 'default', attrs: `data-tp-ok="${id}"`, cls: 'cx-go' });
    draft = { ...value };
    const sumEl = $('.cx-wheel-sum', body), sum = () => { sumEl.textContent = `${hm(draft)} · ${part(draft)}`; };
    wheels = [makeWheel($('[data-w=h]', body), HOURS.map(pad), HOURS.indexOf(draft.h), (k) => { draft.h = HOURS[k]; sum(); }, 'Hora'), makeWheel($('[data-w=mi]', body), MINS.map(pad), MINS.indexOf(draft.m), (k) => { draft.m = MINS[k]; sum(); }, 'Minutos')];
    sum();
  };
  $('button', root).addEventListener('click', () => { openModal(kind, 'auto'); requestAnimationFrame(() => requestAnimationFrame(() => { wheels.forEach((w) => w.place()); $('.cx-wheel', body)?.focus({ preventScroll: true }); })); });
  document.addEventListener('click', (e) => { const ok = e.target.closest(`[data-tp-ok="${id}"]`); if (!ok) return; value = { ...draft }; paint(); closeModal(); on?.change?.(hm(value)); });
  paint();
}

// ImageUpload: i {title, hint, maxMb 10, size 1200, uploadUrl, sample "on"} → on.ready(json {dataUrl | url, width, height, kb})
// Without uploadUrl the processed image is handed back as a data URL; with it, the WebP is POSTed with real progress.
export function imageUpload(root, i, core, on) {
  const { $ } = core;
  const MAX = (Number(i.maxMb) || 10) * 1024 * 1024, SIZE = Number(i.size) || 1200, idle = i.hint || `JPG, PNG o WebP · hasta ${Number(i.maxMb) || 10} MB`;
  root.innerHTML = `<div class="cx-drop" tabindex="0" role="button"><input type="file" accept="image/*" hidden><div class="cx-drop-empty"><svg><use href="#upload"/></svg><b>${i.title || 'Sube la foto'}</b><span>Toca, arrastra o pega aquí</span></div><canvas class="cx-drop-img" width="600" height="600" hidden></canvas><div class="cx-drop-bar" hidden><i></i></div></div><p class="cx-note cx-drop-msg" style="text-align:left">${idle}</p><div class="cx-line cx-line-start">${i.sample === 'on' ? '<button data-slot="button" class="cn-button cn-button-variant-outline cn-button-size-sm group/button" data-drop-sample><svg><use href="#image"/></svg>Usar una de ejemplo</button>' : ''}<button data-slot="button" class="cn-button cn-button-variant-ghost cn-button-size-sm group/button" data-drop-remove hidden><svg><use href="#trash"/></svg>Quitar</button></div>`;
  const drop = $('.cx-drop', root), dropFile = $('input', root), dropMsg = $('.cx-drop-msg', root), dropCanvas = $('canvas', root), dropBar = $('.cx-drop-bar', root), dropProg = $('.cx-drop-bar i', root), removeB = $('[data-drop-remove]', root);
  const say = (text, tone) => { dropMsg.textContent = text; if (tone) dropMsg.dataset.tone = tone; else dropMsg.removeAttribute('data-tone'); };
  const coverDraw = (ctx, bmp, size) => { const s = Math.min(bmp.width, bmp.height); ctx.drawImage(bmp, (bmp.width - s) / 2, (bmp.height - s) / 2, s, s, 0, 0, size, size); };
  const progress = (p) => { dropProg.style.width = p + '%'; say(`Subiendo… ${Math.round(p)} %`); };
  const takeFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return say(`«${file.name}» no es una imagen. Usa JPG, PNG o WebP.`, 'bad');
    if (file.size > MAX) return say(`Pesa ${(file.size / 1048576).toFixed(1).replace('.', ',')} MB; el tope es ${Number(i.maxMb) || 10} MB.`, 'bad');
    say('Preparando la imagen…');
    let bmp; try { bmp = await createImageBitmap(file); } catch { return say('No pudimos leer esa imagen. Prueba con otra.', 'bad'); }
    coverDraw(dropCanvas.getContext('2d'), bmp, dropCanvas.width);
    const out = document.createElement('canvas'); out.width = out.height = Math.min(SIZE, Math.min(bmp.width, bmp.height)); coverDraw(out.getContext('2d'), bmp, out.width);
    const blob = await new Promise((r) => out.toBlob(r, 'image/webp', 0.86));
    dropCanvas.hidden = false; drop.setAttribute('data-has', ''); removeB.hidden = false; dropBar.hidden = false; progress(0);
    const done = (extra) => { dropBar.hidden = true; say(`Lista · ${out.width} × ${out.height} px, ${Math.max(1, Math.round(blob.size / 1024))} KB`, 'ok'); on?.ready?.(JSON.stringify({ width: out.width, height: out.height, kb: Math.round(blob.size / 1024), ...extra })); };
    if (i.uploadUrl) {
      const xhr = new XMLHttpRequest(); xhr.open('POST', i.uploadUrl); xhr.upload.onprogress = (e) => { if (e.lengthComputable) progress((e.loaded / e.total) * 100); };
      xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) { progress(100); setTimeout(() => done({ url: xhr.responseText }), 250); } else say('No se pudo subir. Inténtalo otra vez.', 'bad'); };
      xhr.onerror = () => say('No se pudo subir. Revisa tu conexión.', 'bad'); xhr.send(blob);
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
    c.toBlob((b) => takeFile(new File([b], 'ejemplo.png', { type: 'image/png' })), 'image/png');
  });
}
