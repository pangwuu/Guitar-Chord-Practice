import { Note, ChordData, Chord, Difficulty, GuitarChordShape } from './types';

// Frequency mapping for notes (A4 = 440Hz standard tuning)
const noteFrequencies: Record<string, number[]> = {
  'C': [32.70, 65.41, 130.81, 261.63, 523.25, 1046.50],
  'C#': [34.65, 69.30, 138.59, 277.18, 554.37, 1108.73],
  'Db': [34.65, 69.30, 138.59, 277.18, 554.37, 1108.73],
  'D': [36.71, 73.42, 146.83, 293.66, 587.33, 1174.66],
  'D#': [38.89, 77.78, 155.56, 311.13, 622.25, 1244.51],
  'Eb': [38.89, 77.78, 155.56, 311.13, 622.25, 1244.51],
  'E': [41.20, 82.41, 164.81, 329.63, 659.25, 1318.51],
  'F': [43.65, 87.31, 174.61, 349.23, 698.46, 1396.91],
  'F#': [46.25, 92.50, 185.00, 369.99, 739.99, 1479.98],
  'Gb': [46.25, 92.50, 185.00, 369.99, 739.99, 1479.98],
  'G': [49.00, 98.00, 196.00, 392.00, 783.99, 1567.98],
  'G#': [51.91, 103.83, 207.65, 415.30, 830.61, 1661.22],
  'Ab': [51.91, 103.83, 207.65, 415.30, 830.61, 1661.22],
  'A': [55.00, 110.00, 220.00, 440.00, 880.00, 1760.00],
  'A#': [58.27, 116.54, 233.08, 466.16, 932.33, 1864.66],
  'Bb': [58.27, 116.54, 233.08, 466.16, 932.33, 1864.66],
  'B': [61.74, 123.47, 246.94, 493.88, 987.77, 1975.53],
};

const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface Pattern {
  rootString: number;
  frets: (number | 'x')[]; 
  fingers: (number | null)[];
  barre?: boolean;
}

const PATTERNS: Record<string, Pattern[]> = {
  'major': [
    { rootString: 0, frets: [0, 2, 2, 1, 0, 0], fingers: [1, 3, 4, 2, 1, 1], barre: true },
    { rootString: 1, frets: ['x', 0, 2, 2, 2, 0], fingers: [null, 1, 3, 3, 3, 1], barre: true },
    { rootString: 2, frets: ['x', 'x', 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2] },
  ],
  'minor': [
    { rootString: 0, frets: [0, 2, 2, 0, 0, 0], fingers: [1, 3, 4, 1, 1, 1], barre: true },
    { rootString: 1, frets: ['x', 0, 2, 2, 1, 0], fingers: [null, 1, 3, 4, 2, 1], barre: true },
    { rootString: 2, frets: ['x', 'x', 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1] },
  ],
  '7': [
    { rootString: 0, frets: [0, 2, 0, 1, 0, 0], fingers: [1, 3, 1, 2, 1, 1], barre: true },
    { rootString: 1, frets: ['x', 0, 2, 0, 2, 0], fingers: [null, 1, 3, 1, 4, 1], barre: true },
  ],
  'maj7': [
    { rootString: 0, frets: [0, 'x', 1, 1, 0, 'x'], fingers: [1, null, 3, 4, 2, null] },
    { rootString: 1, frets: ['x', 0, 2, 1, 2, 0], fingers: [null, 1, 3, 2, 4, 1], barre: true },
  ],
  'min7': [
    { rootString: 0, frets: [0, 'x', 0, 0, 0, 'x'], fingers: [1, null, 1, 1, 1, null], barre: true },
    { rootString: 1, frets: ['x', 0, 2, 0, 1, 0], fingers: [null, 1, 3, 1, 2, 1], barre: true },
  ],
  'sus4': [
    { rootString: 0, frets: [0, 2, 2, 2, 0, 0], fingers: [1, 3, 4, 2, 1, 1], barre: true },
    { rootString: 1, frets: ['x', 0, 2, 2, 3, 0], fingers: [null, 1, 3, 4, 2, 1], barre: true },
  ],
  'sus2': [
    { rootString: 1, frets: ['x', 0, 2, 2, 0, 0], fingers: [null, 1, 3, 4, 1, 1], barre: true },
  ],
  'dim7': [
    { rootString: 0, frets: [0, 'x', 0, 1, 0, 'x'], fingers: [1, null, 2, 4, 3, null] },
    { rootString: 1, frets: ['x', 0, 1, 0, 1, 'x'], fingers: [null, 1, 2, 1, 3, null], barre: true },
  ],
  'min7b5': [
    { rootString: 0, frets: [0, 'x', 0, 0, 'x', 'x'], fingers: [1, null, 2, 3, null, null] },
    { rootString: 1, frets: ['x', 0, 1, 0, 1, 'x'], fingers: [null, 1, 2, 1, 3, null] },
  ],
  'maj9': [
    { rootString: 1, frets: ['x', 0, -1, 1, 0, 'x'], fingers: [null, 2, 1, 3, 1, null] },
  ],
  '9': [
    { rootString: 1, frets: ['x', 0, -1, 0, 0, 0], fingers: [null, 2, 1, 3, 3, 3], barre: true },
  ],
  '7#9': [
    { rootString: 1, frets: ['x', 0, -1, 0, 1, 'x'], fingers: [null, 2, 1, 3, 4, null] },
  ],
  'maj7#11': [
    { rootString: 0, frets: [0, 'x', 1, 1, -1, 'x'], fingers: [2, null, 3, 4, 1, null] },
    { rootString: 0, frets: [0, 'x', 0, 1, 1, 'x'], fingers: [1, null, 2, 3, 4, null] },
  ],
  '7alt': [
    { rootString: 0, frets: [0, 'x', 0, 1, 2, 'x'], fingers: [1, null, 2, 3, 4, null] },
  ],
  '13': [
    { rootString: 0, frets: [0, 'x', 0, 1, 2, 2], fingers: [1, null, 2, 3, 4, 4] },
  ]
};

const OPEN_SHAPES: Record<string, Record<string, GuitarChordShape>> = {
  'C': { 'major': { frets: ['x', 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], rootIndices: [1, 3] } },
  'G': { 'major': { frets: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4], rootIndices: [0, 2, 3, 5] } },
  'A': { 
    'major': { frets: ['x', 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], rootIndices: [1, 5] },
    'minor': { frets: ['x', 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], rootIndices: [1, 5] },
    '7': { frets: ['x', 0, 2, 0, 2, 0], fingers: [null, null, 1, null, 2, null], rootIndices: [1, 5] },
  },
  'E': {
    'major': { frets: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], rootIndices: [0, 4, 5] },
    'minor': { frets: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], rootIndices: [0, 4, 5] },
    '7': { frets: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], rootIndices: [0, 4, 5] },
  },
  'D': {
    'major': { frets: ['x', 'x', 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], rootIndices: [2, 4] },
    'minor': { frets: ['x', 'x', 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], rootIndices: [2, 4] },
    '7': { frets: ['x', 'x', 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3], rootIndices: [2, 4] },
  }
};

const normalizeNote = (n: string) => n.replace(/[0-9]/g, '').replace('Db', 'C#').replace('Eb', 'D#').replace('Gb', 'F#').replace('Ab', 'G#').replace('Bb', 'A#');

const generateShapes = (root: string, type: string, inversion: number = 0, targetNotes: string[] = []): GuitarChordShape[] => {
  const rootIdx = SHARP_NOTES.indexOf(normalizeNote(root));
  if (rootIdx === -1) return [];

  const stringBaseNotes = [4, 9, 2, 7, 11, 4];
  const shapes: GuitarChordShape[] = [];
  
  if (inversion === 0 && OPEN_SHAPES[root]?.[type]) {
    shapes.push({ ...OPEN_SHAPES[root][type], description: "Open Position", baseFret: 1 });
  }

  const patterns = PATTERNS[type] || [];
  patterns.forEach(pattern => {
    const rootFret = (rootIdx - stringBaseNotes[pattern.rootString] + 12) % 12;
    if (rootFret === 0 && inversion === 0 && shapes.length > 0) return; 

    const frets = pattern.frets.map(f => f === 'x' ? 'x' : rootFret + f);
    const numericFrets = frets.filter((f): f is number => typeof f === 'number');
    const minFret = Math.min(...numericFrets);
    const maxFret = Math.max(...numericFrets);

    if (maxFret <= 15 && minFret >= 0 && (maxFret - minFret <= 4)) {
      const rootIndices: number[] = [];
      frets.forEach((f, i) => {
        if (f !== 'x' && (stringBaseNotes[i] + f) % 12 === rootIdx) {
          rootIndices.push(i);
        }
      });

      shapes.push({
        frets,
        fingers: pattern.fingers,
        barre: pattern.barre ? rootFret : undefined,
        baseFret: minFret > 0 ? minFret : 1,
        description: `${SHARP_NOTES[stringBaseNotes[pattern.rootString]]}-Style Barre`,
        rootIndices
      });
    }
  });

  if (inversion > 0 && targetNotes.length > 0) {
    const bassNote = normalizeNote(targetNotes[0]);
    const filtered = shapes.filter(shape => {
      const firstPlayedIdx = shape.frets.findIndex(f => f !== 'x');
      const firstFret = shape.frets[firstPlayedIdx] as number;
      const playedNoteName = SHARP_NOTES[(stringBaseNotes[firstPlayedIdx] + firstFret) % 12];
      return playedNoteName === bassNote;
    });

    if (filtered.length > 0) {
      return filtered.map(s => ({ ...s, description: `${s.description} (${inversion === 1 ? '1st' : '2nd'} Inv.)` }));
    }
    
    // FALLBACK (Avoiding infinite recursion): Call generateShapes with inv=0 but don't fall back again
    const rootShapes = generateShapes(root, type, 0);
    return rootShapes.map(s => ({ ...s, description: `${s.description} (Root Fallback)` }));
  }

  return shapes;
};

const chordFormulas: Record<string, number[]> = {
  'major': [0, 4, 7], 'minor': [0, 3, 7], 'diminished': [0, 3, 6], 'augmented': [0, 4, 8],
  'sus2': [0, 2, 7], 'sus4': [0, 5, 7], '5': [0, 7], '6': [0, 4, 7, 9], 'm6': [0, 3, 7, 9],
  'maj7': [0, 4, 7, 11], 'min7': [0, 3, 7, 10], '7': [0, 4, 7, 10], 'min7b5': [0, 3, 6, 10],
  'dim7': [0, 3, 6, 9], 'maj9': [0, 4, 7, 11, 14], 'min9': [0, 3, 7, 10, 14], '9': [0, 4, 7, 10, 14],
  'maj7#11': [0, 4, 7, 11, 18], '13': [0, 4, 7, 10, 14, 21], '7alt': [0, 4, 10, 13], '7#9': [0, 4, 7, 10, 15]
};

const getNoteAtIntervalInternal = (rootNote: string, semitones: number, useFlats: boolean = false): string => {
  const notesSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const notesFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const normalizedRoot = normalizeNote(rootNote);
  const rootIndex = notesSharp.indexOf(normalizedRoot);
  const targetIndex = (rootIndex + semitones) % 12;
  return useFlats ? notesFlat[targetIndex] : notesSharp[targetIndex];
};

const buildChord = (root: string, type: string, octave: number = 3, inversion: number = 0): ChordData | null => {
  const formula = chordFormulas[type];
  if (!formula) return null;
  const useFlats = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(root);
  
  let notes: Note[] = formula.map(interval => {
    const noteName = getNoteAtIntervalInternal(root, interval, useFlats);
    const noteOctave = octave + Math.floor(interval / 12);
    return { name: noteName, pitch: `${noteName}${noteOctave}`, frequency: noteFrequencies[normalizeNote(noteName)][noteOctave] };
  });

  for (let i = 0; i < inversion && i < notes.length; i++) {
    const note = notes[i];
    const currentOctave = parseInt(note.pitch.replace(/[^0-9]/g, ''));
    note.pitch = `${note.name}${currentOctave + 1}`;
    note.frequency *= 2;
  }
  
  const sortedNotes = [...notes].sort((a, b) => a.frequency - b.frequency);
  return { notes: sortedNotes, noteNames: notes.map(n => n.name), useFlats };
};

const formatChordName = (root: string, type: string): string => {
  const typeNames: Record<string, string> = { 'major': '', 'minor': 'm', 'diminished': 'dim', 'augmented': 'aug', 'maj7': 'maj7', 'min7': 'm7', '7': '7' };
  return root + (typeNames[type] !== undefined ? typeNames[type] : type);
};

export const ALL_CHORD_TYPES = Object.keys(chordFormulas);

export const generateChordSet = (
  difficulty: Difficulty, 
  customChordTypes: string[] = [], 
  includeInversions: boolean = false
): Chord[] => {
  const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const allRoots = [...roots, 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];
  
  const createChordObj = (root: string, type: string, inv: number = 0): Chord => {
    const base = buildChord(root, type, 3, inv)!;
    const name = inv > 0 ? `${formatChordName(root, type)}/${base.notes[0].name}` : formatChordName(root, type);
    return { ...base, name, guitarShapes: generateShapes(root, type, inv, base.notes.map(n => n.name)), activeShapeIndex: 0 };
  };

  if (difficulty === 'beginner') {
    const beginnerMajor = ['C', 'A', 'G', 'E', 'D'];
    const beginnerMinor = ['A', 'E', 'D'];
    return [
      ...beginnerMajor.map(r => createChordObj(r, 'major')),
      ...beginnerMinor.map(r => createChordObj(r, 'minor'))
    ];
  }

  const typesByDifficulty: Record<string, string[]> = {
    novice: ['major', 'minor', '7'],
    intermediate: ['major', 'minor', 'maj7', 'min7', '7', 'sus4', 'sus2'],
    advanced: ['diminished', 'augmented', 'min7b5', 'dim7', 'maj9', '9', '7#9'],
    jazz: ['maj7#11', '7alt', '13', 'min9', 'maj9']
  };

  const getTypes = () => difficulty === 'custom' ? customChordTypes : typesByDifficulty[difficulty] || ['major'];

  return allRoots.flatMap(root => {
    return getTypes().flatMap(type => {
      const results = [createChordObj(root, type, 0)];
      if (includeInversions && difficulty !== 'novice') {
        results.push(createChordObj(root, type, 1));
        results.push(createChordObj(root, type, 2));
      }
      return results;
    });
  });
};
