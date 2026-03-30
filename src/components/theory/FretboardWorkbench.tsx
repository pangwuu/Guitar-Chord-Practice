import React, { useState } from 'react';
import { useTheory } from '../../context/TheoryContext';
import { INTERVAL_COLORS, INTERVAL_LABELS } from '../../constants';
import { Card, CardContent } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

const FretboardWorkbench: React.FC = () => {
  const { 
    tuning, 
    fretRange, 
    isLeftHanded, 
    scalePositions, 
    chordPositions,
    selectedScale,
    selectedChord
  } = useTheory();

  const [showIntervals, setShowIntervals] = useState(true);

  // Configuration
  const numStrings = tuning.strings.length;
  const numFrets = fretRange.max - fretRange.min;
  const width = 1000;
  const height = 200;
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  const fretSpacing = innerWidth / numFrets;
  const stringSpacing = innerHeight / (numStrings - 1);

  const getStringY = (s: number) => {
    // String index 0 is lowest (thickest), usually displayed at bottom
    // but in many diagrams it's at the top. Let's match typical tab/diagram:
    // Highest string (last in tuning.strings) at top
    return margin.top + (numStrings - 1 - s) * stringSpacing;
  };

  const getFretX = (f: number) => {
    const relativeFret = f - fretRange.min;
    const fretPos = isLeftHanded ? (numFrets - relativeFret) : relativeFret;
    return margin.left + fretPos * fretSpacing;
  };

  const activePositions = selectedChord ? chordPositions : scalePositions;
  const rootNote = selectedChord ? selectedChord.root : selectedScale?.root;

  return (
    <Card className="w-full overflow-hidden bg-slate-900 text-slate-200 border-slate-800" role="region" aria-label="Interactive Fretboard">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-white" id="workbench-title">
              {selectedChord 
                ? `${selectedChord.root} ${selectedChord.quality}`
                : selectedScale 
                  ? `${selectedScale.root} ${selectedScale.type}`
                  : 'Fretboard Workbench'}
            </h2>
            <p className="text-xs text-slate-400" aria-describedby="workbench-title">
              {tuning.name} Tuning • Frets {fretRange.min}-{fretRange.max}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Label htmlFor="label-mode" className="text-xs text-slate-400">Notes</Label>
            <Switch 
              id="label-mode" 
              checked={showIntervals} 
              onCheckedChange={setShowIntervals}
              aria-label="Toggle between note names and intervals"
            />
            <Label htmlFor="label-mode" className="text-xs text-slate-400">Intervals</Label>
          </div>
        </div>

        <div className="relative overflow-x-auto pb-4 custom-scrollbar" role="application" aria-label="Guitar Fretboard Diagram">
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
            {/* Fretboard background */}
            <rect 
              x={margin.left} y={margin.top} 
              width={innerWidth} height={innerHeight} 
              fill="#1e293b" 
              rx="4"
            />

            {/* Nut */}
            {fretRange.min === 0 && (
              <line 
                x1={getFretX(0)} y1={margin.top} 
                x2={getFretX(0)} y2={margin.top + innerHeight} 
                stroke="#f1f5f9" 
                strokeWidth="8" 
              />
            )}

            {/* Frets */}
            {Array.from({ length: numFrets + 1 }).map((_, i) => {
              const f = fretRange.min + i;
              if (f === 0) return null;
              return (
                <line 
                  key={`fret-${f}`}
                  x1={getFretX(f)} y1={margin.top} 
                  x2={getFretX(f)} y2={margin.top + innerHeight} 
                  stroke="#475569" 
                  strokeWidth="2" 
                />
              );
            })}

            {/* Fret Numbers */}
            {Array.from({ length: numFrets + 1 }).map((_, i) => {
              const f = fretRange.min + i;
              return (
                <text 
                  key={`fret-num-${f}`}
                  x={getFretX(f) - (f === 0 ? 0 : fretSpacing / 2)}
                  y={margin.top + innerHeight + 20}
                  textAnchor="middle"
                  fontSize="10"
                  className="fill-slate-500 font-bold"
                >
                  {f === 0 ? '' : f}
                </text>
              );
            })}

            {/* Inlay Markers (single dots at 3, 5, 7, 9, 15, 17, 19, 21) */}
            {[3, 5, 7, 9, 15, 17, 19, 21].map(f => {
              if (f < fretRange.min || f > fretRange.max) return null;
              return (
                <circle 
                  key={`inlay-${f}`}
                  cx={getFretX(f) - fretSpacing / 2}
                  cy={margin.top + innerHeight / 2}
                  r="5"
                  className="fill-slate-700/50"
                />
              );
            })}
            
            {/* Double dots at 12, 24 */}
            {[12, 24].map(f => {
              if (f < fretRange.min || f > fretRange.max) return null;
              return (
                <g key={`inlay-double-${f}`}>
                  <circle 
                    cx={getFretX(f) - fretSpacing / 2}
                    cy={margin.top + innerHeight * 0.25}
                    r="5"
                    className="fill-slate-700/50"
                  />
                  <circle 
                    cx={getFretX(f) - fretSpacing / 2}
                    cy={margin.top + innerHeight * 0.75}
                    r="5"
                    className="fill-slate-700/50"
                  />
                </g>
              );
            })}

            {/* Strings */}
            {tuning.strings.map((_, i) => (
              <line 
                key={`string-${i}`}
                x1={margin.left} y1={getStringY(i)} 
                x2={margin.left + innerWidth} y2={getStringY(i)} 
                stroke="#64748b" 
                strokeWidth={1 + i * 0.5} 
              />
            ))}

            {/* Note Markers */}
            {activePositions.map((pos, idx) => {
              const x = getFretX(pos.fret) - (pos.fret === 0 ? 0 : fretSpacing / 2);
              const y = getStringY(pos.string);
              const interval = pos.interval ?? 0;
              const color = INTERVAL_COLORS[interval] || '#64748b';
              const isRoot = interval === 0;
              const label = showIntervals ? (INTERVAL_LABELS[interval] || '?') : pos.note;

              return (
                <g 
                  key={`note-${idx}`} 
                  className="cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                  tabIndex={0}
                  role="button"
                  aria-label={`${pos.note}, ${INTERVAL_LABELS[interval] || ''}, String ${pos.string + 1}, Fret ${pos.fret}`}
                >
                  <circle 
                    cx={x} cy={y} 
                    r={pos.fret === 0 ? "10" : "12"} 
                    fill={color} 
                    stroke={isRoot ? "#fff" : "none"}
                    strokeWidth="2"
                    className="shadow-sm"
                  />
                  <text 
                    x={x} y={y} 
                    dy="0.35em" 
                    textAnchor="middle" 
                    fontSize={pos.fret === 0 ? "9" : "10"} 
                    fontWeight="bold" 
                    fill="#fff"
                    pointerEvents="none"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default FretboardWorkbench;
