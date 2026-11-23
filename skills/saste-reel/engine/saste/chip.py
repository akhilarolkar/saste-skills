"""Saste Pixels sound kit: original 8-bit/chiptune score pieces, retro UI SFX, Hindi VO loading and the brand mix.

    import sys, os; sys.path.insert(0, os.path.join(os.environ['SASTE_ENGINE'], 'saste'))
    import chip
    R = chip.Reel(os.path.dirname(__file__))          # reads events.json (exported from timeline.js)
    chip.riser(R.mus, 0.3, R.cue['error'])            # rising arp that cuts dead
    chip.groove(R.mus, R.cue['land'], R.cue['off0'], thin_from=R.cue['push0'])
    chip.tape_stop(R.mus, R.cue['off0'])
    R.voice('voice_b'); R.sfx(); R.write()            # → out/mix.wav

All sounds are synthesized here (no samples), so nothing needs licensing. Brand mix rules: music bed −20 dB under the
voice (lifted +4 dB in gaps), voice compressed, SFX crisp but under the voice, master to −14 LUFS by mux.sh.
Event types understood by Reel.sfx() (from window.EV): tick buzz whoosh glitch thump pop stamp ding haha click blip
dissolve boing powerdown riser_hit — see SFX below. Unknown types are ignored, 'vo' and 'cue' are handled elsewhere.
"""
import os, sys, json
import numpy as np, soundfile as sf, soxr
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'core', 'audio'))
import sfx as _sfx
from sfx import SR, t_, env_exp, lp, hp, bp, noise, norm, add, compress, limit

rng = np.random.default_rng(7)
db = lambda x: 10 ** (x / 20)
rms = lambda x: float(np.sqrt(np.mean(x ** 2) + 1e-12))
mid = lambda m: 440 * 2 ** ((m - 69) / 12)
BPM = 128

# ---------------------------------------------------------------- chip voices
def square(f, d, duty=0.5, v=1.0, a=0.003, rel=0.03, vib=0.0):
    t = t_(d); ph = np.cumsum(np.full(len(t), f) * (1 + vib * np.sin(2 * np.pi * 6 * t)) / SR) % 1
    y = np.where(ph < duty, 1.0, -1.0) - (2 * duty - 1)
    return y * np.minimum(1, t / a) * np.minimum(1, np.maximum(0, (d - t) / rel)) * v

def tri(f, d, v=1.0, rel=0.02):
    t = t_(d); y = 4 * np.abs((f * t) % 1 - 0.5) - 1
    return np.round(y * 8) / 8 * np.minimum(1, np.maximum(0, (d - t) / rel)) * v   # 4-bit stepped

def nz(d, v=1.0, tau=0.03, hpf=6000, crush=4):
    x = noise(d); x = np.repeat(x[::crush], crush)[:len(x)]
    return hp(x, hpf) * env_exp(d, tau) * v

def kick(v=1.0):
    d = 0.16; t = t_(d); f = 160 * np.exp(-t * 30) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, 0.06) * v

def snare(v=1.0):
    a = nz(0.14, 1, 0.05, 1500, 2) * 0.8; n = int(0.06 * SR); a[:n] += square(190, 0.06, 0.5, 0.4)[:n]; return a * v

# ---------------------------------------------------------------- score building blocks
CHORDS = {
    'party':  [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [55, 60, 64]), (55, [55, 59, 62])],   # Am F C G — the brand groove
    'sneaky': [(57, [57, 60, 64]), (55, [55, 58, 62]), (53, [53, 57, 60]), (52, [52, 56, 59])],   # Am Gm F E — tension / investigation
    'hype':   [(48, [55, 60, 64]), (55, [55, 59, 62]), (57, [57, 60, 64]), (53, [53, 57, 60])],   # C G Am F — upbeat, CTA
}

def riser(mus, t0, t1, bpm=BPM, base=57):
    """Fake-out arpeggio that climbs octave by octave until t1 and stops dead (use before an ERROR / reveal)."""
    s16 = 60 / bpm / 4; t = t0; k = 0
    scale = [base, base + 3, base + 7, base + 12, base + 15, base + 19, base + 24, base + 27, base + 31]
    while t < t1 - 0.02:
        p = (t - t0) / max(1e-6, t1 - t0)
        note = scale[k % 3 + 3 * min(2, int(p * 3))] + (12 if k % 6 == 5 else 0)
        add(mus, square(mid(note), s16 * 0.9, 0.25, 0.32 + 0.25 * p), t, pan=-0.2 + 0.4 * (k % 2))
        if k % 4 == 0: add(mus, tri(mid(base - 12 + 12 * (p > 0.66)), s16 * 3.8, 0.7), t)
        t += s16 * (1.0 if p < 0.7 else 0.5); k += 1

def groove(mus, t0, t1, bpm=BPM, chords='party', thin_from=None, drums=True, arp=True):
    """The brand groove: kick/snare/hats, 4-bit triangle bass bouncing octaves, 12.5 % pulse arpeggio in 16ths.
    thin_from: time after which the arp plays half as often (under a CTA). Starts on a bar line at t0."""
    beat = 60 / bpm; s16 = beat / 4; CH = CHORDS[chords] if isinstance(chords, str) else chords
    b = 0
    while True:
        tb = t0 + b * beat
        if tb >= t1: break
        bar, bt = divmod(b, 4); root, chord = CH[bar % len(CH)]
        thin = thin_from is not None and tb >= thin_from
        if drums:
            if bt in (0, 2): add(mus, kick(0.9), tb)
            if bt in (1, 3): add(mus, snare(0.3 if thin else 0.45), tb)
            for h in range(2): add(mus, nz(0.04, 0.22 if h else 0.3), tb + h * beat / 2, pan=0.3)
        for h in range(2): add(mus, tri(mid(root - 12 + 12 * h), beat / 2 * 0.9, 0.85), tb + h * beat / 2)
        if arp and (not thin or bt % 2 == 0):
            for s in range(4):
                n = chord[(b * 4 + s) % 3] + 12 * ((b * 4 + s) // 3 % 2)
                add(mus, square(mid(n), s16 * 0.8, 0.125, 0.22), tb + s * s16, pan=0.35 if s % 2 else -0.35)
        b += 1

def fanfare(mus, t, notes=(72, 76, 79, 84)):
    """Tiny 'level up' fanfare (after a click / success)."""
    for i, n in enumerate(notes):
        add(mus, square(mid(n), 0.11 if i < len(notes) - 1 else 0.3, 0.5, 0.28, rel=0.06, vib=0.01 if i == len(notes) - 1 else 0), t + 0.1 + i * 0.09)

def soften(mus, f=7000):
    for c in range(mus.shape[1]): mus[:, c] = lp(mus[:, c], f)

def tape_stop(mus, t, d=0.55):
    """Music slows to a stop at t (use with the power-down)."""
    N = len(mus); s0 = int(t * SR); L = int(d * SR)
    if s0 >= N: return
    rate = np.clip(1 - np.arange(L) / L, 0, 1) ** 1.3; pos = s0 + np.cumsum(rate)
    for c in range(mus.shape[1]):
        tail = np.interp(pos, np.arange(N), mus[:, c]) * np.linspace(1, 0, L) ** 0.5
        e = min(N, s0 + L); mus[s0:e, c] = tail[:e - s0]; mus[e:, c] = 0

def silence(mus, t0, t1):
    """A real silence (the loudest hit should come right after one)."""
    mus[int(t0 * SR):int(t1 * SR)] = 0

# ---------------------------------------------------------------- SFX (mono arrays at 48 kHz)
def buzz(d=0.55):
    t = t_(d); saw = 2 * ((110 * t) % 1) - 1; gate = (np.floor(t * 40) % 2) * 0.6 + 0.4
    x = (saw * 0.6 + np.repeat(noise(d)[::6], 6)[:len(t)] * 0.4) * gate
    return np.round(lp(x, 4000) * 6) / 6 * env_exp(d, 0.4)

def glitch(v=1.0):
    d = 0.09; x = np.zeros(int(d * SR)); p = 0
    while p < len(x):
        l = int(rng.uniform(0.006, 0.02) * SR); f = rng.choice([220, 440, 880, 1760, 3520])
        seg_ = square(f, l / SR, 0.5, rng.uniform(0.3, 1)); x[p:p + l] = seg_[:len(x[p:p + l])]; p += l
    return x * v

def chipding(v=1.0, pitch=1.0):
    return np.concatenate([square(1318.5 * pitch, 0.07, 0.5, 0.6), square(1760 * pitch, 0.35, 0.5, 0.6, rel=0.3)]) * v

def blip(pitch=1.0, v=1.0):
    d = 0.13; t = t_(d); ph = np.cumsum(1400 * pitch * np.exp(-t * 12)) / SR % 1
    return np.where(ph < 0.5, 1.0, -1.0) * env_exp(d, 0.05) * v

def stamp(pitch=1.0):
    n = int(0.2 * SR); th = _sfx.thump(0.8, 90 * pitch); th = np.pad(th, (0, max(0, n - len(th))))[:n]
    return th * 0.9 + np.pad(square(880 * pitch, 0.05, 0.25, 0.5), (0, n))[:n]

def haha():
    out = np.zeros(int(0.5 * SR))
    for i, f in enumerate([988, 880, 784]):
        s = square(f, 0.09, 0.25, 0.7, vib=0.04); o = int(i * 0.13 * SR); out[o:o + len(s)] += s
    return out

def dissolve():
    out = np.zeros(int(0.55 * SR))
    for i in range(10):
        b = blip(1.5 - i * 0.09, 0.8); s0 = int(i * 0.045 * SR); out[s0:s0 + len(b)] += b[:len(out) - s0]
    return out

def boing():
    d = 0.35; t = t_(d); ph = np.cumsum(220 + 160 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 6)) / SR % 1
    return (4 * np.abs(ph - 0.5) - 1) * env_exp(d, 0.15)

def powerdown():
    d = 0.75; t = t_(d); ph = np.cumsum(900 * np.exp(-t * 6) + 30) / SR % 1
    x = np.where(ph < 0.5, 1.0, -1.0) * np.minimum(1, (d - t) / 0.2) * 0.7
    th = _sfx.thump(0.5, 50); th = np.pad(th, (0, max(0, len(x) - len(th))))[:len(x)]
    return x + th * 0.5

def hum(d):
    t = t_(d); return np.sin(2 * np.pi * 60 * t) * 0.6 + np.sin(2 * np.pi * 120 * t) * 0.3 + hp(noise(d), 8000) * 0.05

def coin(pitch=1.0):
    return np.concatenate([square(988 * pitch, 0.06, 0.5, 0.6), square(1318.5 * pitch, 0.25, 0.5, 0.6, rel=0.2)])

def error_beep():
    return np.concatenate([square(330, 0.12, 0.5, 0.6), np.zeros(int(0.04 * SR)), square(220, 0.25, 0.5, 0.6, rel=0.1)])

def play(fx, e):
    ty, at, v, pt = e['type'], e['t'], e.get('v', 1.0), e.get('pitch', 1.0)
    if ty == 'tick': add(fx, square(1800 * pt, 0.018, 0.5, 1), at, 0.18 * v, pan=0.1)
    elif ty == 'buzz': add(fx, buzz(e.get('d', 0.55)), at, 0.55 * v)
    elif ty == 'whoosh': add(fx, _sfx.whoosh(e.get('d', 0.35), 1.0), at, 0.45 * v)
    elif ty == 'glitch': add(fx, glitch(), at, 0.35 * v, pan=rng.uniform(-0.4, 0.4))
    elif ty == 'thump': add(fx, _sfx.thump(1.0), at, 0.7 * v)
    elif ty == 'pop': add(fx, _sfx.pop(1.0), at, 0.5 * v); add(fx, square(660 * pt, 0.04, 0.25, 0.5), at, 0.25 * v)
    elif ty == 'stamp': add(fx, stamp(pt), at, 0.6 * v)
    elif ty == 'ding': add(fx, chipding(1.0, pt), at, 0.28 * v)
    elif ty == 'coin': add(fx, coin(pt), at, 0.25 * v)
    elif ty == 'error': add(fx, error_beep(), at, 0.3 * v)
    elif ty == 'haha': add(fx, haha(), at, 0.22 * v)
    elif ty == 'click': add(fx, _sfx.click(1.0, 1.0), at, 0.7 * v); add(fx, square(2400, 0.02, 0.5, 1), at, 0.2 * v)
    elif ty == 'blip': add(fx, blip(pt), at, 0.3 * v, pan=rng.uniform(-0.5, 0.5))
    elif ty == 'dissolve': add(fx, dissolve(), at, 0.3 * v)
    elif ty == 'boing': add(fx, boing(), at, 0.35 * v)
    elif ty == 'powerdown': add(fx, powerdown(), at, 0.5 * v)
    elif ty == 'hum': d = e.get('d', 3.0); add(fx, hum(d) * np.minimum(1, t_(d) / 0.3), at, 0.05 * v)
SFX_TYPES = 'tick buzz whoosh glitch thump pop stamp ding coin error haha click blip dissolve boing powerdown hum'.split()

# ---------------------------------------------------------------- the reel mixer
class Reel:
    """Holds the three stems for a reel project folder (reads <dir>/events.json)."""
    def __init__(self, here):
        self.here = here
        evj = json.load(open(os.path.join(here, 'events.json')))
        self.dur, self.ev = evj['dur'], evj['ev']
        self.cue = {e['name']: e['t'] for e in self.ev if e['type'] == 'cue'}
        self.N = int(self.dur * SR) + SR // 2
        self.mus = np.zeros((self.N, 2)); self.fx = np.zeros((self.N, 2)); self.vox = np.zeros((self.N, 2)); self.vmask = np.zeros(self.N)

    def voice(self, voice_dir):
        """Place every {type:'vo', id} event's <voice_dir>/<id>.wav: high-pass, compress, normalise."""
        for e in self.ev:
            if e['type'] != 'vo': continue
            y, sr = sf.read(os.path.join(self.here, voice_dir, e['id'] + '.wav'), dtype='float64')
            if y.ndim > 1: y = y.mean(1)
            y = soxr.resample(y, sr, SR); y = hp(y, 90); y = norm(y, 0.9); y = compress(y, thr=0.22, ratio=3.0); y = norm(y, 0.9)
            add(self.vox, y, e['t'], 1.0)
            s = int(e['t'] * SR); self.vmask[s:s + len(y)] = 1

    def sfx(self):
        for e in self.ev: play(self.fx, e)

    def write(self, music_db=-20.0, gap_lift_db=4.0, out='out/mix.wav'):
        from scipy.ndimage import uniform_filter1d
        speech = self.vmask > 0
        vr = rms(self.vox[speech, 0]) if speech.any() else 0.15
        playing = np.abs(self.mus[:, 0]) > 1e-4
        mr = rms(self.mus[playing, 0]) if playing.any() else 1
        self.mus *= vr / max(mr, 1e-9) * db(music_db)
        duck = uniform_filter1d(self.vmask, int(0.12 * SR))
        self.mus *= (db(gap_lift_db) * (1 - duck) + duck)[:, None]
        mix = self.vox + self.mus + self.fx
        for c in range(2): mix[:, c] = limit(mix[:, c], 0.95)
        n = int(self.dur * SR); os.makedirs(os.path.join(self.here, os.path.dirname(out)), exist_ok=True)
        sf.write(os.path.join(self.here, out), mix[:n].astype(np.float32), SR)
        under = 20 * np.log10(rms(self.mus[speech, 0]) / vr) if speech.any() else float('nan')
        print(f'mix written → {out}; music {under:.1f} dB under voice')
