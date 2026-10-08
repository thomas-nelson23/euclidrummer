# EucliDrummer

A five-track Euclidean drum machine that runs in the browser, built with [p5.js](https://p5js.org/) and p5.sound.

## Running it

The sounds are loaded over HTTP, so serve the folder rather than opening `index.html` directly:

```sh
python3 -m http.server
```

Then open http://localhost:8000.

## Controls

- **Spacebar** starts and stops playback (click the page first so the browser allows audio).
- **Steps** sets each track's loop length (0 to 16). Tracks with different lengths loop independently.
- **Density** sets how many hits are spread evenly across the steps.
- **Offset** rotates the pattern.
- **Grid** cells can be clicked to toggle individual hits.
- **Sound menus** pick one of three samples per track; **Tempo** sets the BPM.
