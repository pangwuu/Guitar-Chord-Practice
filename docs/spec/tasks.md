# Implementation Plan: Fretboard Theory Workbench

## Overview

Incremental implementation of the Fretboard Theory Workbench feature for the Guitar Chord Practice app. Built with React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, and Tone.js. The plan starts with the pure theory engine and types, layers on visualization, then adds song analysis, multi-position/CAGED, playback, song import, beginner features, and responsive/accessibility polish. Property-based tests (fast-check) validate correctness properties from the design document throughout.

## Tasks

- [-] 1. Foundation: Theory Engine, Types, and Context
  - [x] 1.1 Create core music theory types and interfaces
    - Create `src/types/theory.ts` with types: `Note`, `Interval`, `Scale`, `Chord`, `Key`, `RomanNumeral`, `FretPosition`, `Tuning`, `CAGEDShape`, `FingerGuide`, `LearningPath`
    - Define enums for note names, interval qualities, scale types, chord qualities, CAGED shape names
    - Include tuning presets (standard, drop-D, open-G, open-D, DADGAD, custom)
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 5.1, 6.1, 7.1, 8.1, 9.1_

  - [x] 1.2 Implement `theoryEngine.ts` pure functions module
    - Create `src/lib/theoryEngine.ts` as a pure, stateless module (no side effects, no React dependencies)
    - Implement note/interval arithmetic: `transposeNote(note, interval)`, `intervalBetween(a, b)`, `enharmonicEquivalent(note)`
    - Implement scale generation: `getScale(root, scaleType)` returning array of notes and intervals
    - Implement chord construction: `getChord(root, quality)` returning notes and intervals
    - Implement key detection: `detectKey(notes[])` returning ranked key candidates with confidence scores
    - Implement Roman numeral analysis: `analyzeProgression(chords[], key)` returning `RomanNumeral[]`
    - Implement fretboard mapping: `getScalePositions(scale, tuning, fretRange)`, `getChordPositions(chord, tuning, fretRange)`
    - Implement CAGED shape calculation: `getCAGEDShapes(chord, tuning)`
    - Implement interval labeling: `labelIntervals(positions[], root)`
    - All functions must be pure — same input always produces same output
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 5.1, 5.2, 6.1_

  - [ ]* 1.3 Write property tests for note/interval arithmetic (Properties 1–3)
    - **Property 1: Chromatic closure** — transposing any note by any interval always produces a valid note within the 12-tone chromatic set
    - **Validates: Requirement 1.1**
    - **Property 2: Interval inversion symmetry** — `intervalBetween(a, b)` + `intervalBetween(b, a)` = 12 semitones (mod 12)
    - **Validates: Requirement 1.1**
    - **Property 3: Enharmonic equivalence** — `enharmonicEquivalent(note)` always maps to the same pitch class
    - **Validates: Requirement 1.1**
    - Use `fast-check` arbitrary generators for Note and Interval types

  - [ ]* 1.4 Write property tests for scale and chord generation (Properties 4–6)
    - **Property 4: Scale cardinality** — major/minor scales always return exactly 7 notes, pentatonic returns 5, chromatic returns 12
    - **Validates: Requirement 1.2**
    - **Property 5: Scale interval sum** — intervals of any generated scale always sum to 12 semitones
    - **Validates: Requirement 1.2**
    - **Property 6: Chord subset of scale** — a diatonic chord built from a scale contains only notes present in that scale
    - **Validates: Requirements 1.2, 2.1**

  - [x] 1.5 Create `TheoryContext` provider and hook
    - Create `src/context/TheoryContext.tsx` with React context provider
    - State: selected key, selected scale, selected chord, current tuning, fret range, left-handed mode, highlighted positions, active CAGED shape
    - Expose `useTheory()` hook for consuming components
    - Memoize derived computations (scale positions, chord positions) with `useMemo`
    - _Requirements: 1.1, 1.2, 7.1, 8.1, 9.1_

  - [x] 1.6 Integrate TheoryContext into App component
    - Wrap existing app with `TheoryProvider`
    - Ensure existing chord practice functionality is unaffected
    - _Requirements: 1.1_

- [ ] 2. Checkpoint — Foundation verified
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Core Visualization: Scale and Chord on Fretboard
  - [ ] 3.1 Build `ScaleSelector` component
    - Create `src/components/theory/ScaleSelector.tsx`
    - Root note picker (12 notes) and scale type dropdown (major, natural minor, harmonic minor, melodic minor, pentatonic major/minor, blues, dorian, mixolydian, lydian, phrygian)
    - On selection, update TheoryContext with computed scale
    - _Requirements: 1.2_

  - [ ] 3.2 Build `ChordSelector` component
    - Create `src/components/theory/ChordSelector.tsx`
    - Root note picker and chord quality dropdown (major, minor, 7, maj7, min7, dim, aug, sus2, sus4, add9, etc.)
    - On selection, update TheoryContext with computed chord
    - _Requirements: 2.1_

  - [ ] 3.3 Build `FretboardOverlay` component for scale/chord visualization
    - Create `src/components/theory/FretboardOverlay.tsx`
    - Render colored dots on fretboard positions for active scale or chord
    - Color-code by interval (root = distinct color, 3rd, 5th, 7th, etc.)
    - Support toggling between note names and interval labels on dots
    - Highlight root notes distinctly
    - Integrate with existing fretboard component or create standalone SVG fretboard
    - _Requirements: 1.2, 2.1, 2.2_

  - [ ]* 3.4 Write property tests for fretboard position mapping (Properties 7–8)
    - **Property 7: Position uniqueness** — `getScalePositions` never returns duplicate (string, fret) pairs for a given scale and tuning
    - **Validates: Requirement 1.2**
    - **Property 8: Position correctness** — every position returned by `getScalePositions` when resolved to a note (using tuning + fret offset) is a member of the input scale
    - **Validates: Requirements 1.2, 2.2**

- [ ] 4. Song Analysis: Input, Key Detection, Roman Numerals
  - [ ] 4.1 Build `SongInput` component
    - Create `src/components/theory/SongInput.tsx`
    - Text input area for entering chord progressions (e.g., "Am F C G" or "Am - F - C - G -")
    - Parse chord symbols into structured Chord objects using theoryEngine
    - Display parsed chords as clickable chips/tags
    - Support common chord notation formats
    - _Requirements: 3.1, 3.2_

  - [ ] 4.2 Build `KeyDetector` display component
    - Create `src/components/theory/KeyDetector.tsx`
    - Call `detectKey()` with parsed chords and display top key candidates with confidence percentages
    - Allow user to override/select a different key
    - When key is selected, update TheoryContext
    - _Requirements: 3.1_

  - [ ] 4.3 Build `RomanNumeralDisplay` component
    - Create `src/components/theory/RomanNumeralDisplay.tsx`
    - Show chord progression with Roman numeral analysis above/below chord names
    - Color-code by function (tonic, subdominant, dominant, secondary dominant, borrowed)
    - Highlight non-diatonic chords
    - _Requirements: 3.2_

  - [ ]* 4.4 Write property tests for key detection and Roman numerals (Properties 9–10)
    - **Property 9: Key detection consistency** — for any diatonic progression (all chords from one key), `detectKey` returns that key as the top candidate
    - **Validates: Requirement 3.1**
    - **Property 10: Roman numeral round-trip** — converting chords to Roman numerals and back (given the same key) produces the original chord roots
    - **Validates: Requirement 3.2**

- [ ] 5. Checkpoint — Core features verified
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Multi-Position and CAGED System
  - [ ] 6.1 Build `CAGEDDiagram` component
    - Create `src/components/theory/CAGEDDiagram.tsx`
    - Display the 5 CAGED shapes for a selected chord across the fretboard
    - Each shape highlighted in a distinct color
    - User can click a shape to isolate/highlight it
    - Show shape name label (C, A, G, E, D) at each position
    - _Requirements: 5.1, 5.2_

  - [ ] 6.2 Build `MultiPositionView` component
    - Create `src/components/theory/MultiPositionView.tsx`
    - Show scale patterns in multiple positions (5 positions aligned with CAGED shapes)
    - Toggle between viewing all positions or one at a time
    - Overlay chord tones within scale patterns
    - _Requirements: 5.1, 5.2_

  - [ ]* 6.3 Write property tests for CAGED shapes (Properties 11–12)
    - **Property 11: CAGED coverage** — the union of all 5 CAGED shapes for any chord covers every occurrence of that chord's notes across the fretboard (within fret range 0–12)
    - **Validates: Requirement 5.1**
    - **Property 12: CAGED shape note validity** — every note in a CAGED shape is a member of the corresponding chord
    - **Validates: Requirements 5.1, 5.2**

- [ ] 7. Unified Theory View
  - [ ] 7.1 Build `TheoryDashboard` page component
    - Create `src/components/theory/TheoryDashboard.tsx`
    - Layout: fretboard visualization (top), control panel with ScaleSelector + ChordSelector (side/top), SongInput + KeyDetector + RomanNumeralDisplay (below fretboard), CAGED/MultiPosition toggle (below)
    - Responsive layout using Tailwind grid/flex
    - All components connected via TheoryContext — selecting a scale updates fretboard, entering a song updates key and Roman numerals, etc.
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 3.2, 5.1_

  - [ ] 7.2 Add routing/navigation to TheoryDashboard
    - Add route or tab for the Theory Workbench alongside existing chord practice
    - Navigation between chord practice and theory workbench
    - _Requirements: 1.1_

- [ ] 8. Playback with Tone.js
  - [ ] 8.1 Build `PlaybackEngine` service
    - Create `src/lib/playbackEngine.ts`
    - Use Tone.js to play scales (ascending/descending), chords (strummed/arpeggiated), and progressions
    - Configurable tempo and playback mode
    - Highlight active note/chord on fretboard during playback via callback
    - _Requirements: 4.1_

  - [ ] 8.2 Build `PlaybackControls` component
    - Create `src/components/theory/PlaybackControls.tsx`
    - Play/pause/stop buttons, tempo slider, playback mode toggle (strum vs arpeggio)
    - Wire to PlaybackEngine and TheoryContext for synchronized fretboard highlighting
    - _Requirements: 4.1_

  - [ ]* 8.3 Write property test for playback timing (Property 13)
    - **Property 13: Playback sder from `getScale()`
    - *equence correctness** — the sequence of notes scheduled by PlaybackEngine for a scale matches the note or