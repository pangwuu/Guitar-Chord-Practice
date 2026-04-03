import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  transposeNote, 
  intervalBetween, 
  noteToIndex 
} from '../../lib/theoryEngine';
import { CHROMATIC_NOTES, NoteName } from '../../types/theory';

describe('Theory Engine Property Tests - Note/Interval Arithmetic', () => {
  // Arbitrary for NoteName (only sharps as defined in types)
  const noteNameArb = fc.constantFrom(...CHROMATIC_NOTES);
  
  // Arbitrary for intervals (any integer)
  const intervalArb = fc.integer();

  /**
   * Feature: fretboard-theory-workbench, Property 1: Chromatic closure
   * Property: transposing any note by any interval always produces a valid note within the 12-tone chromatic set
   */
  it('should always produce a valid chromatic note when transposing (Property 1)', () => {
    fc.assert(
      fc.property(noteNameArb, intervalArb, (note, interval) => {
        const result = transposeNote(note, interval);
        expect(CHROMATIC_NOTES).toContain(result);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: fretboard-theory-workbench, Property 2: Interval inversion symmetry
   * Property: intervalBetween(a, b) + intervalBetween(b, a) = 12 semitones (mod 12)
   */
  it('should satisfy interval inversion symmetry (Property 2)', () => {
    fc.assert(
      fc.property(noteNameArb, noteNameArb, (a, b) => {
        const i1 = intervalBetween(a, b);
        const i2 = intervalBetween(b, a);
        expect((i1 + i2) % 12).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: fretboard-theory-workbench, Property 3: Note index consistency
   * Property: noteToIndex(indexToNote(i)) = i % 12
   */
  it('should be consistent between note and index (Property 3)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 11 }), (i) => {
        const note = CHROMATIC_NOTES[i];
        expect(noteToIndex(note)).toBe(i);
      }),
      { numRuns: 100 }
    );
  });
});
