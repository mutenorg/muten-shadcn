// Code (muten Custom) - a code block: a bar with the language (or a title) and Copy, then the code highlighted with
// the muten grammar (any other lang shows plain). inputs: code, lang, title. The highlighter is the shared
// highlight.js, loaded lazily so the token rules live in one place.
export function mount(el, inputs) {
  const code = String(inputs.code ?? ''), lang = String(inputs.lang || 'muten');
  el.innerHTML = '<div class="cx-code-bar"><span></span><button type="button" class="cn-button cn-button-variant-outline cn-button-size-xs" data-tr="Copy">Copy</button></div><pre class="cx-code-pre"><code></code></pre>';
  el.querySelector('.cx-code-bar span').textContent = inputs.title || lang;
  const box = el.querySelector('code'), copy = el.querySelector('button');
  // its words: English, said in the language of the nearest lang (or inputs.lang) once kit/i18n.js is in
  let I = null; const T = (k, ...a) => (I ? I.t(I.langOf(el), k, ...a) : a.reduce((s, v, n) => s.replace(`{${n}}`, v), k));
  // (inputs.lang here is the code's language, “muten”, not a human one: the words follow the nearest lang)
  import('@muten/shadcn/registry/kit/i18n.js').then((m) => { I = m; m.localizeTree(el); });
  box.textContent = code;
  if (lang === 'muten') import('@muten/shadcn/registry/highlight.js').then((m) => { box.innerHTML = m.highlight(code, lang); }).catch(() => {});
  copy.onclick = () => {
    // the new word comes in with the kit's swap (kit.css .cx-swap-in), the old one does not just blink away
    const say = (k) => { copy.innerHTML = '<span class="cx-swap-in"></span>'; copy.firstChild.textContent = T(k); };
    const done = (t) => { say(t); setTimeout(() => say('Copy'), 1400); };
    try { navigator.clipboard.writeText(code).then(() => done('Copied'), () => { getSelection().selectAllChildren(box); done('Select it'); }); } catch { getSelection().selectAllChildren(box); done('Select it'); }
  };
  return (next) => { const c = String(next.code ?? ''); if (c === box.textContent) return; box.textContent = c; if (lang === 'muten') import('@muten/shadcn/registry/highlight.js').then((m) => { box.innerHTML = m.highlight(c, lang); }); };
}
