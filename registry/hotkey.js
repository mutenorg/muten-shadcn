// Hotkey host (muten Custom, invisible). inputs: { keys } (e.g. "k" -> Cmd/Ctrl+K). handlers: { press }.
// A global keyboard shortcut: useful to open a CommandPalette. Renders nothing.
export function mount(el, inputs, handlers) {
  const key = String(inputs.keys == null ? 'k' : inputs.keys).toLowerCase();
  const onKey = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === key) { e.preventDefault(); if (handlers.press) handlers.press(); }
  };
  document.addEventListener('keydown', onKey);
  return () => {};
}
