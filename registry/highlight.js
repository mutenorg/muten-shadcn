// A muten-aware syntax highlighter for the browser - the same token classes the muten VS Code grammar uses
// (keywords, primitives, types, modifiers, methods, components, strings, params, refs, numbers, operators,
// comments). `highlight(code, lang)` returns HTML with .tk-* spans; the colors live in globals.css so they
// follow the theme. Non-muten languages are returned escaped (no highlight). Shared by the Code Custom + docs.
const KEYWORDS = "screen entity state store const theme get effect action mutates mock sources api meta routes shell guard else part param query every live persist post put delete body into if when each as where by with and or not contains use from".split(" ");
const PRIMITIVES = "Stack Header Nav Sidebar Footer Page Section Article List Details Text Title Span Image Icon Video SearchField DataTable RowAction Button Form Link slot When Each Custom".split(" ");
const MODIFIERS = "bind submit where columns class alt inputs on aria style".split(" ");
const METHODS = "push remove patch reset toggle set create update delete refetch".split(" ");
const TYPES = "text email string number bool uuid list".split(" ");

const grp = (a) => "(?:" + a.join("|") + ")";
// Ordered like the grammar: first match wins, specific before generic. Each: [regex source, token class].
const RULES = [
  ["#[^\\n]*", "comment"],
  ['"(?:[^"\\\\]|\\\\.)*"', "string"],
  ["\\$[A-Za-z_]\\w*", "variable"],
  ["@[A-Za-z_]\\w*", "variable"],
  ["\\b" + grp(KEYWORDS) + "\\b", "keyword"],
  ["\\b(?:true|false)\\b", "constant"],
  ["\\b" + grp(TYPES) + "\\b", "type"],
  ["\\b" + grp(PRIMITIVES) + "\\b", "primitive"],
  ["\\b" + grp(MODIFIERS) + "\\b", "modifier"],
  ["\\." + grp(METHODS) + "\\b", "method"],
  ["\\b[A-Z][A-Za-z0-9_]*\\b", "component"],
  ["-?\\b\\d+(?:\\.\\d+)?\\b", "number"],
  ["->|<-|==|!=|<=|>=|[-+*/<>=|?]", "operator"],
];
const MASTER = new RegExp(RULES.map((r) => "(" + r[0] + ")").join("|"), "g");
const CLASSES = RULES.map((r) => r[1]);

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function highlight(code, lang) {
  const src = String(code == null ? "" : code);
  if (lang && lang !== "muten" && lang !== "store") return esc(src);
  let out = "", last = 0, m;
  MASTER.lastIndex = 0;
  while ((m = MASTER.exec(src))) {
    if (m.index > last) out += esc(src.slice(last, m.index));
    let cls = "variable";
    for (let i = 1; i < m.length; i++) { if (m[i] !== undefined) { cls = CLASSES[i - 1]; break; } }
    out += '<span class="tk-' + cls + '">' + esc(m[0]) + "</span>";
    last = m.index + m[0].length;
  }
  if (last < src.length) out += esc(src.slice(last));
  return out;
}
