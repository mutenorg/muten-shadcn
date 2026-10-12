// Mascot (muten Custom) - the brand's mascot: an AssistantOrb that acts. Its gestures are hand-set keyframes (the
// principles of character animation: anticipation, squash and stretch that keeps the volume, arcs, overlap, a shadow
// that tells the height) and its face is worn on the sphere's surface (the orb's `orb:face`), so the eyes and the
// blush curve with the body and take its light. See mascot.muten.
const E = {
  lin: (u) => u,
  io: (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2),
  o: (u) => 1 - Math.pow(1 - u, 3),
  i: (u) => u * u * u,
  bk: (u) => { const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); },
};
// a track is [[time 0..1, value, easing into this key], …]
function at(keys, t, def) {
  if (!keys) return def;
  if (t <= keys[0][0]) return keys[0][1];
  for (let k = 1; k < keys.length; k++) {
    const a = keys[k - 1], b = keys[k];
    if (t <= b[0]) return a[1] + (b[1] - a[1]) * E[b[2] || 'io']((t - a[0]) / (b[0] - a[0] || 1));
  }
  return keys[keys.length - 1][1];
}

// THE GESTURES. d: seconds · energy: how fast the light inside flows · key: the pose shown with reduced motion ·
// hold: the stretch a held mood loops in (shy, thinking); a gesture without hold plays once and settles into idle.
const G = {
  idle: { d: 3.6, energy: 0.15, key: 0.2, loop: true, t: {
    sy: [[0, 1], [.25, 1.025], [.5, 1], [.75, 1.025], [1, 1]],
    lookX: [[0, -.8], [.3, -.8], [.33, .55, 'o'], [.62, .55], [.65, -.8, 'o'], [1, -.8]],
    lookY: [[0, 0], [.33, -.1, 'o'], [.62, -.1], [.65, 0, 'o'], [1, 0]],
    x: [[0, -1.5], [.34, -1.5], [.42, 1.8], [.65, 1.8], [.73, -1.5], [1, -1.5]],
    open: [[0, 1], [.46, 1], [.485, .05, 'i'], [.52, 1, 'o'], [.86, 1], [.875, .05, 'i'], [.9, 1, 'o'], [1, 1]] } },
  happy: { d: 2.4, energy: 0.6, key: 0.45, t: {
    y: [[0, 0], [.12, 4], [.32, -24, 'o'], [.48, -26], [.66, 0, 'i'], [.77, -5, 'o'], [.87, 0, 'i'], [1, 0]],
    sy: [[0, 1], [.12, .88], [.22, 1.12, 'o'], [.42, 1.02], [.64, 1.06, 'i'], [.69, .86, 'o'], [.79, 1.04], [.9, .98], [1, 1]],
    open: [[0, 1], [.11, 1], [.15, .1, 'i'], [.86, .1], [.92, 1, 'o'], [1, 1]],
    smile: [[0, 0], [.14, 0], [.17, 1, 'o'], [.85, 1], [.88, 0, 'i'], [1, 0]],
    cheek: [[0, 0], [.18, 0], [.3, .9, 'o'], [.84, .9], [1, 0]],
    spark: [[0, 0], [.3, 0], [.42, 1, 'bk'], [.62, 0, 'i'], [1, 0]] } },
  shy: { d: 3.4, energy: 0.2, key: 0.55, hold: [.3, .86], t: {
    lookX: [[0, 0], [.1, -.6, 'o'], [.9, -.6], [1, 0]], lookY: [[0, 0], [.1, .7, 'o'], [.9, .7], [1, 0]],
    open: [[0, 1], [.18, 1], [.25, .08, 'i'], [.9, .08], [1, 1]],
    shy: [[0, 0], [.23, 0], [.27, 1, 'o'], [.88, 1], [.92, 0, 'i'], [1, 0]],
    cheek: [[0, 0], [.22, 0], [.42, 1], [.6, .78], [.76, 1], [.9, 1], [1, 0]],
    rot: [[0, 0], [.25, -8], [.55, -5], [.8, -8], [1, 0]],
    y: [[0, 0], [.25, 6], [.9, 6], [1, 0]],
    s: [[0, 1], [.25, .93], [.9, .93], [1, 1]] } },
  surprised: { d: 2.4, energy: 1, key: 0.24, t: {
    y: [[0, 0], [.1, 4], [.2, -18, 'o'], [.36, -13], [.56, 0], [1, 0]],
    sy: [[0, 1], [.1, .92], [.2, 1.17, 'o'], [.3, .95], [.4, 1.05], [.5, .99], [.6, 1], [1, 1]],
    grow: [[0, 0], [.12, 0], [.2, 1, 'bk'], [.7, 1], [.84, 0], [1, 0]],
    open: [[0, 1], [.1, .55, 'i'], [.18, 1, 'o'], [.72, 1], [.745, .05, 'i'], [.78, 1, 'o'], [1, 1]],
    lookY: [[0, 0], [.2, -.35, 'o'], [.7, -.35], [.85, 0], [1, 0]],
    pop: [[0, 0], [.17, 0], [.24, 1, 'o'], [.46, 0, 'i'], [1, 0]] } },
  thinking: { d: 3.8, energy: 0.05, key: 0.5, hold: [.2, .84], t: {
    lookX: [[0, 0], [.12, .7], [.9, .7], [1, 0]], lookY: [[0, 0], [.12, -.85], [.9, -.85], [1, 0]],
    rBot: [[0, 0], [.16, .42], [.86, .42], [1, 0]], lBot: [[0, 0], [.16, .16], [.86, .16], [1, 0]],
    rot: [[0, 0], [.2, 7], [.5, 4.5], [.8, 7], [1, 0]],
    x: [[0, 0], [.2, 3], [.8, 3], [1, 0]],
    dots: [[0, 0], [.16, 0], [.72, 1, 'lin'], [.9, 1], [.97, 0], [1, 0]] } },
  wink: { d: 2.2, energy: 0.4, key: 0.45, t: {
    rOpen: [[0, 1], [.18, 1], [.23, .08, 'i'], [.7, .08], [.78, 1, 'o'], [1, 1]],
    rSmile: [[0, 0], [.22, 0], [.25, 1, 'o'], [.7, 1], [.73, 0, 'i'], [1, 0]],
    rot: [[0, 0], [.15, -3], [.27, 8, 'bk'], [.7, 8], [.86, 0], [1, 0]],
    sy: [[0, 1], [.16, .95], [.27, 1.04, 'o'], [.4, 1], [1, 1]],
    rCheek: [[0, 0], [.25, 0], [.32, .9, 'o'], [.72, .9], [.86, 0], [1, 0]],
    wspark: [[0, 0], [.25, 0], [.33, 1, 'bk'], [.56, 0, 'i'], [1, 0]],
    lookX: [[0, 0], [.2, .25], [.8, .25], [1, 0]] } },
  celebrate: { d: 2.6, energy: 1, key: 0.5, t: {
    y: [[0, 0], [.14, 8], [.42, -60, 'o'], [.5, -62], [.7, 0, 'i'], [.78, -7, 'o'], [.86, 0, 'i'], [1, 0]],
    sy: [[0, 1], [.14, .8], [.24, 1.2, 'o'], [.4, 1], [.66, 1.12, 'i'], [.71, .8, 'o'], [.8, 1.05], [.9, .98], [1, 1]],
    rot: [[0, 0], [.16, 0], [.44, 360, 'o'], [1, 360]],
    open: [[0, 1], [.1, 1], [.14, .1, 'i'], [.9, .1], [.95, 1, 'o'], [1, 1]],
    smile: [[0, 0], [.13, 0], [.16, 1, 'o'], [.9, 1], [.93, 0, 'i'], [1, 0]],
    cheek: [[0, 0], [.2, 1], [.9, 1], [1, 0]],
    burst: [[0, 0], [.4, 0], [.5, 1, 'o'], [.78, 0, 'i'], [1, 0]] } },
  oops: { d: 3.0, energy: 0.05, key: 0.5, t: {
    lLid: [[0, 0], [.15, .34], [.85, .34], [1, 0]], rLid: [[0, 0], [.15, .34], [.85, .34], [1, 0]], droop: [[0, 0], [.15, 9], [.85, 9], [1, 0]],
    lookY: [[0, 0], [.15, .6], [.85, .6], [1, 0]],
    y: [[0, 0], [.15, 6], [.85, 6], [1, 0]],
    sy: [[0, 1], [.15, .94], [.85, .94], [1, 1]],
    x: [[0, 0], [.3, 0], [.36, -6], [.42, 5], [.48, -3.5], [.54, 2], [.6, 0], [1, 0]],
    drop: [[0, 0], [.2, 0], [.3, 1, 'o'], [.8, 1], [.9, 0], [1, 0]],
    dropY: [[0, 0], [.3, 0], [.85, 1], [1, 1]] } },
};

// THE FACE, painted in a 220-unit box centred on the sphere (radius 72.6 of them). The eyes change shape only through
// a blink (the expression swap of animation): a capsule, a soft happy dome, a calm closed curve; the lids are cuts,
// the top one droops toward each eye's OUTER corner when sad (mirrored), the lower one rises in a squint.
const EX = 22, EY = -6, W = 17, H = 30;
function paintEye(ctx, cx, o) {
  const w = W * (1 + 0.2 * o.grow), h = H * (1 + 0.32 * o.grow), x = cx, y = EY;
  const cap = Math.max(0, 1 - o.smile - o.shy);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineCap = 'round';
  if (cap > 0.01) {
    const hh = Math.max(3, h * o.open), top = y - hh / 2, bot = y + hh / 2;
    const tl = top + hh * o.lid, bl = bot - hh * o.bot, outer = cx < 0 ? -1 : 1;
    ctx.save(); ctx.globalAlpha = cap;
    ctx.beginPath(); ctx.moveTo(x - w, tl + (outer < 0 ? o.droop : 0)); ctx.lineTo(x + w, tl + (outer > 0 ? o.droop : 0)); ctx.lineTo(x + w, bl); ctx.lineTo(x - w, bl); ctx.closePath(); ctx.clip();
    ctx.beginPath(); ctx.roundRect(x - w / 2, top, w, hh, Math.min(w / 2, hh / 2)); ctx.fill();
    ctx.restore();
  }
  if (o.smile > 0.01) { ctx.save(); ctx.globalAlpha = o.smile; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - w * .66, y + 4); ctx.bezierCurveTo(x - w * .5, y - 6.5, x + w * .5, y - 6.5, x + w * .66, y + 4); ctx.stroke(); ctx.restore(); }
  if (o.shy > 0.01) { ctx.save(); ctx.globalAlpha = o.shy; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - w * .62, y - 1); ctx.quadraticCurveTo(x, y + 10, x + w * .62, y - 1); ctx.stroke(); ctx.restore(); }
}

// the effects around it (they follow the body but never squash with it)
const star = (cx, cy, r, a) => `<path d="M${cx} ${cy - r} Q${cx + r * .18} ${cy - r * .18} ${cx + r} ${cy} Q${cx + r * .18} ${cy + r * .18} ${cx} ${cy + r} Q${cx - r * .18} ${cy + r * .18} ${cx - r} ${cy} Q${cx - r * .18} ${cy - r * .18} ${cx} ${cy - r}Z" fill="#fff" opacity="${a.toFixed(3)}"/>`;
function effects(p) {
  let fx = '';
  if (p.spark > 0.01) fx += star(62, -58, 10 * p.spark, p.spark) + star(-66, -44, 6 * p.spark, p.spark * .8);
  if (p.wspark > 0.01) fx += star(48, -34, 9 * p.wspark, p.wspark);
  if (p.pop > 0.01) for (let k = 0; k < 5; k++) { const a = (-150 + k * 30) * Math.PI / 180, r1 = 84 + 10 * p.pop, r2 = r1 + 14 * p.pop; fx += `<path d="M${(Math.cos(a) * r1).toFixed(1)} ${(Math.sin(a) * r1 - 4).toFixed(1)} L${(Math.cos(a) * r2).toFixed(1)} ${(Math.sin(a) * r2 - 4).toFixed(1)}" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="${p.pop.toFixed(3)}"/>`; }
  if (p.dots > 0.01) [[58, -62, 4.5, .2], [72, -80, 6, .5], [90, -100, 8.5, .8]].forEach(([dx, dy, r, th]) => { const a = Math.min(1, Math.max(0, (p.dots - th) / .2)); if (a > 0) fx += `<circle cx="${dx}" cy="${(dy - 3 * a).toFixed(1)}" r="${(r * (0.6 + 0.4 * a)).toFixed(2)}" fill="#fff" opacity="${(a * .92).toFixed(3)}"/>`; });
  if (p.burst > 0.01) for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + .3, r = 70 + 46 * p.burst; fx += star(+(Math.cos(a) * r).toFixed(1), +(Math.sin(a) * r).toFixed(1), (k % 2 ? 6 : 9) * (1 - p.burst * .4), Math.min(1, p.burst * 1.6) * (1 - p.burst * .5)); }
  if (p.drop > 0.01) { const dy = -26 + 34 * p.dropY, dx = 62 - 4 * p.dropY; fx += `<path d="M${dx} ${dy - 11} Q${dx + 7} ${dy - 1} ${dx + 6} ${dy + 4} A6 6 0 1 1 ${dx - 6} ${dy + 4} Q${dx - 7} ${dy - 1} ${dx} ${dy - 11}Z" fill="#BFE6FF" opacity="${(p.drop * .95).toFixed(3)}"/>`; }
  return fx;
}

function pose(g, t, flip) {
  const v = (k, d) => at(g.t[k], t, d);
  const open = v('open', 1), smile = v('smile', 0), lookX = v('lookX', 0) * flip, lookY = v('lookY', 0), grow = v('grow', 0), shy = v('shy', 0);
  const eye = (side) => ({ open: v(side + 'Open', open), smile: v(side + 'Smile', smile), shy, lid: v(side + 'Lid', 0), bot: v(side + 'Bot', 0), droop: v('droop', 0), grow });
  return {
    x: v('x', 0) * flip, y: v('y', 0), rot: v('rot', 0) * flip, sy: v('sy', 1), s: v('s', 1), lookX, lookY,
    L: eye('l'), R: eye('r'), cheekL: v('cheek', 0), cheekR: Math.max(v('cheek', 0), v('rCheek', 0)),
    spark: v('spark', 0), wspark: v('wspark', 0), pop: v('pop', 0), dots: v('dots', 0), burst: v('burst', 0), drop: v('drop', 0), dropY: v('dropY', 0),
  };
}


// ── HOW IT SPEAKS. A line is a «paper» bubble (white, its name on top in violet, a drawn tail) that comes out of its
// side as in a comic: the tail's tip lands on the sphere's upper-left rim and the bubble sits up and to its left. It
// pops in like in games: laid out complete, born at the tail's tip, inflated past its size, springing back, settling;
// a new line first swells a hair and sucks back into the tail. It lives OUTSIDE the scaled box (so its text is never
// shrunk with the sphere), follows the body when it jumps and stays inside the panel that clips it. With `voice` on,
// a soft blip per syllable follows the sentence's tune (it only sounds after the person has touched the page).
const POP_IN = [
  { transform: 'scale(.06, .04)', opacity: 0, offset: 0 },
  { transform: 'scale(1.16, .88)', opacity: 1, offset: .34 },
  { transform: 'scale(.9, 1.1)', offset: .52 },
  { transform: 'scale(1.05, .96)', offset: .68 },
  { transform: 'scale(.98, 1.02)', offset: .84 },
  { transform: 'scale(1, 1)', opacity: 1, offset: 1 },
];
const POP_OUT = [{ transform: 'scale(1, 1)', opacity: 1, offset: 0 }, { transform: 'scale(1.06, 1.06)', opacity: 1, offset: .3 }, { transform: 'scale(.05, .05)', opacity: 0, offset: 1 }];
const TAIL = '<svg class="cx-mascot-tail" viewBox="0 0 24 16" aria-hidden="true"><path d="M0 0 H20 C18.5 5 19.5 10 23 15.5 C15 13.5 7 8 0 0 Z"/></svg>';
// the same tail turned on its side, for a bubble that sits beside the sphere (it leaves the bubble's edge, toward it)
const TAIL_SIDE = '<svg class="cx-mascot-tail-side" viewBox="0 0 16 24" aria-hidden="true"><path d="M0 0 V20 C5 18.5 10 19.5 15.5 23 C13.5 15 8 7 0 0 Z"/></svg>';
const VOWEL = { a: 1.12, e: 1.06, i: 1.0, o: 0.96, u: 0.92, á: 1.14, é: 1.08, í: 1.02, ó: 0.98, ú: 0.94 };
let audio = null, touched = false;
if (typeof document !== 'undefined') document.addEventListener('pointerdown', () => { touched = true; }, { once: true, capture: true });
function ctx() {
  if (!touched) return null;
  try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); } catch (_) { audio = null; }
  return audio;
}
function blip(ac, freq, when, len, vol) {
  const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), g2 = ac.createGain(), f = ac.createBiquadFilter();
  o.type = 'triangle'; o2.type = 'sine'; f.type = 'lowpass'; f.frequency.value = 2400; g2.gain.value = 0.25;
  o.frequency.setValueAtTime(freq, when); o.frequency.exponentialRampToValueAtTime(freq * 0.92, when + len); o2.frequency.setValueAtTime(freq * 2, when);
  g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(vol, when + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, when + len);
  o.connect(g); o2.connect(g2); g2.connect(g); g.connect(f); f.connect(ac.destination);
  o.start(when); o2.start(when); o.stop(when + len + 0.02); o2.stop(when + len + 0.02);
}
function speakAloud(text) {
  const ac = ctx(); if (!ac) return;
  const t0 = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();   // the pop
  o.type = 'sine'; o.frequency.setValueAtTime(520, t0); o.frequency.exponentialRampToValueAtTime(980, t0 + 0.07);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.06, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);
  o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + 0.1);
  const question = /\?\s*$/.test(text), excl = /^¡/.test(text);
  let at = t0 + 0.08, syll = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], v = VOWEL[ch.toLowerCase()];
    if (v) {
      const pos = i / text.length;
      let pitch = 300 * v * (excl && pos < .2 ? 1.18 : 1);
      if (question && pos > .7) pitch *= 1 + (pos - .7) * 1.1; else if (!question && pos > .75) pitch *= 1 - (pos - .75) * .5;
      blip(ac, pitch * (1 + Math.sin(syll++ * 1.7) * 0.05), at, 0.07, 0.05);
    }
    at += ',;'.includes(ch) ? 0.17 : '.!?…'.includes(ch) ? 0.3 : 0.034;
  }
}
const clipOf = (el) => { for (let n = el.parentElement; n; n = n.parentElement) { const o = getComputedStyle(n).overflow; if (o !== 'visible') return n; } return document.documentElement; };

export function mount(el, inputs) {
  const root = el.closest('.cx-mascot');
  if (!root) return () => {};
  const orb = root.querySelector('.cx-orb'), rig = root.querySelector('.cx-mascot-rig'), squash = root.querySelector('.cx-mascot-squash'), floor = root.querySelector('.cx-mascot-floor');
  const NS = 'http://www.w3.org/2000/svg', fxSvg = document.createElementNS(NS, 'svg');
  fxSvg.setAttribute('class', 'cx-mascot-fx'); fxSvg.setAttribute('viewBox', '-110 -110 220 220'); fxSvg.setAttribute('aria-hidden', 'true');
  root.append(fxSvg);
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let flip = inputs.look === 'right' ? -1 : 1;   // the gestures are drawn looking left (toward a form beside it)
  // its bubble: outside the scaled box, in the positioned box that holds it
  const host = root.offsetParent || root.parentElement, bub = document.createElement('div');
  bub.className = 'cx-mascot-say'; bub.setAttribute('role', 'status'); bub.setAttribute('aria-live', 'polite');
  bub.innerHTML = `<span class="cx-mascot-who"></span><span class="cx-mascot-line"></span>${TAIL}${TAIL_SIDE}`;
  host.append(bub);
  let saying = '', sayT = 0, sayN = 0, voiceOn = inputs.voice === 'on';
  const placeBubble = () => {
    if (!root.isConnected) { bub.remove(); removeEventListener('resize', placeBubble); return; }
    if (!bub.classList.contains('on')) return;
    const hb = host.getBoundingClientRect(), o = orb.getBoundingClientRect(), clip = clipOf(host).getBoundingClientRect();
    const R = o.width * 0.33, cx = o.left + o.width / 2, cy = o.top + o.height / 2, w = bub.offsetWidth, h = bub.offsetHeight;
    const k = hb.width / (host.offsetWidth || hb.width) || 1;   // the host may be scaled: place in its own units
    // where it speaks from, set by the page's CSS per screen: `side` (default) up and to the side, the tail's tip on the
    // sphere's upper rim; `low` level with it, beside it, the tail on its side (when there is no room above it)
    const at = getComputedStyle(root).getPropertyValue('--cx-mascot-say').trim(), low = at === 'low', top0 = at === 'top';
    bub.dataset.side = flip > 0 ? 'left' : 'right'; bub.dataset.at = low ? 'low' : 'side';
    let left, top, ox, oy;
    if (low) {
      const tipX = cx - R * 0.97 * flip, tipY = cy + R * 0.32, tail = Math.max(12, Math.min(h - 30, h * 0.42));
      left = flip > 0 ? tipX - 15.5 - w : tipX + 15.5;
      top = tipY - 23 - tail;
      bub.style.setProperty('--tail', tail + 'px');
      ox = flip > 0 ? w + 15.5 : -15.5; oy = tail + 23;
    } else {
      // `top`: right over its head, the tail dropping onto the crown; `side`: up and out of its shoulder
      const tipX = cx - R * (top0 ? 0.12 : 0.66) * flip, tipY = cy - R * (top0 ? 1.02 : 0.74);
      left = top0 ? (flip > 0 ? tipX - 23 - w * 0.55 : tipX - w * 0.45) : (flip > 0 ? tipX - w + 44 : tipX - 44);
      left = Math.max(clip.left + 12, Math.min(clip.right - w - 12, left));
      const tail = Math.max(14, Math.min(w - 30, flip > 0 ? tipX - left - 23 : tipX - left - 1));
      top = tipY - h - 14;
      bub.style.setProperty('--tail', tail + 'px');
      ox = tail + (flip > 0 ? 23 : 1); oy = h + 15;
    }
    bub.style.left = (left - hb.left) / k + 'px'; bub.style.top = (top - hb.top) / k + 'px';
    bub.style.transformOrigin = `${ox}px ${oy}px`;
  };
  const anim = (frames, ms, ease) => bub.animate(still ? [{ opacity: frames === POP_IN ? 0 : 1 }, { opacity: frames === POP_IN ? 1 : 0 }] : frames, { duration: still ? 150 : ms, easing: ease, fill: 'both' }).finished.catch(() => {});
  async function say(text, name) {
    const n = ++sayN;
    if (bub.classList.contains('on')) { await anim(POP_OUT, 200, 'cubic-bezier(.5,0,.75,0)'); if (n !== sayN) return; bub.classList.remove('on'); }
    if (!text) return;
    bub.querySelector('.cx-mascot-who').textContent = name || '';
    bub.querySelector('.cx-mascot-line').textContent = text;
    bub.getAnimations().forEach((x) => x.cancel()); bub.classList.add('on'); placeBubble();
    orb.dispatchEvent(new CustomEvent('orb:mood', { detail: { bump: true } }));
    if (voiceOn) speakAloud(text);
    await anim(POP_IN, 560, 'cubic-bezier(.2,.7,.3,1)');
  }
  // a line that changes while the person types waits for a pause, so the bubble doesn't pop on every key
  const queueSay = (text, name, now) => { if (text === saying) return; clearTimeout(sayT); saying = text; sayT = setTimeout(() => say(text, name), now ? 0 : 450); };
  queueSay(inputs.say || '', inputs.name || '', true);
  addEventListener('resize', placeBubble);
  let name = G[inputs.mood] ? inputs.mood : 'idle', g = G[name], start = performance.now();
  const k = () => (orb.getBoundingClientRect().width || 220) / 220;   // px per face unit

  function draw(p) {
    const u = k(), sx = Math.pow(p.sy, -0.9) * p.s, sy = p.sy * p.s;
    rig.style.transform = `translate(${(p.x * u).toFixed(2)}px, ${(p.y * u).toFixed(2)}px) rotate(${p.rot.toFixed(2)}deg)`;
    squash.style.transform = `scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
    const lift = Math.max(0, -p.y), f = Math.max(0.45, 1 - lift / 110);
    floor.style.transform = `translateX(${(p.x * u * 0.6).toFixed(2)}px) scale(${f.toFixed(3)}, ${(f * 0.9).toFixed(3)})`;
    floor.style.opacity = (0.35 + 0.65 * f).toFixed(3);
    fxSvg.style.transform = `translate(${(p.x * u).toFixed(2)}px, ${(p.y * u).toFixed(2)}px)`;
    placeBubble();   // its bubble rides along when it jumps
    fxSvg.innerHTML = effects(p);
    orb.dispatchEvent(new CustomEvent('orb:face', { detail: { paint: (ctx) => { paintEye(ctx, -EX, p.L); paintEye(ctx, EX, p.R); }, blush: [p.cheekL, p.cheekR], turn: [p.lookX * 0.16, -p.lookY * 0.14] } }));
  }
  function play(next) {
    name = G[next] ? next : 'idle'; g = G[name]; start = performance.now();
    orb.dispatchEvent(new CustomEvent('orb:mood', { detail: { energy: g.energy, bump: name !== 'idle' && !g.hold } }));
    if (still) draw(pose(g, g.key, flip));
  }
  play(name);

  // the clock: a one-shot gesture plays once and settles into idle; a held one loops its middle; idle loops whole
  let raf = 0, visible = true;
  const frame = (now) => {
    let t = (now - start) / 1000 / g.d;
    if (g.hold && t > g.hold[0]) t = g.hold[0] + ((t - g.hold[0]) % (g.hold[1] - g.hold[0]));
    else if (g.loop) t %= 1;
    else if (t >= 1) { name = 'idle'; g = G.idle; start = now; t = 0; orb.dispatchEvent(new CustomEvent('orb:mood', { detail: { energy: g.energy } })); }
    draw(pose(g, t, flip));
    raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
  };
  const wake = () => { if (!still && !raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };
  new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); wake(); }).observe(root);
  document.addEventListener('visibilitychange', wake);
  wake();
  return (next) => {
    if (next.look !== undefined) flip = next.look === 'right' ? -1 : 1;
    if (next.voice !== undefined) voiceOn = next.voice === 'on';
    if (next.say !== undefined || next.name !== undefined) queueSay(next.say ?? inputs.say ?? '', next.name ?? inputs.name ?? '');
    if (next.say !== undefined) inputs.say = next.say;
    if (next.name !== undefined) inputs.name = next.name;
    if (next.mood !== undefined && next.mood !== inputs.mood) { inputs.mood = next.mood; play(next.mood); wake(); }
  };
}
