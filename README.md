# EucliDrummer

![EucliDrummer channel rack](docs/screenshots/desktop-playing.png)

EucliDrummer is a browser drum machine built with [p5.js](https://p5js.org/) and p5.sound. It generates rhythms with the [Euclidean algorithm](https://en.wikipedia.org/wiki/Euclidean_rhythm): you pick how many steps a pattern has and how many hits to spread across them, and the hits are distributed as evenly as possible. From there you can rotate the pattern, toggle individual steps by hand, shape each drum's sound, and change the tempo while it plays. Every sound is synthesized live in the browser with the Web Audio API, so there are no samples to load.

## Features

- Six tracks: Kick, Snare, Clap, HiHat, Perc 1 and Perc 2, each played by a drum synthesizer.
- A dark, DAW-style interface inspired by FL Studio's channel rack, with rotary knobs, lit step pads, a running playhead and a tempo display.
- Per-track Euclidean controls:
  - **Steps** sets the pattern length (0 to 16 steps).
  - **Density** sets how many hits are spread across those steps (0 to 16, capped at the step count).
  - **Offset** rotates the pattern by 0 to 16 steps.
- 16 step pads per track that show the pattern and light up as the playhead passes. Click a pad to toggle that step.
- A synth panel per track, opened with the slider button under the track name, with four knobs for that drum (see [The drum synths](#the-drum-synths)).
- Presets per drum, chosen from the dropdown under the track name. Turning a synth knob switches the dropdown to Custom. Click the track name to hear the drum.
- Per-track mute and volume, and a master volume with a level meter.
- Tempo from 40 to 240 BPM (90 by default), adjustable while the loop runs.
- Starts with a ready-to-play groove, and works on phone-sized screens.
- Tracks can have different lengths, so polyrhythms fall out naturally.

## Getting started

There is no build step and no dependencies to install: the p5 libraries are included in the repo.

Because the drums are synthesized rather than loaded from files, you can open `index.html` straight from disk. Serving the folder with any static web server works too, for example from the repo folder:

```sh
python3 -m http.server 8000
# or
npx serve .
```

Then open <http://localhost:8000> in your browser. In VS Code, the Live Server extension does the same job.

## How to use it

1. Press **Space** or the green play button to start the loop. Space again stops it; the play button pauses. Browsers only allow audio after you interact with the page, and either of these counts.
2. Turn a track's **Density** knob to add or remove hits. Each track starts with a groove loaded, and **Clear** in the rack's title bar empties every pattern.
3. Turn **Steps** to make a track loop over fewer steps, and **Offset** to shift where its hits land. Tracks with different step counts drift against each other, which is where the polyrhythms come from.
4. Click pads to add or remove individual hits on top of the generated pattern. Hits you add by hand light up blue instead of white, and generated hits you remove get a blue outline, so you can always tell your edits apart from the Euclidean pattern.
5. Pick a preset from a track's dropdown, or click the slider button beside it to open the track's synth panel and shape the sound with its knobs. Use the green light to mute a track, and the small knob beside it for its volume.
6. Set the speed by dragging the **BPM** display up or down, scrolling over it, or focusing it and using the arrow keys. Double-click it to go back to 90.

Knobs work the same way: drag up or down (hold Shift for finer steps), scroll, or use the arrow keys, and double-click to return to the starting value.

Turning a track's Steps, Density or Offset knob regenerates that track's pattern, which replaces any steps you toggled by hand.

## The drum synths

Each drum is a small Web Audio patch in `synths.js`, built fresh for every hit. Perc 1 and Perc 2 share the percussion synth but start on different presets.

| Drum | How it's made | Knobs | Presets |
| --- | --- | --- | --- |
| Kick | Sine wave with a fast downward pitch sweep, a click on the attack, and a soft clipper | **Tune** (base pitch), **Punch** (pitch sweep and click), **Decay**, **Drive** (saturation) | 808, Punchy, Tight |
| Snare | Two detuned oscillators for the drum body plus high-passed noise for the wires | **Tune** (body pitch), **Tone** (noise brightness), **Snap** (noise against body), **Decay** | Classic, Tight, Fat |
| Clap | Band-passed noise retriggered three times in quick succession, with an optional tail | **Tone** (filter pitch), **Spread** (gap between claps), **Decay**, **Room** (tail level) | Classic, Tight, Big |
| HiHat | Six square waves at the TR-808's metallic frequency ratios, mixed with noise and high-passed | **Tune**, **Tone** (high-pass cutoff), **Decay** (turn up to open the hat), **Metal** (squares against noise) | Closed, Open, Crisp |
| Perc | Pitched sine with a downward bend and optional FM for metallic tones | **Tune**, **Decay**, **Bend** (pitch drop), **Color** (FM amount) | Conga, Tom, Cowbell, Rim |

All six tracks feed a gentle limiter before p5.sound's master output, so stacked hits don't clip.

## How the Euclidean patterns work

A Euclidean rhythm E(k, n) places k hits across n steps as evenly as possible. E(3, 8), for example, gives `x . . x . . x .`, the tresillo rhythm, and E(5, 8) gives the cinquillo. Many traditional rhythms from around the world turn out to be Euclidean patterns, which is why a single "density" control produces musical results so easily.

EucliDrummer stores these patterns as a precomputed lookup table (`euclidArray` in `sketch.js`), indexed by step count and then by number of hits. The Offset knob rotates the selected pattern, and each track's pattern is played by its own `p5.Phrase` and triggers that track's synth on each hit. The phrases share one `p5.Part`, which is the transport that the tempo display, the play button and the Space key control.

## Project structure

| Path | What it is |
| --- | --- |
| `index.html` | The page: toolbar, transport and the channel rack shell. Loads the p5 libraries and the scripts. |
| `sketch.js` | The app: the track table, the Euclidean pattern table, playback, and building the channel rack and synth panels. |
| `synths.js` | The drum synthesizers: each drum's knobs, presets and Web Audio patch. |
| `knob.js` | The rotary knob control used for every knob on the page. |
| `style.css` | The FL Studio-inspired theme, including the phone layout. |
| `docs/screenshots/` | Screenshots used in this README. |
| `p5.js`, `p5.sound.js` | Bundled copies of p5.js 0.9.0 and p5.sound 0.3.11. |

## Adding presets or changing a drum

Each drum's presets live in its `presets` object in `synths.js`: add an entry with a value for each of its knobs and it shows up in that drum's dropdown. To change how a drum sounds at a deeper level, edit its `play` function, and to add a knob, add an entry to its `params` list and read it in `play`. Tracks are listed in `TRACKS` in `sketch.js`, where each one names its synth and starting preset.
