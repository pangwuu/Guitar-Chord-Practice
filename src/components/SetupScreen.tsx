import React from 'react';
import { Settings, ChevronRight, Guitar, Zap, Music } from 'lucide-react';
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
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-indigo-600" />
            Chord Trainer
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Master your chord vocabulary and fretboard speed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Configuration</CardTitle>
              <CardDescription>Choose your difficulty and practice parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">Difficulty Level</Label>
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
                <div className="space-y-6 border-t pt-6 animate-in fade-in duration-300">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeInversions"
                      checked={includeInversions}
                      onChange={(e) => onIncludeInversionsChange(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Label htmlFor="includeInversions" className="cursor-pointer font-medium">
                      Include Inversions (Slash Chords)
                    </Label>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Select Chord Types ({selectedCustomChords.length} selected)</Label>
                      <div className="flex gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={selectAll} className="h-7 text-xs">All</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={selectNone} className="h-7 text-xs">None</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md custom-scrollbar bg-slate-50 dark:bg-slate-900">
                      {ALL_CHORD_TYPES.map(type => (
                        <Button
                          key={type}
                          variant={selectedCustomChords.includes(type) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleChord(type)}
                          className="text-[10px] h-7"
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
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <Label htmlFor="isTimed" className="cursor-pointer font-bold">
                    Timed Practice
                  </Label>
                </div>

                {isTimed && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between">
                      <Label className="text-xs">Time per Chord</Label>
                      <span className="text-sm font-bold text-indigo-600">{timePerChord}s</span>
                    </div>
                    <Slider
                      value={[timePerChord]}
                      onValueChange={(value) => onTimeChange(value[0])}
                      min={1}
                      max={45}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Instrument Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(instruments).map(([key, { label, icon: Icon }]) => (
                  <Button
                    key={key}
                    variant={selectedInstrument === key ? "default" : "outline"}
                    onClick={() => onInstrumentChange(key)}
                    className="h-12 flex items-center justify-start px-4 gap-3 font-normal"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{label}</span>
                  </Button>
                ))}
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isLeftHanded" className="text-xs cursor-pointer">Left-Handed Mode</Label>
                  <input
                    type="checkbox"
                    id="isLeftHanded"
                    checked={isLeftHanded}
                    onChange={(e) => onLeftHandedChange(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    disabled={selectedInstrument === 'piano'}
                  />
                </div>
              </div>

              {isInstrumentLoading && (
                <div className="flex items-center gap-2 text-xs text-amber-600 animate-pulse bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-100 dark:border-amber-900/30">
                  <div className="w-2 h-2 rounded-full bg-amber-600" />
                  Loading samples...
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={onStartGame}
            disabled={isInstrumentLoading || (difficulty === 'custom' && selectedCustomChords.length === 0)}
            size="lg"
            className="w-full h-16 text-xl font-black shadow-xl shadow-indigo-200 dark:shadow-none bg-indigo-600 hover:bg-indigo-700"
          >
            {isInstrumentLoading ? 'Loading...' : (
              <>
                START PRACTICE
                <ChevronRight className="ml-2 w-6 h-6" />
              </>
            )}
          </Button>

          <Card className="bg-slate-900 text-white border-none overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest opacity-70">Practice Tip</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed opacity-90">
              Focus on clean notes and efficient finger movements. Speed will come with accuracy!
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
