// GradientBlinds - first ported from React Bits (reactbits.dev), then made calm: a WebGL fragment shader (via `ogl`)
// lays a gradient that is born on one side of the hero (`from`) and dissolves into the page over a long, eased fall,
// with soft blinds that only shade it (never down to black), a light that follows the pointer and only adds, and a
// fine grain. The fall is the canvas's own alpha, so it melts into any page background, light or dark.
// A Custom (graphics = the vanilla-JS escape); ogl loads via dynamic import() (a Custom is inlined into an IIFE, so a
// top-level import is illegal). Inputs: colors, from (top | bottom | left | right | center), angle, blindCount,
// blindMinWidth, strength (how much the blinds shade, 0..1), noise. It draws only while on screen; with reduced
// motion it is still (no drift, the light stays put). Needs `ogl`.
const MAX_COLORS = 8;
const FROM = { top: 0, bottom: 1, left: 2, right: 3, center: 4 };
const hexToRGB = (hex) => {
  const c = String(hex).replace("#", "").padEnd(6, "0");
  return [parseInt(c.slice(0, 2), 16) / 255, parseInt(c.slice(2, 4), 16) / 255, parseInt(c.slice(4, 6), 16) / 255];
};
const prepStops = (stops) => {
  const base = (stops.length ? stops : ["#9B80FF", "#6B46F2"]).slice(0, MAX_COLORS);
  if (base.length === 1) base.push(base[0]);
  const count = base.length;
  while (base.length < MAX_COLORS) base.push(base[base.length - 1]);
  return { arr: base.map(hexToRGB), count };
};

const vertex = "attribute vec2 position;attribute vec2 uv;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,0.0,1.0);}";
const fragment = `precision mediump float;
uniform vec3 iResolution; uniform vec2 iMouse; uniform float iTime;
uniform float uAngle, uNoise, uBlindCount, uStrength, uFrom;
uniform vec3 uColor0,uColor1,uColor2,uColor3,uColor4,uColor5,uColor6,uColor7; uniform int uColorCount;
varying vec2 vUv;
float rand(vec2 co){ return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453); }
vec2 rotate2D(vec2 p, float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c)*p; }
vec3 gradient(float t){
  float scaled = clamp(t,0.0,1.0) * float(uColorCount-1); float seg = floor(scaled); float f = smoothstep(0.0,1.0,fract(scaled));
  if(seg<1.0) return mix(uColor0,uColor1,f);
  if(seg<2.0) return mix(uColor1,uColor2,f);
  if(seg<3.0) return mix(uColor2,uColor3,f);
  if(seg<4.0) return mix(uColor3,uColor4,f);
  if(seg<5.0) return mix(uColor4,uColor5,f);
  if(seg<6.0) return mix(uColor5,uColor6,f);
  return mix(uColor6,uColor7,f);
}
// how far a point is from the side the colour is born on: 0 there, 1 at the far side
float away(vec2 uv){
  if(uFrom<0.5) return 1.0-uv.y;
  if(uFrom<1.5) return uv.y;
  if(uFrom<2.5) return uv.x;
  if(uFrom<3.5) return 1.0-uv.x;
  vec2 d = (uv-0.5)*vec2(iResolution.x/iResolution.y,1.0); return clamp(length(d)*0.9,0.0,1.0);
}
void main(){
  vec2 uv0 = vUv;
  float aspect = iResolution.x / iResolution.y;
  vec2 p = uv0*2.0-1.0; p.x *= aspect; vec2 pr = rotate2D(p, uAngle); pr.x /= aspect; vec2 uv = pr*0.5+0.5;
  float t = uv.x + iTime*0.012;
  float wave = fract(t*0.5)*2.0; wave = wave > 1.0 ? 2.0-wave : wave;   // there and back, so the colours never jump
  vec3 col = gradient(wave);
  // blinds: a rounded light-to-shade profile per blind, shading the colour by at most uStrength
  float stripe = fract(t * uBlindCount);
  float shade = 0.5 - 0.5*cos(stripe*6.28318);
  col *= 1.0 - uStrength*shade;
  // the light under the pointer: a wide, soft lift
  vec2 m = iMouse / iResolution.xy; vec2 dm = (uv0-m)*vec2(aspect,1.0);
  col += exp(-dot(dm,dm)*3.5) * 0.18;
  col += (rand(gl_FragCoord.xy + floor(iTime*24.0)) - 0.5) * uNoise;
  // the fall into the page: full near the side it comes from, gone by the far side, eased so there is no edge
  float a = 1.0 - smoothstep(0.0, 1.0, away(uv0));
  a = a*a*(3.0-2.0*a);
  gl_FragColor = vec4(col*a, a);
}`;

export function mount(el, inputs) {
  const num = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
  const I = inputs || {};
  const colors = String(I.colors || "").split(",").map((s) => s.trim()).filter(Boolean);
  const from = FROM[I.from] ?? FROM.top;
  const angle = num(I.angle, -25), noise = num(I.noise, 0.035), strength = num(I.strength, 0.22);
  const blindCount = num(I.blindCount, 12), blindMinWidth = num(I.blindMinWidth, 80);
  const still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  import("ogl").then(({ Renderer, Program, Mesh, Triangle }) => {
    const renderer = new Renderer({ dpr: Math.min(2, window.devicePixelRatio || 1), alpha: true, premultipliedAlpha: true });
    const gl = renderer.gl;
    const canvas = gl.canvas;
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.appendChild(canvas);

    const { arr, count } = prepStops(colors);
    const uniforms = {
      iResolution: { value: [1, 1, 1] }, iMouse: { value: [0, 0] }, iTime: { value: 0 },
      uAngle: { value: (angle * Math.PI) / 180 }, uNoise: { value: noise }, uStrength: { value: strength },
      uBlindCount: { value: blindCount }, uFrom: { value: from }, uColorCount: { value: count },
      uColor0: { value: arr[0] }, uColor1: { value: arr[1] }, uColor2: { value: arr[2] }, uColor3: { value: arr[3] },
      uColor4: { value: arr[4] }, uColor5: { value: arr[5] }, uColor6: { value: arr[6] }, uColor7: { value: arr[7] },
    };
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program: new Program(gl, { vertex, fragment, uniforms, transparent: true }) });

    let tx = 0, ty = 0, last = 0, seen = true, placed = false;
    const draw = () => { try { renderer.render({ scene: mesh }); } catch (_) { /* context lost */ } };
    const resize = () => {
      const rect = el.getBoundingClientRect();
      renderer.setSize(rect.width || 1, rect.height || 1);
      uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1];
      uniforms.uBlindCount.value = Math.max(1, Math.min(blindCount, Math.floor((rect.width || 1) / blindMinWidth)));
      if (!placed) { placed = true; tx = gl.drawingBufferWidth / 2; ty = gl.drawingBufferHeight * 0.7; uniforms.iMouse.value = [tx, ty]; }
      draw();
    };
    resize();
    try { new ResizeObserver(resize).observe(el); } catch (_) {}
    try { new IntersectionObserver(([e]) => { seen = e.isIntersecting; }).observe(el); } catch (_) {}

    if (still) return;
    // on window, so the light follows the pointer even over the hero's content
    window.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect(), scale = renderer.dpr || 1;
      tx = (e.clientX - rect.left) * scale;
      ty = (rect.height - (e.clientY - rect.top)) * scale;
    }, { passive: true });
    const loop = (time) => {
      requestAnimationFrame(loop);
      if (!seen || document.hidden) { last = time; return; }
      const dt = last ? (time - last) / 1000 : 0; last = time;
      const ease = 1 - Math.exp(-dt / 0.35), cur = uniforms.iMouse.value;
      cur[0] += (tx - cur[0]) * ease; cur[1] += (ty - cur[1]) * ease;
      uniforms.iTime.value = time * 0.001;
      draw();
    };
    requestAnimationFrame(loop);
  }).catch(() => { /* no ogl: the hero keeps its flat background */ });
}
