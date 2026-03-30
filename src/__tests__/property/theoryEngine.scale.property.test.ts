import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  getScale, 
  getDiatonicChords
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
   * Validates: Requirement 1.2
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
   * Validates: Requirement 1.2
   */
  it('should have intervals that sum to 12 semitones (Property 5)', () => {
    fc.assert(
      fc.property(noteNameArb, scaleTypeArb, (root, type) => {
        const scale = getScale(root, type);
        const intervals = scale.intervals;
        
        // intervals are [0, 2, 4, ...] from root.
        // The "steps" between notes are:
        const steps = [];
        for (let i = 0; i < intervals.length - 1; i++) {
          steps.push(intervals[i+1] - intervals[i]);
        }
        // Add the step back to the octave
        steps.push(12 - intervals[intervals.length - 1]);
        
        const sum = steps.reduce((acc, s) => acc + s, 0);
        expect(sum).toBe(12);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: fretboard-theory-workbench, Property 6: Chord subset of scale
   * Property: a diatonic chord built from a scale contains only notes present in that scale
   * Validates: Requirements 1.2, 2.1
   */
  it('should ensure diatonic chords only contain notes from the parent scale (Property 6)', () => {
    const keyQualityArb = fc.constantFrom('major', 'minor') as fc.Arbitrary<'major' | 'minor'>;
    
    fc.assert(
      fc.property(noteNameArb, keyQualityArb, (root, quality) => {
        const key = { root, quality };
        const scaleType = quality === 'major' ? 'major' : 'natural_minor';
        const scale = getScale(root, scaleType);
        const scaleNotes = scale.notes;
        
        const diatonicChords = getDiatonicChords(key);
        
        for (const chord of diatonicChords) {
          for (const note of chord.notes) {
            // Check if every note of the chord is in the scale notes
            expect(scaleNotes).toContain(note);
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});
