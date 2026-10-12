// AssistantPlay (muten Custom) - the clock of the scene in assistant-play.muten. It only moves what the part drew:
// the typing bubble, the message, the new row, the counter, and the orb's mood (through `orb:mood`).
const clamp = (v) => Math.max(0, Math.min(1, v));
const outExpo = (v) => (v >= 1 ? 1 : 1 - Math.pow(2, -10 * v));
const win = (t, a, b, inDur, outDur) => outExpo(clamp((t - a) / inDur)) * (1 - clamp((t - b) / outDur));
const LOOP = 10;

export function mount(el) {
  const root = el.closest('.cx-ap');
  if (!root) return () => {};
  const $ = (s) => root.querySelector(s);
  const E = { typing: $('.cx-ap-typing'), said: $('.cx-ap-said'), row: $('.cx-ap-new'), flash: $('.cx-ap-flash'), ca: $('.cx-ap-count-a'), cb: $('.cx-ap-count-b'), orb: $('.cx-orb') };
  const dots = [...root.querySelectorAll('.cx-ap-dot')];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mood = '';
  const setMood = (happy, energy, look, bump) => {
    const key = `${happy}|${energy}|${look ? 1 : 0}`;
    if (key === mood && !bump) return; mood = key;
    E.orb && E.orb.dispatchEvent(new CustomEvent('orb:mood', { detail: { happy, energy, look, bump } }));
  };
  const paint = (t, T) => {
    const typing = win(t, 3.0, 4.35, 0.35, 0.15), said = win(t, 4.4, 8.6, 0.45, 0.35), row = win(t, 4.75, 8.9, 0.6, 0.45);
    const isHappy = t > 4.45 && t < 8.6;
    // while it works it looks at the day (top left); happy and bright when it is done
    setMood(isHappy ? 1 : 0, isHappy ? (t < 5.6 ? 1 : 0.35) : 0, t > 2.6 && t < 8.6 ? { x: -0.95, y: -0.55 } : null, t > 4.45 && t < 4.6);
    E.typing.style.setProperty('--k', typing.toFixed(3));
    dots.forEach((d, k) => { const b = Math.max(0, Math.sin(T * 7 - k * 0.7)); d.style.setProperty('--b', b.toFixed(3)); });
    E.said.style.setProperty('--k', said.toFixed(3));
    E.row.style.setProperty('--k', row.toFixed(3));
    E.flash.style.setProperty('--f', clamp(1 - Math.abs(t - 5.4) / 1.2).toFixed(3));
    const c = win(t, 4.85, 8.9, 0.4, 0.4); E.ca.style.setProperty('--k', (1 - c).toFixed(3)); E.cb.style.setProperty('--k', c.toFixed(3));
  };
  if (still) { requestAnimationFrame(() => paint(6, 0)); return () => {}; }
  let raf = 0, start = 0, visible = true;
  const frame = (now) => { if (!start) start = now; const T = (now - start) / 1000; paint(T % LOOP, T); raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0; };
  const wake = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };
  new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); wake(); }).observe(root);
  document.addEventListener('visibilitychange', wake);
  wake();
  return () => {};
}
