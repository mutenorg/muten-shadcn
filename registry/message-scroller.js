// MessageScrollerBehavior (muten Custom) - keeps a conversation at its latest message: it opens at the bottom, and a
// message that arrives keeps it there only when the reader was already at the bottom (scrolling back is respected).
export function mount(el) {
  const box = el.parentElement;
  let pinned = true;
  const atBottom = () => box.scrollHeight - box.scrollTop - box.clientHeight < 24;
  box.addEventListener('scroll', () => { pinned = atBottom(); }, { passive: true });
  const stick = () => { if (pinned) box.scrollTop = box.scrollHeight; };
  requestAnimationFrame(() => { box.scrollTop = box.scrollHeight; });
  new MutationObserver(stick).observe(box, { childList: true, subtree: true });
  return () => {};
}
