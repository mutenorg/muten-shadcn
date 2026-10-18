// FieldBehavior (muten Custom) - the reference artifact's field rules, on the muten field it sits in. The value stays
// muten's (bind): every change here dispatches an input event so the page's state follows.
export function mount(el, inputs) {
  let I = null; import('@muten/shadcn/registry/kit/i18n.js').then((m) => { I = m; });
  const field = el.closest('.cn-field, .cn-input-group') || el.parentElement;
  const input = field.querySelector('input, textarea');
  if (!input) return () => {};
  const set = (v) => { input.value = v; input.dispatchEvent(new Event('input', { bubbles: true })); };
  const kind = inputs.kind;
  if (kind === 'money') {
    // thousands while typing (not only on leaving: focusing used to drop the dots), and only digits get in: a letter is
    // not written, the caret stays after the same digit
    const group = (d) => d.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.inputMode = 'numeric';
    input.addEventListener('beforeinput', (e) => { if (e.data && /\D/.test(e.data) && e.inputType.startsWith('insert')) e.preventDefault(); });
    input.addEventListener('input', (e) => {
      if (!e.isTrusted) return;
      const caret = input.selectionStart ?? input.value.length, keep = input.value.slice(0, caret).replace(/\D/g, '').length;
      const next = group(input.value.replace(/\D/g, '')); if (next === input.value) return;
      set(next); let pos = 0, seen = 0; while (pos < next.length && seen < keep) { if (/\d/.test(next[pos])) seen++; pos++; }
      input.setSelectionRange(pos, pos);
    });
    set(group(input.value.replace(/\D/g, '')));
  }
  if (kind === 'email') {
    // the Field draws its description after its slot, so it is looked up when needed, not at mount
    let help = null;
    const ok = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    const check = () => { const desc = field.querySelector('.cn-field-description'); if (desc && help === null) help = desc.textContent; const bad = input.value.trim() !== '' && !ok(input.value.trim()); input.setAttribute('aria-invalid', String(bad)); field.toggleAttribute('data-invalid', bad); if (desc) { desc.classList.add('cx-msg'); desc.textContent = bad ? inputs.message || (I ? I.t(I.langOf(field), 'Check the email.') : 'Check the email.') : help; } };
    input.addEventListener('blur', check);
    input.addEventListener('input', () => { if (field.hasAttribute('data-invalid') && ok(input.value.trim())) check(); });
  }
  if (kind === 'search') input.addEventListener('keydown', (e) => { if (e.key === 'Escape' && input.value) { e.preventDefault(); set(''); } });
  if (kind === 'count') {
    const max = Number(inputs.max) || 0; if (max) input.maxLength = max;
    requestAnimationFrame(() => { const desc = field.querySelector('.cn-field-description');
    if (desc) { desc.classList.add('cx-count-line'); const help = desc.textContent; desc.innerHTML = ''; const a = document.createElement('span'); a.textContent = help; const n = document.createElement('span'); desc.append(a, n);
      const paint = () => { n.textContent = max ? `${input.value.length}/${max}` : String(input.value.length); desc.toggleAttribute('data-near', max && input.value.length >= max * 0.9); };
      input.addEventListener('input', paint); paint(); }
    });
  }
  return () => {};
}
