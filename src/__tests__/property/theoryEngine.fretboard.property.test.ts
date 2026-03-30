import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  getScale, 
  getScalePositions,
  getNoteAtFret
} from '../../lib/theoryEngine';
import { 
  CHROMATIC_NOTES, 
  SCALE_INTERVALS,
  ScaleType,
  TUNING_PRESETS,
  Tuning
} from '../../types/theory';

describe('Theory Engine Property Tests - Fretboard Position Mapping', () => {
  const noteNameArb = fc.constantFrom(...CHROMATIC_NOTES);
  const scaleTypeArb = fc.constantFrom(...Object.keys(SCALE_INTERVALS) as ScaleType[]);
  const tuningArb = fc.constantFrom(...Object.values(TUNING_PRESETS));

  /**
   * Feature: fretboard-theory-workbench, Property 7: Position uniqueness
   * Property: getScalePositions never returns duplicate (string, fret) pairs for a given scale and tuning
   * Validates: Requirement 1.2
   */
  it('should never return duplicate (string, fret) positions (Property 7)', () => {
    fc.assert(
      fc.property(noteNameArb, scaleTypeArb, tuningArb, (root, type, tuning) => {
        const scale = getScale(root, type);
        const positions = getScalePositions(scale, tuning, [0, 12]);
        
        const seen = new Set<string>();
        for (const pos of positions) {
          const key = `${pos.string}-${pos.fret}`;
          expect(seen.has(key)).toBe(false);
          seen.add(key);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: fretboard-theory-workbench, Property 8: Position correctness
   * Property: every position returned by getScalePositions when resolved to a note 
   * (using tuning + fret offset) is a member of the input scale
   * Validates: Requirements 1.2, 2.2
   */
  it('should only return positions that contain notes from the input scale (Property 8)', () => {
    fc.assert(
      fc.property(noteNameArb, scaleTypeArb, tuningArb, (root, type, tuning) => {
        const scale = getScale(root, type);
        const positions = getScalePositions(scale, tuning, [0, 12]);
        
        for (const pos of positions) {
          const noteAtPos = getNoteAtFret(pos.string, pos.fret, tuning);
          expect(scale.notes).toContain(noteAtPos);
          expect(pos.note).toBe(noteAtPos);
        }
      }),
      { numRuns: 100 }
    );
  });
});
