// TagInput host (muten Custom). inputs: { value (comma-joined), placeholder }. handlers: { change(commaJoined) }.
// Type + Enter adds a chip; the x or Backspace (on an empty field) removes one. The page owns a comma-joined text.
export function mount(el, inputs, handlers) {
  const parse = (v) => String(v == null ? '' : v).split(',').map((s) => s.trim()).filter(Boolean);
  let tags = parse(inputs.value);
  const input = document.createElement('input'); input.className = 'tag-input-field';
  input.placeholder = inputs.placeholder == null ? 'Add tag…' : String(inputs.placeholder);

  const emit = () => { if (handlers.change) handlers.change(tags.join(',')); render(); };
  const render = () => {
    el.innerHTML = '';
    for (const t of tags) {
      const chip = document.createElement('span'); chip.className = 'tag-chip'; chip.textContent = t;
      const x = document.createElement('span'); x.className = 'tag-chip-x'; x.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'; // lucide x
      x.addEventListener('click', (e) => { e.stopPropagation(); tags = tags.filter((z) => z !== t); emit(); });
      chip.appendChild(x); el.appendChild(chip);
    }
    el.appendChild(input);
  };
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) { e.preventDefault(); const v = input.value.trim(); if (!tags.includes(v)) tags.push(v); input.value = ''; emit(); }
    else if (e.key === 'Backspace' && !input.value && tags.length) { tags.pop(); emit(); }
  });
  el.addEventListener('click', () => input.focus());

  render();
  return (n) => { tags = parse(n.value); render(); };
}
