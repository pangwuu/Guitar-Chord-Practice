import React from 'react';
import { Note } from '../../types';

interface PianoVisualizerProps {
  notes: Note[];
  chordName: string;
  useFlats?: boolean;
}

const PianoVisualizer: React.FC<PianoVisualizerProps> = ({ notes, chordName, useFlats }) => {
  const whiteKeyWidth = 40;
  const whiteKeyHeight = 150;
  const blackKeyWidth = 24;
  const blackKeyHeight = 90;
  
  // Dynamically determine range of octaves to show
  const octavesInChord = notes.map(n => parseInt(n.pitch.replace(/[^0-9]/g, ''))).filter(o => !isNaN(o));
  const minOctave = Math.min(...octavesInChord, 3);
  const maxOctave = Math.max(...octavesInChord, 4);
  
  const octaves: number[] = [];
  for (let i = minOctave; i <= maxOctave; i++) {
    octaves.push(i);
  }

  const notesInOctave = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const flatsInOctave = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  
  const isBlackKey = (noteName: string) => noteName.includes('#') || noteName.includes('b');

  const isNoteSelected = (noteName: string, octave: number) => {
    // Exact match on pitch (Name + Octave)
    return notes.some(n => {
      const nOctave = parseInt(n.pitch.replace(/[^0-9]/g, ''));
      const nBase = n.pitch.replace(/[0-9]/g, ''); // Use pitch string to get canonical name
      
      const normalize = (name: string) => {
        const map: Record<string, string> = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
        return map[name] || name;
      };

      const normalizedNoteName = normalize(noteName);
      return normalize(nBase) === normalizedNoteName && nOctave === octave;
    });
  };

  const totalWhiteKeys = octaves.length * 7;
  const width = totalWhiteKeys * whiteKeyWidth;
  const height = whiteKeyHeight + 20;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto w-full">
      <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">{chordName}</h3>
      <div className="w-full overflow-x-auto pb-2 flex justify-center">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* White Keys */}
          {octaves.map((octave, oIdx) => (
            whiteNotes.map((note, nIdx) => {
              const x = (oIdx * 7 + nIdx) * whiteKeyWidth;
              const selected = isNoteSelected(note, octave);
              return (
                <g key={`white-${octave}-${note}`}>
                  <rect
                    x={x}
                    y={0}
                    width={whiteKeyWidth}
                    height={whiteKeyHeight}
                    className={`${
                      selected 
                        ? 'fill-indigo-500 dark:fill-indigo-600' 
                        : 'fill-white dark:fill-slate-800'
                    } stroke-slate-300 dark:stroke-slate-600 transition-colors duration-200`}
                    strokeWidth="1"
                  />
                  {selected && (
                    <text
                      x={x + whiteKeyWidth / 2}
                      y={whiteKeyHeight - 15}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      className="fill-white pointer-events-none select-none"
                    >
                      {note}
                    </text>
                  )}
                </g>
              );
            })
          ))}

          {/* Black Keys */}
          {octaves.map((octave, oIdx) => (
            notesInOctave.map((note, nIdx) => {
              if (!isBlackKey(note)) return null;
              
              const whiteKeyIdx = nIdx === 1 ? 0 : 
                                  nIdx === 3 ? 1 : 
                                  nIdx === 6 ? 3 : 
                                  nIdx === 8 ? 4 : 
                                  5;
              
              const x = (oIdx * 7 + whiteKeyIdx) * whiteKeyWidth + (whiteKeyWidth - blackKeyWidth / 2);
              const selected = isNoteSelected(note, octave);
              const label = useFlats ? flatsInOctave[nIdx] : notesInOctave[nIdx];
              
              return (
                <g key={`black-${octave}-${note}`}>
                  <rect
                    x={x}
                    y={0}
                    width={blackKeyWidth}
                    height={blackKeyHeight}
                    className={`${
                      selected 
                        ? 'fill-indigo-400 dark:fill-indigo-500' 
                        : 'fill-slate-900 dark:fill-black'
                    } stroke-slate-700 transition-colors duration-200`}
                    strokeWidth="1"
                  />
                  {selected && (
                    <text
                      x={x + blackKeyWidth / 2}
                      y={blackKeyHeight - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      className="fill-white pointer-events-none select-none"
                    >
                      {label}
                    </text>
                  )}
                </g>
              );
            })
          ))}
        </svg>
      </div>
    </div>
  );
};

export default PianoVisualizer;
