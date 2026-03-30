import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  transposeNote, 
  intervalBetween, 
  enharmonicEquivalent, 
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
   * Validates: Requirement 1.1
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
   * Validates: Requirement 1.1
   */
  it('should satisfy interval inversion symmetry (Property 2)', () => {
    fc.assert(
      fc.property(noteNameArb, noteNameArb, (a, b) => {
        const i1 = intervalBetween(a, b);
        const i2 = intervalBetween(b, a);
        
        // (i1 + i2) % 12 should be 0, but we must handle i1=0, i2=0 case
        // intervalBetween returns 0-11.
        // If a=C, b=D, i1=2, i2=10. 2+10=12. 12%12=0.
        // If a=C, b=C, i1=0, i2=0. 0+0=0. 0%12=0.
        expect((i1 + i2) % 12).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: fretboard-theory-workbench, Property 3: Enharmonic equivalence
   * Property: enharmonicEquivalent(note) always maps to the same pitch class
   * Validates: Requirement 1.1
   */
  it('should map to the same pitch class for enharmonic equivalents (Property 3)', () => {
    fc.assert(
      fc.property(noteNameArb, (note) => {
        const enharmonic = enharmonicEquivalent(note);
        
        // Helper to get pitch class (0-11) for both sharps and flats
        const getPitchClass = (n: string): number => {
          const flatToSharp: Record<string, string> = {
            'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
          };
          const normalized = flatToSharp[n] || n;
          return CHROMATIC_NOTES.indexOf(normalized as any);
        };

        const pcOriginal = getPitchClass(note);
        const pcEnharmonic = getPitchClass(enharmonic);
        
        expect(pcEnharmonic).toBe(pcOriginal);
      }),
      { numRuns: 100 }
    );
  });
});
