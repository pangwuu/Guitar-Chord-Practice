import React, { useState } from 'react';
import FretboardWorkbench from './FretboardWorkbench';
import ScaleSelector from './ScaleSelector';
import ChordSelector from './ChordSelector';
import PlaybackControls from './PlaybackControls';
import { Button } from '../ui/button';
import { Music, Layout, Settings } from 'lucide-react';
import { useTheory } from '../../context/TheoryContext';

const TheoryDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scale' | 'chord'>('scale');
  const { tuning, setTuning, isLeftHanded, setIsLeftHanded } = useTheory();

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Theory Workbench</h1>
          <p className="text-slate-500 dark:text-slate-400">Explore scales, chords and the fretboard</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <Button
            variant={activeTab === 'scale' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('scale')}
            className="flex items-center gap-2"
          >
            <Music className="w-4 h-4" />
            Scales
          </Button>
          <Button
            variant={activeTab === 'chord' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('chord')}
            className="flex items-center gap-2"
          >
            <Layout className="w-4 h-4" />
            Chords
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FretboardWorkbench />
          
          <PlaybackControls type={activeTab} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Workbench Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Left-Handed Mode</span>
                  <input
                    type="checkbox"
                    checked={isLeftHanded}
                    onChange={(e) => setIsLeftHanded(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                {/* More settings can go here */}
              </div>
            </div>
            
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold mb-4 text-slate-900 dark:text-white">About the Workbench</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Use the controls to select a root note and scale/chord type. The fretboard will update 
                to show all positions. You can toggle between viewing Note Names or Intervals relative 
                to the root.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {activeTab === 'scale' ? <ScaleSelector /> : <ChordSelector />}
        </div>
      </div>
    </div>
  );
};

export default TheoryDashboard;
