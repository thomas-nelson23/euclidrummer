# EucliDrummer

EucliDrummer is a browser drum machine built with [p5.js](https://p5js.org/) and p5.sound. It generates rhythms with the [Euclidean algorithm](https://en.wikipedia.org/wiki/Euclidean_rhythm): you pick how many steps a pattern has and how many hits to spread across them, and the hits are distributed as evenly as possible. From there you can rotate the pattern, toggle individual steps by hand, swap samples, and change the tempo while it plays.

## Features

- Five tracks: HiHat, Clap, Kick, Perc 1 and Perc 2.
- Per-track Euclidean controls:
  - **Steps** sets the pattern length (0 to 16 steps).
  - **Density** sets how many hits are spread across those steps (0 to 16, capped at the step count).
  - **Offset** rotates the pattern by 0 to 16 steps.
- A 16-step grid that shows each pattern. Click any cell to toggle that step on or off.
- Three samples per track, chosen from a dropdown next to the track.
- Tempo from 40 to 240 BPM (90 by default), adjustable while the loop runs.
- Tracks can have different lengths, so polyrhythms fall out naturally.

## Getting started

There is no build step and no dependencies to install: the p5 libraries are included in the repo.

The sounds are loaded from `assets/` over HTTP, so the page needs to be served by a local web server rather than opened straight from disk. Any static server works. For example, from the repo folder:

```sh
python3 -m http.server 8000
# or
npx serve .
```

Then open <http://localhost:8000> in your browser. In VS Code, the Live Server extension does the same job.

## How to use it

1. Click anywhere on the page once. Browsers block audio until you interact with the page, and the "click to start audio" note disappears once sound is enabled.
2. Press **Space** to start the loop. Press it again to stop.
3. Raise a track's **Density** slider to add hits. Every track starts at 16 steps with no hits, so nothing plays until you do.
4. Shorten **Steps** to make a track loop over fewer steps, and move **Offset** to shift where its hits land.
5. Click cells in the grid to add or remove individual hits on top of the generated pattern.
6. Pick a different sample from a track's dropdown, and set the speed with the **Tempo** slider.

Moving a track's Steps, Density or Offset slider regenerates that track's pattern, which replaces any steps you toggled by hand.

## How the Euclidean patterns work

A Euclidean rhythm E(k, n) places k hits across n steps as evenly as possible. E(3, 8), for example, gives `x . . x . . x .`, the tresillo rhythm, and E(5, 8) gives the cinquillo. Many traditional rhythms from around the world turn out to be Euclidean patterns, which is why a single "density" control produces musical results so easily.

EucliDrummer stores these patterns as a precomputed lookup table (`euclidArray` in `sketch.js`), indexed by step count and then by number of hits. The Offset slider rotates the selected pattern, and each track's pattern is played by its own `p5.Phrase` inside a shared `p5.Part`, which is the transport that the tempo slider and the Space key control.

## Project structure

| Path | What it is |
| --- | --- |
| `index.html` | The page. Loads the p5 libraries and the sketch. |
| `sketch.js` | All of the app: sample loading, sliders and dropdowns, the step grid, the Euclidean pattern table and playback. |
| `style.css` | Page styling (black background, centered canvas). |
| `assets/` | The drum samples as MP3s: three each for hihat, clap, kick, Perc 1 (`p1-*`) and Perc 2 (`p2-*`). |
| `p5.js`, `p5.dom.js`, `p5.sound.js` | Bundled copies of p5.js 0.9.0 and p5.sound 0.3.11. |

## Adding or replacing samples

Drop an MP3 into `assets/`, then point one of the `loadSound(...)` calls near the top of `setup()` in `sketch.js` at it. Each track has three slots (for example `hh1`, `hh2`, `hh3`), and its dropdown switches between them.
