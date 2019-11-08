let hh1, hh2, hh3, clap1, clap2, clap3, bass1, bass2, bass3; //instrument - container for all sound sources
let hh, clap, bass; //instrument - will serve as container for active sound source
let hPat, cPat, bPat, sPat; //instrument pattern - holds array of numbers for pattern
let hPhrase, cPhrase, bPhrase; //hihat phrase - defines hhow hihat pattern is interpreted
let drums; //part - we will attach phrase to part which will serve as our transport to drive the phrase


let hhDensityText, clapDensityText, bassDensityText, hhStepText, clapStepText, bassStepText, hhOffText, clapOffText, bassOffText, tempoText;

let selectedArray = 4;

let euclidArrayHat;
let euclidArrayClap;
let euclidArrayBass;

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
  let cnv = createCanvas(windowWidth, windowHeight);

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

  hh = hh1;
  clap = clap1;
  bass = bass1;

  //sets starting pattern for each instrument (does not effect slider position!)
  hPat = euclidArray[16][5];
  cPat = euclidArray[16][2];
  bPat = euclidArray[16][4];


  //creates sliders for step length
  hhStep = createSlider(0, 16, 16, 1)
  hhStep.position(10, 190);
  hhStep.style('width', '80px');

  clapStep = createSlider(0, 16, 16, 1)
  clapStep.position(10, 220);
  clapStep.style('width', '80px');

  bassStep = createSlider(0, 16, 16, 1)
  bassStep.position(10, 250);
  bassStep.style('width', '80px');


  //creates slider for euclidian density 0-16
  hhDensity = createSlider(0, 16, 5, 1);
  hhDensity.position(10, 80);
  hhDensity.style('width', '80px');

  clapDensity = createSlider(0, 16, 2, 1);
  clapDensity.position(10, 110);
  clapDensity.style('width', '80px');

  bassDensity = createSlider(0, 16, 4, 1);
  bassDensity.position(10, 140);
  bassDensity.style('width', '80px');


  //creates sliders for offset
  hhOff = createSlider(1, 17, 1, 1)
  hhOff.position(10, 300);
  hhOff.style('width', '80px');

  clapOff = createSlider(1, 17, 1, 1)
  clapOff.position(10, 330);
  clapOff.style('width', '80px');

  bassOff = createSlider(1, 17, 1, 1)
  bassOff.position(10, 360);
  bassOff.style('width', '80px');


  //creates tempo slider
  tempoSlider = createSlider(40, 240, 90, 1);
  tempoSlider.position(10, 500);
  tempoSlider.style('width', '80px');

  //hh dry button
  hhDry = createButton('hh dry');
  hhDry.position(300, 400);
  hhDry.mousePressed(hhDryToggle);

  let hhToggle = 0;
  function hhDryToggle() {
    if (hhToggle) {
      hh.connect();
    } else {
      hh.disconnect();
      hh.connect(delay);
    }
    hhToggle = +!hhToggle;
  }


  //creates select elements for sound file selection
  hhSel = createSelect();
  hhSel.position(300, 300);
  hhSel.option('HiHat 1');
  hhSel.option('HiHat 2');
  hhSel.option('HiHat 3');
  hhSel.changed(selectSoundFileHh);

  clapSel = createSelect();
  clapSel.position(300, 320);
  clapSel.option('Clap 1');
  clapSel.option('Clap 2');
  clapSel.option('Clap 3');
  clapSel.changed(selectSoundFileClap);

  bassSel = createSelect();
  bassSel.position(300, 340);
  bassSel.option('Kick 1');
  bassSel.option('Kick 2');
  bassSel.option('Kick 3');
  bassSel.changed(selectSoundFileBass);

  hhDelaySlider = createSlider(0, 1, 0.5, 0.01);
  hhDelaySlider.position(450, 300)

  hhDelayAmpSlider = createSlider(0, 1, 0.5, 0.1);
  hhDelayAmpSlider.position(450, 330)

  //hh delay 
  radio = createRadio();
  radio.option('1/16')
  radio.option('1/8');
  radio.option('1/8*');
  radio.option('1/4');
  radio.option('1/3')
  radio.option('1/2');
  radio.style('width', '60px');
  radio.position(450, 360)

  let delay = new p5.Delay();
  delay.amp(1);
  delay.delayTime(tempoSlider.value() / 600);
  delay.filter(7000);
  delay.drywet(1);
  //hh.disconnect();
  hh.connect(delay);

  hhDelaySlider.elt.addEventListener('input', () => {
    delay.delayTime(hhDelaySlider.value());
  })

  hhDelayAmpSlider.elt.addEventListener('input', () => {
    delay.amp(hhDelayAmpSlider.value());
  })

  radio.elt.addEventListener('input', () => {
    if (radio.value() == '1/16') {
      delay.delayTime(tempoSlider.value() / 600);
    } else if (radio.value() == '1/8') {
      delay.delayTime(tempoSlider.value() / 300);
    } else if (radio.value() == '1/8*') {
      delay.delayTime(tempoSlider.value() / 200);
    } else if (radio.value() == '1/3') {
      delay.delayTime(tempoSlider.value() / 225);
    } else if (radio.value() == '1/4') {
      delay.delayTime(tempoSlider.value() / 150);
    } else if (radio.value() == '1/2') {
      delay.delayTime(tempoSlider.value() / 75);
    }
  })


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


  //creates drum part
  drums = new p5.Part();

  //addes instrument phrases to drum part
  let stepCount = 0;
  drums.addPhrase(hPhrase);
  drums.addPhrase(cPhrase);
  drums.addPhrase(bPhrase);
  drums.addPhrase('seq', sequence, sPat);

  tempoSlider.input(() => {
    drums.setBPM(tempoSlider.value())
    textUpdate();
  })
  drums.setBPM('90');


  textUpdate();

  function textUpdate() {

    fill(0);
    textSize(20);
    stroke(0);

    background(100);
    //sequence grid
    strokeWeight(1);
    for (x = 300; x < 640; x += 20) {
      line(x, 80, x, 230);
    }
    strokeWeight(1.8);
    for (y = 80; y < 250; y += 30) {
      line(300, y, 620, y);
    }
    strokeWeight(3)
    for (x = 300; x < 640; x += 80) {
      line(x, 80, x, 230);
    }

    //grid dots
    strokeWeight(1);
    let ellipseStart = 310;
    for (count = 0; count < hhStep.value(); count++) {
      ellipse(ellipseStart, 95, 10);
      if (hPat[count]) {
        stroke(255);
        ellipse(ellipseStart, 95, 10);
        stroke(0);
      }
      ellipseStart += 20;
    }
    ellipseStart = 310;
    for (count = 0; count < clapStep.value(); count++) {
      ellipse(ellipseStart, 125, 10);
      if (cPat[count]) {
        stroke(255);
        ellipse(ellipseStart, 125, 10);
        stroke(0);
      }
      ellipseStart += 20;
    }
    ellipseStart = 310;
    for (count = 0; count < bassStep.value(); count++) {
      ellipse(ellipseStart, 155, 10);
      if (bPat[count]) {
        stroke(255);
        ellipse(ellipseStart, 155, 10);
        stroke(0);
      }
      ellipseStart += 20;
    }

    cnv.mouseClicked(stepClick);

    strokeWeight(0);


    text(`HH Density: ` + hhDensity.value(), 100, 100);
    text(`Clap Density: ` + clapDensity.value(), 100, 130);
    text(`Kick Density: ` + bassDensity.value(), 100, 160);

    text(`HH Steps: ` + hhStep.value(), 100, 207);
    text(`Clap Steps: ` + clapStep.value(), 100, 237);
    text(`Kick Steps: ` + bassStep.value(), 100, 267);

    text(`HH Offset: ` + (hhOff.value() - 1), 100, 317);
    text(`Clap Offset: ` + (clapOff.value() - 1), 100, 347);
    text(`Kick Offset: ` + (bassOff.value() - 1), 100, 377);

    text(`Tempo: ` + tempoSlider.value() + ' BPM', 100, 517);
  }

  //handles step sequencing
  function stepClick() {
    let xp = mouseX - 300;
    let yp = mouseY - 80;
    if (mouseX > 300 && mouseX < 620 && mouseY > 80 && mouseY < 230) {
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
    line(300 + hhPlayMover, 80, 300 + hhPlayMover, 110);
    stroke(0);
    if (beatCountHat > 0) {
      line(300 + hhResetMover, 80, 300 + hhResetMover, 110);
    } else {
      line(280 + hhResetMover2, 80, 280 + hhResetMover2, 110);
    }
    beatCountHat++;

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
  fill(100, 0, 0);
  var vol = amp.getLevel();
  ellipse(200, 700, 200, vol * 200);
}
