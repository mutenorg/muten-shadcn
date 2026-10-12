// AssistantOrb (muten Custom) - the assistant as a sphere of light with eyes (see assistant-orb.muten).
// The sphere is a small WebGL shader (flowing light, rim, halo); the eyes are an SVG whose capsules lift into a smile.
// Everything moves on springs. Its mood comes from outside through the `orb:mood` event; with no mood it idles.
// `orb:face` lets a page (Mascot) paint the face itself, worn on the sphere's surface, with a blush in its shader.
const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FRAG = `precision highp float;
uniform vec2 res;uniform float t;uniform float e;uniform vec2 look;uniform vec2 bl;uniform vec2 co;uniform sampler2D face;uniform float hasFace;
float h(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.55,s=0.;for(int k=0;k<3;k++){s+=a*n3(p);p=p*1.9+vec3(1.7,9.2,3.1);a*=.45;}return s/.95;}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*res)/(.5*res.y);
 float R=.66; float r=length(uv)/R;
 vec3 deep=vec3(.30,.16,.82), brand=vec3(.47,.31,1.), lav=vec3(.80,.72,1.), pink=vec3(1.,.62,.88), cyan=vec3(.50,.88,1.), mint=vec3(.30,.95,.70);
 vec4 outc=vec4(0.);
 float halo=exp(-max(r-1.,0.)*5.5)*(.38+.25*e);
 vec3 hc=mix(brand,mint,e*.6);
 outc=vec4(hc*halo,halo);
 if(r<1.){
  vec3 n=vec3(uv/R,sqrt(max(1.-r*r,0.)));
  n.xy+=look*.12; n=normalize(n);
  float sp=.10+.22*e;
  vec3 q=n*1.05+vec3(0.,0.,t*sp);
  float w=fbm(q+vec3(t*.05,-t*.04,0.));
  float f=fbm(q*1.1+w*1.6);
  vec3 col=mix(deep,brand,smoothstep(.2,.6,f));
  col=mix(col,lav,smoothstep(.55,.85,f)*.75);
  col=mix(col,pink,smoothstep(.45,.85,fbm(q*.8+5.))*.45*(.5+.5*n.x));
  col=mix(col,cyan,smoothstep(.6,.9,fbm(q*.9+11.))*.35*(.5-.5*n.x));
  col=mix(col,lav,.18*(1.-n.y)*.5);
  vec3 L=normalize(vec3(-.8,.86,.08));
  float dif=.72+.28*max(dot(n,L),0.);
  float rv=max(dot(reflect(-L,n),vec3(0.,0.,1.)),0.);
  float spec=pow(rv,70.)*.85+pow(rv,6.)*.10;
  float fres=pow(1.-n.z,2.4);
  vec3 rim=mix(pink,cyan,.5+.5*sin(t*.6+n.y*3.+n.x*2.));
  // THE FACE ON THE SURFACE (opt-in, orb:face): the blush is painted on the sphere's normal, so it curves and
  // foreshortens toward the rim, warm at its core; the eyes come as a texture wrapped by longitude and latitude, so
  // they curve, turn with the face (co) and take the same light and highlight as the body.
  vec2 cq=n.xy-co;
  float dL=length((cq-vec2(-.56,-.19))*vec2(1.,1.5)), dR=length((cq-vec2(.56,-.19))*vec2(1.,1.5));
  float bm=clamp(pow(1.-smoothstep(0.,.34,dL),1.35)*bl.x+pow(1.-smoothstep(0.,.34,dR),1.35)*bl.y,0.,1.);
  vec3 bcol=mix(vec3(1.,.38,.70),vec3(1.,.62,.76),smoothstep(.0,.7,1.-bm));
  col=mix(col,bcol,bm*.92);
  col=col*dif+spec+fres*rim*.65;
  col+=bcol*bm*.18;
  if(hasFace>.5){
   float lon=atan(n.x,n.z)-co.x*1.15, lat=asin(clamp(n.y,-1.,1.))-co.y*1.15;
   vec2 fuv=vec2(lon,-lat)*.33+.5;
   vec4 fc=texture2D(face,fuv);
   float fa=fc.a*step(0.,fuv.x)*step(fuv.x,1.)*step(0.,fuv.y)*step(fuv.y,1.);
   col=mix(col,fc.rgb*(.84+.16*max(dot(n,L),0.))+vec3(spec*.7),fa*(1.-smoothstep(.86,.99,r)*.35));
  }
  col+=vec3(.06,.04,.12)*(1.-fres);
  col+=e*mint*fres*.7+e*.08;
  float a=1.-smoothstep(.985,1.,r);
  outc=mix(outc,vec4(col,1.)*a+outc*(1.-a),a);
 }
 gl_FragColor=outc;
}`;
const NS = 'http://www.w3.org/2000/svg';
const clamp = (v) => Math.max(0, Math.min(1, v));
const spring = (k, d) => ({ x: 0, v: 0, to: 0, k, d });
const step = (s, dt) => { const a = -s.k * (s.x - s.to) - s.d * s.v; s.v += a * dt; s.x += s.v * dt; };
// an eye: a capsule whose underside lifts into a smile as `hp` goes 0 → 1; `open` 0 → 1 is the blink
const eyePath = (cx, hp, open) => {
  const w = 26, hgt = 46 * Math.max(open, 0.08), r = w / 2, top = -hgt / 2, bot = hgt / 2;
  const y1 = bot - r + (top + r - (bot - r)) * hp * 0.62;
  const k = r * 1.333 + (-(hgt * 0.34) - r * 1.333) * hp;
  const x0 = cx - r, x1 = cx + r;
  return `M${x0} ${top + r} A${r} ${r} 0 0 1 ${x1} ${top + r} L${x1} ${y1} C${x1} ${y1 + k} ${x0} ${y1 + k} ${x0} ${y1} Z`;
};

export function mount(el, inputs) {
  const size = Math.max(80, Number(inputs.size) || 240);
  // where its eyes rest when nothing else asks for them (look "left" | "right"): it still glances around that point
  const rest = inputs.look === 'left' ? { x: -1, y: -0.12 } : inputs.look === 'right' ? { x: 1, y: -0.12 } : null;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.style.setProperty('--orb', size + 'px');
  el.setAttribute('aria-hidden', 'true');
  // the sphere without WebGL (and under the canvas while it starts)
  const base = document.createElement('span'); base.className = 'cx-orb-base';
  const canvas = document.createElement('canvas'); canvas.className = 'cx-orb-canvas';
  const dpr = Math.min(2, window.devicePixelRatio || 1); canvas.width = canvas.height = Math.round(size * dpr);
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'cx-orb-eyes'); svg.setAttribute('viewBox', '-60 -40 120 80');
  const eyes = document.createElementNS(NS, 'g'), cheeks = document.createElementNS(NS, 'g');
  const eyeL = document.createElementNS(NS, 'path'), eyeR = document.createElementNS(NS, 'path');
  eyes.append(eyeL, eyeR);
  for (const cx of [-46, 46]) { const c = document.createElementNS(NS, 'ellipse'); c.setAttribute('cx', cx); c.setAttribute('cy', 28); c.setAttribute('rx', 13); c.setAttribute('ry', 6.5); cheeks.append(c); }
  cheeks.setAttribute('class', 'cx-orb-cheeks'); cheeks.setAttribute('opacity', '0');
  svg.append(eyes, cheeks);
  el.append(base, canvas, svg);

  // the shader
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: true });
  let prog = null, uT, uE, uLook, uRes, uBl, uCo, uFace, uHas, ftex;
  // the face on the surface (see orb:face): the page paints it flat into this canvas (a 220-unit box centred on the
  // sphere, whose radius is 72.6 of them) and the shader wraps it; the blush and the face's turn are uniforms
  const TEX = size > 300 ? 512 : 256, fcv = document.createElement('canvas'); fcv.width = fcv.height = TEX;
  const fctx = fcv.getContext('2d');
  let facePaint = null, blush = [0, 0], turn = [0, 0];
  if (gl) {
    const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; };
    prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) prog = null;
    if (prog) {
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      uT = gl.getUniformLocation(prog, 't'); uE = gl.getUniformLocation(prog, 'e'); uLook = gl.getUniformLocation(prog, 'look'); uRes = gl.getUniformLocation(prog, 'res');
      uBl = gl.getUniformLocation(prog, 'bl'); uCo = gl.getUniformLocation(prog, 'co'); uFace = gl.getUniformLocation(prog, 'face'); uHas = gl.getUniformLocation(prog, 'hasFace');
      ftex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, ftex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      el.dataset.gl = 'on';
    }
  }

  // springs: critically damped, a little bounce where it is earned
  const gx = spring(120, 22), gy = spring(120, 22), happy = spring(90, 14), blink = spring(900, 60), squash = spring(260, 9), energy = spring(30, 11);
  blink.x = blink.to = 1;
  let look = null, pointer = null, gaze = rest ? { ...rest } : { x: 0, y: 0 };
  el.addEventListener('orb:mood', (ev) => {
    const d = ev.detail || {};
    if (typeof d.happy === 'number') happy.to = clamp(d.happy);
    if (typeof d.energy === 'number') energy.to = clamp(d.energy);
    if ('look' in d) look = d.look;
    if (d.bump) squash.v += 7;
    if (still) { happy.x = happy.to; energy.x = energy.to; draw(0, 0); }
  });
  // orb:face hands the face over to the page (Mascot): { paint: (ctx) => … | null, blush: [left, right], turn: [x, y] }.
  // With a paint the sphere's own eyes step aside and the painted face is worn on the surface instead.
  el.addEventListener('orb:face', (ev) => {
    const d = ev.detail || {};
    if ('paint' in d) { facePaint = prog ? d.paint : null; el.dataset.face = facePaint ? 'surface' : ''; }
    if (d.blush) blush = d.blush;
    if (d.turn) turn = d.turn;
    if (still) draw(6, 0);
  });
  const area = el.closest('[data-area="orb"]') || el.parentElement;
  const onMove = (ev) => { const b = el.getBoundingClientRect(); pointer = { x: (ev.clientX - (b.left + b.width / 2)) / 260, y: (ev.clientY - (b.top + b.height / 2)) / 260 }; };
  const onLeave = () => { pointer = null; };
  if (area && !still) { area.addEventListener('pointermove', onMove); area.addEventListener('pointerleave', onLeave); }

  let T = 0, nextBlink = 1.2, nextSaccade = 0.6;
  function draw(t, breatheT) {
    const breathe = 1 + Math.sin(breatheT * 1.6) * 0.012, sq = squash.x * 0.06;
    el.style.setProperty('--orb-x', (gx.x * 6).toFixed(2) + 'px');
    el.style.setProperty('--orb-y', (gy.x * 4 + Math.sin(breatheT * 1.1) * 6).toFixed(2) + 'px');
    el.style.setProperty('--orb-sx', (breathe + sq).toFixed(4)); el.style.setProperty('--orb-sy', (breathe - sq).toFixed(4));
    if (prog) {
      gl.viewport(0, 0, canvas.width, canvas.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, canvas.width, canvas.height); gl.uniform1f(uT, t); gl.uniform1f(uE, clamp(energy.x)); gl.uniform2f(uLook, gx.x, -gy.x);
      gl.uniform2f(uBl, blush[0], blush[1]); gl.uniform2f(uCo, turn[0], turn[1]);
      if (facePaint) {
        fctx.setTransform(1, 0, 0, 1, 0, 0); fctx.clearRect(0, 0, TEX, TEX);
        fctx.setTransform(TEX / 220, 0, 0, TEX / 220, TEX / 2, TEX / 2); facePaint(fctx);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, ftex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fcv);
      }
      gl.uniform1i(uFace, 0); gl.uniform1f(uHas, facePaint ? 1 : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    const hp = clamp(happy.x), open = clamp(blink.x);
    eyeL.setAttribute('d', eyePath(-24, hp, open)); eyeR.setAttribute('d', eyePath(24, hp, open));
    eyes.setAttribute('transform', `translate(${(gx.x * 14).toFixed(2)} ${(gy.x * 9).toFixed(2)})`);
    cheeks.setAttribute('opacity', (hp * 0.8).toFixed(3));
    cheeks.setAttribute('transform', `translate(${(gx.x * 9).toFixed(2)} ${(gy.x * 6).toFixed(2)})`);
  }
  if (still) { if (rest) { gx.x = rest.x; gy.x = rest.y; } draw(6, 0); return () => {}; }

  // the loop runs only while the orb is on screen and the tab is visible
  let raf = 0, last = 0, visible = true;
  const frame = (now) => {
    const dt = Math.min((now - (last || now)) / 1000, 1 / 30); last = now; T += dt;
    if (pointer) gaze = { x: Math.max(-1, Math.min(1, pointer.x)), y: Math.max(-1, Math.min(1, pointer.y)) };
    else if (look) gaze = look;
    else if (T > nextSaccade) {
      gaze = rest ? { x: rest.x + (Math.random() - 0.5) * 0.3, y: rest.y + (Math.random() - 0.5) * 0.3 } : { x: (Math.random() - 0.5) * 1.1, y: (Math.random() - 0.6) * 0.7 };
      nextSaccade = T + 1.1 + Math.random() * 1.8;
    }
    gx.to = gaze.x; gy.to = gaze.y;
    if (T > nextBlink && happy.to < 0.5) { blink.x = 0.15; blink.v = 0; nextBlink = T + (Math.random() < 0.2 ? 0.28 : 2.4 + Math.random() * 2.6); }
    [gx, gy, happy, blink, squash, energy].forEach((s) => step(s, dt));
    blink.to = 1;
    draw(T, T);
    raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
  };
  const wake = () => { if (!raf && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } };
  new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); wake(); }).observe(el);
  document.addEventListener('visibilitychange', wake);
  wake();
  return () => {};
}
