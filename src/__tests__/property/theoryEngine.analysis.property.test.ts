import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  detectKey, 
  analyzeProgression,
  getDiatonicChords,
  romanNumeralToChord,
  parseChordSymbol
} from '../../lib/theoryEngine';
import { CHROMATIC_NOTES, Key } from '../../types/theory';

describe('Theory Engine Property Tests - Song Analysis', () => {
  const noteNameArb = fc.constantFrom(...CHROMATIC_NOTES);
  const keyQualityArb = fc.constantFrom('major', 'minor') as fc.Arbitrary<'major' | 'minor'>;
  
  const keyArb = fc.record({
    root: noteNameArb,
    quality: keyQualityArb
  }) as fc.Arbitrary<Key>;

  /**
   * Feature: fretboard-theory-workbench, Property 9: Key detection consistency
   * Property: for any diatonic progression (all chords from one key), 
   * detectKey returns that key as the top candidate (with 100% confidence)
   * Validates: Requirement 3.1
   */
  it('should detect the correct key for purely diatonic progressions (Property 9)', () => {
    fc.assert(
      fc.property(keyArb, (key) => {
        const diatonicChords = getDiatonicChords(key);
        const diatonicSymbols = diatonicChords.map(c => c.symbol);
        
        // Generate a random progression of 3-6 diatonic chords
        const progressionArb = fc.array(fc.constantFrom(...diatonicSymbols), { minLength: 3, maxLength: 6 });
        
        fc.assert(
          fc.property(progressionArb, (progression) => {
            const candidates = detectKey(progression);
            
            // The top candidate should have 1.0 confidence
            expect(candidates[0].confidence).toBe(1.0);
            
            // The original key should be among those with 1.0 confidence
            const highConfidenceCandidates = candidates.filter(c => c.confidence === 1.0);
            const foundOriginal = highConfidenceCandidates.some(
              c => c.root === key.root && c.quality === key.quality
            );
            
            expect(foundOriginal).toBe(true);
          })
        );
      }),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: fretboard-theory-workbench, Property 10: Roman numeral round-trip
   * Property: converting chords to Roman numerals and back (given the same key) 
   * produces the same chord symbols (canonical form)
   * Validates: Requirement 3.2
   */
  it('should preserve chord identity when round-tripping through Roman numerals (Property 10)', () => {
    fc.assert(
      fc.property(keyArb, (key) => {
        const diatonicChords = getDiatonicChords(key);
        const diatonicSymbols = diatonicChords.map(c => c.symbol);
        
        const progressionArb = fc.array(fc.constantFrom(...diatonicSymbols), { minLength: 1, maxLength: 10 });
        
        fc.assert(
          fc.property(progressionArb, (progression) => {
            const analysis = analyzeProgression(progression, key);
            
            const roundTripped = analysis.map(rn => romanNumeralToChord(rn, key));
            
            // progression is already in canonical form because we got it from getDiatonicChords().symbol
            expect(roundTripped).toEqual(progression);
          })
        );
      }),
      { numRuns: 20 }
    );
  });
});
