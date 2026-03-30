import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateTransitionAccuracy } from '../../lib/theoryEngine';

describe('TheoryEngine Transition Property Tests', () => {
  it('Property 16: Accuracy metric is always between 0 and 1', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 30, max: 300 }), // targetBPM
        fc.double({ min: 1, max: 10000, noNaN: true }), // actualTimeMs
        (targetBPM, actualTimeMs) => {
          const accuracy = calculateTransitionAccuracy(actualTimeMs, targetBPM);
          return accuracy >= 0 && accuracy <= 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Accuracy is 1 if actual time is less than or equal to expected time', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 30, max: 300 }), // targetBPM
        (targetBPM) => {
          const expectedTimeMs = 60000 / targetBPM;
          const accuracy = calculateTransitionAccuracy(expectedTimeMs, targetBPM);
          const accuracyFaster = calculateTransitionAccuracy(expectedTimeMs * 0.5, targetBPM);
          
          return accuracy === 1 && accuracyFaster === 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Accuracy decreases as actual time increases beyond expected time', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 30, max: 300 }), // targetBPM
        fc.double({ min: 1.1, max: 10, noNaN: true }), // multiplier
        (targetBPM, multiplier) => {
          const expectedTimeMs = 60000 / targetBPM;
          const actualTimeMs = expectedTimeMs * multiplier;
          const accuracy = calculateTransitionAccuracy(actualTimeMs, targetBPM);
          
          return accuracy < 1 && accuracy > 0;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('Accuracy is 0 for non-positive actual time', () => {
    expect(calculateTransitionAccuracy(0, 120)).toBe(0);
    expect(calculateTransitionAccuracy(-100, 120)).toBe(0);
  });
});
