// Input OTP host component (muten Custom). inputs: { value, length }. handlers: { input(value) }.
// Builds `length` single-character boxes; typing/paste/backspace move focus and emit the joined value.
export function mount(el, inputs, handlers) {
  const len = Number(inputs.length ?? 6);
  const boxes = [];
  const emit = () => { if (handlers.input) handlers.input(boxes.map((b) => b.value).join('')); };

  for (let i = 0; i < len; i++) {
    const box = document.createElement('input');
    box.className = 'otp-slot';
    box.maxLength = 1;
    box.inputMode = 'numeric';
    box.autocomplete = 'one-time-code';
    box.addEventListener('input', () => {
      box.value = box.value.replace(/\D/g, '').slice(-1);
      if (box.value && i < len - 1) boxes[i + 1].focus();
      emit();
    });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && i > 0) boxes[i - 1].focus();
    });
    box.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = ((e.clipboardData && e.clipboardData.getData('text')) || '').replace(/\D/g, '').slice(0, len);
      for (let j = 0; j < len; j++) boxes[j].value = text[j] || '';
      (boxes[Math.min(text.length, len - 1)] || boxes[0]).focus();
      emit();
    });
    boxes.push(box);
    el.appendChild(box);
  }

  const set = (val) => { const s = String(val == null ? '' : val); boxes.forEach((b, i) => { b.value = s[i] || ''; }); };
  set(inputs.value);
  return (next) => set(next.value);
}
