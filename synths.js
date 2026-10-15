// Drum synthesizers, built directly on the Web Audio API and modelled on the analog voices
// of the Erica Synths HexDrums: two bass drums, the Machine, snare, clap, rimshot and hihat.
//
// Each entry in VOICES describes one voice: its panel controls (knobs and switches, named
// after the HexDrums front panel) and a `play` function that schedules one hit.
// `play(ctx, out, time, p)` builds a short-lived node graph that starts at `time`
// (AudioContext seconds), connects it to `out`, and lets it stop and be garbage collected
// on its own. `p` holds the current control values, keyed by each control's `key`.
//
// A control with `options` is a switch and its value is one of those options; any other
// control is a knob with a numeric value between `min` and `max`.

let noiseBuffer = null;

// One second of white noise, shared by every voice that needs it.
function getNoise(ctx) {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

function noiseSource(ctx, time, duration, buffer = getNoise(ctx)) {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.start(time, Math.random() * 0.5);
  src.stop(time + duration);
  return src;
}

// Sample-and-hold noise, standing in for the clap's clocked LFSR noise: each random value is
// held for `hold` samples, so lower clock rates sound grainier and more bit-crushed.
const steppedNoise = {};
function getSteppedNoise(ctx, hold) {
  if (hold <= 1) return getNoise(ctx);
  if (!steppedNoise[hold]) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let value = 0;
    for (let i = 0; i < data.length; i++) {
      if (i % hold === 0) value = Math.random() < 0.5 ? -0.5 : 0.5; // about as loud as the white noise
      data[i] = value;
    }
    steppedNoise[hold] = buffer;
  }
  return steppedNoise[hold];
}

function biquad(ctx, type, frequency, Q = 0.7) {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = frequency;
  f.Q.value = Q;
  return f;
}

function oscillator(ctx, type, frequency) {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = frequency;
  return osc;
}

function gain(ctx, value) {
  const g = ctx.createGain();
  g.gain.value = value;
  return g;
}

// A gain node with a fast attack and an exponential decay starting at `time`.
function envelope(ctx, time, peak, decay, attack = 0.001) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.linearRampToValueAtTime(Math.max(peak, 0.0002), time + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, time + attack + decay);
  return g;
}

// Pitch envelope: starts `amount` octaves above `frequency` and falls back over `decay`.
function pitchSweep(param, time, frequency, amount, decay) {
  param.setValueAtTime(frequency * Math.pow(2, amount), time);
  param.exponentialRampToValueAtTime(frequency, time + decay);
}

// A short click: high-passed noise with a few milliseconds of decay.
function click(ctx, out, time, level) {
  if (level <= 0) return;
  wire(noiseSource(ctx, time, 0.02), biquad(ctx, 'highpass', 2000), envelope(ctx, time, level, 0.006), out);
}

// Chains nodes together, returning the last one.
function wire(...nodes) {
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]);
  return nodes[nodes.length - 1];
}

const pct = (v) => v / 100;
const sec = (ms) => ms / 1000;

const VOICES = {
  // Bass Drum 1: a VCO with a pitch envelope, a click and a square sub-oscillator an octave down.
  bd1: {
    name: 'BD1',
    title: 'Bass drum 1',
    controls: [
      { key: 'pitch', label: 'Pitch', min: 25, max: 200, step: 1, unit: 'Hz', default: 50 },
      { key: 'pitchDecay', label: 'P.Decay', min: 5, max: 500, step: 5, unit: 'ms', default: 60 },
      { key: 'decayAmount', label: 'D.Amount', min: 0, max: 100, step: 1, unit: '%', default: 45 },
      { key: 'decay', label: 'Decay', min: 30, max: 2000, step: 10, unit: 'ms', default: 600 },
      { key: 'click', label: 'Click', min: 0, max: 100, step: 1, unit: '%', default: 35 },
      { key: 'sub', label: 'Sub', min: 0, max: 100, step: 1, unit: '%', default: 0 },
      { key: 'wave', label: 'Wave', options: ['Sine', 'Square'], default: 'Sine' },
    ],
    play(ctx, out, t, p) {
      const decay = sec(p.decay);
      const amount = pct(p.decayAmount) * 3; // up to three octaves of sweep
      const body = envelope(ctx, t, 0.8, decay, 0.002);
      body.connect(out);

      const square = p.wave === 'Square';
      const osc = oscillator(ctx, square ? 'square' : 'sine', p.pitch);
      pitchSweep(osc.frequency, t, p.pitch, amount, sec(p.pitchDecay));
      if (square) wire(osc, gain(ctx, 0.45), biquad(ctx, 'lowpass', 3500), body);
      else osc.connect(body);
      osc.start(t);
      osc.stop(t + decay + 0.05);

      if (p.sub > 0) {
        const sub = oscillator(ctx, 'square', p.pitch / 2);
        pitchSweep(sub.frequency, t, p.pitch / 2, amount, sec(p.pitchDecay));
        wire(sub, gain(ctx, pct(p.sub) * 0.5), biquad(ctx, 'lowpass', 600), body);
        sub.start(t);
        sub.stop(t + decay + 0.05);
      }

      click(ctx, out, t, pct(p.click) * 0.5);
    }
  },

  // Bass Drum 2: an 808-style damped sine, with Tone opening a lowpass on its attack.
  bd2: {
    name: 'BD2',
    title: 'Bass drum 2',
    controls: [
      { key: 'pitch', label: 'Pitch', min: 30, max: 150, step: 1, unit: 'Hz', default: 52 },
      { key: 'decay', label: 'Decay', min: 50, max: 2500, step: 10, unit: 'ms', default: 900 },
      { key: 'tone', label: 'Tone', min: 0, max: 100, step: 1, unit: '%', default: 40 },
    ],
    play(ctx, out, t, p) {
      const decay = sec(p.decay);
      const tone = pct(p.tone);
      // The Twin-T circuit bends up slightly when struck, then rings at its own pitch.
      const osc = oscillator(ctx, 'sine', p.pitch);
      pitchSweep(osc.frequency, t, p.pitch, 0.25, 0.03);
      wire(osc, envelope(ctx, t, 0.85, decay, 0.001), out);
      osc.start(t);
      osc.stop(t + decay + 0.05);

      // The trigger pulse that excites the circuit; Tone sets how much of it gets through.
      const pulse = oscillator(ctx, 'square', p.pitch * 4);
      wire(pulse, biquad(ctx, 'lowpass', 150 * Math.pow(2, tone * 5.5)),
        envelope(ctx, t, 0.15 + tone * 0.3, 0.012), out);
      pulse.start(t);
      pulse.stop(t + 0.05);
    }
  },

  // The Machine: two triangle "membrane" oscillators with a shared pitch envelope, plus a
  // "snappy" section of tuned noise. Covers toms, congas, snares and stranger metallic hits.
  machine: {
    name: 'Machine',
    title: 'Machine',
    controls: [
      { key: 'pitch', label: 'Pitch', min: 40, max: 800, step: 1, unit: 'Hz', default: 180 },
      { key: 'detune', label: 'Detune', min: 1, max: 4, step: 0.01, unit: 'x', default: 1.5 },
      { key: 'm1', label: 'Mem 1', min: 0, max: 100, step: 1, unit: '%', default: 80 },
      { key: 'm2', label: 'Mem 2', min: 0, max: 100, step: 1, unit: '%', default: 40 },
      { key: 'pitchDecay', label: 'P.Decay', min: 5, max: 500, step: 5, unit: 'ms', default: 40 },
      { key: 'decayAmount', label: 'D.Amount', min: 0, max: 100, step: 1, unit: '%', default: 30 },
      { key: 'decay', label: 'Mem Decay', min: 20, max: 1500, step: 5, unit: 'ms', default: 250 },
      { key: 'click', label: 'Click', min: 0, max: 100, step: 1, unit: '%', default: 30 },
      { key: 'noisePitch', label: 'N.Pitch', min: 300, max: 12000, step: 50, unit: 'Hz', default: 4000 },
      { key: 'noiseDecay', label: 'N.Decay', min: 5, max: 3000, step: 5, unit: 'ms', default: 120 },
      { key: 'noise', label: 'N.Level', min: 0, max: 100, step: 1, unit: '%', default: 0 },
    ],
    play(ctx, out, t, p) {
      const decay = sec(p.decay);
      const amount = pct(p.decayAmount) * 2;
      const membrane = envelope(ctx, t, 0.6, decay);
      membrane.connect(out);
      for (const [ratio, level] of [[1, p.m1], [p.detune, p.m2]]) {
        if (level <= 0) continue;
        const osc = oscillator(ctx, 'triangle', p.pitch * ratio);
        pitchSweep(osc.frequency, t, p.pitch * ratio, amount, sec(p.pitchDecay));
        wire(osc, gain(ctx, pct(level)), membrane);
        osc.start(t);
        osc.stop(t + decay + 0.02);
      }

      click(ctx, out, t, pct(p.click) * 0.4);

      if (p.noise > 0) {
        const noiseDecay = sec(p.noiseDecay);
        wire(noiseSource(ctx, t, noiseDecay + 0.02), biquad(ctx, 'bandpass', p.noisePitch, 0.9),
          envelope(ctx, t, pct(p.noise) * 0.9, noiseDecay), out);
      }
    }
  },

  // Snare: a "shell" of two sine oscillators blended by Tone, and "snappy" noise through a
  // 12 dB/oct filter with switchable mode and a three-position resonance switch.
  snare: {
    name: 'Snare',
    title: 'Snare drum',
    controls: [
      { key: 'pitch', label: 'Shell', min: 100, max: 400, step: 1, unit: 'Hz', default: 185 },
      { key: 'tone', label: 'Tone', min: 0, max: 100, step: 1, unit: '%', default: 35 },
      { key: 'decay', label: 'Decay', min: 5, max: 3000, step: 5, unit: 'ms', default: 200 },
      { key: 'cutoff', label: 'Cutoff', min: 200, max: 12000, step: 50, unit: 'Hz', default: 3000 },
      { key: 'filter', label: 'Filter', options: ['HP', 'BP'], default: 'HP' },
      { key: 'resonance', label: 'Reso', options: ['Low', 'Mid', 'Up'], default: 'Low' },
      { key: 'mix', label: 'Shell/Snap', min: 0, max: 100, step: 1, unit: '%', default: 60 },
    ],
    play(ctx, out, t, p) {
      const tone = pct(p.tone);
      const snap = pct(p.mix);
      const shellDecay = 0.06 + 40 / p.pitch * 0.25; // lower shells ring a little longer
      const shell = envelope(ctx, t, 0.7 * (1 - snap * 0.7), shellDecay);
      shell.connect(out);
      for (const [ratio, level] of [[1, 1 - tone], [1.6, tone]]) {
        if (level <= 0) continue;
        const osc = oscillator(ctx, 'sine', p.pitch * ratio);
        pitchSweep(osc.frequency, t, p.pitch * ratio, 0.3, 0.02);
        wire(osc, gain(ctx, level), shell);
        osc.start(t);
        osc.stop(t + shellDecay + 0.02);
      }

      const decay = sec(p.decay);
      const Q = { Low: 0.7, Mid: 4, Up: 22 }[p.resonance];
      const level = snap * (p.resonance === 'Up' ? 0.3 : 0.6);
      wire(noiseSource(ctx, t, decay + 0.02), biquad(ctx, p.filter === 'BP' ? 'bandpass' : 'highpass', p.cutoff, Q),
        envelope(ctx, t, level, decay), out);
    }
  },

  // Clap: clocked noise (Pitch runs from crunchy to white), a resonant bandpass, the usual
  // burst of quick retriggers, and a simulated reverb fed from before or after the filter.
  clap: {
    name: 'Clap',
    title: 'Clap',
    controls: [
      { key: 'pitch', label: 'Pitch', min: 0, max: 100, step: 1, unit: '%', default: 100 },
      { key: 'sustain', label: 'Sustain', min: 20, max: 600, step: 5, unit: 'ms', default: 140 },
      { key: 'cutoff', label: 'Cutoff', min: 300, max: 8000, step: 10, unit: 'Hz', default: 1200 },
      { key: 'filter', label: 'Filter', options: ['On', 'Off'], default: 'On' },
      { key: 'reverb', label: 'Reverb', options: ['Off', 'Pre', 'Post'], default: 'Post' },
      { key: 'reverbDecay', label: 'Rev Decay', min: 100, max: 3000, step: 10, unit: 'ms', default: 600 },
    ],
    play(ctx, out, t, p) {
      // Pitch sets the noise clock from 1 kHz up to the full sample rate (white noise).
      const clock = 1000 * Math.pow(ctx.sampleRate / 1000, pct(p.pitch));
      const buffer = getSteppedNoise(ctx, Math.max(1, Math.round(ctx.sampleRate / clock)));
      const sustain = sec(p.sustain);
      const spread = 0.011;
      const end = 3 * spread + sustain;

      const source = noiseSource(ctx, t, end + 0.02, buffer);
      const filtered = p.filter === 'On' ? wire(source, biquad(ctx, 'bandpass', p.cutoff, 2.2)) : source;
      const level = p.filter === 'On' ? 0.9 : 0.35;

      const bursts = ctx.createGain();
      const g = bursts.gain;
      g.setValueAtTime(0.0001, t);
      for (let i = 0; i < 3; i++) {
        g.setValueAtTime(level, t + i * spread);
        g.exponentialRampToValueAtTime(level * 0.1, t + (i + 0.9) * spread);
      }
      g.setValueAtTime(level, t + 3 * spread);
      g.exponentialRampToValueAtTime(0.0001, t + end);
      wire(filtered, bursts, out);

      if (p.reverb !== 'Off') {
        const tail = sec(p.reverbDecay);
        const roomSource = noiseSource(ctx, t, tail + 0.05, buffer);
        const room = p.reverb === 'Post'
          ? wire(roomSource, biquad(ctx, 'bandpass', p.cutoff, 1.2))
          : wire(roomSource, biquad(ctx, 'lowpass', 6000));
        wire(room, envelope(ctx, t + 3 * spread, p.reverb === 'Post' ? 0.3 : 0.12, tail, 0.015), out);
      }
    }
  },

  // Rimshot: three pinged oscillators into a resonant state-variable style filter. MOD DECAY
  // sets the envelope, which also sweeps the cutoff by the bipolar FILTER MOD amount.
  rimshot: {
    name: 'Rimshot',
    title: 'Rimshot',
    controls: [
      { key: 'pitch', label: 'Pitch', min: 200, max: 1200, step: 5, unit: 'Hz', default: 460 },
      { key: 'mode', label: 'Mode', options: ['Hi', 'Low', 'Clv'], default: 'Hi' },
      { key: 'decay', label: 'Mod Decay', min: 5, max: 800, step: 5, unit: 'ms', default: 45 },
      { key: 'cutoff', label: 'Cutoff', min: 100, max: 12000, step: 50, unit: 'Hz', default: 2500 },
      { key: 'resonance', label: 'Reso', min: 0, max: 100, step: 1, unit: '%', default: 20 },
      { key: 'filter', label: 'Filter', options: ['LP', 'HP', 'BP'], default: 'HP' },
      { key: 'filterMod', label: 'F.Mod', min: -100, max: 100, step: 1, unit: '±', default: 0 },
    ],
    play(ctx, out, t, p) {
      const decay = sec(p.decay);
      const freqs = {
        Hi: [p.pitch, 1700, 3200],
        Low: [p.pitch, 455, 830],
        Clv: [p.pitch * 2.2],
      }[p.mode];

      const type = { LP: 'lowpass', HP: 'highpass', BP: 'bandpass' }[p.filter];
      const f = biquad(ctx, type, p.cutoff, 0.5 + Math.pow(pct(p.resonance), 2) * 12);
      if (p.filterMod !== 0) {
        const target = Math.min(18000, Math.max(40, p.cutoff * Math.pow(2, pct(p.filterMod) * 4)));
        f.frequency.setValueAtTime(target, t);
        f.frequency.exponentialRampToValueAtTime(p.cutoff, t + decay);
      }
      const vca = envelope(ctx, t, p.filter === 'HP' ? 0.8 : p.filter === 'BP' ? 1.2 : 0.7, decay);
      wire(f, vca, out);

      for (const freq of freqs) {
        const osc = oscillator(ctx, freqs.length === 1 ? 'triangle' : 'sine', freq);
        wire(osc, gain(ctx, 1 / freqs.length + 0.2), f);
        osc.start(t);
        osc.stop(t + decay + 0.02);
      }
    }
  },

  // Hihat: TR-808-style metallic squares mixed with noise, through a resonant bandpass that
  // can be switched out. Closed hats have a fixed short decay; DECAY sets the open hat.
  hihat: {
    name: 'HiHat',
    title: 'Hihat',
    controls: [
      { key: 'hat', label: 'Hat', options: ['Closed', 'Open'], default: 'Closed' },
      { key: 'decay', label: 'OH Decay', min: 50, max: 2000, step: 10, unit: 'ms', default: 450 },
      { key: 'cutoff', label: 'Cutoff', min: 2000, max: 16000, step: 100, unit: 'Hz', default: 9000 },
      { key: 'filter', label: 'Filter', options: ['On', 'Off'], default: 'On' },
    ],
    play(ctx, out, t, p) {
      const decay = p.hat === 'Open' ? sec(p.decay) : 0.045;
      const end = decay + 0.02;
      const mix = gain(ctx, 1);
      const shaped = p.filter === 'On'
        ? wire(mix, biquad(ctx, 'bandpass', p.cutoff, 1.6))
        : wire(mix, biquad(ctx, 'highpass', 6000));
      wire(shaped, envelope(ctx, t, p.filter === 'On' ? 1.1 : 0.5, decay), out);

      const squares = gain(ctx, 0.12);
      squares.connect(mix);
      for (const ratio of [2, 3, 4.16, 5.43, 6.79, 8.21]) {
        const osc = oscillator(ctx, 'square', 400 * ratio);
        osc.connect(squares);
        osc.start(t);
        osc.stop(t + end);
      }
      wire(noiseSource(ctx, t, end), gain(ctx, 0.6), mix);
    }
  },
};

// Starting values for a voice's controls, with any per-track overrides applied.
function voiceDefaults(voiceId, overrides = {}) {
  const values = {};
  for (const c of VOICES[voiceId].controls) values[c.key] = c.default;
  return Object.assign(values, overrides);
}

// Knob readout for a control value.
function formatControl(control, value) {
  switch (control.unit) {
    case 'ms': return value >= 1000 ? (value / 1000).toFixed(2) + 's' : value + 'ms';
    case 'Hz': return value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value + 'Hz';
    case 'x': return '×' + value.toFixed(2);
    case '±': return (value > 0 ? '+' : '') + value;
    default: return value + control.unit;
  }
}
