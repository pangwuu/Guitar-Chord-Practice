import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { playbackEngine } from '../../lib/playbackEngine';
import { PlaybackOptions } from '../../types/theory';
import * as Tone from 'tone';

// Mock Tone.js
vi.mock('tone', () => {
  const Sampler = vi.fn().mockImplementation(function(options) {
    // Immediately call onload if provided
    if (options && options.onload) {
      setTimeout(options.onload, 0);
    }
    return {
      toDestination: vi.fn().mockReturnThis(),
      triggerAttackRelease: vi.fn(),
      dispose: vi.fn(),
    };
  });

  const Part = vi.fn().mockImplementation(function(callback, events) {
    return {
      start: vi.fn().mockReturnThis(),
      dispose: vi.fn(),
      events // expose for testing
    };
  });

  return {
    start: vi.fn().mockResolvedValue(undefined),
    now: vi.fn().mockReturnValue(0),
    Sampler,
    Part,
    Transport: {
      start: vi.fn(),
      stop: vi.fn(),
      cancel: vi.fn(),
      schedule: vi.fn(),
    },
    Draw: {
      schedule: vi.fn(),
    }
  };
});

describe('Playback Engine Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Also need to clear the engine's internal samplers map if possible, 
    // or just accept it's a singleton. For tests, let's just use it.
  });

  /**
   * Feature: fretboard-theory-workbench, Property 13: Playback sequence correctness
   * Property: the number of notes scheduled matches the input array
   */
  it('should schedule the correct number of notes (Property 13)', async () => {
    const notesArb = fc.array(fc.string(), { minLength: 1, maxLength: 12 });
    const bpmArb = fc.integer({ min: 40, max: 240 });
    
    await fc.assert(
      fc.asyncProperty(notesArb, bpmArb, async (notes, bpm) => {
        const options: PlaybackOptions = {
          bpm,
          mode: 'arpeggio',
          instrument: 'acoustic'
        };

        await playbackEngine.playNotes(notes, options);
        
        const partCall = vi.mocked(Tone.Part).mock.calls[vi.mocked(Tone.Part).mock.calls.length - 1];
        const events = partCall[1] as any[];
        
        expect(events.length).toBe(notes.length);
        
        if (notes.length > 1) {
          const interval = 60 / bpm;
          const timeDiff = events[1].time - events[0].time;
          expect(timeDiff).toBeCloseTo(interval, 5);
        }
        
        playbackEngine.stop();
      }),
      { numRuns: 20 }
    );
  });
});
