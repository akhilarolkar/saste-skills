// Saste Pixels — channel intro, built on the brand kit (/saste/brand.js). Reference example for the saste-reel skill.
import * as S from '/saste/brand.js';
import { DUR, BEAT, T, CAPS, LENS, events } from './timeline.js';
const { C, F, CX, seg, lerp, eo, ei, eio, back } = S;

// ---------- the mascot's path through the whole film ----------
function logoState(t) {
  if (t < T.shrink0) {
    const L = S.logoDrop(t, T.drop, T.land, CX, 700, 540);
    if (t >= T.land) L.y += Math.sin((t - T.land) * Math.PI * 2 / (BEAT * 2)) * 6;
    return L;
  }
  if (t < T.push0) {                                    // small mascot bobbing on the beat
    const p = eo(seg(t, T.shrink0, T.shrink1)), b = S.beatBob(t, T.shrink0, BEAT);
    return { x: CX, y: lerp(700, 470, p) - 22 * b * p, s: lerp(540, 250, p), rot: Math.sin((t - T.shrink0) * Math.PI / BEAT) * 0.06 * p };
  }
  const p = eio(seg(t, T.push0, T.push1));             // push in for the CTA
  const L = { x: CX, y: lerp(470, 720, p) - 22 * S.beatBob(t, T.shrink0, BEAT) * (1 - p), s: lerp(250, 600, p), rot: 0 };
  if ((t > T.warna && t < T.warna + 0.45) || (t > T.video && t < T.video + 0.3)) { const k = S.shake(t); L.x += k.dx; L.y += k.dy; L.rot = k.rot; }
  else L.y += Math.sin((t - T.push1) * Math.PI * 2 / (BEAT * 4)) * 8 * p;
  return L;
}

// ---------- 1: fake-out hook ----------
function hook(g, t) {
  const err = t >= T.error;
  S.bg(g, t, err ? 0.6 * (1 - seg(t, T.error, T.error + 0.25)) + 0.12 : 0);
  const sh = err ? 1 - 0.5 * seg(t, T.error, T.tear0) : 0, f = S.fr(t);
  g.save(); g.translate((S.h1(f, 1) - 0.5) * 36 * sh, (S.h1(f, 2) - 0.5) * 22 * sh);
  g.globalAlpha = eo(seg(t, 0, 0.35));
  S.stampText(g, 'HOLLYWOOD', CX, 560, 118, F.sans, err ? C.red : C.text, null, 0, 'center', 800);
  S.stampText(g, 'VFX STUDIO', CX, 680, 74, F.sans, C.mute, null, 0, 'center', 800);
  S.font(g, F.mono, 28, 700); g.fillStyle = C.mute; g.textAlign = 'center'; g.fillText('PREMIUM CINEMATIC RENDER ENGINE™', CX, 760);
  S.say('t1', 'HOLLYWOOD VFX STUDIO', CX - 340, 500, CX + 340, 720);
  g.globalAlpha = 1;
  const p = S.loadProgress(t, T.loadStart, T.load99);
  S.loadingBar(g, p, err);
  if (!err) {
    const st = ['rendering explosions...', 'calling Tom-level star...', 'booking 400 drones...', 'loading budget...'][Math.min(3, Math.floor(p / 26))];
    S.font(g, F.mono, 30, 700); g.fillStyle = C.mute; g.textAlign = 'center'; g.fillText(st, CX, 1140); S.say('st', st, CX - 300, 1120, CX + 300, 1160, true);
  }
  g.restore();
  if (err) { S.errorPanel(g, t, T.error, 'ERROR:', '₹0 BUDGET FOUND'); S.sliceGlitch(g, t, 0.6 * sh); }
}

// ---------- 2: logo reveal ----------
function reveal(g, t) {
  S.bg(g, t);
  if (t >= T.drop) {
    const L = logoState(t);
    S.landingDust(g, t, T.land, CX, 700, 540);
    S.drawLogo(g, L.x, L.y, L.s, L);
    S.lensGlitch(g, L.x, L.y, L.s, t, S.hitAmt(t, LENS));
  }
  const out = T.shrink0;
  S.stampIn(g, t, T.saste, 'SASTE', CX, 1110, { out });
  S.stampIn(g, t, T.pixels, 'PIXELS', CX, 1250, { out });
  S.badge(g, t, T.badge, 'BUDGET: ₹12', CX + 120, 1380, { out });
}

// ---------- 3: three pillars ----------
const CARDS = [
  { t: T.card1, tag: T.tag1, icon: 'radar', lines: ['FULL', 'POST-MORTEM'], col: C.yel },
  { t: T.card2, tag: T.tag2, icon: 'bulb', lines: ['DIMAAG HILANE', 'WALA GYAN'], col: C.text },
  { t: T.card3, tag: T.tag3, icon: 'laugh', lines: ['FULL-ON', 'BAKC**DI'], col: C.red },
];
function pillars(g, t) {
  S.bg(g, t);
  if (t < T.recap) S.cardMontage(g, t, CARDS, 1000);
  else {
    S.cardRow(g, t, CARDS, T.recap, { beat: BEAT, out: T.push0 });
    if (t < T.push0) S.badge(g, t, T.zero, '₹0 BUDGET', CX, 1260, { w: 660, h: 132, px: 52, border: C.red, color: C.yel, rot: -0.06, sub: 'ANIMATION' });
  }
  const L = logoState(t); S.drawLogo(g, L.x, L.y, L.s, L);
}

// ---------- 4: CTA ----------
function cta(g, t) {
  S.bg(g, t);
  const L = logoState(t), p = seg(t, T.morph0, T.morph1);
  if (p > 0) S.doodle(g, L.x, L.y, L.s, t, { wave: T.wave });
  S.logoDissolve(g, L.x, L.y, L.s, p, L.rot);
  if (p < 1 && S.hitAmt(t, [T.warna, T.video], 0.12)) S.lensGlitch(g, L.x, L.y, L.s, t, 1);
  S.badge(g, t, T.v0, '₹0 VERSION', CX + 190, L.y - L.s * 0.42, { w: 300, h: 80, px: 38, border: C.red, color: C.yel, rot: 0.1 });
  S.followButton(g, t, T.button, T.click);
  S.cursor(g, t, T.cur0, T.cur1, T.click);
}

function scene(g, t) {
  if (t < T.tear1) hook(g, t);
  else if (t < T.shrink0 + 0.3) reveal(g, t);
  else if (t < T.push0 + 0.35) pillars(g, t);
  else cta(g, t);
}

S.film({
  DUR, EV: events(), CAPS, scene,
  transitions: [{ t0: T.tear0, t1: T.tear1, from: hook, to: reveal }],
  powerOff: { t0: T.off0, t1: T.off1 },
});
