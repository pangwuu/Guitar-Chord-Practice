export const INTERVAL_COLORS: Record<number, string> = {
  0: '#ef4444',  // Root (Red)
  1: '#f97316',  // b2 (Orange)
  2: '#f59e0b',  // 2 (Amber)
  3: '#eab308',  // b3 (Yellow)
  4: '#84cc16',  // 3 (Lime)
  5: '#22c55e',  // 4 (Green)
  6: '#06b6d4',  // b5 (Cyan)
  7: '#3b82f6',  // 5 (Blue)
  8: '#6366f1',  // b6 (Indigo)
  9: '#8b5cf6',  // 6 (Violet)
  10: '#a855f7', // b7 (Purple)
  11: '#ec4899', // 7 (Pink)
};

export const INTERVAL_LABELS: Record<number, string> = {
  0: 'R',
  1: 'b2',
  2: '2',
  3: 'b3',
  4: '3',
  5: '4',
  6: 'b5',
  7: '5',
  8: 'b6',
  9: '6',
  10: 'b7',
  11: '7',
};

const NOTES_IN_OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const normalizeNote = (name: string) => {
  const map: Record<string, string> = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
  return map[name] || name;
};

export const getInterval = (noteName: string, rootNote: string) => {
  const normalizedRoot = normalizeNote(rootNote);
  const normalizedNote = normalizeNote(noteName);
  const rootIdx = NOTES_IN_OCTAVE.indexOf(normalizedRoot);
  const noteIdx = NOTES_IN_OCTAVE.indexOf(normalizedNote);
  if (rootIdx === -1 || noteIdx === -1) return -1;
  return (noteIdx - rootIdx + 12) % 12;
};
