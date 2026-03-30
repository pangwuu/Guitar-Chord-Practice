import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Info,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { useTheory } from '../../context/TheoryContext';

interface FingerStep {
  finger: number; // 1=index, 2=middle, 3=ring, 4=pinky
  string: number; // 0-indexed (0=Low E)
  fret: number;
  instruction: string;
}

interface ChordTutorial {
  name: string;
  frets: (number | 'x')[];
  steps: FingerStep[];
  tips: string[];
  mistakes: string[];
}

const TUTORIAL_CHORDS: ChordTutorial[] = [
  {
    name: 'C Major',
    frets: ['x', 3, 2, 0, 1, 0],
    steps: [
      { finger: 1, string: 4, fret: 1, instruction: 'Place your Index finger on the 1st fret of the B string.' },
      { finger: 2, string: 2, fret: 2, instruction: 'Place your Middle finger on the 2nd fret of the D string.' },
      { finger: 3, string: 1, fret: 3, instruction: 'Place your Ring finger on the 3rd fret of the A string.' },
    ],
    tips: [
      'Keep your fingers arched so they dont mute the open strings.',
      'The Low E string should not be played.'
    ],
    mistakes: [
      'Muting the high E string with your index finger.',
      'Not pressing hard enough on the A string.'
    ]
  },
  {
    name: 'G Major',
    frets: [3, 2, 0, 0, 0, 3],
    steps: [
      { finger: 2, string: 1, fret: 2, instruction: 'Place your Middle finger on the 2nd fret of the A string.' },
      { finger: 3, string: 0, fret: 3, instruction: 'Place your Ring finger on the 3rd fret of the Low E string.' },
      { finger: 4, string: 5, fret: 3, instruction: 'Place your Pinky finger on the 3rd fret of the High E string.' },
    ],
    tips: [
      'This is the "folk" G voicing. You can also use fingers 1, 2, and 3.',
      'Make sure the open strings (D, G, B) ring out clearly.'
    ],
    mistakes: [
      'Muting the A string with your ring finger.',
      'Leaning too far back with the pinky.'
    ]
  },
  {
    name: 'A Minor',
    frets: ['x', 0, 2, 2, 1, 0],
    steps: [
      { finger: 1, string: 4, fret: 1, instruction: 'Place your Index finger on the 1st fret of the B string.' },
      { finger: 2, string: 2, fret: 2, instruction: 'Place your Middle finger on the 2nd fret of the D string.' },
      { finger: 3, string: 3, fret: 2, instruction: 'Place your Ring finger on the 2nd fret of the G string.' },
    ],
    tips: [
      'This shape is identical to E Major, just moved down one string.',
      'The A string is played open.'
    ],
    mistakes: [
      'Muting the open A string.',
      'Fingers being too far from the fret wires.'
    ]
  }
];

const FINGER_COLORS: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-blue-500',
  3: 'bg-green-500',
  4: 'bg-yellow-500'
};

const FINGER_NAMES: Record<number, string> = {
  1: 'Index',
  2: 'Middle',
  3: 'Ring',
  4: 'Pinky'
};

const FingerPlacementGuide: React.FC = () => {
  const { tuning, isLeftHanded } = useTheory();
  const [selectedChordIdx, setSelectedChordIdx] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(-1); // -1 = show nothing, 0+ = steps, steps.length = all

  const currentChord = TUTORIAL_CHORDS[selectedChordIdx];
  const isFinished = currentStepIdx === currentChord.steps.length;

  const nextStep = () => {
    if (currentStepIdx < currentChord.steps.length) {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIdx > -1) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const reset = () => setCurrentStepIdx(-1);

  // SVG Config
  const width = 300;
  const height = 400;
  const margin = { top: 40, right: 30, bottom: 40, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  const numStrings = 6;
  const numFrets = 5;
  const stringSpacing = innerWidth / (numStrings - 1);
  const fretSpacing = innerHeight / numFrets;

  const getX = (s: number) => {
    const stringIdx = isLeftHanded ? (numStrings - 1 - s) : s;
    return margin.left + stringIdx * stringSpacing;
  };
  const getY = (f: number) => margin.top + f * fretSpacing - (fretSpacing / 2);

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            Finger Placement Guide
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Step-by-step instructions for essential chords.</p>
        </div>
        
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {TUTORIAL_CHORDS.map((chord, idx) => (
            <Button
              key={chord.name}
              variant={selectedChordIdx === idx ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setSelectedChordIdx(idx);
                setCurrentStepIdx(-1);
              }}
              className="text-xs font-bold"
            >
              {chord.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Diagram */}
        <Card className="flex items-center justify-center p-8 bg-white dark:bg-slate-900 border-2">
          <div className="relative">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
              {/* Frets */}
              {Array.from({ length: numFrets + 1 }).map((_, f) => (
                <line
                  key={`fret-${f}`}
                  x1={margin.left}
                  y1={margin.top + f * fretSpacing}
                  x2={margin.left + innerWidth}
                  y2={margin.top + f * fretSpacing}
                  stroke={f === 0 ? "#475569" : "#cbd5e1"}
                  strokeWidth={f === 0 ? 8 : 2}
                />
              ))}
              {/* Strings */}
              {Array.from({ length: numStrings }).map((_, s) => (
                <line
                  key={`string-${s}`}
                  x1={getX(s)}
                  y1={margin.top}
                  x2={getX(s)}
                  y2={margin.top + innerHeight}
                  stroke="#94a3b8"
                  strokeWidth={1 + s * 0.5}
                />
              ))}

              {/* Nut Indicators (X/O) */}
              {currentChord.frets.map((f, s) => {
                const x = getX(s);
                const y = margin.top - 15;
                if (f === 'x') {
                  return <text key={s} x={x} y={y} textAnchor="middle" fontSize="14" fontWeight="bold" className="fill-red-500">X</text>;
                }
                if (f === 0) {
                  return <circle key={s} cx={x} y={y - 4} r="5" fill="none" stroke="#64748b" strokeWidth="2" />;
                }
                return null;
              })}

              {/* Fingers */}
              {currentChord.steps.map((step, idx) => {
                if (idx > currentStepIdx && !isFinished) return null;
                const isCurrent = idx === currentStepIdx;
                const x = getX(step.string);
                const y = getY(step.fret);
                const color = FINGER_COLORS[step.finger];

                return (
                  <g key={idx} className={cn(isCurrent ? "animate-pulse" : "")}>
                    <circle
                      cx={x}
                      cy={y}
                      r="14"
                      className={cn(color, "stroke-white stroke-2 shadow-lg")}
                    />
                    <text
                      x={x}
                      y={y}
                      dy="0.35em"
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="white"
                    >
                      {step.finger}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </Card>

        {/* Right: Steps & Tips */}
        <div className="space-y-6">
          <Card className={cn(
            "transition-all border-2",
            isFinished ? "border-green-500 bg-green-50/30 dark:bg-green-950/10" : "border-slate-200"
          )}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-black">{currentChord.name}</CardTitle>
                  <CardDescription>
                    {isFinished ? 'All fingers placed!' : `Step ${currentStepIdx + 2} of ${currentChord.steps.length}`}
                  </CardDescription>
                </div>
                {isFinished && <CheckCircle2 className="w-8 h-8 text-green-500" />}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="min-h-[80px] p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border italic text-slate-700 dark:text-slate-300">
                {currentStepIdx === -1 ? (
                  "Ready to start? Click 'Next' to place your first finger."
                ) : isFinished ? (
                  "Great job! Now strum all strings except those marked with an X. Each note should ring out clearly."
                ) : (
                  currentChord.steps[currentStepIdx].instruction
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="lg" onClick={prevStep} disabled={currentStepIdx === -1} className="flex-1">
                  <ChevronLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                {isFinished ? (
                  <Button size="lg" onClick={reset} className="flex-1 bg-indigo-600">
                    <RotateCcw className="mr-2 w-4 h-4" /> Reset
                  </Button>
                ) : (
                  <Button size="lg" onClick={nextStep} className="flex-1 bg-indigo-600">
                    Next <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-amber-50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  Avoid These
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ul className="text-xs text-amber-600 dark:text-amber-500/80 space-y-2 list-disc list-inside">
                  {currentChord.mistakes.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-indigo-50 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/30">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                  <Info className="w-4 h-4" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ul className="text-xs text-indigo-600 dark:text-indigo-500/80 space-y-2 list-disc list-inside">
                  {currentChord.tips.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FingerPlacementGuide;
