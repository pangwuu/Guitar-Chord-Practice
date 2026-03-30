import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  RotateCcw, 
  Play, 
  Square, 
  Gauge, 
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Info,
  Timer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { cn } from '../../lib/utils';
import { useTheory } from '../../context/TheoryContext';
import { calculateTransitionAccuracy } from '../../lib/theoryEngine';
import * as Tone from 'tone';

// Simple Mini Diagram for side-by-side
const MiniChordDiagram: React.FC<{ 
  chordName: string; 
  isActive: boolean;
  isLeftHanded?: boolean;
}> = ({ chordName, isActive, isLeftHanded }) => {
  // Use simple common shapes for the trainer
  const commonShapes: Record<string, any> = {
    'C': { frets: ['x', 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null] },
    'G': { frets: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4] },
    'Am': { frets: ['x', 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null] },
    'E': { frets: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null] },
    'A': { frets: ['x', 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null] },
    'D': { frets: ['x', 'x', 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2] },
    'Em': { frets: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null] },
    'F': { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: 1 },
  };

  const shape = commonShapes[chordName] || { frets: [0,0,0,0,0,0], fingers: [] };
  
  const width = 120;
  const height = 150;
  const margin = { top: 20, right: 10, bottom: 10, left: 15 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const fretSpacing = innerHeight / 5;
  const stringSpacing = innerWidth / 5;

  const getX = (s: number) => {
    const idx = isLeftHanded ? (5 - s) : s;
    return margin.left + idx * stringSpacing;
  };

  return (
    <Card className={cn(
      "transition-all duration-200 border-2",
      isActive ? "border-indigo-500 bg-indigo-50/30 ring-4 ring-indigo-500/20" : "border-slate-200"
    )}>
      <CardHeader className="p-3 text-center">
        <CardTitle className="text-lg font-black">{chordName}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex justify-center">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Frets */}
          {Array.from({ length: 6 }).map((_, f) => (
            <line key={f} x1={margin.left} y1={margin.top + f * fretSpacing} x2={margin.left + innerWidth} y2={margin.top + f * fretSpacing} stroke="#cbd5e1" strokeWidth={f === 0 ? 4 : 1} />
          ))}
          {/* Strings */}
          {Array.from({ length: 6 }).map((_, s) => (
            <line key={s} x1={getX(s)} y1={margin.top} x2={getX(s)} y2={margin.top + innerHeight} stroke="#94a3b8" strokeWidth={1} />
          ))}
          {/* Dots */}
          {shape.frets.map((f: any, s: number) => {
            if (f === 'x') return <text key={s} x={getX(s)} y={margin.top - 5} textAnchor="middle" fontSize="10" fontWeight="bold" className="fill-red-500">X</text>;
            if (f === 0) return <circle key={s} cx={getX(s)} y={margin.top - 6} r="3" fill="none" stroke="#64748b" strokeWidth="1" />;
            if (typeof f === 'number' && f > 0) {
              return (
                <g key={s}>
                  <circle cx={getX(s)} cy={margin.top + f * fretSpacing - fretSpacing/2} r="6" className={isActive ? "fill-indigo-600" : "fill-slate-400"} />
                  {shape.fingers[s] && (
                    <text x={getX(s)} y={margin.top + f * fretSpacing - fretSpacing/2} dy="0.35em" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">{shape.fingers[s]}</text>
                  )}
                </g>
              );
            }
            return null;
          })}
        </svg>
      </CardContent>
    </Card>
  );
};

const TransitionTrainer: React.FC = () => {
  const { isLeftHanded } = useTheory();
  const [chordA, setChordA] = useState('C');
  const [chordB, setChordB] = useState('G');
  const [bpm, setBpm] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChord, setActiveChord] = useState<'A' | 'B'>('A');
  const [beatsPerSwitch, setBeatsPerSwitch] = useState(4);
  const [autoSpeedUp, setAutoSpeedUp] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [totalSwitches, setTotalSwitches] = useState(0);
  const [lastSwitchTime, setLastSwitchTime] = useState<number | null>(null);
  const [lastAccuracy, setLastAccuracy] = useState<number | null>(null);

  const synthRef = useRef<Tone.MembraneSynth | null>(null);
  const loopRef = useRef<Tone.Loop | null>(null);

  useEffect(() => {
    synthRef.current = new Tone.MembraneSynth({
      envelope: { attack: 0.001, decay: 0.1, release: 0.1 }
    }).toDestination();
    return () => {
      synthRef.current?.dispose();
    };
  }, []);

  const handleTogglePlay = useCallback(async () => {
    if (isPlaying) {
      Tone.Transport.stop();
      if (loopRef.current) {
        loopRef.current.stop();
        loopRef.current.dispose();
        loopRef.current = null;
      }
      setIsPlaying(false);
      setCurrentBeat(0);
      setLastSwitchTime(null);
      setLastAccuracy(null);
    } else {
      await Tone.start();
      Tone.Transport.bpm.value = bpm;
      
      let beatCount = 0;
      loopRef.current = new Tone.Loop((time) => {
        // Metronome Click
        const isDownbeat = beatCount % beatsPerSwitch === 0;
        synthRef.current?.triggerAttackRelease(isDownbeat ? "C3" : "G2", "32n", time, isDownbeat ? 1 : 0.5);
        
        Tone.Draw.schedule(() => {
          setCurrentBeat(beatCount % beatsPerSwitch);
          if (isDownbeat) {
            setActiveChord(prev => prev === 'A' ? 'B' : 'A');
            setTotalSwitches(s => s + 1);
            setLastSwitchTime(performance.now());
            
            // Auto speed up every 4 switches
            if (autoSpeedUp && beatCount > 0 && (beatCount / beatsPerSwitch) % 4 === 0) {
              setBpm(prev => Math.min(prev + 5, 200));
            }
          }
          beatCount++;
        }, time);
      }, "4n").start(0);

      Tone.Transport.start();
      setIsPlaying(true);
      setTotalSwitches(0);
    }
  }, [isPlaying, bpm, beatsPerSwitch, autoSpeedUp]);

  const logTransition = () => {
    if (!isPlaying || !lastSwitchTime) return;
    const now = performance.now();
    const timeTaken = now - lastSwitchTime;
    const accuracy = calculateTransitionAccuracy(timeTaken, bpm);
    setLastAccuracy(accuracy);
  };

  // Sync BPM changes while playing
  useEffect(() => {
    if (isPlaying) {
      Tone.Transport.bpm.rampTo(bpm, 0.1);
    }
  }, [bpm, isPlaying]);

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <RotateCcw className="w-8 h-8 text-indigo-600" />
            Transition Trainer
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Build muscle memory by switching between two chords.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Switches</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{totalSwitches}</div>
          </div>
          {lastAccuracy !== null && (
            <div className="text-right hidden sm:block border-l pl-4">
              <div className="text-[10px] uppercase font-bold text-slate-400">Last Accuracy</div>
              <div className={cn(
                "text-xl font-black",
                lastAccuracy > 0.9 ? "text-emerald-500" : lastAccuracy > 0.7 ? "text-amber-500" : "text-red-500"
              )}>
                {Math.round(lastAccuracy * 100)}%
              </div>
            </div>
          )}
          <Button 
            size="lg" 
            onClick={handleTogglePlay}
            className={cn(
              "h-14 px-8 rounded-2xl font-black text-lg shadow-xl transition-all",
              isPlaying 
                ? "bg-red-500 hover:bg-red-600 shadow-red-200 dark:shadow-none" 
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none"
            )}
          >
            {isPlaying ? (
              <><Square className="mr-2 w-6 h-6 fill-white" /> STOP</>
            ) : (
              <><Play className="mr-2 w-6 h-6 fill-white" /> START</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chord Diagrams */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
              {['C', 'G', 'Am', 'E', 'A', 'D', 'Em', 'F'].map(c => (
                <Button 
                  key={c} 
                  variant={chordA === c ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setChordA(c)}
                  className="h-7 text-[10px] px-2 font-bold"
                >
                  {c}
                </Button>
              ))}
            </div>
            <MiniChordDiagram chordName={chordA} isActive={activeChord === 'A'} isLeftHanded={isLeftHanded} />
          </div>

          <div className="space-y-4">
            <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
              {['C', 'G', 'Am', 'E', 'A', 'D', 'Em', 'F'].map(c => (
                <Button 
                  key={c} 
                  variant={chordB === c ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setChordB(c)}
                  className="h-7 text-[10px] px-2 font-bold"
                >
                  {c}
                </Button>
              ))}
            </div>
            <MiniChordDiagram chordName={chordB} isActive={activeChord === 'B'} isLeftHanded={isLeftHanded} />
          </div>

          {/* Beat Indicator */}
          <div className="col-span-2 flex flex-col items-center gap-6 mt-4">
            <div className="flex justify-center gap-4">
              {Array.from({ length: beatsPerSwitch }).map((_, i) => (
                <div 
                  key={i}
                  className={cn(
                    "w-4 h-4 rounded-full transition-all duration-100",
                    currentBeat === i 
                      ? (activeChord === 'A' ? "bg-indigo-500 scale-125 shadow-lg shadow-indigo-200" : "bg-indigo-500 scale-125 shadow-lg shadow-indigo-200")
                      : "bg-slate-200 dark:bg-slate-800"
                  )}
                />
              ))}
            </div>

            <Button
              size="lg"
              disabled={!isPlaying}
              onClick={logTransition}
              className={cn(
                "w-full max-w-sm h-16 rounded-2xl font-black text-xl shadow-lg transition-all",
                isPlaying ? "bg-slate-900 hover:bg-slate-800 scale-105 active:scale-95" : "bg-slate-200 text-slate-400"
              )}
            >
              <Timer className="mr-2 w-6 h-6" />
              TAP TO LOG SWITCH
            </Button>
            
            {lastAccuracy !== null && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                 <Badge variant={lastAccuracy > 0.8 ? "default" : "secondary"} className="px-4 py-1 text-sm font-black">
                   {lastAccuracy > 0.9 ? "PERFECT TIMING!" : lastAccuracy > 0.7 ? "GREAT JOB!" : "KEEP PRACTICING"}
                 </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                Trainer Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs font-bold">Tempo</Label>
                  <span className="text-sm font-black text-indigo-600">{bpm} BPM</span>
                </div>
                <Slider 
                  value={[bpm]} 
                  onValueChange={(v) => setBpm(v[0])} 
                  min={30} 
                  max={200} 
                  step={1} 
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs font-bold">Beats per Chord</Label>
                  <span className="text-sm font-black text-indigo-600">{beatsPerSwitch}</span>
                </div>
                <div className="flex gap-2">
                  {[2, 4, 8].map(b => (
                    <Button
                      key={b}
                      variant={beatsPerSwitch === b ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBeatsPerSwitch(b)}
                      className="flex-1 font-bold"
                    >
                      {b}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-indigo-500" />
                    Auto Speed-Up
                  </Label>
                  <p className="text-[10px] text-slate-500">+5 BPM every 4 switches</p>
                </div>
                <Switch checked={autoSpeedUp} onCheckedChange={setAutoSpeedUp} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-indigo-600 text-white border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="w-4 h-4 opacity-80" />
                How to Practice
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 opacity-90 leading-relaxed">
              <p>1. Get comfortable with each chord individually first.</p>
              <p>2. Start at a slow tempo (e.g. 60 BPM).</p>
              <p>3. Switch exactly on the 1st beat of each cycle.</p>
              <p>4. Focus on clean notes before increasing speed.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TransitionTrainer;
