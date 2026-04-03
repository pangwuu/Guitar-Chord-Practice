// ============================================================================
// Core Music Theory Types and Interfaces
// Pure TypeScript - no React dependencies
// Foundation for the Fretboard Theory Workbench engine
// ============================================================================

// ---------------------------------------------------------------------------
// Note Names and Accidentals
// ---------------------------------------------------------------------------

/**
 * The 12 chromatic note names using sharps.
 * Covers all pitch classes in Western 12-tone equal temperament.
 */
export type NoteName =
  | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F'
  | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

/**
 * Accidental symbols used in music notation.
 */
export type Accidental = 'sharp' | 'flat' | 'natural' | 'doubleSharp' | 'doubleFlat';

/** Ordered chromatic scale for index-based arithmetic */
export const CHROMATIC_NOTES: readonly NoteName[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const;

/** Flat-to-sharp equivalents for normalising enharmonic spellings */
export const FLAT_NOTE_MAP: Readonly<Record<string, NoteName>> = {
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
};

/**
 * A note with octave and computed pitch class.
 */
export interface Note {
  name: NoteName;
  octave: number;
  pitch: number;
}

// ---------------------------------------------------------------------------
// Intervals
// ---------------------------------------------------------------------------

/**
 * Semitone distance from root (0-11).
 */
export type Interval = number;

/** Named interval qualities for display and labelling */
export enum IntervalQuality {
  PerfectUnison = 'P1',
  MinorSecond = 'm2',
  MajorSecond = 'M2',
  MinorThird = 'm3',
  MajorThird = 'M3',
  PerfectFourth = 'P4',
  Tritone = 'TT',
  PerfectFifth = 'P5',
  MinorSixth = 'm6',
  MajorSixth = 'M6',
  MinorSeventh = 'm7',
  MajorSeventh = 'M7',
}

/** Map semitone count (0-11) to its interval quality */
export const SEMITONE_TO_QUALITY: Readonly<Record<number, IntervalQuality>> = {
  0: IntervalQuality.PerfectUnison,
  1: IntervalQuality.MinorSecond,
  2: IntervalQuality.MajorSecond,
  3: IntervalQuality.MinorThird,
  4: IntervalQuality.MajorThird,
  5: IntervalQuality.PerfectFourth,
  6: IntervalQuality.Tritone,
  7: IntervalQuality.PerfectFifth,
  8: IntervalQuality.MinorSixth,
  9: IntervalQuality.MajorSixth,
  10: IntervalQuality.MinorSeventh,
  11: IntervalQuality.MajorSeventh,
};

// ---------------------------------------------------------------------------
// Scale Types
// ---------------------------------------------------------------------------

/**
 * All supported scale types.
 */
export type ScaleType =
  | 'major'
  | 'natural_minor'
  | 'harmonic_minor'
  | 'melodic_minor'
  | 'pentatonic_major'
  | 'pentatonic_minor'
  | 'blues'
  | 'ionian'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian';

/**
 * Interval patterns (in semitones from root) for each scale type.
 */
export const SCALE_INTERVALS: Readonly<Record<ScaleType, readonly number[]>> = {
  major:            [0, 2, 4, 5, 7, 9, 11],
  natural_minor:    [0, 2, 3, 5, 7, 8, 10],
  harmonic_minor:   [0, 2, 3, 5, 7, 8, 11],
  melodic_minor:    [0, 2, 3, 5, 7, 9, 11],
  pentatonic_major: [0, 2, 4, 7, 9],
  pentatonic_minor: [0, 3, 5, 7, 10],
  blues:            [0, 3, 5, 6, 7, 10],
  ionian:           [0, 2, 4, 5, 7, 9, 11],
  dorian:           [0, 2, 3, 5, 7, 9, 10],
  phrygian:         [0, 1, 3, 5, 7, 8, 10],
  lydian:           [0, 2, 4, 6, 7, 9, 11],
  mixolydian:       [0, 2, 4, 5, 7, 9, 10],
  aeolian:          [0, 2, 3, 5, 7, 8, 10],
  locrian:          [0, 1, 3, 5, 6, 8, 10],
};

/**
 * Scale data returned by the theory engine.
 */
export interface Scale {
  root: NoteName;
  type: ScaleType;
  intervals: Interval[];
  notes: NoteName[];
  degrees: ScaleDegree[];
}

/**
 * Information about a single scale degree.
 */
export interface ScaleDegree {
  degree: number;
  note: NoteName;
  quality: 'major' | 'minor' | 'diminished' | 'augmented';
  romanNumeral: string;
}

// ---------------------------------------------------------------------------
// Chord Qualities
// ---------------------------------------------------------------------------

/**
 * All supported chord qualities.
 */
export type ChordQuality =
  | 'major'
  | 'minor'
  | 'diminished'
  | 'augmented'
  | 'dom7'
  | 'maj7'
  | 'min7'
  | 'min7b5'
  | 'dim7'
  | 'sus2'
  | 'sus4'
  | 'add9'
  | '6'
  | 'm6'
  | '9'
  | 'min9'
  | 'maj9'
  | '7sharp9'
  | 'maj7sharp11'
  | '7alt'
  | '13';

/**
 * Interval formulas (semitones from root) for each chord quality.
 */
export const CHORD_INTERVALS: Readonly<Record<ChordQuality, readonly number[]>> = {
  major:         [0, 4, 7],
  minor:         [0, 3, 7],
  diminished:    [0, 3, 6],
  augmented:     [0, 4, 8],
  dom7:          [0, 4, 7, 10],
  maj7:          [0, 4, 7, 11],
  min7:          [0, 3, 7, 10],
  min7b5:        [0, 3, 6, 10],
  dim7:          [0, 3, 6, 9],
  sus2:          [0, 2, 7],
  sus4:          [0, 5, 7],
  add9:          [0, 2, 4, 7],
  '6':           [0, 4, 7, 9],
  m6:            [0, 3, 7, 9],
  '9':           [0, 2, 4, 7, 10],
  min9:          [0, 2, 3, 7, 10],
  maj9:          [0, 2, 4, 7, 11],
  '7sharp9':     [0, 3, 4, 7, 10],
  maj7sharp11:   [0, 4, 6, 7, 11],
  '7alt':        [0, 4, 6, 8, 10],
  '13':          [0, 4, 7, 9, 10],
};

/**
 * A fully resolved chord with root, quality, and computed notes.
 */
export interface Chord {
  name: string;
  symbol: string;
  root: NoteName;
  quality: ChordQuality;
  intervals: Interval[];
  notes: NoteName[];
}

/** Raw chord symbol string, e.g. "Am", "G7", "Fmaj7" */
export type ChordSymbol = string;

// ---------------------------------------------------------------------------
// Key
// ---------------------------------------------------------------------------

export interface Key {
  root: NoteName;
  quality: 'major' | 'minor';
}

export interface KeyCandidate extends Key {
  confidence: number;
}

// ---------------------------------------------------------------------------
// Roman Numeral Analysis
// ---------------------------------------------------------------------------

export type HarmonicFunction =
  | 'tonic'
  | 'subdominant'
  | 'dominant'
  | 'predominant';

export interface RomanNumeral {
  chord: ChordSymbol;
  numeral: string;
  degree: number;
  function: HarmonicFunction;
  isSecondary?: boolean;
  isBorrowed?: boolean;
}

// ---------------------------------------------------------------------------
// Fretboard and Positions
// ---------------------------------------------------------------------------

export type StringNumber = 1 | 2 | 3 | 4 | 5 | 6;

export interface FretPosition {
  string: number;
  fret: number;
  note: NoteName;
  interval?: Interval;
  intervalLabel?: string;
}

export interface Voicing {
  strings: (number | null)[];
  fingers: (number | null)[];
  barreAt?: number;
  positionStart: number;
}

export interface FretboardPosition {
  startFret: number;
  endFret: number;
  voicing: Voicing;
}

// ---------------------------------------------------------------------------
// Tuning
// ---------------------------------------------------------------------------

export interface PlaybackOptions {
  bpm: number;
  mode: 'strum' | 'arpeggio' | 'scale_ascending' | 'scale_descending';
  instrument: 'acoustic' | 'electric_clean' | 'piano';
}

export interface PlaybackState {
  isPlaying: boolean;
  activeNoteIndex: number | null;
  progress: number;
}

export interface TuningString {
  name: NoteName;
  octave: number;
  pitch: number;
}

export interface Tuning {
  name: string;
  strings: TuningString[];
}

export type TuningPreset = 'standard' | 'dropD' | 'openG' | 'openD' | 'dadgad';

export const TUNING_PRESETS: Readonly<Record<TuningPreset, Tuning>> = {
  standard: {
    name: 'Standard',
    strings: [
      { name: 'E', octave: 2, pitch: 4 },
      { name: 'A', octave: 2, pitch: 9 },
      { name: 'D', octave: 3, pitch: 2 },
      { name: 'G', octave: 3, pitch: 7 },
      { name: 'B', octave: 3, pitch: 11 },
      { name: 'E', octave: 4, pitch: 4 },
    ],
  },
  dropD: {
    name: 'Drop D',
    strings: [
      { name: 'D', octave: 2, pitch: 2 },
      { name: 'A', octave: 2, pitch: 9 },
      { name: 'D', octave: 3, pitch: 2 },
      { name: 'G', octave: 3, pitch: 7 },
      { name: 'B', octave: 3, pitch: 11 },
      { name: 'E', octave: 4, pitch: 4 },
    ],
  },
  openG: {
    name: 'Open G',
    strings: [
      { name: 'D', octave: 2, pitch: 2 },
      { name: 'G', octave: 2, pitch: 7 },
      { name: 'D', octave: 3, pitch: 2 },
      { name: 'G', octave: 3, pitch: 7 },
      { name: 'B', octave: 3, pitch: 11 },
      { name: 'D', octave: 4, pitch: 2 },
    ],
  },
  openD: {
    name: 'Open D',
    strings: [
      { name: 'D', octave: 2, pitch: 2 },
      { name: 'A', octave: 2, pitch: 9 },
      { name: 'D', octave: 3, pitch: 2 },
      { name: 'F#', octave: 3, pitch: 6 },
      { name: 'A', octave: 3, pitch: 9 },
      { name: 'D', octave: 4, pitch: 2 },
    ],
  },
  dadgad: {
    name: 'DADGAD',
    strings: [
      { name: 'D', octave: 2, pitch: 2 },
      { name: 'A', octave: 2, pitch: 9 },
      { name: 'D', octave: 3, pitch: 2 },
      { name: 'G', octave: 3, pitch: 7 },
      { name: 'A', octave: 3, pitch: 9 },
      { name: 'D', octave: 4, pitch: 2 },
    ],
  },
};

// ---------------------------------------------------------------------------
// CAGED System
// ---------------------------------------------------------------------------

export type CAGEDShapeName = 'C' | 'A' | 'G' | 'E' | 'D';

export interface CAGEDShape {
  shape: CAGEDShapeName;
  rootNote: NoteName;
  fretRange: [number, number];
  scalePattern: FretPosition[];
  chordVoicing: Voicing;
}
