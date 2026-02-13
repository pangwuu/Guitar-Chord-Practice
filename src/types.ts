import { LucideIcon } from 'lucide-react';

export type Difficulty = 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'jazz' | 'custom';

export interface Note {
  name: string;
  pitch: string;
  frequency: number;
}

export interface GuitarChordShape {
  frets: (number | 'x')[]; // e.g. ['x', 3, 2, 0, 1, 0]
  fingers?: (number | null)[]; 
  barre?: number; 
  baseFret?: number; 
  description?: string; 
  rootIndices?: number[]; // indices in the frets array that are root notes
}

export interface ChordData {
  notes: Note[];
  noteNames: string[];
  useFlats?: boolean;
}

export interface Chord extends ChordData {
  name: string;
  guitarShapes: GuitarChordShape[];
  activeShapeIndex: number;
}

export interface Instrument {
  label: string;
  icon: LucideIcon;
  baseUrl: string;
}

export type GameState = 'setup' | 'playing';

export interface DifficultyOption {
  value: Difficulty;
  label: string;
  desc: string;
}
