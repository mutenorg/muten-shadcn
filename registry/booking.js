// Booking (muten Custom) - the kit's booking picker (kit/structure.js): week strip and hours in one piece.
// inputs: week [{days, hours}], taken [{day, hours}], wait, cta, demo; handler select("yyyy-mm-dd HH:MM").
// demo "on" plays it by itself (a day, then an hour, in turn) until the first touch; it never presses the button.
export function mount(el, inputs, on) {
  let timer = 0, stopped = false;
  Promise.all([import('@muten/shadcn/registry/kit/core.js'), import('@muten/shadcn/registry/kit/structure.js')]).then(([core, s]) => {
    s.booking(el, inputs, core, on);
    if (inputs.demo !== 'on' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let turn = 0;
    const open = (sel) => [...el.querySelectorAll(sel)].filter((b) => !b.disabled && !b.hasAttribute('data-full'));
    const pick = (sel) => { const all = open(sel); return all.length ? all[turn % all.length] : null; };
    const play = () => {
      if (stopped) return;
      pick('.cx-day')?.click();
      timer = setTimeout(() => { if (stopped) return; pick('.cx-hour')?.click(); turn++; timer = setTimeout(play, 2600); }, 1500);
    };
    el.addEventListener('pointerdown', () => { stopped = true; clearTimeout(timer); }, { once: true, capture: true });
    timer = setTimeout(play, 900);
  });
  return () => {};
}
