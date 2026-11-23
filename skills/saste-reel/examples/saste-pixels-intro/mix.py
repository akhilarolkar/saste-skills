"""Score + SFX + voice → out/mix.wav, using the brand sound kit (saste/chip.py)."""
import os, sys
sys.path.insert(0, os.path.join(os.environ.get('SASTE_ENGINE', os.path.expanduser('~/.saste-skills/engine')), 'saste'))
import chip

R = chip.Reel(os.path.dirname(os.path.abspath(__file__)))
c = R.cue
chip.riser(R.mus, 0.30, c['error'])                                   # loader arp, cuts dead at the ERROR
chip.groove(R.mus, c['land'], c['off0'], thin_from=c['push0'])        # groove drops in with the logo landing
chip.fanfare(R.mus, c['click'])
chip.soften(R.mus)
chip.tape_stop(R.mus, c['off0'])
chip.play(R.fx, {'type': 'hum', 't': 0.0, 'd': c['error']})           # faint CRT hum under the fake-out
R.voice(os.environ.get('VOICE_DIR', 'voice_b'))
R.sfx()
R.write()
