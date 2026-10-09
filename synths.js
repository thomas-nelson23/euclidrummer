// Drum synthesizers, built directly on the Web Audio API.
//
// Each entry in SYNTHS describes one drum voice: the parameters shown as knobs in its
// channel's synth panel, a few presets, and a `play` function that schedules one hit.
// `play(ctx, out, time, p)` builds a short-lived node graph that starts at `time`
// (AudioContext seconds), connects it to `out`, and lets it stop and be garbage collected
// on its own. `p` holds the current parameter values, keyed by each param's `key`.

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

function noiseSource(ctx, time, duration) {
  const src = ctx.createBufferSource();
  src.buffer = getNoise(ctx);
  src.loop = true;
  src.start(time, Math.random() * 0.5);
  src.stop(time + duration);
  return src;
}

function biquad(ctx, type, frequency, Q = 0.7) {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = frequency;
  f.Q.value = Q;
  return f;
}

// A gain node with a fast attack and an exponential decay starting at `time`.
function envelope(ctx, time, peak, decay, attack = 0.001) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.linearRampToValueAtTime(peak, time + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, time + attack + decay);
  return g;
}

// Soft-clipping curves for the kick's Drive knob, cached per setting.
const driveCurves = {};
function driveCurve(amount) {
  const k = Math.round(amount);
  if (!driveCurves[k]) {
    const curve = new Float32Array(1024);
    const gain = 1 + k / 8;
    for (let i = 0; i < curve.length; i++) {
      const x = (i / (curve.length - 1)) * 2 - 1;
      curve[i] = Math.tanh(gain * x) / Math.tanh(gain);
    }
    driveCurves[k] = curve;
  }
  return driveCurves[k];
}

// Chains nodes together, returning the last one.
function wire(...nodes) {
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]);
  return nodes[nodes.length - 1];
}

const SYNTHS = {
  // Sine oscillator with a fast downward pitch sweep, a click on the attack and a soft clipper.
  kick: {
    params: [
      { key: 'tune', label: 'Tune', min: 30, max: 120, step: 1, unit: 'Hz' },
      { key: 'punch', label: 'Punch', min: 0, max: 100, step: 1, unit: '%' },
      { key: 'decay', label: 'Decay', min: 80, max: 1500, step: 10, unit: 'ms' },
      { key: 'drive', label: 'Drive', min: 0, max: 100, step: 1, unit: '%' },
    ],
    presets: {
      '808': { tune: 46, punch: 40, decay: 900, drive: 10 },
      'Punchy': { tune: 55, punch: 75, decay: 420, drive: 35 },
      'Tight': { tune: 64, punch: 55, decay: 220, drive: 15 },
    },
    play(ctx, out, t, p) {
      const decay = p.decay / 1000;
      const punch = p.punch / 100;
      const osc = ctx.createOscillator();
      osc.frequency.setValueAtTime(p.tune * (1 + punch * 7), t);
      osc.frequency.exponentialRampToValueAtTime(p.tune, t + 0.03 + punch * 0.05);
      const shaper = ctx.createWaveShaper();
      shaper.curve = driveCurve(p.drive);
      wire(osc, envelope(ctx, t, 0.8, decay, 0.002), shaper, out);
      osc.start(t);
      osc.stop(t + decay + 0.05);

      wire(noiseSource(ctx, t, 0.02), biquad(ctx, 'highpass', 2500), envelope(ctx, t, 0.08 + punch * 0.2, 0.008), out);
    }
  },

  // Two detuned oscillators for the drum body, plus high-passed noise for the snare wires.
  snare: {
    params: [
      { key: 'tune', label: 'Tune', min: 120, max: 350, step: 1, unit: 'Hz' },
      { key: 'tone', label: 'Tone', min: 1000, max: 9000, step: 50, unit: 'Hz' },
      { key: 'snap', label: 'Snap', min: 0, max: 100, step: 1, unit: '%' },
      { key: 'decay', label: 'Decay', min: 50, max: 600, step: 5, unit: 'ms' },
    ],
    presets: {
      'Classic': { tune: 190, tone: 3500, snap: 60, decay: 220 },
      'Tight': { tune: 240, tone: 5500, snap: 75, decay: 120 },
      'Fat': { tune: 150, tone: 2500, snap: 45, decay: 380 },
    },
    play(ctx, out, t, p) {
      const decay = p.decay / 1000;
      const snap = p.snap / 100;
      const body = envelope(ctx, t, 0.55 * (1 - snap * 0.5), decay * 0.5);
      body.connect(out);
      for (const [type, ratio] of [['triangle', 1], ['sine', 1.48]]) {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(p.tune * ratio * 1.3, t);
        osc.frequency.exponentialRampToValueAtTime(p.tune * ratio, t + 0.03);
        osc.connect(body);
        osc.start(t);
        osc.stop(t + decay);
      }

      wire(noiseSource(ctx, t, decay + 0.02), biquad(ctx, 'highpass', p.tone),
        envelope(ctx, t, 0.12 + snap * 0.45, decay), out);
    }
  },

  // Band-passed noise retriggered a few times in quick succession, with an optional room tail.
  clap: {
    params: [
      { key: 'tone', label: 'Tone', min: 600, max: 3500, step: 10, unit: 'Hz' },
      { key: 'spread', label: 'Spread', min: 3, max: 25, step: 1, unit: 'ms' },
      { key: 'decay', label: 'Decay', min: 50, max: 800, step: 5, unit: 'ms' },
      { key: 'room', label: 'Room', min: 0, max: 100, step: 1, unit: '%' },
    ],
    presets: {
      'Classic': { tone: 1200, spread: 10, decay: 220, room: 30 },
      'Tight': { tone: 1700, spread: 6, decay: 120, room: 10 },
      'Big': { tone: 950, spread: 16, decay: 420, room: 70 },
    },
    play(ctx, out, t, p) {
      const decay = p.decay / 1000;
      const spread = p.spread / 1000;
      const room = p.room / 100;
      const end = 3 * spread + decay;

      const bursts = ctx.createGain();
      const g = bursts.gain;
      g.setValueAtTime(0.0001, t);
      for (let i = 0; i < 3; i++) {
        g.setValueAtTime(0.7, t + i * spread);
        g.exponentialRampToValueAtTime(0.08, t + (i + 0.9) * spread);
      }
      g.setValueAtTime(0.7, t + 3 * spread);
      g.exponentialRampToValueAtTime(0.0001, t + end);
      wire(noiseSource(ctx, t, end + 0.02), biquad(ctx, 'bandpass', p.tone, 1.4), bursts, out);

      if (room > 0) {
        const tail = decay * 2.5;
        wire(noiseSource(ctx, t, tail + 0.02), biquad(ctx, 'bandpass', p.tone * 0.8, 0.8),
          envelope(ctx, t + 3 * spread, 0.2 * room, tail, 0.01), out);
      }
    }
  },

  // Six square waves at the inharmonic ratios of the TR-808 cymbal circuit, mixed with
  // noise and high-passed. Turning up Decay opens the hat.
  hihat: {
    params: [
      { key: 'tune', label: 'Tune', min: 200, max: 600, step: 5, unit: 'Hz' },
      { key: 'tone', label: 'Tone', min: 3000, max: 12000, step: 100, unit: 'Hz' },
      { key: 'decay', label: 'Decay', min: 20, max: 1000, step: 5, unit: 'ms' },
      { key: 'metal', label: 'Metal', min: 0, max: 100, step: 1, unit: '%' },
    ],
    presets: {
      'Closed': { tune: 400, tone: 7000, decay: 55, metal: 60 },
      'Open': { tune: 400, tone: 6500, decay: 450, metal: 60 },
      'Crisp': { tune: 500, tone: 9500, decay: 35, metal: 30 },
    },
    play(ctx, out, t, p) {
      const decay = p.decay / 1000;
      const metal = p.metal / 100;
      const highpass = biquad(ctx, 'highpass', p.tone);
      wire(highpass, envelope(ctx, t, 0.9, decay), out);

      const squares = ctx.createGain();
      squares.gain.value = metal * 0.25;
      squares.connect(highpass);
      for (const ratio of [2, 3, 4.16, 5.43, 6.79, 8.21]) {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = p.tune * ratio;
        osc.connect(squares);
        osc.start(t);
        osc.stop(t + decay + 0.02);
      }

      const noise = ctx.createGain();
      noise.gain.value = (1 - metal) * 0.9;
      wire(noiseSource(ctx, t, decay + 0.02), noise, highpass);
    }
  },

  // A pitched sine with a downward bend and optional FM for metallic tones: covers congas,
  // toms, rims and cowbell-like sounds.
  perc: {
    params: [
      { key: 'tune', label: 'Tune', min: 80, max: 1200, step: 5, unit: 'Hz' },
      { key: 'decay', label: 'Decay', min: 20, max: 800, step: 5, unit: 'ms' },
      { key: 'bend', label: 'Bend', min: 0, max: 100, step: 1, unit: '%' },
      { key: 'color', label: 'Color', min: 0, max: 100, step: 1, unit: '%' },
    ],
    presets: {
      'Conga': { tune: 330, decay: 200, bend: 20, color: 0 },
      'Tom': { tune: 140, decay: 380, bend: 45, color: 0 },
      'Cowbell': { tune: 560, decay: 260, bend: 0, color: 55 },
      'Rim': { tune: 900, decay: 40, bend: 10, color: 35 },
    },
    play(ctx, out, t, p) {
      const decay = p.decay / 1000;
      const bend = p.bend / 100;
      const color = p.color / 100;
      const sweep = Math.max(0.02, decay * 0.4);

      const carrier = ctx.createOscillator();
      carrier.frequency.setValueAtTime(p.tune * (1 + bend * 1.5), t);
      carrier.frequency.exponentialRampToValueAtTime(p.tune, t + sweep);
      wire(carrier, envelope(ctx, t, 0.6, decay), out);
      carrier.start(t);
      carrier.stop(t + decay + 0.02);

      if (color > 0) {
        const mod = ctx.createOscillator();
        mod.frequency.setValueAtTime(p.tune * 1.41 * (1 + bend * 1.5), t);
        mod.frequency.exponentialRampToValueAtTime(p.tune * 1.41, t + sweep);
        const depth = ctx.createGain();
        depth.gain.value = color * p.tune * 3;
        wire(mod, depth, carrier.frequency);
        mod.start(t);
        mod.stop(t + decay + 0.02);
      }

      wire(noiseSource(ctx, t, 0.01), biquad(ctx, 'highpass', 3000), envelope(ctx, t, 0.15, 0.005), out);
    }
  },
};

// Knob readout for a parameter value.
function formatParam(param, value) {
  if (param.unit === 'ms' && value >= 1000) return (value / 1000).toFixed(2) + 's';
  if (param.unit === 'Hz' && value >= 1000) return (value / 1000).toFixed(1) + 'k';
  return value + param.unit;
}
