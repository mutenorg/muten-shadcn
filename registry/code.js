// Code (muten Custom) - a code block: a bar with the language (or a title) and Copiar, then the code highlighted with
// the muten grammar (any other lang shows plain). inputs: code, lang, title. The highlighter is the shared
// highlight.js, loaded lazily so the token rules live in one place.
export function mount(el, inputs) {
  const code = String(inputs.code ?? ''), lang = String(inputs.lang || 'muten');
  el.innerHTML = '<div class="cx-code-bar"><span></span><button type="button" class="cn-button cn-button-variant-outline cn-button-size-xs">Copiar</button></div><pre class="cx-code-pre"><code></code></pre>';
  el.querySelector('.cx-code-bar span').textContent = inputs.title || lang;
  const box = el.querySelector('code'), copy = el.querySelector('button');
  box.textContent = code;
  if (lang === 'muten') import('@muten/shadcn/registry/highlight.js').then((m) => { box.innerHTML = m.highlight(code, lang); }).catch(() => {});
  copy.onclick = () => {
    const done = (t) => { copy.textContent = t; setTimeout(() => { copy.textContent = 'Copiar'; }, 1400); };
    try { navigator.clipboard.writeText(code).then(() => done('Copiado'), () => { getSelection().selectAllChildren(box); done('Selecciónalo'); }); } catch { getSelection().selectAllChildren(box); done('Selecciónalo'); }
  };
  return (next) => { const c = String(next.code ?? ''); if (c === box.textContent) return; box.textContent = c; if (lang === 'muten') import('@muten/shadcn/registry/highlight.js').then((m) => { box.innerHTML = m.highlight(c, lang); }); };
}
