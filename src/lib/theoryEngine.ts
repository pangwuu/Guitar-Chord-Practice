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
  FretPosition,
  Voicing,
  Tuning,
  CAGEDShape,
  CAGEDShapeName,
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
 * Semitone distance from a up to b (0-11, always positive mod 12).
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

// ---------------------------------------------------------------------------
// 2. Scale generation
// ---------------------------------------------------------------------------

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
    qualities = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'];
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
    // Pentatonic / blues
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


// ---------------------------------------------------------------------------
// 4. Fretboard mapping
// ---------------------------------------------------------------------------

/**
 * Get the note at a specific string + fret position for a given tuning.
 */
export function getNoteAtFret(stringIndex: number, fret: number, tuning: Tuning): NoteName {
  const openNote = tuning.strings[stringIndex];
  if (!openNote) return 'C'; 
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


// ---------------------------------------------------------------------------
// 5. CAGED shapes
// ---------------------------------------------------------------------------

/** Base open chord shapes for CAGED (frets relative to nut). */
const CAGED_BASE_SHAPES: Record<CAGEDShapeName, { frets: (number | null)[]; rootString: number }> = {
  C: { frets: [null, 3, 2, 0, 1, 0], rootString: 1 },
  A: { frets: [null, 0, 2, 2, 2, 0], rootString: 1 },
  G: { frets: [3, 2, 0, 0, 0, 3], rootString: 0 }, 
  E: { frets: [0, 2, 2, 1, 0, 0], rootString: 0 },
  D: { frets: [null, null, 0, 2, 3, 2], rootString: 2 },
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
    
    // Find the target root fret on the correct root string for this shape
    const openRootNote = getNoteAtFret(base.rootString, 0, tuning);
    let targetRootFret = (noteToIndex(root) - noteToIndex(openRootNote) + 12) % 12;
    
    let windowStart = 0;
    const baseRootFret = base.frets[base.rootString]!;
    windowStart = targetRootFret - baseRootFret;
    
    if (windowStart < 0) windowStart += 12;
    
    const windowEnd = windowStart + 4;
    
    const voicingStrings: (number | null)[] = [];
    for (let s = 0; s < tuning.strings.length; s++) {
      const targetFret = base.frets[s] !== null ? base.frets[s]! + windowStart : null;
      
      if (targetFret !== null) {
        const note = getNoteAtFret(s, targetFret, tuning);
        if (chord.notes.includes(note)) {
          voicingStrings.push(targetFret);
        } else {
          if (chord.notes.includes(getNoteAtFret(s, targetFret - 1, tuning))) {
            voicingStrings.push(targetFret - 1);
          } else if (chord.notes.includes(getNoteAtFret(s, targetFret + 1, tuning))) {
            voicingStrings.push(targetFret + 1);
          } else {
            voicingStrings.push(null);
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
 */
export function calculateTransitionAccuracy(actualTimeMs: number, targetBPM: number): number {
  if (actualTimeMs <= 0) return 0;
  const expectedTimeMs = 60000 / targetBPM;
  return Math.min(1, expectedTimeMs / actualTimeMs);
}
