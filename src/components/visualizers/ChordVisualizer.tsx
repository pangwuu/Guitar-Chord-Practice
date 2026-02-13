import React, { useState, useEffect } from 'react';
import { Chord } from '../../types';
import FretboardVisualizer from './FretboardVisualizer';
import PianoVisualizer from './PianoVisualizer';

interface ChordVisualizerProps {
  chord: Chord | null;
  instrument: string;
}

const ChordVisualizer: React.FC<ChordVisualizerProps> = ({ chord, instrument }) => {
  const [activeShapeIdx, setActiveShapeIdx] = useState(0);

  // Reset index when chord changes
  useEffect(() => {
    setActiveShapeIdx(0);
  }, [chord?.name]);

  if (!chord) return null;

  const isPiano = instrument === 'piano';

  return (
    <div className="w-full flex justify-center py-4">
      {isPiano ? (
        <PianoVisualizer 
          notes={chord.notes} 
          chordName={chord.name} 
          useFlats={chord.useFlats} 
          rootNote={chord.rootNote}
        />
      ) : (
        chord.guitarShapes && chord.guitarShapes.length > 0 ? (
          <FretboardVisualizer 
            shapes={chord.guitarShapes} 
            activeIndex={activeShapeIdx}
            onIndexChange={setActiveShapeIdx}
            chordName={chord.name} 
          />
        ) : (
          <div className="text-center p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500">
            Diagram not available for this chord
          </div>
        )
      )}
    </div>
  );
};

export default ChordVisualizer;
