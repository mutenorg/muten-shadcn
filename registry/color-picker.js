// ColorPicker (muten Custom) - Storio's one colour picker (solid; gradients and animations when allowed), as the
// reference artifact mounts it. The value is paint text (a hex, or e.g. "linear 150 | #1a0f0a 0 | #c2410c 100 ~flow 14").
// THE APP'S ONE COLOUR PICKER. Every place where somebody picks a colour uses this component (through the
// ColorPick / PaintPick parts), so it looks and behaves the same everywhere and a fix lands everywhere.
//
// Closed it is a small swatch showing the real colour or gradient (plus a dot when it is animated). Open it
// is a popover (a bottom sheet on a phone) with:
//   · a hue × lightness map where every colour is a draggable point, and a SATURATION slider for the
//     selected point only (it is not opacity: the slider says which point it acts on);
//   · the hex code, an eyedropper where the browser has one, and a trash can to delete a gradient stop;
//   · OPTIONALLY, gradients: a bar of up to 4 stops (tap the bar to add one, drag a stop along it, drag it
//     off the bar / press Delete / use the trash can to remove it), linear · radial · conic with an angle
//     dial, and animations (flow, breathe, spin, hue) with a speed.
//
// Gradients are OPT-IN: not every colour in the app can be a gradient. `modes: "solid"` (the default) is a
// plain colour picker and only ever emits a hex; `modes: "solid gradient"` adds the gradient controls, and
// `anims: "flow breathe spin hue"` lists which animations that place allows (none by default).
//
// The value is text, read and written by lib/paint.ts: a plain hex is a solid colour, a gradient is e.g.
// "linear 150 | #1a0f0a 0 | #c2410c 100 ~flow 14". Hosts paint with paintCss() from that same lib.
//
// DRAG IS LOCAL, RELEASE COMMITS. While a point or stop is dragged only this popover repaints (and an
// optional `input` handler fires); `pick` fires on release, so a heavy preview (Design's whole page)
// repaints once, when you let go. Opening the picker also commits the value it shows, so a swatch that
// displays a default applies it on a plain click.
//
// The popover lives on <body> with fixed coordinates, so a scrolling or clipping panel never hides it, and
// it opens from anywhere in the swatch's row (the swatch and the hex label next to it).
export function mount(el, inputs, handlers) {
  const en = String((inputs && inputs.lang) || document.documentElement.lang || 'es') === 'en';
  const say = (es, english) => (en ? english : es);
  const modes = String((inputs && inputs.modes) || 'solid').split(/\s+/);
  const allowGradient = modes.includes('gradient');
  const allowedAnims = ['none', ...String((inputs && inputs.anims) || '').split(/\s+/).filter(Boolean)];

  const ICON = {
    linear: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 19 19 5M9 5h10v10"/></svg>',
    radial: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></svg>',
    conic: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><path d="M12 12V4M12 12l6 5"/></svg>',
    drop: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 22 1-1h3l9-9M3 21v-3l9-9M15 6l3-3 3 3-3 3M13 8l3 3"/></svg>',
    trash: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    play: '<svg width="8" height="8" viewBox="0 0 24 24" fill="#1c1c1e"><path d="M8 5v14l11-7z"/></svg>',
  };
  const TYPE_LABEL = { linear: say('Lineal', 'Linear'), radial: say('Radial', 'Radial'), conic: say('Cónico', 'Conic') };
  const PHONE = 560;
  const OFF_BAR = 38;
  const GREY = 6;
  const COLOURFUL = 75;
  const GRAB = 24;
  const GRAB_STOP = 18;

  el.classList.add('cp-host');
  const well = document.createElement('button');
  well.type = 'button';
  well.className = 'cp-well pk-well';
  well.setAttribute('aria-label', (inputs && inputs.label) || say('Elegir un color', 'Pick a colour'));
  el.appendChild(well);

  let lib = null;          // lib/paint.ts, loaded on mount (a Custom cannot import at the top)
  let pending = String((inputs && inputs.value) || '');
  let v = null;            // the paint being edited
  let sel = 0;             // the selected stop
  let pop = null;
  let scrim = null;

  const box = el.parentElement || el;
  const paintWell = () => {
    if (!lib || !v) return;
    const css = lib.paintCss(v);
    well.style.background = css.background;
    well.style.backgroundSize = css.backgroundSize;
    well.style.animation = css.animation;
    well.innerHTML = v.type !== 'solid' && v.anim !== 'none' ? `<span class="pk-dot">${ICON.play}</span>` : '';
  };
  const load = (text) => {
    let next = lib.parsePaint(text);
    if (next.type !== 'solid' && !allowGradient) next = lib.parsePaint(next.stops[0].c);
    v = next;
    sel = 0;
  };
  const emit = (kind) => {
    paintWell();
    const handler = handlers && handlers[kind];
    if (handler) handler(lib.printPaint(v));
  };

  // ── open / close / place ──
  const phone = () => window.innerWidth <= PHONE;
  // The side (below or above the swatch) is chosen ONCE, when it opens. After that the popover stays anchored
  // to that side while its content changes height (gradient on/off, an animation's speed row…): it grows away
  // from the swatch and scrolls inside, instead of jumping to re-fit the screen.
  function place() {
    if (!pop || phone()) return;
    const r = well.getBoundingClientRect();
    const margin = 8;
    const width = pop.offsetWidth;
    let left = Math.min(r.left, window.innerWidth - width - margin);
    if (left < margin) left = margin;
    pop.style.left = `${left}px`;
    if (!pop.dataset.side) {
      const below = window.innerHeight - r.bottom - 2 * margin;
      const above = r.top - 2 * margin;
      pop.dataset.side = below >= 300 || below >= above ? 'below' : 'above'; // below whenever it fits a usable map; it scrolls inside if it grows
    }
    if (pop.dataset.side === 'below') {
      const top = r.bottom + margin;
      pop.style.top = `${top}px`; pop.style.bottom = 'auto';
      pop.style.maxHeight = `${Math.max(160, window.innerHeight - top - margin)}px`;
    } else {
      pop.style.top = 'auto'; pop.style.bottom = `${window.innerHeight - r.top + margin}px`;
      pop.style.maxHeight = `${Math.max(160, r.top - 2 * margin)}px`;
    }
  }
  function open() {
    if (!lib || pop) return;
    scrim = document.createElement('div');
    scrim.className = 'pk-scrim';
    scrim.addEventListener('pointerdown', close);
    pop = document.createElement('div');
    pop.className = 'pk-pop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', (inputs && inputs.label) || say('Color', 'Colour'));
    pop.addEventListener('click', onClick);
    pop.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
    (document.getElementById('lib') || document.body).append(scrim, pop); // inside the skinned area, so it wears the skin's tokens
    render();
    place();
    emit('pick');
  }
  function close() {
    if (!pop) return;
    pop.remove();
    scrim.remove();
    pop = null;
    scrim = null;
  }
  box.addEventListener('click', (event) => {
    if (pop && pop.contains(event.target)) return;
    if (pop) close(); else open();
  });
  window.addEventListener('scroll', () => place(), true);
  window.addEventListener('resize', () => { place(); if (pop) drawMap(); });

  // ── the popover ──
  // Lightness 95 (top) to 5 (bottom); pure black or white sit on the edge instead of past it.
  const Y = (light, height) => Math.max(0, Math.min(height, ((95 - light) / 90) * height));
  // The INTENDED saturation of the selected colour lives on the slider, not in the hex: black at saturation 75
  // is still #000000, so reading it back from the hex would drop it to 0 and the map would stay grey.
  const intensity = () => {
    const slider = pop && pop.querySelector('[data-sat]');
    return slider ? Number(slider.value) : lib.hexToHsl(v.stops[sel].c).s;
  };
  function render() {
    if (!pop) return;
    const gradient = v.type !== 'solid';
    const current = v.stops[sel];
    const hsl = lib.hexToHsl(current.c);
    const points = gradient ? v.stops : [v.stops[0]];
    const html = [];
    if (allowGradient) {
      html.push(`<div class="pk-seg" role="tablist"><button type="button" data-mode="solid" class="${gradient ? '' : 'on'}">${say('Sólido', 'Solid')}</button><button type="button" data-mode="gradient" class="${gradient ? 'on' : ''}">${say('Degradado', 'Gradient')}</button></div>`);
    }
    if (gradient) {
      html.push(`<div class="pk-bar" style="background:${lib.barCss(v)}" aria-label="${say('Colores del degradado', 'Gradient colours')}">${v.stops.map((stop, i) => `<span class="pk-stop ${i === sel ? 'on' : ''}" data-stop="${i}" style="left:${stop.p}%;background:${stop.c}" tabindex="0" role="slider" aria-label="${say('Color', 'Colour')} ${i + 1}" aria-valuenow="${Math.round(stop.p)}"></span>`).join('')}</div>`);
    }
    html.push(`<div class="pk-map" aria-label="${say('Mapa de tonos', 'Colour map')}"><canvas></canvas><svg>${gradient ? '<polyline class="pk-ln" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="3 4" opacity=".9"/>' : ''}</svg>${points.map((_, i) => `<span class="pk-pt ${i === sel ? 'on' : ''}">${gradient ? i + 1 : ''}</span>`).join('')}</div>`);
    // Saturation of the SELECTED point, and it says so: in a gradient the label carries that point's number and
    // colour, so nobody takes it for opacity or for the whole gradient.
    const satName = say('Saturación', 'Saturation');
    const satOf = gradient ? `${satName} ${sel + 1}` : satName;
    html.push(`<div class="pk-row"><span class="pk-lbl pk-satlbl">${gradient ? `<i class="pk-satdot" style="background:${current.c}">${sel + 1}</i>` : ''}${satName}</span><input class="pk-range" type="range" min="0" max="100" value="${hsl.s}" data-sat aria-label="${satOf}"></div>`);
    html.push(`<div class="pk-row"><label class="pk-hex"><i style="background:${current.c}"></i><input value="${current.c}" maxlength="7" spellcheck="false" data-hex data-clear="on" aria-label="${say('Código del color', 'Colour code')}"></label>${'EyeDropper' in window ? `<button type="button" class="pk-ic" data-drop aria-label="${say('Tomar un color de la pantalla', 'Pick a colour from the screen')}">${ICON.drop}</button>` : ''}${gradient ? `<button type="button" class="pk-ic" data-del aria-label="${say('Quitar este color', 'Remove this colour')}" ${v.stops.length <= 2 ? 'disabled' : ''}>${ICON.trash}</button>` : ''}</div>`);
    if (gradient) {
      html.push(`<div class="pk-row">${['linear', 'radial', 'conic'].map((type) => `<button type="button" class="pk-ic ${v.type === type ? 'on' : ''}" data-type="${type}" aria-label="${TYPE_LABEL[type]}" aria-pressed="${v.type === type}">${ICON[type]}</button>`).join('')}<span class="pk-grow"></span>${v.type !== 'radial' ? `<span class="pk-dial" data-dial tabindex="0" role="slider" aria-label="${say('Ángulo', 'Angle')}" aria-valuenow="${Math.round(v.angle)}"><i style="transform:rotate(${v.angle + 180}deg)"></i></span><span class="pk-deg">${Math.round(v.angle)}°</span>` : ''}</div>`);
      if (allowedAnims.length > 1) {
        html.push(`<div class="pk-sep"></div><div class="pk-anims">${allowedAnims.map((anim) => `<button type="button" data-anim="${anim}" class="${v.anim === anim ? 'on' : ''}" aria-pressed="${v.anim === anim}"><i data-prev="${anim}"></i>${en ? lib.ANIM_LABELS[anim].en : lib.ANIM_LABELS[anim].es}</button>`).join('')}</div>`);
        if (v.anim !== 'none') {
          html.push(`<div class="pk-row"><span class="pk-lbl">${say('Velocidad', 'Speed')}</span><div class="pk-seg pk-grow">${[say('Lenta', 'Slow'), say('Media', 'Medium'), say('Rápida', 'Fast')].map((name, i) => `<button type="button" data-speed="${i}" class="${v.speed === i ? 'on' : ''}">${name}</button>`).join('')}</div></div>`);
        }
      }
    }
    // Ready-made gradients in a grid (all visible, nothing to scroll), and the recent colours in a row of their own.
    if (gradient) {
      html.push(`<div class="pk-sep"></div><div class="pk-sw">${lib.PAIRS.map((pair) => { const name = en ? pair.name.en : pair.name.es; return `<button type="button" data-pair="${pair.colours.join(',')}" style="background:linear-gradient(135deg,${pair.colours.join(',')})" title="${name}" aria-label="${name}"></button>`; }).join('')}</div>`);
    }
    if (recent.length > 0) {
      html.push(`${gradient ? '' : '<div class="pk-sep"></div>'}<div class="pk-recent"><span class="pk-lbl">${say('Recientes', 'Recent')}</span>${recent.map((colour) => `<button type="button" data-swatch="${colour}" style="background:${colour}" title="${colour}" aria-label="${colour}"></button>`).join('')}</div>`);
    }
    pop.innerHTML = html.join('');
    pop.querySelector('[data-sat]').style.background = `linear-gradient(90deg, hsl(${hsl.h} 0% ${hsl.l}%), hsl(${hsl.h} 100% ${hsl.l}%))`;
    paintPreviews();
    drawMap();
    wire();
  }
  // Each animation button previews the CURRENT gradient moving that way, so it repaints on every change.
  function paintPreviews() {
    pop.querySelectorAll('[data-prev]').forEach((swatch) => {
      const css = lib.paintCss({ ...v, anim: swatch.dataset.prev });
      swatch.style.background = css.background;
      swatch.style.backgroundSize = css.backgroundSize;
      swatch.style.animation = css.animation.replace(/[\d.]+s/, '4s');
    });
  }
  function drawMap() {
    const map = pop && pop.querySelector('.pk-map');
    if (!map) return;
    const canvas = map.querySelector('canvas');
    const width = map.clientWidth;
    const height = map.clientHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    // A grey shows the map in colour anyway: that is what touching it will give (see the pointerdown).
    const sat = intensity() < GREY ? COLOURFUL : intensity();
    for (let x = 0; x < width; x += 1) {
      const hue = (x / width) * 360;
      const column = ctx.createLinearGradient(0, 0, 0, height);
      column.addColorStop(0, `hsl(${hue} ${sat}% 95%)`);
      column.addColorStop(0.5, `hsl(${hue} ${sat}% 50%)`);
      column.addColorStop(1, `hsl(${hue} ${sat}% 5%)`);
      ctx.fillStyle = column;
      ctx.fillRect(x, 0, 1.5, height);
    }
    placePoints();
  }
  function placePoints() {
    const map = pop.querySelector('.pk-map');
    const width = map.clientWidth;
    const height = map.clientHeight;
    const gradient = v.type !== 'solid';
    const stops = gradient ? v.stops : [v.stops[0]];
    const xy = stops.map((stop) => { const hsl = lib.hexToHsl(stop.c); return [(hsl.h / 360) * width, Y(hsl.l, height)]; });
    map.querySelectorAll('.pk-pt').forEach((point, i) => {
      point.style.left = `${xy[i][0]}px`;
      point.style.top = `${xy[i][1]}px`;
      point.style.background = stops[i].c;
      point.classList.toggle('on', i === sel);
    });
    const line = map.querySelector('.pk-ln');
    if (line) line.setAttribute('points', v.stops.map((stop, i) => [stop.p, i]).sort((a, b) => a[0] - b[0]).map(([, i]) => xy[i].join(',')).join(' '));
  }
  // While dragging: repaint this popover, tell an `input` handler if the host wants live updates.
  function live() {
    const bar = pop.querySelector('.pk-bar');
    if (bar) {
      bar.style.background = lib.barCss(v);
      bar.querySelectorAll('.pk-stop').forEach((stop, i) => { stop.style.left = `${v.stops[i].p}%`; stop.style.background = v.stops[i].c; });
    }
    const current = v.stops[sel];
    const hex = pop.querySelector('[data-hex]');
    if (document.activeElement !== hex) hex.value = current.c;
    pop.querySelector('.pk-hex i').style.background = current.c;
    const hsl = lib.hexToHsl(current.c);
    pop.querySelector('[data-sat]').style.background = `linear-gradient(90deg, hsl(${hsl.h} 0% ${hsl.l}%), hsl(${hsl.h} 100% ${hsl.l}%))`;
    const dot = pop.querySelector('.pk-satdot');
    if (dot) {
      dot.textContent = String(sel + 1);
      dot.style.background = current.c;
      pop.querySelector('[data-sat]').setAttribute('aria-label', `${say('Saturación', 'Saturation')} ${sel + 1}`);
    }
    placePoints();
    paintPreviews();
    emit('input');
  }
  function setColour(i, colour) {
    v.stops[i].c = colour;
    if (v.type === 'solid') v.stops.forEach((stop) => { stop.c = colour; });
  }
  function selectStop(i) {
    sel = i;
    pop.querySelectorAll('.pk-pt').forEach((point, at) => point.classList.toggle('on', at === sel));
    pop.querySelectorAll('.pk-stop').forEach((stop, at) => stop.classList.toggle('on', at === sel));
    pop.querySelector('[data-sat]').value = lib.hexToHsl(v.stops[sel].c).s;
    drawMap();
    live();
  }
  let recent = [];
  function remember(colour) { recent = [colour, ...recent.filter((each) => each !== colour)].slice(0, 8); }
  function commit() { remember(v.stops[sel].c); emit('pick'); }

  function wire() {
    const map = pop.querySelector('.pk-map');
    let dragging = null;
    const at = (event) => {
      const r = map.getBoundingClientRect();
      return { x: Math.max(0, Math.min(r.width, event.clientX - r.left)), y: Math.max(0, Math.min(r.height, event.clientY - r.top)), w: r.width, h: r.height };
    };
    const moveTo = (event) => {
      if (dragging === null) return;
      const p = at(event);
      const sat = intensity();
      setColour(dragging, lib.hslToHex(Math.round((p.x / p.w) * 360) % 360, sat, Math.round(95 - (p.y / p.h) * 90)));
      live();
    };
    map.addEventListener('pointerdown', (event) => {
      const p = at(event);
      const stops = v.type !== 'solid' ? v.stops : [v.stops[0]];
      // Grab the point under the finger; on a tie (two stops of the same colour sit on the same spot) the
      // one already selected wins, so a drag never jumps to a colour you did not choose.
      const far = (i) => { const hsl = lib.hexToHsl(stops[i].c); return Math.hypot((hsl.h / 360) * p.w - p.x, Y(hsl.l, p.h) - p.y); };
      let nearest = sel;
      stops.forEach((_, i) => { if (far(i) < far(nearest) - 2) nearest = i; });
      if (far(nearest) < GRAB && nearest !== sel) selectStop(nearest);
      // A grey (black, white) has no saturation, so the map is drawn grey and dragging would only give greys.
      // Touching the map means «I want a colour»: bring the saturation up first. The slider can take it back.
      const hsl = lib.hexToHsl(v.stops[sel].c);
      if (hsl.s < GREY) {
        setColour(sel, lib.hslToHex(hsl.h, COLOURFUL, hsl.l));
        pop.querySelector('[data-sat]').value = COLOURFUL;
        drawMap();
      }
      dragging = sel;
      map.setPointerCapture(event.pointerId);
      moveTo(event);
    });
    map.addEventListener('pointermove', moveTo);
    map.addEventListener('pointerup', () => { if (dragging !== null) { dragging = null; commit(); } });

    const bar = pop.querySelector('.pk-bar');
    if (bar) {
      bar.addEventListener('pointerdown', (event) => {
        const r = bar.getBoundingClientRect();
        // A tap NEAR a stop grabs it: only a tap clear of every stop adds a new one. The handle is small and a
        // near-miss used to create a stop instead of moving the one you reached for.
        const x = event.clientX - r.left;
        let near = -1;
        let nearest = GRAB_STOP;
        v.stops.forEach((each, i) => { const d = Math.abs((each.p / 100) * r.width - x); if (d < nearest) { nearest = d; near = i; } });
        const stop = event.target.closest('[data-stop]');
        let moving;
        if (stop || near >= 0) {
          moving = stop ? Number(stop.dataset.stop) : near;
          if (moving !== sel) selectStop(moving);
        } else if (v.stops.length < lib.MAX_STOPS) {
          // The new stop takes the colour the gradient already has at that spot, so adding one never
          // changes how it looks until you move it, and its point does not sit on top of another one.
          const p = Math.round(((event.clientX - r.left) / r.width) * 100);
          const sorted = [...v.stops].sort((a, b) => a.p - b.p);
          const left = [...sorted].reverse().find((each) => each.p <= p) || sorted[0];
          const right = sorted.find((each) => each.p > p) || sorted[sorted.length - 1];
          const span = right.p - left.p;
          v.stops.push({ c: lib.mixHex(left.c, right.c, span > 0 ? (p - left.p) / span : 0), p });
          sel = v.stops.length - 1;
          render();
          commit();
          return;
        } else return;
        const startY = event.clientY;
        bar.setPointerCapture(event.pointerId);
        bar.classList.add('grabbing');
        const off = (e) => Math.abs(e.clientY - startY) > OFF_BAR && v.stops.length > 2;
        const move = (e) => {
          v.stops[moving].p = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
          bar.querySelectorAll('.pk-stop')[moving].classList.toggle('gone', off(e));
          live();
        };
        const up = (e) => {
          bar.removeEventListener('pointermove', move);
          bar.classList.remove('grabbing');
          if (off(e)) { v.stops.splice(moving, 1); sel = 0; render(); }
          commit();
        };
        bar.addEventListener('pointermove', move);
        bar.addEventListener('pointerup', up, { once: true });
        bar.addEventListener('pointercancel', up, { once: true });
      });
      bar.addEventListener('keydown', (event) => {
        const stop = event.target.closest('[data-stop]');
        if (!stop) return;
        const i = Number(stop.dataset.stop);
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          v.stops[i].p = Math.max(0, Math.min(100, v.stops[i].p + (event.key === 'ArrowRight' ? 2 : -2)));
          live(); commit(); event.preventDefault();
        }
        if ((event.key === 'Delete' || event.key === 'Backspace') && v.stops.length > 2) {
          v.stops.splice(i, 1); sel = 0; render(); commit();
        }
      });
    }

    const dial = pop.querySelector('[data-dial]');
    if (dial) {
      const turn = (event) => {
        const r = dial.getBoundingClientRect();
        const degrees = (Math.atan2(event.clientY - (r.top + r.height / 2), event.clientX - (r.left + r.width / 2)) * 180) / Math.PI + 90;
        v.angle = Math.round((((degrees % 360) + 360) % 360) / 5) * 5;
        dial.querySelector('i').style.transform = `rotate(${v.angle + 180}deg)`;
        pop.querySelector('.pk-deg').textContent = `${v.angle}°`;
        live();
      };
      dial.addEventListener('pointerdown', (event) => {
        dial.setPointerCapture(event.pointerId);
        turn(event);
        dial.addEventListener('pointermove', turn);
        dial.addEventListener('pointerup', () => { dial.removeEventListener('pointermove', turn); commit(); }, { once: true });
      });
      dial.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        v.angle = (v.angle + (event.key === 'ArrowRight' ? 15 : -15) + 360) % 360;
        render();
        pop.querySelector('[data-dial]').focus();
        commit();
        event.preventDefault();
      });
    }

    const sat = pop.querySelector('[data-sat]');
    sat.addEventListener('input', () => {
      const hsl = lib.hexToHsl(v.stops[sel].c);
      setColour(sel, lib.hslToHex(hsl.h, Number(sat.value), hsl.l));
      drawMap();
      live();
    });
    sat.addEventListener('change', commit);
    pop.querySelector('[data-hex]').addEventListener('input', (event) => {
      const typed = event.target.value.trim();
      const hex = typed.startsWith('#') ? typed : `#${typed}`;
      if (!lib.isHex(hex)) return;
      setColour(sel, hex.toLowerCase());
      drawMap();
      live();
      commit();
    });
  }

  async function onClick(event) {
    const button = event.target.closest('button');
    if (!button || !pop || !pop.contains(button)) return;
    const data = button.dataset;
    if (data.mode) {
      if (data.mode === 'solid') {
        const colour = v.stops[sel].c;
        v = lib.parsePaint(colour);
      } else if (v.type === 'solid') {
        const hsl = lib.hexToHsl(v.stops[0].c);
        v = { ...v, type: 'linear', stops: [{ c: lib.hslToHex(hsl.h, hsl.s, Math.max(6, hsl.l - 28)), p: 0 }, { c: v.stops[0].c, p: 100 }] };
      }
      sel = v.type === 'solid' ? 0 : 1;
    } else if (data.type) v.type = data.type;
    else if (data.anim) v.anim = data.anim;
    else if (data.speed) v.speed = Number(data.speed);
    else if (data.pair) { const colours = data.pair.split(','); v.stops = colours.map((c, i) => ({ c, p: Math.round((i / (colours.length - 1)) * 100) })); sel = 0; }
    else if (data.swatch) setColour(sel, data.swatch);
    else if ('del' in data) { if (v.stops.length <= 2) return; v.stops.splice(sel, 1); sel = 0; }
    else if ('drop' in data) {
      try { const picked = await new window.EyeDropper().open(); setColour(sel, picked.sRGBHex.toLowerCase()); } catch { return; }
    } else return;
    render();
    place();
    commit();
  }

  import('@muten/shadcn/registry/kit/paint.js').then((m) => { lib = m.default; load(pending); paintWell(); });

  // A new value from the host (another preset, a reset): take it unless it is what we already show.
  return (next) => {
    const text = String((next && next.value) || '');
    pending = text;
    if (!lib) return;
    if (v && text === lib.printPaint(v)) return;
    load(text);
    paintWell();
    if (pop) render();
  };
}
