// Orbit: a geometric view of the sequence, drawn on a canvas.
//
// Every track is a ring, outermost first. Its steps sit evenly around the ring and its hits
// are joined into a polygon, so a Euclidean pattern shows up as a near-regular shape. While
// the loop plays, a comet circles each ring at that track's own speed (shorter tracks lap
// faster), hits flare as they sound, and the core breathes with the master level.

function createVisualizer(canvas, tracks, opts) {
  const ctx = canvas.getContext('2d');
  const pulses = tracks.map(() => 0); // per-track flash, 1 on a hit, decaying to 0
  let size = 0;
  let tick = -1; // last step heard, or -1 when stopped
  let tickAt = 0; // performance.now() when it was heard
  let playing = false;
  let dirty = true;
  let last = performance.now();

  new ResizeObserver(() => {
    const dpr = window.devicePixelRatio || 1;
    size = canvas.clientWidth;
    canvas.width = canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dirty = true;
  }).observe(canvas);

  // Angle of a (possibly fractional) step on a ring of `steps`, with step 0 at twelve o'clock.
  const angle = (step, steps) => -Math.PI / 2 + 2 * Math.PI * step / steps;
  const at = (r, a) => [size / 2 + r * Math.cos(a), size / 2 + r * Math.sin(a)];
  const alpha = (hex, a) => hex + Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');

  function frame(now) {
    const dt = (now - last) / 1000;
    last = now;
    let fading = false;
    pulses.forEach((p, i) => {
      pulses[i] = p * Math.exp(-dt / 0.22);
      if (pulses[i] > 0.005) fading = true;
    });
    if (size && (playing || fading || dirty)) draw(now);
    dirty = false;
    requestAnimationFrame(frame);
  }

  function draw(now) {
    const c = size / 2;
    const outer = c - 18;
    const core = outer * 0.2;
    const gap = (outer - core * 1.6) / Math.max(1, tracks.length - 1);
    // How far into the current step we are, so the comets glide instead of jumping.
    const phase = tick < 0 ? 0 : tick + (playing ? Math.min(1, (now - tickAt) / 1000 / opts.stepDuration()) : 0);

    ctx.clearRect(0, 0, size, size);
    ctx.lineCap = ctx.lineJoin = 'round';

    // Bezel: one tick per sixteenth of the bar, the current one lit.
    for (let i = 0; i < 16; i++) {
      const a = angle(i, 16);
      const lit = tick >= 0 && i === tick % 16;
      const [x1, y1] = at(outer + 8, a);
      const [x2, y2] = at(outer + (i % 4 ? 11 : 14), a);
      ctx.strokeStyle = lit ? '#9cf04f' : i % 4 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.28)';
      ctx.lineWidth = lit ? 3 : 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'lighter';
    tracks.forEach((track, t) => {
      const r = outer - t * gap;
      const n = track.steps;
      const dim = track.muted ? 0.3 : 1;
      const pulse = pulses[t];
      ctx.strokeStyle = alpha(track.color, 0.14 * dim);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(c, c, r, 0, 2 * Math.PI);
      ctx.stroke();
      if (!n) return;

      // The hit polygon (a spoke from the core for a single hit).
      const hits = [];
      for (let i = 0; i < n; i++) if (track.pattern[i]) hits.push(at(r, angle(i, n)));
      if (hits.length) {
        ctx.beginPath();
        if (hits.length === 1) ctx.moveTo(...at(core, angle(track.pattern.indexOf(1), n)));
        else ctx.moveTo(...hits[hits.length - 1]);
        for (const p of hits) ctx.lineTo(...p);
        ctx.fillStyle = alpha(track.color, (0.05 + pulse * 0.22) * dim);
        if (hits.length > 2) ctx.fill();
        ctx.strokeStyle = alpha(track.color, (0.45 + pulse * 0.55) * dim);
        ctx.lineWidth = 1.5 + pulse * 1.5;
        ctx.stroke();
      }

      // Step dots: rests small and faint, hits bright.
      for (let i = 0; i < n; i++) {
        const [x, y] = at(r, angle(i, n));
        const on = track.pattern[i] === 1;
        const current = tick >= 0 && on && i === tick % n;
        ctx.fillStyle = on ? alpha(track.color, dim) : `rgba(255,255,255,${0.16 * dim})`;
        ctx.beginPath();
        ctx.arc(x, y, on ? 3.2 + (current ? pulse * 5 : 0) : 1.6, 0, 2 * Math.PI);
        ctx.fill();
      }

      // The comet: a short fading tail behind the track's play position.
      if (tick < 0) return;
      const head = phase % n;
      const tail = Math.min(2.5, n * 0.4);
      const segments = 12;
      ctx.lineWidth = 3;
      for (let s = 0; s < segments; s++) {
        const from = head - tail * (1 - s / segments);
        const to = head - tail * (1 - (s + 1) / segments);
        ctx.strokeStyle = alpha(track.color, ((s + 1) / segments) * 0.7 * dim);
        ctx.beginPath();
        ctx.arc(c, c, r, angle(from, n), angle(to, n));
        ctx.stroke();
      }
      const [hx, hy] = at(r, angle(head, n));
      ctx.fillStyle = `rgba(255,255,255,${0.85 * dim})`;
      ctx.beginPath();
      ctx.arc(hx, hy, 2.6, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Core: glows with the master level, tinted by whichever tracks just hit.
    const level = Math.min(1, opts.level() * 3);
    const glow = ctx.createRadialGradient(c, c, 0, c, c, core * (1 + level * 0.6));
    glow.addColorStop(0, `rgba(255,190,110,${0.35 + level * 0.5})`);
    glow.addColorStop(1, 'rgba(255,159,46,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(c, c, core * 1.6, 0, 2 * Math.PI);
    ctx.fill();
    tracks.forEach((track, t) => {
      if (pulses[t] < 0.02) return;
      ctx.strokeStyle = alpha(track.color, pulses[t] * 0.8);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(c, c, core * (0.5 + t * 0.12 + (1 - pulses[t]) * 0.4), 0, 2 * Math.PI);
      ctx.stroke();
    });
    ctx.globalCompositeOperation = 'source-over';
  }

  requestAnimationFrame(frame);

  return {
    // A step was just heard: move the comets there and flare the tracks that hit on it.
    step(t) {
      tick = t;
      tickAt = performance.now();
      playing = true;
      tracks.forEach((track, i) => {
        if (track.steps && track.pattern[t % track.pattern.length] && !track.muted) pulses[i] = 1;
      });
    },
    pause() {
      playing = false;
      dirty = true;
    },
    stop() {
      playing = false;
      tick = -1;
      dirty = true;
    },
    // Patterns or mutes changed while stopped.
    refresh() {
      dirty = true;
    },
  };
}
