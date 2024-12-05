// MODEL
const mainGain = new Tone.Gain(0.5);
const drumsGain = new Tone.Gain(0.5).connect(mainGain);
const bassGain = new Tone.Gain(0.5).connect(mainGain);
const melodiesGain = new Tone.Gain(0.5).connect(mainGain);

const hpFilter = new Tone.Filter(20, "highpass");
const lpFilter = new Tone.Filter(12000, "lowpass");
const reverb = new Tone.Reverb(0.5);

mainGain.chain(hpFilter, lpFilter, reverb, Tone.getDestination());

let instruments = [];
let patterns = [];
let effects = [];

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

    // Set the reverb mix to 0
    reverb.wet.rampTo(0, 0.01);
}

// INSTRUMENTS
function setupInstruments() {

    // DRUMS
    instruments.kick = new Tone.Player({
        url: "./Samples/Kick.wav",
        autostart: false,
    }).connect(drumsGain);

    instruments.clap = new Tone.Player({
        url: "./Samples/Clap.wav",
        autostart: false,
    }).connect(drumsGain);

    instruments.snare = new Tone.Player({
        url: "./Samples/Snare.wav",
        autostart: false,
        volume: 0.5,
    }).connect(drumsGain);

    instruments.clap_low = new Tone.Player({
        url: "./Samples/Clap_Low.wav",
        autostart: false,
    }).connect(drumsGain);

    instruments.hat_closed = new Tone.Player({
        url: "./Samples/Hat_Closed.wav",
        autostart: false,
        volume: -3,
        fadeOut: 0.05,
    }).connect(drumsGain);

    instruments.hat_open = new Tone.Player({
        url: "./Samples/Hat_Open.wav",
        autostart: false,
    }).connect(drumsGain);

    instruments.uplifter = new Tone.Player({
        url: "./Samples/Uplifter.wav",
        autostart: false,
    }).toDestination();

    instruments.downlifter = new Tone.Player({
        url: "./Samples/Downlifter.wav",
        autostart: false,
    }).toDestination();

    // PLUCKS
    instruments.pluck = new Tone.PolySynth(Tone.Synth, {
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
    }).connect(melodiesGain);

    // SYNTH
    instruments.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "custom", partials: [1, 0.6, 0.3, 0.2, 0.1] },
        filter: { type: "lowpass", frequency: 150, rolloff: -24 },
        envelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 0.4 },
    });


    const reverb = new Tone.Reverb({
        decay: 2, // Durata della riverberazione
        preDelay: 0.2, // Ritardo prima che inizi il riverbero
        wet: 0.2, // Intensità del riverbero
    }).connect(melodiesGain);

    const chorus = new Tone.Chorus(4, 2.5, 0.5).connect(reverb); // Parametri: numero di voci, velocità, profondità

    instruments.synth.connect(chorus);

    // BASS
    instruments.bass_main = new Tone.MonoSynth({
        oscillator: { type: "sine" },
        filter: { type: "lowpass", frequency: 500 },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.4, release: 0.3 },
      }).connect(bassGain);

    instruments.bass_break = new Tone.MonoSynth({
        oscillator: { type: "square" },
        filter: { type: "lowpass", frequency: 500 },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.4, release: 0.3 },
      }).connect(bassGain);
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

    // Pluck arpeggio
    patterns.arpPattern = new Tone.Sequence(
        (time, note) => {
            if (note) {
                instruments.pluck.triggerAttackRelease(note, "16n", time);
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

    // Basses
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
  
    bassBreak = new Tone.Part((time, note) => {
      instruments.bass_break.triggerAttackRelease(note, bassnoteDuration, time);
    }, bassEvents);
  
    bassBreak.loop = true;
    bassBreak.loopEnd = timeOffset;
    bassBreak.loopStart = 0;
  
    bassPart = new Tone.Part((time, note) => {
        instruments.bass_main.triggerAttackRelease(note, bassnoteDuration, time);
    }, bassEvents);
  
    bassPart.loop = true;
    bassPart.loopEnd = timeOffset;
    bassPart.loopStart = 0;

    patterns.bassPattern = bassPart;
    patterns.bassBreakPattern = bassBreak;

}

function setupEffects() {

}

// Aggiungi i listener per i controlli
document.getElementById("start-button").addEventListener("click", startMusic);
document.getElementById("stop-button").addEventListener("click", stopMusic);
document.getElementById("volume-fader").addEventListener("input", adjustVolume);
document.getElementById("drums-fader").addEventListener("input", adjustDrums);
document.getElementById("bass-fader").addEventListener("input", adjustBass);
document.getElementById("melodies-fader").addEventListener("input", adjustMelodies);
document.getElementById("hp-fader").addEventListener("input", adjustHP);
document.getElementById("lp-fader").addEventListener("input", adjustLP);
document.getElementById("reverb-fader").addEventListener("input", adjustReverb);



// Wait for user interaction to start the audio context
window.addEventListener("load", () => {
    console.log("Page fully loaded. Waiting for user interaction to start audio context...");
    // Wait for a user gesture to start Tone.js audio context
    const startAudioContext = () => {
        Tone.start().then(() => {
            console.log("Audio context started");
            document.body.removeEventListener("click", startAudioContext);
            setup(); // Call setup after the audio context is enabled
        }).catch((e) => {
            console.error("Failed to start audio context:", e);
        });
        // Remove the listener after starting the audio context
    };

    // Add a click listener to ensure user gesture starts the audio context
    document.body.addEventListener("click", startAudioContext);
});

// Funzione per avviare la musica
function startMusic() {
    if (Tone.context.state != "running") return
    Tone.Transport.start();
    patterns.synthPattern.start()
    //patterns.arpPattern.start()
    patterns.kickPattern.start()
    patterns.clapPattern.start()
    patterns.openHatPattern.start()
    patterns.closedHatPattern.start()
    patterns.bassPattern.start()
    //patterns.bassBreakPattern.start()
    console.log("Music started");
}

function stopMusic() {
    if (Tone.context.state != "running") return
    console.log("Stopping all sound...")
    for (const p of patterns) {
        p.stop()
    }
    Tone.getTransport().stop()
    console.log("Music stopped");
}

// Funzione per regolare il volume globale
function adjustVolume(event) {
    value = event.target.value;
    mainGain.gain.rampTo(value, 0.01);
    console.log("Main volume adjusted to", value);
}

// Funzioni per regolare volume singoli gruppi di suoni
function adjustDrums(event) {
    value = event.target.value;
    drumsGain.gain.rampTo(value, 0.01);
    console.log("Drums volume adjusted to", value);
}

function adjustBass(event) {
    value = event.target.value;
    bassGain.gain.rampTo(value, 0.01);
    console.log("Bass volume adjusted to", value);
}

function adjustMelodies(event) {
    value = event.target.value;
    melodiesGain.gain.rampTo(value, 0.01);
    console.log("Melodies volume adjusted to", value);
}

function adjustHP(event) {
    value = event.target.value;
    hpFilter.frequency.rampTo(value, 0.01);
    console.log("HP frequency adjusted to", value);
}

function adjustLP(event) {
    value = event.target.value;
    lpFilter.frequency.rampTo(12040 - value, 0.01);
    console.log("LP frequency adjusted to", 12040 - value);
}

function adjustReverb(event) {
    value = event.target.value;
    reverb.wet.rampTo(value, 0.01);
    console.log("Reverb mix adjusted to", value);
}