import React, { useState, useEffect } from 'react';
import { useTheory } from '../../context/TheoryContext';
import { parseChordSymbol } from '../../lib/theoryEngine';
import { 
  Search, 
  Trash2, 
  Music, 
  ArrowRight, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import PlaybackControls from '../theory/PlaybackControls';

const SongAnalyzer: React.FC = () => {
  const { 
    chordProgression, 
    setChordProgression, 
    detectedKey, 
    selectedKey, 
    setSelectedKey,
    romanNumerals 
  } = useTheory();

  const [inputValue, setInputValue] = useState(chordProgression.join(' '));

  // Sync input value with context if it changes from outside
  useEffect(() => {
    setInputValue(chordProgression.join(' '));
  }, [chordProgression]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    // Parse chords: split by whitespace, commas, or dashes
    const symbols = val.split(/[\s,\-]+/).filter(s => s.length > 0);
    setChordProgression(symbols);
  };

  const handleClear = () => {
    setInputValue('');
    setChordProgression([]);
    setSelectedKey(null);
  };

  const selectCandidateKey = (root: any, quality: 'major' | 'minor') => {
    setSelectedKey({ root, quality });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Search className="w-8 h-8 text-indigo-600" />
            Song Analyzer
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Analyze chord progressions and Roman numerals</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleClear} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Progression
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input and Key Detection */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">Chord Progression</CardTitle>
              <CardDescription className="text-xs">Enter chords separated by spaces (e.g., "Am F C G")</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={inputValue}
                onChange={handleInputChange}
                className="w-full h-32 p-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all"
                placeholder="C G Am F"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {chordProgression.map((symbol, idx) => {
                  const isValid = parseChordSymbol(symbol) !== null;
                  return (
                    <Badge 
                      key={`${symbol}-${idx}`} 
                      variant={isValid ? "secondary" : "destructive"}
                      className="px-2 py-1 text-sm font-medium"
                    >
                      {symbol}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">Detected Keys</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {detectedKey.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {detectedKey.slice(0, 5).map((candidate, idx) => {
                    const isSelected = selectedKey?.root === candidate.root && selectedKey?.quality === candidate.quality;
                    const confidencePercent = Math.round(candidate.confidence * 100);
                    
                    return (
                      <button
                        key={`${candidate.root}-${candidate.quality}`}
                        onClick={() => selectCandidateKey(candidate.root, candidate.quality)}
                        className={cn(
                          "flex items-center justify-between w-full p-3 rounded-lg border transition-all text-left",
                          isSelected 
                            ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800 ring-1 ring-indigo-500" 
                            : "bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Music className={cn("w-4 h-4", isSelected ? "text-indigo-600" : "text-slate-400")} />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {candidate.root} {candidate.quality}
                            </span>
                            {idx === 0 && !selectedKey && (
                              <span className="ml-2 text-[10px] text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded uppercase font-bold">Suggested</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-500 h-full" 
                              style={{ width: `${confidencePercent}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-500">{confidencePercent}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <Music className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm italic">Enter valid chords to detect key</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="min-h-[400px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Roman Numeral Analysis</CardTitle>
                  <CardDescription>Functional harmony of the progression</CardDescription>
                </div>
                {selectedKey && (
                  <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 dark:bg-indigo-950/30">
                    Key: {selectedKey.root} {selectedKey.quality}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedKey ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                  <Info className="w-12 h-12 mb-4 opacity-20" />
                  <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">Select a Key</h3>
                  <p className="max-w-xs mt-2 text-sm">
                    Select a candidate key from the sidebar to see the harmonic analysis of your progression.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  <PlaybackControls type="progression" />
                  
                  <div className="flex flex-wrap gap-x-8 gap-y-10 justify-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    {romanNumerals.map((rn, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 group">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                          {rn.chord}
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-300 rotate-90 sm:rotate-0" />
                        <div className="relative">
                          <div className={cn(
                            "text-3xl font-black font-serif",
                            rn.numeral === '?' ? "text-slate-300" : "text-indigo-600"
                          )}>
                            {rn.numeral}
                          </div>
                          {rn.isBorrowed && (
                            <Badge className="absolute -top-4 -right-6 text-[8px] px-1 h-4 bg-amber-500 hover:bg-amber-500">Borrowed</Badge>
                          )}
                        </div>
                        <div className="text-[10px] uppercase tracking-tighter font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded mt-1">
                          {rn.function}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-slate-50 dark:bg-slate-900/30 border-none shadow-none">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Diatonic Chords
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Chords that naturally belong to {selectedKey.root} {selectedKey.quality} are 
                          labeled with standard Roman numerals (I, ii, iii, etc.).
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-50 dark:bg-slate-900/30 border-none shadow-none">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          Non-Diatonic Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Chords outside the key are identified as borrowed (from the parallel key) 
                          or secondary/chromatic alterations.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SongAnalyzer;
