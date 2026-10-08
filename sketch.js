// EucliDrummer: a five-track Euclidean drum machine built on p5.js and p5.sound.
//
// Each track has a step length, a density (number of hits spread evenly across
// the steps) and an offset (rotation of the pattern). Patterns can also be edited
// by clicking cells in the grid. Press the spacebar to start and stop playback.

const MAX_STEPS = 16;
const DEFAULT_BPM = 90;

// Layout (canvas pixels)
const CANVAS_WIDTH = 900;
const Y_OFF = 40;
const SLIDER_Y_OFF = 40;
const ROW_HEIGHT = 30;
const GRID_LEFT = 300;
const GRID_RIGHT = 620;
const GRID_TOP = 80 + Y_OFF;
const GRID_BOTTOM = 230 + Y_OFF;
const CELL_WIDTH = 20;

// One entry per track, in display order. `phrase` names the p5.Phrase for the track.
const TRACKS = [
  { phrase: 'hh', label: 'HiHat', files: ['hat', 'hh2', 'hh3'], options: ['HiHat 1', 'HiHat 2', 'HiHat 3'] },
  { phrase: 'clap', label: 'Clap', files: ['clap', 'clap2', 'clap3'], options: ['Clap 1', 'Clap 2', 'Clap 3'] },
  { phrase: 'bass', label: 'Kick', files: ['bass', 'bass2', 'bass3'], options: ['Kick 1', 'Kick 2', 'Kick 3'] },
  { phrase: 'p1', label: 'Perc 1', files: ['p1-1', 'p1-2', 'p1-3'], options: ['Perc 1', 'Perc 2', 'Perc 3'] },
  { phrase: 'p2', label: 'Perc 2', files: ['p2-1', 'p2-2', 'p2-3'], options: ['Perc 4', 'Perc 5', 'Perc 6'] },
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

let cnv;
let drums; // p5.Part that drives every track's phrase
let tempoSlider;

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
  cnv = createCanvas(CANVAS_WIDTH, windowHeight);
  const sliderOffset = windowWidth / 2 - CANVAS_WIDTH / 2;

  drums = new p5.Part();

  TRACKS.forEach((track) => {
    track.sounds = track.files.map((file) => loadSound(`assets/${file}.mp3`));
    track.sound = track.sounds[0];
    track.pattern = euclidArray[MAX_STEPS][0];
    drums.addPhrase(new p5.Phrase(track.phrase, (time) => track.sound.play(time), track.pattern));
  });

  const playBtn = createDiv('click to start audio');
  playBtn.position(500, 550);
  userStartAudio().then(() => playBtn.remove());

  // Controls are created column by column so the tab order runs down each column.
  const sliderY = (i) => 300 + i * ROW_HEIGHT + Y_OFF + SLIDER_Y_OFF;
  TRACKS.forEach((track, i) => {
    track.stepSlider = createTrackSlider(0, MAX_STEPS, MAX_STEPS, 190 + sliderOffset, sliderY(i));
  });
  TRACKS.forEach((track, i) => {
    track.densitySlider = createTrackSlider(0, MAX_STEPS, 0, 420 + sliderOffset, sliderY(i));
  });
  TRACKS.forEach((track, i) => {
    // The offset slider runs 1-17 and is shown as 0-16.
    track.offsetSlider = createTrackSlider(1, MAX_STEPS + 1, 1, 640 + sliderOffset, sliderY(i));
  });
  for (const track of TRACKS) {
    for (const slider of [track.stepSlider, track.densitySlider, track.offsetSlider]) {
      slider.input(() => {
        setPattern(track, euclidPattern(track.stepSlider.value(), track.densitySlider.value(), track.offsetSlider.value() - 1));
      });
    }
  }

  tempoSlider = createSlider(40, 240, DEFAULT_BPM, 1);
  tempoSlider.position(520 + sliderOffset, 540 + SLIDER_Y_OFF);
  tempoSlider.style('width', '80px');
  tempoSlider.input(() => {
    drums.setBPM(tempoSlider.value());
    redrawUI();
  });
  drums.setBPM(DEFAULT_BPM);

  TRACKS.forEach((track, i) => {
    track.select = createSelect();
    track.select.position(200 + sliderOffset, 86 + i * ROW_HEIGHT + Y_OFF);
    track.options.forEach((option) => track.select.option(option));
    track.select.changed(() => {
      track.sound = track.sounds[track.options.indexOf(track.select.value())];
    });
  });

  cnv.mouseClicked(stepClick);

  noLoop();
  redrawUI();
}

function createTrackSlider(minValue, maxValue, value, x, y) {
  const slider = createSlider(minValue, maxValue, value, 1);
  slider.position(x, y);
  slider.style('width', '80px');
  return slider;
}

// Swaps in a new pattern for a track and redraws.
function setPattern(track, pattern) {
  track.pattern = pattern;
  drums.replaceSequence(track.phrase, pattern);
  redrawUI();
}

function redrawUI() {
  background(100);
  strokeWeight(1);
  stroke(0);
  fill(0);

  textSize(40);
  text('EucliDrummer', 330, 70);

  textSize(25);
  text('Steps', 200, 350);
  text('Density', 420, 350);
  text('Offset', 650, 350);

  textSize(20);
  drawGrid();

  strokeWeight(0);
  TRACKS.forEach((track, i) => {
    const rowY = i * ROW_HEIGHT;
    text(track.densitySlider.value() + ' / ' + track.stepSlider.value(), 640, 140 + rowY);
    text(track.offsetSlider.value() - 1, 740, 359 + rowY + SLIDER_Y_OFF);
    text(track.label, 110, 400 + rowY);
  });

  text('Tempo: ' + tempoSlider.value() + ' BPM', 360, 600);
}

function drawGrid() {
  for (let x = GRID_LEFT; x < 640; x += CELL_WIDTH) {
    line(x, GRID_TOP, x, GRID_BOTTOM);
  }
  strokeWeight(1.8);
  for (let y = 80; y < 250; y += ROW_HEIGHT) {
    line(GRID_LEFT, y + Y_OFF, GRID_RIGHT, y + Y_OFF);
  }
  strokeWeight(3);
  for (let x = GRID_LEFT; x < 640; x += CELL_WIDTH * 4) {
    line(x, GRID_TOP, x, GRID_BOTTOM);
  }

  // One dot per step; active steps get a white outline.
  strokeWeight(1);
  TRACKS.forEach((track, i) => {
    const dotY = 95 + i * ROW_HEIGHT + Y_OFF;
    for (let step = 0; step < track.stepSlider.value(); step++) {
      const dotX = GRID_LEFT + CELL_WIDTH / 2 + step * CELL_WIDTH;
      ellipse(dotX, dotY, 10);
      if (track.pattern[step]) {
        stroke(255);
        ellipse(dotX, dotY, 10);
        stroke(0);
      }
    }
  });
}

// Toggles the clicked grid cell, if it falls inside a track's current step length.
function stepClick() {
  if (mouseX <= GRID_LEFT || mouseX >= GRID_RIGHT || mouseY <= GRID_TOP || mouseY >= GRID_BOTTOM) {
    return;
  }
  const step = floor((mouseX - GRID_LEFT) / CELL_WIDTH);
  const track = TRACKS[floor((mouseY - GRID_TOP) / ROW_HEIGHT)];
  if (step >= track.stepSlider.value()) {
    return;
  }
  const pattern = track.pattern.slice();
  pattern[step] = +!pattern[step];
  setPattern(track, pattern);
}

// Spacebar starts and stops the loop once the selected sounds have loaded.
function keyPressed() {
  if (key !== ' ') {
    return;
  }
  if (!TRACKS.every((track) => track.sound.isLoaded())) {
    console.log('Drums are still loading!');
    return;
  }
  if (drums.isPlaying) {
    drums.stop();
  } else {
    drums.loop();
  }
}
