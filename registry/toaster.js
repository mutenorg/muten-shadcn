// Toaster (muten Custom) - shadcn's Sonner stack, from the reference artifact: toasts pile at the bottom right, the
// newest in front and up to three peeking behind; hovering the pile fans them out and pauses their timers; each one
// leaves on its own after `duration` ms or with its ×. inputs: trigger (bump it to show one), title, description,
// action (a button label, optional), duration. handlers: action() when its button is tapped.
export function mount(el, inputs, on) {
  const viewport = document.createElement('section'); viewport.className = 'pg-toasts'; viewport.setAttribute('aria-label', 'Avisos'); viewport.setAttribute('aria-live', 'polite');
  document.body.appendChild(viewport);
  const toasts = [];
  let last = Number(inputs.trigger) || 0;
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const layout = () => {
    let off = 0; const frontH = toasts[0] ? toasts[0].h : 0;
    toasts.forEach((t, i) => {
      t.el.style.setProperty('--i', i); t.el.style.setProperty('--h', t.h + 'px'); t.el.style.setProperty('--front-h', frontH + 'px'); t.el.style.setProperty('--off', off + 'px');
      off += t.h;
      if (i > 0) t.el.dataset.behind = ''; else delete t.el.dataset.behind;
      if (i >= 3) t.el.dataset.limited = ''; else delete t.el.dataset.limited;
    });
  };
  const dismiss = (t) => { if (t.gone) return; t.gone = true; clearTimeout(t.timer); t.el.dataset.end = ''; setTimeout(() => { t.el.remove(); const k = toasts.indexOf(t); if (k >= 0) toasts.splice(k, 1); layout(); }, 500); };
  const arm = (t, ms) => { clearTimeout(t.timer); t.timer = setTimeout(() => dismiss(t), ms); };
  viewport.addEventListener('pointerenter', () => { viewport.dataset.expanded = ''; toasts.forEach((t) => clearTimeout(t.timer)); });
  viewport.addEventListener('pointerleave', () => { delete viewport.dataset.expanded; toasts.forEach((t) => arm(t, t.ms)); });
  const show = (i) => {
    const node = document.createElement('div');
    node.className = 'pg-toast'; node.setAttribute('role', 'status'); node.dataset.start = '';
    node.innerHTML = `<div class="pg-toast-c"><div style="flex:1;min-width:0"><div class="pg-toast-t">${esc(i.title)}</div>${i.description ? `<div class="pg-toast-d">${esc(i.description)}</div>` : ''}</div>${i.action ? `<button data-slot="button" class="cn-button cn-button-variant-outline cn-button-size-sm group/button" data-toast-act>${esc(i.action)}</button>` : ''}<button data-slot="button" class="cn-button cn-button-variant-ghost cn-button-size-icon-sm group/button" aria-label="Cerrar" style="color:var(--muted-foreground)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>`;
    node.style.setProperty('--i', 0); node.style.visibility = 'hidden';
    viewport.prepend(node);
    const t = { el: node, h: node.querySelector('.pg-toast-c').scrollHeight + 2, ms: Number(i.duration) || 5000 };
    toasts.unshift(t); layout(); node.style.visibility = '';
    requestAnimationFrame(() => requestAnimationFrame(() => delete node.dataset.start));
    node.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { if (b.hasAttribute('data-toast-act')) on.action?.(); dismiss(t); }));
    arm(t, t.ms);
  };
  return (next) => { const tr = Number(next.trigger) || 0; if (tr > last) { last = tr; show(next); } };
}
