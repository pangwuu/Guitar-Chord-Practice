import React, { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react';

import type {
  NoteName,
  ScaleType,
  ChordQuality,
  Tuning,
  CAGEDShapeName,
  Key,
  FretPosition,
  RomanNumeral,
  KeyCandidate,
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
  detectKey,
  analyzeProgression,
} from '../lib/theoryEngine';

import { playbackEngine } from '../lib/playbackEngine';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface TheoryState {
  selectedKey: Key | null;
  selectedScale: { root: NoteName; type: ScaleType } | null;
  selectedChord: { root: NoteName; quality: ChordQuality } | null;
  tuning: Tuning;
  fretRange: { min: number; max: number };
  isLeftHanded: boolean;
  activeCAGEDShape: CAGEDShapeName | null;
  chordProgression: string[];
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
  detectedKey: KeyCandidate[];
  romanNumerals: RomanNumeral[];
}

// ---------------------------------------------------------------------------
// Actions (setters)
// ---------------------------------------------------------------------------

interface TheoryActions {
  setSelectedKey: React.Dispatch<React.SetStateAction<Key | null>>;
  setSelectedScale: React.Dispatch<React.SetStateAction<{ root: NoteName; type: ScaleType } | null>>;
  setSelectedChord: React.Dispatch<React.SetStateAction<{ root: NoteName; quality: ChordQuality } | null>>;
  setTuning: React.Dispatch<React.SetStateAction<Tuning>>;
  setFretRange: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>;
  setIsLeftHanded: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveCAGEDShape: React.Dispatch<React.SetStateAction<CAGEDShapeName | null>>;
  setChordProgression: React.Dispatch<React.SetStateAction<string[]>>;
  setPlaybackOptions: React.Dispatch<React.SetStateAction<PlaybackOptions>>;
  playCurrentScale: () => void;
  playCurrentChord: () => void;
  playProgression: () => void;
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
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [selectedScale, setSelectedScale] = useState<{ root: NoteName; type: ScaleType } | null>(null);
  const [selectedChord, setSelectedChord] = useState<{ root: NoteName; quality: ChordQuality } | null>(null);
  const [tuning, setTuning] = useState<Tuning>(TUNING_PRESETS.standard);
  const [fretRange, setFretRange] = useState<{ min: number; max: number }>({ min: 0, max: 12 });
  const [isLeftHanded, setIsLeftHanded] = useState(false);
  const [activeCAGEDShape, setActiveCAGEDShape] = useState<CAGEDShapeName | null>(null);
  const [chordProgression, setChordProgression] = useState<string[]>([]);
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

  const detectedKey = useMemo<KeyCandidate[]>(() => {
    if (chordProgression.length === 0) return [];
    return detectKey(chordProgression);
  }, [chordProgression]);

  const romanNumerals = useMemo<RomanNumeral[]>(() => {
    if (chordProgression.length === 0 || !selectedKey) return [];
    return analyzeProgression(chordProgression, selectedKey);
  }, [chordProgression, selectedKey]);

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
    // Add octave to notes for Tone.js (simplification: all in octave 4)
    const notesWithOctave = notes.map(n => `${n}4`);
    playbackEngine.playNotes(notesWithOctave, { ...playbackOptions, mode: 'arpeggio' }, onNoteIndex);
  }, [selectedScale, playbackOptions, onNoteIndex]);

  const playCurrentChord = useCallback(() => {
    if (!selectedChord) return;
    const notes = getChordNotes(selectedChord.root, selectedChord.quality);
    const notesWithOctave = notes.map((n, i) => `${n}${3 + Math.floor(i/3)}`);
    playbackEngine.playNotes(notesWithOctave, playbackOptions, onNoteIndex);
  }, [selectedChord, playbackOptions, onNoteIndex]);

  const playProgression = useCallback(() => {
    if (chordProgression.length === 0) return;
    // For now, play the roots of the progression
    const notesWithOctave = chordProgression.map(symbol => {
      // Very basic extraction of root from symbol
      const rootMatch = symbol.match(/^[A-G][#b]?/);
      return rootMatch ? `${rootMatch[0]}3` : 'C3';
    });
    playbackEngine.playNotes(notesWithOctave, { ...playbackOptions, mode: 'arpeggio' }, onNoteIndex);
  }, [chordProgression, playbackOptions, onNoteIndex]);

  // --- Context value ---

  const value = useMemo<TheoryContextValue>(
    () => ({
      // State
      selectedKey,
      selectedScale,
      selectedChord,
      tuning,
      fretRange,
      isLeftHanded,
      activeCAGEDShape,
      chordProgression,
      playbackOptions,
      playbackState,
      // Derived
      scaleNotes,
      scalePositions,
      chordNotes: chordNotesMemo,
      chordPositions,
      detectedKey,
      romanNumerals,
      // Actions
      setSelectedKey,
      setSelectedScale,
      setSelectedChord,
      setTuning,
      setFretRange,
      setIsLeftHanded,
      setActiveCAGEDShape,
      setChordProgression,
      setPlaybackOptions,
      playCurrentScale,
      playCurrentChord,
      playProgression,
      stopPlayback,
    }),
    [
      selectedKey, selectedScale, selectedChord, tuning, fretRange,
      isLeftHanded, activeCAGEDShape, chordProgression,
      playbackOptions, playbackState,
      scaleNotes, scalePositions, chordNotesMemo, chordPositions,
      detectedKey, romanNumerals,
      playCurrentScale, playCurrentChord, playProgression, stopPlayback,
    ],
  );

  return <TheoryContext.Provider value={value}>{children}</TheoryContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTheory(): TheoryContextValue {
  const ctx = useContext(TheoryContext);
  if (!ctx) {
    throw new Error('useTheory must be used within a <TheoryProvider>');
  }
  return ctx;
}
