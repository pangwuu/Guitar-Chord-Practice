import { describe, it, expect } from 'vitest';
import { getCAGEDShapes } from '../lib/theoryEngine';
import { TUNING_PRESETS } from '../types/theory';

describe('CAGED Shapes Logic', () => {
  const tuning = TUNING_PRESETS.standard;

  it('should have intervals in the scalePattern', () => {
    const shapes = getCAGEDShapes('C', 'major', tuning);
    const cShape = shapes.find(s => s.shape === 'C')!;
    
    // Check if scalePattern positions have the interval property
    expect(cShape.scalePattern[0]).toHaveProperty('interval');
    expect(typeof cShape.scalePattern[0].interval).toBe('number');
  });

  it('should identify root notes correctly in the scalePattern', () => {
    const shapes = getCAGEDShapes('D', 'major', tuning);
    const dShape = shapes.find(s => s.shape === 'C')!; // C shape for D chord
    
    // For D major, root is D.
    // In C-shape D chord (shifted up 2 frets from C):
    // String 1 (A) fret 5 is D.
    const rootPos = dShape.scalePattern.find(p => p.string === 1 && p.fret === 5);
    expect(rootPos).toBeDefined();
    expect(rootPos?.interval).toBe(0);
    expect(rootPos?.note).toBe('D');
  });

  it('should calculate dynamic fret ranges instead of hardcoded 6', () => {
    const shapes = getCAGEDShapes('C', 'major', tuning);
    
    const eShape = shapes.find(s => s.shape === 'E')!; // E shape for C chord is at 8th fret
    // E shape voicing for C: [8, 10, 10, 9, 8, 8]
    // minFretUsed = 8, maxFretUsed = 10
    // fretRange should be [7, 11] (span of 4)
    const range = eShape.fretRange[1] - eShape.fretRange[0];
    expect(range).toBe(4);
    
    const aShape = shapes.find(s => s.shape === 'A')!; // A shape for C chord is at 3rd fret
    // A shape voicing for C: [x, 3, 5, 5, 5, 3]
    // minFretUsed = 3, maxFretUsed = 5
    // fretRange should be [2, 6] (span of 4)
    expect(aShape.fretRange[1] - aShape.fretRange[0]).toBe(4);
  });
});
