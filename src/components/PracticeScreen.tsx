import React, { useRef } from 'react';
import * as Tone from 'tone';
import { Play, RotateCcw, Check, SkipForward, Eye, EyeOff, LayoutPanelLeft, Trophy, Clock, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Chord } from '../types';
import ChordVisualizer from './visualizers/ChordVisualizer';
import { INTERVAL_COLORS, getInterval } from '../constants';
import { cn } from '@/lib/utils';

interface PracticeScreenProps {
  score: number;
  totalChords: number;
  showNotes: boolean;
  setShowNotes: (show: boolean) => void;
  showDiagram: boolean;
  setShowDiagram: (show: boolean) => void;
  resetGame: () => void;
  currentChord: Chord | null;
  isTimed: boolean;
  timeRemaining: number;
  timePerChord: number;
  isPlaying: boolean;
  isInstrumentLoading: boolean;
  playChord: () => void;
  markCorrect: () => void;
  nextChord: () => void;
  instrument: string;
  isLeftHanded: boolean;
}

const PracticeScreen: React.FC<PracticeScreenProps> = ({
  score,
  totalChords,
  showNotes,
  setShowNotes,
  showDiagram,
  setShowDiagram,
  resetGame,
  currentChord,
  isTimed,
  timeRemaining,
  timePerChord,
  isPlaying,
  isInstrumentLoading,
  playChord,
  markCorrect,
  nextChord,
  instrument,
  isLeftHanded,
}) => {
  const [metronomeEnabled, setMetronomeEnabled] = React.useState(false);
  const [metronomeVolume, setMetronomeVolume] = React.useState(-12);
  const metronomeRef = useRef<Tone.MembraneSynth | null>(null);
  const loopRef = useRef<Tone.Loop | null>(null);

  React.useEffect(() => {
    metronomeRef.current = new Tone.MembraneSynth({
      envelope: { attack: 0.001, decay: 0.1, release: 0.1 },
      volume: metronomeVolume
    }).toDestination();

    return () => {
      metronomeRef.current?.dispose();
    };
  }, []);

  React.useEffect(() => {
    if (metronomeRef.current) {
      metronomeRef.current.volume.value = metronomeVolume;
    }
  }, [metronomeVolume]);

  React.useEffect(() => {
    if (metronomeEnabled && isTimed && timeRemaining > 0) {
      if (!loopRef.current) {
        loopRef.current = new Tone.Loop((time) => {
          metronomeRef.current?.triggerAttackRelease("C2", "32n", time, 0.5);
        }, "4n").start(0);
      }
      if (Tone.Transport.state !== 'started') {
        Tone.Transport.start();
      }
    } else {
      loopRef.current?.stop();
      loopRef.current?.dispose();
      loopRef.current = null;
    }

    return () => {
      loopRef.current?.stop();
      loopRef.current?.dispose();
      loopRef.current = null;
    };
  }, [metronomeEnabled, isTimed, timeRemaining]);

  const [isListening, setIsListening] = React.useState(false);
  const [micActive, setMicActive] = React.useState(false);
  const [detectedNote, setDetectedNote] = React.useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const toggleListening = async () => {
    if (micActive) {
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      setMicActive(false);
      setIsListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyzer = audioContextRef.current.createAnalyser();
      analyzer.fftSize = 2048;
      source.connect(analyzer);
      analyzerRef.current = analyzer;
      
      setMicActive(true);
      setIsListening(true);
      
      // Simple pitch detection loop
      const detect = () => {
        if (!micActive && !isListening) return;
        
        const buffer = new Float32Array(analyzer.fftSize);
        analyzer.getFloatTimeDomainData(buffer);
        
        // Very basic autocorrelation-based pitch detection (placeholder for Essentia.js)
        // In a real app, we'd use Essentia's PitchYin or similar
        
        requestAnimationFrame(detect);
      };
      
      detect();
    } catch (err) {
      console.error('Failed to get microphone', err);
      alert('Microphone access is required for interactive mode.');
    }
  };

  const progressPercentage = (timeRemaining / timePerChord) * 100;

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            Practice Session
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Keep going! You're building great muscle memory.</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase font-bold text-slate-400">Current Score</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{score} <span className="text-slate-400 text-sm font-normal">/ {totalChords}</span></div>
          </div>
          <Button 
            variant="outline" 
            onClick={resetGame}
            className="h-12 px-6 rounded-xl border-slate-200 dark:border-slate-800"
          >
            <RotateCcw className="mr-2 w-4 h-4" />
            End Session
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-none shadow-2xl shadow-slate-200 dark:shadow-none bg-white dark:bg-slate-900">
            {isTimed && (
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000 ease-linear",
                    progressPercentage > 50 ? "bg-emerald-500" : progressPercentage > 20 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            )}
            <CardContent className="pt-12 pb-12 text-center">
              <div className="space-y-2 mb-8">
                <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold py-0 text-slate-400 border-slate-200">
                  Play this chord
                </Badge>
                <h2 className="text-7xl md:text-9xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {currentChord?.name}
                </h2>
              </div>

              <div className="flex justify-center mb-12 min-h-[250px] items-center">
                {showDiagram ? (
                  <div className="animate-in fade-in zoom-in duration-500">
                    <ChordVisualizer chord={currentChord} instrument={instrument} isLeftHanded={isLeftHanded} />
                  </div>
                ) : (
                  <div className="w-64 h-64 rounded-3xl bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center space-y-4">
                    <Eye className="w-12 h-12 text-slate-300" />
                    <p className="text-sm text-slate-400 font-medium">Diagram is hidden. Try to play from memory!</p>
                    <Button variant="secondary" size="sm" onClick={() => setShowDiagram(true)}>Show Diagram</Button>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                <Button
                  onClick={markCorrect}
                  size="lg"
                  className="flex-1 h-16 rounded-2xl text-xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none"
                >
                  <Check className="mr-2 w-6 h-6" />
                  I GOT IT!
                </Button>
                <Button
                  onClick={nextChord}
                  size="lg"
                  variant="outline"
                  className="flex-1 h-16 rounded-2xl text-xl font-black border-2"
                >
                  <SkipForward className="mr-2 w-6 h-6" />
                  SKIP
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Hints & Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-between h-12"
                  onClick={() => setShowDiagram(!showDiagram)}
                >
                  <span className="flex items-center gap-2">
                    <LayoutPanelLeft className="w-4 h-4 text-indigo-500" />
                    Visual Diagram
                  </span>
                  <Badge variant="secondary">{showDiagram ? 'ON' : 'OFF'}</Badge>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between h-12"
                  onClick={() => setShowNotes(!showNotes)}
                >
                  <span className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-indigo-500" />
                    Note Labels
                  </span>
                  <Badge variant="secondary">{showNotes ? 'ON' : 'OFF'}</Badge>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between h-12"
                  onClick={playChord}
                  disabled={isPlaying || isInstrumentLoading}
                >
                  <span className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-indigo-500" />
                    Listen to Sound
                  </span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Timer className="w-4 h-4 text-indigo-500" />
                  Interactive Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="interactive-active" className="text-xs cursor-pointer font-bold">Listen for Guitar</Label>
                  <Switch 
                    id="interactive-active" 
                    checked={isListening} 
                    onCheckedChange={toggleListening} 
                  />
                </div>
                {isListening && (
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase">Input Level</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                        ))}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-relaxed italic">
                      Experimental: App will try to detect when you play the chord.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time Remaining
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pt-2">
                {isTimed ? (
                  <div className="text-center space-y-1">
                    <div className={cn(
                      "text-6xl font-black tracking-tighter",
                      timeRemaining <= 3 ? "text-red-500 animate-pulse" : "text-slate-900 dark:text-white"
                    )}>
                      {timeRemaining}<span className="text-2xl ml-1 text-slate-400">s</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Until next chord</p>
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm font-medium italic py-4">Timer disabled</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          {showNotes && currentChord && (
            <Card className="animate-in fade-in slide-in-from-right-4 duration-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Notes in {currentChord.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {currentChord.noteNames.map((note, i) => {
                    const interval = getInterval(note, currentChord.rootNote);
                    const color = interval !== -1 ? INTERVAL_COLORS[interval] : undefined;
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-1"
                      >
                        <div
                          style={color ? { backgroundColor: color } : {}}
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm transition-transform hover:scale-110 cursor-default",
                            !color && "bg-slate-200 dark:bg-slate-800 text-slate-600"
                          )}
                        >
                          {note}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Timer className="w-4 h-4 text-indigo-500" />
                Metronome
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="metronome-active" className="text-xs cursor-pointer">Enable Click</Label>
                <Switch 
                  id="metronome-active" 
                  checked={metronomeEnabled} 
                  onCheckedChange={setMetronomeEnabled} 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-[10px] text-slate-400 font-bold uppercase">Volume</Label>
                </div>
                <Slider 
                  value={[metronomeVolume]} 
                  onValueChange={(v) => setMetronomeVolume(v[0])} 
                  min={-40} 
                  max={0} 
                  step={1} 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white border-none overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
             <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-sm flex items-center gap-2">
                <Timer className="w-4 h-4 opacity-80" />
                Practice Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3 opacity-90 leading-relaxed relative z-10">
              <p>Try to visualize the shape in your head before looking at the diagram. This builds stronger neural connections!</p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span>Speed Rank</span>
                <Badge className="bg-white/20 text-white border-none">BETA</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Quick Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3 text-slate-500">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 font-bold text-indigo-600">1</div>
                <p>Play the chord on your guitar.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 font-bold text-indigo-600">2</div>
                <p>Compare with the diagram/sound.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 font-bold text-indigo-600">3</div>
                <p>Click "I GOT IT!" if correct.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PracticeScreen;
