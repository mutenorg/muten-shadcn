// FileInput / Dropzone host (muten Custom). inputs: { label, accept, multiple }. handlers: { files(names) }.
// Click or drag-drop. Emits the comma-joined file NAMES (muten actions take strings); to read the bytes,
// edit this file to FileReader the files and emit the result (data URL / text) instead.
export function mount(el, inputs, handlers) {
  const placeholder = inputs.label == null ? 'Drop files here, or click to browse' : String(inputs.label);
  const input = document.createElement('input'); input.type = 'file'; input.hidden = true;
  if (inputs.accept) input.accept = String(inputs.accept);
  if (inputs.multiple) input.multiple = true;
  const label = document.createElement('div'); label.className = 'dropzone-label'; label.textContent = placeholder;
  el.appendChild(input); el.appendChild(label);

  const emit = (fileList) => {
    const names = Array.from(fileList || []).map((f) => f.name);
    label.textContent = names.length ? names.join(', ') : placeholder;
    if (handlers.files) handlers.files(names.join(', '));
  };

  el.addEventListener('click', () => input.click());
  input.addEventListener('change', () => emit(input.files));
  el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('dropzone-over'); });
  el.addEventListener('dragleave', () => el.classList.remove('dropzone-over'));
  el.addEventListener('drop', (e) => { e.preventDefault(); el.classList.remove('dropzone-over'); emit(e.dataTransfer && e.dataTransfer.files); });
}
