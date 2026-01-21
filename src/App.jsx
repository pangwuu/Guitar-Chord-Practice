import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Settings, ChevronRight, RotateCcw, Check, SkipForward, Eye, EyeOff, Music, Guitar, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { generateChordSet } from './chordGenerator';
import * as Tone from 'tone';

const INSTRUMENTS = {
  acoustic: {
    label: 'Acoustic Guitar',
    icon: Guitar,
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3/',
  },
  electric_clean: {
    label: 'Electric Guitar',
    icon: Zap,
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/electric_guitar_clean-mp3/',
  },
  piano: {
    label: 'Piano',
    icon: Music,
    baseUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-mp3/',
  },
};

const GuitarChordTrainer = () => {
  const [gameState, setGameState] = useState('setup');
  const [difficulty, setDifficulty] = useState('beginner');
  const [timePerChord, setTimePerChord] = useState(10);
  const [currentChord, setCurrentChord] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [score, setScore] = useState(0);
  const [totalChords, setTotalChords] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [chordPool, setChordPool] = useState([]);
  const [instrument, setInstrument] = useState('acoustic');
  const [isInstrumentLoading, setIsInstrumentLoading] = useState(true);
  
  const samplerRef = useRef(null);
  const timerRef = useRef(null);

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner', desc: 'Standard Open Chords' },
    { value: 'novice', label: 'Novice', desc: 'All Triads & Dom 7ths' },
    { value: 'intermediate', label: 'Intermediate', desc: 'Inversions & 7th chords' },
    { value: 'advanced', label: 'Advanced', desc: 'Diminished, 9ths, alterations' },
    { value: 'jazz', label: 'Jazz', desc: 'Complex extensions & voicings' },
  ];

  useEffect(() => {
    // Dispose old sampler if exists
    if (samplerRef.current) {
      samplerRef.current.dispose();
    }

    const newSampler = new Tone.Sampler({
      urls: {
        'A2': 'A2.mp3', 
        'C3': 'C3.mp3', 
        'D#3': 'Eb3.mp3', 
        'F#3': 'Gb3.mp3', 
        'A3': 'A3.mp3', 
        'C4': 'C4.mp3', 
        'D#4': 'Eb4.mp3', 
        'F#4': 'Gb4.mp3', 
        'A4': 'A4.mp3', 
        'C5': 'C5.mp3', 
        'D#5': 'Eb5.mp3', 
        'F#5': 'Gb5.mp3', 
      },
      release: 1,
      baseUrl: INSTRUMENTS[instrument].baseUrl,
      onload: () => {
        setIsInstrumentLoading(false);
      },
      onerror: (err) => {
        console.error("Failed to load instrument samples", err);
        setIsInstrumentLoading(false);
      }
    }).toDestination();

    samplerRef.current = newSampler;
    
    return () => {
      newSampler.dispose();
    };
  }, [instrument]);

  const playChord = useCallback(async () => {
    if (!currentChord || isPlaying || !samplerRef.current) return;
    
    try {
      // Ensure Audio Context is started (browser policy)
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }

      setIsPlaying(true);
      
      const now = Tone.now();
      const duration = 2.0;
      
      const notesToPlay = currentChord.notes.map(n => n.pitch);
      
      // Strum effect: slight delay between notes
      notesToPlay.forEach((note, index) => {
        samplerRef.current.triggerAttackRelease(note, duration, now + index * 0.05);
      });
      
      setTimeout(() => {
        setIsPlaying(false);
      }, (duration + 0.05 * notesToPlay.length) * 1000);
    } catch (error) {
      console.error("Playback error:", error);
      setIsPlaying(false);
    }
  }, [currentChord, isPlaying]);

  const nextChordFromPool = useCallback((pool = chordPool) => {
    if (pool.length === 0) return;
    const randomChord = pool[Math.floor(Math.random() * pool.length)];
    setCurrentChord(randomChord);
    setTimeRemaining(timePerChord);
    setTotalChords(prev => prev + 1);
  }, [chordPool, timePerChord]);

  const nextChord = useCallback(() => {
    nextChordFromPool();
  }, [nextChordFromPool]);

  const startGame = useCallback(async () => {
    // Ensure audio context is started on user interaction
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    
    const chords = generateChordSet(difficulty);
    setChordPool(chords);
    setGameState('playing');
    setScore(0);
    setTotalChords(0);
    nextChordFromPool(chords);
  }, [difficulty, nextChordFromPool]);

  const markCorrect = useCallback(() => {
    setScore(prev => prev + 1);
    nextChord();
  }, [nextChord]);

  const resetGame = useCallback(() => {
    setGameState('setup');
    setCurrentChord(null);
    setScore(0);
    setTotalChords(0);
    setShowNotes(false);
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (gameState === 'playing' && timeRemaining === 0) {
      const timeoutId = setTimeout(() => nextChord(), 1000);
      return () => clearTimeout(timeoutId);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeRemaining, gameState, nextChord]);

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">Guitar Chord Trainer</h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">Practice identifying and playing chords</p>
          </div>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Practice Settings
              </CardTitle>
              <CardDescription>Customize your practice session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              <div className="space-y-4">
                <Label>Instrument</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(INSTRUMENTS).map(([key, { label, icon: Icon }]) => (
                    <Button
                      key={key}
                      variant={instrument === key ? "default" : "outline"}
                      onClick={() => {
                        if (instrument !== key) {
                          setIsInstrumentLoading(true);
                          setInstrument(key);
                        }
                      }}
                      className="h-auto py-3 flex flex-col items-center justify-center text-center"
                    >
                      <Icon className="w-5 h-5 mb-2" />
                      <span className="text-sm">{label}</span>
                    </Button>
                  ))}
                </div>
                {isInstrumentLoading && (
                  <p className="text-sm text-amber-600 animate-pulse">
                    Loading instrument samples...
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <Label>Difficulty Level</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {difficultyOptions.map(({ value, label, desc }, index) => (
                    <Button
                      key={value}
                      variant={difficulty === value ? "default" : "outline"}
                      className={`h-auto py-4 flex flex-col items-start w-full ${
                        index === difficultyOptions.length - 1 ? "md:col-span-2 md:w-1/2 md:mx-auto" : ""
                      }`}
                      onClick={() => setDifficulty(value)}
                    >
                      <div className="font-bold text-base">{label}</div>
                      <div className="text-xs opacity-80 font-normal">{desc}</div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Time per Chord: {timePerChord} seconds</Label>
                <Slider
                  value={[timePerChord]}
                  onValueChange={(value) => setTimePerChord(value[0])}
                  min={1}
                  max={45}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-slate-500">
                  <span>1s</span>
                  <span>45s</span>
                </div>
              </div>

              <Button
                onClick={startGame}
                disabled={isInstrumentLoading}
                size="lg"
                className="w-full text-lg"
              >
                {isInstrumentLoading ? 'Loading Sounds...' : (
                  <>
                    Start Practice
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progressPercentage = (timeRemaining / timePerChord) * 100;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Score</div>
            <div className="text-4xl font-bold text-slate-900 dark:text-white">{score} / {totalChords}</div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={() => setShowNotes(!showNotes)}
              className="flex-1 md:flex-none"
            >
              {showNotes ? <EyeOff className="mr-2 w-4 h-4" /> : <Eye className="mr-2 w-4 h-4" />}
              {showNotes ? 'Hide Notes' : 'Show Notes'}
            </Button>
            <Button 
              variant="outline" 
              onClick={resetGame}
              className="flex-1 md:flex-none"
            >
              <RotateCcw className="mr-2 w-4 h-4" />
              New Session
            </Button>
          </div>
        </div>

        <Card className="mb-6 w-full">
          <CardContent className="pt-8 md:pt-12 pb-8 md:pb-12">
            <div className="text-center mb-8">
              <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg mb-4">Play this chord:</p>
              <h2 className="text-5xl md:text-8xl font-bold text-slate-900 dark:text-white mb-6 md:mb-8">
                {currentChord?.name}
              </h2>
              
              {showNotes && currentChord && (
                <div className="mb-6 md:mb-8">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Notes:</div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {currentChord.noteNames.map((note, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-mono text-lg"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mb-6 md:mb-8">
                <div className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
                  {timeRemaining}
                </div>
                <Progress value={progressPercentage} className="h-3 max-w-md mx-auto" />
              </div>
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              <Button
                onClick={playChord}
                disabled={isPlaying || isInstrumentLoading}
                size="lg"
                className="w-full text-lg"
                variant="default"
              >
                <Play className="mr-2 w-5 h-5" />
                {isPlaying ? 'Playing...' : (isInstrumentLoading ? 'Loading...' : 'Play Chord Sound')}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={markCorrect}
                  size="lg"
                  variant="outline"
                  className="text-base"
                >
                  <Check className="mr-2 w-4 h-4" />
                  I Got It!
                </Button>
                <Button
                  onClick={nextChord}
                  size="lg"
                  // variant="ghost"
                  className="text-base"
                >
                  <SkipForward className="mr-2 w-4 h-4" />
                  Skip
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>How to Practice</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 list-decimal list-inside text-slate-600 dark:text-slate-400">
              <li>A chord name appears with a countdown timer</li>
              <li>Try to play it on your guitar from memory</li>
              <li>Click "Show Notes" if you need a hint about which notes to play</li>
              <li>Click "Play Chord Sound" to hear what it should sound like</li>
              <li>Compare it with what you played - were you right?</li>
              <li>Click "I Got It!" if you played it correctly, or "Skip" to move on</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuitarChordTrainer;
