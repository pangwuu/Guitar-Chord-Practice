import React, { useState, useMemo, useEffect } from 'react';
import { useTheory } from '../../context/TheoryContext';
import { CHROMATIC_NOTES, ChordQuality, CAGEDShapeName } from '../../types/theory';
import { getCAGEDShapes, getNoteAtFret, intervalBetween } from '../../lib/theoryEngine';
import { INTERVAL_COLORS, INTERVAL_LABELS } from '../../constants';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Grid3X3, Info } from 'lucide-react';

const CHORD_QUALITIES: { value: ChordQuality; label: string }[] = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
  { value: 'dom7', label: 'Dominant 7th' },
  { value: 'maj7', label: 'Major 7th' },
  { value: 'min7', label: 'Minor 7th' },
];

const CAGEDExplorer: React.FC = () => {
  const { tuning, isLeftHanded, selectedChord, setSelectedChord, activeCAGEDShape, setActiveCAGEDShape } = useTheory();
  
  // Ensure we have a chord selected in context
  useEffect(() => {
    if (!selectedChord) {
      setSelectedChord({ root: 'C', quality: 'major' });
    }
    if (!activeCAGEDShape) {
      setActiveCAGEDShape('C');
    }
  }, [selectedChord, setSelectedChord, activeCAGEDShape, setActiveCAGEDShape]);

  const root = selectedChord?.root || 'C';
  const quality = selectedChord?.quality || 'major';
  const activeShape = activeCAGEDShape || 'C';

  const [showIntervals, setShowIntervals] = useState(true);
  const [showScale, setShowScale] = useState(false);

  const cagedShapes = useMemo(() => {
    return getCAGEDShapes(root as any, quality, tuning);
  }, [root, quality, tuning]);

  const currentShape = useMemo(() => {
    return cagedShapes.find(s => s.shape === activeShape) || cagedShapes[0];
  }, [cagedShapes, activeShape]);

  // Fretboard Configuration - Full Neck (24 frets) for true exploration
  const numStrings = tuning.strings.length;
  const numFrets = 24; 
  const width = 1200;
  const height = 200;
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  const fretSpacing = innerWidth / numFrets;
  const stringSpacing = innerHeight / (numStrings - 1);

  const getStringY = (s: number) => margin.top + (numStrings - 1 - s) * stringSpacing;
  const getFretX = (f: number) => {
    const pos = isLeftHanded ? (numFrets - f) : f;
    return margin.left + pos * fretSpacing;
  };

  const handleRootChange = (newRoot: any) => {
    setSelectedChord({ root: newRoot, quality });
  };

  const handleQualityChange = (newQuality: ChordQuality) => {
    setSelectedChord({ root, quality: newQuality });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Grid3X3 className="w-8 h-8 text-indigo-600" />
            CAGED Explorer
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Master the 5 shapes of the guitar neck</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">Chord Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Root</Label>
                <div className="grid grid-cols-4 gap-1">
                  {CHROMATIC_NOTES.map(n => (
                    <Button 
                      key={n} 
                      variant={root === n ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => handleRootChange(n)}
                      className="h-8 text-[10px] px-0"
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Quality</Label>
                <div className="flex flex-col gap-1">
                  {CHORD_QUALITIES.map(q => (
                    <Button 
                      key={q.value} 
                      variant={quality === q.value ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => handleQualityChange(q.value)}
                      className="h-8 text-xs justify-start font-normal"
                    >
                      {q.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">Shape Selector</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-1">
                {(['C', 'A', 'G', 'E', 'D'] as CAGEDShapeName[]).map(s => (
                  <Button 
                    key={s} 
                    variant={activeShape === s ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setActiveShape(s)}
                    className="h-10 text-lg font-bold"
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-scale" className="text-xs cursor-pointer">Show Scale Pattern</Label>
                <Switch id="show-scale" checked={showScale} onCheckedChange={setShowScale} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-intervals" className="text-xs cursor-pointer">Show Intervals</Label>
                <Switch id="show-intervals" checked={showIntervals} onCheckedChange={setShowIntervals} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-slate-900 border-slate-800 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-2xl font-black text-white">
                    {activeShape}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white leading-none mb-1">{root} {quality} Shape</h2>
                    <p className="text-xs text-slate-400 uppercase tracking-widest">
                      Fret Window: {currentShape.fretRange[0]}-{currentShape.fretRange[1]}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-x-auto pb-4 custom-scrollbar">
                <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
                  {/* Fretboard background */}
                  <rect x={margin.left} y={margin.top} width={innerWidth} height={innerHeight} fill="#1e293b" rx="4" />

                  {/* Highlighted region background */}
                  <rect 
                    x={getFretX(isLeftHanded ? currentShape.fretRange[1] : currentShape.fretRange[0])} 
                    y={margin.top} 
                    width={Math.abs(getFretX(currentShape.fretRange[1]) - getFretX(currentShape.fretRange[0]))} 
                    height={innerHeight} 
                    fill="#4f46e5" 
                    fillOpacity="0.1" 
                  />

                  {/* Nut */}
                  <line x1={getFretX(0)} y1={margin.top} x2={getFretX(0)} y2={margin.top + innerHeight} stroke="#f1f5f9" strokeWidth="8" />

                  {/* Frets */}
                  {Array.from({ length: numFrets + 1 }).map((_, f) => f > 0 && (
                    <line key={f} x1={getFretX(f)} y1={margin.top} x2={getFretX(f)} y2={margin.top + innerHeight} stroke="#475569" strokeWidth={f % 12 === 0 ? 4 : 2} />
                  ))}

                  {/* Strings */}
                  {tuning.strings.map((_, i) => (
                    <line key={i} x1={margin.left} y1={getStringY(i)} x2={margin.left + innerWidth} y2={getStringY(i)} stroke="#64748b" strokeWidth={1 + i * 0.5} />
                  ))}

                  {/* Fret Numbers */}
                  {Array.from({ length: numFrets + 1 }).map((_, f) => (
                    <text key={f} x={getFretX(f) - (f === 0 ? 0 : fretSpacing/2)} y={margin.top + innerHeight + 20} textAnchor="middle" fontSize="10" className="fill-slate-500 font-bold">{f === 0 ? '' : f}</text>
                  ))}

                  {/* Note Markers - Scale Pattern (Dimmed) */}
                  {showScale && currentShape.scalePattern.map((pos, idx) => {
                    // Don't draw if it's also a chord tone (handled below)
                    const isChordTone = currentShape.chordVoicing.strings[pos.string] === pos.fret;
                    if (isChordTone) return null;

                    const x = getFretX(pos.fret) - (pos.fret === 0 ? 0 : fretSpacing/2);
                    const y = getStringY(pos.string);
                    
                    return (
                      <g key={`scale-${idx}`}>
                        <circle cx={x} cy={y} r="8" fill="#475569" fillOpacity="0.6" />
                        <text x={x} y={y} dy="0.35em" textAnchor="middle" fontSize="8" fill="#cbd5e1" fontWeight="bold">
                          {showIntervals ? (INTERVAL_LABELS[pos.interval!] || '?') : pos.note}
                        </text>
                      </g>
                    );
                  })}

                  {/* Note Markers - Chord Voicing */}
                  {currentShape.chordVoicing.strings.map((fret, stringIdx) => {
                    if (fret === null) return null;
                    const x = getFretX(fret) - (fret === 0 ? 0 : fretSpacing/2);
                    const y = getStringY(stringIdx);
                    
                    const note = getNoteAtFret(stringIdx, fret, tuning);
                    const interval = intervalBetween(root as any, note);
                    const color = INTERVAL_COLORS[interval] || '#4f46e5';

                    return (
                      <g key={`chord-${stringIdx}`}>
                        <circle cx={x} cy={y} r="12" fill={color} stroke="#fff" strokeWidth="2" />
                        <text x={x} y={y} dy="0.35em" textAnchor="middle" fontSize={showIntervals ? "10" : "9"} fill="#fff" fontWeight="bold">
                          {showIntervals ? (INTERVAL_LABELS[interval] || '?') : note}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-500" />
                Understanding the {activeShape} Shape
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 leading-relaxed">
                The "{activeShape} Shape" is one of five overlapping patterns used to play any chord or scale 
                across the entire neck. In this position, the root note {root} is located on 
                the {currentShape.chordVoicing.strings.map((f, i) => f !== null && intervalBetween(root as any, getNoteAtFret(i, f, tuning)) === 0 ? i+1 : null).filter(Boolean).join(' and ')} strings.
                Mastering these shapes allows you to stay in one area of the fretboard while accessing 
                all necessary notes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CAGEDExplorer;
