// MediaQuery (muten Custom) - says "yes"/"no" for a media query at mount and on every change (see media-query.muten).
// Plain DOM: one matchMedia listener, which drops itself the first time it fires after the element left the page.
export function mount(el, inputs, on) {
  el.hidden = true;
  el.setAttribute('aria-hidden', 'true');
  let mq = null, last = '';
  const say = () => { if (mq && !el.isConnected && last) { mq.removeEventListener('change', say); return; } const now = mq && mq.matches ? 'yes' : 'no'; if (now !== last) { last = now; on.change?.(now); } };
  const watch = (query) => {
    if (mq) mq.removeEventListener('change', say);
    mq = typeof matchMedia === 'function' && query ? matchMedia(String(query)) : null;
    last = '';
    if (mq) mq.addEventListener('change', say);
    say();
  };
  watch(inputs.query);
  return (next) => { if (next.query !== inputs.query) { inputs = next; watch(next.query); } };
}
