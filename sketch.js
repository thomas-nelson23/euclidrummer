// EucliDrummer: a six-track Euclidean drum machine.
//
// Each track has a step length, a density (number of hits spread evenly across
// the steps) and an offset (rotation of the pattern). Patterns can also be edited
// by clicking pads in the channel rack. Press the spacebar to start and stop playback.
//
// Every track is played by a drum synthesizer from synths.js. Sequencing, mixing and
// metering use the Web Audio API directly; the interface is plain HTML (index.html,
// style.css) with rotary knobs from knob.js and a canvas visualizer from visualizer.js.

const MAX_STEPS = 16;
const DEFAULT_BPM = 90;
const DEFAULT_VOLUME = 0.8;

// One entry per track, in display order. `id` names the track's synth panel, `synth`
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


// EUCLID[steps][hits] is the pattern with `hits` onsets spread over `steps` steps.
const EUCLID = [
  /* 0 */ ['0'],
  /* 1 */ ['0', '1'],
  /* 2 */ ['00', '10', '11'],
  /* 3 */ ['000', '100', '110', '111'],
  /* 4 */ ['0000', '1000', '1010', '1110', '1111'],
  /* 5 */ ['00000', '10000', '10100', '10101', '11110', '11111'],
  /* 6 */ ['000000', '100000', '100100', '101010', '110110', '111110', '111111'],
  /* 7 */ ['0000000', '1000000', '1001000', '1010100', '1010101', '1101101', '1111110', '1111111'],
  /* 8 */ ['00000000', '10000000', '10001000', '10010010', '10101010', '10110110', '11101110', '11111110', '11111111'],
  /* 9 */ [
    '000000000', '100000000', '100010000', '100100100',
    '101010100', '101010101', '110110110', '111011101',
    '111111110', '111111111',
  ],
  /* 10 */ [
    '0000000000', '1000000000', '1000010000', '1001001000',
    '1010010100', '1010101010', '1010110101', '1101101101',
    '1111011110', '1111111110', '1111111111',
  ],
  /* 11 */ [
    '00000000000', '10000000000', '10000100000', '10001000100',
    '10010010010', '10101010100', '10101010101', '10110110110',
    '11011101110', '11110111101', '11111111110', '11111111111',
  ],
  /* 12 */ [
    '000000000000', '100000000000', '100000100000', '100010001000',
    '100100100100', '101001010010', '101010101010', '101011010110',
    '110110110110', '111011101110', '111110111110', '111111111110',
    '111111111111',
  ],
  /* 13 */ [
    '0000000000000', '1000000000000', '1000001000000', '1000100010000',
    '1001001001000', '1001010010100', '1010101010100', '1010101010101',
    '1011010110101', '1101101101101', '1110111011101', '1111101111101',
    '1111111111110', '1111111111111',
  ],
  /* 14 */ [
    '00000000000000', '10000000000000', '10000001000000', '10000100001000',
    '10010001001000', '10010010010010', '10101001010100', '10101010101010',
    '10101011010101', '10110110110110', '11011011101101', '11101111011110',
    '11111101111110', '11111111111110', '11111111111111',
  ],
  /* 15 */ [
    '000000000000000', '100000000000000', '100000010000000', '100001000010000',
    '100010001000100', '100100100100100', '101001010010100', '101010101010100',
    '101010101010101', '101011010110101', '110110110110110', '110111011101110',
    '111101111011110', '111111011111101', '111111111111110', '111111111111111',
  ],
  /* 16 */ [
    '0000000000000000', '1000000000000000', '1000000010000000', '1000010000100000',
    '1000100010001000', '1001001001001000', '1001001010010010', '1010100101010010',
    '1010101010101010', '1010101101010110', '1011011010110110', '1101101101101101',
    '1110111011101110', '1111011110111101', '1111111011111110', '1111111111111110',
    '1111111111111111',
  ],
].map((row) => row.map((pattern) => [...pattern].map(Number)));

// The browser starts the context suspended; it resumes on the first click or key press.
const audio = new AudioContext();
let synthBus; // gentle limiter that every track's synth feeds
let master; // master volume
let meters; // left and right analysers on the master output, with their smoothed levels
let tempoBpm = DEFAULT_BPM;
let playing = false;
let orbit; // the geometric pattern visualizer

// Sequencer state. Steps are scheduled a little ahead of time on the audio clock, from a
// worker timer so playback keeps time in background tabs. `tick` counts steps since the
// last stop; each track loops over its own pattern, so it plays pattern[tick % length].
const LOOKAHEAD = 0.1; // seconds of audio scheduled in advance
let tick = 0;
let nextStepTime = 0;
let ticker = null;
const TICKER_URL = URL.createObjectURL(new Blob(['setInterval(() => postMessage(0), 25)']));

// Returns the Euclidean pattern for the given step length and density, rotated left by `offset`.
// Density is capped at the step length, and a zero-length track is a single rest.
function euclidPattern(steps, density, offset) {
  if (steps === 0) {
    return [0];
  }
  const base = EUCLID[steps][Math.min(density, steps)];
  const shift = offset % steps;
  return base.slice(shift).concat(base.slice(0, shift));
}

function setup() {
  synthBus = audio.createDynamicsCompressor();
  synthBus.threshold.value = -6;
  synthBus.knee.value = 6;
  synthBus.ratio.value = 8;
  synthBus.attack.value = 0.002;
  synthBus.release.value = 0.12;

  // A hard limiter, then the master volume, then the speakers and the level meters.
  const limiter = audio.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.knee.value = 1;
  limiter.ratio.value = 20;
  master = audio.createGain();
  master.gain.value = DEFAULT_VOLUME;
  wire(synthBus, limiter, master, audio.destination);
  const splitter = audio.createChannelSplitter(2);
  master.connect(splitter);
  meters = ['meterL', 'meterR'].map((id, channel) => {
    const analyser = audio.createAnalyser();
    analyser.fftSize = 2048;
    splitter.connect(analyser, channel);
    return { analyser, samples: new Float32Array(analyser.fftSize), level: 0, el: document.getElementById(id) };
  });

  for (const track of TRACKS) {
    Object.assign(track, track.groove, { volume: DEFAULT_VOLUME, muted: false });
    track.voice = SYNTHS[track.synth];
    track.params = Object.assign({}, track.voice.presets[track.preset]);
    track.out = audio.createGain();
    track.out.connect(synthBus);
    track.pattern = euclidPattern(track.steps, track.density, track.offset);
    applyVolume(track);
  }

  buildRack();
  buildTransport();
  buildVisualizer();
  requestAnimationFrame(drawMeters);
}

function playTrack(track, time) {
  track.voice.play(audio, track.out, time, track.params);
}

// Plays a track once right away, as when its name is clicked.
async function preview(track) {
  await audio.resume();
  playTrack(track, audio.currentTime + 0.005);
  flash(track);
}

// Level meters: RMS of the latest audio, falling back gradually after each peak.
function drawMeters() {
  for (const meter of meters) {
    meter.analyser.getFloatTimeDomainData(meter.samples);
    let sum = 0;
    for (const x of meter.samples) sum += x * x;
    meter.level = Math.max(Math.sqrt(sum / meter.samples.length), meter.level * 0.92);
    meter.el.style.transform = `scaleY(${Math.min(1, meter.level * 3.2).toFixed(3)})`;
  }
  requestAnimationFrame(drawMeters);
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
      if (orbit) orbit.refresh();
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
  if (orbit) orbit.refresh();
}

// ---------- visualizer ----------

function buildVisualizer() {
  orbit = createVisualizer(document.getElementById('orbit'), TRACKS, {
    stepDuration: () => 60 / tempoBpm / 4,
    level: () => Math.max(meters[0].level, meters[1].level),
  });

  const panel = document.getElementById('orbitPanel');
  const toggle = document.getElementById('orbitToggle');
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Hide' : 'Show';
    panel.classList.toggle('collapsed', !open);
    orbit.refresh();
  });
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
    onChange: (v) => {
      master.gain.value = v;
    }
  });

  // Tempo display: drag vertically, scroll, or use the arrow keys, like a DAW tempo LCD.
  const tempo = document.getElementById('tempo');
  const setTempo = (bpm) => {
    tempoBpm = Math.min(240, Math.max(40, Math.round(bpm)));
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
  await audio.resume();
  if (playing) {
    pause();
  } else if (!ticker) {
    nextStepTime = audio.currentTime + 0.05;
    ticker = new Worker(TICKER_URL);
    ticker.onmessage = scheduleSteps;
    scheduleSteps();
    setPlaying(true);
  }
}

function pause() {
  if (ticker) ticker.terminate();
  ticker = null;
  setPlaying(false);
  orbit.pause();
}

function stop() {
  pause();
  tick = 0; // the next play starts from the top
  clearPlayhead();
  orbit.stop();
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

// Schedules every step due within the lookahead window. The playhead is drawn when
// each step is heard rather than when it is scheduled.
function scheduleSteps() {
  while (nextStepTime < audio.currentTime + LOOKAHEAD) {
    const step = tick++;
    const time = nextStepTime;
    for (const track of TRACKS) {
      if (track.pattern[step % track.pattern.length] && !track.muted) playTrack(track, time);
    }
    setTimeout(() => {
      if (playing) showTick(step);
    }, Math.max(0, (time - audio.currentTime) * 1000));
    nextStepTime += 60 / tempoBpm / 4; // sixteenth notes
  }
}

function showTick(tick) {
  clearPlayhead();
  orbit.step(tick);
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

setup();
