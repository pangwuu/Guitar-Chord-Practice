import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  getScale
} from '../../lib/theoryEngine';
import { 
  CHROMATIC_NOTES, 
  SCALE_INTERVALS,
  ScaleType
} from '../../types/theory';

describe('Theory Engine Property Tests - Scale and Chord Generation', () => {
  const noteNameArb = fc.constantFrom(...CHROMATIC_NOTES);
  const scaleTypeArb = fc.constantFrom(...Object.keys(SCALE_INTERVALS) as ScaleType[]);

  /**
   * Feature: fretboard-theory-workbench, Property 4: Scale cardinality
   * Property: major/minor scales always return exactly 7 notes, pentatonic returns 5, blues 6
   */
  it('should return correct number of notes for scale types (Property 4)', () => {
    fc.assert(
      fc.property(noteNameArb, scaleTypeArb, (root, type) => {
        const scale = getScale(root, type);
        const expectedCount = SCALE_INTERVALS[type].length;
        expect(scale.notes.length).toBe(expectedCount);
        
        if (['major', 'natural_minor', 'harmonic_minor', 'melodic_minor', 'ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'].includes(type)) {
          expect(scale.notes.length).toBe(7);
        } else if (['pentatonic_major', 'pentatonic_minor'].includes(type)) {
          expect(scale.notes.length).toBe(5);
        } else if (type === 'blues') {
          expect(scale.notes.length).toBe(6);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: fretboard-theory-workbench, Property 5: Scale interval sum
   * Property: intervals of any generated scale always sum to 12 semitones
   */
  it('should have intervals that sum to 12 semitones (Property 5)', () => {
    fc.assert(
      fc.property(noteNameArb, scaleTypeArb, (root, type) => {
        const scale = getScale(root, type);
        const intervals = scale.intervals;
        
        const steps = [];
        for (let i = 0; i < intervals.length - 1; i++) {
          steps.push(intervals[i+1] - intervals[i]);
        }
        steps.push(12 - intervals[intervals.length - 1]);
        
        const sum = steps.reduce((acc, s) => acc + s, 0);
        expect(sum).toBe(12);
      }),
      { numRuns: 100 }
    );
  });
});
