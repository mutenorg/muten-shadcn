// @muten/shadcn · values (kit): the reference artifact's ScaleSlider (value riding on the thumb, two bubbles merge),
// CodePicker (a searchable list under a trigger), MoneyField (a currency = code + locale, Intl does the rest),
// PhoneField (a country = dial code + digits + mask) and the 6-slot verification code. Generic: data and labels in.
export const CURRENCIES = [
  { id: 'COP', label: 'Peso colombiano', locale: 'es-CO', minor: 2, shown: 0 }, { id: 'USD', label: 'Dólar estadounidense', locale: 'en-US' },
  { id: 'MXN', label: 'Peso mexicano', locale: 'es-MX' }, { id: 'ARS', label: 'Peso argentino', locale: 'es-AR' }, { id: 'VES', label: 'Bolívar', locale: 'es-VE' },
  { id: 'CLP', label: 'Peso chileno', locale: 'es-CL' }, { id: 'PEN', label: 'Sol peruano', locale: 'es-PE' }, { id: 'BRL', label: 'Real brasileño', locale: 'pt-BR' },
  { id: 'EUR', label: 'Euro', locale: 'es-ES' }, { id: 'CAD', label: 'Dólar canadiense', locale: 'en-CA' }, { id: 'AUD', label: 'Dólar australiano', locale: 'en-AU' }, { id: 'JPY', label: 'Yen', locale: 'ja-JP' },
];
export const COUNTRIES = [
  { id: 'AR', label: 'Argentina', dial: '+54 9', e164: '549', len: 10, mask: '## ####-####' }, { id: 'CO', label: 'Colombia', dial: '+57', e164: '57', len: 10, mask: '### ### ####' },
  { id: 'MX', label: 'México', dial: '+52', e164: '52', len: 10, mask: '## #### ####' }, { id: 'US', label: 'Estados Unidos', dial: '+1', e164: '1', len: 10, mask: '(###) ###-####' },
  { id: 'VE', label: 'Venezuela', dial: '+58', e164: '58', len: 10, mask: '### ### ####' }, { id: 'BR', label: 'Brasil', dial: '+55', e164: '55', len: 11, mask: '(##) #####-####' },
  { id: 'CL', label: 'Chile', dial: '+56', e164: '56', len: 9, mask: '# #### ####' }, { id: 'PE', label: 'Perú', dial: '+51', e164: '51', len: 9, mask: '### ### ###' },
  { id: 'ES', label: 'España', dial: '+34', e164: '34', len: 9, mask: '### ## ## ##' }, { id: 'CA', label: 'Canadá', dial: '+1', e164: '1', len: 10, mask: '(###) ###-####' },
];

export function codePicker(core, { trigger, anchor, items, current, onPick, placeholder }) {
  const { $, $$, lib, place, show, hide, fold } = core;
  const pop = document.createElement('div');
  pop.className = 'cx-cpick pg-pop'; pop.hidden = true; pop.setAttribute('role', 'dialog');
  pop.innerHTML = `<div class="cx-cpick-search"><svg><use href="#search"/></svg><input placeholder="${placeholder}" aria-label="${placeholder}" autocomplete="off" role="combobox" aria-expanded="true"></div><div class="cx-cpick-list cx-combo-list" role="listbox"></div>`;
  lib.appendChild(pop);
  const q = $('input', pop), list = $('[role=listbox]', pop);
  let shown = [], hl = 0;
  const paint = () => {
    const t = fold(q.value.trim());
    shown = items().filter((it) => !t || fold(`${it.label} ${it.id} ${it.hint}`).includes(t));
    hl = Math.min(hl, Math.max(0, shown.length - 1));
    list.innerHTML = shown.length ? shown.map((it, i) => `<div class="cx-opt" role="option" data-i="${i}" aria-selected="${it.id === current()}"${i === hl ? ' data-hl' : ''}><span class="cx-opt-code">${it.id}</span><span>${it.label}</span><small>${it.hint}</small>${it.id === current() ? '<svg class="cx-tick" style="margin-left:6px"><use href="#check"/></svg>' : ''}</div>`).join('') : '<div class="cx-combo-empty">Sin resultados</div>';
    $('[data-hl]', list)?.scrollIntoView({ block: 'nearest' });
  };
  const isOpen = () => pop.dataset.state === 'open';
  const open = () => { q.value = ''; hl = Math.max(0, items().findIndex((it) => it.id === current())); paint(); pop.hidden = false; place(pop, anchor, 'start', 6, Math.max(260, anchor.offsetWidth)); show(pop); trigger.setAttribute('aria-expanded', 'true'); q.focus({ preventScroll: true }); };
  const close = (refocus) => { if (!isOpen()) return; hide(pop, 120); trigger.setAttribute('aria-expanded', 'false'); if (refocus) trigger.focus({ preventScroll: true }); };
  const pick = (i) => { const it = shown[i]; if (!it) return; close(false); onPick(it); };
  trigger.addEventListener('click', () => (isOpen() ? close(true) : open()));
  q.addEventListener('input', () => { hl = 0; paint(); });
  q.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); hl = (hl + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % Math.max(1, shown.length); paint(); }
    else if (e.key === 'Enter') { e.preventDefault(); pick(hl); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
    else if (e.key === 'Tab') close(false);
  });
  list.addEventListener('pointerdown', (e) => e.preventDefault());
  list.addEventListener('pointermove', (e) => { const o = e.target.closest('[data-i]'); if (o && +o.dataset.i !== hl) { hl = +o.dataset.i; $$('[data-i]', list).forEach((x) => x.toggleAttribute('data-hl', x === o)); } });
  list.addEventListener('click', (e) => { const o = e.target.closest('[data-i]'); if (o) pick(+o.dataset.i); });
  document.addEventListener('pointerdown', (e) => { if (isOpen() && !pop.contains(e.target) && !trigger.contains(e.target)) close(false); });
  addEventListener('scroll', () => { if (isOpen()) place(pop, anchor, 'start', 6, Math.max(260, anchor.offsetWidth)); }, { passive: true });
}

// ScaleSlider: one or two thumbs, the value rides on each thumb, two bubbles that would touch merge into one.
// i: {label, min, max, step, values "24" | "20000,80000", gap, format: hours|money|percent|"" , suffix}
export function scaleSlider(root, i, core, on) {
  const { $, $$, money0 } = core;
  const min = Number(i.min) || 0, max = Number(i.max) || 100, step = Number(i.step) || 1, gap = Number(i.gap) || 0;
  const FMT = { hours: (v) => `${v} h`, money: money0, percent: (v) => `${v} %` };
  const fmt = FMT[i.format] || ((v) => `${v}${i.suffix || ''}`);
  const vals = String(i.values ?? min).split(',').map(Number), two = vals.length > 1, TW = 21;
  const id = 'sl' + Math.random().toString(36).slice(2, 7);
  root.innerHTML = `<div class="cx-sl-field"><div class="cx-sl-head"><span class="cn-label" id="${id}-l">${i.label || ''}</span></div><div data-slot="slider" class="cn-slider cx-slider" data-orientation="horizontal" data-horizontal><div data-slot="slider-track" class="cn-slider-track" data-orientation="horizontal"><div data-slot="slider-range" class="cn-slider-range" data-orientation="horizontal"></div></div>${vals.map((_, k) => `<span data-slot="slider-thumb" class="cn-slider-thumb" tabindex="0" role="slider" ${two ? `aria-label="${i.label || ''} ${k ? 'máximo' : 'mínimo'}"` : `aria-labelledby="${id}-l"`}></span>`).join('')}</div><div class="cx-sl-scale"><span>${fmt(min)}</span><span>${fmt(max)}</span></div></div>`;
  const sl = $('.cx-slider', root), thumbs = $$('.cn-slider-thumb', sl), range = $('.cn-slider-range', sl);
  const bubbles = thumbs.map(() => { const b = document.createElement('span'); b.className = 'cx-sl-bubble'; b.setAttribute('aria-hidden', 'true'); sl.appendChild(b); return b; });
  const bounds = (k) => [two && k === 1 ? vals[0] + gap : min, two && k === 0 ? vals[1] - gap : max];
  const paint = () => {
    const run = sl.clientWidth - TW, at = (v) => ((v - min) / (max - min)) * run;
    thumbs.forEach((t, k) => { const [lo, hi] = bounds(k); t.style.left = at(vals[k]) + 'px'; t.setAttribute('aria-valuenow', vals[k]); t.setAttribute('aria-valuemin', lo); t.setAttribute('aria-valuemax', hi); t.setAttribute('aria-valuetext', fmt(vals[k])); });
    const a = two ? at(vals[0]) + TW / 2 : 0, b = at(vals[vals.length - 1]) + TW / 2;
    range.style.left = a + 'px'; range.style.width = (b - a) + 'px';
    bubbles.forEach((bb, k) => { bb.hidden = false; bb.textContent = fmt(vals[k]); bb.style.left = at(vals[k]) + TW / 2 + 'px'; });
    if (two) { const [b0, b1] = bubbles, r0 = b0.getBoundingClientRect(), r1 = b1.getBoundingClientRect(); if (r0.right + 6 > r1.left) { b1.hidden = true; b0.textContent = `${fmt(vals[0])} – ${fmt(vals[1])}`; b0.style.left = (at(vals[0]) + at(vals[1])) / 2 + TW / 2 + 'px'; } }
  };
  const emit = () => on?.change?.(vals.join(','));
  const set = (k, v) => { const [lo, hi] = bounds(k); const nv = Math.min(hi, Math.max(lo, Math.round((v - min) / step) * step + min)); if (nv === vals[k]) return; vals[k] = nv; paint(); emit(); };
  const valueAt = (x) => min + ((x - sl.getBoundingClientRect().left - TW / 2) / (sl.clientWidth - TW)) * (max - min);
  let drag = null;
  sl.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const onThumb = thumbs.indexOf(e.target); let k = onThumb;
    if (k < 0) { const v = valueAt(e.clientX); k = two ? (Math.abs(v - vals[0]) <= Math.abs(v - vals[1]) ? (v > vals[1] ? 1 : 0) : 1) : 0; }
    const tr = thumbs[k].getBoundingClientRect();
    drag = { k, grab: onThumb >= 0 ? e.clientX - (tr.left + TW / 2) : 0 };
    thumbs[k].setAttribute('data-drag', ''); thumbs[k].focus({ preventScroll: true }); sl.setPointerCapture(e.pointerId);
    set(k, valueAt(e.clientX - drag.grab));
  });
  sl.addEventListener('pointermove', (e) => { if (drag) set(drag.k, valueAt(e.clientX - drag.grab)); });
  const end = () => { if (!drag) return; thumbs[drag.k].removeAttribute('data-drag'); drag = null; };
  sl.addEventListener('pointerup', end); sl.addEventListener('pointercancel', end);
  thumbs.forEach((t, k) => t.addEventListener('keydown', (e) => {
    const d = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: step * 10, PageDown: -step * 10 }[e.key];
    if (d !== undefined) { e.preventDefault(); set(k, vals[k] + d); }
    if (e.key === 'Home') { e.preventDefault(); set(k, bounds(k)[0]); }
    if (e.key === 'End') { e.preventDefault(); set(k, bounds(k)[1]); }
  }));
  new ResizeObserver(paint).observe(sl); paint();
  return (next) => { const nv = String(next.values ?? '').split(',').map(Number); if (nv.length === vals.length && nv.every((v, k) => v === vals[k])) return; nv.forEach((v, k) => { if (k < vals.length && !Number.isNaN(v)) vals[k] = v; }); paint(); };
}

// MoneyField: i {label, value (a number), currency "COP", hint "on"} → on.change(json {amount, minor, currency})
export function moneyField(root, i, core, on) {
  const { $, ui, reformat, groupThousands } = core;
  const id = 'mf' + Math.random().toString(36).slice(2, 7);
  root.innerHTML = `<div data-slot="field" class="cn-field cn-field-orientation-vertical group/field"><label data-slot="label" class="cn-label" for="${id}">${i.label || 'Precio'}</label><div data-slot="input-group" class="cn-input-group group/input-group" data-mf-group><div data-slot="input-group-addon" class="cn-input-group-addon cn-input-group-addon-align-inline-start cx-num" data-mf-sym>$</div><input data-slot="input-group-control" class="cn-input cn-input-group-input cx-num" id="${id}" inputmode="decimal" autocomplete="off"><div data-slot="input-group-addon" class="cn-input-group-addon cn-input-group-addon-align-inline-end" style="padding-right:2px"><button data-slot="button" class="cn-button cn-button-variant-ghost cn-button-size-xs group/button cx-cc" data-mf-cur aria-haspopup="dialog" aria-expanded="false" aria-label="Moneda"><span class="cx-cc-code" data-mf-code>COP</span><svg><use href="#chev"/></svg></button></div></div><p data-slot="field-description" class="cn-field-description cx-num" data-mf-out></p></div>`;
  const currencySpec = (c) => {
    const nf = new Intl.NumberFormat(c.locale, { style: 'currency', currency: c.id, currencyDisplay: 'narrowSymbol' });
    const parts = nf.formatToParts(1234567.89), part = (t, d) => parts.find((p) => p.type === t)?.value ?? d;
    const dec = new Intl.NumberFormat(c.locale, { minimumFractionDigits: 1 }).formatToParts(1.5).find((p) => p.type === 'decimal').value;
    const digits = nf.resolvedOptions().maximumFractionDigits;
    return { sym: part('currency', c.id), group: part('group', dec === ',' ? '.' : ','), dec, minor: c.minor ?? digits, places: c.shown ?? digits };
  };
  const mf = $('input', root), mfOut = $('[data-mf-out]', root);
  let curRow = CURRENCIES.find((c) => c.id === i.currency) || CURRENCIES[0], cur = currencySpec(curRow);
  const escRe = (c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sigFor = () => new RegExp(`[\\d${escRe(cur.dec)}]`);
  const fmtMoney = (v) => { const k = cur.places ? v.indexOf(cur.dec) : -1; const int = (k < 0 ? v : v.slice(0, k)).replace(/\D/g, '').slice(0, 12); const frac = k < 0 ? '' : v.slice(k + 1).replace(/\D/g, '').slice(0, cur.places); return (groupThousands(int, cur.group) || (k >= 0 ? '0' : '')) + (k >= 0 ? cur.dec + frac : ''); };
  const amount = () => { if (!mf.value) return 0; const [a, f = ''] = mf.value.split(cur.dec); return Number(a.split(cur.group).join('') + '.' + (f || '0')); };
  const unitName = () => (cur.minor === 0 ? `${curRow.id} (no tiene unidad menor)` : `centavos de ${curRow.id}`);
  const showMinor = () => { mfOut.textContent = mf.value ? `Se guarda: ${Math.round(amount() * 10 ** cur.minor)} ${unitName()}` : 'Escribe un precio'; };
  const toText = (n) => { const [a, f] = n.toFixed(cur.places).split('.'); return groupThousands(a, cur.group) + (cur.places && /[1-9]/.test(f) ? cur.dec + f : ''); };
  const emit = () => on?.change?.(JSON.stringify({ amount: amount(), minor: Math.round(amount() * 10 ** cur.minor), currency: curRow.id }));
  mf.addEventListener('input', () => { reformat(mf, fmtMoney, sigFor()); showMinor(); emit(); });
  mf.addEventListener('keydown', (e) => { if (!cur.places || (e.key !== '.' && e.key !== ',') || e.key === cur.dec) return; e.preventDefault(); if (!mf.value.includes(cur.dec)) { mf.setRangeText(cur.dec, mf.selectionStart, mf.selectionEnd, 'end'); mf.dispatchEvent(new Event('input')); } });
  const setCurrency = (row) => { const n = amount(); curRow = row; cur = currencySpec(row); $('[data-mf-sym]', root).textContent = cur.sym; $('[data-mf-code]', root).textContent = row.id; mf.value = n ? toText(n) : ''; showMinor(); };
  codePicker(core, { trigger: $('[data-mf-cur]', root), anchor: $('[data-mf-group]', root), placeholder: 'Buscar moneda', current: () => curRow.id, items: () => CURRENCIES.map((c) => ({ id: c.id, label: c.label, hint: currencySpec(c).sym })), onPick: (it) => { setCurrency(CURRENCIES.find((c) => c.id === it.id)); mf.focus({ preventScroll: true }); emit(); } });
  mf.value = fmtMoney(String(i.value ?? '')); setCurrency(curRow);
  void ui;
}

// PhoneField: i {label, value (digits), country "CO"} → on.change(json {e164, valid, country})
export function phoneField(root, i, core, on) {
  const { $, reformat } = core;
  const id = 'ph' + Math.random().toString(36).slice(2, 7);
  root.innerHTML = `<div data-slot="field" class="cn-field cn-field-orientation-vertical group/field" data-ph-f><label data-slot="label" class="cn-label" for="${id}">${i.label || 'Teléfono'}</label><div data-slot="input-group" class="cn-input-group group/input-group cx-phone" data-ph-group><div data-slot="input-group-addon" class="cn-input-group-addon cn-input-group-addon-align-inline-start" style="padding-left:2px"><button data-slot="button" class="cn-button cn-button-variant-ghost cn-button-size-xs group/button cx-cc" data-ph-cc aria-haspopup="dialog" aria-expanded="false" aria-label="País"><span class="cx-cc-code" data-ph-flag></span><span class="cx-num cx-cc-dial" data-ph-dial></span><svg><use href="#chev"/></svg></button></div><input data-slot="input-group-control" class="cn-input cn-input-group-input cx-num" id="${id}" type="tel" inputmode="tel" autocomplete="tel-national" aria-describedby="${id}-msg"></div><p data-slot="field-description" class="cn-field-description cx-msg cx-num" id="${id}-msg"></p></div>`;
  const ph = $('input', root), phMsg = $(`#${id}-msg`, root), phF = $('[data-ph-f]', root);
  let country = COUNTRIES.find((c) => c.id === i.country) || COUNTRIES[1];
  const phDigits = (v) => { let d = v.replace(/\D/g, ''); if (d.length > country.len && d.startsWith(country.e164)) d = d.slice(country.e164.length); return d.slice(0, country.len); };
  const fmtPhone = (v) => { const d = phDigits(v); let out = '', k = 0; for (const ch of country.mask) { if (k >= d.length) break; out += ch === '#' ? d[k++] : ch; } return out; };
  const emit = () => { const d = phDigits(ph.value); on?.change?.(JSON.stringify({ e164: `+${country.e164}${d}`, valid: d.length === country.len, country: country.id })); };
  const phCheck = (final) => { const d = phDigits(ph.value), ok = d.length === country.len, bad = final && d.length > 0 && !ok; phF.toggleAttribute('data-invalid', bad); ph.setAttribute('aria-invalid', bad); phMsg.textContent = ok ? `Se guarda como +${country.e164}${d}` : bad ? `Faltan ${country.len - d.length} dígitos para un número de ${country.label}` : `${country.len} dígitos, sin el ${country.dial}`; };
  const setCountry = (c) => { country = c; $('[data-ph-flag]', root).textContent = c.id; $('[data-ph-dial]', root).textContent = c.dial; ph.placeholder = c.mask.replace(/#/g, '0'); ph.value = fmtPhone(ph.value); phCheck(false); };
  ph.addEventListener('input', () => { reformat(ph, fmtPhone, /\d/); phCheck(phF.hasAttribute('data-invalid')); emit(); });
  ph.addEventListener('blur', () => phCheck(true));
  codePicker(core, { trigger: $('[data-ph-cc]', root), anchor: $('[data-ph-group]', root), placeholder: 'Buscar país', current: () => country.id, items: () => COUNTRIES.map((c) => ({ id: c.id, label: c.label, hint: c.dial })), onPick: (it) => { setCountry(COUNTRIES.find((c) => c.id === it.id)); ph.focus({ preventScroll: true }); emit(); } });
  setCountry(country); ph.value = fmtPhone(String(i.value ?? '')); phCheck(false);
}

// OtpField: 6 slots in two groups of 3. i {length, hint, state: ""|checking|ok|bad, message, resendIn} →
// on.complete(code) when full, on.resend(). The page checks the code and answers with state + message.
export function otpField(root, i, core, on) {
  const { $ } = core;
  const len = Number(i.length) || 6, half = Math.ceil(len / 2);
  root.innerHTML = `<div class="cx-vline cx-otp-stack"><div class="cx-otp"><input class="cx-otp-input" inputmode="numeric" autocomplete="one-time-code" maxlength="${len}" aria-label="Código de ${len} dígitos"><div data-slot="input-otp" class="cn-input-otp" aria-hidden="true"><div data-slot="input-otp-group" class="cn-input-otp-group"></div><div data-slot="input-otp-separator" class="cn-input-otp-separator cx-otp-sep"><span></span></div><div data-slot="input-otp-group" class="cn-input-otp-group"></div></div></div><p class="cx-note" data-otp-msg></p><button data-slot="button" class="cn-button cn-button-variant-link cn-button-size-sm group/button" data-otp-resend disabled></button></div>`;
  const otpIn = $('.cx-otp-input', root), otpBox = $('.cx-otp', root), otpMsg = $('[data-otp-msg]', root), resend = $('[data-otp-resend]', root);
  const slots = [];
  root.querySelectorAll('.cn-input-otp-group').forEach((g, gi) => { const n = gi ? len - half : half; for (let k = 0; k < n; k++) { const s = document.createElement('div'); s.className = 'cn-input-otp-slot'; s.dataset.slot = 'input-otp-slot'; g.appendChild(s); slots.push(s); } });
  const hint = i.hint || ''; let busy = false;
  otpMsg.textContent = hint;
  const paint = () => { const v = otpIn.value, focused = document.activeElement === otpIn, at = Math.min(v.length, len - 1); slots.forEach((s, k) => { s.textContent = v[k] || ''; const act = focused && k === at && !busy; s.dataset.active = act; if (act && !v[k]) s.innerHTML = '<span class="cx-caret"></span>'; }); };
  const toEnd = () => { const n = otpIn.value.length; otpIn.setSelectionRange(n, n); };
  otpIn.addEventListener('input', () => {
    otpIn.value = otpIn.value.replace(/\D/g, '').slice(0, len); delete otpBox.dataset.state; otpMsg.removeAttribute('data-tone'); otpMsg.textContent = hint; paint();
    if (otpIn.value.length === len) { busy = true; otpIn.readOnly = true; otpMsg.textContent = 'Verificando…'; paint(); on?.complete?.(otpIn.value); }
  });
  ['focus', 'blur', 'click', 'keyup'].forEach((t) => otpIn.addEventListener(t, () => { toEnd(); paint(); }));
  otpIn.addEventListener('select', toEnd);
  let left = Number(i.resendIn ?? 30), rt = 0;
  const tick = () => { left--; resend.disabled = left > 0; resend.textContent = left > 0 ? `Reenviar en 0:${String(left).padStart(2, '0')}` : 'Reenviar código'; if (left > 0) rt = setTimeout(tick, 1000); };
  resend.textContent = `Reenviar en 0:${String(left).padStart(2, '0')}`;
  resend.onclick = () => { left = Number(i.resendIn ?? 30) + 1; clearTimeout(rt); tick(); otpMsg.removeAttribute('data-tone'); otpMsg.textContent = 'Te enviamos un código nuevo'; otpIn.value = ''; delete otpBox.dataset.state; otpIn.focus(); on?.resend?.(); };
  rt = setTimeout(tick, 1000); paint();
  const answer = (st, msg) => {
    if (!st || st === 'checking') return;
    busy = false; otpIn.readOnly = false;
    if (st === 'ok') { otpBox.dataset.state = 'ok'; otpMsg.dataset.tone = 'ok'; otpMsg.textContent = msg || 'Listo, quedó verificado'; otpIn.blur(); }
    if (st === 'bad') { otpBox.dataset.state = 'bad'; otpMsg.dataset.tone = 'bad'; otpMsg.textContent = msg || 'Ese código no es'; const wrong = otpIn.value; setTimeout(() => { if (otpIn.value === wrong) { otpIn.value = ''; paint(); } }, 450); }
    paint();
  };
  return (next) => answer(next.state, next.message);
}
