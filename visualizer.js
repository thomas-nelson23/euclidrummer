// Orbit: a geometric view of the sequence, drawn on a canvas.
//
// Every track is a ring, outermost first. Its steps sit evenly around the ring and its hits
// are joined into a polygon, so a Euclidean pattern shows up as a near-regular shape. While
// the loop plays, each ring marks the step it is on, so tracks of different lengths can be
// seen drifting against each other.

function createVisualizer(canvas, tracks) {
  const ctx = canvas.getContext('2d');
  let size = 0;
  let tick = -1; // last step heard, or -1 when stopped
  let queued = false;

  new ResizeObserver(() => {
    const dpr = window.devicePixelRatio || 1;
    size = canvas.clientWidth;
    canvas.width = canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }).observe(canvas);

  // Angle of a step on a ring of `steps`, with step 0 at twelve o'clock.
  const angle = (step, steps) => -Math.PI / 2 + 2 * Math.PI * step / steps;
  const at = (r, a) => [size / 2 + r * Math.cos(a), size / 2 + r * Math.sin(a)];
  const alpha = (hex, a) => hex + Math.round(a * 255).toString(16).padStart(2, '0');

  function dot(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
  }

  // Redraws at most once per frame, and only when something changed.
  function redraw() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      draw();
    });
  }

  function draw() {
    if (!size) return;
    const c = size / 2;
    const outer = c - 14;
    const inner = outer * 0.3;
    const gap = (outer - inner) / Math.max(1, tracks.length - 1);

    ctx.clearRect(0, 0, size, size);
    ctx.lineCap = ctx.lineJoin = 'round';

    // Bezel: one tick per sixteenth of the bar, the current one lit.
    for (let i = 0; i < 16; i++) {
      const a = angle(i, 16);
      const lit = tick >= 0 && i === tick % 16;
      const [x1, y1] = at(outer + 6, a);
      const [x2, y2] = at(outer + (i % 4 ? 9 : 12), a);
      ctx.strokeStyle = lit ? 'rgba(156,240,79,0.9)' : i % 4 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.22)';
      ctx.lineWidth = lit ? 2 : 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Guide rings first, so no shape is crossed by another track's ring.
    tracks.forEach((track, t) => {
      ctx.strokeStyle = alpha(track.color, track.muted ? 0.05 : 0.12);
      ctx.lineWidth = 1;
      dot(c, c, outer - t * gap);
      ctx.stroke();
    });

    // Shapes, innermost on top so the small ones stay readable.
    for (let t = tracks.length - 1; t >= 0; t--) {
      const track = tracks[t];
      const n = track.steps;
      if (!n) continue;
      const r = outer - t * gap;
      const dim = track.muted ? 0.3 : 1;
      const hits = [];
      for (let i = 0; i < n; i++) if (track.pattern[i]) hits.push(i);

      if (hits.length) {
        const points = hits.map((i) => at(r, angle(i, n)));
        ctx.beginPath();
        if (hits.length === 1) ctx.moveTo(c, c); // a single hit is a spoke
        else ctx.moveTo(...points[points.length - 1]);
        for (const p of points) ctx.lineTo(...p);
        if (hits.length > 2) {
          ctx.fillStyle = alpha(track.color, 0.08 * dim);
          ctx.fill();
        }
        ctx.strokeStyle = alpha(track.color, 0.85 * dim);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Step dots: rests as faint specks, hits in the track's colour.
      for (let i = 0; i < n; i++) {
        const [x, y] = at(r, angle(i, n));
        if (track.pattern[i]) {
          ctx.fillStyle = alpha(track.color, dim);
          dot(x, y, 3);
        } else {
          ctx.fillStyle = `rgba(255,255,255,${0.14 * dim})`;
          dot(x, y, 1.3);
        }
        ctx.fill();
      }

      // While playing, a ring around the step this track is on, filled in when it hits.
      if (tick >= 0) {
        const i = tick % n;
        const [x, y] = at(r, angle(i, n));
        ctx.strokeStyle = `rgba(255,255,255,${0.6 * dim})`;
        ctx.lineWidth = 1.5;
        dot(x, y, 5.5);
        ctx.stroke();
        if (track.pattern[i]) {
          ctx.fillStyle = `rgba(255,255,255,${0.9 * dim})`;
          dot(x, y, 3);
          ctx.fill();
        }
      }
    }

    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    dot(c, c, 2);
    ctx.fill();
  }

  return {
    // A step was just heard: mark it on every ring.
    step(t) {
      tick = t;
      redraw();
    },
    stop() {
      tick = -1;
      redraw();
    },
    // Patterns, mutes or visibility changed.
    refresh: redraw,
  };
}
