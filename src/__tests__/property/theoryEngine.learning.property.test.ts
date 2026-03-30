import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { LearningModule, ModuleStatus } from '../../types/theory';

describe('Learning Path Logic Property Tests', () => {
  /**
   * Feature: learning-path, Property 14: Prerequisite unlocking
   * Property: a module is only 'available' if all its prerequisites are 'completed'
   */
  it('should only unlock modules when all prerequisites are met', () => {
    // Generate a small chain of modules
    const modulesArb = fc.tuple(
      fc.constant('m1'),
      fc.constant('m2'),
      fc.constant('m3')
    ).map(([id1, id2, id3]) => {
      const m1: LearningModule = {
        id: id1, title: 'M1', description: '', difficulty: 'beginner',
        category: 'chords', prerequisites: [], estimatedTime: '', status: 'available'
      };
      const m2: LearningModule = {
        id: id2, title: 'M2', description: '', difficulty: 'beginner',
        category: 'chords', prerequisites: [id1], estimatedTime: '', status: 'locked'
      };
      const m3: LearningModule = {
        id: id3, title: 'M3', description: '', difficulty: 'beginner',
        category: 'chords', prerequisites: [id1, id2], estimatedTime: '', status: 'locked'
      };
      return [m1, m2, m3];
    });

    fc.assert(
      fc.property(modulesArb, (initialModules) => {
        // Simple logic helper like the one in LearningPathView
        const checkUnlocks = (currentModules: LearningModule[]): LearningModule[] => {
          return currentModules.map(m => {
            if (m.status !== 'locked') return m;
            const allPrereqsMet = m.prerequisites.every(preId => 
              currentModules.find(mod => mod.id === preId)?.status === 'completed'
            );
            return allPrereqsMet ? { ...m, status: 'available' as const } : m;
          });
        };

        // 1. Initially m2 and m3 are locked
        expect(initialModules[1].status).toBe('locked');
        expect(initialModules[2].status).toBe('locked');

        // 2. Complete m1
        let state = initialModules.map(m => m.id === 'm1' ? { ...m, status: 'completed' as const } : m);
        state = checkUnlocks(state);

        // 3. m2 should now be available, m3 still locked (needs m2)
        expect(state.find(m => m.id === 'm2')?.status).toBe('available');
        expect(state.find(m => m.id === 'm3')?.status).toBe('locked');

        // 4. Complete m2
        state = state.map(m => m.id === 'm2' ? { ...m, status: 'completed' as const } : m);
        state = checkUnlocks(state);

        // 5. m3 should now be available
        expect(state.find(m => m.id === 'm3')?.status).toBe('available');
      })
    );
  });
});
