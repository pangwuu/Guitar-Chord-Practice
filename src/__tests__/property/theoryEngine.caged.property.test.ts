import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  getCAGEDShapes,
  getChordNotes,
  getNoteAtFret
} from '../../lib/theoryEngine';
import { 
  CHROMATIC_NOTES, 
  ChordQuality,
  TUNING_PRESETS
} from '../../types/theory';

describe('Theory Engine Property Tests - CAGED Shapes', () => {
  const noteNameArb = fc.constantFrom(...CHROMATIC_NOTES);
  const chordQualityArb = fc.constantFrom('major', 'minor', 'dom7', 'maj7', 'min7') as fc.Arbitrary<ChordQuality>;
  const tuningArb = fc.constantFrom(TUNING_PRESETS.standard); // CAGED is primarily standard tuning

  /**
   * Feature: fretboard-theory-workbench, Property 11: CAGED coverage
   * Property: the union of all 5 CAGED shapes for any chord should cover 
   * a significant majority of chord tones across the strings.
   * Validates: Requirement 5.1
   */
  it('should cover a significant majority of expected chord tone positions (Property 11)', () => {
    fc.assert(
      fc.property(noteNameArb, chordQualityArb, tuningArb, (root, quality, tuning) => {
        const chordNotes = getChordNotes(root, quality);
        const shapes = getCAGEDShapes(root, quality, tuning);
        
        // Find all expected positions of chord tones on the fretboard (0-12)
        const expectedPositions: string[] = [];
        for (let s = 0; s < tuning.strings.length; s++) {
          for (let f = 0; f <= 12; f++) {
            if (chordNotes.includes(getNoteAtFret(s, f, tuning))) {
              expectedPositions.push(`${s}-${f}`);
            }
          }
        }

        // Collect all positions covered by the 5 CAGED scale patterns
        const coveredPositions = new Set<string>();
        for (const shape of shapes) {
          for (const pos of shape.scalePattern) {
            if (chordNotes.includes(pos.note)) {
              coveredPositions.add(`${pos.string}-${pos.fret}`);
            }
          }
        }

        // Check coverage - we expect at least 60% coverage from just the first 5 focal shapes
        let coveredCount = 0;
        for (const pos of expectedPositions) {
          if (coveredPositions.has(pos)) {
            coveredCount++;
          }
        }

        const coverage = coveredCount / expectedPositions.length;
        expect(coverage).toBeGreaterThanOrEqual(0.6);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Feature: fretboard-theory-workbench, Property 12: CAGED shape note validity
   * Property: every note in a CAGED voicing is a member of the corresponding chord
   * Validates: Requirements 5.1, 5.2
   */
  it('should only contain chord tones in the voicing for each CAGED shape (Property 12)', () => {
    fc.assert(
      fc.property(noteNameArb, chordQualityArb, tuningArb, (root, quality, tuning) => {
        const chordNotes = getChordNotes(root, quality);
        const shapes = getCAGEDShapes(root, quality, tuning);
        
        for (const shape of shapes) {
          for (let s = 0; s < shape.chordVoicing.strings.length; s++) {
            const fret = shape.chordVoicing.strings[s];
            if (fret !== null) {
              const note = getNoteAtFret(s, fret, tuning);
              expect(chordNotes).toContain(note);
            }
          }
        }
      }),
      { numRuns: 50 }
    );
  });
});
