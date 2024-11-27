// START AUDIO CONTEXT

// Wait for user interaction to start the audio context
document.body.addEventListener("click", () => {
  Tone.start()
    .then(() => {
      console.log("Audio context started!");
      setup(); // Call setup after the audio context is enabled
    })
    .catch((e) => {
      console.error("Failed to start audio context:", e);
    });
});

// MODEL
let instruments = {};
let patterns = {};
let effects = {};
let bassPart;

// SETUP FUNCTION
function setup() {
  // Set up instruments
  setupInstruments();

  // Set up patterns
  setupPatterns();

  // Set up effects
  setupEffects();

  // Start the Tone.js transport
  Tone.Transport.bpm.value = 126;
  Tone.Transport.start();

  // Start patterns and schedule stops
  patterns.kickPattern.start(0);
  patterns.kickPattern.stop("16m");

  patterns.clapPattern.start(0);
  patterns.clapPattern.stop("16m");

  patterns.clapLowPattern.start("16m");
  patterns.clapLowPattern.stop("32m");

  patterns.clapLowPattern.start("64m");
  patterns.clapLowPattern.stop("96m");

  patterns.synthPattern.start("16m");
  patterns.synthPattern.stop("80m");

  patterns.kickPattern.start("32m");
  patterns.kickPattern.stop("64m");

  patterns.clapPattern.start("32m");
  patterns.clapPattern.stop("64m");

  patterns.snarePattern.start("32m");
  patterns.snarePattern.stop("64m");

  patterns.closedHatPattern.start("32m");
  patterns.closedHatPattern.stop("64m");

  patterns.openHatPattern.start("32m");
  patterns.openHatPattern.stop("64m");

  bassIntroPart.start("32m");
  bassIntroPart.stop("64m");

  bassPart.start("80m");
  bassPart.stop("96m");

  patterns.arpeggi.start("8m"); // Piano arpeggio starts at 8 measures
  patterns.arpeggi.start("96m");
  // Schedule instruments
  instruments.downlifter.start(0);

  instruments.uplifter.start("6m");
}

// INSTRUMENTS
function setupInstruments() {
  setupBassSynth();

  instruments.kick = new Tone.Player({
    url: "./Samples/Kick.wav",
    autostart: false,
  }).toDestination();

  instruments.clap = new Tone.Player({
    url: "./Samples/Clap.wav",
    autostart: false,
  }).toDestination();

  instruments.snare = new Tone.Player({
    url: "./Samples/Snare.wav",
    autostart: false,
    volume: 0.5,
  }).toDestination();

  instruments.clap_low = new Tone.Player({
    url: "./Samples/Clap_Low.wav",
    autostart: false,
  }).toDestination();

  instruments.hat_closed = new Tone.Player({
    url: "./Samples/Hat_Closed.wav",
    autostart: false,
    volume: -1,
    fadeOut: 0.05,
  }).toDestination();

  instruments.hat_open = new Tone.Player({
    url: "./Samples/Hat_Open.wav",
    autostart: false,
  }).toDestination();

  instruments.uplifter = new Tone.Player({
    url: "./Samples/Uplifter.wav",
    autostart: false,
  }).toDestination();

  instruments.downlifter = new Tone.Player({
    url: "./Samples/Downlifter.wav",
    autostart: false,
  }).toDestination();

  // Add piano
  instruments.piano = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: "sine",
    },
    volume: -6,
    envelope: {
      attack: 0.05,
      decay: 0.2,
      sustain: 0.5,
      release: 0.5,
    },
  }).toDestination();

  const pianoSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "custom", partials: [1, 0.6, 0.3, 0.2, 0.1] },
    filter: { type: "lowpass", frequency: 150, rolloff: -24 },
    envelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 0.4 },
  }).toDestination();

  instruments.synth = pianoSynth;

  const reverb = new Tone.Reverb({
    decay: 2, // Durata della riverberazione
    preDelay: 0.2, // Ritardo prima che inizi il riverbero
    wet: 0.3, // Intensità del riverbero
  }).toDestination();

  const chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination(); // Parametri: numero di voci, velocità, profondità

  // Collega il synth al chorus e al riverbero
  pianoSynth.connect(chorus);
  chorus.connect(reverb);
}

// PATTERNS
function setupPatterns() {
  patterns.kickPattern = new Tone.Sequence(
    (time) => {
      instruments.kick.start(time);
    },
    ["hit", "hit", "hit", "hit"],
    "4n"
  );

  patterns.clapPattern = new Tone.Sequence(
    (time) => {
      instruments.clap.start(time);
    },
    [null, "hit", null, "hit"],
    "4n"
  );

  patterns.snarePattern = new Tone.Sequence(
    (time) => {
      instruments.snare.start(time);
    },
    [null, "hit", null, "hit"],
    "4n"
  );

  patterns.clapLowPattern = new Tone.Sequence(
    (time) => {
      instruments.clap_low.start(time);
    },
    ["hit", "hit", "hit", "hit"],
    "4n"
  );

  patterns.closedHatPattern = new Tone.Sequence(
    (time) => {
      instruments.hat_closed.start(time, 0, 0.5);
    },
    ["hit", "hit", "hit", "hit"],
    "16n"
  );

  patterns.openHatPattern = new Tone.Sequence(
    (time) => {
      instruments.hat_open.start(time);
    },
    [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      "hit",
      null,
    ],
    "16n"
  );

  const chordSequences = [
    { chord: ["G4", "Bb4"], duration: "8n", repeat: 2 },
    { chord: ["A4", "F4"], duration: "8n", repeat: 2 },
    { chord: ["G4", "D3"], duration: "8n.", repeat: 1 },
    { chord: ["G4", "D3"], duration: "8n", repeat: 1 },
    { chord: ["G4", "D3"], duration: "8n.", repeat: 1 },
  ];

  let chordEvents = [];

  // Generate events from the chord sequence
  let currentTime = 0;
  chordSequences.forEach((sequence) => {
    for (let i = 0; i < sequence.repeat; i++) {
      chordEvents.push({
        time: currentTime, // When to play the chord
        chord: sequence.chord, // The notes in the chord
        duration: sequence.duration, // The duration of the chord
      });
      currentTime += Tone.Time(sequence.duration).toSeconds(); // Move the current time forward
    }
  });

  // Create a Tone.Part to handle the chord events
  const chordPart = new Tone.Part((time, value) => {
    instruments.synth.triggerAttackRelease(value.chord, value.duration, time);
  }, chordEvents);

  chordPart.loop = true;
  chordPart.loopStart = 0; // Set the start of the loop
  chordPart.loopEnd = currentTime;

  // Piano arpeggio
  patterns.arpeggi = new Tone.Sequence(
    (time, note) => {
      if (note) {
        instruments.piano.triggerAttackRelease(note, "16n", time);
      }
    },
    [
      "D5",
      "F5",
      "D5",
      "C5",
      "F5",
      "C5",
      "D5",
      "G5",
      "C5",
      "D5",
      "F5",
      "C5",
      "D5",
      "F5",
      "C5",
      "D5",
      "F5",
      "C5",
      "D5",
      "G5",
      "C5",
      "D5",
      "F5",
      "C5",
      "D5",
      "F5",
      "C5",
      "D5",
      "F5",
      "C5",
      "D5",
      "G5",
      "C5",
      "D5",
      "Bb5",
      "C6",
      "C5",
      "D5",
      "G5",
      "C5",
      "D5",
      "F5",
      "C5",
      "D5",
      "F5",
    ],
    "16n" // Subdivision for quick notes
  );

  patterns.synthPattern = chordPart;
}

// BASS SYNTH
function setupBassSynth() {
  const bassSynth = new Tone.MonoSynth({
    oscillator: { type: "square" },
    filter: { type: "lowpass", frequency: 500 },
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.4, release: 0.3 },
  }).toDestination();

  const bassIntro = new Tone.MonoSynth({
    oscillator: { type: "sine" },
    filter: { type: "lowpass", frequency: 500 },
    envelope: { attack: 0.1, decay: 0.2, sustain: 0.4, release: 0.3 },
  }).toDestination();

  const bassnoteDuration = "8n";
  const basslongDuration = "4t";

  const bassSequences = [
    { notes: ["G2", "G2", "F2", "F2"], duration: bassnoteDuration },
    { notes: ["Eb2", "Eb2", "Eb2"], duration: basslongDuration },
    { notes: ["Eb2", "Eb2", "F2", "F2"], duration: bassnoteDuration },
    { notes: ["C2", "C2", "C2"], duration: basslongDuration },
    { notes: ["C2", "C2", "D2", "D2"], duration: bassnoteDuration },
    { notes: ["Eb2", "Eb2", "Eb2"], duration: basslongDuration },
    { notes: ["Eb2", "Eb2", "F2", "F2"], duration: bassnoteDuration },
    { notes: ["G2", "G2", "G2"], duration: basslongDuration },
  ];

  let timeOffset = 0;
  const bassEvents = [];
  bassSequences.forEach((sequence) => {
    sequence.notes.forEach((note, index) => {
      bassEvents.push([
        timeOffset + index * Tone.Time(sequence.duration),
        note,
      ]);
    });
    timeOffset += sequence.notes.length * Tone.Time(sequence.duration);
  });

  bassPart = new Tone.Part((time, note) => {
    bassSynth.triggerAttackRelease(note, bassnoteDuration, time);
  }, bassEvents);

  bassPart.loop = true;
  bassPart.loopEnd = timeOffset;
  bassPart.loopStart = 0;

  bassIntroPart = new Tone.Part((time, note) => {
    bassIntro.triggerAttackRelease(note, bassnoteDuration, time);
  }, bassEvents);

  bassIntroPart.loop = true;
  bassIntroPart.loopEnd = timeOffset;
  bassIntroPart.loopStart = 0;
}

// EFFECTS
function setupEffects() {}

// SONG FUNCTION (Optional)
function song(time) {
  console.log("Playing note at time:", time);
}

document.getElementById("start-button").addEventListener("click", startMusic);

document.body.addEventListener("click", () => {
  Tone.start().then(() => {
    console.log("Audio context started!");
    setup(); // Call setup after the audio context is enabled
    startMusic(); // Avvia la musica subito dopo aver avviato Tone.js
  }).catch((e) => {
    console.error("Failed to start audio context:", e);
  });
});

// Funzione per avviare la musica
function startMusic() {
  Tone.Transport.start(); // Avvia la trasport
  console.log("Music started");
}
