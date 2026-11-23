// @saste.pixels reel — scenes for this topic, built on the brand kit.
// Skeleton: 1 hook → (tear) → 2 mascot + title → 3 content → 4 CTA → power-down. Replace the TODOs with the topic;
// keep the brand moves (see references/BRAND.md §7). Reference: examples/saste-pixels-intro/main.js.
import * as S from '/saste/brand.js';
import { DUR, BEAT, T, CAPS, LENS, events } from './timeline.js';
const { C, F, CX, seg, lerp, eo, ei, eio, back } = S;

// ---------- the mascot's path (drop → small bobbing mascot → push-in for the CTA)
function logoState(t) {
  if (t < T.shrink0) return S.logoDrop(t, T.drop, T.land, CX, 700, 540);
  if (t < T.push0) {
    const p = eo(seg(t, T.shrink0, T.shrink1));
    return { x: CX, y: lerp(700, 470, p) - 22 * S.beatBob(t, T.shrink0, BEAT) * p, s: lerp(540, 250, p), rot: 0 };
  }
  const p = eio(seg(t, T.push0, T.push1));
  return { x: CX, y: lerp(470, 720, p), s: lerp(250, 600, p), rot: 0 };
}

// ---------- 1: hook — TODO: make it about the topic (a fake "premium" thing that crashes on ₹0 works every time)
function hook(g, t) {
  const err = t >= T.error;
  S.bg(g, t, err ? 0.6 * (1 - seg(t, T.error, T.error + 0.25)) + 0.12 : 0);
  S.stampText(g, 'TODO HOOK', CX, 600, 110, F.sans, err ? C.red : C.text, null, 0, 'center', 800);
  S.loadingBar(g, S.loadProgress(t, T.hookIn, T.error - 0.4), err);
  if (err) { S.errorPanel(g, t, T.error, 'ERROR:', '₹0 BUDGET FOUND'); S.sliceGlitch(g, t, 0.5); }
}

// ---------- 2: mascot + title — TODO: the reel's title in 1–2 stamped words + a joke badge
function title(g, t) {
  S.bg(g, t);
  if (t >= T.drop) {
    const L = logoState(t);
    S.landingDust(g, t, T.land, CX, 700, 540);
    S.drawLogo(g, L.x, L.y, L.s, L);
    S.lensGlitch(g, L.x, L.y, L.s, t, S.hitAmt(t, LENS));
  }
  S.stampIn(g, t, T.title, 'TITLE', CX, 1150, { out: T.shrink0 });
  S.badge(g, t, T.badge, 'BUDGET: ₹0', CX + 120, 1320, { out: T.shrink0 });
}

// ---------- 3: content — TODO: topic icons (pix()/sprite()), cards, set pieces
const CARDS = [
  { t: T.card1, tag: T.tag1, icon: 'radar', lines: ['POINT', 'ONE'], col: C.yel },
  { t: T.card2, tag: T.tag2, icon: 'bulb', lines: ['POINT', 'TWO'], col: C.text },
  { t: T.card3, tag: T.tag3, icon: 'laugh', lines: ['POINT', 'THREE'], col: C.red },
];
function content(g, t) {
  S.bg(g, t);
  if (t < T.recap) S.cardMontage(g, t, CARDS, 1000);
  else S.cardRow(g, t, CARDS, T.recap, { beat: BEAT, out: T.push0 });
  const L = logoState(t); S.drawLogo(g, L.x, L.y, L.s, L);
}

// ---------- 4: CTA — follow button + cursor click, then the ₹0 punchline, then power-down
function cta(g, t) {
  S.bg(g, t);
  const L = logoState(t), p = seg(t, T.morph0, T.morph1);
  if (p > 0) S.doodle(g, L.x, L.y, L.s, t, { wave: T.wave });
  S.logoDissolve(g, L.x, L.y, L.s, p, L.rot);
  S.followButton(g, t, T.button, T.click);
  S.cursor(g, t, T.cur0, T.cur1, T.click);
}

function scene(g, t) {
  if (t < T.tear1) hook(g, t);
  else if (t < T.shrink0 + 0.3) title(g, t);
  else if (t < T.push0 + 0.35) content(g, t);
  else cta(g, t);
}

S.film({
  DUR, EV: events(), CAPS, scene,
  transitions: [{ t0: T.tear0, t1: T.tear1, from: hook, to: title }],
  powerOff: { t0: T.off0, t1: T.off1 },
});
