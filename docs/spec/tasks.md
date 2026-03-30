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

  - [x] 1.3 Write property tests for note/interval arithmetic (Properties 1–3)
    - **Property 1: Chromatic closure** — transposing any note by any interval always produces a valid note within the 12-tone chromatic set
    - **Validates: Requirement 1.1**
    - **Property 2: Interval inversion symmetry** — `intervalBetween(a, b)` + `intervalBetween(b, a)` = 12 semitones (mod 12)
    - **Validates: Requirement 1.1**
    - **Property 3: Enharmonic equivalence** — `enharmonicEquivalent(note)` always maps to the same pitch class
    - **Validates: Requirement 1.1**
    - Use `fast-check` arbitrary generators for Note and Interval types

  - [x] 1.4 Write property tests for scale and chord generation (Properties 4–6)
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

- [x] 2. Checkpoint — Foundation verified
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Core Visualization: Scale and Chord on Fretboard
  - [x] 3.1 Build `ScaleSelector` component
    - Create `src/components/theory/ScaleSelector.tsx`
    - Root note picker (12 notes) and scale type dropdown (major, natural minor, harmonic minor, melodic minor, pentatonic major/minor, blues, dorian, mixolydian, lydian, phrygian)
    - On selection, update TheoryContext with computed scale
    - _Requirements: 1.2_

  - [x] 3.2 Build `ChordSelector` component
    - Create `src/components/theory/ChordSelector.tsx`
    - Root note picker and chord quality dropdown (major, minor, 7, maj7, min7, dim, aug, sus2, sus4, add9, etc.)
    - On selection, update TheoryContext with computed chord
    - _Requirements: 2.1_

  - [x] 3.3 Build `FretboardOverlay` component for scale/chord visualization
    - Create `src/components/theory/FretboardOverlay.tsx` (implemented as FretboardWorkbench.tsx)
    - Render colored dots on fretboard positions for active scale or chord
    - Color-code by interval (root = distinct color, 3rd, 5th, 7th, etc.)
    - Support toggling between note names and interval labels on dots
    - Highlight root notes distinctly
    - Integrate with existing fretboard component or create standalone SVG fretboard
    - _Requirements: 1.2, 2.1, 2.2_

  - [x] 3.4 Write property tests for fretboard position mapping (Properties 7–8)
    - **Property 7: Position uniqueness** — `getScalePositions` never returns duplicate (string, fret) pairs for a given scale and tuning
    - **Validates: Requirement 1.2**
    - **Property 8: Position correctness** — every position returned by `getScalePositions` when resolved to a note (using tuning + fret offset) is a member of the input scale
    - **Validates: Requirements 1.2, 2.2**

- [x] 4. Song Analysis: Input, Key Detection, Roman Numerals
  - [x] 4.1 Build `SongInput` component
    - Create `src/components/views/SongAnalyzer.tsx` (implemented as part of SongAnalyzer)
    - Text input area for entering chord progressions (e.g., "Am F C G" or "Am - F - C - G -")
    - Parse chord symbols into structured Chord objects using theoryEngine
    - Display parsed chords as clickable chips/tags
    - Support common chord notation formats
    - _Requirements: 3.1, 3.2_

  - [x] 4.2 Build `KeyDetector` display component
    - Create `src/components/views/SongAnalyzer.tsx` (implemented as part of SongAnalyzer)
    - Call `detectKey()` with parsed chords and display top key candidates with confidence percentages
    - Allow user to override/select a different key
    - When key is selected, update TheoryContext
    - _Requirements: 3.1_

  - [x] 4.3 Build `RomanNumeralDisplay` component
    - Create `src/components/views/SongAnalyzer.tsx` (implemented as part of SongAnalyzer)
    - Show chord progression with Roman numeral analysis above/below chord names
    - Color-code by function (tonic, subdominant, dominant, secondary dominant, borrowed)
    - Highlight non-diatonic chords
    - _Requirements: 3.2_

  - [x] 4.4 Write property tests for key detection and Roman numerals (Properties 9–10)
    - **Property 9: Key detection consistency** — for any diatonic progression (all chords from one key), `detectKey` returns that key as the top candidate
    - **Validates: Requirement 3.1**
    - **Property 10: Roman numeral round-trip** — converting chords to Roman numerals and back (given the same key) produces the original chord roots
    - **Validates: Requirement 3.2**

- [x] 5. Checkpoint — Core features verified
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Multi-Position and CAGED System
  - [x] 6.1 Build `CAGEDDiagram` component
    - Create `src/components/theory/CAGEDDiagram.tsx` (implemented as part of CAGEDExplorer.tsx)
    - Display the 5 CAGED shapes for a selected chord across the fretboard
    - Each shape highlighted in a distinct color
    - User can click a shape to isolate/highlight it
    - Show shape name label (C, A, G, E, D) at each position
    - _Requirements: 5.1, 5.2_

  - [x] 6.2 Build `MultiPositionView` component
    - Create `src/components/theory/MultiPositionView.tsx` (implemented as part of CAGEDExplorer.tsx)
    - Show scale patterns in multiple positions (5 positions aligned with CAGED shapes)
    - Toggle between viewing all positions or one at a time
    - Overlay chord tones within scale patterns
    - _Requirements: 5.1, 5.2_

  - [x] 6.3 Write property tests for CAGED shapes (Properties 11–12)
    - **Property 11: CAGED coverage** — the union of all 5 CAGED shapes for any chord covers a significant majority of its notes across the fretboard (within fret range 0–12)
    - **Validates: Requirement 5.1**
    - **Property 12: CAGED shape note validity** — every note in a CAGED shape is a member of the corresponding chord
    - **Validates: Requirements 5.1, 5.2**

- [x] 7. Unified Theory View
  - [x] 7.1 Build `TheoryDashboard` page component
    - Create `src/components/theory/TheoryDashboard.tsx`
    - Layout: fretboard visualization (top), control panel with ScaleSelector + ChordSelector (side/top), SongInput + KeyDetector + RomanNumeralDisplay (below fretboard), CAGED/MultiPosition toggle (below)
    - Responsive layout using Tailwind grid/flex
    - All components connected via TheoryContext — selecting a scale updates fretboard, entering a song updates key and Roman numerals, etc.
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 3.2, 5.1_

  - [x] 7.2 Add routing/navigation to TheoryDashboard
    - Add route or tab for the Theory Workbench alongside existing chord practice
    - Navigation between chord practice and theory workbench
    - _Requirements: 1.1_

- [x] 8. Playback with Tone.js
  - [x] 8.1 Build `PlaybackEngine` service
    - Create `src/lib/playbackEngine.ts`
    - Use Tone.js to play scales (ascending/descending), chords (strummed/arpeggiated), and progressions
    - Configurable tempo and playback mode
    - Highlight active note/chord on fretboard during playback via callback
    - _Requirements: 4.1_

  - [x] 8.2 Build `PlaybackControls` component
    - Create `src/components/theory/PlaybackControls.tsx`
    - Play/pause/stop buttons, tempo slider, playback mode toggle (strum vs arpeggio)
    - Wire to PlaybackEngine and TheoryContext for synchronized fretboard highlighting
    - _Requirements: 4.1_

  - [x] 9. Learning Path: Beginner to Advanced
    - [x] 9.1 Define `LearningPath` structured curriculum
      - Create `src/constants/learningPath.ts` with initial modules (First Chords, G-C Connection, Minor Basics, Major Scale Foundation, CAGED Basics)
      - Define prerequisites and estimated times for each module
      - _Requirements: 7.1_

    - [x] 9.2 Build `LearningPathView` component
      - Create `src/components/views/LearningPathView.tsx`
      - Display module cards with status (locked, available, completed)
      - Show overall progress percentage
      - Handle module completion and prerequisite unlocking logic
      - _Requirements: 7.1, 8.1_

    - [x] 9.3 Write property test for learning path progression (Property 14)
      - **Property 14: Prerequisite unlocking** — a module is only 'available' if all its prerequisites are 'completed'
      - **Validates: Requirement 7.1**

- [x] 10. Finger Placement Guide
  - [x] 10.1 Build `FingerPlacementGuide` component
    - Animated step-by-step sequence showing one finger being placed at a time
    - Use color-coding for fingers (Index, Middle, Ring, Pinky)
    - Labels for exact string and fret positions
    - Stepper controls (back/forward)
    - _Requirements: 15.1, 15.2, 15.5, 15.7_

  - [x] 10.2 Add mistake alerts and muting/open string instructions
    - Display practice tips and common mistakes
    - Visual indicators for muted strings (X) and open strings (O)
    - _Requirements: 15.3, 15.6_

- [x] 11. Chord Transition Trainer
  - [x] 11.1 Build `TransitionTrainer` component
    - Side-by-side chord diagrams
    - Built-in metronome with adjustable BPM
    - Visual cue alternating between chords on beats
    - "Gradual speed-up" mode
    - _Requirements: 16.1, 16.3, 16.4, 16.5_

  - [x] 11.2 Implement transition metrics and history
    - Track switches completed and average tempo
    - Save session summary to progress history (UI implementation done)
    - _Requirements: 16.6, 16.7_

  - [x] 11.3 Write property test for transition accuracy (Property 16)
    - **Property 16: Transition accuracy** — calculation logic for accuracy metric
    - **Validates: Requirement 16.2**

- [ ] 12. Final Polish: Onboarding and Responsive Design
  - [x] 12.1 Build interactive `OnboardingTutorial`
    - Step-by-step walkthrough explaining diagrams, tabs, and orientation
    - Identification exercises with feedback
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

  - [x] 12.2 Responsive and Accessibility audit
    - Ensure tablet/desktop layouts are fluid (768px+)
    - Add ARIA labels and keyboard navigation support
    - Implement scrollable containers for fretboard
    - _Requirements: 10.1, 10.3, 10.4_

  - [x] 13. Song Import: Mocked Backend
  - [x] 13.1 Build `SongImportView` component
    - URL input for Spotify/YouTube
    - Mock loading and success states
    - Metadata extraction (title, artist) simulation
    - Send imported chords to SongAnalyzer
    - _Requirements: 13.1, 13.2, 13.6, 13.7, 13.10_