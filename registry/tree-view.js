// TreeView host (muten Custom). TWO modes, chosen by whether you pass key names:
//   nested (default): data = [{ name, children? }] - folders expand, a leaf emits its "/path".
//   flat (pass keys):  data = a FLAT list of records; `groupKey` buckets them into folders, `labelKey` is the
//                      visible text, `valueKey` is the payload - a leaf emits node[valueKey] (NOT a path). This is
//                      how you feed a `query` of rows straight in (e.g. tilesets) without nesting them in muten.
// `selected` (optional, controlled): highlights the matching leaf (its value in flat mode, its path in nested) and
//   auto-expands the folder holding it - for the row your app auto-opens on load.
// Folders ONLY expand; only leaves emit `select`. inputs: { data, labelKey, valueKey, groupKey, selected }.
// handlers: { select(value) }. A `query` passed as data arrives as { loading, data:[…] } - unwrapped here.
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

  // A query arrives as { loading, data:[…] }; a plain list as the array; else nothing.
  const rows = (d) => Array.isArray(d) ? d : (d && Array.isArray(d.data) ? d.data : null);

  // Normalize either mode into the internal nested shape: folder = { name, children:[…] }, leaf = { name, value }.
  const toTree = (ins) => {
    const lk = ins.labelKey, vk = ins.valueKey, gk = ins.groupKey;
    const list = rows(ins.data);
    if ((lk || vk || gk) && list) {
      const groups = new Map(); const loose = [];
      for (const row of list) {
        const label = lk ? row[lk] : (row && row.name != null ? row.name : String(row));
        const value = vk ? row[vk] : label;
        const leaf = { name: String(label), value };
        const g = gk ? row[gk] : '';
        if (g == null || g === '') { loose.push(leaf); continue; }
        if (!groups.has(g)) groups.set(g, { name: String(g), children: [] });
        groups.get(g).children.push(leaf);
      }
      return [...groups.values(), ...loose];
    }
    return list && list.length ? list : SAMPLE;
  };

  const idOf = (node, path) => Array.isArray(node.children) ? path : (node.value != null ? String(node.value) : path);

  let data = toTree(inputs);
  let selected = inputs.selected != null ? String(inputs.selected) : '';
  const expanded = new Set();

  // expand the ancestor folders of the leaf whose id === selected; true if found in this subtree
  const expandTo = (nodes, parent) => {
    for (const node of nodes) {
      const path = parent + '/' + node.name;
      if (Array.isArray(node.children)) { if (expandTo(node.children, path)) { expanded.add(path); return true; } }
      else if (idOf(node, path) === selected) return true;
    }
    return false;
  };
  const seed = () => { for (const n of data) if (Array.isArray(n.children)) expanded.add('/' + n.name); if (selected) expandTo(data, ''); };
  seed();

  const build = (nodes, container, depth, parent) => {
    for (const node of nodes) {
      const path = parent + '/' + node.name;
      const isFolder = Array.isArray(node.children);
      const id = idOf(node, path);
      const row = document.createElement('button'); row.type = 'button'; row.className = 'tree-row';
      row.style.paddingLeft = (depth * 16 + 6) + 'px';
      if (!isFolder && id === selected) row.classList.add('tree-row-selected');
      const chev = document.createElement('span'); chev.className = 'tree-chevron' + (isFolder ? '' : ' tree-chevron-hidden');
      // lucide chevron-down (open) / chevron-right (closed)
      chev.innerHTML = isFolder ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="' + (expanded.has(path) ? 'm6 9 6 6 6-6' : 'm9 18 6-6-6-6') + '"/></svg>' : '';
      const ic = document.createElement('span'); ic.className = 'tree-icon'; ic.innerHTML = isFolder ? FOLDER : FILE;
      const label = document.createElement('span'); label.className = 'tree-label'; label.textContent = node.name;
      row.appendChild(chev); row.appendChild(ic); row.appendChild(label);
      row.addEventListener('click', () => {
        if (isFolder) { expanded.has(path) ? expanded.delete(path) : expanded.add(path); }   // folders: expand only
        else { selected = id; if (handlers.select) handlers.select(node.value != null ? node.value : path); } // leaves emit
        render();
      });
      container.appendChild(row);
      if (isFolder && expanded.has(path)) build(node.children, container, depth + 1, path);
    }
  };
  const render = () => { el.innerHTML = ''; const root = document.createElement('div'); root.className = 'tree'; build(data, root, 0, ''); el.appendChild(root); };

  render();
  return (n) => {
    data = toTree(n);
    if (n.selected != null) { selected = String(n.selected); if (selected) expandTo(data, ''); } // re-open to the controlled leaf
    render();
  };
}
