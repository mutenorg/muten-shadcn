// FileInput (muten Custom) - a drop zone for files: tap to pick, drag and drop, or paste. inputs: label, hint,
// accept, multiple ("on"), maxMb. handlers: files(names joined by ", "). What was picked is listed under the zone
// with its size and a × to take it away; a file of the wrong type or too heavy is refused there, with the reason.
export function mount(el, inputs, on) {
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const multiple = inputs.multiple === 'on', maxMb = Number(inputs.maxMb) || 10, accept = String(inputs.accept || '');
  el.innerHTML = `<div class="cx-drop cx-file-drop" tabindex="0" role="button" aria-label="${esc(inputs.label || 'Subir archivo')}">
      <input type="file" hidden ${accept ? `accept="${esc(accept)}"` : ''} ${multiple ? 'multiple' : ''}>
      <div class="cx-drop-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><b>${esc(inputs.label || 'Sube un archivo')}</b><span>${esc(inputs.hint || 'Toca, arrastra o pega aquí')}</span></div>
    </div>
    <p class="cx-note cx-file-msg" aria-live="polite"></p>
    <div data-slot="item-group" class="cn-item-group cx-file-list" role="list"></div>`;
  const zone = el.querySelector('.cx-drop'), input = el.querySelector('input'), list = el.querySelector('.cx-file-list'), msg = el.querySelector('.cx-file-msg');
  let files = [];
  const size = (b) => (b < 1024 ? `${b} B` : b < 1048576 ? `${Math.round(b / 1024)} KB` : `${(b / 1048576).toFixed(1)} MB`);
  const fits = (f) => { if (!accept) return true; return accept.split(',').map((a) => a.trim()).some((a) => (a.endsWith('/*') ? f.type.startsWith(a.slice(0, -1)) : a.startsWith('.') ? f.name.toLowerCase().endsWith(a.toLowerCase()) : f.type === a)); };
  const paint = () => {
    list.innerHTML = files.map((f, i) => `<div data-slot="item" class="cn-item cn-item-variant-outline cn-item-size-sm group/item" role="listitem"><div class="cn-item-media cn-item-media-variant-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg></div><div class="cn-item-content"><div class="cn-item-title cx-ellipsis">${esc(f.name)}</div><p class="cn-item-description">${size(f.size)}</p></div><div class="cn-item-actions"><button type="button" class="cn-button cn-button-variant-ghost cn-button-size-icon-xs" data-drop="${i}" aria-label="Quitar ${esc(f.name)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div></div>`).join('');
    on.files?.(files.map((f) => f.name).join(', '));
  };
  const take = (fileList) => {
    const incoming = Array.from(fileList || []); if (!incoming.length) return;
    const bad = incoming.filter((f) => !fits(f)), heavy = incoming.filter((f) => fits(f) && f.size > maxMb * 1048576);
    const good = incoming.filter((f) => fits(f) && f.size <= maxMb * 1048576);
    msg.textContent = bad.length ? `${bad[0].name} no es de un tipo que se pueda subir aquí.` : heavy.length ? `${heavy[0].name} pesa más de ${maxMb} MB.` : '';
    files = multiple ? files.concat(good) : good.slice(0, 1).length ? good.slice(0, 1) : files;
    paint();
  };
  zone.addEventListener('click', () => input.click());
  zone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
  input.addEventListener('change', () => { take(input.files); input.value = ''; });
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.dataset.over = ''; });
  zone.addEventListener('dragleave', () => delete zone.dataset.over);
  zone.addEventListener('drop', (e) => { e.preventDefault(); delete zone.dataset.over; take(e.dataTransfer?.files); });
  zone.addEventListener('paste', (e) => take(e.clipboardData?.files));
  list.addEventListener('click', (e) => { const b = e.target.closest('[data-drop]'); if (!b) return; files.splice(+b.dataset.drop, 1); paint(); });
  return () => {};
}
