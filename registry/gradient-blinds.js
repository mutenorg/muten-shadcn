// GradientBlinds - ported from React Bits (reactbits.dev) to a muten Custom. A WebGL fragment shader (via `ogl`)
// draws diagonal blinds over an animated gradient with a spotlight that FOLLOWS THE MOUSE + grain. Faithful and
// GPU-fast. A Custom (graphics = the vanilla-JS escape); ogl loads via dynamic import() (a Custom is inlined into
// an IIFE, so a top-level import is illegal). Inputs mirror the React props: colors, angle, noise, blindCount,
// blindMinWidth, spotlightRadius/Softness/Opacity, mouseDampening, distort, shineDirection, mirror. Needs `ogl`.
const MAX_COLORS = 8;
const hexToRGB = (hex) => {
  const c = String(hex).replace("#", "").padEnd(6, "0");
  return [parseInt(c.slice(0, 2), 16) / 255, parseInt(c.slice(2, 4), 16) / 255, parseInt(c.slice(4, 6), 16) / 255];
};
const prepStops = (stops) => {
  const base = (stops && stops.length ? stops : ["#FF9FFC", "#5227FF"]).slice(0, MAX_COLORS);
  if (base.length === 1) base.push(base[0]);
  while (base.length < MAX_COLORS) base.push(base[base.length - 1]);
  return { arr: base.map(hexToRGB), count: Math.max(2, Math.min(MAX_COLORS, stops && stops.length ? stops.length : 2)) };
};

export function mount(el, inputs) {
  const num = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
  const I = inputs || {};
  const colors = (I.colors ? String(I.colors) : "#FF9FFC,#5227FF").split(",").map((s) => s.trim()).filter(Boolean);
  const angle = num(I.angle, -25), noise = num(I.noise, 0.22);
  const blindCount = num(I.blindCount, 16), blindMinWidth = num(I.blindMinWidth, 55);
  const spotRadius = num(I.spotlightRadius, 0.6), spotSoft = num(I.spotlightSoftness, 1), spotOpacity = num(I.spotlightOpacity, 0.75);
  const damp = num(I.mouseDampening, 0.15), distort = num(I.distort, 0);
  const shineFlip = I.shineDirection === "right" ? 1 : 0, mirror = I.mirror ? 1 : 0;

  import("ogl").then(({ Renderer, Program, Mesh, Triangle }) => {
    const renderer = new Renderer({ dpr: Math.min(2, window.devicePixelRatio || 1), alpha: true, antialias: true });
    const gl = renderer.gl;
    const canvas = gl.canvas;
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;-webkit-mask-image:linear-gradient(to bottom,#000 42%,transparent 94%);mask-image:linear-gradient(to bottom,#000 42%,transparent 94%)";
    el.appendChild(canvas);

    const vertex = "attribute vec2 position;attribute vec2 uv;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,0.0,1.0);}";
    const fragment = `#ifdef GL_ES
precision mediump float;
#endif
uniform vec3 iResolution; uniform vec2 iMouse; uniform float iTime;
uniform float uAngle, uNoise, uBlindCount, uSpotlightRadius, uSpotlightSoftness, uSpotlightOpacity, uMirror, uDistort, uShineFlip;
uniform vec3 uColor0,uColor1,uColor2,uColor3,uColor4,uColor5,uColor6,uColor7; uniform int uColorCount;
varying vec2 vUv;
float rand(vec2 co){ return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453); }
vec2 rotate2D(vec2 p, float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c)*p; }
vec3 getGradientColor(float t){
  float tt=clamp(t,0.0,1.0); int count=uColorCount; if(count<2) count=2;
  float scaled=tt*float(count-1); float seg=floor(scaled); float f=fract(scaled);
  if(seg<1.0) return mix(uColor0,uColor1,f);
  if(seg<2.0 && count>2) return mix(uColor1,uColor2,f);
  if(seg<3.0 && count>3) return mix(uColor2,uColor3,f);
  if(seg<4.0 && count>4) return mix(uColor3,uColor4,f);
  if(seg<5.0 && count>5) return mix(uColor4,uColor5,f);
  if(seg<6.0 && count>6) return mix(uColor5,uColor6,f);
  if(seg<7.0 && count>7) return mix(uColor6,uColor7,f);
  if(count>7) return uColor7; if(count>6) return uColor6; if(count>5) return uColor5;
  if(count>4) return uColor4; if(count>3) return uColor3; if(count>2) return uColor2; return uColor1;
}
void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 uv0 = fragCoord.xy / iResolution.xy;
  float aspect = iResolution.x / iResolution.y;
  vec2 p = uv0*2.0-1.0; p.x*=aspect; vec2 pr = rotate2D(p, uAngle); pr.x/=aspect; vec2 uv = pr*0.5+0.5;
  vec2 uvMod = uv;
  if(uDistort>0.0){ float a=uvMod.y*6.0, b=uvMod.x*6.0, w=0.01*uDistort; uvMod.x+=sin(a)*w; uvMod.y+=cos(b)*w; }
  float t = uvMod.x; if(uMirror>0.5){ t = 1.0 - abs(1.0 - 2.0*fract(t)); }
  vec3 base = getGradientColor(t);
  vec2 offset = vec2(iMouse.x/iResolution.x, iMouse.y/iResolution.y);
  float d = length(uv0-offset); float r = max(uSpotlightRadius, 1e-4); float dn = d/r;
  float spot = (1.0 - 2.0*pow(dn, uSpotlightSoftness)) * uSpotlightOpacity;
  vec3 cir = vec3(spot);
  float stripe = fract(uvMod.x * max(uBlindCount,1.0)); if(uShineFlip>0.5) stripe = 1.0-stripe;
  vec3 ran = vec3(stripe);
  vec3 col = cir + base - ran;
  col += (rand(gl_FragCoord.xy + iTime) - 0.5) * uNoise;
  fragColor = vec4(col, 1.0);
}
void main(){ vec4 color; mainImage(color, vUv*iResolution.xy); gl_FragColor = color; }`;

    const { arr, count } = prepStops(colors);
    const uniforms = {
      iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
      iMouse: { value: [0, 0] }, iTime: { value: 0 },
      uAngle: { value: (angle * Math.PI) / 180 }, uNoise: { value: noise },
      uBlindCount: { value: Math.max(1, blindCount) },
      uSpotlightRadius: { value: spotRadius }, uSpotlightSoftness: { value: spotSoft }, uSpotlightOpacity: { value: spotOpacity },
      uMirror: { value: mirror }, uDistort: { value: distort }, uShineFlip: { value: shineFlip },
      uColor0: { value: arr[0] }, uColor1: { value: arr[1] }, uColor2: { value: arr[2] }, uColor3: { value: arr[3] },
      uColor4: { value: arr[4] }, uColor5: { value: arr[5] }, uColor6: { value: arr[6] }, uColor7: { value: arr[7] },
      uColorCount: { value: count },
    };
    const program = new Program(gl, { vertex, fragment, uniforms });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    let first = true;
    const resize = () => {
      const rect = el.getBoundingClientRect();
      renderer.setSize(rect.width || 1, rect.height || 1);
      uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1];
      const maxByMin = blindMinWidth > 0 ? Math.max(1, Math.floor((rect.width || 1) / blindMinWidth)) : blindCount;
      uniforms.uBlindCount.value = Math.max(1, blindCount ? Math.min(blindCount, maxByMin) : maxByMin);
      if (first) { first = false; const cx = gl.drawingBufferWidth / 2, cy = gl.drawingBufferHeight / 2; uniforms.iMouse.value = [cx, cy]; tx = cx; ty = cy; }
    };
    let tx = 0, ty = 0, last = 0;
    resize();
    try { new ResizeObserver(resize).observe(el); } catch (_) {}

    // listen on window so the spotlight tracks the cursor even through the hero content overlaid on top.
    window.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const scale = renderer.dpr || 1;
      tx = (e.clientX - rect.left) * scale;
      ty = (rect.height - (e.clientY - rect.top)) * scale;
      if (damp <= 0) uniforms.iMouse.value = [tx, ty];
    });

    const loop = (t) => {
      requestAnimationFrame(loop);
      uniforms.iTime.value = t * 0.001;
      if (damp > 0) {
        if (!last) last = t;
        const dt = (t - last) / 1000; last = t;
        let factor = 1 - Math.exp(-dt / Math.max(1e-4, damp)); if (factor > 1) factor = 1;
        const cur = uniforms.iMouse.value;
        cur[0] += (tx - cur[0]) * factor; cur[1] += (ty - cur[1]) * factor;
      }
      try { renderer.render({ scene: mesh }); } catch (e) { /* context lost */ }
    };
    requestAnimationFrame(loop);
  }).catch(() => { /* no ogl - the hero just has a flat background */ });
}
