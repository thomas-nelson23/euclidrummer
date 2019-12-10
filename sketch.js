let hh1, hh2, hh3, clap1, clap2, clap3, bass1, bass2, bass3, perc1, perc2, perc3; //instrument - container for all sound sources
let hh, clap, bass, p1, p2; //instrument - will serve as container for active sound source
let hPat, cPat, bPat, p1Pat, p2Pat, sPat; //instrument pattern - holds array of numbers for pattern
let hPhrase, cPhrase, bPhrase, p1Phrase, p2Phrase; //hihat phrase - defines hhow hihat pattern is interpreted
let drums; //part - we will attach phrase to part which will serve as our transport to drive the phrase


let hhDensityText, clapDensityText, bassDensityText, hhStepText, clapStepText, bassStepText, hhOffText, clapOffText, bassOffText, tempoText;

let selectedArray = 4;

let euclidArrayHat;
let euclidArrayClap;
let euclidArrayBass;
let euclidArrayP1;
let euclidArrayP2;

sPat = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

let euclidArray = [

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


function setup() {
  let cnv = createCanvas(900, windowHeight);

  let sliderOffset = windowWidth / 2;
  sliderOffset -= 450;

  let yOffSlider = 40;

  yOff = 40;

  //loads sound files to variables for each instrument
  hh1 = loadSound('assets/hat.mp3', () => { });
  hh2 = loadSound('assets/hh2.mp3', () => { });
  hh3 = loadSound('assets/hh3.mp3', () => { });
  clap1 = loadSound('assets/clap.mp3', () => { });
  clap2 = loadSound('assets/clap2.mp3', () => { });
  clap3 = loadSound('assets/clap3.mp3', () => { });
  bass1 = loadSound('assets/bass.mp3', () => { });
  bass2 = loadSound('assets/bass2.mp3', () => { });
  bass3 = loadSound('assets/bass3.mp3', () => { });
  p1_1 = loadSound('assets/p1-1.mp3', () => { });
  p1_2 = loadSound('assets/p1-2.mp3', () => { });
  p1_3 = loadSound('assets/p1-3.mp3', () => { });
  p2_1 = loadSound('assets/p2-1.mp3', () => { });
  p2_2 = loadSound('assets/p2-2.mp3', () => { });
  p2_3 = loadSound('assets/p2-3.mp3', () => { });


  hh = hh1;
  clap = clap1;
  bass = bass1;
  p1 = p1_1;
  p2 = p2_1;

  //sets starting pattern for each instrument (does not effect slider position!)
  hPat = euclidArray[16][0];
  cPat = euclidArray[16][0];
  bPat = euclidArray[16][0];
  p1Pat = euclidArray[16][0];
  p2Pat = euclidArray[16][0];


  //creates sliders for step length
  hhStep = createSlider(0, 16, 16, 1)
  hhStep.position(190 + sliderOffset, 300 + yOff + yOffSlider);
  hhStep.style('width', '80px');

  clapStep = createSlider(0, 16, 16, 1)
  clapStep.position(190 + sliderOffset, 330 + yOff + yOffSlider);
  clapStep.style('width', '80px');

  bassStep = createSlider(0, 16, 16, 1)
  bassStep.position(190 + sliderOffset, 360 + yOff + yOffSlider);
  bassStep.style('width', '80px');

  p1Step = createSlider(0, 16, 16, 1)
  p1Step.position(190 + sliderOffset, 390 + yOff + yOffSlider);
  p1Step.style('width', '80px');

  p2Step = createSlider(0, 16, 16, 1)
  p2Step.position(190 + sliderOffset, 420 + yOff + yOffSlider);
  p2Step.style('width', '80px');


  //creates slider for euclidian density 0-16
  hhDensity = createSlider(0, 16, 0, 1);
  hhDensity.position(420 + sliderOffset, 300 + yOff + yOffSlider);
  hhDensity.style('width', '80px');

  clapDensity = createSlider(0, 16, 0, 1);
  clapDensity.position(420 + sliderOffset, 330 + yOff + yOffSlider);
  clapDensity.style('width', '80px');

  bassDensity = createSlider(0, 16, 0, 1);
  bassDensity.position(420 + sliderOffset, 360 + yOff + yOffSlider);
  bassDensity.style('width', '80px');

  p1Density = createSlider(0, 16, 0, 1);
  p1Density.position(420 + sliderOffset, 390 + yOff + yOffSlider);
  p1Density.style('width', '80px');

  p2Density = createSlider(0, 16, 0, 1);
  p2Density.position(420 + sliderOffset, 420 + yOff + yOffSlider);
  p2Density.style('width', '80px');


  //creates sliders for offset


  hhOff = createSlider(1, 17, 1, 1)
  hhOff.position(640 + sliderOffset, 300 + yOff + yOffSlider);
  hhOff.style('width', '80px');

  clapOff = createSlider(1, 17, 1, 1)
  clapOff.position(640 + sliderOffset, 330 + yOff + yOffSlider);
  clapOff.style('width', '80px');

  bassOff = createSlider(1, 17, 1, 1)
  bassOff.position(640 + sliderOffset, 360 + yOff + yOffSlider);
  bassOff.style('width', '80px');

  p1Off = createSlider(1, 17, 1, 1)
  p1Off.position(640 + sliderOffset, 390 + yOff + yOffSlider);
  p1Off.style('width', '80px');

  p2Off = createSlider(1, 17, 1, 1)
  p2Off.position(640 + sliderOffset, 420 + yOff + yOffSlider);
  p2Off.style('width', '80px');


  //creates tempo slider
  tempoSlider = createSlider(40, 240, 90, 1);
  tempoSlider.position(520 + sliderOffset, 540 + yOffSlider);
  tempoSlider.style('width', '80px');

  //hh dry button
  // hhDry = createButton('hh dry');
  // hhDry.position(220, 220);
  // hhDry.mousePressed(hhDryToggle);

  // let hhToggle = 0;
  // function hhDryToggle() {
  //   if (hhToggle) {
  //     hh.connect();
  //   } else {
  //     hh.disconnect();
  //     hh.connect(delay);
  //   }
  //   hhToggle = +!hhToggle;
  // }


  //creates select elements for sound file selection
  hhSel = createSelect();
  hhSel.position(200 + sliderOffset, 86 + yOff);
  hhSel.option('HiHat 1');
  hhSel.option('HiHat 2');
  hhSel.option('HiHat 3');
  hhSel.changed(selectSoundFileHh);

  clapSel = createSelect();
  clapSel.position(200 + sliderOffset, 116 + yOff);
  clapSel.option('Clap 1');
  clapSel.option('Clap 2');
  clapSel.option('Clap 3');
  clapSel.changed(selectSoundFileClap);

  bassSel = createSelect();
  bassSel.position(200 + sliderOffset, 146 + yOff);
  bassSel.option('Kick 1');
  bassSel.option('Kick 2');
  bassSel.option('Kick 3');
  bassSel.changed(selectSoundFileBass);

  p1Sel = createSelect();
  p1Sel.position(200 + sliderOffset, 176 + yOff);
  p1Sel.option('Perc 1');
  p1Sel.option('Perc 2');
  p1Sel.option('Perc 3');
  p1Sel.changed(selectSoundFileP1);

  p2Sel = createSelect();
  p2Sel.position(200 + sliderOffset, 206 + yOff);
  p2Sel.option('Perc 4');
  p2Sel.option('Perc 5');
  p2Sel.option('Perc 6');
  p2Sel.changed(selectSoundFileP2);


  //hh delay 



  // hhDelaySlider = createSlider(0, 1, 0.5, 0.01);
  // hhDelaySlider.position(450, 300)

  // hhDelayAmpSlider = createSlider(0, 1, 0, 0.1);
  // hhDelayAmpSlider.position(450, 330)


  // radio = createRadio();
  // radio.option('1/16')
  // radio.option('1/8');
  // radio.option('1/8*');
  // radio.option('1/4');
  // radio.option('1/3')
  // radio.option('1/2');
  // radio.style('width', '60px');
  // radio.position(450, 360)

  // let delay = new p5.Delay();
  // delay.amp(0);
  // delay.delayTime(tempoSlider.value() / 600);
  // delay.filter(7000);
  // delay.drywet(1);
  // //hh.disconnect();
  // hh.connect(delay);

  // hhDelaySlider.elt.addEventListener('input', () => {
  //   delay.delayTime(hhDelaySlider.value());
  // })

  // hhDelayAmpSlider.elt.addEventListener('input', () => {
  //   delay.amp(hhDelayAmpSlider.value());
  // })

  // radio.elt.addEventListener('input', () => {
  //   if (radio.value() == '1/16') {
  //     delay.delayTime(tempoSlider.value() / 600);
  //   } else if (radio.value() == '1/8') {
  //     delay.delayTime(tempoSlider.value() / 300);
  //   } else if (radio.value() == '1/8*') {
  //     delay.delayTime(tempoSlider.value() / 200);
  //   } else if (radio.value() == '1/3') {
  //     delay.delayTime(tempoSlider.value() / 225);
  //   } else if (radio.value() == '1/4') {
  //     delay.delayTime(tempoSlider.value() / 150);
  //   } else if (radio.value() == '1/2') {
  //     delay.delayTime(tempoSlider.value() / 75);
  //   }
  // })


  function hhPhraseReset() {
    drums.removePhrase("hh");
    drums.addPhrase(new p5.Phrase('hh', (time) => {
      hh.play(time);
    }, hPat));
  }

  function clapPhraseReset() {
    drums.removePhrase("clap");
    drums.addPhrase(new p5.Phrase('clap', (time) => {
      clap.play(time);
    }, cPat));
  }

  function bassPhraseReset() {
    drums.removePhrase("bass");
    drums.addPhrase(new p5.Phrase('bass', (time) => {
      bass.play(time);
    }, bPat));
  }

  function p1PhraseReset() {
    drums.removePhrase("p1");
    drums.addPhrase(new p5.Phrase('p1', (time) => {
      p1.play(time);
    }, p1Pat));
  }

  function p2PhraseReset() {
    drums.removePhrase("p2");
    drums.addPhrase(new p5.Phrase('p2', (time) => {
      p2.play(time);
    }, p2Pat));
  }


  //changes hh sound file
  function selectSoundFileHh() {
    let hhFile = hhSel.value();
    if (hhFile == 'HiHat 1') {
      hh = hh1;
      hhPhraseReset();
    } else if (hhFile == 'HiHat 2') {
      hh = hh2;
      hhPhraseReset();
    } else if (hhFile == 'HiHat 3') {
      hh = hh3;
      hhPhraseReset();
    }
    hh.connect(delay);
  }

  //changes clap sound file
  function selectSoundFileClap() {
    let clapFile = clapSel.value();
    if (clapFile == 'Clap 1') {
      clap = clap1;
      clapPhraseReset();
    } else if (clapFile == 'Clap 2') {
      clap = clap2;
      clapPhraseReset();
    } else if (clapFile == 'Clap 3') {
      clap = clap3;
      clapPhraseReset();
    }
  }

  //changes bass sound file
  function selectSoundFileBass() {
    let bassFile = bassSel.value();
    if (bassFile == 'Kick 1') {
      bass = bass1;
      bassPhraseReset();
    } else if (bassFile == 'Kick 2') {
      bass = bass2;
      bassPhraseReset();
    } else if (bassFile == 'Kick 3') {
      bass = bass3;
      bassPhraseReset();
    }
  }

  //changes p1 sound file
  function selectSoundFileP1() {
    let p1File = p1Sel.value();
    if (p1File == 'Perc 1') {
      p1 = p1_1;
      p1PhraseReset();
    } else if (p1File == 'Perc 2') {
      p1 = p1_2;
      p1PhraseReset();
    } else if (p1File == 'Perc 3') {
      p1 = p1_3;
      p1PhraseReset();
    }
  }

  //changes p2 sound file
  function selectSoundFileP2() {
    let p2File = p2Sel.value();
    if (p2File == 'Perc 4') {
      p2 = p2_1;
      p2PhraseReset();
    } else if (p2File == 'Perc 5') {
      p2 = p2_2;
      p2PhraseReset();
    } else if (p2File == 'Perc 6') {
      p2 = p2_3;
      p2PhraseReset();
    }
  }



  //updates hh step length 
  hhStep.elt.addEventListener('input', function () {

    //changes pattern value according to step slider
    if (hhStep.value() !== 0) {
      if (hhDensity.value() > hhStep.value()) {
        euclidArrayHat = euclidArray[hhStep.value()][hhStep.value()];
      } else {
        euclidArrayHat = euclidArray[hhStep.value()][hhDensity.value()];
      }
    } else {
      euclidArrayHat = euclidArray[hhStep.value()];
    }

    hPat = euclidArrayHat;
    hhPhraseReset();
    textUpdate();
  });


  //updates clap step length 
  clapStep.elt.addEventListener('input', function () {

    //changes pattern value according to step slider
    if (clapStep.value() !== 0) {
      if (clapDensity.value() > clapStep.value()) {
        euclidArrayClap = euclidArray[clapStep.value()][clapStep.value()];
      } else {
        euclidArrayClap = euclidArray[clapStep.value()][clapDensity.value()];
      }
    } else {
      euclidArrayClap = euclidArray[clapStep.value()];
    }

    cPat = euclidArrayClap;

    clapPhraseReset();
    textUpdate();
  });


  //updates bass step length 
  bassStep.elt.addEventListener('input', function () {

    //changes pattern value according to step slider
    if (bassStep.value() !== 0) {
      if (bassDensity.value() > bassStep.value()) {
        euclidArrayBass = euclidArray[bassStep.value()][bassStep.value()];
      } else {
        euclidArrayBass = euclidArray[bassStep.value()][bassDensity.value()];
      }
    } else {
      euclidArrayBass = euclidArray[bassStep.value()];
    }

    bPat = euclidArrayBass;

    bassPhraseReset();
    textUpdate();
  });

  //updates p1 step length 
  p1Step.elt.addEventListener('input', function () {

    //changes pattern value according to step slider
    if (p1Step.value() !== 0) {
      if (p1Density.value() > p1Step.value()) {
        euclidArrayP1 = euclidArray[p1Step.value()][p1Step.value()];
      } else {
        euclidArrayP1 = euclidArray[p1Step.value()][p1Density.value()];
      }
    } else {
      euclidArrayP1 = euclidArray[p1Step.value()];
    }

    p1Pat = euclidArrayP1;

    p1PhraseReset();
    textUpdate();
  });

  //updates p2 step length 
  p2Step.elt.addEventListener('input', function () {

    //changes pattern value according to step slider
    if (p2Step.value() !== 0) {
      if (p2Density.value() > p2Step.value()) {
        euclidArrayP2 = euclidArray[p2Step.value()][p2Step.value()];
      } else {
        euclidArrayP2 = euclidArray[p2Step.value()][p2Density.value()];
      }
    } else {
      euclidArrayP2 = euclidArray[p2Step.value()];
    }

    p2Pat = euclidArrayP2;

    p2PhraseReset();
    textUpdate();
  });



  //updates hh offset
  hhOff.elt.addEventListener('input', function () {

    let current = euclidArray[hhStep.value()][hhDensity.value()];

    for (counter = 0; counter < hhOff.value(); counter++) {

      var offset = counter % current.length;
      console.log(offset);
      euclidArrayHat = current.slice(offset).concat(current.slice(0, offset));
      console.log(euclidArrayHat.join(", "));

      hPat = euclidArrayHat;
      hhPhraseReset();
      textUpdate();
    }
  });


  //updates clap offset
  clapOff.elt.addEventListener('input', function () {

    let current = euclidArray[clapStep.value()][clapDensity.value()];

    for (counter = 0; counter < clapOff.value(); counter++) {

      var offset = counter % current.length;
      console.log(offset);
      euclidArrayClap = current.slice(offset).concat(current.slice(0, offset));

      cPat = euclidArrayClap;
      clapPhraseReset();
      textUpdate();
    }
  });


  //updates kcik offset
  bassOff.elt.addEventListener('input', function () {

    let current = euclidArray[bassStep.value()][bassDensity.value()];

    for (counter = 0; counter < bassOff.value(); counter++) {

      var offset = counter % current.length;
      console.log(offset);
      euclidArrayBass = current.slice(offset).concat(current.slice(0, offset));

      bPat = euclidArrayBass;
      bassPhraseReset();
      textUpdate();
    }
  });

  //updates p1 offset
  p1Off.elt.addEventListener('input', function () {

    let current = euclidArray[p1Step.value()][p1Density.value()];

    for (counter = 0; counter < p1Off.value(); counter++) {

      var offset = counter % current.length;
      console.log(offset);
      euclidArrayP1 = current.slice(offset).concat(current.slice(0, offset));
      console.log(euclidArrayHat.join(", "));

      p1Pat = euclidArrayP1;
      p1PhraseReset();
      textUpdate();
    }
  });

  //updates p2 offset
  p2Off.elt.addEventListener('input', function () {

    let current = euclidArray[p2Step.value()][p2Density.value()];

    for (counter = 0; counter < p2Off.value(); counter++) {

      var offset = counter % current.length;
      console.log(offset);
      euclidArrayP2 = current.slice(offset).concat(current.slice(0, offset));
      console.log(euclidArrayP2.join(", "));

      p2Pat = euclidArrayP2;
      p2PhraseReset();
      textUpdate();
    }
  });



  //updates hh density
  hhDensity.elt.addEventListener('input', function () {

    //changes pattern value according to density slider
    if (hhDensity.value() > hhStep.value()) {
      hPat = euclidArray[hhStep.value()][hhStep.value()];
    } else {
      hPat = euclidArray[hhStep.value()][hhDensity.value()];
    }
    //removes phrase from drums and adds new phrase 
    hhPhraseReset();
    textUpdate();
  });


  //updates clap density
  clapDensity.elt.addEventListener('input', function () {

    //changes pattern value according to density slider
    if (clapDensity.value() > clapStep.value()) {
      cPat = euclidArray[clapStep.value()][clapStep.value()];
    } else {
      cPat = euclidArray[clapStep.value()][clapDensity.value()];
    }


    //removes phrase from drums and adds new phrase 
    clapPhraseReset();
    textUpdate();
  });


  //updates bass density
  bassDensity.elt.addEventListener('input', function () {

    //changes pattern value according to density slider
    if (bassDensity.value() > bassStep.value()) {
      bPat = euclidArray[bassStep.value()][bassStep.value()];
    } else {
      bPat = euclidArray[bassStep.value()][bassDensity.value()];
    }

    bassPhraseReset();
    textUpdate();
  });

  //updates p1 density
  p1Density.elt.addEventListener('input', function () {

    //changes pattern value according to density slider
    if (p1Density.value() > p1Step.value()) {
      p1Pat = euclidArray[p1Step.value()][p1Step.value()];
    } else {
      p1Pat = euclidArray[p1Step.value()][p1Density.value()];
    }

    p1PhraseReset();
    textUpdate();
  });

  //updates p2 density
  p2Density.elt.addEventListener('input', function () {

    //changes pattern value according to density slider
    if (p2Density.value() > p2Step.value()) {
      p2Pat = euclidArray[p2Step.value()][p2Step.value()];
    } else {
      p2Pat = euclidArray[p2Step.value()][p2Density.value()];
    }

    p2PhraseReset();
    textUpdate();
  });



  //creates phrases for each instrument
  hPhrase = new p5.Phrase('hh', (time) => {
    hh.play(time);
  }, hPat);

  cPhrase = new p5.Phrase('clap', (time) => {
    clap.play(time);
  }, cPat);

  bPhrase = new p5.Phrase('bass', (time) => {
    bass.play(time);
  }, bPat);

  p1Phrase = new p5.Phrase('p1', (time) => {
    p1.play(time);
  }, p1Pat);

  p2Phrase = new p5.Phrase('p2', (time) => {
    p2.play(time);
  }, p2Pat);


  //creates drum part
  drums = new p5.Part();

  //addes instrument phrases to drum part
  let stepCount = 0;
  drums.addPhrase(hPhrase);
  drums.addPhrase(cPhrase);
  drums.addPhrase(bPhrase);
  drums.addPhrase(p1Phrase);
  drums.addPhrase(p2Phrase);
  drums.addPhrase('seq', sequence, sPat);

  tempoSlider.input(() => {
    drums.setBPM(tempoSlider.value())
    textUpdate();
  })
  drums.setBPM('90');


  textUpdate();

  function textUpdate() {



    background(100);
    //sequence grid
    strokeWeight(1);
    stroke(0);

    textSize(40);
    text("EucliDrummer", 330, 70);

    fill(0);
    textSize(25);
    text("Steps", 200, 350);
    text("Density", 420, 350);
    text("Offset", 650, 350);

    fill(0);
    textSize(20);
    stroke(0);

    for (x = 300; x < 640; x += 20) {
      line(x, 80 + yOff, x, 230 + yOff);
    }
    strokeWeight(1.8);
    for (y = 80; y < 250; y += 30) {
      line(300, y + yOff, 620, y + yOff);
    }
    strokeWeight(3)
    for (x = 300; x < 640; x += 80) {
      line(x, 80 + yOff, x, 230 + yOff);
    }

    //grid dots
    strokeWeight(1);
    let ellipseStart = 310;
    for (count = 0; count < hhStep.value(); count++) {
      ellipse(ellipseStart, 95 + yOff, 10);
      if (hPat[count]) {
        stroke(255);
        ellipse(ellipseStart, 95 + yOff, 10);
        stroke(0);
      }
      ellipseStart += 20;
    }
    ellipseStart = 310;
    for (count = 0; count < clapStep.value(); count++) {
      ellipse(ellipseStart, 125 + yOff, 10);
      if (cPat[count]) {
        stroke(255);
        ellipse(ellipseStart, 125 + yOff, 10);
        stroke(0);
      }
      ellipseStart += 20;
    }
    ellipseStart = 310;
    for (count = 0; count < bassStep.value(); count++) {
      ellipse(ellipseStart, 155 + yOff, 10);
      if (bPat[count]) {
        stroke(255);
        ellipse(ellipseStart, 155 + yOff, 10);
        stroke(0);
      }
      ellipseStart += 20;
    }
    ellipseStart = 310;
    for (count = 0; count < p1Step.value(); count++) {
      ellipse(ellipseStart, 185 + yOff, 10);
      if (p1Pat[count]) {
        stroke(255);
        ellipse(ellipseStart, 185 + yOff, 10);
        stroke(0);
      }
      ellipseStart += 20;
    }
    ellipseStart = 310;
    for (count = 0; count < p2Step.value(); count++) {
      ellipse(ellipseStart, 215 + yOff, 10);
      if (p2Pat[count]) {
        stroke(255);
        ellipse(ellipseStart, 215 + yOff, 10);
        stroke(0);
      }
      ellipseStart += 20;
    }

    cnv.mouseClicked(stepClick);

    strokeWeight(0);



    text(hhDensity.value() + " / " + hhStep.value(), 640, 140);
    text(clapDensity.value() + " / " + clapStep.value(), 640, 170);
    text(bassDensity.value() + " / " + bassStep.value(), 640, 200);
    text(p1Density.value() + " / " + p2Step.value(), 640, 230);
    text(p2Density.value() + " / " + p2Step.value(), 640, 260);


    text((hhOff.value() - 1), 740, 359 + yOffSlider);
    text((clapOff.value() - 1), 740, 389 + yOffSlider);
    text((bassOff.value() - 1), 740, 419 + yOffSlider);
    text((p1Off.value() - 1), 740, 449 + yOffSlider);
    text((p2Off.value() - 1), 740, 479 + yOffSlider);


    text("HiHat", 110, 400);
    text("Clap", 110, 430);
    text("Kick", 110, 460);
    text("Perc 1", 110, 490);
    text("Perc 2", 110, 520);



    text("Tempo: " + tempoSlider.value() + " BPM", 360, 600)

  }

  //handles step sequencing
  function stepClick() {
    let xp = mouseX - 300;
    let yp = mouseY - 80 - yOff;
    if (mouseX > 300 && mouseX < 620 && mouseY > 80 + yOff && mouseY < 230 + yOff) {
      xp = floor(xp / 20);
      yp = floor(yp / 30);

      if (yp == 0) {
        newSlice = hPat.slice(0, hPat.length);
        newSlice[xp] = +!newSlice[xp];
        hPat = newSlice;
        hhPhraseReset();
      }
      if (yp == 1) {
        newSlice = cPat.slice(0, cPat.length);
        newSlice[xp] = +!newSlice[xp];
        cPat = newSlice;
        clapPhraseReset();
      }
      if (yp == 2) {
        newSlice = bPat.slice(0, bPat.length);
        newSlice[xp] = +!newSlice[xp];
        bPat = newSlice;
        bassPhraseReset();
      }
      if (yp == 3) {
        newSlice = p1Pat.slice(0, p1Pat.length);
        newSlice[xp] = +!newSlice[xp];
        p1Pat = newSlice;
        p1PhraseReset();
      }
      if (yp == 4) {
        newSlice = p2Pat.slice(0, p2Pat.length);
        newSlice[xp] = +!newSlice[xp];
        p2Pat = newSlice;
        p2PhraseReset();
      }
    }
    textUpdate()
  };


  //animated playhead
  beatCountHat = 0;
  let hhPlayMover;
  function sequence(time) {

    if (beatCountHat > hhStep.value() - 1) { beatCountHat = 0 }



    hhPlayMover = beatCountHat * 20;
    hhResetMover = hhPlayMover - 20;
    hhResetMover2 = hhStep.value() * 20;

    strokeWeight(2);
    stroke(0, 200, 200);
    // line(300 + hhPlayMover, 80, 300 + hhPlayMover, 110);
    stroke(0);
    // if (beatCountHat > 0) {
    //   line(300 + hhResetMover, 80, 300 + hhResetMover, 110);
    // } else {
    //   line(280 + hhResetMover2, 80, 280 + hhResetMover2, 110);
    // }
    // beatCountHat++;

  }


} //end setup

let amp = new p5.Amplitude();

//plays and stops loop when spacebar is pressed
function keyPressed() {
  if (key === " ") {
    if (hh.isLoaded() && clap.isLoaded() && bass.isLoaded()) {
      if (!drums.isPlaying) {
        drums.loop();
      } else {
        drums.stop();
      }
    } else {
      console.log('Drums are still loading!');
    }
  }
}


function draw() {
  background(0, 0, 0, 0);
  // fill(100, 0, 0);
  // var vol = amp.getLevel();
  // ellipse(200, 700, 200, vol * 200);
}
