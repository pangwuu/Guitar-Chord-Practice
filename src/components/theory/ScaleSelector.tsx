import React from 'react';
import { useTheory } from '../../context/TheoryContext';
import { CHROMATIC_NOTES, ScaleType } from '../../types/theory';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const SCALE_LABELS: Record<ScaleType, string> = {
  major: 'Major',
  natural_minor: 'Natural Minor',
  harmonic_minor: 'Harmonic Minor',
  melodic_minor: 'Melodic Minor',
  pentatonic_major: 'Major Pentatonic',
  pentatonic_minor: 'Minor Pentatonic',
  blues: 'Blues',
  ionian: 'Ionian',
  dorian: 'Dorian',
  phrygian: 'Phrygian',
  lydian: 'Lydian',
  mixolydian: 'Mixolydian',
  aeolian: 'Aeolian',
  locrian: 'Locrian',
};

const ScaleSelector: React.FC = () => {
  const { selectedScale, setSelectedScale } = useTheory();

  const handleRootChange = (root: any) => {
    setSelectedScale({
      root,
      type: selectedScale?.type || 'major',
    });
  };

  const handleTypeChange = (type: ScaleType) => {
    setSelectedScale({
      root: selectedScale?.root || 'C',
      type,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Scale Explorer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Root Note
          </Label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
            {CHROMATIC_NOTES.map((note) => (
              <Button
                key={note}
                variant={selectedScale?.root === note ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRootChange(note)}
                className="h-8 px-0 text-xs"
              >
                {note}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Scale Type
          </Label>
          <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto p-1 border rounded-md">
            {(Object.entries(SCALE_LABELS) as [ScaleType, string][]).map(([type, label]) => (
              <Button
                key={type}
                variant={selectedScale?.type === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTypeChange(type)}
                className="h-8 px-2 text-xs justify-start font-normal"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScaleSelector;
