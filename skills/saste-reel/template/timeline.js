// Single source of truth for this reel: voice placement, hit times, captions, sound events.
// Fill it from vo_plan.json (saste/voice/plan.py): every hit lands on a spoken word's onset.
// Keep this file import-free: build.sh and mix.py read it too.

export const BPM = 128, BEAT = 60 / BPM;

// voice line starts (s) — copy "starts" from vo_plan.json
export const VO = { l1: 0.20, l2: 3.80, l3: 7.00, l4: 13.00 };

// hit times (s). Names are free; mix.py reads them as R.cue[name]. Keep land/off0 (groove + power-down) in every reel.
export const T = {
  // 1 hook (fake-out / question / cold open)
  hookIn: 0.20, error: 2.90, tear0: 3.50, tear1: 3.75,
  // 2 mascot + title
  drop: 3.80, land: 4.20, title: 4.90, badge: 5.60,
  // 3 content: cards / set pieces
  shrink0: 6.80, shrink1: 7.40, card1: 7.40, tag1: 7.90, card2: 9.20, tag2: 9.60, card3: 10.90, tag3: 11.30, recap: 12.40,
  // 4 CTA + outro
  push0: 13.00, push1: 13.80, button: 13.70, cur0: 14.00, cur1: 15.20, click: 15.35, morph0: 16.6, morph1: 17.1, wave: 17.4,
  off0: 18.30, off1: 19.00,
};
export const DUR = +(T.off1 + 0.35).toFixed(2);
export const LENS = [T.land + 0.25, T.land + 0.55, T.badge + 0.25];   // lens-glitch flickers

// captions: {t0, t1, text (Roman Hinglish), w: [word onsets], k: [key-word indices → yellow]}
export const CAPS = [
  // { t0: 0.20, t1: 1.60, text: 'Arey ruko ruko!', w: [0.20, 0.42, 0.80] },
];

// sound events (types: see chip.py SFX_TYPES). 'vo' and 'cue' entries are required.
export function events() {
  const ev = [];
  const e = (t, type, o = {}) => ev.push({ t: +t.toFixed(3), type, ...o });
  for (const [id, t] of Object.entries(VO)) e(t, 'vo', { id });
  for (const [name, t] of Object.entries(T)) if (typeof t === 'number') e(t, 'cue', { name });
  for (let t = T.hookIn; t < T.error - 0.3; t += 0.16) e(t, 'tick', { v: 0.35 });
  e(T.error, 'buzz'); e(T.tear0, 'whoosh', { d: 0.3, v: 0.9 }); e(T.tear0 + 0.05, 'glitch', { v: 0.6 });
  e(T.drop, 'whoosh', { d: 0.35, v: 0.7 }); e(T.land, 'thump', { v: 0.9 }); e(T.land + 0.02, 'pop', { v: 0.8 });
  for (const t of LENS) e(t, 'glitch', { v: 0.35 });
  e(T.title, 'stamp'); e(T.badge, 'ding', { v: 0.7 });
  e(T.shrink0, 'whoosh', { d: 0.4, v: 0.5 });
  for (const t of [T.card1, T.card2, T.card3]) e(t - 0.05, 'whoosh', { d: 0.28, v: 0.6 });
  e(T.tag1, 'pop'); e(T.tag2, 'pop', { pitch: 1.1 }); e(T.tag3, 'pop', { pitch: 1.2 });
  e(T.recap, 'whoosh', { d: 0.25, v: 0.5 });
  e(T.push0, 'whoosh', { d: 0.6, v: 0.6 }); e(T.button, 'pop', { pitch: 0.9 });
  e(T.click, 'click'); e(T.click + 0.06, 'ding', { v: 0.8, pitch: 1.5 });
  e(T.morph0, 'dissolve'); e(T.wave, 'boing');
  e(T.off0, 'powerdown');
  return ev.sort((a, b) => a.t - b.t);
}
