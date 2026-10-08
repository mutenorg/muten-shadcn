// DirtyBar (muten Custom) - the kit's «unsaved changes» bar over the form it sits in (kit/core.js kit.dirtyBar).
// «Descartar» restores what muten owns: inputs get their saved value (and an input event, so muten's bind follows),
// switches that moved are toggled back by a click (so the page's action runs). The weekly hours restore themselves.
export function mount(el, inputs, on) {
  import('@muten/shadcn/registry/kit/core.js').then(({ kit }) => {
    const form = el.closest('.cx-set-form') || el.parentElement;
    const fields = () => [...form.querySelectorAll('input, select, textarea, [role=switch], .cx-time-btn, .cx-sel-btn')];
    kit.dirtyBar(form, { onSave: () => { form.dispatchEvent(new Event('kit-saved')); on.save?.(); } });
    form.addEventListener('discard', (e) => {
      const saved = e.detail || [];
      fields().forEach((x, i) => {
        if (x.closest('.cx-wh-host') || i >= saved.length) return;
        if (x.getAttribute('role') === 'switch') { if (String(x.getAttribute('aria-checked')) !== String(saved[i])) x.click(); return; }
        if (x.matches('input, textarea, select') && x.value !== saved[i]) { x.value = saved[i]; x.dispatchEvent(new Event('input', { bubbles: true })); }
      });
    });
  });
  return () => {};
}
