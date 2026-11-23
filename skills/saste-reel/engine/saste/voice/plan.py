"""Lay the checked voice lines end to end and print every word's absolute time — the numbers timeline.js is built from.
usage: python plan.py <reel> [--voice voice_b] [--start 0.2] [--gap 0.15] [--gaps l2=0.3,l4=0.4]
Reads <reel>/<voice>/dur.json + words.json (written by prep_voice.py/tts_edge.py and asr_hi.py), writes <reel>/vo_plan.json:
  {"starts": {"l1": 0.2, ...}, "end": 21.45, "words": {"l1": [{"w": "अरे", "t": 0.2}, ...]}}
Whisper puts the first word of a line at a negative time (padding); it is clamped to the line start."""
import sys, os, json, argparse
ap = argparse.ArgumentParser(); ap.add_argument('reel'); ap.add_argument('--voice', default='voice_b')
ap.add_argument('--start', type=float, default=0.2); ap.add_argument('--gap', type=float, default=0.15); ap.add_argument('--gaps', default='')
a = ap.parse_args()
vd = os.path.join(a.reel, a.voice)
dur = json.load(open(os.path.join(vd, 'dur.json'))); words = json.load(open(os.path.join(vd, 'words.json')))
extra = dict((k, float(v)) for k, v in (p.split('=') for p in a.gaps.split(',') if p))
t = a.start; starts = {}; out = {}
for lid in sorted(dur, key=lambda s: (len(s), s)):
    if lid in extra: t += extra[lid] - a.gap
    starts[lid] = round(t, 2)
    out[lid] = [{'w': w['w'], 't': round(t + max(0, w['t0']), 2)} for w in words.get(lid, [])]
    print(f"{lid} @ {t:6.2f}–{t + dur[lid]:6.2f} | " + ' '.join(f"{w['w']}@{w['t']:.2f}" for w in out[lid]))
    t += dur[lid] + a.gap
end = round(t - a.gap, 2)
json.dump({'starts': starts, 'end': end, 'words': out}, open(os.path.join(a.reel, 'vo_plan.json'), 'w'), ensure_ascii=False, indent=1)
print(f'speech ends at {end:.2f} s → film ≈ {end + 1.1:.2f} s with the power-down')
