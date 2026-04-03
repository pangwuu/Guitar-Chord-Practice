import { TheoryProvider, useTheory } from './context/TheoryContext';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Music, Guitar, Zap, Grid3X3 } from 'lucide-react';
import { generateChordSet } from './chordGenerator';
import * as Tone from 'tone';
import SetupScreen from './components/SetupScreen';
import PracticeScreen from './components/PracticeScreen';
import TheoryDashboard from './components/theory/TheoryDashboard';
import Sidebar, { ViewId } from './components/layout/Sidebar';
import CAGEDExplorer from './components/views/CAGEDExplorer';
import TransitionTrainer from './components/views/TransitionTrainer';
import OnboardingTutorial from './components/layout/OnboardingTutorial';
import { Instrument, GameState, DifficultyOption, Chord, Difficulty } from './types';

const INSTRUMENTS: Record<string, Instrument> = {
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

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { value: 'beginner', label: 'Beginner', desc: 'Standard Open Chords' },
  { value: 'novice', label: 'Novice', desc: 'All Triads & Dom 7ths' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Inversions & 7th chords' },
  { value: 'advanced', label: 'Advanced', desc: 'Diminished, 9ths, alterations' },
  { value: 'jazz', label: 'Jazz', desc: 'Complex extensions & voicings' },
  { value: 'custom', label: 'Custom', desc: 'Select your own chord types' },
];

const GuitarChordTrainer: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewId>('practice');
  const [showTutorial, setShowTutorial] = useState(false);
  const { 
    isLeftHanded, 
    setIsLeftHanded, 
    playbackOptions, 
    setPlaybackOptions,
    playbackState,
    instrument,
    setInstrument
  } = useTheory();

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('fretboard-pro-tutorial-seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleTutorialComplete = () => {
    localStorage.setItem('fretboard-pro-tutorial-seen', 'true');
    setShowTutorial(false);
  };

  const [gameState, setGameState] = useState<GameState>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [selectedCustomChords, setSelectedCustomChords] = useState<string[]>([]);
  const [includeInversions, setIncludeInversions] = useState(false);
  const [isTimed, setIsTimed] = useState(true);
  const [timePerChord, setTimePerChord] = useState(10);
  const [currentChord, setCurrentChord] = useState<Chord | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [score, setScore] = useState(0);
  const [totalChords, setTotalChords] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showDiagram, setShowDiagram] = useState(true);
  const [chordPool, setChordPool] = useState<Chord[]>([]);
  const [isInstrumentLoading, setIsInstrumentLoading] = useState(true);
  
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDifficultyChange = useCallback((val: Difficulty) => {
    setDifficulty(val);
    if (['intermediate', 'advanced', 'jazz'].includes(val)) {
      setIncludeInversions(true);
    } else {
      setIncludeInversions(false);
    }
  }, []);

  useEffect(() => {
    const unlockAudio = async () => {
      if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log("Audio context unlocked");
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

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
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }

      setIsPlaying(true);
      const now = Tone.now();
      const duration = 2.0;
      const notesToPlay = currentChord.notes.map(n => n.pitch);
      
      notesToPlay.forEach((note, index) => {
        samplerRef.current?.triggerAttackRelease(note, duration, now + index * 0.05);
      });
      
      setTimeout(() => {
        setIsPlaying(false);
      }, (duration + 0.05 * notesToPlay.length) * 1000);
    } catch (error) {
      console.error("Playback error:", error);
      setIsPlaying(false);
    }
  }, [currentChord, isPlaying]);

  const nextChordFromPool = useCallback((pool: Chord[] = chordPool) => {
    if (pool.length === 0) return;
    let randomChord = currentChord;
    while (pool.length > 1 && (randomChord === null || randomChord.name === currentChord?.name)) {
      randomChord = pool[Math.floor(Math.random() * pool.length)];
    }
    if (!randomChord) {
      randomChord = pool[0];
    }
    setCurrentChord(randomChord);
    if (isTimed) {
      setTimeRemaining(timePerChord);
    }
    setTotalChords(prev => prev + 1);
  }, [chordPool, timePerChord, currentChord, isTimed]);

  const nextChord = useCallback(() => {
    nextChordFromPool();
  }, [nextChordFromPool]);

  const startGame = useCallback(async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    const chords = generateChordSet(difficulty, selectedCustomChords, includeInversions);
    setChordPool(chords);
    setGameState('playing');
    setScore(0);
    setTotalChords(0);
    nextChordFromPool(chords);
  }, [difficulty, selectedCustomChords, includeInversions, nextChordFromPool]);

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
    setShowDiagram(true);
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && isTimed && activeView === 'practice') {
      if (timeRemaining > 0) {
        timerRef.current = setTimeout(() => {
          setTimeRemaining(prev => prev - 1);
        }, 1000);
      } else if (timeRemaining === 0) {
        const timeoutId = setTimeout(() => nextChord(), 1000);
        return () => clearTimeout(timeoutId);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeRemaining, gameState, nextChord, isTimed, activeView]);

  const renderView = () => {
    switch (activeView) {
      case 'practice':
        if (gameState === 'setup') {
          return (
            <SetupScreen 
              instruments={INSTRUMENTS}
              selectedInstrument={instrument}
              onInstrumentChange={(key) => {
                if (instrument !== key) {
                  setIsInstrumentLoading(true);
                  setInstrument(key);
                }
              }}
              isInstrumentLoading={isInstrumentLoading}
              difficulty={difficulty}
              onDifficultyChange={handleDifficultyChange}
              difficultyOptions={DIFFICULTY_OPTIONS}
              selectedCustomChords={selectedCustomChords}
              onCustomChordsChange={setSelectedCustomChords}
              includeInversions={includeInversions}
              onIncludeInversionsChange={setIncludeInversions}
              isTimed={isTimed}
              onTimedChange={setIsTimed}
              timePerChord={timePerChord}
              onTimeChange={setTimePerChord}
              onStartGame={startGame}
              isLeftHanded={isLeftHanded}
              onLeftHandedChange={setIsLeftHanded}
            />
          );
        }
        return (
          <PracticeScreen 
            score={score}
            totalChords={totalChords}
            showNotes={showNotes}
            setShowNotes={setShowNotes}
            showDiagram={showDiagram}
            setShowDiagram={setShowDiagram}
            resetGame={resetGame}
            currentChord={currentChord}
            isTimed={isTimed}
            timeRemaining={timeRemaining}
            timePerChord={timePerChord}
            isPlaying={isPlaying}
            isInstrumentLoading={isInstrumentLoading}
            playChord={playChord}
            markCorrect={markCorrect}
            nextChord={nextChord}
            instrument={instrument}
            isLeftHanded={isLeftHanded}
          />
        );
      case 'workbench':
        return <TheoryDashboard />;
      case 'transition':
        return <TransitionTrainer />;
      case 'caged':
        return <CAGEDExplorer />;
      default:
        return <TheoryDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {showTutorial && <OnboardingTutorial onComplete={handleTutorialComplete} />}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-y-auto h-screen custom-scrollbar pt-12 md:pt-0">
        {renderView()}
      </main>
    </div>
  );
};

function App() {
  return (
    <TheoryProvider>
      <GuitarChordTrainer />
    </TheoryProvider>
  );
}

export default App;
