// Code block host (muten Custom). inputs: { code, lang }. Highlights with the muten grammar via the shared
// highlight.js (lazy-loaded, so the token rules live in one place). See code.muten.
export function mount(el, inputs) {
  const code = String(inputs.code == null ? "" : inputs.code);
  const lang = inputs.lang == null ? "muten" : String(inputs.lang);
  el.className = "rounded-lg border bg-muted/40 px-4 py-3 font-mono text-foreground overflow-x-auto";
  const pre = document.createElement("pre");
  pre.className = "m-0 text-sm leading-relaxed";
  pre.textContent = code;                                  // plain until the highlighter loads (progressive)
  el.appendChild(pre);
  import("@muten/shadcn/registry/highlight.js")
    .then((m) => { pre.innerHTML = m.highlight(code, lang); })
    .catch(() => { /* keep the plain text */ });
}
