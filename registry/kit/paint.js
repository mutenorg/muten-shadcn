var PAINT = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var paint_exports = {};
  __export(paint_exports, {
    ANIM_LABELS: () => ANIM_LABELS,
    MAX_STOPS: () => MAX_STOPS,
    PAIRS: () => PAIRS,
    SPEEDS: () => SPEEDS,
    barCss: () => barCss,
    hexToHsl: () => hexToHsl,
    hslToHex: () => hslToHex,
    isHex: () => isHex,
    legacyPaint: () => legacyPaint,
    mixHex: () => mixHex,
    paintAnim: () => paintAnim,
    paintBase: () => paintBase,
    paintBg: () => paintBg,
    paintCss: () => paintCss,
    paintMain: () => paintMain,
    paintSize: () => paintSize,
    parsePaint: () => parsePaint,
    printPaint: () => printPaint
  });
  const SPEEDS = [24, 14, 7];
  const MAX_STOPS = 4;
  const ANIM_LABELS = {
    none: { es: "Nada", en: "None" },
    flow: { es: "Fluir", en: "Flow" },
    breathe: { es: "Respirar", en: "Breathe" },
    spin: { es: "Girar", en: "Spin" },
    hue: { es: "Tono", en: "Hue" }
  };
  const PAIRS = [
    { name: { es: "Aurora", en: "Aurora" }, colours: ["#6B46F2", "#ff5ca8", "#ffb36b"] },
    { name: { es: "Atardecer", en: "Sunset" }, colours: ["#f97316", "#db2777"] },
    { name: { es: "Durazno", en: "Peach" }, colours: ["#ffd6a5", "#ff7eb3"] },
    { name: { es: "Oro", en: "Gold" }, colours: ["#fbbf24", "#b45309"] },
    { name: { es: "Brasa", en: "Ember" }, colours: ["#1c0f0a", "#c2410c"] },
    { name: { es: "Vino", en: "Wine" }, colours: ["#2a0b16", "#9f1239"] },
    { name: { es: "Lavanda", en: "Lavender" }, colours: ["#e9d5ff", "#7c3aed"] },
    { name: { es: "Noche", en: "Night" }, colours: ["#0f172a", "#4338ca"] },
    { name: { es: "Oc\xE9ano", en: "Ocean" }, colours: ["#0ea5e9", "#1e3a8a"] },
    { name: { es: "Hielo", en: "Ice" }, colours: ["#e0f2fe", "#38bdf8"] },
    { name: { es: "Menta", en: "Mint" }, colours: ["#a7f3d0", "#0d9488"] },
    { name: { es: "Bosque", en: "Forest" }, colours: ["#14532d", "#65a30d"] }
  ];
  const TYPES = ["linear", "radial", "conic"];
  const ANIMS = ["none", "flow", "breathe", "spin", "hue"];
  const HEX = /^#[0-9a-f]{6}$/i;
  const FALLBACK = "#4b3aa8";
  function isHex(value) {
    return HEX.test(String(value ?? "").trim());
  }
  function hslToHex(h, s, l) {
    const sat = s / 100;
    const light = l / 100;
    const chroma = sat * Math.min(light, 1 - light);
    const channel = (n) => {
      const k = (n + h / 30) % 12;
      const value = light - chroma * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
      return Math.round(255 * value).toString(16).padStart(2, "0");
    };
    return `#${channel(0)}${channel(8)}${channel(4)}`;
  }
  function hexToHsl(hex) {
    const clean = String(hex ?? "").trim();
    if (!HEX.test(clean)) return hexToHsl(FALLBACK);
    const [r, g, b] = [1, 3, 5].map((at) => parseInt(clean.slice(at, at + 2), 16) / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const light = (max + min) / 2;
    let hue = 0;
    let sat = 0;
    if (max !== min) {
      const span = max - min;
      sat = light > 0.5 ? span / (2 - max - min) : span / (max + min);
      if (max === r) hue = (g - b) / span + (g < b ? 6 : 0);
      else if (max === g) hue = (b - r) / span + 2;
      else hue = (r - g) / span + 4;
      hue *= 60;
    }
    return { h: Math.round(hue), s: Math.round(sat * 100), l: Math.round(light * 100) };
  }
  function solidOf(hex) {
    const colour = (isHex(hex) ? hex : FALLBACK).toLowerCase();
    return { type: "solid", angle: 150, stops: [{ c: colour, p: 0 }, { c: colour, p: 100 }], anim: "none", speed: 1 };
  }
  function mixHex(from, to, weight) {
    const channels = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
    const a = channels(isHex(from) ? from : FALLBACK);
    const b = channels(isHex(to) ? to : FALLBACK);
    const w = Math.max(0, Math.min(1, weight));
    return `#${a.map((value, i) => Math.round(value + (b[i] - value) * w).toString(16).padStart(2, "0")).join("")}`;
  }
  function parsePaint(text) {
    const raw = String(text ?? "").trim();
    if (raw === "" || isHex(raw)) return solidOf(raw);
    const [body, animPart] = raw.split("~");
    const parts = body.split("|").map((part) => part.trim()).filter((part) => part !== "");
    const [typeWord, angleWord] = (parts[0] ?? "").split(/\s+/);
    const stops = parts.slice(1).map((part) => {
      const [c, p] = part.split(/\s+/);
      return { c: String(c ?? "").toLowerCase(), p: Number(p) };
    }).filter((stop) => isHex(stop.c) && Number.isFinite(stop.p));
    if (stops.length < 2) return solidOf(stops[0]?.c ?? FALLBACK);
    const type = TYPES.find((each) => each === typeWord) ?? "linear";
    let anim = "none";
    let speed = 1;
    if (animPart) {
      const [animWord, secondsWord] = animPart.trim().split(/\s+/);
      anim = ANIMS.find((each) => each === animWord) ?? "none";
      const at = SPEEDS.indexOf(Number(secondsWord));
      speed = at < 0 ? 1 : at;
    }
    return { type, angle: Number(angleWord) || 0, stops, anim, speed };
  }
  const byPosition = (stops) => [...stops].sort((a, b) => a.p - b.p);
  function printPaint(paint) {
    if (paint.type === "solid") return paint.stops[0].c;
    const stops = byPosition(paint.stops).map((stop) => `${stop.c} ${Math.round(stop.p)}`).join(" | ");
    const anim = paint.anim !== "none" ? ` ~${paint.anim} ${SPEEDS[paint.speed] ?? SPEEDS[1]}` : "";
    return `${paint.type} ${Math.round(paint.angle)} | ${stops}${anim}`;
  }
  function paintMain(text) {
    const paint = parsePaint(text);
    let best = paint.stops[0].c;
    let score = -1;
    for (const stop of paint.stops) {
      const hsl = hexToHsl(stop.c);
      const vivid = hsl.s * (1 - Math.abs(hsl.l - 50) / 50);
      if (vivid > score) {
        score = vivid;
        best = stop.c;
      }
    }
    return best;
  }
  function paintBase(text) {
    return parsePaint(text).stops[0].c;
  }
  function paintCss(value) {
    const paint = typeof value === "object" && value !== null ? value : parsePaint(String(value ?? ""));
    if (paint.type === "solid") return { background: paint.stops[0].c, backgroundSize: "", animation: "" };
    const list = byPosition(paint.stops).map((stop) => `${stop.c} ${stop.p}%`).join(", ");
    const angle = paint.anim === "spin" ? `calc(var(--pk-angle) + ${paint.angle}deg)` : `${paint.angle}deg`;
    const background = paint.type === "radial" ? `radial-gradient(120% 90% at 50% 25%, ${list})` : paint.type === "conic" ? `conic-gradient(from ${angle} at 50% 40%, ${list})` : `linear-gradient(${angle}, ${list})`;
    const seconds = SPEEDS[paint.speed] ?? SPEEDS[1];
    const animation = {
      none: "",
      flow: `pk-flow ${seconds}s ease-in-out infinite`,
      breathe: `pk-breathe ${seconds / 2}s ease-in-out infinite`,
      spin: `pk-spin ${seconds}s linear infinite`,
      hue: `pk-hue ${seconds * 1.5}s linear infinite`
    }[paint.anim] ?? "";
    return { background, backgroundSize: paint.anim === "flow" ? "220% 220%" : "", animation };
  }
  function barCss(paint) {
    return `linear-gradient(90deg, ${byPosition(paint.stops).map((stop) => `${stop.c} ${stop.p}%`).join(", ")})`;
  }
  function paintBg(text) {
    return paintCss(text).background;
  }
  function paintSize(text) {
    return paintCss(text).backgroundSize || "auto";
  }
  function paintAnim(text) {
    return paintCss(text).animation || "none";
  }
  const PRESETS = {
    sunset: "linear 160 | #ff8a5b 0 | #f5583f 60 | #c0392b 100",
    grape: "linear 160 | #b06de8 0 | #7b5cf0 60 | #4b3bd6 100",
    ocean: "linear 160 | #4fd1c5 0 | #3182ce 70 | #2c5282 100",
    mint: "linear 160 | #a7f3d0 0 | #34d399 70 | #059669 100",
    peach: "linear 160 | #ffd9a0 0 | #ff9a8b 60 | #e0567f 100",
    night: "linear 160 | #3b3a52 0 | #1f1d2e 70 | #0f0e17 100",
    aurora: "linear 165 | #6B46F2 0 | #ff5ca8 60 | #ff9a5b 92 | #ffd0a8 100",
    dusk: "linear 170 | #241a5e 0 | #a84bc0 60 | #e06a8a 82 | #ff9a6b 100",
    reef: "linear 168 | #00d0b0 0 | #1ba0e0 38 | #2b6cff 70 | #6B46F2 100",
    blush: "linear 150 | #ffe0b0 0 | #ff9ec4 42 | #c86bff 100",
    citrus: "linear 135 | #ffe14d 0 | #ff8a3d 42 | #ff5a8a 100",
    berry: "linear 140 | #ff4d9d 0 | #a44bff 48 | #4b6bff 100",
    lime: "linear 140 | #bff24a 0 | #34d399 48 | #00b8c2 100"
  };
  function legacyPaint(grad, mode, dir, colour) {
    if (mode !== "custom" && PRESETS[grad]) return `${PRESETS[grad]} ~flow ${SPEEDS[1]}`;
    const base = isHex(colour) ? colour.toLowerCase() : FALLBACK;
    const light = mixHex(base, "#ffffff", 0.38);
    const dark = mixHex(base, "#000000", 0.22);
    if (dir === "radial") return `radial 0 | ${light} 0 | ${base} 62 | ${dark} 100`;
    return `linear ${dir === "up" ? 0 : 180} | ${light} 0 | ${base} 55 | ${dark} 100`;
  }
  return __toCommonJS(paint_exports);
})();

export default PAINT;
