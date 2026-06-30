// FolderPicker host (muten Custom). inputs: { label }. handlers: { pick(folderName) }.
// Uses the File System Access API (showDirectoryPicker) to connect a local folder; emits its name. The directory
// handle stays here in JS - edit this file to read/write files in the chosen folder (the studio's "connect folder").
export function mount(el, inputs, handlers) {
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn btn-outline gap-2';
  const idle = inputs.label == null ? 'Connect folder' : String(inputs.label);
  btn.textContent = idle;
  el.appendChild(btn);

  btn.addEventListener('click', async () => {
    if (!window.showDirectoryPicker) { btn.textContent = 'Not supported in this browser'; return; }
    try {
      const handle = await window.showDirectoryPicker();
      btn.textContent = handle.name;
      if (handlers.pick) handlers.pick(handle.name);
    } catch (e) { /* user cancelled */ }
  });
}
