# Saste Pixels — channel intro (treatment)

Vertical 1080×1920, 30 fps, ~22.85 s. Instagram Reel. Look and storyboard set by the client brief
(own look, not a library style; the library's render/voice/mux pipeline is used).

## Three structures considered
1. **Fake-out → reveal → list → CTA** (the client's storyboard). Hook is a broken "Hollywood" render; the
   cheapness becomes the brand. *Chosen*: the joke is the thesis, and it carries the logo in the first 5 s.
2. *Boot sequence*: a retro console boots the channel like a cartridge (BIOS lines → menu of 3 pillars → "PRESS FOLLOW").
   Good, but the "₹0 budget" joke lands later and weaker.
3. *Budget counter countdown*: a ₹ counter falls from ₹10 crore to ₹12 while scenes get cheaper.
   Funny, but no room for the three pillars in under 25 s.

## Logline and arc
A Hollywood-grade render crashes on "₹0 budget", so a tiny pixel guy builds the channel himself: setup
(fake studio) → turn (ERROR, tear, logo drops in) → payoff (three pillars, "zero budget") → CTA (follow, or lose a pixel).

## Duration note
The brief's scene timings add up to 16 s, but the exact script read at the brief's +5 % rate is 20.5 s
of speech. The voice was not sped up (rushing it kills the comic timing); every scene is stretched to the
voice's word timestamps instead. Total ≈ 22.85 s (the brief asks for at least 15 s).

## Benchmark
Learn: indie-game trailers' title-card cadence (one idea per beat, hard cuts on SFX); YouTube-shorts kinetic type
(words punch in on the stressed syllable). Don't take: any game's UI, fonts, sprites, sounds or melodies.

## Shot list / beat sheet (VO start times in parentheses)
| t (s) | Shot | Why |
|---|---|---|
| 0.0–3.2 | Locked frontal: "HOLLYWOOD VFX STUDIO" loader climbs to 99 % (VO l1 @0.20; "budget" 2.64) | promise of polish to break |
| 3.2–3.8 | Coral flash, `ERROR: ₹0 BUDGET FOUND`, glitch shake (on "nahi tha") | the turn |
| 3.8–4.05 | Horizontal screen-tear wipe | cut on the glitch, no fade |
| 4.05–6.6 | Logo spring-drops upper-centre (lands 4.5); red-lens glitch flicker; `SASTE` stamps on "saste" (5.27), `PIXELS` on "pixels" (5.71); `BUDGET: ₹12` badge (6.1) (VO l2 @4.05) | the reveal |
| 6.6–7.5 | Logo shrinks to a bobbing mascot at top; stage clears (VO l3 @6.60) | make room for the list |
| 7.5–9.4 | Card 1: pixel magnifier over radar chart, `FULL POST-MORTEM` (tag on "post-mortem" 8.24) | pillar 1 |
| 9.4–11.5 | Card 2: pixel light-bulb with sparks, `DIMAAG HILANE WALA GYAN` (tag on "dimaag" 9.78) | pillar 2 |
| 11.5–12.75 | Card 3: coral laughing pixel face, `FULL-ON BAKC**DI` (tag on "bakchodi" 12.0) | pillar 3 (fastest swap: acceleration) |
| 12.75–14.8 | All three cards snap into a row; `₹0 BUDGET ANIMATION` stamp on "zero budget" (13.1) | recap |
| 14.8–17.45 | Push in on the logo; `FOLLOW @saste.pixels` button rises; pixel cursor travels (VO l4 @14.95) | CTA setup |
| 17.45 | Cursor clicks on "dabao"; button presses, ✓ | the action |
| 18.55–20.45 | Logo shudders on "warna", lens glitches on "video" (VO l4 tail: "warna agla video sach mein zero budget mein banega!") | the threat |
| 20.45–20.95 | On "zero budget" the logo pixel-dissolves into a wobbly MS-Paint stick figure (coral lens survives); `₹0 VERSION` stamp | the punchline, the native move |
| 21.41 | The doodle waves on "banega" | the button on the joke |
| 22.25–23.3 | Retro power-down: picture collapses to a line, then a dot, with a blip | ending echoes the opening crash |

## Cue map
Chiptune at 128 BPM (one beat 0.469 s), square lead + triangle bass + noise hats, mixed ~20 dB under voice.
- 0–3.2: rising arpeggio that climbs with the loader. 3.2: music cuts dead (the one silence) under the error buzz.
- 4.5: groove drops in with the logo landing. 6.6–14.8: full groove, pulse arpeggio.
- 14.8–22.25: groove continues, thinner after the click. 22.25: tape-stop pitch-down into the power-down blip.

## Sound design table
| Section | Bed | Foley | Music |
|---|---|---|---|
| Fake-out | faint CRT hum | loader ticks, glitch buzz at error, tear whoosh | rising arp → cut |
| Reveal | — | drop whoosh, landing thump+pop, two stamp pops, badge ding, lens glitch blips | groove in |
| Pillars | — | whoosh per card, pop per tag, ding for the recap stamp | groove |
| CTA | — | button pop, cursor click, ✓ ding, glitch on "video", pixel-dissolve blip cascade, doodle boing, power-down blip | thinning → tape-stop |

## Type
Captions (Hinglish, roman) in Plus Jakarta Sans ExtraBold, off-white, phrase by phrase, at y≈1330–1480
(above the bottom 20 % IG zone; x kept left of 918 px). Tags/stamps in Silkscreen; ₹ counters and the handle in Space Mono.
Persistent watermark: 3×3 pixel icon + `@saste.pixels` at (60,170), 70 % opacity.


## Voice
Final VO: the client's "Bunty" recordings (voice_bunty/ → voice_b/). Every time in timeline.js is taken from Bunty's Whisper word timestamps (voice_b/words.json); shot-list times above are from the earlier Madhur draft and shift by up to ~0.3 s.
