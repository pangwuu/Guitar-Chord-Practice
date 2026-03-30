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
 * - sharp: raises pitch by one semitone
 * - flat: lowers pitch by one semitone
 * - natural: cancels a previous accidental
 * - doubleSharp / doubleFlat: raises/lowers by two semitones (rare, advanced theory)
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
 * @property name - Chromatic note name (e.g. C#)
 * @property octave - MIDI-style octave number (middle C = C4)
 * @property pitch - Semitone index within the octave (0-11, where C=0)
 */
export interface Note {
  /** Chromatic note name */
  name: NoteName;
  /** MIDI-style octave (middle C = octave 4) */
  octave: number;
  /** Pitch class index 0-11 (C=0, C#=1, ... B=11) */
  pitch: number;
}

// ---------------------------------------------------------------------------
// Intervals
// ---------------------------------------------------------------------------

/**
 * Semitone distance from root (0-11).
 * Used throughout the engine for transposition and interval arithmetic.
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
 * Includes standard scales, pentatonics, blues, and all 7 modes of the major scale.
 */
export type ScaleType =
  | 'major'
  | 'natural_minor'
  | 'harmonic_minor'
  | 'melodic_minor'
  | 'pentatonic_major'
  | 'pentatonic_minor'
  | 'blues'
  // Modes of the major scale (Ionian through Locrian)
  | 'ionian'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian';

/**
 * Interval patterns (in semitones from root) for each scale type.
 * Ionian is identical to major; Aeolian is identical to natural minor.
 * These are kept as separate entries for explicit mode selection.
 */
export const SCALE_INTERVALS: Readonly<Record<ScaleType, readonly number[]>> = {
  major:            [0, 2, 4, 5, 7, 9, 11],
  natural_minor:    [0, 2, 3, 5, 7, 8, 10],
  harmonic_minor:   [0, 2, 3, 5, 7, 8, 11],
  melodic_minor:    [0, 2, 3, 5, 7, 9, 11],
  pentatonic_major: [0, 2, 4, 7, 9],
  pentatonic_minor: [0, 3, 5, 7, 10],
  blues:            [0, 3, 5, 6, 7, 10],
  // Modes (rotations of the major scale intervals)
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
 * Contains the root, type, computed intervals, resolved note names, and degree info.
 */
export interface Scale {
  /** Root note of the scale */
  root: NoteName;
  /** Scale type (e.g. major, dorian, blues) */
  type: ScaleType;
  /** Semitone intervals from root */
  intervals: Interval[];
  /** Resolved note names for each scale degree */
  notes: NoteName[];
  /** Detailed info per scale degree (quality, Roman numeral) */
  degrees: ScaleDegree[];
}

/**
 * Information about a single scale degree.
 * Used for diatonic chord tables and Roman numeral display.
 */
export interface ScaleDegree {
  /** Scale degree number (1-7) */
  degree: number;
  /** Note name at this degree */
  note: NoteName;
  /** Triad quality built on this degree */
  quality: 'major' | 'minor' | 'diminished' | 'augmented';
  /** Roman numeral string (e.g. "I", "ii", "vii\u00b0") */
  romanNumeral: string;
}

// ---------------------------------------------------------------------------
// Chord Qualities
// ---------------------------------------------------------------------------

/**
 * All supported chord qualities.
 * Covers triads, 7ths, extended chords, suspended chords, and altered voicings.
 */
export type ChordQuality =
  // Triads
  | 'major'
  | 'minor'
  | 'diminished'
  | 'augmented'
  // Seventh chords
  | 'dom7'
  | 'maj7'
  | 'min7'
  | 'min7b5'    // half-diminished
  | 'dim7'      // fully diminished 7th
  // Suspended
  | 'sus2'
  | 'sus4'
  // Extended and added-tone
  | 'add9'
  | '6'
  | 'm6'
  | '9'
  | 'min9'
  | 'maj9'
  // Altered and advanced
  | '7sharp9'      // Hendrix chord (dom7 + #9)
  | 'maj7sharp11'  // Lydian chord (maj7 + #11)
  | '7alt'         // Altered dominant (dom7 + b5 + #5 + b9 + #9)
  | '13';          // Dominant 13th

/**
 * Interval formulas (semitones from root) for each chord quality.
 * These define the harmonic structure of every supported chord type.
 */
export const CHORD_INTERVALS: Readonly<Record<ChordQuality, readonly number[]>> = {
  // Triads
  major:         [0, 4, 7],
  minor:         [0, 3, 7],
  diminished:    [0, 3, 6],
  augmented:     [0, 4, 8],
  // Seventh chords
  dom7:          [0, 4, 7, 10],
  maj7:          [0, 4, 7, 11],
  min7:          [0, 3, 7, 10],
  min7b5:        [0, 3, 6, 10],
  dim7:          [0, 3, 6, 9],
  // Suspended
  sus2:          [0, 2, 7],
  sus4:          [0, 5, 7],
  // Extended and added-tone
  add9:          [0, 2, 4, 7],
  '6':           [0, 4, 7, 9],
  m6:            [0, 3, 7, 9],
  '9':           [0, 2, 4, 7, 10],
  min9:          [0, 2, 3, 7, 10],
  maj9:          [0, 2, 4, 7, 11],
  // Altered and advanced
  '7sharp9':     [0, 3, 4, 7, 10],   // root, #9(=b3), 3, 5, b7
  maj7sharp11:   [0, 4, 6, 7, 11],   // root, 3, #11, 5, 7
  '7alt':        [0, 4, 6, 8, 10],   // root, 3, b5, #5, b7
  '13':          [0, 4, 7, 9, 10],   // root, 3, 5, 13(=6), b7
};

/**
 * A fully resolved chord with root, quality, and computed notes.
 * Produced by the theory engine from a root + quality combination.
 */
export interface Chord {
  /** Display name (e.g. "C Major 7th") */
  name: string;
  /** Chord symbol (e.g. "Cmaj7", "Dm") */
  symbol: string;
  /** Root note name */
  root: NoteName;
  /** Chord quality */
  quality: ChordQuality;
  /** Semitone intervals from root */
  intervals: Interval[];
  /** Resolved note names */
  notes: NoteName[];
}

/** Raw chord symbol string, e.g. "Am", "G7", "Fmaj7" */
export type ChordSymbol = string;

// ---------------------------------------------------------------------------
// Key
// ---------------------------------------------------------------------------

/**
 * A musical key defined by root note and quality (major or minor).
 */
export interface Key {
  /** Root note of the key */
  root: NoteName;
  /** Major or minor quality */
  quality: 'major' | 'minor';
}

/**
 * A key candidate with a confidence score from key detection.
 * Confidence ranges from 0 (no match) to 1 (perfect match).
 */
export interface KeyCandidate extends Key {
  /** Confidence score 0-1 */
  confidence: number;
}

// ---------------------------------------------------------------------------
// Roman Numeral Analysis
// ---------------------------------------------------------------------------

/**
 * Harmonic function categories for chord analysis.
 * Used to classify each chord in a progression by its role.
 */
export type HarmonicFunction =
  | 'tonic'
  | 'subdominant'
  | 'dominant'
  | 'predominant';

/**
 * Roman numeral analysis entry for a single chord in a progression.
 * Maps a chord symbol to its scale degree, numeral, and harmonic function.
 */
export interface RomanNumeral {
  /** Original chord symbol */
  chord: ChordSymbol;
  /** Roman numeral string (e.g. "I", "IV", "vi") */
  numeral: string;
  /** Scale degree number (1-7) */
  degree: number;
  /** Harmonic function classification */
  function: HarmonicFunction;
  /** Whether this is a secondary dominant/function */
  isSecondary?: boolean;
  /** Whether this chord is borrowed from the parallel key */
  isBorrowed?: boolean;
}

// ---------------------------------------------------------------------------
// Fretboard and Positions
// ---------------------------------------------------------------------------

/** Guitar string number (1-6, where 1 = high E, 6 = low E) */
export type StringNumber = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * A single position on the fretboard.
 * Combines string, fret, note, and optional interval information.
 */
export interface FretPosition {
  /** 0-based string index (0 = lowest/thickest string) */
  string: number;
  /** Fret number (0 = open, 1-24) */
  fret: number;
  /** Note name at this position */
  note: NoteName;
  /** Interval from root in semitones */
  interval?: Interval;
  /** Human-readable interval label (e.g. "R", "b3", "5") */
  intervalLabel?: string;
}

/**
 * A chord voicing specifying fret and finger per string.
 * null entries indicate muted strings.
 */
export interface Voicing {
  /** Fret number per string (null = muted). Index 0 = lowest string. */
  strings: (number | null)[];
  /** Finger number per string (1=index, 2=middle, 3=ring, 4=pinky, null=not used) */
  fingers: (number | null)[];
  /** Barre fret number, if this voicing uses a barre */
  barreAt?: number;
  /** Lowest fret used in this voicing */
  positionStart: number;
}

/**
 * A fretboard region containing a voicing.
 * Used for multi-position display and CAGED system mapping.
 */
export interface FretboardPosition {
  /** Lowest fret in the region */
  startFret: number;
  /** Highest fret in the region */
  endFret: number;
  /** The voicing within this region */
  voicing: Voicing;
}

// ---------------------------------------------------------------------------
// Tuning
// ---------------------------------------------------------------------------

/**
 * Playback configuration options.
 */
export interface PlaybackOptions {
  bpm: number;
  mode: 'strum' | 'arpeggio' | 'scale_ascending' | 'scale_descending';
  instrument: 'acoustic' | 'electric_clean' | 'piano';
}

/**
 * Current playback state.
 */
export interface PlaybackState {
  isPlaying: boolean;
  activeNoteIndex: number | null;
  progress: number; // 0 to 1
}

/**
 * Named tuning preset identifier.
 * Used as keys into the TUNING_PRESETS lookup.
 */
export type TuningPreset = 'standard' | 'dropD' | 'openG' | 'openD' | 'dadgad';

/**
 * Built-in tuning presets covering the most common guitar tunings.
 * - Standard: EADGBE (default)
 * - Drop D: DADGBE (heavy riffs, power chords on low strings)
 * - Open G: DGDGBD (slide guitar, Rolling Stones)
 * - Open D: DADF#AD (slide guitar, folk)
 * - DADGAD: DADGAD (Celtic, fingerstyle)
 */
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

/** The five CAGED shape names */
export type CAGEDShapeName = 'C' | 'A' | 'G' | 'E' | 'D';

/**
 * A CAGED system position on the fretboard.
 * Each shape maps a chord/scale pattern to a specific fret region.
 */
export interface CAGEDShape {
  /** Which CAGED shape (C, A, G, E, or D) */
  shape: CAGEDShapeName;
  /** Root note this shape is built around */
  rootNote: NoteName;
  /** Fret range [low, high] covered by this shape */
  fretRange: [number, number];
  /** Scale note positions within this shape */
  scalePattern: FretPosition[];
  /** Chord voicing within this shape */
  chordVoicing: Voicing;
}

// ---------------------------------------------------------------------------
// Finger Guide and Learning
// ---------------------------------------------------------------------------

/**
 * A single finger placement instruction for the finger placement guide.
 */
export interface FingerPlacement {
  /** Which finger to use */
  finger: 'index' | 'middle' | 'ring' | 'pinky' | 'thumb';
  /** 0-based string index */
  string: number;
  /** Fret number */
  fret: number;
  /** Human-readable instruction (e.g. "Place index finger on 1st fret, B string") */
  label: string;
}

/**
 * Complete finger placement guide for a chord.
 * Includes step-by-step placement, common mistakes, and string status.
 */
export interface FingerGuide {
  /** Chord symbol this guide is for */
  chord: ChordSymbol;
  /** The voicing being taught */
  voicing: Voicing;
  /** Ordered finger placement steps */
  steps: FingerPlacement[];
  /** Common mistakes to avoid */
  commonMistakes: string[];
  /** String indices that should be muted */
  mutedStrings: number[];
  /** String indices that are played open */
  openStrings: number[];
}

/**
 * Skill level for learning path progression.
 */
export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * A single step within a lesson.
 */
export interface LessonStep {
  /** Instruction text for this step */
  instruction: string;
  /** Optional chord to display/practice */
  chord?: ChordSymbol;
  /** Optional specific voicing to show */
  voicing?: Voicing;
  /** What the learner is expected to do */
  expectedAction: 'view' | 'play' | 'transition';
}

/**
 * A structured lesson in the learning path.
 * Lessons have prerequisites forming a directed acyclic graph.
 */
export interface Lesson {
  /** Unique lesson identifier */
  id: string;
  /** Display title */
  title: string;
  /** Difficulty level */
  level: LearningLevel;
  /** Description of what this lesson covers */
  description: string;
  /** Ordered steps within the lesson */
  steps: LessonStep[];
  /** IDs of lessons that must be completed before this one */
  prerequisites: string[];
}

/**
 * The overall learning path tracking progress through lessons.
 */
export interface LearningPath {
  /** Available difficulty levels */
  levels: LearningLevel[];
  /** All lessons in the path */
  lessons: Lesson[];
  /** Currently active lesson ID (null if none selected) */
  currentLessonId: string | null;
  /** IDs of completed lessons */
  completedLessonIds: string[];
}

// ---------------------------------------------------------------------------
// Chord Transition Training
// ---------------------------------------------------------------------------

/**
 * Configuration for a chord transition drill.
 * Defines the two chords, shared anchor fingers, and target tempo.
 */
export interface TransitionDrill {
  /** Starting chord */
  fromChord: ChordSymbol;
  /** Target chord */
  toChord: ChordSymbol;
  /** Fingers that stay in place between the two chords */
  anchorFingers: FingerPlacement[];
  /** Target tempo in BPM */
  targetBPM: number;
}

/**
 * Metrics from a completed chord transition attempt.
 * Used for progress tracking and improvement charts.
 */
export interface TransitionMetrics {
  /** Starting chord */
  fromChord: ChordSymbol;
  /** Target chord */
  toChord: ChordSymbol;
  /** Time taken in milliseconds */
  timeMs: number;
  /** Accuracy score 0-1 (1 = perfect timing) */
  accuracy: number;
  /** Target tempo in BPM */
  targetBPM: number;
}

// ---------------------------------------------------------------------------
// Song Analysis
// ---------------------------------------------------------------------------

/**
 * A labelled section of a song (e.g. Verse, Chorus, Bridge).
 */
export interface SongSection {
  /** Section name (e.g. "Verse", "Chorus", "Bridge") */
  name: string;
  /** Chords in this section */
  chords: ChordSymbol[];
}

/**
 * A chord progression, optionally divided into song sections.
 */
export interface ChordProgression {
  /** Flat list of all chords */
  chords: ChordSymbol[];
  /** Optional section breakdown */
  sections?: SongSection[];
}

/**
 * Complete harmonic analysis of a chord progression.
 * Includes detected key, Roman numerals, and non-diatonic chord identification.
 */
export interface HarmonicAnalysis {
  /** Best-matching key with confidence */
  key: KeyCandidate;
  /** Roman numeral analysis for each chord */
  romanNumerals: RomanNumeral[];
  /** Chords that fall outside the detected key */
  nonDiatonicChords: ChordSymbol[];
  /** Common progressions found within the detected key */
  suggestedProgressions?: ChordSymbol[][];
}

// ---------------------------------------------------------------------------
// Learning Path
// ---------------------------------------------------------------------------

export type ModuleStatus = 'locked' | 'available' | 'completed';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'chords' | 'scales' | 'theory' | 'technique';
  prerequisites: string[]; // IDs of required modules
  estimatedTime: string;
  status: ModuleStatus;
  content?: {
    text: string;
    targetChords?: string[];
    targetScale?: { root: NoteName; type: ScaleType };
  };
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  modules: LearningModule[];
}

/**
 * Source of chord data for an imported song.
 */
export type ChordSource =
  | 'ultimate_guitar'
  | 'chordify'
  | 'chord_ai'
  | 'manual';

/**
 * Result of a song import operation (Spotify/YouTube URL lookup).
 */
export interface SongImportResult {
  /** Whether the import succeeded */
  success: boolean;
  /** Song title */
  title?: string;
  /** Artist name */
  artist?: string;
  /** Original URL submitted */
  sourceUrl?: string;
  /** Platform the URL came from */
  source?: 'spotify' | 'youtube';
  /** Where the chord data was sourced */
  chordSource?: ChordSource;
  /** Detected/retrieved chords */
  chords?: ChordSymbol[];
  /** Song sections with chords */
  sections?: SongSection[];
  /** Error message if import failed */
  error?: string;
}

