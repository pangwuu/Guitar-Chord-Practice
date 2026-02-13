import React from 'react';
import { GuitarChordShape } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface FretboardVisualizerProps {
  shapes: GuitarChordShape[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  chordName: string;
}

const FretboardVisualizer: React.FC<FretboardVisualizerProps> = ({ 
  shapes, 
  activeIndex, 
  onIndexChange, 
  chordName 
}) => {
  const shape = shapes[activeIndex];
  if (!shape) return null;

  const numStrings = 6;
  const numFrets = 5;
  const width = 200;
  const height = 250;
  const margin = { top: 40, right: 20, bottom: 20, left: 30 };
  
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  const stringSpacing = innerWidth / (numStrings - 1);
  const fretSpacing = innerHeight / numFrets;

  const baseFret = shape.baseFret || 1;
  const isNutVisible = baseFret === 1;

  const getStringX = (s: number) => margin.left + s * stringSpacing;
  const getFretY = (f: number | 'x') => {
    if (f === 'x') return 0;
    return margin.top + (f - baseFret + 1) * fretSpacing;
  };

  const nextShape = () => onIndexChange((activeIndex + 1) % shapes.length);
  const prevShape = () => onIndexChange((activeIndex - 1 + shapes.length) % shapes.length);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between w-full mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={prevShape}
          disabled={shapes.length <= 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{chordName}</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            {/* {shape.description || `Shape ${activeIndex + 1}`} */}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={nextShape}
          disabled={shapes.length <= 1}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Nut/Top line */}
        <line
          x1={margin.left} y1={margin.top}
          x2={margin.left + innerWidth} y2={margin.top}
          stroke={isNutVisible ? "currentColor" : "#94a3b8"}
          strokeWidth={isNutVisible ? 8 : 2}
          className="text-slate-900 dark:text-slate-200"
        />

        {/* Frets */}
        {Array.from({ length: numFrets }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={margin.left} y1={margin.top + (i + 1) * fretSpacing}
            x2={margin.left + innerWidth} y2={margin.top + (i + 1) * fretSpacing}
            stroke="#94a3b8" strokeWidth={2}
          />
        ))}

        {/* Strings */}
        {Array.from({ length: numStrings }).map((_, i) => (
          <line
            key={`string-${i}`}
            x1={getStringX(i)} y1={margin.top}
            x2={getStringX(i)} y2={margin.top + innerHeight}
            stroke="#64748b" strokeWidth={1 + i * 0.5}
          />
        ))}

        {/* Markers */}
        {shape.frets.map((fret, stringIndex) => {
          if (fret === 'x') {
            return <text key={stringIndex} x={getStringX(stringIndex)} y={margin.top - 15} textAnchor="middle" fontSize="14" fontWeight="bold" className="fill-slate-400">×</text>;
          }
          if (fret === 0) {
            const isRoot = shape.rootIndices?.includes(stringIndex);
            return <circle key={stringIndex} cx={getStringX(stringIndex)} cy={margin.top - 15} r="5" fill="none" stroke={isRoot ? "#ef4444" : "currentColor"} strokeWidth="2" className={isRoot ? "" : "text-slate-400"} />;
          }
          const finger = shape.fingers ? shape.fingers[stringIndex] : null;
          const isRoot = shape.rootIndices?.includes(stringIndex);
          return (
            <g key={stringIndex}>
              <circle 
                cx={getStringX(stringIndex)} 
                cy={getFretY(fret) - fretSpacing / 2} 
                r="12" 
                className={isRoot ? "fill-red-500" : "fill-indigo-600 dark:fill-indigo-500"} 
              />
              {finger && <text x={getStringX(stringIndex)} y={getFretY(fret) - fretSpacing / 2} dy="0.35em" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">{finger}</text>}
            </g>
          );
        })}

        {/* Barre */}
        {shape.barre && (() => {
          const barredStringIndices = shape.frets
            .map((f, i) => f === shape.barre ? i : -1)
            .filter(i => i !== -1);
          
          if (barredStringIndices.length > 1) {
            const firstBarred = Math.min(...barredStringIndices);
            const lastBarred = Math.max(...barredStringIndices);
            const xStart = getStringX(firstBarred) - 12;
            const xEnd = getStringX(lastBarred) + 12;
            const barreWidth = xEnd - xStart;

            return (
              <rect
                x={xStart}
                y={getFretY(shape.barre) - fretSpacing / 2 - 12}
                width={barreWidth}
                height={24}
                rx={12}
                className="fill-indigo-600/30 dark:fill-indigo-500/30 pointer-events-none"
              />
            );
          }
          return null;
        })()}

        {/* Fret Label */}
        {!isNutVisible && (
          <text x={margin.left - 10} y={margin.top + fretSpacing / 2} textAnchor="end" dy="0.35em" fontSize="12" fontWeight="bold" className="fill-slate-500">
            {baseFret}fr
          </text>
        )}
      </svg>
      
      {shapes.length > 1 && (
        <div className="flex gap-1 mt-4">
          {shapes.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 w-1.5 rounded-full ${i === activeIndex ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FretboardVisualizer;
