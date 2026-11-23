# Components reference — brand.js & chip.py

`brand.js` is served at `/saste/brand.js` (import it as `import * as S from '/saste/brand.js'`). All draw functions take the
canvas context `g` and the time `t`; they are stateless, so any frame renders alone. Coordinates are canvas pixels on the
1080×1920 frame; scene content is already shifted by `DY` (+40) by `S.film`, captions and watermark are not.
The full working example is the skill's `examples/saste-pixels-intro/main.js`. Read it before writing a new reel.

## Contents
Constants · Film runner · Background/furniture · Primitives · Kinetic type · Mascot · Icons & cards · Hook pieces · CTA · Captions · Writing new pixel art · chip.py

## Constants
`W, H` (1080, 1920) · `CX` 540 · `DY` 40 · `CAP_Y` 1470 · `SAFE` {top, bottom: 1536, left, right: 918} · `C` colours · `F` fonts ·
`HANDLE` '@saste.pixels' · easing: `seg(t,a,b)` (0→1), `lerp`, `clamp`, `eo` (ease-out), `ei` (ease-in), `eio`, `back(p, s)` (overshoot),
`ss`, `spring` · `h1(...nums)` deterministic hash 0..1 · `fr(t)` frame index · `beatBob(t, t0, beat)` · `hitAmt(t, hits, d)`.

## Film runner
```js
S.film({ DUR, EV, CAPS, scene,                       // scene(g, t) draws everything for time t (call S.bg first)
  transitions: [{ t0, t1, from: hook, to: reveal }], // screen-tear between two scene fns
  powerOff: { t0, t1 },                              // CRT power-down at the end (t1 − t0 ≈ 0.7 s)
  onReady: async () => { myImg = await S.loadImage('art/thing.png'); } });
```
It sets `window.DUR/EV/render/TEXTS/READY`, loads fonts + logo, draws captions and the watermark on every frame.

## Background & furniture
- `bg(g, t, tint=0)` — slate + drifting grid + twinkles; `tint` 0..0.6 = coral flash.
- `watermark(g)` — automatic via `film`.

## Primitives
- `panel(g, x, y, w, h, fill, border, bw=6, step=12)` — stepped-corner pixel box.
- `stampText(g, str, x, y, px, fam, fill, shadow, d=8, align='center', weight)` → width. Hard pixel shadow.
- `font(g, fam, px, weight)`.
- `pix(g, x0, y0, cols, rows, cell, (i,j) => colour|null)` — procedural pixel art.
- `sprite(g, x0, y0, cell, rows, palette)` — ASCII art: `rows = ['..XX..', …]`, `palette = {X: C.yel}`.
- `say(id, text, x0, y0, x1, y1, pass)` — register on-screen text for `readcheck.mjs` (components do this themselves).

## Kinetic type
- `stampIn(g, t, t0, 'WORD', x, y, {px=152, fam=F.pix, fill=C.yel, shadow=C.red, out, rot})` — slams in at t0, shrinks out at `out`.
- `badge(g, t, t0, 'TEXT', x, y, {w, h, px, border, color, rot, out, sub, subPx})` — tilted Space-Mono panel (`sub` = second line in Silkscreen).

## Mascot
- `drawLogo(g, x, y, s, {res, rot, sx, sy, holes})` — `res` < 1024 = mosaic; `holes` = [[i,j]] 2×2 logo-grid blocks knocked out.
- `logoDrop(t, t0, tLand, x, y, s)` → state `{x,y,s,sx,sy,res,rot}` for a spring-drop + squash + pixel-pop. Pass it to `drawLogo`.
- `landingDust(g, t, tLand, x, y, s)` · `shake(t, amt)` → {dx, dy, rot} · `popRes(t, tLand)`.
- `lensGlitch(g, x, y, s, t, amt)` — coral lens glitch; drive with `hitAmt(t, [times])`.
- `logoDissolve(g, x, y, s, p, rot)` — 32×32 cell dissolve, p 0..1 (draws the full logo at p ≤ 0).
- `doodle(g, x, y, s, t, {wave, color, lens})` — the ₹0 MS-Paint stick-figure version; draw it under a dissolving logo.
- `LOGO_GRID`, `LENS` — the logo's pixel grid / lens box in 1024-space (for custom effects on him).

## Icons & cards
- `radarIcon`, `bulbIcon`, `laughIcon` (`ICONS.radar/bulb/laugh`) — `(g, x0, y0, cell, t)`, 20×20 cells, animated.
- `card(g, c, x, y, t, scale=1, showTag=true)` with `c = {icon, lines: ['L1','L2'], col, border?, tag, haha?}` — 640×640 panel, icon, Silkscreen tag stamping at `c.tag`.
- `cardMontage(g, t, cards, y=1000)` — each `c.t` whips a card in; the next one whips it out.
- `cardRow(g, t, cards, t0, {y, beat, out})` — recap row of up to 3 mini cards.

## Hook pieces
- `loadProgress(t, t0, t1)` → 0..99 · `loadingBar(g, p, err, {x, y, w, h})` (shows % under it).
- `errorPanel(g, t, t0, 'ERROR:', '₹0 BUDGET FOUND', x, y)` — chromatic ghosting + jitter.
- `sliceGlitch(g, t, amt)` — horizontal slice displacement of the current canvas (call last in the scene).

## CTA
- `followButton(g, t, tIn, tClick, {y=1220, label, handle})` — rises, press, white flash, ✓ badge, burst, +1.
- `cursor(g, t, t0, t1, tClick, {from, to, away})` — pixel arrow arcs in, clicks, drifts off.

## Captions
`CAPS = [{t0, t1, text, w: [word onsets], k: [key-word indices]}]` from `vo_plan.json`. Group 3–6 words per chunk; each chunk ≥ ~1.2 s;
put the key/joke word in `k`. Censor on screen (`BAKC**DI`), never in the voice.

## Writing new pixel art for a topic
Each reel should get 2–4 new topic icons drawn the same way as the built-ins: a 20×20 (or 16×16) grid via `pix()` or `sprite()`,
cell 18 px inside cards, brand colours only, one or two animated details (blink, sweep, steam, bounce) stepped at 6–10 fps.
Put them in the reel's `main.js` (or `icons.js`) and pass them as `icon:` to `card`. Bigger set pieces (a pixel chai stall,
a stock chart, a cricket pitch) follow the same rules: flat fills, hard edges, 1-cell outlines in `C.navy`.

## chip.py (audio)
```python
R = chip.Reel(here)                     # reads events.json; R.cue = {name: t} from timeline T; R.mus / R.fx / R.vox stems
chip.riser(R.mus, t0, t1)               # climbing arp that cuts dead at t1
chip.groove(R.mus, t0, t1, chords='party'|'sneaky'|'hype', thin_from=t)   # 128 BPM brand groove from t0
chip.fanfare(R.mus, t) · chip.silence(R.mus, t0, t1) · chip.soften(R.mus) · chip.tape_stop(R.mus, t)
chip.play(R.fx, {'type': 'hum', 't': 0, 'd': 3})   # one-off SFX
R.voice('voice_b'); R.sfx(); R.write(music_db=-20)
```
SFX event types (put them in `events()` in timeline.js): `tick buzz whoosh glitch thump pop stamp ding coin error haha click blip
dissolve boing powerdown hum`, with optional `v` (gain), `pitch`, `d` (duration). `vo` events place voice lines; `cue` events carry `T`.
