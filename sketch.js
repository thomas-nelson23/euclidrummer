// EucliDrummer: a five-track Euclidean drum machine built on p5.js and p5.sound.
//
// Each track has a step length, a density (number of hits spread evenly across
// the steps) and an offset (rotation of the pattern). Patterns can also be edited
// by clicking pads in the channel rack. Press the spacebar to start and stop playback.
//
// p5 is only used for audio here; the interface is plain HTML (index.html, style.css)
// with rotary knobs from knob.js.

const MAX_STEPS = 16;
const DEFAULT_BPM = 90;
const DEFAULT_VOLUME = 0.8;

// One entry per track, in display order. `phrase` names the p5.Phrase for the track,
// `color` tints its rack row, and `groove` is the pattern loaded on start (double-clicking
// a knob returns it to this value).
const TRACKS = [
  {
    phrase: 'hh', label: 'HiHat', files: ['hat', 'hh2', 'hh3'], options: ['HiHat 1', 'HiHat 2', 'HiHat 3'],
    color: '#ffd23f', groove: { steps: 16, density: 8, offset: 0 }
  },
  {
    phrase: 'clap', label: 'Clap', files: ['clap', 'clap2', 'clap3'], options: ['Clap 1', 'Clap 2', 'Clap 3'],
    color: '#ff5d7a', groove: { steps: 16, density: 2, offset: 4 }
  },
  {
    phrase: 'bass', label: 'Kick', files: ['bass', 'bass2', 'bass3'], options: ['Kick 1', 'Kick 2', 'Kick 3'],
    color: '#ff8a3d', groove: { steps: 16, density: 4, offset: 0 }
  },
  {
    phrase: 'p1', label: 'Perc 1', files: ['p1-1', 'p1-2', 'p1-3'], options: ['Perc 1', 'Perc 2', 'Perc 3'],
    color: '#3ddbb8', groove: { steps: 12, density: 5, offset: 0 }
  },
  {
    phrase: 'p2', label: 'Perc 2', files: ['p2-1', 'p2-2', 'p2-3'], options: ['Perc 4', 'Perc 5', 'Perc 6'],
    color: '#a78bfa', groove: { steps: 7, density: 3, offset: 2 }
  },
];

// euclidArray[steps][hits] is the pattern with `hits` onsets spread over `steps` steps.
const euclidArray = [

  //0
  [0],


  //1
  [
    [0],
    [1],
  ],


  //2
  [
    [0, 0],

    [1, 0],
    [1, 1],
  ],


  //3
  [
    [0, 0, 0],

    [1, 0, 0],
    [1, 1, 0],
    [1, 1, 1],
  ],


  //4
  [
    [0, 0, 0, 0],

    [1, 0, 0, 0],
    [1, 0, 1, 0],
    [1, 1, 1, 0],
    [1, 1, 1, 1],
  ],


  //5
  [
    [0, 0, 0, 0, 0],

    [1, 0, 0, 0, 0],
    [1, 0, 1, 0, 0],
    [1, 0, 1, 0, 1],
    [1, 1, 1, 1, 0],

    [1, 1, 1, 1, 1]
  ],


  //6
  [
    [0, 0, 0, 0, 0, 0],

    [1, 0, 0, 0, 0, 0],
    [1, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 0],
    [1, 1, 0, 1, 1, 0],

    [1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1]
  ],


  //7
  [
    [0, 0, 0, 0, 0, 0, 0],

    [1, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 0, 1],

    [1, 1, 0, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1]
  ],


  //8
  [
    [0, 0, 0, 0, 0, 0, 0, 0],

    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],

    [1, 0, 1, 1, 0, 1, 1, 0],
    [1, 1, 1, 0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ],


  //9
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],

    [1, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 0],

    [1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 1, 0, 1, 1, 0, 1, 1, 0],
    [1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 0],

    [1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],


  //10 
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    [1, 0, 1, 0, 0, 1, 0, 1, 0, 0],

    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
    [1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 0],

    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],


  //11
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],

    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
    [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],


    [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],


  //12
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],

    [1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0],
    [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],

    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],


  //13
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],

    [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],

    [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],

    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],


  //14 
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0],

    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1],

    [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
    [1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0],

    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],


  //15 
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],

    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],

    [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
    [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
    [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],

    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],


  //16 
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],

    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],

    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0],
    [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0],
    [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],

    [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ]
];

let drums; // p5.Part that drives every track's phrase
let amp; // master level, for the meter
let tempoBpm = DEFAULT_BPM;
let playing = false;

// Returns the Euclidean pattern for the given step length and density, rotated left by `offset`.
// Density is capped at the step length, and a zero-length track is a single rest.
function euclidPattern(steps, density, offset) {
  if (steps === 0) {
    return [0];
  }
  const base = euclidArray[steps][min(density, steps)];
  const shift = offset % steps;
  return base.slice(shift).concat(base.slice(0, shift));
}

function preload() {
  for (const track of TRACKS) {
    track.sounds = track.files.map((file) => loadSound(`assets/${file}.mp3`));
  }
}

function setup() {
  noCanvas();
  amp = new p5.Amplitude(0.8);
  drums = new p5.Part();

  for (const track of TRACKS) {
    Object.assign(track, track.groove, { sound: track.sounds[0], volume: DEFAULT_VOLUME, muted: false });
    track.pattern = euclidPattern(track.steps, track.density, track.offset);
    drums.addPhrase(new p5.Phrase(track.phrase, (time) => {
      if (!track.muted) track.sound.play(time);
    }, track.pattern));
    applyVolume(track);
  }

  // Fires on every tick: keeps the part 16 steps long and drives the playhead.
  drums.addPhrase('playhead', onTick, new Array(MAX_STEPS).fill(1));
  drums.setBPM(DEFAULT_BPM);
  masterVolume(DEFAULT_VOLUME);

  buildRack();
  buildTransport();
  document.getElementById('loading').remove();
}

function draw() {
  for (const [channel, id] of [[0, 'meterL'], [1, 'meterR']]) {
    const level = Math.min(1, amp.getLevel(channel) * 3.2);
    document.getElementById(id).style.transform = `scaleY(${level.toFixed(3)})`;
  }
}

// ---------- channel rack ----------

function buildRack() {
  const leds = document.getElementById('stepLeds');
  for (let i = 0; i < MAX_STEPS; i++) {
    const led = document.createElement('span');
    led.className = 'step-led';
    leds.appendChild(led);
  }

  const list = document.getElementById('channels');
  TRACKS.forEach((track, index) => {
    const row = document.createElement('div');
    row.className = 'channel';
    row.style.setProperty('--ch', track.color);
    row.innerHTML = `
      <button class="mute-led on" title="Mute ${track.label}" aria-pressed="true"
        aria-label="${track.label} on"></button>
      <div class="vol-slot"></div>
      <div class="name-slot">
        <button class="channel-name" title="Preview ${track.label}">
          <span class="channel-num">${index + 1}</span>
          <span class="channel-label">${track.label}</span>
        </button>
        <select class="sample-select" aria-label="${track.label} sample">
          ${track.options.map((option, i) => `<option value="${i}">${option}</option>`).join('')}
        </select>
      </div>
      <div class="knob-slot steps-slot" data-label="Steps"></div>
      <div class="knob-slot density-slot" data-label="Density"></div>
      <div class="knob-slot offset-slot" data-label="Offset"></div>
      <div class="pads"></div>
      <div class="ratio"><b></b><span></span></div>`;
    list.appendChild(row);
    track.row = row;

    const mute = row.querySelector('.mute-led');
    mute.addEventListener('click', () => {
      track.muted = !track.muted;
      mute.classList.toggle('on', !track.muted);
      mute.setAttribute('aria-pressed', String(!track.muted));
      mute.setAttribute('aria-label', `${track.label} ${track.muted ? 'muted' : 'on'}`);
      row.classList.toggle('muted', track.muted);
    });

    row.querySelector('.channel-name').addEventListener('click', async () => {
      await userStartAudio();
      track.sound.play();
      flash(track);
    });

    row.querySelector('.sample-select').addEventListener('change', (e) => {
      track.sound = track.sounds[Number(e.target.value)];
    });

    track.volumeKnob = createKnob(row.querySelector('.vol-slot'), {
      label: `${track.label} volume`, min: 0, max: 1, step: 0.01, value: track.volume, size: 26,
      format: (v) => Math.round(v * 100) + '%',
      onChange: (v) => {
        track.volume = v;
        applyVolume(track);
      }
    });

    // Density can't exceed the step count and offset wraps at it, so their ranges follow Steps.
    track.stepsKnob = createKnob(row.querySelector('.steps-slot'), {
      label: `${track.label} steps`, min: 0, max: MAX_STEPS, value: track.steps, default: track.groove.steps,
      onChange: (v) => {
        track.steps = v;
        track.densityKnob.setMax(v);
        track.offsetKnob.setMax(Math.max(0, v - 1));
        track.density = track.densityKnob.value();
        track.offset = track.offsetKnob.value();
        regenerate(track);
      }
    });
    track.densityKnob = createKnob(row.querySelector('.density-slot'), {
      label: `${track.label} density`, min: 0, max: track.steps, value: track.density,
      default: track.groove.density,
      onChange: (v) => {
        track.density = v;
        regenerate(track);
      }
    });
    track.offsetKnob = createKnob(row.querySelector('.offset-slot'), {
      label: `${track.label} offset`, min: 0, max: Math.max(0, track.steps - 1), value: track.offset,
      default: track.groove.offset,
      onChange: (v) => {
        track.offset = v;
        regenerate(track);
      }
    });

    const pads = row.querySelector('.pads');
    track.pads = [];
    for (let i = 0; i < MAX_STEPS; i++) {
      const pad = document.createElement('button');
      pad.className = 'pad' + (Math.floor(i / 4) % 2 ? ' alt' : '');
      pad.setAttribute('aria-label', `${track.label} step ${i + 1}`);
      pad.addEventListener('click', () => toggleStep(track, i));
      pads.appendChild(pad);
      track.pads.push(pad);
    }

    renderTrack(track);
  });

  document.getElementById('clearBtn').addEventListener('click', () => {
    for (const track of TRACKS) {
      track.densityKnob.set(0);
      regenerate(track); // also clears hand-placed hits when density was already 0
    }
  });
}

function applyVolume(track) {
  for (const sound of track.sounds) sound.setVolume(track.volume);
}

// Swaps in a new pattern for a track and redraws its row.
function setPattern(track, pattern) {
  track.pattern = pattern;
  drums.replaceSequence(track.phrase, pattern);
  renderTrack(track);
}

function regenerate(track) {
  setPattern(track, euclidPattern(track.steps, track.density, track.offset));
}

// Toggles one step, if it falls inside the track's current step length.
function toggleStep(track, step) {
  if (step >= track.steps) return;
  const pattern = track.pattern.slice();
  pattern[step] = +!pattern[step];
  setPattern(track, pattern);
}

function renderTrack(track) {
  track.pads.forEach((pad, i) => {
    const inRange = i < track.steps;
    const on = inRange && track.pattern[i] === 1;
    pad.disabled = !inRange;
    pad.classList.toggle('out', !inRange);
    pad.classList.toggle('on', on);
    pad.setAttribute('aria-pressed', String(on));
  });
  const hits = track.steps ? track.pattern.reduce((a, b) => a + b, 0) : 0;
  track.row.querySelector('.ratio b').textContent = hits;
  track.row.querySelector('.ratio span').textContent = '/' + track.steps;
}

function flash(track) {
  track.row.classList.remove('hit');
  void track.row.offsetWidth; // restart the CSS animation
  track.row.classList.add('hit');
}

// ---------- transport ----------

function buildTransport() {
  document.getElementById('playBtn').addEventListener('click', togglePlay);
  document.getElementById('stopBtn').addEventListener('click', stop);

  createKnob(document.getElementById('masterKnob'), {
    label: 'Master volume', min: 0, max: 1, step: 0.01, value: DEFAULT_VOLUME, size: 30,
    format: (v) => Math.round(v * 100) + '%',
    onChange: (v) => masterVolume(v)
  });

  // Tempo display: drag vertically, scroll, or use the arrow keys, like a DAW tempo LCD.
  const tempo = document.getElementById('tempo');
  const setTempo = (bpm) => {
    tempoBpm = Math.min(240, Math.max(40, Math.round(bpm)));
    drums.setBPM(tempoBpm);
    document.getElementById('tempoValue').textContent = tempoBpm.toFixed(3);
    tempo.setAttribute('aria-valuenow', tempoBpm);
  };
  let startY = 0, startBpm = 0;
  tempo.addEventListener('pointerdown', (e) => {
    tempo.setPointerCapture(e.pointerId);
    startY = e.clientY;
    startBpm = tempoBpm;
  });
  tempo.addEventListener('pointermove', (e) => {
    if (tempo.hasPointerCapture(e.pointerId)) setTempo(startBpm + (startY - e.clientY) / 3);
  });
  tempo.addEventListener('wheel', (e) => {
    e.preventDefault();
    setTempo(tempoBpm + (e.deltaY < 0 ? 1 : -1));
  }, { passive: false });
  tempo.addEventListener('dblclick', () => setTempo(DEFAULT_BPM));
  tempo.addEventListener('keydown', (e) => {
    const delta = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }[e.key];
    if (delta) {
      e.preventDefault();
      setTempo(tempoBpm + delta);
    }
  });
  setTempo(DEFAULT_BPM);

  // Space starts and stops playback, unless a dropdown has focus.
  document.addEventListener('keydown', (e) => {
    if (e.code !== 'Space' || e.repeat || e.target.tagName === 'SELECT') return;
    e.preventDefault();
    if (playing) stop(); else togglePlay();
  });
  // Keep a focused button from also "clicking" when Space is released.
  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' && e.target.tagName === 'BUTTON') e.preventDefault();
  });
}

async function togglePlay() {
  await userStartAudio();
  if (playing) {
    drums.pause();
    setPlaying(false);
  } else {
    drums.loop();
    setPlaying(true);
  }
}

function stop() {
  drums.stop();
  drums.metro.metroTicks = 0; // the next play starts from the top
  setPlaying(false);
  clearPlayhead();
  document.getElementById('position').textContent = '1:01';
}

function setPlaying(on) {
  playing = on;
  const btn = document.getElementById('playBtn');
  btn.classList.toggle('active', on);
  btn.setAttribute('aria-label', on ? 'Pause' : 'Play');
  document.getElementById('hint').innerHTML = on
    ? 'Playing. Press <kbd>Space</kbd> to stop'
    : 'Press <kbd>Space</kbd> or the play button to start';
}

// The playhead phrase is called slightly ahead of the audio, so the visual update is
// scheduled for the moment the tick is heard. Each phrase loops over its own length,
// so a track's current step is the tick modulo its step count.
function onTick(secondsFromNow) {
  const tick = drums.metro.metroTicks;
  setTimeout(() => {
    if (playing) showTick(tick);
  }, Math.max(0, secondsFromNow * 1000));
}

function showTick(tick) {
  clearPlayhead();
  const step = tick % MAX_STEPS;
  document.querySelectorAll('.step-led')[step].classList.add('lit');
  document.getElementById('position').textContent =
    `${Math.floor(tick / MAX_STEPS) + 1}:${String(step + 1).padStart(2, '0')}`;

  for (const track of TRACKS) {
    if (!track.steps) continue;
    const i = tick % track.pattern.length;
    track.pads[i].classList.add('now');
    if (track.pattern[i] && !track.muted) flash(track);
  }
}

function clearPlayhead() {
  document.querySelectorAll('.pad.now, .step-led.lit').forEach((el) => el.classList.remove('now', 'lit'));
}
