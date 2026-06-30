// Toaster host component (muten Custom). inputs: { trigger, title, description, variant, duration }.
// The page bumps `trigger` (a counter) to fire a toast with the current title/description; the host shows it,
// slides it in, and auto-dismisses it (click to dismiss early). No id bookkeeping on the page.
export function mount(el, inputs, handlers) {
  let last = Number(inputs.trigger ?? 0);

  const show = (title, description, variant, duration) => {
    const node = document.createElement('div');
    node.className = 'toast' + (variant === 'destructive' ? ' toast-destructive' : '');
    const t = document.createElement('div'); t.className = 'toast-title'; t.textContent = title || 'Notification';
    node.appendChild(t);
    if (description) { const d = document.createElement('div'); d.className = 'toast-description'; d.textContent = description; node.appendChild(d); }
    el.appendChild(node);
    requestAnimationFrame(() => node.classList.add('toast-show'));
    const remove = () => { node.classList.remove('toast-show'); setTimeout(() => node.remove(), 200); };
    const timer = setTimeout(remove, Number(duration ?? 3500));
    node.addEventListener('click', () => { clearTimeout(timer); remove(); });
  };

  // The effect re-runs this whenever a reactive input changes; a higher trigger means "show a new toast".
  return (next) => {
    const tr = Number(next.trigger ?? 0);
    if (tr > last) { last = tr; show(next.title, next.description, next.variant, next.duration); }
  };
}
