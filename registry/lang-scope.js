// LangScope (muten Custom) - puts `lang` on the scope it sits first in, so every piece inside (kit/i18n.js langOf)
// speaks it; a new lang later changes it in place and the kit repaints in it (kit/core.js listens for lang changes).
export function mount(el, inputs) {
  const scope = el.parentElement;
  const set = (lang) => { const v = String(lang || ''); if (!scope) return; if (v) { if (scope.getAttribute('lang') !== v) scope.setAttribute('lang', v); } else scope.removeAttribute('lang'); };
  set(inputs.lang);
  return (next) => set(next.lang);
}
