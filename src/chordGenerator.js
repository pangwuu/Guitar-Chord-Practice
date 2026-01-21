// Frequency mapping for notes (A4 = 440Hz standard tuning)
const noteFrequencies = {
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

// Get frequency for a note at a specific octave (0-5)
const getFrequency = (note, octave = 3) => {
  return noteFrequencies[note][octave];
};

// Calculate interval in semitones and get the resulting note
const getNoteAtInterval = (rootNote, semitones, useFlats = false) => {
  const notesSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const notesFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  const aliases = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
    'Cb': 'B', 'Fb': 'E', 'E#': 'F', 'B#': 'C'
  };
  
  const normalizedRoot = aliases[rootNote] || rootNote;
  
  const rootIndex = notesSharp.indexOf(normalizedRoot);
  const targetIndex = (rootIndex + semitones) % 12;
  
  return useFlats ? notesFlat[targetIndex] : notesSharp[targetIndex];
};

// Chord interval formulas (in semitones from root)
const chordFormulas = {
  // Triads
  'major': [0, 4, 7],
  'minor': [0, 3, 7],
  'diminished': [0, 3, 6],
  'augmented': [0, 4, 8],
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
  
  // Seventh chords
  'maj7': [0, 4, 7, 11],
  'min7': [0, 3, 7, 10],
  '7': [0, 4, 7, 10], // dominant 7
  'min7b5': [0, 3, 6, 10], // half-diminished
  'dim7': [0, 3, 6, 9],
  'maj7#5': [0, 4, 8, 11],
  
  // Extended chords
  'maj9': [0, 4, 7, 11, 14],
  'min9': [0, 3, 7, 10, 14],
  '9': [0, 4, 7, 10, 14],
  '7#9': [0, 4, 7, 10, 15],
  '7b9': [0, 4, 7, 10, 13],
  'add9': [0, 4, 7, 14],
  
  '11': [0, 4, 7, 10, 14, 17],
  'min11': [0, 3, 7, 10, 14, 17],
  'maj7#11': [0, 4, 7, 11, 18],
  
  '13': [0, 4, 7, 10, 14, 21],
  'maj13': [0, 4, 7, 11, 14, 21],
  
  // Altered chords
  '7alt': [0, 4, 10, 13, 15], // altered dominant
  '7#5': [0, 4, 8, 10],
  '7b5': [0, 4, 6, 10],
  '7#9#5': [0, 4, 8, 10, 15],
};

// Build a chord given root note and type
const buildChord = (root, type, octave = 3, inversion = 0) => {
  const formula = chordFormulas[type];
  if (!formula) return null;
  
  // Determine if we should use flats based on root and type
  const flatRoots = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
  const minorFlatRoots = ['C', 'G', 'D']; // Cm, Gm, Dm (specifically for dim/flat 5s) prefer flats
  
  const useFlats = flatRoots.includes(root) || 
    (minorFlatRoots.includes(root) && (type.includes('min') || type.includes('dim') || type.includes('m7')));

  let notes = formula.map(interval => {
    const noteName = getNoteAtInterval(root, interval, useFlats);
    const noteOctave = octave + Math.floor(interval / 12);
    return {
      name: noteName,
      pitch: `${noteName}${noteOctave}`,
      frequency: getFrequency(noteName, noteOctave)
    };
  });
  
  // Keep the original order for note names (display)
  const noteNames = notes.map(n => n.name);
  
  // Apply inversion by moving bottom notes up an octave
  for (let i = 0; i < inversion && i < notes.length; i++) {
    notes[i].frequency = notes[i].frequency * 2;
  }
  
  // Sort by frequency to maintain voicing for audio playback
  const sortedNotes = [...notes].sort((a, b) => a.frequency - b.frequency);
  
  return {
    notes: sortedNotes,
    noteNames: noteNames
  };
};

// Generate chord name with proper formatting
const formatChordName = (root, type) => {
  const typeNames = {
    'major': '',
    'minor': 'm',
    'diminished': 'dim',
    'augmented': 'aug',
    'sus2': 'sus2',
    'sus4': 'sus4',
    'maj7': 'maj7',
    'min7': 'm7',
    '7': '7',
    'min7b5': 'm7b5',
    'dim7': 'dim7',
    'maj7#5': 'maj7#5',
    'maj9': 'maj9',
    'min9': 'm9',
    '9': '9',
    '7#9': '7#9',
    '7b9': '7b9',
    'add9': 'add9',
    '11': '11',
    'min11': 'm11',
    'maj7#11': 'maj7#11',
    '13': '13',
    'maj13': 'maj13',
    '7alt': '7alt',
    '7#5': '7#5',
    '7b5': '7b5',
    '7#9#5': '7#9#5',
  };
  
  return root + typeNames[type];
};

// Helper to create slash chord object
const createSlashChord = (root, type, inversion) => {
  const invChord = buildChord(root, type, 3, inversion);
  const bassNote = invChord.notes[0].name; // Lowest frequency note is bass
  
  return {
    name: `${formatChordName(root, type)}/${bassNote}`,
    ...invChord
  };
};

// Generate chords for each difficulty level
export const generateChordSet = (difficulty) => {
  const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const flatRoots = ['Db', 'Eb', 'Gb', 'Ab', 'Bb'];
  
  switch (difficulty) {
    case 'beginner': {
      // Basic major and minor triads in root position - Standard Open Chords only (CAGED)
      const openMajor = ['C', 'A', 'G', 'E', 'D'];
      const openMinor = ['A', 'E', 'D'];
      
      const chords = [];
      openMajor.forEach(root => {
        const chordData = buildChord(root, 'major');
        chords.push({
          name: formatChordName(root, 'major'),
          ...chordData
        });
      });
      openMinor.forEach(root => {
        const chordData = buildChord(root, 'minor');
        chords.push({
          name: formatChordName(root, 'minor'),
          ...chordData
        });
      });
      return chords;
    }
    
    case 'novice': {
      // All roots, Major/Minor triads (no inversions) + Dominant 7ths
      return [...roots, ...flatRoots].flatMap(root => {
        const chords = [];
        
        // Major Triad
        chords.push({
          name: formatChordName(root, 'major'),
          ...buildChord(root, 'major')
        });
        
        // Minor Triad
        chords.push({
          name: formatChordName(root, 'minor'),
          ...buildChord(root, 'minor')
        });
        
        // Dominant 7th
        chords.push({
          name: formatChordName(root, '7'),
          ...buildChord(root, '7')
        });
        
        return chords;
      });
    }

    case 'intermediate':
      // Triads (including F and B), inversions, 7th chords, sus chords
      return [...roots, ...flatRoots].flatMap(root => {
        const chords = [];
        
        // Basic Triads
        chords.push({
          name: formatChordName(root, 'major'),
          ...buildChord(root, 'major')
        });
        chords.push({
          name: formatChordName(root, 'minor'),
          ...buildChord(root, 'minor')
        });

        // Slash Chords (1st Inversion Major Triads)
        chords.push(createSlashChord(root, 'major', 1));
        
        // Slash Chords (1st Inversion Minor Triads) e.g. Am/C
        chords.push(createSlashChord(root, 'minor', 1));

        // 7th Chords
        chords.push({
          name: formatChordName(root, 'maj7'),
          ...buildChord(root, 'maj7')
        });
        chords.push({
          name: formatChordName(root, 'min7'),
          ...buildChord(root, 'min7')
        });
        chords.push({
          name: formatChordName(root, '7'),
          ...buildChord(root, '7')
        });
        
        // Slash 7ths (Inversions)
        // 1st inversion maj7 (e.g. Cmaj7/E)
        chords.push(createSlashChord(root, 'maj7', 1));
        
        // 2nd inversion maj7 (e.g. Cmaj7/G) - Wait, Cmaj7 is C E G B. 5th is G.
        // Fmaj7/C is a common request (2nd inversion)
        chords.push(createSlashChord(root, 'maj7', 2));
        
        // 3rd inversion 7th (e.g. C7/Bb) - 7th in bass
        chords.push(createSlashChord(root, '7', 3));
        
        return chords;
      });
    
    case 'advanced':
      // Augmented, diminished, extended chords, altered voicings
      return [...roots, ...flatRoots].flatMap(root => {
        const types = ['diminished', 'augmented', 'min7b5', 'dim7', 'maj9', '9', '7#9'];
        return types.map(type => ({
          name: formatChordName(root, type),
          ...buildChord(root, type)
        }));
      });
    
    case 'jazz':
      // Complex voicings, alterations, upper extensions
      return [...roots, ...flatRoots].flatMap(root => {
        const types = ['maj7#11', '7alt', '13', 'maj13', 'min11', '7#9#5', '7b9', 'maj7#5'];
        return types.map(type => ({
          name: formatChordName(root, type),
          ...buildChord(root, type)
        }));
      });
    
    default:
      return [];
  }
};