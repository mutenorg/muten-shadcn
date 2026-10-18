// FolderPicker (muten Custom) - connects a folder of the computer (the File System Access API, Chromium browsers): a
// button that, once a folder is chosen, shows its name. The folder's handle stays here for reading and writing.
// inputs: label. handlers: pick(folder name). Where the browser cannot, the button says so instead of failing.
export function mount(el, inputs, on) {
  const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>';
  // its words: English, said in the language of the nearest lang (or inputs.lang)
  if (inputs.lang) el.setAttribute('lang', inputs.lang);
  let I = null; const T = (k, ...a) => (I ? I.t(I.langOf(el), k, ...a) : k);
  const idle = inputs.label || 'Connect a folder';
  el.innerHTML = `<button type="button" data-slot="button" class="cn-button cn-button-variant-outline cn-button-size-default group/button cx-folder-btn">${ICON}<span></span></button><p class="cx-note cx-folder-msg" aria-live="polite"></p>`;
  const btn = el.querySelector('button'), label = btn.querySelector('span'), msg = el.querySelector('.cx-folder-msg');
  label.textContent = idle;
  import('@muten/shadcn/registry/kit/i18n.js').then((m) => { I = m; if (!btn.dataset.connected) label.textContent = T(idle); if (btn.disabled) msg.textContent = T('This browser cannot pick folders: use Chrome or Edge.'); });
  if (!window.showDirectoryPicker) { btn.disabled = true; msg.textContent = T('This browser cannot pick folders: use Chrome or Edge.'); }
  btn.addEventListener('click', async () => {
    try { const handle = await window.showDirectoryPicker(); label.textContent = handle.name; btn.dataset.connected = ''; el._folder = handle; on.pick?.(handle.name); }
    catch { /* the person closed the picker */ }
  });
  return () => {};
}
