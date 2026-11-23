"""Score + SFX + voice → out/mix.wav with the brand sound kit (saste/chip.py). Edit the score lines for this reel."""
import os, sys
sys.path.insert(0, os.path.join(os.environ.get('SASTE_ENGINE', os.path.expanduser('~/.saste-skills/engine')), 'saste'))
import chip

R = chip.Reel(os.path.dirname(os.path.abspath(__file__)))
c = R.cue
chip.riser(R.mus, c.get('hookIn', 0.3), c['error'])                    # climbs, then the real silence at the error
chip.groove(R.mus, c['land'], c['off0'], chords='party', thin_from=c.get('push0'))
if 'click' in c: chip.fanfare(R.mus, c['click'])
chip.soften(R.mus)
chip.tape_stop(R.mus, c['off0'])
chip.play(R.fx, {'type': 'hum', 't': 0.0, 'd': c['error']})
R.voice(os.environ.get('VOICE_DIR', 'voice_b'))
R.sfx()
R.write(music_db=-20)
