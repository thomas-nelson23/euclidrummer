// EucliDrummer: a six-track Euclidean drum machine built on p5.js and p5.sound.
//
// Each track has a step length, a density (number of hits spread evenly across
// the steps) and an offset (rotation of the pattern). Patterns can also be edited
// by clicking pads in the channel rack. Press the spacebar to start and stop playback.
//
// Every track is played by a drum synthesizer from synths.js rather than a sample.
// p5 is used for sequencing and the master output; the interface is plain HTML
// (index.html, style.css) with rotary knobs from knob.js.

const MAX_STEPS = 16;
const DEFAULT_BPM = 90;
const DEFAULT_VOLUME = 0.8;

// One entry per track, in display order. `id` names the p5.Phrase for the track, `synth`
// picks its voice from SYNTHS and `preset` the sound it starts with, `color` tints its rack
// row, and `groove` is the pattern loaded on start (double-clicking a knob returns to it).
const TRACKS = [
  { id: 'kick', label: 'Kick', synth: 'kick', preset: '808', color: '#ff8a3d', groove: { steps: 16, density: 4, offset: 0 } },
  { id: 'snare', label: 'Snare', synth: 'snare', preset: 'Classic', color: '#ff5d7a', groove: { steps: 16, density: 2, offset: 4 } },
  { id: 'clap', label: 'Clap', synth: 'clap', preset: 'Classic', color: '#e879f9', groove: { steps: 16, density: 3, offset: 7 } },
  { id: 'hh', label: 'HiHat', synth: 'hihat', preset: 'Closed', color: '#ffd23f', groove: { steps: 16, density: 8, offset: 0 } },
  { id: 'p1', label: 'Perc 1', synth: 'perc', preset: 'Conga', color: '#3ddbb8', groove: { steps: 12, density: 5, offset: 0 } },
  { id: 'p2', label: 'Perc 2', synth: 'perc', preset: 'Rim', color: '#a78bfa', groove: { steps: 7, density: 3, offset: 2 } },
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
let synthBus; // gentle limiter that every track's synth feeds, ahead of p5's master output
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

function setup() {
  noCanvas();
  amp = new p5.Amplitude(0.8);
  drums = new p5.Part();

  const ctx = getAudioContext();
  synthBus = ctx.createDynamicsCompressor();
  synthBus.threshold.value = -6;
  synthBus.knee.value = 6;
  synthBus.ratio.value = 8;
  synthBus.attack.value = 0.002;
  synthBus.release.value = 0.12;
  synthBus.connect(p5.soundOut.input);

  for (const track of TRACKS) {
    Object.assign(track, track.groove, { volume: DEFAULT_VOLUME, muted: false });
    track.voice = SYNTHS[track.synth];
    track.params = Object.assign({}, track.voice.presets[track.preset]);
    track.out = ctx.createGain();
    track.out.connect(synthBus);
    track.pattern = euclidPattern(track.steps, track.density, track.offset);
    // p5.sound calls a phrase slightly ahead of time with the delay until the step is due.
    drums.addPhrase(new p5.Phrase(track.id, (secondsFromNow) => {
      if (!track.muted) playTrack(track, secondsFromNow);
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

function playTrack(track, secondsFromNow = 0) {
  const ctx = getAudioContext();
  track.voice.play(ctx, track.out, ctx.currentTime + Math.max(0, secondsFromNow), track.params);
}

// Plays a track once right away, as when its name is clicked.
async function preview(track) {
  await userStartAudio();
  playTrack(track, 0.005);
  flash(track);
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
    const presets = Object.keys(track.voice.presets);
    row.innerHTML = `
      <button class="mute-led on" title="Mute ${track.label}" aria-pressed="true"
        aria-label="${track.label} on"></button>
      <div class="vol-slot"></div>
      <div class="name-slot">
        <button class="channel-name" title="Preview ${track.label}">
          <span class="channel-num">${index + 1}</span>
          <span class="channel-label">${track.label}</span>
        </button>
        <div class="preset-line">
          <select class="preset-select" aria-label="${track.label} preset">
            ${presets.map((name) => `<option${name === track.preset ? ' selected' : ''}>${name}</option>`).join('')}
            <option value="" disabled>Custom</option>
          </select>
          <button class="synth-toggle" aria-expanded="false" aria-controls="synth-${track.id}"
            title="Show ${track.label} synth" aria-label="${track.label} synth settings">
            <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1v10M6 1v10M10 1v10" /><rect x="0.5" y="6" width="3" height="2" rx="0.5" /><rect x="4.5" y="2.5" width="3" height="2" rx="0.5" /><rect x="8.5" y="7.5" width="3" height="2" rx="0.5" /></svg>
          </button>
        </div>
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

    row.querySelector('.channel-name').addEventListener('click', () => preview(track));

    buildSynthPanel(track, list);
    const presetSelect = row.querySelector('.preset-select');
    presetSelect.addEventListener('change', () => {
      Object.assign(track.params, track.voice.presets[presetSelect.value]);
      for (const param of track.voice.params) track.paramKnobs[param.key].set(track.params[param.key], true);
      preview(track);
    });

    const toggle = row.querySelector('.synth-toggle');
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.title = `${open ? 'Hide' : 'Show'} ${track.label} synth`;
      row.classList.toggle('open', open);
      track.panel.hidden = !open;
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

// The synth panel that opens under a channel row: one knob per synth parameter.
function buildSynthPanel(track, list) {
  const panel = document.createElement('div');
  panel.className = 'synth-panel';
  panel.id = `synth-${track.id}`;
  panel.hidden = true;
  panel.style.setProperty('--ch', track.color);
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-label', `${track.label} synth`);
  panel.innerHTML = `<span class="synth-name">${track.synth} synth</span>`;
  list.appendChild(panel);
  track.panel = panel;

  const presetSelect = track.row.querySelector('.preset-select');
  track.paramKnobs = {};
  for (const param of track.voice.params) {
    const slot = document.createElement('div');
    slot.className = 'knob-slot synth-slot';
    slot.dataset.label = param.label;
    panel.appendChild(slot);
    track.paramKnobs[param.key] = createKnob(slot, {
      label: `${track.label} ${param.label.toLowerCase()}`, min: param.min, max: param.max, step: param.step,
      value: track.params[param.key], format: (v) => formatParam(param, v),
      onChange: (v) => {
        track.params[param.key] = v;
        presetSelect.value = ''; // shows "Custom"
      }
    });
  }
}

function applyVolume(track) {
  track.out.gain.value = track.volume;
}

// Swaps in a new pattern for a track and redraws its row.
function setPattern(track, pattern) {
  track.pattern = pattern;
  drums.replaceSequence(track.id, pattern);
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
  // Steps that differ from the generated Euclidean pattern were toggled by hand.
  const generated = euclidPattern(track.steps, track.density, track.offset);
  track.pads.forEach((pad, i) => {
    const inRange = i < track.steps;
    const on = inRange && track.pattern[i] === 1;
    const edited = inRange && track.pattern[i] !== generated[i];
    pad.disabled = !inRange;
    pad.classList.toggle('out', !inRange);
    pad.classList.toggle('on', on);
    pad.classList.toggle('added', edited && on);
    pad.classList.toggle('removed', edited && !on);
    pad.setAttribute('aria-pressed', String(on));
    pad.setAttribute('aria-label', `${track.label} step ${i + 1}${edited ? ' (edited by hand)' : ''}`);
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
