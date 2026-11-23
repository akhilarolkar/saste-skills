# saste-skills

The **@saste.pixels** studio as a Claude Code plugin. Give Claude an idea and it writes the Hinglish script, hands you
the lines for the **Bunty** voice, and then animates, scores, mixes and renders a 1080×1920 Reel/Short in the channel's
pixel theme. Everything is made in code: no stock footage, no AI video.

| | |
|---|---|
| Look | Midnight Slate `#0F172A`, Pixel Yellow `#FACC15`, Coral `#FB7185`, off-white `#F8FAFC`; drifting pixel grid; the pixel-guy mascot |
| Type | Plus Jakarta Sans (captions), Silkscreen (pixel stamps), Space Mono (handle, ₹ counters) |
| Moves | fake-out "Hollywood" hook → ERROR ₹0 BUDGET → screen tear → logo drop → stamps & badges → pixel card montage → FOLLOW click → ₹0 doodle → CRT power-down |
| Sound | original 8-bit chiptune at 128 BPM, retro UI SFX, all synthesized |
| Voice | Bunty (Hindi, male, Excited); fallback Microsoft `hi-IN-MadhurNeural` |

## Install (any machine)

Needs **Node ≥ 20**, **ffmpeg ≥ 7**, **Python ≥ 3.10**.

```
/plugin marketplace add <your-github-user>/saste-skills
/plugin install saste-skills@saste-skills
```

Then just ask: *"make a reel about why chai costs ₹10 at the station and ₹300 at the airport"*. The skill (`saste-reel`)
runs `scripts/setup.sh` on first use, which installs the render engine into `~/.saste-skills/` (headless Chrome and
Python packages, about 400 MB once; the Whisper model, about 480 MB, comes on the first voice check).

Without the plugin system, you can copy `skills/saste-reel/` to `~/.claude/skills/saste-reel/`.

## How a reel gets made
1. You give the idea. Claude writes a 3–6 line Hinglish script (Roman for captions, Devanagari for the voice) and stops once.
2. You generate the lines with **Bunty** and save them as `voice_bunty/l1.mp3, l2.mp3, …` in the reel folder.
3. Claude checks the voice (Whisper, Hindi), times every visual hit to the spoken words, draws the topic's pixel art,
   renders, mixes to −14 LUFS and checks sync. You get `<reel>/<name>.mp4`, a poster and an `.srt`.

## Layout
```
.claude-plugin/            plugin + marketplace manifests
skills/saste-reel/
  SKILL.md                 the workflow Claude follows
  references/              BRAND.md (brand bible) · COMPONENTS.md (API) · VOICE.md (Bunty hand-off)
  engine/                  installed to ~/.saste-skills/engine by setup.sh
    saste/brand.js         every visual component of the brand (canvas)
    saste/chip.py          chiptune + SFX + mixer
    saste/voice/           Hindi speech check, voice prep, timing planner
    saste/assets/          logo, fonts
    core/                  render/mux/TTS tools (vendored, MIT)
  template/                starting files for a new reel
  scripts/                 setup.sh, new_reel.sh
  examples/saste-pixels-intro/   the approved channel intro (source + final video)
```

## Re-render the intro
```
sh skills/saste-reel/scripts/setup.sh
sh skills/saste-reel/examples/saste-pixels-intro/build.sh
```

## Licence
Brand assets (logo, mascot, name, example media) © Saste Pixels, all rights reserved. Fonts are OFL. The vendored render tools are MIT.
See `LICENSE`.
