import React from 'react';
import { Note } from '../../types';
import { INTERVAL_COLORS, INTERVAL_LABELS, getInterval, normalizeNote } from '../../constants';

interface PianoVisualizerProps {
  notes: Note[];
  chordName: string;
  useFlats?: boolean;
  rootNote: string;
}

const PianoVisualizer: React.FC<PianoVisualizerProps> = ({ notes, chordName, useFlats, rootNote }) => {
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

  const getSelectedNote = (noteName: string, octave: number) => {
    return notes.find(n => {
      const nOctave = parseInt(n.pitch.replace(/[^0-9]/g, ''));
      const nBase = n.pitch.replace(/[0-9]/g, ''); 
      return normalizeNote(nBase) === normalizeNote(noteName) && nOctave === octave;
    });
  };

  // Get unique intervals present in the chord for the legend
  const uniqueIntervals = Array.from(new Set(
    notes.map(n => getInterval(n.pitch.replace(/[0-9]/g, ''), rootNote))
      .filter(i => i !== -1)
  )).sort((a, b) => a - b);

  const totalWhiteKeys = octaves.length * 7;
  const width = totalWhiteKeys * whiteKeyWidth;
  const height = whiteKeyHeight + 20;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto w-full">
      <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">{chordName}</h3>
      <div className="w-full flex flex-col md:flex-row items-center gap-6 overflow-x-auto pb-2">
        <div className="flex-shrink-0">
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            {/* White Keys */}
            {octaves.map((octave, oIdx) => (
              whiteNotes.map((note, nIdx) => {
                const x = (oIdx * 7 + nIdx) * whiteKeyWidth;
                const selected = getSelectedNote(note, octave);
                const interval = selected ? getInterval(note, rootNote) : -1;
                const fillColor = interval !== -1 ? INTERVAL_COLORS[interval] : undefined;
                
                return (
                  <g key={`white-${octave}-${note}`}>
                    <rect
                      x={x}
                      y={0}
                      width={whiteKeyWidth}
                      height={whiteKeyHeight}
                      style={fillColor ? { fill: fillColor } : {}}
                      className={`${
                        !fillColor ? 'fill-white dark:fill-slate-800' : ''
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
                        className="fill-white pointer-events-none select-none drop-shadow-sm"
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
                const selected = getSelectedNote(note, octave);
                const interval = selected ? getInterval(note, rootNote) : -1;
                const fillColor = interval !== -1 ? INTERVAL_COLORS[interval] : undefined;
                const label = useFlats ? flatsInOctave[nIdx] : notesInOctave[nIdx];
                
                return (
                  <g key={`black-${octave}-${note}`}>
                    <rect
                      x={x}
                      y={0}
                      width={blackKeyWidth}
                      height={blackKeyHeight}
                      style={fillColor ? { fill: fillColor } : {}}
                      className={`${
                        !fillColor ? 'fill-slate-900 dark:fill-black' : ''
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
                        className="fill-white pointer-events-none select-none drop-shadow-sm"
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

        {/* Legend */}
        <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 min-w-[120px]">
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Scale Degrees</div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-1.5">
            {uniqueIntervals.map(interval => (
              <div key={interval} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: INTERVAL_COLORS[interval] }}
                />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {INTERVAL_LABELS[interval]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PianoVisualizer;
