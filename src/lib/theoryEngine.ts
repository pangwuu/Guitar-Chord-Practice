// ============================================================================
// Theory Engine — Pure, stateless music theory functions
// ZERO side effects, ZERO React dependencies
// ============================================================================

import type {
  NoteName,
  Scale,
  ScaleType,
  ScaleDegree,
  Chord,
  ChordQuality,
  ChordSymbol,
  Key,
  KeyCandidate,
  RomanNumeral,
  HarmonicFunction,
  FretPosition,
  Voicing,
  Tuning,
  CAGEDShape,
  CAGEDShapeName,
  Interval,
} from '../types/theory';

import {
  CHROMATIC_NOTES,
  FLAT_NOTE_MAP,
  SCALE_INTERVALS,
  CHORD_INTERVALS,
  SEMITONE_TO_QUALITY,
} from '../types/theory';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Normalise any flat spelling to its sharp equivalent NoteName. */
function normalise(note: string): NoteName {
  if (note in FLAT_NOTE_MAP) return FLAT_NOTE_MAP[note as keyof typeof FLAT_NOTE_MAP];
  return note as NoteName;
}

/** Index of a NoteName inside CHROMATIC_NOTES (0-11). */
function noteIndex(note: NoteName): number {
  return CHROMATIC_NOTES.indexOf(note);
}

// ---------------------------------------------------------------------------
// 1. Note / Interval arithmetic
// ---------------------------------------------------------------------------

/**
 * Transpose a note by N semitones (positive = up, negative = down).
 * Always returns a sharp-spelled NoteName.
 */
export function transposeNote(note: NoteName, semitones: number): NoteName {
  const idx = noteIndex(note);
  return CHROMATIC_NOTES[((idx + (semitones % 12)) + 12) % 12];
}

/**
 * Semitone distance from  up to  (0-11, always positive mod 12).
 */
export function intervalBetween(a: NoteName, b: NoteName): number {
  return ((noteIndex(b) - noteIndex(a)) % 12 + 12) % 12;
}

/** Sharp-to-flat map (reverse of FLAT_NOTE_MAP). */
const SHARP_TO_FLAT: Readonly<Record<string, string>> = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
};

/**
 * Return the enharmonic equivalent of a note.
 * Sharps become flats and vice-versa; naturals return themselves.
 */
export function enharmonicEquivalent(note: NoteName): NoteName {
  if (note in SHARP_TO_FLAT) return SHARP_TO_FLAT[note] as unknown as NoteName;
  // Check if it is a flat that maps back
  if (note in FLAT_NOTE_MAP) return FLAT_NOTE_MAP[note as keyof typeof FLAT_NOTE_MAP];
  return note; // natural note — no enharmonic
}

/**
 * Convert a note name to its chromatic index (C=0, C#=1, ... B=11).
 */
export function noteToIndex(note: NoteName): number {
  return CHROMATIC_NOTES.indexOf(note);
}

/**
 * Convert a chromatic index (0-11) back to a note name.
 * @param preferFlats - if true, returns flat spelling (Db instead of C#)
 */
export function indexToNote(index: number, preferFlats = false): NoteName {
  const normalised = ((index % 12) + 12) % 12;
  const note = CHROMATIC_NOTES[normalised];
  if (preferFlats && note in SHARP_TO_FLAT) {
    return SHARP_TO_FLAT[note] as unknown as NoteName;
  }
  return note;
}

/**
 * Convert a note + octave to a MIDI number (C4 = 60).
 */
export function noteToMidi(note: NoteName, octave: number): number {
  return (octave + 1) * 12 + noteIndex(note);
}

/**
 * Convert a MIDI number back to a note name + octave.
 */
export function midiToNote(midi: number): { name: NoteName; octave: number } {
  const octave = Math.floor(midi / 12) - 1;
  const idx = midi % 12;
  return { name: CHROMATIC_NOTES[idx], octave };
}


// ---------------------------------------------------------------------------
// 2. Scale generation
// ---------------------------------------------------------------------------

/** Mode names in order (index 0 = ionian, 6 = locrian). */
const MODE_NAMES: readonly ScaleType[] = [
  'ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian',
] as const;

/** Triad quality built on each degree of the major scale. */
const MAJOR_SCALE_TRIAD_QUALITIES: readonly ScaleDegree['quality'][] = [
  'major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished',
];

/** Roman numeral strings for each degree (upper = major, lower = minor). */
const ROMAN_NUMERALS_UPPER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const ROMAN_NUMERALS_LOWER = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];

function buildRomanString(degree: number, quality: ScaleDegree['quality']): string {
  const idx = degree - 1;
  if (quality === 'major' || quality === 'augmented') {
    return ROMAN_NUMERALS_UPPER[idx] + (quality === 'augmented' ? '+' : '');
  }
  return ROMAN_NUMERALS_LOWER[idx] + (quality === 'diminished' ? '°' : '');
}

function buildDegrees(notes: NoteName[], qualities: readonly ScaleDegree['quality'][]): ScaleDegree[] {
  return notes.map((note, i) => ({
    degree: i + 1,
    note,
    quality: qualities[i] ?? 'major',
    romanNumeral: buildRomanString(i + 1, qualities[i] ?? 'major'),
  }));
}

/**
 * Build a full Scale object from root + scale type.
 */
export function getScale(root: NoteName, scaleType: ScaleType): Scale {
  const intervals = [...SCALE_INTERVALS[scaleType]];
  const notes = intervals.map(i => transposeNote(root, i));

  // Determine triad qualities per degree
  let qualities: ScaleDegree['quality'][];
  if (scaleType === 'major' || scaleType === 'ionian') {
    qualities = [...MAJOR_SCALE_TRIAD_QUALITIES];
  } else if (scaleType === 'natural_minor' || scaleType === 'aeolian') {
    qualities = ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'];
  } else if (scaleType === 'harmonic_minor') {
    qualities = ['minor', 'diminished', 'augmented', 'minor', 'major', 'major', 'diminished'];
  } else if (scaleType === 'melodic_minor') {
    qualities = ['minor', 'minor', 'augmented', 'major', 'major', 'diminished', 'diminished'];
  } else if (scaleType === 'dorian') {
    qualities = ['minor', 'minor', 'major', 'major', 'minor', 'diminished', 'major'];
  } else if (scaleType === 'phrygian') {
    qualities = ['minor', 'major', 'major', 'minor', 'diminished', 'major', 'minor'];
  } else if (scaleType === 'lydian') {
    qualities = ['major', 'major', 'minor', 'diminished', 'major', 'minor', 'minor'];
  } else if (scaleType === 'mixolydian') {
    qualities = ['major', 'minor', 'diminished', 'major', 'minor', 'minor', 'major'];
  } else if (scaleType === 'locrian') {
    qualities = ['diminished', 'major', 'minor', 'minor', 'major', 'major', 'minor'];
  } else {
    // Pentatonic / blues — fewer degrees, just label by interval
    qualities = notes.map((_, i) => {
      const iv = intervals[i];
      if (iv === 0 || iv === 5 || iv === 7) return 'major' as const;
      if (iv === 3 || iv === 10) return 'minor' as const;
      if (iv === 6) return 'diminished' as const;
      return 'major' as const;
    });
  }

  return {
    root,
    type: scaleType,
    intervals,
    notes,
    degrees: buildDegrees(notes, qualities),
  };
}

/**
 * Shorthand — just the note names of a scale.
 */
export function getScaleNotes(root: NoteName, scaleType: ScaleType): NoteName[] {
  return SCALE_INTERVALS[scaleType].map(i => transposeNote(root, i));
}

/**
 * Derive a mode from a parent major scale.
 * modeIndex 0 = ionian, 1 = dorian, ... 6 = locrian.
 */
export function getModeFromParent(parentRoot: NoteName, modeIndex: number): Scale {
  const clamped = ((modeIndex % 7) + 7) % 7;
  const parentIntervals = SCALE_INTERVALS.major;
  const modeRoot = transposeNote(parentRoot, parentIntervals[clamped]);
  return getScale(modeRoot, MODE_NAMES[clamped]);
}


// ---------------------------------------------------------------------------
// 3. Chord construction
// ---------------------------------------------------------------------------

/** Human-readable quality labels for chord naming. */
const QUALITY_DISPLAY: Readonly<Record<ChordQuality, string>> = {
  major: 'Major',
  minor: 'Minor',
  diminished: 'Diminished',
  augmented: 'Augmented',
  dom7: 'Dominant 7th',
  maj7: 'Major 7th',
  min7: 'Minor 7th',
  min7b5: 'Half-Diminished 7th',
  dim7: 'Diminished 7th',
  sus2: 'Suspended 2nd',
  sus4: 'Suspended 4th',
  add9: 'Add 9',
  '6': 'Major 6th',
  m6: 'Minor 6th',
  '9': 'Dominant 9th',
  min9: 'Minor 9th',
  maj9: 'Major 9th',
  '7sharp9': '7#9',
  maj7sharp11: 'Major 7#11',
  '7alt': '7alt',
  '13': 'Dominant 13th',
};

/** Short suffix used in chord symbols (e.g. Cmaj7, Dm, Fdim). */
const QUALITY_SYMBOL: Readonly<Record<ChordQuality, string>> = {
  major: '',
  minor: 'm',
  diminished: 'dim',
  augmented: 'aug',
  dom7: '7',
  maj7: 'maj7',
  min7: 'm7',
  min7b5: 'm7b5',
  dim7: 'dim7',
  sus2: 'sus2',
  sus4: 'sus4',
  add9: 'add9',
  '6': '6',
  m6: 'm6',
  '9': '9',
  min9: 'm9',
  maj9: 'maj9',
  '7sharp9': '7#9',
  maj7sharp11: 'maj7#11',
  '7alt': '7alt',
  '13': '13',
};

/**
 * Build a Chord from root + quality.
 */
export function getChord(root: NoteName, quality: ChordQuality): Chord {
  const intervals = [...CHORD_INTERVALS[quality]];
  const notes = intervals.map(i => transposeNote(root, i));
  const suffix = QUALITY_SYMBOL[quality];
  return {
    name: root + ' ' + QUALITY_DISPLAY[quality],
    symbol: root + suffix,
    root,
    quality,
    intervals,
    notes,
  };
}

/**
 * Get just the note names for a chord (root + quality).
 */
export function getChordNotes(root: NoteName, quality: ChordQuality): NoteName[] {
  return CHORD_INTERVALS[quality].map(i => transposeNote(root, i));
}

/**
 * Parse a chord symbol string like "Am7", "F#dim", "Cmaj7" into its canonical form.
 * Returns null if the symbol cannot be parsed.
 */
export function parseChordSymbol(symbol: string): ChordSymbol | null {
  if (!symbol || symbol.length === 0) return null;

  // Extract root note (1 or 2 chars)
  let rootStr: string;
  if (symbol.length >= 2 && (symbol[1] === '#' || symbol[1] === 'b')) {
    rootStr = symbol.slice(0, 2);
  } else {
    rootStr = symbol.slice(0, 1);
  }

  // Validate root
  const root = normalise(rootStr);
  if (!CHROMATIC_NOTES.includes(root)) return null;

  const suffix = symbol.slice(rootStr.length);

  // Map suffix to quality — order matters (longer matches first)
  const SUFFIX_MAP: [string, ChordQuality][] = [
    ['maj7#11', 'maj7sharp11'],
    ['maj7', 'maj7'],
    ['maj9', 'maj9'],
    ['m7b5', 'min7b5'],
    ['m7', 'min7'],
    ['m9', 'min9'],
    ['m6', 'm6'],
    ['min7b5', 'min7b5'],
    ['min7', 'min7'],
    ['min9', 'min9'],
    ['min', 'minor'],
    ['m', 'minor'],
    ['dim7', 'dim7'],
    ['dim', 'diminished'],
    ['aug', 'augmented'],
    ['sus2', 'sus2'],
    ['sus4', 'sus4'],
    ['add9', 'add9'],
    ['7#9', '7sharp9'],
    ['7alt', '7alt'],
    ['13', '13'],
    ['9', '9'],
    ['7', 'dom7'],
    ['6', '6'],
    ['+', 'augmented'],
    ['', 'major'],
  ];

  for (const [sfx, quality] of SUFFIX_MAP) {
    if (suffix === sfx) {
      return getChord(root, quality).symbol;
    }
  }

  return null;
}

/**
 * Format a chord symbol string. Parses and re-formats to ensure canonical form.
 */
export function formatChordSymbol(chord: ChordSymbol): string {
  const parsed = parseChordSymbol(chord);
  return parsed ?? chord;
}

/**
 * Quality of the diatonic triad on each major-scale degree.
 */
const DIATONIC_TRIAD_QUALITY: readonly ChordQuality[] = [
  'major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished',
];

/**
 * Minor key diatonic triad qualities (natural minor).
 */
const MINOR_DIATONIC_TRIAD_QUALITY: readonly ChordQuality[] = [
  'minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major',
];

/**
 * Build all diatonic triads for a key (returns 7 chords).
 */
export function getDiatonicChords(key: Key): Chord[] {
  const scaleType: ScaleType = key.quality === 'major' ? 'major' : 'natural_minor';
  const notes = getScaleNotes(key.root, scaleType);
  const qualities = key.quality === 'major' ? DIATONIC_TRIAD_QUALITY : MINOR_DIATONIC_TRIAD_QUALITY;
  return notes.map((note, i) => getChord(note, qualities[i]));
}


// ---------------------------------------------------------------------------
// 4. Key detection
// ---------------------------------------------------------------------------

/**
 * Detect the most likely key(s) for a set of chord symbols.
 * Ranks by how many chords are diatonic to each candidate key.
 */
export function detectKey(chords: ChordSymbol[]): KeyCandidate[] {
  if (chords.length === 0) return [];

  const candidates: KeyCandidate[] = [];

  for (const root of CHROMATIC_NOTES) {
    for (const quality of ['major', 'minor'] as const) {
      const key: Key = { root, quality };
      const diatonic = getDiatonicChords(key);
      const diatonicSymbols = diatonic.map(c => c.symbol);

      let matches = 0;
      for (const chord of chords) {
        const parsed = parseChordSymbol(chord);
        if (parsed && diatonicSymbols.includes(parsed)) {
          matches++;
        }
      }

      const confidence = chords.length > 0 ? matches / chords.length : 0;
      if (confidence > 0) {
        candidates.push({ root, quality, confidence });
      }
    }
  }

  // Sort by confidence descending, then prefer major keys
  candidates.sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    if (a.quality === 'major' && b.quality !== 'major') return -1;
    if (b.quality === 'major' && a.quality !== 'major') return 1;
    return 0;
  });

  return candidates;
}

/**
 * Check whether a chord is diatonic to a given key.
 */
export function isChordDiatonic(chord: ChordSymbol, key: Key): boolean {
  const parsed = parseChordSymbol(chord);
  if (!parsed) return false;
  const diatonic = getDiatonicChords(key);
  return diatonic.some(d => d.symbol === parsed);
}

// ---------------------------------------------------------------------------
// 5. Roman numeral analysis
// ---------------------------------------------------------------------------

/** Map scale degree + triad quality to harmonic function. */
function harmonicFunction(degree: number, quality: ScaleDegree['quality']): HarmonicFunction {
  if (degree === 1 || degree === 3 || degree === 6) return 'tonic';
  if (degree === 4 || degree === 2) return 'subdominant';
  if (degree === 5 || degree === 7) return 'dominant';
  return 'predominant';
}

/**
 * Analyse a chord progression against a key, returning Roman numeral labels.
 */
export function analyzeProgression(chords: ChordSymbol[], key: Key): RomanNumeral[] {
  const scaleType: ScaleType = key.quality === 'major' ? 'major' : 'natural_minor';
  const scaleNotes = getScaleNotes(key.root, scaleType);
  const diatonic = getDiatonicChords(key);

  return chords.map(chord => {
    const parsed = parseChordSymbol(chord);
    if (!parsed) {
      return {
        chord,
        numeral: '?',
        degree: 0,
        function: 'tonic' as HarmonicFunction,
        isBorrowed: false,
        isSecondary: false,
      };
    }

    // Find which scale degree this chord's root sits on
    // Extract root from the parsed symbol
    let chordRootStr: string;
    if (parsed.length >= 2 && parsed[1] === '#') {
      chordRootStr = parsed.slice(0, 2);
    } else {
      chordRootStr = parsed.slice(0, 1);
    }
    const chordRoot = normalise(chordRootStr);

    const degreeIdx = scaleNotes.indexOf(chordRoot);
    const isDiatonic = diatonic.some(d => d.symbol === parsed);

    if (degreeIdx >= 0 && isDiatonic) {
      const degree = degreeIdx + 1;
      const degreeInfo = getScale(key.root, scaleType).degrees[degreeIdx];
      return {
        chord,
        numeral: degreeInfo.romanNumeral,
        degree,
        function: harmonicFunction(degree, degreeInfo.quality),
        isBorrowed: false,
        isSecondary: false,
      };
    }

    // Non-diatonic — still try to find the degree
    if (degreeIdx >= 0) {
      const degree = degreeIdx + 1;
      // Determine if it's a borrowed chord (from parallel key)
      const parallelQuality = key.quality === 'major' ? 'minor' : 'major';
      const parallelKey: Key = { root: key.root, quality: parallelQuality };
      const parallelDiatonic = getDiatonicChords(parallelKey);
      const isBorrowed = parallelDiatonic.some(d => d.symbol === parsed);

      // Determine the numeral based on the chord's own quality
      const chordSuffix = parsed.slice(chordRootStr.length);
      const isMinorChord = chordSuffix.startsWith('m') && !chordSuffix.startsWith('maj');
      const isDimChord = chordSuffix.startsWith('dim');
      const numeral = (isMinorChord || isDimChord)
        ? ROMAN_NUMERALS_LOWER[degreeIdx] + (isDimChord ? '\u00b0' : '')
        : ROMAN_NUMERALS_UPPER[degreeIdx];

      return {
        chord,
        numeral,
        degree,
        function: harmonicFunction(degree, isMinorChord ? 'minor' : 'major'),
        isBorrowed,
        isSecondary: !isBorrowed,
      };
    }

    // Chromatic chord — not on any scale degree
    const semitones = intervalBetween(key.root, chordRoot);
    return {
      chord,
      numeral: '?',
      degree: 0,
      function: 'predominant' as HarmonicFunction,
      isBorrowed: false,
      isSecondary: true,
    };
  });
}

/**
 * Convert a Roman numeral back to a chord symbol in the given key.
 */
export function romanNumeralToChord(numeral: RomanNumeral, key: Key): ChordSymbol {
  if (numeral.degree < 1 || numeral.degree > 7) return numeral.chord;
  const scaleType: ScaleType = key.quality === 'major' ? 'major' : 'natural_minor';
  const scaleNotes = getScaleNotes(key.root, scaleType);
  const root = scaleNotes[numeral.degree - 1];

  // Determine quality from the numeral string
  const isLower = numeral.numeral === numeral.numeral.toLowerCase();
  const hasDim = numeral.numeral.includes('\u00b0');
  const hasAug = numeral.numeral.includes('+');

  let quality: ChordQuality;
  if (hasDim) quality = 'diminished';
  else if (hasAug) quality = 'augmented';
  else if (isLower) quality = 'minor';
  else quality = 'major';

  return getChord(root, quality).symbol;
}


// ---------------------------------------------------------------------------
// 6. Fretboard mapping
// ---------------------------------------------------------------------------

/**
 * Get the note at a specific string + fret position for a given tuning.
 */
export function getNoteAtFret(stringIndex: number, fret: number, tuning: Tuning): NoteName {
  const openNote = tuning.strings[stringIndex];
  if (!openNote) return 'C'; // fallback
  return transposeNote(openNote.name, fret);
}

/**
 * Get all fretboard positions where scale notes appear.
 */
export function getScalePositions(
  scale: Scale,
  tuning: Tuning,
  fretRange: [number, number] = [0, 12],
): FretPosition[] {
  const positions: FretPosition[] = [];
  const [minFret, maxFret] = fretRange;

  for (let s = 0; s < tuning.strings.length; s++) {
    for (let f = minFret; f <= maxFret; f++) {
      const note = getNoteAtFret(s, f, tuning);
      if (scale.notes.includes(note)) {
        const interval = intervalBetween(scale.root, note);
        positions.push({
          string: s,
          fret: f,
          note,
          interval,
          intervalLabel: SEMITONE_TO_QUALITY[interval]?.toString(),
        });
      }
    }
  }

  return positions;
}

/**
 * Get all fretboard positions where chord tones appear.
 */
export function getChordPositions(
  chordNotes: NoteName[],
  tuning: Tuning,
  fretRange: [number, number] = [0, 12],
): FretPosition[] {
  const positions: FretPosition[] = [];
  const [minFret, maxFret] = fretRange;
  const root = chordNotes[0];

  for (let s = 0; s < tuning.strings.length; s++) {
    for (let f = minFret; f <= maxFret; f++) {
      const note = getNoteAtFret(s, f, tuning);
      if (chordNotes.includes(note)) {
        const interval = intervalBetween(root, note);
        positions.push({
          string: s,
          fret: f,
          note,
          interval,
          intervalLabel: SEMITONE_TO_QUALITY[interval]?.toString(),
        });
      }
    }
  }

  return positions;
}

/**
 * Generate playable chord voicings on the fretboard.
 * Uses a simplified approach: finds positions of chord tones and builds
 * voicings where each string plays at most one note within a 4-fret span.
 */
export function getChordVoicings(
  chord: Chord,
  tuning: Tuning,
  fretRange: [number, number] = [0, 12],
): Voicing[] {
  const [minFret, maxFret] = fretRange;
  const numStrings = tuning.strings.length;
  const voicings: Voicing[] = [];

  // For each possible starting fret position (4-fret window)
  for (let startFret = minFret; startFret <= maxFret - 3; startFret++) {
    const windowEnd = startFret + 4;
    const stringOptions: (number | null)[][] = [];

    // For each string, find chord tones in this window (or open)
    for (let s = 0; s < numStrings; s++) {
      const options: (number | null)[] = [null]; // muted is always an option
      for (let f = (startFret === 0 ? 0 : startFret); f <= windowEnd && f <= maxFret; f++) {
        const note = getNoteAtFret(s, f, tuning);
        if (chord.notes.includes(note)) {
          options.push(f);
        }
      }
      stringOptions.push(options);
    }

    // Try to build a voicing where:
    // - At least 4 strings are played
    // - The root appears at least once
    // - All chord tones are covered if possible
    const bestVoicing = findBestVoicing(stringOptions, chord, tuning, startFret);
    if (bestVoicing) {
      voicings.push(bestVoicing);
    }
  }

  // Deduplicate identical voicings
  const seen = new Set<string>();
  return voicings.filter(v => {
    const key = v.strings.join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Internal helper to find the best voicing from string options. */
function findBestVoicing(
  stringOptions: (number | null)[][],
  chord: Chord,
  tuning: Tuning,
  positionStart: number,
): Voicing | null {
  const numStrings = stringOptions.length;
  const strings: (number | null)[] = new Array(numStrings).fill(null);
  const fingers: (number | null)[] = new Array(numStrings).fill(null);

  // Greedy: for each string, pick the first chord tone available
  let playedCount = 0;
  let hasRoot = false;
  const coveredNotes = new Set<NoteName>();

  for (let s = 0; s < numStrings; s++) {
    // Prefer a fretted note over muted
    const fretted = stringOptions[s].filter((f): f is number => f !== null);
    if (fretted.length > 0) {
      // Prefer root note on lower strings
      const rootFret = fretted.find(f => getNoteAtFret(s, f, tuning) === chord.root);
      const chosen = (s < 3 && rootFret !== undefined) ? rootFret : fretted[0];
      strings[s] = chosen;
      playedCount++;
      const note = getNoteAtFret(s, chosen, tuning);
      coveredNotes.add(note);
      if (note === chord.root) hasRoot = true;

      // Simple finger assignment
      if (chosen > 0) {
        const relFret = chosen - positionStart;
        fingers[s] = Math.min(Math.max(relFret, 1), 4);
      }
    }
  }

  // Need at least 4 strings played and must have the root
  if (playedCount < 4 || !hasRoot) return null;

  return { strings, fingers, positionStart: Math.max(positionStart, 1) };
}

// ---------------------------------------------------------------------------
// CAGED shapes
// ---------------------------------------------------------------------------

/** Base open chord shapes for CAGED (frets relative to nut). */
const CAGED_BASE_SHAPES: Record<CAGEDShapeName, { frets: (number | null)[]; rootString: number; intervals: number[] }> = {
  C: { frets: [null, 3, 2, 0, 1, 0], rootString: 1, intervals: [null, 0, 4, 7, 0, 4] as any },
  A: { frets: [null, 0, 2, 2, 2, 0], rootString: 1, intervals: [null, 0, 7, 0, 4, 7] as any },
  G: { frets: [3, 2, 0, 0, 0, 3], rootString: 0, intervals: [0, 4, 7, 0, 4, 0] as any }, 
  E: { frets: [0, 2, 2, 1, 0, 0], rootString: 0, intervals: [0, 7, 0, 4, 7, 0] as any },
  D: { frets: [null, null, 0, 2, 3, 2], rootString: 2, intervals: [null, null, 0, 7, 0, 4] as any },
};

/**
 * Generate the 5 CAGED positions for a root + quality.
 */
export function getCAGEDShapes(
  root: NoteName,
  quality: ChordQuality,
  tuning: Tuning,
): CAGEDShape[] {
  const shapes: CAGEDShape[] = [];
  const chord = getChord(root, quality);
  
  const scaleType = (quality.includes('min') || quality === 'diminished' || quality === 'dim7') 
    ? 'natural_minor' 
    : 'major';
  const scale = getScale(root, scaleType);

  for (const shapeName of ['C', 'A', 'G', 'E', 'D'] as CAGEDShapeName[]) {
    const base = CAGED_BASE_SHAPES[shapeName];
    
    // 1. Find the target root fret on the correct root string for this shape
    const openRootNote = getNoteAtFret(base.rootString, 0, tuning);
    let targetRootFret = (noteToIndex(root) - noteToIndex(openRootNote) + 12) % 12;
    
    // CAGED shapes usually live in a specific fret window relative to the root
    // C shape: root is highest fret in window (fret window: root-3 to root)
    // A shape: root is lowest fret in window (fret window: root to root+3)
    // G shape: root is highest (fret window: root-4 to root)
    // E shape: root is lowest (fret window: root to root+3)
    // D shape: root is lowest (fret window: root to root+3)
    
    // Actually, simpler: find a window where the base shape's root string has our target root
    // and the window is "natural" for that shape.
    let windowStart = 0;
    const baseRootFret = base.frets[base.rootString]!;
    windowStart = targetRootFret - baseRootFret;
    
    // Normalize window to be within 0-12 (for first octave exploration)
    if (windowStart < 0) windowStart += 12;
    
    const windowEnd = windowStart + 4;
    
    // 2. Build voicing using chord tones in this window
    const voicingStrings: (number | null)[] = [];
    for (let s = 0; s < tuning.strings.length; s++) {
      const targetFret = base.frets[s] !== null ? base.frets[s]! + windowStart : null;
      
      if (targetFret !== null) {
        // Verify this fret actually plays a chord tone. 
        // If not (e.g. minor 3rd vs major 3rd), find the nearest chord tone in window.
        const note = getNoteAtFret(s, targetFret, tuning);
        if (chord.notes.includes(note)) {
          voicingStrings.push(targetFret);
        } else {
          // Try +/- 1 fret within the window
          if (chord.notes.includes(getNoteAtFret(s, targetFret - 1, tuning))) {
            voicingStrings.push(targetFret - 1);
          } else if (chord.notes.includes(getNoteAtFret(s, targetFret + 1, tuning))) {
            voicingStrings.push(targetFret + 1);
          } else {
            voicingStrings.push(null); // No chord tone found for this string in this shape
          }
        }
      } else {
        voicingStrings.push(null);
      }
    }

    const validFrets = voicingStrings.filter((f): f is number => f !== null);
    const minFretUsed = validFrets.length > 0 ? Math.min(...validFrets) : windowStart;
    const maxFretUsed = validFrets.length > 0 ? Math.max(...validFrets) : windowEnd;

    const voicing: Voicing = {
      strings: voicingStrings,
      fingers: voicingStrings.map(f => f === null ? null : (f - minFretUsed === 0 ? null : Math.min(f - minFretUsed, 4))),
      positionStart: Math.max(minFretUsed, 1),
      barreAt: (shapeName === 'A' || shapeName === 'E' || shapeName === 'C' || shapeName === 'G') && minFretUsed > 0 ? minFretUsed : undefined,
    };

    // 3. Scale pattern for this window - cover the span of the voicing plus a 1-fret buffer
    const fretRangeStart = Math.max(minFretUsed - 1, 0);
    const fretRangeEnd = Math.min(maxFretUsed + 1, 24);
    const scalePatternRaw = getScalePositions(scale, tuning, [fretRangeStart, fretRangeEnd]);
    const scalePattern = labelIntervals(scalePatternRaw, root);

    shapes.push({
      shape: shapeName,
      rootNote: root,
      fretRange: [fretRangeStart, fretRangeEnd],
      scalePattern,
      chordVoicing: voicing,
    });
  }

  return shapes;
}

// ---------------------------------------------------------------------------
// 7. Interval labeling
// ---------------------------------------------------------------------------

/**
 * Label each fret position with its interval from the given root.
 */
export function labelIntervals(
  positions: FretPosition[],
  root: NoteName,
): (FretPosition & { interval: number })[] {
  return positions.map(pos => ({
    ...pos,
    interval: intervalBetween(root, pos.note),
  }));
}

/**
 * Calculate accuracy for a chord transition.
 * Returns a value between 0 and 1.
 */
export function calculateTransitionAccuracy(actualTimeMs: number, targetBPM: number): number {
  if (actualTimeMs <= 0) return 0;
  const expectedTimeMs = 60000 / targetBPM;
  return Math.min(1, expectedTimeMs / actualTimeMs);
}
