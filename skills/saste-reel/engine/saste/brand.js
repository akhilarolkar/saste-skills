// Saste Pixels brand kit — every reusable visual piece of the @saste.pixels look.
// Served by the render tools at /saste/brand.js (engine root is the server root; the reel project is at /@film/).
// Everything is deterministic: draw functions take the time t and never keep state between frames.
//
//   import * as S from '/saste/brand.js';
//   const film = S.film({ DUR, EV, CAPS, scene, transitions, powerOff });
//
// Full API with examples: references/COMPONENTS.md in the saste-reel skill.

import { clamp, lerp, seg, ss, eo, ei, back, spring } from '/core/lib.js';
export { clamp, lerp, seg, ss, eo, ei, back, spring };
export const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

// ---------------------------------------------------------------- canvas & brand constants
export const W = 1080, H = 1920, FPS = 30;
export const CX = 540;          // content axis: true horizontal centre
export const DY = 40;           // scene content sits 40 px below geometric centre (optical centre with IG UI)
export const SAFE = { top: 220, bottom: 1536, left: 60, right: 918 };   // IG Reels UI: bottom 20 %, right 15 %
export const CAP_Y = 1470;      // caption line centre (screen space, not shifted by DY)
export const C = {
  bg: '#0F172A',      // Deep Midnight Slate — every background
  bg2: '#1E293B',     // card fill
  line: '#334155',    // dim grid / chart lines
  mute: '#94A3B8',    // secondary text
  text: '#F8FAFC',    // Warm Off-White — primary text
  yel: '#FACC15',     // Electric Pixel Yellow — primary accent, key words
  yelDark: '#A16207', // button drop-shadow
  red: '#FB7185',     // Retro Coral Red — secondary accent, errors, comedy
  redDark: '#E11D48',
  navy: '#101826',    // logo ink / panel fill
};
export const F = { sans: '"Jakarta"', mono: '"SpaceMono"', pix: '"Silk"' };
export const HANDLE = '@saste.pixels';

// ---------------------------------------------------------------- utilities
export const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
// deterministic hash in [0,1) of any numbers
export const h1 = (...a) => { let s = 0; for (const v of a) s = (s * 31 + Math.round(v * 1000)) | 0; return ((Math.sin(s * 12.9898) * 43758.5453) % 1 + 1) % 1; };
export const fr = t => Math.floor(t * FPS);           // frame index, for stepped jitter
export const beatBob = (t, t0, beat) => Math.abs(Math.sin((t - t0) * Math.PI / beat));   // 0..1 bounce on every beat
// true if t is inside any [h, h + d) window — for flickers on a list of hit times
export const hitAmt = (t, hits, d = 0.1) => hits.reduce((a, h) => a + (t >= h && t < h + d ? 1 : 0), 0);

// on-screen text registry (for readcheck.mjs; window.TEXTS)
let texts = [];
export const say = (id, text, x0, y0, x1, y1, pass) => texts.push({ id, text, x0: Math.round(x0), y0: Math.round(y0), x1: Math.round(x1), y1: Math.round(y1), ...(pass ? { pass: true } : {}) });

// ---------------------------------------------------------------- assets
export const A = { logo: null };
export async function loadBrand() {
  const faces = [
    new FontFace('Jakarta', 'url(/saste/assets/fonts/PlusJakartaSans.ttf)', { weight: '200 800' }),
    new FontFace('SpaceMono', 'url(/saste/assets/fonts/SpaceMono-Bold.ttf)', { weight: '700' }),
    new FontFace('Silk', 'url(/saste/assets/fonts/Silkscreen-Bold.ttf)', { weight: '700' }),
  ];
  for (const f of faces) document.fonts.add(await f.load());
  A.logo = new Image(); A.logo.src = '/saste/assets/logo_circle.png'; await A.logo.decode();
}
// load any extra project image (relative to the reel folder)
export async function loadImage(src) { const im = new Image(); im.src = src; await im.decode(); return im; }

// ---------------------------------------------------------------- background & frame furniture
// slate background + drifting 40 px pixel grid + twinkling cells; tint = coral flash amount (0..0.6)
export function bg(g, t, tint = 0) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  const s = 40, off = (t * 6) % s;
  g.fillStyle = 'rgba(148,163,184,0.06)';
  for (let x = -off; x < W; x += s) g.fillRect(Math.round(x), 0, 2, H);
  for (let y = -off; y < H; y += s) g.fillRect(0, Math.round(y), W, 2);
  const st = Math.floor(t * 6);
  for (let i = 0; i < 26; i++) {
    const cx = Math.floor(h1(i, 1) * 27), cy = Math.floor(h1(i, 2) * 48);
    if (h1(i, st) <= 0.6) continue;
    g.fillStyle = i % 5 === 0 ? 'rgba(250,204,21,0.10)' : i % 7 === 0 ? 'rgba(251,113,133,0.10)' : 'rgba(248,250,252,0.05)';
    g.fillRect(Math.round(cx * s - off) + 2, Math.round(cy * s - off) + 2, s - 2, s - 2);
  }
  if (tint) { g.fillStyle = `rgba(251,113,133,${tint})`; g.fillRect(0, 0, W, H); }
  g.restore();
}

// persistent watermark: 3×3 pixel icon + handle, top-left safe zone (60,170), 70 % opacity
export function watermark(g) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 0.7;
  const cols = [C.yel, C.text, C.red, C.text, C.yel, C.text, C.red, C.text, C.yel];
  for (let k = 0; k < 9; k++) { g.fillStyle = cols[k]; g.fillRect(60 + (k % 3) * 12, 170 + Math.floor(k / 3) * 12, 10, 10); }
  font(g, F.mono, 30, 700); g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = C.text;
  g.fillText(HANDLE, 108, 188);
  g.restore();
  say('wm', HANDLE, 60, 170, 348, 206, true);
}

// ---------------------------------------------------------------- drawing primitives
export function font(g, fam, px, w = 800) { g.font = `${w} ${px}px ${fam}`; }

// stepped-corner pixel panel (the brand's "box")
export function panel(g, x, y, w, h, fill, border, bw = 6, step = 12) {
  g.fillStyle = border;
  g.fillRect(x + step, y, w - 2 * step, h); g.fillRect(x, y + step, w, h - 2 * step);
  g.fillStyle = fill;
  g.fillRect(x + step, y + bw, w - 2 * step, h - 2 * bw); g.fillRect(x + bw, y + step, w - 2 * bw, h - 2 * step);
}

// text with a hard pixel drop-shadow; returns its width. Silkscreen (F.pix) only at multiples of 8 px.
export function stampText(g, str, x, y, px, fam, fill, shadow, d = 8, align = 'center', w = 800) {
  font(g, fam, px, w); g.textAlign = align; g.textBaseline = 'middle';
  if (shadow) { g.fillStyle = shadow; g.fillText(str, x + d, y + d); }
  g.fillStyle = fill; g.fillText(str, x, y);
  return g.measureText(str).width;
}

// grid painter: fn(i, j) → colour string or null. The basis of every pixel icon.
export function pix(g, x0, y0, n, m, cell, fn) {
  for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) {
    const c = fn(i, j); if (!c) continue;
    g.fillStyle = c; g.fillRect(Math.round(x0 + i * cell), Math.round(y0 + j * cell), Math.ceil(cell), Math.ceil(cell));
  }
}
// ASCII sprite: rows of chars, palette maps char → colour ('.' = empty)
export function sprite(g, x0, y0, cell, rows, palette) {
  pix(g, x0, y0, rows[0].length, rows.length, cell, (i, j) => palette[rows[j][i]] || null);
}

// ---------------------------------------------------------------- kinetic type
// STAMP: slams in at t0 (scale 1.7 → 1 with overshoot), optional out time. Yellow pixel type with coral shadow by default.
export function stampIn(g, t, t0, str, x, y, { px = 152, fam = F.pix, fill = C.yel, shadow = C.red, d = 10, out = null, rot = 0 } = {}) {
  if (t < t0) return 0;
  const o = out == null ? 0 : seg(t, out, out + 0.3);
  const k = lerp(1.7, 1, back(seg(t, t0, t0 + 0.14), 2.5)) * (1 - ei(o));
  if (k <= 0.01) return 0;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
  const w = stampText(g, str, 0, 0, px, fam, fill, shadow, d, 'center', 700);
  g.restore();
  if (!o) say('st_' + str, str, x - w / 2, y - px / 2, x + w / 2, y + px / 2);
  return w;
}
// BADGE: a tilted pixel panel with mono text that pops in (e.g. "BUDGET: ₹12", "₹0 VERSION")
export function badge(g, t, t0, str, x, y, { w = 400, h = 92, px = 46, fam = F.mono, fill = C.navy, border = C.text, color = C.text, rot = -0.07, out = null, sub = null, subPx = 32 } = {}) {
  if (t < t0) return;
  const o = out == null ? 0 : seg(t, out, out + 0.3);
  const k = lerp(1.8, 1, back(seg(t, t0, t0 + 0.16), 2.5)) * (1 - ei(o));
  if (k <= 0.01) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
  panel(g, -w / 2, -h / 2, w, h, fill, border, Math.max(5, Math.round(h / 18)), Math.round(h / 9));
  if (sub) { stampText(g, str, 0, -h * 0.14, px, fam, color, null, 0, 'center', 700); stampText(g, sub, 0, h * 0.26, subPx, F.pix, C.text, null, 0, 'center', 700); }
  else stampText(g, str, 0, 2, px, fam, color, null, 0, 'center', 700);
  g.restore();
  if (!o) say('bd_' + str, str + (sub ? ' ' + sub : ''), x - w / 2, y - h / 2, x + w / 2, y + h / 2);
}

// ---------------------------------------------------------------- the logo (mascot)
const lo = mk(128, 128), lgBuf = mk(1024, 1024);
export const LOGO_GRID = { x0: 156.9, y0: 151.0, step: 29.9 };   // the logo's own pixel grid, in 1024-space
export const LENS = { x: 567, y: 482, w: 170, h: 121 };          // red lens, in 1024-space

// logo centred at (x,y), diameter s. res < 1024 → mosaic (pixel-pop). holes = [[i,j],…] 2×2 grid blocks knocked out.
export function drawLogo(g, x, y, s, { res = 1024, rot = 0, sx = 1, sy = 1, holes = [] } = {}) {
  g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(rot); g.scale(sx, sy);
  if (res < 1024) {
    lo.width = lo.height = res;
    const l = lo.getContext('2d'); l.clearRect(0, 0, res, res); l.imageSmoothingEnabled = true; l.drawImage(A.logo, 0, 0, res, res);
    g.imageSmoothingEnabled = false; g.drawImage(lo, -s / 2, -s / 2, s, s); g.imageSmoothingEnabled = true;
  } else g.drawImage(A.logo, -s / 2, -s / 2, s, s);
  const k = s / 1024, { x0, y0, step } = LOGO_GRID;
  g.fillStyle = C.navy;
  for (const [i, j] of holes) g.fillRect((x0 + i * step - 512) * k, (y0 + j * step - 512) * k, 2 * step * k + 1, 2 * step * k + 1);
  g.restore();
}
// pixel-pop resolution after a landing at tLand: 24 → 48 → 96 → 256 → full over 0.24 s
export const popRes = (t, tLand) => { const d = t - tLand; return d < 0 ? 24 : d < 0.06 ? 24 : d < 0.12 ? 48 : d < 0.18 ? 96 : d < 0.24 ? 256 : 1024; };
// spring-drop: logo falls from above to (x,y) between t0 and tLand, then squashes and settles.
export function logoDrop(t, t0, tLand, x, y, s) {
  if (t < tLand) return { x, y: lerp(-400, y, ei(seg(t, t0, tLand))), s, sx: 0.9, sy: 1.12, res: 24, rot: 0 };
  const d = t - tLand, sq = Math.exp(-d * 9) * Math.cos(d * 38);
  return { x, y: y + 30 * sq, s, sx: 1 + 0.16 * sq, sy: 1 - 0.16 * sq, res: popRes(t, tLand), rot: 0 };
}
// landing dust puffs (pixel squares fanning out) under a logo of diameter s at (x,y)
export function landingDust(g, t, tLand, x, y, s) {
  if (t <= tLand || t >= tLand + 0.5) return;
  const p = seg(t, tLand, tLand + 0.5);
  for (let i = 0; i < 10; i++) {
    const a = Math.PI + (i / 9) * Math.PI, r = s * 0.44 + s * 0.3 * eo(p);
    g.fillStyle = i % 2 ? C.yel : C.text; const sz = Math.round(18 * (1 - p));
    if (sz > 2) g.fillRect(Math.round((x + Math.cos(a) * r) / 6) * 6, Math.round((y + s * 0.46 - Math.abs(Math.sin(a)) * 60 * p) / 6) * 6, sz, sz);
  }
}
// small shake for a nervous / "warna…" beat
export const shake = (t, amt = 1) => { const f = fr(t); return { dx: (h1(f, 1) - 0.5) * 16 * amt, dy: (h1(f, 2) - 0.5) * 10 * amt, rot: (h1(f, 3) - 0.5) * 0.04 * amt }; };

// glitch flicker on the red lens (amt 0..1). Use with hitAmt(t, [times]).
export function lensGlitch(g, x, y, s, t, amt) {
  if (amt <= 0) return;
  const k = s / 1024, f = fr(t);
  for (let n = 0; n < 5; n++) {
    const yy = LENS.y + h1(f, n) * LENS.h, hh = 6 + h1(n, f) * 26, dx = (h1(f, n, 3) - 0.5) * 120 * amt;
    g.fillStyle = n % 2 ? 'rgba(251,113,133,0.95)' : 'rgba(248,250,252,0.85)';
    g.fillRect(x + (LENS.x - 512 + dx) * k, y + (yy - 512) * k, LENS.w * k, hh * k);
  }
  g.fillStyle = 'rgba(250,204,21,0.8)';
  g.fillRect(x + (540 - 512 + (h1(f, 9) - 0.5) * 80) * k, y + (540 - 512) * k, 40 * k, 8 * k);
}

// logo breaks into 32×32 cells that vanish in random order (each flashes white as it goes); p 0..1
export function logoDissolve(g, x, y, s, p, rot = 0) {
  if (p >= 1) return;
  if (p <= 0) { drawLogo(g, x, y, s, { rot }); return; }
  const lg = lgBuf.getContext('2d'), n = 32, cs = 1024 / n;
  const r = (i, j) => h1(i, j, 5) * 0.85 + (Math.abs(i - 16) + Math.abs(j - 16)) / 32 * 0.15;
  lg.globalCompositeOperation = 'source-over'; lg.clearRect(0, 0, 1024, 1024); lg.drawImage(A.logo, 0, 0, 1024, 1024);
  lg.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (r(i, j) < p) lg.fillRect(i * cs, j * cs, cs, cs);
  lg.globalCompositeOperation = 'source-over'; lg.fillStyle = C.text;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const v = r(i, j); if (v >= p && v < p + 0.04) lg.fillRect(i * cs, j * cs, cs, cs); }
  g.save(); g.translate(x, y); g.rotate(rot); g.imageSmoothingEnabled = false;
  g.drawImage(lgBuf, -s / 2, -s / 2, s, s); g.imageSmoothingEnabled = true; g.restore();
}

// the "₹0 version" mascot: wobbly MS-Paint stick figure that boils at 8 fps. wave = time the right arm starts waving.
export function doodle(g, x, y, s, t, { wave = Infinity, color = C.text, lens = C.red } = {}) {
  const st = Math.floor(t * 8), j = n => (h1(st, n) - 0.5) * s * 0.012;
  const wob = pts => { g.beginPath(); pts.forEach(([px, py], n) => { const X = x + px * s + j(n * 2 + 1), Y = y + py * s + j(n * 2 + 2); n ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.stroke(); };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = color; g.lineWidth = Math.max(6, s * 0.018);
  const pts = [];
  for (let k = 0; k <= 14; k++) { const a = k / 14 * Math.PI * 2; pts.push([Math.cos(a) * 0.17 * (1 + 0.06 * Math.sin(k * 2.3)), -0.25 + Math.sin(a) * 0.17 * 0.95]); }
  wob(pts);
  wob([[-0.15, -0.36], [-0.1, -0.44], [-0.05, -0.37], [0, -0.46], [0.05, -0.37], [0.1, -0.44], [0.15, -0.35]]);
  wob([[-0.13, -0.28], [-0.02, -0.28], [-0.02, -0.21], [-0.13, -0.21], [-0.13, -0.28]]);
  g.fillStyle = lens; g.fillRect(x + 0.025 * s + j(40), y - 0.28 * s + j(41), 0.11 * s, 0.07 * s);
  wob([[0.02, -0.28], [0.135, -0.28], [0.135, -0.21], [0.02, -0.21], [0.02, -0.28]]);
  wob([[-0.02, -0.25], [0.02, -0.25]]);
  wob([[-0.06, -0.14], [0, -0.12], [0.06, -0.15]]);
  wob([[0, -0.08], [0.005, 0.2]]);
  const wv = t >= wave ? Math.sin((t - wave) * 16) * 0.06 : 0;
  wob([[0, 0], [-0.17, 0.09]]);
  wob([[0, 0], [0.13, -0.07], [0.2 + wv, -0.17]]);
  wob([[0.005, 0.2], [-0.1, 0.38]]); wob([[0.005, 0.2], [0.11, 0.38]]);
  g.restore();
}

// ---------------------------------------------------------------- pixel icons (20×20 grids; cell px each)
export function radarIcon(g, x0, y0, cell, t) {
  const n = 20, c = 9.5, a = t * 3.2;
  pix(g, x0, y0, n, n, cell, (i, j) => {
    const dx = i - c, dy = j - c, d = Math.hypot(dx, dy);
    if (d > 9.6) return null;
    for (const r of [3, 6, 9]) if (Math.abs(d - r) < 0.5) return C.line;
    if (i === 10 || j === 10) return C.line;
    let ang = Math.atan2(dy, dx) - a; ang = ((ang % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (ang > 2 * Math.PI - 0.9) return ang > 2 * Math.PI - 0.25 ? C.yel : 'rgba(250,204,21,0.35)';
    return null;
  });
  for (const [bi, bj] of [[5, 6], [14, 7], [12, 14]]) {
    let ang = Math.atan2(bj - 9.5, bi - 9.5) - a; ang = ((ang % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (2 * Math.PI - ang < 1.6 || ang < 0.2) { g.fillStyle = C.red; g.fillRect(x0 + bi * cell, y0 + bj * cell, cell, cell); }
  }
  const mx = 9 + Math.cos(t * 1.7) * 4, my = 8 + Math.sin(t * 2.3) * 3;
  pix(g, x0, y0, n + 4, n + 4, cell, (i, j) => {
    const d = Math.hypot(i - mx, j - my);
    if (Math.abs(d - 4.2) < 0.55) return C.text;
    if (d < 3.7) return 'rgba(248,250,252,0.14)';
    const u = i - mx, v = j - my;
    if (u > 2.6 && v > 2.6 && Math.abs(u - v) < 0.8 && u < 7) return C.yel;
    return null;
  });
}
export function bulbIcon(g, x0, y0, cell, t) {
  const st = Math.floor(t * 8);
  pix(g, x0, y0, 20, 20, cell, (i, j) => {
    const d = Math.hypot(i - 9.5, j - 8);
    if (j <= 13 && d < 6) {
      if (j >= 6 && j <= 10 && ((i === 7 || i === 12) && j > 7 || (j === 8 && (i === 8 || i === 11)) || (j === 7 && (i === 9 || i === 10)))) return C.red;
      if (d < 4 && i < 9 && j < 7 && (i + j) % 3 === 0) return C.text;
      return d > 5.2 ? '#EAB308' : C.yel;
    }
    if (j >= 14 && j <= 17 && i >= 7 && i <= 12) return j % 2 ? C.mute : C.text;
    if (j === 18 && i >= 8 && i <= 11) return C.mute;
    const a = Math.atan2(j - 8, i - 9.5), dd = Math.hypot(i - 9.5, j - 8);
    if (dd > 7.2 && dd < 9.6 && j < 15)
      for (let k = 0; k < 8; k++) {
        const ra = -Math.PI + k * Math.PI / 4;
        if (Math.abs(((a - ra + 3 * Math.PI) % (2 * Math.PI)) - Math.PI) < 0.13 && (st + k) % 3 !== 0) return k % 2 ? C.yel : C.text;
      }
    return null;
  });
}
export function laughIcon(g, x0, y0, cell, t) {
  const open = Math.floor(t * 10) % 2;
  pix(g, x0, y0, 20, 20, cell, (i, j) => {
    const d = Math.hypot(i - 9.5, j - 9.5);
    if (d > 9) return null;
    if (d > 8.1) return C.redDark;
    for (const ex of [6, 13]) if ((j === 6 && Math.abs(i - ex) === 1) || (j === 5 && i === ex)) return C.navy;
    const my = 11, mh = open ? 5 : 4;
    if (j >= my && j < my + mh && Math.abs(i - 9.5) < 5.5 - (j - my) * (open ? 0.7 : 0.9)) return j >= my + mh - 2 && Math.abs(i - 9.5) < 2.5 ? C.text : C.navy;
    if ((j === 8 || (j === 9 && open)) && (i === 3 || i === 16)) return 'rgba(248,250,252,0.6)';
    return C.red;
  });
}
export const ICONS = { radar: radarIcon, bulb: bulbIcon, laugh: laughIcon };

// ---------------------------------------------------------------- cards
// c = { icon: fn | ICONS key, lines: ['LINE 1','LINE 2'], col, border, tag (time the tag stamps in), haha?: bool }
export function card(g, c, x, y, t, scale = 1, showTag = true) {
  const icon = typeof c.icon === 'string' ? ICONS[c.icon] : c.icon;
  const w = 640, h = 640;
  g.save(); g.translate(x, y); g.scale(scale, scale);
  panel(g, -w / 2, -h / 2, w, h, C.bg2, c.border || c.col, 8, 16);
  const cell = 18, wob = c.haha || icon === laughIcon ? (Math.floor(t * 12) % 2 ? 0.06 : -0.06) : 0;
  g.save(); g.translate(0, -90); g.rotate(wob); icon(g, -cell * 10, -cell * 10, cell, t); g.restore();
  if ((c.haha || icon === laughIcon) && t > (c.tag ?? 0)) {
    const st = Math.floor(t * 6);
    font(g, F.pix, 40, 700); g.textAlign = 'center'; g.fillStyle = C.yel;
    if (st % 2) g.fillText('HA', -230, -230); else g.fillText('HA', 230, -200);
    if (st % 3 === 0) g.fillText('HA!', 200, 40);
  }
  if (showTag && t >= (c.tag ?? 0)) {
    const k = back(seg(t, c.tag ?? 0, (c.tag ?? 0) + 0.14), 2.6);
    const L = c.lines.length === 1 ? ['', c.lines[0]] : c.lines;
    g.save(); g.translate(0, 205); g.scale(k, k);
    const px = Math.max(...L.map(s => s.length)) > 10 ? 48 : 64;
    if (L[0]) stampText(g, L[0], 0, -34, px, F.pix, c.col, C.navy, 6, 'center', 700);
    stampText(g, L[1], 0, L[0] ? 34 : 0, px, F.pix, c.col, C.navy, 6, 'center', 700);
    g.restore();
  }
  g.restore();
}
// rapid card montage: cards = [{…card, t: enter time, tag}], each whips in from the right and out to the left
export function cardMontage(g, t, cards, y = 1000) {
  for (let k = 0; k < cards.length; k++) {
    const c = cards[k], nx = cards[k + 1];
    if (t < c.t - 0.02) continue;
    if (nx && t > nx.t + 0.25) continue;
    let x = CX + (1 - back(seg(t, c.t - 0.02, c.t + 0.22), 1.4)) * 900;
    if (nx) x -= ei(seg(t, nx.t - 0.04, nx.t + 0.16)) * 1100;
    card(g, c, x, y, t);
    if (t >= (c.tag ?? 0) && (!nx || t < nx.t - 0.04)) say('card' + k, c.lines.join(' '), CX - 300, y + 140, CX + 300, y + 270);
  }
}
// recap row: up to 3 mini cards snap into a row at t0; out = time they drop away
export function cardRow(g, t, cards, t0, { y = 1010, beat = 0.469, out = null } = {}) {
  const p = clamp(back(seg(t, t0, t0 + 0.3), 1.6));
  const o = out == null ? 0 : ei(seg(t, out, out + 0.35));
  const n = cards.length;
  cards.forEach((c, k) => {
    const off = k - (n - 1) / 2;
    const sc = lerp(k === n - 1 ? 1 : 0.2, 0.34, p);
    const x = lerp(k === n - 1 ? CX : CX + off * 600, CX + off * 240, p);
    card(g, c, x, y + o * 1100 - (Math.floor((t - t0) / beat + k) % 2 ? 8 : 0), t, sc, false);
  });
}

// ---------------------------------------------------------------- fake loading bar (hook)
// progress p 0..99, colour switches to coral on err
export function loadingBar(g, p, err, { x = CX - 350, y = 900, w = 700, h = 74 } = {}) {
  const col = err ? C.red : C.yel;
  g.fillStyle = C.text; g.fillRect(x - 8, y - 8, w + 16, h + 16); g.fillStyle = C.bg; g.fillRect(x, y, w, h);
  const nseg = 25, sw = (w - 12) / nseg, filled = Math.floor(nseg * p / 100);
  for (let i = 0; i < filled; i++) { g.fillStyle = col; g.fillRect(x + 6 + i * sw, y + 6, sw - 6, h - 12); }
  stampText(g, `${p}%`, x + w / 2, y + h + 76, 84, F.mono, col, null, 0, 'center', 700);
}
export const loadProgress = (t, t0, t1) => t <= t0 ? 0 : Math.min(99, Math.floor(99 * (1 - Math.pow(1 - seg(t, t0, t1), 2.2))));

// ERROR panel with chromatic ghosts (pops at t0, shakes)
export function errorPanel(g, t, t0, line1, line2, x = CX, y = 1220) {
  if (t < t0) return;
  const k = back(seg(t, t0, t0 + 0.08), 2.2), jx = (h1(fr(t), 5) - 0.5) * 20;
  g.save(); g.translate(x + jx, y); g.scale(k, k);
  panel(g, -390, -120, 780, 240, C.navy, C.red, 8, 16);
  for (const [dx, c] of [[-8, 'rgba(250,204,21,0.8)'], [8, 'rgba(56,189,248,0.6)']]) {
    font(g, F.mono, 66, 700); g.fillStyle = c; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (h1(fr(t), dx) > 0.35) g.fillText(line1, dx, -48);
  }
  stampText(g, line1, 0, -48, 66, F.mono, C.red, null, 0, 'center', 700);
  stampText(g, line2, 0, 44, 56, F.mono, C.text, null, 0, 'center', 700);
  g.restore();
  say('err', line1 + ' ' + line2, x - 390, y - 120, x + 390, y + 120);
}

// horizontal slice displacement of whatever is on the canvas (glitch). amt 0..1
const bufS = mk();
export function sliceGlitch(g, t, amt) {
  if (amt <= 0) return;
  const f = fr(t);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const b = bufS.getContext('2d'); b.clearRect(0, 0, W, H); b.drawImage(g.canvas, 0, 0);
  for (let n = 0; n < 7; n++) {
    if (h1(f, n) > 0.7) continue;
    const y = Math.floor(h1(n, f) * H), hh = 10 + Math.floor(h1(f, n, 2) * 70), dx = (h1(f, n, 4) - 0.5) * 160 * amt;
    g.drawImage(bufS, 0, y, W, hh, dx, y, W, hh);
  }
  g.restore();
}

// ---------------------------------------------------------------- CTA: follow button, cursor
// button rises at tIn, gets clicked at tClick (press, white flash, coral ✓ badge, pixel burst, "+1")
export function followButton(g, t, tIn, tClick, { y = 1220, label = 'FOLLOW', handle = HANDLE } = {}) {
  if (t < tIn) return;
  const p = back(seg(t, tIn, tIn + 0.3), 1.8);
  const pressed = t >= tClick && t < tClick + 0.16, clicked = t >= tClick;
  const by = lerp(1700, y, clamp(p)) + (pressed ? 10 : 0), bw = 700, bh = 140;
  g.save(); g.translate(CX, by);
  if (!pressed) { g.fillStyle = C.yelDark; g.fillRect(-bw / 2 + 12, -bh / 2 + 12, bw, bh); }
  panel(g, -bw / 2, -bh / 2, bw, bh, clicked && t < tClick + 0.12 ? C.text : C.yel, C.navy, 6, 12);
  stampText(g, label, 0, -26, 56, F.mono, C.navy, null, 0, 'center', 700);
  stampText(g, handle, 0, 30, 44, F.mono, C.navy, null, 0, 'center', 700);
  if (clicked) {
    const q = back(seg(t, tClick + 0.05, tClick + 0.25), 2.5);
    g.save(); g.translate(bw / 2 - 20, -bh / 2 + 10); g.scale(q, q);
    g.fillStyle = C.red; g.fillRect(-34, -34, 68, 68);
    const tick = [[1, 4], [2, 5], [3, 6], [4, 5], [5, 4], [6, 3], [7, 2], [2, 4], [3, 5], [4, 4], [5, 3], [6, 2]];
    pix(g, -24, -24, 8, 8, 6, (i, j) => tick.some(([a, b]) => a === i && b === j) ? C.text : null);
    g.restore();
  }
  g.restore();
  if (p > 0.95) say('follow', label + ' ' + handle, CX - bw / 2, by - bh / 2, CX + bw / 2, by + bh / 2);
  if (clicked && t < tClick + 0.4) {
    const q = eo(seg(t, tClick, tClick + 0.4));
    for (let n = 0; n < 12; n++) {
      const a = n / 12 * Math.PI * 2, r = 60 + 140 * q, s = Math.round(14 * (1 - q)) + 2;
      g.fillStyle = n % 2 ? C.yel : C.text;
      g.fillRect(Math.round(CX + 70 + Math.cos(a) * r), Math.round(by + 10 + Math.sin(a) * r * 0.7), s, s);
    }
  }
  if (clicked && t < tClick + 1.2) {
    const q = seg(t, tClick + 0.1, tClick + 1.2);
    g.globalAlpha = 1 - ei(q);
    stampText(g, '+1', CX + 260, by - 110 - 90 * eo(q), 48, F.pix, C.yel, C.red, 5, 'center', 700);
    g.globalAlpha = 1;
  }
}
const CURSOR = ['X...........', 'XX..........', 'XWX.........', 'XWWX........', 'XWWWX.......', 'XWWWWX......', 'XWWWWWX.....', 'XWWWWWWX....', 'XWWWWWWWX...', 'XWWWWWXXXX..', 'XWWXWWX.....', 'XWX.XWWX....', 'XX..XWWX....', 'X....XWWX...', '.....XWWX...', '......XX....'];
// pixel arrow cursor travelling from→to between t0 and t1 (arc), clicking at tClick, drifting away after
export function cursor(g, t, t0, t1, tClick, { from = [880, 1720], to = [CX + 70, 1250], away = [860, 1500] } = {}) {
  if (t < t0 - 0.1) return;
  const p = eio(seg(t, t0, t1));
  let x = lerp(from[0], to[0], p), y = lerp(from[1], to[1], p) - Math.sin(p * Math.PI) * 120;
  if (t > tClick + 0.6) { const q = eio(seg(t, tClick + 0.6, tClick + 1.4)); x = lerp(x, away[0], q); y = lerp(y, away[1], q); }
  const cell = 6 * (t >= tClick - 0.03 && t < tClick + 0.12 ? 0.82 : 1);
  sprite(g, x + 6, y + 6, cell, CURSOR, { X: 'rgba(15,23,42,0.6)', W: 'rgba(15,23,42,0.6)' });
  sprite(g, x, y, cell, CURSOR, { X: C.navy, W: C.text });
}

// ---------------------------------------------------------------- captions
// CAPS = [{t0, t1, text, w:[word onset times], k:[indices of key words → yellow]}]
// karaoke: unspoken words at 45 %, the word being said lifts 6 px. Screen space, centred, above the IG bottom zone.
export function captions(g, t, CAPS) {
  const c = CAPS.find(c => t >= c.t0 && t < c.t1);
  if (!c) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const words = c.text.split(' ');
  font(g, F.sans, 58, 800);
  const maxW = 770, space = g.measureText(' ').width, lh = 72;
  const lines = [[]]; let lw = 0;
  words.forEach((w, i) => { const ww = g.measureText(w).width; if (lw + ww > maxW && lines.at(-1).length) { lines.push([]); lw = 0; } lines.at(-1).push(i); lw += ww + space; });
  const y0 = CAP_Y - (lines.length - 1) * lh / 2;
  const pop = lerp(0.85, 1, back(seg(t, c.t0, c.t0 + 0.12), 2));
  g.translate(CX, CAP_Y); g.scale(pop, pop); g.translate(-CX, -CAP_Y);
  g.textBaseline = 'middle'; g.textAlign = 'left'; g.lineJoin = 'round';
  let bx0 = 1e9, bx1 = -1e9;
  lines.forEach((ln, li) => {
    const widths = ln.map(i => g.measureText(words[i]).width);
    const tw = widths.reduce((a, b) => a + b, 0) + space * (ln.length - 1);
    let x = CX - tw / 2; bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x + tw);
    ln.forEach((i, n) => {
      const w = c.w || [];
      const spoken = i >= w.length || w[i] <= t + 0.02;
      const y = y0 + li * lh, lift = (w[i] !== undefined && t >= w[i] && t < w[i] + 0.1) ? -6 : 0;
      g.strokeStyle = C.bg; g.lineWidth = 14; g.strokeText(words[i], x, y + lift);
      g.fillStyle = (c.k || []).includes(i) ? C.yel : C.text; g.globalAlpha = spoken ? 1 : 0.45;
      g.fillText(words[i], x, y + lift); g.globalAlpha = 1;
      x += widths[n] + space;
    });
  });
  g.restore();
  say('cap', c.text, bx0, y0 - lh / 2, bx1, y0 + (lines.length - 0.5) * lh, true);
}

// ---------------------------------------------------------------- the film runner
// scene(g, t): draws the content for time t (bg included; content is auto-shifted by DY).
// transitions: [{ t0, t1, from: sceneFn, to: sceneFn, type: 'tear' }]  — screen-tear between two scenes
// powerOff: { t0, t1 } — retro CRT power-down at the end (frame → line → dot → black)
export function film({ DUR, EV = [], CAPS = [], scene, transitions = [], powerOff = null, onReady = null }) {
  const cv = document.getElementById('c'), ctx = cv.getContext('2d');
  const bufA = mk(), bufB = mk();
  const shifted = (g, fn) => { g.save(); g.translate(0, DY); fn(); g.restore(); };
  function frame(g, t, fn = scene) { shifted(g, () => fn(g, t)); captions(g, t, CAPS); watermark(g); }
  function render(t) {
    texts = [];
    ctx.imageSmoothingEnabled = true;
    const tr = transitions.find(x => t >= x.t0 && t < x.t1);
    if (powerOff && t >= powerOff.t0) {
      const f = bufA.getContext('2d'); frame(f, t);
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      const o = powerOff.t0, p1 = ei(seg(t, o, o + 0.22)), p2 = ei(seg(t, o + 0.22, o + 0.42)), p3 = seg(t, o + 0.42, powerOff.t1);
      if (p3 < 1) {
        ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(Math.max(0.01, 1 - p2), Math.max(0.006, 1 - p1));
        ctx.drawImage(bufA, -W / 2, -H / 2);
        if (p1 > 0.5) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(248,250,252,${0.6 * p1})`; ctx.fillRect(-W / 2, -H / 2, W, H); ctx.globalCompositeOperation = 'source-over'; }
        ctx.restore();
        if (p2 >= 1) { const r = 10 * (1 - p3); ctx.fillStyle = C.text; ctx.fillRect(W / 2 - r, H / 2 - r, 2 * r, 2 * r); }
      }
      texts = []; return;
    }
    if (tr) {
      const a = bufA.getContext('2d'), b = bufB.getContext('2d');
      shifted(a, () => tr.from(a, t)); const keep = texts; shifted(b, () => tr.to(b, t)); texts = keep;
      const p = seg(t, tr.t0, tr.t1), band = 64;
      for (let y = 0, n = 0; y < H; y += band, n++) {
        const useB = h1(n, 11) < p * 1.25 - 0.1, dx = (h1(n, fr(t)) - 0.5) * 300 * Math.sin(p * Math.PI);
        ctx.drawImage(useB ? bufB : bufA, 0, y, W, band, dx, y, W, band);
        if (Math.abs(dx) > 1) ctx.drawImage(useB ? bufB : bufA, 0, y, W, band, dx - Math.sign(dx) * W, y, W, band);
      }
      ctx.fillStyle = 'rgba(251,113,133,0.25)'; ctx.fillRect(0, Math.floor(h1(fr(t), 3) * H), W, 12);
      captions(ctx, t, CAPS); watermark(ctx);
      return;
    }
    frame(ctx, t);
  }
  window.DUR = DUR; window.EV = EV; window.render = render;
  window.TEXTS = t => { render(t); return texts; };
  (async () => { await loadBrand(); if (onReady) await onReady(); render(0); window.READY = true; })();
  return { render };
}
