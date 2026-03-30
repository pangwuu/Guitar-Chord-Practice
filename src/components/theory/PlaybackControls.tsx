import React from 'react';
import { useTheory } from '../../context/TheoryContext';
import { 
  Play, 
  Square, 
  Music, 
  Zap, 
  Layout, 
  Gauge, 
  Volume2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

interface PlaybackControlsProps {
  type: 'scale' | 'chord' | 'progression';
  className?: string;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({ type, className }) => {
  const { 
    playbackOptions, 
    setPlaybackOptions, 
    playbackState, 
    playCurrentScale, 
    playCurrentChord, 
    playProgression, 
    stopPlayback 
  } = useTheory();

  const isPlaying = playbackState.isPlaying;

  const handlePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      if (type === 'scale') playCurrentScale();
      else if (type === 'chord') playCurrentChord();
      else if (type === 'progression') playProgression();
    }
  };

  const setBpm = (val: number[]) => {
    setPlaybackOptions(prev => ({ ...prev, bpm: val[0] }));
  };

  const setInstrument = (inst: 'acoustic' | 'electric_clean' | 'piano') => {
    setPlaybackOptions(prev => ({ ...prev, instrument: inst }));
  };

  const setMode = (mode: 'strum' | 'arpeggio') => {
    setPlaybackOptions(prev => ({ ...prev, mode }));
  };

  return (
    <Card className={cn("overflow-hidden bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800", className)}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              onClick={handlePlay}
              className={cn(
                "w-10 h-10 rounded-full transition-all",
                isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-indigo-600 hover:bg-indigo-700"
              )}
            >
              {isPlaying ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </Button>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Playback</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {isPlaying ? 'Playing...' : `Play ${type.charAt(0).toUpperCase() + type.slice(1)}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            {(['acoustic', 'electric_clean', 'piano'] as const).map((inst) => (
              <Button
                key={inst}
                variant="ghost"
                size="sm"
                onClick={() => setInstrument(inst)}
                className={cn(
                  "h-7 px-2 text-[10px]",
                  playbackOptions.instrument === inst && "bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400"
                )}
              >
                {inst === 'acoustic' && <Volume2 className="w-3 h-3 mr-1" />}
                {inst === 'electric_clean' && <Zap className="w-3 h-3 mr-1" />}
                {inst === 'piano' && <Music className="w-3 h-3 mr-1" />}
                {inst === 'acoustic' ? 'Acoustic' : inst === 'electric_clean' ? 'Electric' : 'Piano'}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Gauge className="w-3 h-3" />
                Tempo: {playbackOptions.bpm} BPM
              </Label>
            </div>
            <Slider
              value={[playbackOptions.bpm]}
              onValueChange={setBpm}
              min={40}
              max={240}
              step={1}
              className="py-2"
            />
          </div>

          {type === 'chord' && (
            <div className="space-y-3">
              <Label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Layout className="w-3 h-3" />
                Style
              </Label>
              <div className="flex gap-2">
                <Button
                  variant={playbackOptions.mode === 'strum' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('strum')}
                  className="flex-1 h-8 text-xs"
                >
                  Strum
                </Button>
                <Button
                  variant={playbackOptions.mode === 'arpeggio' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('arpeggio')}
                  className="flex-1 h-8 text-xs"
                >
                  Arpeggio
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaybackControls;
