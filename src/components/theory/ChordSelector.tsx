import React from 'react';
import { useTheory } from '../../context/TheoryContext';
import { CHROMATIC_NOTES, ChordQuality } from '../../types/theory';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const CHORD_LABELS: Record<ChordQuality, string> = {
  major: 'Major',
  minor: 'Minor',
  diminished: 'Diminished',
  augmented: 'Augmented',
  dom7: 'Dominant 7th',
  maj7: 'Major 7th',
  min7: 'Minor 7th',
  min7b5: 'Half-Diminished 7th',
  dim7: 'Diminished 7th',
  sus2: 'Suspended 2nd',
  sus4: 'Suspended 4th',
  add9: 'Add 9',
  '6': 'Major 6th',
  m6: 'Minor 6th',
  '9': 'Dominant 9th',
  min9: 'Minor 9th',
  maj9: 'Major 9th',
  '7sharp9': '7#9 (Hendrix)',
  maj7sharp11: 'Major 7#11',
  '7alt': '7alt (Altered)',
  '13': 'Dominant 13th',
};

const ChordSelector: React.FC = () => {
  const { selectedChord, setSelectedChord } = useTheory();

  const handleRootChange = (root: any) => {
    setSelectedChord({
      root,
      quality: selectedChord?.quality || 'major',
    });
  };

  const handleQualityChange = (quality: ChordQuality) => {
    setSelectedChord({
      root: selectedChord?.root || 'C',
      quality,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Chord Explorer</CardTitle>
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
                variant={selectedChord?.root === note ? 'default' : 'outline'}
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
            Chord Quality
          </Label>
          <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto p-1 border rounded-md">
            {(Object.entries(CHORD_LABELS) as [ChordQuality, string][]).map(([quality, label]) => (
              <Button
                key={quality}
                variant={selectedChord?.quality === quality ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQualityChange(quality)}
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

export default ChordSelector;
