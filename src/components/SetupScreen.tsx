import React from 'react';
import { Settings, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Instrument, DifficultyOption, Difficulty } from '../types';
import { ALL_CHORD_TYPES } from '../chordGenerator';

interface SetupScreenProps {
  instruments: Record<string, Instrument>;
  selectedInstrument: string;
  onInstrumentChange: (key: string) => void;
  isInstrumentLoading: boolean;
  difficulty: Difficulty;
  onDifficultyChange: (value: Difficulty) => void;
  difficultyOptions: DifficultyOption[];
  selectedCustomChords: string[];
  onCustomChordsChange: (chords: string[]) => void;
  includeInversions: boolean;
  onIncludeInversionsChange: (value: boolean) => void;
  isTimed: boolean;
  onTimedChange: (value: boolean) => void;
  timePerChord: number;
  onTimeChange: (value: number) => void;
  onStartGame: () => void;
  isLeftHanded: boolean;
  onLeftHandedChange: (value: boolean) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({
  instruments,
  selectedInstrument,
  onInstrumentChange,
  isInstrumentLoading,
  difficulty,
  onDifficultyChange,
  difficultyOptions,
  selectedCustomChords,
  onCustomChordsChange,
  includeInversions,
  onIncludeInversionsChange,
  isTimed,
  onTimedChange,
  timePerChord,
  onTimeChange,
  onStartGame,
  isLeftHanded,
  onLeftHandedChange,
}) => {
  const toggleChord = (type: string) => {
    if (selectedCustomChords.includes(type)) {
      onCustomChordsChange(selectedCustomChords.filter(c => c !== type));
    } else {
      onCustomChordsChange([...selectedCustomChords, type]);
    }
  };

  const selectAll = () => onCustomChordsChange([...ALL_CHORD_TYPES]);
  const selectNone = () => onCustomChordsChange([]);

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">Guitar Chord Trainer</h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">Practice identifying and playing chords</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Practice Settings
            </CardTitle>
            <CardDescription>Customize your practice session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            
            <div className="space-y-4">
              <Label>Instrument</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(instruments).map(([key, { label, icon: Icon }]) => (
                  <Button
                    key={key}
                    variant={selectedInstrument === key ? "default" : "outline"}
                    onClick={() => onInstrumentChange(key)}
                    className="h-auto py-3 flex flex-col items-center justify-center text-center"
                  >
                    <Icon className="w-5 h-5 mb-2" />
                    <span className="text-sm">{label}</span>
                  </Button>
                ))}
              </div>
              {selectedInstrument !== 'piano' && (
                <div className="flex items-center space-x-2 mt-4">
                  <input
                    type="checkbox"
                    id="isLeftHanded"
                    checked={isLeftHanded}
                    onChange={(e) => onLeftHandedChange(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isLeftHanded" className="cursor-pointer font-medium">
                    Left-Handed Fretboard
                  </Label>
                </div>
              )}
              {isInstrumentLoading && (
                <p className="text-sm text-amber-600 animate-pulse">
                  Loading instrument samples...
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label>Difficulty Level</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {difficultyOptions.map(({ value, label, desc }) => (
                  <Button
                    key={value}
                    variant={difficulty === value ? "default" : "outline"}
                    className="h-auto py-4 flex flex-col items-start w-full"
                    onClick={() => onDifficultyChange(value)}
                  >
                    <div className="font-bold text-base">{label}</div>
                    <div className="text-xs opacity-80 font-normal">{desc}</div>
                  </Button>
                ))}
              </div>
            </div>

            {difficulty === 'custom' && (
              <div className="space-y-6 border-t pt-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeInversions"
                    checked={includeInversions}
                    onChange={(e) => onIncludeInversionsChange(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="includeInversions" className="cursor-pointer font-medium">
                    Include Inversions (Slash Chords)
                  </Label>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Select Chord Types ({selectedCustomChords.length} selected)</Label>
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={selectAll} >All</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={selectNone}>None</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                    {ALL_CHORD_TYPES.map(type => (
                      <Button
                        key={type}
                        variant={selectedCustomChords.includes(type) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleChord(type)}
                        className="text-xs"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6 border-t pt-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isTimed"
                  checked={isTimed}
                  onChange={(e) => onTimedChange(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isTimed" className="cursor-pointer font-medium text-base">
                  Timed Practice
                </Label>
              </div>

              {isTimed && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <Label>Time per Chord: {timePerChord} seconds</Label>
                  <Slider
                    value={[timePerChord]}
                    onValueChange={(value) => onTimeChange(value[0])}
                    min={1}
                    max={45}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>1s</span>
                    <span>45s</span>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={onStartGame}
              disabled={isInstrumentLoading || (difficulty === 'custom' && selectedCustomChords.length === 0)}
              size="lg"
              className="w-full text-lg"
            >
              {isInstrumentLoading ? 'Loading Sounds...' : (
                <>
                  Start Practice
                  <ChevronRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetupScreen;
