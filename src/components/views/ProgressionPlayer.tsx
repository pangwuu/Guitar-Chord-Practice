import React from 'react';
import SongAnalyzer from './SongAnalyzer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { PlayCircle } from 'lucide-react';

const ProgressionPlayer: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto p-4 md:p-8 pb-0">
        <div className="flex items-center gap-3 mb-2">
          <PlayCircle className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Progression Player</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Compose and listen to chord progressions. 
          Note: This uses the Song Analyzer engine for analysis.
        </p>
      </div>
      
      <SongAnalyzer />
    </div>
  );
};

export default ProgressionPlayer;
