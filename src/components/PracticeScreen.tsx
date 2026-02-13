import React from 'react';
import { Play, RotateCcw, Check, SkipForward, Eye, EyeOff, LayoutPanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Chord } from '../types';
import ChordVisualizer from './visualizers/ChordVisualizer';
import { INTERVAL_COLORS, getInterval } from '../constants';

interface PracticeScreenProps {
  score: number;
  totalChords: number;
  showNotes: boolean;
  setShowNotes: (show: boolean) => void;
  showDiagram: boolean;
  setShowDiagram: (show: boolean) => void;
  resetGame: () => void;
  currentChord: Chord | null;
  isTimed: boolean;
  timeRemaining: number;
  timePerChord: number;
  isPlaying: boolean;
  isInstrumentLoading: boolean;
  playChord: () => void;
  markCorrect: () => void;
  nextChord: () => void;
  instrument: string;
}

const PracticeScreen: React.FC<PracticeScreenProps> = ({
  score,
  totalChords,
  showNotes,
  setShowNotes,
  showDiagram,
  setShowDiagram,
  resetGame,
  currentChord,
  isTimed,
  timeRemaining,
  timePerChord,
  isPlaying,
  isInstrumentLoading,
  playChord,
  markCorrect,
  nextChord,
  instrument,
}) => {
  const progressPercentage = (timeRemaining / timePerChord) * 100;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Score</div>
            <div className="text-4xl font-bold text-slate-900 dark:text-white">{score} / {totalChords}</div>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={() => setShowDiagram(!showDiagram)}
              className="flex-1 md:flex-none"
            >
              <LayoutPanelLeft className="mr-2 w-4 h-4" />
              {showDiagram ? 'Hide Diagram' : 'Show Diagram'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowNotes(!showNotes)}
              className="flex-1 md:flex-none"
            >
              {showNotes ? <EyeOff className="mr-2 w-4 h-4" /> : <Eye className="mr-2 w-4 h-4" />}
              {showNotes ? 'Hide Notes' : 'Show Notes'}
            </Button>
            <Button 
              variant="outline" 
              onClick={resetGame}
              className="flex-1 md:flex-none"
            >
              <RotateCcw className="mr-2 w-4 h-4" />
              New Session
            </Button>
          </div>
        </div>

        <Card className="mb-6 w-full">
          <CardContent className="pt-8 md:pt-12 pb-8 md:pb-12">
            <div className="text-center mb-8">
              <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg mb-4">Play this chord:</p>
              <h2 className="text-5xl md:text-8xl font-bold text-slate-900 dark:text-white mb-6 md:mb-8">
                {currentChord?.name}
              </h2>

              {showDiagram && (
                <div className="animate-in fade-in zoom-in duration-300">
                  <ChordVisualizer chord={currentChord} instrument={instrument} />
                </div>
              )}
              
              {showNotes && currentChord && (
                <div className="mb-6 md:mb-8 mt-8">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Notes:</div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {currentChord.noteNames.map((note, i) => {
                      const interval = getInterval(note, currentChord.rootNote);
                      const color = interval !== -1 ? INTERVAL_COLORS[interval] : undefined;
                      return (
                        <span
                          key={i}
                          style={color ? { backgroundColor: color, color: 'white' } : {}}
                          className={`px-4 py-2 ${!color ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : ''} rounded-lg font-mono text-lg shadow-sm`}
                        >
                          {note}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {isTimed && (
                <div className="mb-6 md:mb-8 mt-8 animate-in fade-in duration-300">
                  <div className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
                    {timeRemaining}
                  </div>
                  <Progress value={progressPercentage} className="h-3 max-w-md mx-auto" />
                </div>
              )}
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              <Button
                onClick={playChord}
                disabled={isPlaying || isInstrumentLoading}
                size="lg"
                className="w-full text-lg"
                variant="default"
              >
                <Play className="mr-2 w-5 h-5" />
                {isPlaying ? 'Playing...' : (isInstrumentLoading ? 'Loading...' : 'Play Chord Sound')}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={markCorrect}
                  size="lg"
                  variant="outline"
                  className="text-base"
                >
                  <Check className="mr-2 w-4 h-4" />
                  I Got It!
                </Button>
                <Button
                  onClick={nextChord}
                  size="lg"
                  className="text-base"
                >
                  <SkipForward className="mr-2 w-4 h-4" />
                  Skip
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>How to Practice</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 list-decimal list-inside text-slate-600 dark:text-slate-400">
              <li>A chord name appears with a visual diagram</li>
              <li>Try to play it on your instrument</li>
              <li>Click "Show Notes" if you need a hint about the specific notes</li>
              <li>Click "Play Chord Sound" to hear what it should look like</li>
              <li>Compare it with what you played - were you right?</li>
              <li>Click "I Got It!" if you played it correctly, or "Skip" to move on</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PracticeScreen;
