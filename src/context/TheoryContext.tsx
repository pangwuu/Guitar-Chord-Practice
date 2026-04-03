import React, { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react';

import type {
  NoteName,
  ScaleType,
  ChordQuality,
  Tuning,
  CAGEDShapeName,
  FretPosition,
  PlaybackOptions,
  PlaybackState,
} from '../types/theory';

import { TUNING_PRESETS } from '../types/theory';

import {
  getScaleNotes,
  getScale,
  getScalePositions,
  getChordNotes,
  getChordPositions,
} from '../lib/theoryEngine';

import { playbackEngine } from '../lib/playbackEngine';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface TheoryState {
  selectedScale: { root: NoteName; type: ScaleType } | null;
  selectedChord: { root: NoteName; quality: ChordQuality } | null;
  tuning: Tuning;
  fretRange: { min: number; max: number };
  isLeftHanded: boolean;
  activeCAGEDShape: CAGEDShapeName | null;
  playbackOptions: PlaybackOptions;
  playbackState: PlaybackState;
}

// ---------------------------------------------------------------------------
// Derived values
// ---------------------------------------------------------------------------

interface TheoryDerived {
  scaleNotes: NoteName[];
  scalePositions: FretPosition[];
  chordNotes: NoteName[];
  chordPositions: FretPosition[];
}

// ---------------------------------------------------------------------------
// Actions (setters)
// ---------------------------------------------------------------------------

interface TheoryActions {
  setSelectedScale: React.Dispatch<React.SetStateAction<{ root: NoteName; type: ScaleType } | null>>;
  setSelectedChord: React.Dispatch<React.SetStateAction<{ root: NoteName; quality: ChordQuality } | null>>;
  setTuning: React.Dispatch<React.SetStateAction<Tuning>>;
  setFretRange: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>;
  setIsLeftHanded: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveCAGEDShape: React.Dispatch<React.SetStateAction<CAGEDShapeName | null>>;
  setPlaybackOptions: React.Dispatch<React.SetStateAction<PlaybackOptions>>;
  instrument: string;
  setInstrument: (inst: string) => void;
  playCurrentScale: () => void;
  playCurrentChord: () => void;
  stopPlayback: () => void;
}

// ---------------------------------------------------------------------------
// Combined context value
// ---------------------------------------------------------------------------

type TheoryContextValue = TheoryState & TheoryDerived & TheoryActions;

const TheoryContext = createContext<TheoryContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function TheoryProvider({ children }: { children: ReactNode }) {
  // --- State ---
  const [selectedScale, setSelectedScale] = useState<{ root: NoteName; type: ScaleType } | null>(null);
  const [selectedChord, setSelectedChord] = useState<{ root: NoteName; quality: ChordQuality } | null>(null);
  const [tuning, setTuning] = useState<Tuning>(TUNING_PRESETS.standard);
  const [fretRange, setFretRange] = useState<{ min: number; max: number }>({ min: 0, max: 12 });
  const [isLeftHanded, setIsLeftHanded] = useState(false);
  const [activeCAGEDShape, setActiveCAGEDShape] = useState<CAGEDShapeName | null>(null);
  const [playbackOptions, setPlaybackOptions] = useState<PlaybackOptions>({
    bpm: 120,
    mode: 'arpeggio',
    instrument: 'acoustic'
  });
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    activeNoteIndex: null,
    progress: 0
  });

  const instrument = playbackOptions.instrument;
  const setInstrument = useCallback((inst: string) => {
    setPlaybackOptions(prev => ({ ...prev, instrument: inst as any }));
  }, []);

  // --- Derived / memoized computations ---

  const scaleNotes = useMemo<NoteName[]>(() => {
    if (!selectedScale) return [];
    return getScaleNotes(selectedScale.root, selectedScale.type);
  }, [selectedScale]);

  const scalePositions = useMemo<FretPosition[]>(() => {
    if (!selectedScale) return [];
    const scale = getScale(selectedScale.root, selectedScale.type);
    return getScalePositions(scale, tuning, [fretRange.min, fretRange.max]);
  }, [selectedScale, tuning, fretRange]);

  const chordNotesMemo = useMemo<NoteName[]>(() => {
    if (!selectedChord) return [];
    return getChordNotes(selectedChord.root, selectedChord.quality);
  }, [selectedChord]);

  const chordPositions = useMemo<FretPosition[]>(() => {
    if (!selectedChord) return [];
    const notes = getChordNotes(selectedChord.root, selectedChord.quality);
    return getChordPositions(notes, tuning, [fretRange.min, fretRange.max]);
  }, [selectedChord, tuning, fretRange]);

  // --- Playback Actions ---

  const stopPlayback = useCallback(() => {
    playbackEngine.stop();
    setPlaybackState({ isPlaying: false, activeNoteIndex: null, progress: 0 });
  }, []);

  const onNoteIndex = useCallback((index: number | null) => {
    setPlaybackState(prev => ({
      ...prev,
      activeNoteIndex: index,
      isPlaying: index !== null
    }));
  }, []);

  const playCurrentScale = useCallback(() => {
    if (!selectedScale) return;
    const notes = getScaleNotes(selectedScale.root, selectedScale.type);
    const notesWithOctave = notes.map(n => `${n}4`);
    playbackEngine.playNotes(notesWithOctave, { ...playbackOptions, mode: 'arpeggio' }, onNoteIndex);
  }, [selectedScale, playbackOptions, onNoteIndex]);

  const playCurrentChord = useCallback(() => {
    if (!selectedChord) return;
    const notes = getChordNotes(selectedChord.root, selectedChord.quality);
    const notesWithOctave = notes.map((n, i) => `${n}${3 + Math.floor(i/3)}`);
    playbackEngine.playNotes(notesWithOctave, playbackOptions, onNoteIndex);
  }, [selectedChord, playbackOptions, onNoteIndex]);

  // --- Context value ---

  const value = useMemo<TheoryContextValue>(
    () => ({
      // State
      selectedScale,
      selectedChord,
      tuning,
      fretRange,
      isLeftHanded,
      activeCAGEDShape,
      playbackOptions,
      playbackState,
      // Derived
      scaleNotes,
      scalePositions,
      chordNotes: chordNotesMemo,
      chordPositions,
      // Actions
      setSelectedScale,
      setSelectedChord,
      setTuning,
      setFretRange,
      setIsLeftHanded,
      setActiveCAGEDShape,
      setPlaybackOptions,
      instrument,
      setInstrument,
      playCurrentScale,
      playCurrentChord,
      stopPlayback,
    }),
    [
      selectedScale, selectedChord, tuning, fretRange,
      isLeftHanded, activeCAGEDShape,
      playbackOptions, playbackState,
      scaleNotes, scalePositions, chordNotesMemo, chordPositions,
      instrument, setInstrument,
      playCurrentScale, playCurrentChord, stopPlayback,
    ],
  );

  return <TheoryContext.Provider value={value}>{children}</TheoryContext.Provider>;
}

export function useTheory(): TheoryContextValue {
  const ctx = useContext(TheoryContext);
  if (!ctx) {
    throw new Error('useTheory must be used within a <TheoryProvider>');
  }
  return ctx;
}
