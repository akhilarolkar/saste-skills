"""Client voice files (voice_bunty/l1..l4.mp3) → voice_b/<id>.wav (24 kHz mono, silence trimmed) + dur.json.
usage: python tools/prep_voice.py voice_bunty voice_b"""
import sys, os, io, json, glob, subprocess
import numpy as np, soundfile as sf
src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True); dur = {}
for f in sorted(glob.glob(os.path.join(src, 'l*.*'))):
    lid = os.path.splitext(os.path.basename(f))[0]
    r = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f, '-ar', '24000', '-ac', '1', '-f', 'wav', '-'], capture_output=True, check=True)
    y, sr = sf.read(io.BytesIO(r.stdout), dtype='float32')
    nz = np.where(np.abs(y) > np.abs(y).max() * .02)[0]
    y = y[max(0, nz[0] - int(.03 * sr)): nz[-1] + int(.10 * sr)]
    sf.write(os.path.join(dst, lid + '.wav'), y, sr); dur[lid] = round(len(y) / sr, 3)
json.dump(dur, open(os.path.join(dst, 'dur.json'), 'w'), indent=1); print(dur)
