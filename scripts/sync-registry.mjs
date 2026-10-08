// sync-registry.mjs - keeps registry.json in step with registry/*.muten (run from plugins/shadcn after adding,
// renaming or removing a part):   node scripts/sync-registry.mjs
// muten resolves a Custom's host .js through registry.json: the entry of <name>.muten names ONE component, and its
// code is <name>.js. A part file whose Custom is missing here mounts nothing, silently - so the entries are derived
// from the files, never kept by hand. Descriptions already written are kept; a new entry takes its header's first line.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const REG = path.join(ROOT, 'registry.json');
const DIR = path.join(ROOT, 'registry');
const reg = JSON.parse(fs.readFileSync(REG, 'utf8'));
const old = new Map(reg.components.map((c) => [c.name, c]));
const problems = [];
const out = fs.readdirSync(DIR).filter((f) => f.endsWith('.muten')).sort().map((f) => {
  const name = f.replace(/\.muten$/, ''), src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const parts = [...src.matchAll(/^part\s+(\w+)/gm)].map((m) => m[1]);
  const code = src.split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
  const customs = [...new Set([...code.matchAll(/\bCustom\s+(\w+)/g)].map((m) => m[1]))];
  const hasJs = fs.existsSync(path.join(DIR, `${name}.js`));
  // the file's own Custom is the one whose code is <name>.js; a Custom of another file (KitWidget) is resolved by that file
  const own = customs.filter((c) => !fs.existsSync(path.join(DIR, `${c.replace(/[A-Z]/g, (m, i) => (i ? '-' : '') + m.toLowerCase())}.muten`)) || c.replace(/[A-Z]/g, (m, i) => (i ? '-' : '') + m.toLowerCase()) === name);
  if (own.length > 1) problems.push(`${f}: ${own.join(', ')} - one .muten file can host only one Custom's .js`);
  if (own.length === 1 && !hasJs) problems.push(`${f}: Custom ${own[0]} has no ${name}.js`);
  const prev = old.get(name) || {};
  const header = (src.match(/^#\s*(.+)$/m) || [, ''])[1].trim();
  const entry = { name, deps: prev.deps || [], part: parts[0] || prev.part || '', file: `registry/${f}` };
  if (own.length === 1 && hasJs) entry.component = own[0];
  entry.description = prev.description && prev.part === entry.part ? prev.description : header;
  return entry;
});
reg.components = out;
fs.writeFileSync(REG, JSON.stringify(reg, null, 2) + '\n');
console.log(`${out.length} entries · ${out.filter((e) => e.component).length} with a Custom`);
if (problems.length) { console.log(problems.join('\n')); process.exitCode = 1; }
