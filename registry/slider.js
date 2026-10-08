// The app-wide slider: a range input with a value bubble that follows the thumb and a filled track.
// A native muten `Range` can't render a following bubble or a cross-browser fill, so this is a Custom
// (a real widget the DSL can't express). Every slider in the app uses THIS, so they all look the same.
//
// inputs.value  = current number (snapshot at mount; the returned updater syncs later external changes)
// inputs.min / inputs.max / inputs.step = numeric bounds (default 0 / 100 / 1)
// inputs.suffix = text appended in the bubble (e.g. "%"); default ""
// on.change(n)  = fires with the NUMBER while dragging. The value is clamped to [min, max].
//
// Styling lives in styles.css (.mslider*); this file only wires behavior.

function sliderMount(el, inputs, on) {
  const readNum = (v, fallback) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };
  const min = readNum(inputs && inputs.min, 0);
  const max = readNum(inputs && inputs.max, 100);
  const step = readNum(inputs && inputs.step, 1);
  const suffix = String((inputs && inputs.suffix != null ? inputs.suffix : ''));

  const clamp = (v) => {
    if (!Number.isFinite(v)) return min;
    return v < min ? min : (v > max ? max : v);
  };
  let value = clamp(readNum(inputs && inputs.value, min));

  el.innerHTML = '';
  el.classList.add('mslider');
  const bubble = document.createElement('span');
  bubble.className = 'mslider-bubble';
  const input = document.createElement('input');
  input.type = 'range';
  input.className = 'mslider-input';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.setAttribute('aria-label', 'Deslizador');
  el.append(bubble, input);

  const pct = () => (max === min ? 0 : ((value - min) / (max - min)) * 100);

  const paint = () => {
    input.value = String(value);
    const p = pct();
    input.style.setProperty('--p', p + '%');
    bubble.textContent = value + suffix;
    // Keep the bubble centered over the thumb, accounting for the thumb width.
    const w = input.getBoundingClientRect().width;
    if (w > 0) {
      const thumb = 21;
      bubble.style.left = ((p / 100) * (w - thumb) + thumb / 2) + 'px';
    }
  };
  paint();
  // The width can be 0 when mounted inside a panel that is still opening; repaint once it has laid out.
  requestAnimationFrame(paint);

  input.addEventListener('input', () => {
    value = clamp(readNum(input.value, min));
    paint();
    if (on && on.change) on.change(value);
  });
  window.addEventListener('resize', paint);
  // the bubble needs the real width: repaint whenever the slider gets laid out or resized (not only on input)
  if (window.ResizeObserver) new ResizeObserver(paint).observe(input);

  return (next) => {
    if (next && next.value != null) {
      const v = clamp(readNum(next.value, value));
      if (v !== value) { value = v; paint(); }
    }
  };
}

// muten Custom entry: the plugin's Slider keeps its `input` handler name; Storio's slider calls `change`.
export function mount(el, inputs, on) { el.dataset.bubble = inputs.bubble || 'always'; return sliderMount(el, inputs, { change: (n) => (on.input || on.change)?.(n) }); }
