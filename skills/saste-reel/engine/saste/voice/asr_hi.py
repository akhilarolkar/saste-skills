"""Hindi speech check: transcribe each voice/<id>.wav with faster-whisper (language=hi),
compare to the line's `asr` text by character similarity, write voice/words.json (word timestamps).
usage: python tools/asr_hi.py lines.json voice_dir [--model small] [--threshold 0.75]"""
import sys, json, os, re, argparse, difflib
import numpy as np, soundfile as sf
from faster_whisper import WhisperModel
ap = argparse.ArgumentParser(); ap.add_argument('lines'); ap.add_argument('vdir')
ap.add_argument('--model', default='small'); ap.add_argument('--threshold', type=float, default=0.75)
a = ap.parse_args()
norm = lambda s: re.sub(r'[\s\.,!?।\-—…"\']', '', s)
m = WhisperModel(a.model, device='cpu', compute_type='int8')
words, bad = {}, 0
for L in json.load(open(a.lines, encoding='utf-8')):
    y, sr = sf.read(os.path.join(a.vdir, L['id'] + '.wav'), dtype='float32')
    if sr != 16000:
        import soxr; y = soxr.resample(y, sr, 16000)
    pad = np.zeros(8000, np.float32)
    segs, _ = m.transcribe(np.concatenate([pad, y, pad]), language='hi', beam_size=5, word_timestamps=True)
    ws, txt = [], ''
    for s in segs:
        txt += s.text
        ws += [{'w': w.word.strip(), 't0': round(w.start - .5, 3), 't1': round(w.end - .5, 3)} for w in s.words]
    want = L.get('asr', L.get('say', L['text']))
    r = difflib.SequenceMatcher(None, norm(want), norm(txt)).ratio()
    ok = r >= a.threshold; bad += not ok
    print(('OK  ' if ok else 'DIFF'), L['id'], f'{r:.2f}', '|', txt.strip())
    words[L['id']] = ws
json.dump(words, open(os.path.join(a.vdir, 'words.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('mismatches:', bad); sys.exit(1 if bad else 0)
