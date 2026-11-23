// Single source of truth: voice placement, scene cuts, caption chunks, sound events.
// Word times come from voice_b/words.json (Bunty) (Whisper, language=hi) + each line's start.

export const DUR = 22.85;
export const BPM = 128, BEAT = 60 / BPM;

// voice-over line starts (s)
export const VO = { l1: 0.20, l2: 3.75, l3: 6.40, l4: 15.15 };

// scene boundaries and key hits
export const T = {
  loadStart: 0.30, load99: 2.40, error: 2.90, tear0: 3.50, tear1: 3.75,
  drop: 3.80, land: 4.20, saste: 4.97, pixels: 5.53, badge: 5.90,
  shrink0: 6.40, shrink1: 7.10,
  card1: 7.40, tag1: 8.00, card2: 8.85, tag2: 9.66, card3: 11.20, tag3: 12.28,
  recap: 12.80, zero: 13.48,
  push0: 15.00, push1: 15.80, button: 15.70, cur0: 16.10, cur1: 17.40, click: 17.55,
  warna: 18.29, video: 19.09, morph0: 20.10, morph1: 20.60, v0: 20.45, wave: 20.95,
  off0: 21.80, off1: 22.50,
};
// red-lens glitch flickers during the reveal
export const LENS = [T.land + 0.25, T.land + 0.55, T.badge - 0.15, T.badge + 0.25];

// captions: chunks of the spoken line; `k` = key words drawn in yellow, `w` = word onsets (absolute)
export const CAPS = [
  { t0: 0.20, t1: 1.60, text: 'Arey ruko ruko!', w: [0.20, 0.42, 0.80] },
  { t0: 1.60, t1: 3.70, text: 'Hollywood ka budget toh nahi tha...', w: [1.60, 2.16, 2.34, 2.76, 2.90, 3.12], k: [0, 2] },
  { t0: 3.75, t1: 4.95, text: '...toh humne bana diya', w: [3.75, 3.89, 4.21, 4.45] },
  { t0: 6.40, t1: 7.98, text: 'Yahan milega har mudde ka', w: [6.40, 6.70, 7.14, 7.48, 7.80] },
  { t0: 8.00, t1: 8.92, text: 'full post-mortem,', w: [8.00, 8.34], k: [0, 1] },
  { t0: 8.94, t1: 11.24, text: 'thoda dimaag hilane wala gyan,', w: [8.94, 9.66, 10.28, 10.50, 10.78], k: [1, 4] },
  { t0: 11.26, t1: 12.78, text: 'aur full-on BAKC**DI —', w: [11.26, 11.80, 12.28], k: [1, 2] },
  { t0: 12.80, t1: 15.00, text: 'woh bhi zero budget animation mein!', w: [12.80, 13.28, 13.48, 13.98, 14.28, 14.78], k: [2, 3] },
  { t0: 15.15, t1: 17.02, text: 'Ab itna aage aa hi gaye ho,', w: [15.15, 15.35, 15.67, 15.93, 16.15, 16.37, 16.55] },
  { t0: 17.05, t1: 18.25, text: 'toh FOLLOW dabao...', w: [17.05, 17.17, 17.55], k: [1, 2] },
  { t0: 18.29, t1: 19.45, text: 'warna agla video', w: [18.29, 18.69, 19.09], k: [2] },
  { t0: 19.47, t1: 21.80, text: 'sach mein ZERO BUDGET mein banega!', w: [19.47, 19.91, 20.23, 20.45, 20.79, 20.95], k: [2, 3] },
];

// sound events for the mixer (window.EV → events.json)
export function events() {
  const ev = [];
  const e = (t, type, o = {}) => ev.push({ t: +t.toFixed(3), type, ...o });
  for (const [id, t] of Object.entries(VO)) e(t, 'vo', { id });
  for (const [name, t] of Object.entries(T)) if (typeof t === 'number') e(t, 'cue', { name });   // for mix.py
  for (let t = T.loadStart; t < T.load99; t += 0.16) e(t, 'tick', { v: 0.35 });
  e(T.load99, 'tick', { v: 0.6 });
  e(T.error, 'buzz', { d: 0.55 });
  e(T.tear0, 'whoosh', { d: 0.3, v: 0.9 });
  e(T.tear0 + 0.05, 'glitch', { v: 0.6 });
  e(T.drop, 'whoosh', { d: 0.35, v: 0.7 });
  e(T.land, 'thump', { v: 0.9 }); e(T.land + 0.02, 'pop', { v: 0.8 });
  for (const t of LENS) e(t, 'glitch', { v: 0.35 });
  e(T.saste, 'stamp'); e(T.pixels, 'stamp', { pitch: 1.12 });
  e(T.badge, 'ding', { v: 0.7 });
  e(T.shrink0, 'whoosh', { d: 0.4, v: 0.5 });
  for (const t of [T.card1, T.card2, T.card3]) e(t - 0.05, 'whoosh', { d: 0.28, v: 0.6 });
  e(T.tag1, 'pop'); e(T.tag2, 'pop', { pitch: 1.1 }); e(T.tag3, 'pop', { pitch: 1.2 });
  e(T.tag3 + 0.05, 'haha');
  e(T.recap, 'whoosh', { d: 0.25, v: 0.5 });
  e(T.zero, 'stamp', { pitch: 0.9 }); e(T.zero + 0.04, 'ding', { v: 0.6 });
  e(T.push0, 'whoosh', { d: 0.6, v: 0.6 });
  e(T.button, 'pop', { pitch: 0.9 });
  e(T.click, 'click', { v: 1 }); e(T.click + 0.06, 'ding', { v: 0.8, pitch: 1.5 });
  e(T.warna, 'glitch', { v: 0.5 });
  e(T.video, 'glitch', { v: 0.5 });
  e(T.morph0, 'dissolve');
  e(T.v0, 'stamp', { pitch: 0.85 });
  e(T.wave, 'boing');
  e(T.off0, 'powerdown');
  return ev.sort((a, b) => a.t - b.t);
}
