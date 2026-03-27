import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

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
    }),
    [
      selectedKey, selectedScale, selectedChord, tuning, fretRange,
      isLeftHanded, activeCAGEDShape, chordProgression,
      scaleNotes, scalePositions, chordNotesMemo, chordPositions,
      detectedKey, romanNumerals,
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
