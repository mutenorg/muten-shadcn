// reuse-audit.mjs - atomic design kept honest: before something is written by hand, the library may already have it.
//   node scripts/reuse-audit.mjs                                   the library's own parts (from plugins/shadcn)
//   node node_modules/@muten/shadcn/scripts/reuse-audit.mjs src    an app's .muten files (from the app)
// It lists the markup that re-draws an existing piece: a Button wearing cn-button classes where Btn would do, a
// SearchField wearing cn-input where Input/GroupInput exist, a hand-made avatar, a phone or device frame of its own
// (DeviceFrame is the one phone of the library). A finding is not always wrong (a tab passes its value to the action,
// a close button carries its own role): each one is a question to answer before adding more.
import fs from 'node:fs';
import path from 'node:path';

const REG = path.join(import.meta.dirname, '..', 'registry');
const OWN = { 'button.muten': true, 'input.muten': true, 'input-group.muten': true, 'avatar.muten': true, 'device-frame.muten': true, 'skeleton.muten': true, 'kit-skeleton.muten': true };
const RULES = [
  { test: (l) => /\bButton\b/.test(l) && /->\s*[\w.$]+\s+class\("cn-button/.test(l) && !/aria\((pressed|role)|status:|marker:|"\{\$/.test(l), says: 'a Button with cn-button classes and a plain action: Btn(variant, size, label, onClick) does it' },
  { re: /SearchField\b[^\n]*class\("cn-input/, says: 'a SearchField with cn-input classes: Input / GroupInput do it' },
  { re: /class\("cn-avatar[ "]/, says: 'a hand-made avatar: Avatar / AvatarImage do it' },
  { test: (l) => !/\bDeviceFrame\(/.test(l) && /class\("[^"]*\b(cx-phone-frame|cx-sphone[\w-]*|plt-phone|phone-frame|device-frame|iphone|bezel|notch)\b/.test(l), says: 'a phone frame of its own: DeviceFrame is the one phone of the library (island, href, shot, width)' },
  { re: /class\("[^"]*\b(cx-sk|cn-skeleton)(?=[\s"])/, says: 'a skeleton drawn by hand: Skeleton / Skeletons(kind) / Loading do it' },
];

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  if (e.name === 'node_modules' || e.name.startsWith('.')) return [];
  const full = path.join(dir, e.name);
  return e.isDirectory() ? walk(full) : e.name.endsWith('.muten') ? [full] : [];
});
const roots = process.argv.slice(2);
const files = roots.length ? roots.flatMap((r) => walk(path.resolve(r))) : fs.readdirSync(REG).filter((f) => f.endsWith('.muten') && !OWN[f]).map((f) => path.join(REG, f));

let total = 0;
for (const file of files.sort()) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.trim().startsWith('#')) return;
    for (const r of RULES) if (r.test ? r.test(line) : r.re.test(line)) { total++; console.log(`${path.relative(process.cwd(), file)}:${i + 1}  ${r.says}\n    ${line.trim().slice(0, 140)}`); }
  });
}
console.log(total ? `\n${total} place(s) to look at.` : 'Nothing re-drawn by hand.');
