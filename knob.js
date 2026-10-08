// Rotary knob control in the style of a DAW channel knob.
// Drag up/down to change, Shift for fine control, mouse wheel, arrow keys,
// double-click to reset to the default value.

const KNOB_SWEEP = 270; // degrees of travel from min to max
const KNOB_START = -135; // angle of the minimum position (0deg = straight up)

function polar(cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function arcPath(cx, cy, r, fromDeg, toDeg) {
  const [x1, y1] = polar(cx, cy, r, fromDeg);
  const [x2, y2] = polar(cx, cy, r, toDeg);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function createKnob(parent, opts) {
  const o = Object.assign({
    min: 0, max: 1, value: 0, step: 1, label: '', size: 34,
    format: (v) => String(v), onChange: () => { }
  }, opts);
  if (o.default === undefined) o.default = o.value;

  let value = o.value;
  let max = o.max;

  const el = document.createElement('div');
  el.className = 'knob';
  el.tabIndex = 0;
  el.setAttribute('role', 'slider');
  el.setAttribute('aria-label', o.label);
  el.style.setProperty('--knob-size', o.size + 'px');

  const c = 20, r = 15;
  el.innerHTML = `
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <circle class="knob-body" cx="${c}" cy="${c}" r="11.5"></circle>
      <path class="knob-track" d="${arcPath(c, c, r, KNOB_START, KNOB_START + KNOB_SWEEP)}"></path>
      <path class="knob-fill"></path>
      <line class="knob-pointer" x1="${c}" y1="${c - 4}" x2="${c}" y2="${c - 10}"></line>
    </svg>
    <span class="knob-value"></span>`;
  const fill = el.querySelector('.knob-fill');
  const pointer = el.querySelector('.knob-pointer');
  const readout = el.querySelector('.knob-value');

  function render() {
    const t = max === o.min ? 0 : (value - o.min) / (max - o.min);
    const deg = KNOB_START + t * KNOB_SWEEP;
    fill.setAttribute('d', t > 0.001 ? arcPath(c, c, r, KNOB_START, deg) : '');
    pointer.setAttribute('transform', `rotate(${deg} ${c} ${c})`);
    readout.textContent = o.format(value);
    el.setAttribute('aria-valuemin', o.min);
    el.setAttribute('aria-valuemax', max);
    el.setAttribute('aria-valuenow', value);
    el.setAttribute('aria-valuetext', o.format(value));
    el.title = `${o.label}: ${o.format(value)}`;
  }

  function clamp(v) {
    const snapped = Math.round(v / o.step) * o.step;
    return Math.min(max, Math.max(o.min, +snapped.toFixed(4)));
  }

  function set(v, silent) {
    const next = clamp(v);
    if (next === value) return;
    value = next;
    render();
    if (!silent) o.onChange(value);
  }

  // Drag: full range over ~160px, or ~4x finer with Shift held.
  let dragStartY = 0, dragStartValue = 0;
  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    el.focus();
    el.setPointerCapture(e.pointerId);
    dragStartY = e.clientY;
    dragStartValue = value;
    el.classList.add('dragging');
  });
  el.addEventListener('pointermove', (e) => {
    if (!el.hasPointerCapture(e.pointerId)) return;
    const range = (max - o.min) || 1;
    const pixels = e.shiftKey ? 640 : 160;
    set(dragStartValue + (dragStartY - e.clientY) / pixels * range);
  });
  const endDrag = (e) => {
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    el.classList.remove('dragging');
  };
  el.addEventListener('pointerup', endDrag);
  el.addEventListener('pointercancel', endDrag);

  el.addEventListener('wheel', (e) => {
    e.preventDefault();
    set(value + (e.deltaY < 0 ? o.step : -o.step));
  }, { passive: false });

  el.addEventListener('dblclick', () => set(o.default));

  el.addEventListener('keydown', (e) => {
    const big = (max - o.min) / 10;
    const moves = {
      ArrowUp: o.step, ArrowRight: o.step, ArrowDown: -o.step, ArrowLeft: -o.step,
      PageUp: big, PageDown: -big
    };
    if (e.key in moves) {
      e.preventDefault();
      set(value + moves[e.key]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      set(o.min);
    } else if (e.key === 'End') {
      e.preventDefault();
      set(max);
    }
  });

  render();
  parent.appendChild(el);

  return {
    el,
    value: () => value,
    set,
    // Changes the upper bound; the value is clamped silently.
    setMax(m) {
      max = m;
      value = clamp(value);
      render();
    }
  };
}
