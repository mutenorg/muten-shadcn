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

  // Built ONCE per data: a folder is its row plus a group that folds open and closed (grid rows 0fr ↔ 1fr, the
  // accordion's 200 ms), its chevron turns, and picking a leaf only moves aria-selected. Nothing is rebuilt on a
  // click, so the row under the pointer keeps its hover, the tree never jumps in height and keeps its width.
  const CHEV = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
  let root = null;
  const build = (nodes, container, depth, parent) => {
    for (const node of nodes) {
      const path = parent + '/' + node.name;
      const isFolder = Array.isArray(node.children);
      const id = idOf(node, path);
      const row = document.createElement('button'); row.type = 'button'; row.className = 'cx-tree-row'; row.setAttribute('role', 'treeitem'); row.tabIndex = -1; row.dataset.path = path; row.dataset.id = id; row.setAttribute('aria-level', depth + 1);
      row.style.paddingLeft = (depth * 16 + 8) + 'px';
      if (!isFolder) row.dataset.leaf = '';
      const chev = document.createElement('span'); chev.className = 'cx-tree-chev' + (isFolder ? '' : ' cx-tree-chev-none'); chev.innerHTML = isFolder ? CHEV : '';
      const ic = document.createElement('span'); ic.className = 'cx-tree-ic'; ic.innerHTML = isFolder ? FOLDER : FILE;
      const label = document.createElement('span'); label.className = 'cx-tree-label'; label.textContent = node.name;
      row.append(chev, ic, label);
      container.appendChild(row);
      if (isFolder) {
        row.setAttribute('aria-expanded', String(expanded.has(path)));
        const fold = document.createElement('div'); fold.className = 'cx-tree-fold'; fold.setAttribute('role', 'group');
        const inner = document.createElement('div'); inner.className = 'cx-tree-inner';
        fold.appendChild(inner); container.appendChild(fold);
        build(node.children, inner, depth + 1, path);
      }
      if (!isFolder) row.addEventListener('click', () => { selected = id; mark(); if (handlers.select) handlers.select(node.value != null ? node.value : path); });
      else row.addEventListener('click', () => { expanded.has(path) ? expanded.delete(path) : expanded.add(path); row.setAttribute('aria-expanded', String(expanded.has(path))); visible(); });
    }
  };
  // the rows a keyboard can reach: not inside a closed folder
  const visible = () => { const all = [...root.querySelectorAll('.cx-tree-row')]; const shown = all.filter((r) => !r.parentElement.closest('.cx-tree-fold') || ![...ancestorsOf(r)].some((f) => f.previousElementSibling?.getAttribute('aria-expanded') !== 'true')); all.forEach((r) => { r.inert = !shown.includes(r); }); return shown; };
  const ancestorsOf = function* (r) { let f = r.parentElement.closest('.cx-tree-fold'); while (f) { yield f; f = f.parentElement.closest('.cx-tree-fold'); } };
  const mark = () => { root.querySelectorAll('.cx-tree-row').forEach((r) => { const on = r.hasAttribute('data-leaf') && r.dataset.id === selected; if (on) r.setAttribute('aria-selected', 'true'); else r.removeAttribute('aria-selected'); }); roving(); };
  const roving = () => { const rows = visible(); const cur = rows.find((r) => r.dataset.path === focusPath) || rows.find((r) => r.getAttribute('aria-selected') === 'true') || rows[0]; rows.forEach((r) => { r.tabIndex = r === cur ? 0 : -1; }); return cur; };
  let focusPath = null;
  const render = () => {
    el.innerHTML = ''; root = document.createElement('div'); root.className = 'cx-tree'; root.setAttribute('role', 'tree'); root.setAttribute('aria-label', inputs.label || 'Archivos');
    build(data, root, 0, ''); el.appendChild(root); mark();
  };
  // keyboard (WAI tree): Up/Down move, Right opens a folder (or steps in), Left closes it (or goes to its parent), Enter/Space pick
  el.addEventListener('keydown', (e) => {
    const rows = visible(), k = rows.indexOf(document.activeElement); if (k < 0) return;
    const row = rows[k], folder = row.hasAttribute('aria-expanded'), open = row.getAttribute('aria-expanded') === 'true';
    const go = (r) => { if (!r) return; focusPath = r.dataset.path; roving(); r.focus(); };
    if (e.key === 'ArrowDown') { e.preventDefault(); go(rows[k + 1]); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); go(rows[k - 1]); }
    else if (e.key === 'Home') { e.preventDefault(); go(rows[0]); }
    else if (e.key === 'End') { e.preventDefault(); go(rows[rows.length - 1]); }
    else if (e.key === 'ArrowRight' && folder) { e.preventDefault(); if (!open) row.click(); else go(rows[k + 1]); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); if (folder && open) row.click(); else { const parent = row.dataset.path.split('/').slice(0, -1).join('/'); go(rows.find((x) => x.dataset.path === parent)); } }
  });
  el.addEventListener('click', (e) => { const r = e.target.closest('.cx-tree-row'); if (r) { focusPath = r.dataset.path; roving(); } }, true);

  render();
  // new data rebuilds (once); a new `selected` only moves the mark and opens the folders down to it
  let lastData = inputs.data;
  return (n) => {
    if (n.data !== lastData) { lastData = n.data; data = toTree(n); if (n.selected != null) selected = String(n.selected); if (selected) expandTo(data, ''); render(); return; }
    if (n.selected != null && String(n.selected) !== selected) {
      selected = String(n.selected); if (selected) expandTo(data, '');
      root.querySelectorAll('.cx-tree-row[aria-expanded]').forEach((r) => r.setAttribute('aria-expanded', String(expanded.has(r.dataset.path))));
      mark();
    }
  };
}
