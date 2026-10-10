// ScreenTour (muten Custom) - steps beside a phone that plays them on real captures (see screen-tour.muten).
const SCROLL_MS = 1800;
export function mount(el, inputs) {
  if (typeof window === 'undefined') return undefined;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  let tracks = [], track = 0, index = 0, timer = 0, manual = false, live = false, label = '', width = '300px';
  const paint = () => {
    const t = tracks[track] || { steps: [] };
    const shots = [...new Set(t.steps.map((s) => s.shot).filter(Boolean))];
    const d = t.done || null;
    el.style.setProperty('--tour-w', width);
    el.innerHTML = `${tracks.length > 1 ? `<div class="cx-tabs cx-tour-tabs" data-fill="phone" role="tablist" aria-label="${esc(label)}">${tracks.map((x, i) => `<button type="button" role="tab" class="cn-button cn-button-variant-ghost cn-button-size-sm cx-tab" aria-selected="${i === track}" data-track="${i}">${esc(x.label)}</button>`).join('')}</div>` : ''}
<div class="cx-tour-body">
  <ol class="cx-stepper cx-stp cx-tour-steps" data-orientation="vertical" data-look="list" style="--n:${t.steps.length}">${t.steps.map((s, i) => `<li class="cx-step cx-stp-step" data-step="${i}"><button type="button" class="cx-tour-hit" aria-label="${i + 1}. ${esc(s.title)}"></button><div class="cn-progress cx-stp-bar"><div class="cn-progress-indicator"></div></div><div class="cx-stp-dot"><span class="cx-stp-num">${i + 1}</span><svg class="cx-stp-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><div class="cx-stp-text"><span class="cx-text cx-stp-label">${esc(s.title)}</span><div class="cx-tour-desc"><p class="cx-stp-desc">${esc(s.text)}</p></div></div></li>`).join('')}</ol>
  <div class="cx-device cx-tour-phone" data-kind="phone" data-sized="true" style="--w:${esc(width)}"><div class="cx-device-screen cx-tour-screen">${shots.map((src, i) => `<img src="${esc(src)}" alt="" data-shot="${esc(src)}" ${i === 0 ? 'data-long' : ''} loading="lazy" decoding="async">`).join('')}<span class="cx-tour-tap" aria-hidden="true"></span>${d ? `<div class="cx-tour-done"><div class="cx-tour-sheet"><span class="cx-tour-grab"></span><span class="cx-tour-ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><b class="cx-tour-dt">${esc(d.title)}</b><div class="cx-tour-rows">${(d.rows || []).map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>${d.code ? `<div class="cx-tour-pass"><span>${esc(d.codeLabel || '')}</span><b>${esc(d.code)}</b></div>` : ''}${d.note ? `<p class="cx-tour-note">${esc(d.note)}</p>` : ''}</div></div>` : ''}</div></div>
</div>`;
    el.setAttribute('aria-label', label);
  };
  const $ = (s) => el.querySelector(s);
  const show = (next) => {
    const t = tracks[track]; if (!t || !t.steps.length) return;
    index = next; const step = t.steps[index];
    el.querySelectorAll('.cx-tour-steps > li').forEach((li, i) => {
      li.dataset.state = i === index ? 'now' : i < index ? 'done' : '';
      li.style.setProperty('--dur', manual || still ? '0s' : (step.ms || 3200) / 1000 + 's');
      const hit = li.querySelector('.cx-tour-hit'); if (hit) { if (i === index) hit.setAttribute('aria-current', 'step'); else hit.removeAttribute('aria-current'); }
    });
    el.querySelectorAll('.cx-tour-screen > img').forEach((img) => { img.dataset.on = img.dataset.shot === step.shot ? '1' : ''; });
    const long = $('.cx-tour-screen > img[data-long]');
    if (long) {
      // the long first page scrolls down on its own; its fade stays the stylesheet's, so it never snaps
      if (step.scroll && !still) {
        long.style.transition = 'opacity 480ms cubic-bezier(.23,1,.32,1)'; long.style.transform = 'translateY(0)'; void long.offsetWidth;
        long.style.transition = `opacity 480ms cubic-bezier(.23,1,.32,1), transform ${SCROLL_MS}ms cubic-bezier(.65,0,.35,1) 500ms`;
        long.style.transform = `translateY(-${step.scroll}%)`;
      } else if (index === 0) { long.style.transition = ''; long.style.transform = 'translateY(0)'; }
      else long.style.transition = 'opacity 480ms cubic-bezier(.23,1,.32,1)';
    }
    const done = $('.cx-tour-done'); if (done) done.dataset.on = step.done ? '1' : '';
    const tap = $('.cx-tour-tap');
    if (tap) { tap.removeAttribute('data-go'); if (step.tap && !still && !manual) { tap.style.left = step.tap[0] + '%'; tap.style.top = step.tap[1] + '%'; tap.style.animationDelay = step.scroll ? SCROLL_MS + 700 + 'ms' : ''; void tap.offsetWidth; tap.setAttribute('data-go', ''); } }
    clearTimeout(timer);
    if (!manual && !still && live) timer = setTimeout(() => show((index + 1) % t.steps.length), step.ms || 3200);
  };
  const pick = (i) => { track = i; manual = false; paint(); show(0); };
  el.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-track]'); if (tab) { pick(+tab.dataset.track); return; }
    const li = e.target.closest('.cx-tour-steps > li'); if (li) { manual = true; show(+li.dataset.step); }
  });
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    const on = entries[0].isIntersecting;
    if (on && !live) { live = true; if (!manual) show(index); } else if (!on && live) { live = false; clearTimeout(timer); }
  }, { threshold: 0.45 }) : null;
  const set = (next) => { tracks = Array.isArray(next.tracks) ? next.tracks : []; label = next.label || ''; width = next.width || '300px'; if (track >= tracks.length) track = 0; paint(); show(index < ((tracks[track] || {}).steps || []).length ? index : 0); };
  set(inputs || {});
  if (io) io.observe(el); else { live = true; show(0); }
  return (next) => set(next || {});
}
