// CountUp - a muten Custom: a formatted number whose digits ROLL to their value (each digit is a 0-9 column that
// slides, the kit's --t-move rhythm; only the digits that change move). inputs: { to, roll }
//   to    the display string, kept EXACTLY ("$4.906.000", "2.4M", "94%", "12,400", "40ms")
//   roll  "view"   (default) rolls up from zeros the first time it scrolls into view - for a landing
//         "change" stands still on the first paint and rolls each time `to` changes - for a stat on a dashboard
// When `to` changes later (in either mode) it rolls from the old value to the new one. Screen readers get the plain
// text; the columns are aria-hidden. Under prefers-reduced-motion the kit's tokens make the roll instant.
export function mount(el, inputs) {
  const isDigit = (ch) => ch >= '0' && ch <= '9';
  const reader = document.createElement('span'); reader.className = 'cx-roll-sr';
  const face = document.createElement('span'); face.className = 'cx-roll'; face.setAttribute('aria-hidden', 'true');
  el.replaceChildren(reader, face);
  let shown = '';

  const column = () => { const d = document.createElement('span'); d.className = 'cx-roll-d'; const s = document.createElement('span'); s.innerHTML = '<em>0</em><em>1</em><em>2</em><em>3</em><em>4</em><em>5</em><em>6</em><em>7</em><em>8</em><em>9</em>'; d.appendChild(s); return d; };
  const glyph = (ch) => { const g = document.createElement('span'); g.className = 'cx-roll-s'; g.textContent = ch; return g; };
  const setDigit = (d, n, animate) => { const s = d.firstChild; if (!animate) { s.style.transition = 'none'; s.style.translate = `0 -${n}em`; void s.offsetHeight; s.style.transition = ''; } else s.style.translate = `0 -${n}em`; };

  // same shape (same length, digits and signs in the same places): reuse the columns so each digit rolls from where
  // it is; another shape: rebuild, the digits starting from 0 when animating (or from their value when not)
  const paint = (text, animate) => {
    reader.textContent = text;
    const same = shown.length === text.length && [...text].every((ch, k) => isDigit(ch) === isDigit(shown[k]) && (isDigit(ch) || ch === shown[k]));
    if (!same) { face.replaceChildren(...[...text].map((ch) => (isDigit(ch) ? column() : glyph(ch)))); [...face.children].forEach((c, k) => { if (isDigit(text[k])) setDigit(c, animate ? 0 : +text[k], false); }); }
    if (animate) requestAnimationFrame(() => requestAnimationFrame(() => [...face.children].forEach((c, k) => { if (isDigit(text[k])) setDigit(c, +text[k], true); })));
    else [...face.children].forEach((c, k) => { if (isDigit(text[k])) setDigit(c, +text[k], false); });
    shown = text;
  };

  const first = String(inputs?.to ?? '0');
  if (inputs?.roll === 'change' || !('IntersectionObserver' in window)) paint(first, false);
  else {
    paint(first.replace(/\d/g, '0'), false); reader.textContent = first;
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { io.disconnect(); paint(first, true); } }, { threshold: 0.5 });
    io.observe(el);
  }
  return (next) => { const t = String(next?.to ?? '0'); if (t !== shown) paint(t, true); };
}
