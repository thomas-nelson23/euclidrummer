// Backdrop: one slowly turning wireframe cube in the top corner, as on the Home Dashboard.
// Purely decorative. It turns a little faster on each beat while the loop plays, and holds
// still when the system asks for reduced motion.

const backdrop = (() => {
  const front = document.getElementById('cubeFront');
  const back = document.getElementById('cubeBack');

  // [axis held fixed, its value, outward normal] for the six faces.
  const FACES = [
    [2, 1, [0, 0, 1]], [2, 0, [0, 0, -1]],
    [0, 1, [1, 0, 0]], [0, 0, [-1, 0, 0]],
    [1, 1, [0, 1, 0]], [1, 0, [0, -1, 0]],
  ];
  const SIZE = 100;
  const GRID = 3; // a 3×3×3 lattice on every face
  const IDLE = 0.06; // radians a second about the cube's own vertical axis

  const apply = (m, [x, y, z]) => m.map((r) => r[0] * x + r[1] * y + r[2] * z);
  const mul = (a, b) => a.map((r) => [0, 1, 2].map((j) => r[0] * b[0][j] + r[1] * b[1][j] + r[2] * b[2][j]));
  const rotX = (t) => [[1, 0, 0], [0, Math.cos(t), -Math.sin(t)], [0, Math.sin(t), Math.cos(t)]];
  const rotZ = (t) => [[Math.cos(t), -Math.sin(t), 0], [Math.sin(t), Math.cos(t), 0], [0, 0, 1]];
  // Seen from a little above, corner on.
  const TILT = rotX(-1.0);

  // Draws the lattice turned by `turn`; faces pointing away go in the dimmer back path.
  function draw(turn) {
    const m = mul(TILT, rotZ(Math.PI / 4 + turn));
    const at = (p) => {
      const [x, y] = apply(m, p.map((v) => (v - 0.5) * SIZE));
      return `${x.toFixed(1)},${(-y).toFixed(1)}`;
    };
    const near = [];
    const far = [];
    for (const [axis, value, normal] of FACES) {
      const out = apply(m, normal)[2] > 0 ? near : far;
      const [a, b] = [0, 1, 2].filter((k) => k !== axis);
      for (let i = 0; i <= GRID; i++) {
        for (const [u, v] of [[a, b], [b, a]]) {
          const p = [0, 0, 0];
          const q = [0, 0, 0];
          p[axis] = q[axis] = value;
          p[u] = q[u] = i / GRID;
          q[v] = 1;
          out.push(`M${at(p)}L${at(q)}`);
        }
      }
    }
    front.setAttribute('d', near.join(''));
    back.setAttribute('d', far.join(''));
  }

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let turn = 0;
  let boost = 0; // extra spin from beats, fading back to idle
  let last = performance.now();

  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    turn += (IDLE + boost) * dt;
    boost *= Math.exp(-dt * 3);
    draw(turn);
    requestAnimationFrame(frame);
  }

  draw(0);
  if (!still) requestAnimationFrame(frame);

  return {
    // A beat went by: give the cube a small push.
    pulse() {
      if (!still) boost = Math.min(boost + 0.35, 0.9);
    },
  };
})();
