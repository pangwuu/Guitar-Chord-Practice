import { LearningModule } from '../types/theory';

export const INITIAL_LEARNING_PATH: LearningModule[] = [
  {
    id: 'intro-chords-1',
    title: 'Your First Chords',
    description: 'Master the E Major and A Major open chords.',
    difficulty: 'beginner',
    category: 'chords',
    prerequisites: [],
    estimatedTime: '15 mins',
    status: 'available',
    content: {
      text: 'Start your journey with two of the most common chords on guitar.',
      targetChords: ['E', 'A']
    }
  },
  {
    id: 'intro-chords-2',
    title: 'The G and C Connection',
    description: 'Learn the G Major and C Major open chords and how to switch between them.',
    difficulty: 'beginner',
    category: 'chords',
    prerequisites: ['intro-chords-1'],
    estimatedTime: '20 mins',
    status: 'locked',
    content: {
      text: 'G and C are often used together in thousands of songs.',
      targetChords: ['G', 'C']
    }
  },
  {
    id: 'minor-basics',
    title: 'The Sad Chords: Minor Triads',
    description: 'Introduction to Am, Em, and Dm.',
    difficulty: 'beginner',
    category: 'chords',
    prerequisites: ['intro-chords-1'],
    estimatedTime: '15 mins',
    status: 'locked',
    content: {
      text: 'Minor chords add emotion and variety to your playing.',
      targetChords: ['Am', 'Em', 'Dm']
    }
  },
  {
    id: 'major-scale-intro',
    title: 'The Major Scale Foundation',
    description: 'Understand the construction of the Major Scale (W-W-H-W-W-W-H).',
    difficulty: 'intermediate',
    category: 'theory',
    prerequisites: ['intro-chords-2'],
    estimatedTime: '30 mins',
    status: 'locked',
    content: {
      text: 'The Major Scale is the yardstick by which all other theory is measured.',
      targetScale: { root: 'C', type: 'major' }
    }
  },
  {
    id: 'caged-basics',
    title: 'Unlocking the Neck: CAGED',
    description: 'Introduction to the 5 focal shapes of the CAGED system.',
    difficulty: 'intermediate',
    category: 'theory',
    prerequisites: ['major-scale-intro'],
    estimatedTime: '45 mins',
    status: 'locked',
    content: {
      text: 'Connect the open chords you know to the rest of the fretboard.',
      targetChords: ['C', 'A', 'G', 'E', 'D']
    }
  }
];
