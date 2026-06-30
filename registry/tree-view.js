// TreeView host (muten Custom). inputs: { data } (nested nodes: { name, children?: [...] }). handlers: { select(path) }.
// Folders expand/collapse; clicking selects and emits its "/path". Falls back to a sample tree when no data is
// passed - edit SAMPLE or feed your own `data` (e.g. your project's file tree) for the real thing.
export function mount(el, inputs, handlers) {
  const FOLDER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>';
  const FILE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>';
  const SAMPLE = [
    { name: 'src', children: [
      { name: 'app.muten' },
      { name: 'pages', children: [{ name: 'home.muten' }, { name: 'editor.muten' }] },
      { name: 'components', children: [{ name: 'Canvas.js' }] },
      { name: 'styles.css' },
    ] },
    { name: 'theme.muten' },
    { name: 'package.json' },
  ];

  let data = Array.isArray(inputs.data) && inputs.data.length ? inputs.data : SAMPLE;
  let selected = '';
  const expanded = new Set();
  for (const n of data) if (Array.isArray(n.children)) expanded.add('/' + n.name); // first level open

  const build = (nodes, container, depth, parent) => {
    for (const node of nodes) {
      const path = parent + '/' + node.name;
      const isFolder = Array.isArray(node.children);
      const row = document.createElement('button'); row.type = 'button'; row.className = 'tree-row';
      row.style.paddingLeft = (depth * 16 + 6) + 'px';
      if (path === selected) row.classList.add('tree-row-selected');
      const chev = document.createElement('span'); chev.className = 'tree-chevron' + (isFolder ? '' : ' tree-chevron-hidden');
      // lucide chevron-down (open) / chevron-right (closed)
      chev.innerHTML = isFolder ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="' + (expanded.has(path) ? 'm6 9 6 6 6-6' : 'm9 18 6-6-6-6') + '"/></svg>' : '';
      const ic = document.createElement('span'); ic.className = 'tree-icon'; ic.innerHTML = isFolder ? FOLDER : FILE;
      const label = document.createElement('span'); label.className = 'tree-label'; label.textContent = node.name;
      row.appendChild(chev); row.appendChild(ic); row.appendChild(label);
      row.addEventListener('click', () => {
        if (isFolder) { expanded.has(path) ? expanded.delete(path) : expanded.add(path); }
        selected = path; if (handlers.select) handlers.select(path);
        render();
      });
      container.appendChild(row);
      if (isFolder && expanded.has(path)) build(node.children, container, depth + 1, path);
    }
  };
  const render = () => { el.innerHTML = ''; const root = document.createElement('div'); root.className = 'tree'; build(data, root, 0, ''); el.appendChild(root); };

  render();
  return (n) => { if (Array.isArray(n.data) && n.data.length) data = n.data; render(); };
}
