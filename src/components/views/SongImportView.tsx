import React, { useState } from 'react';
import { 
  PlayCircle, 
  Link as LinkIcon, 
  Search, 
  Youtube, 
  Music, 
  Loader2,
  CheckCircle2,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useTheory } from '../../context/TheoryContext';

const SongImportView: React.FC<{ onAnalyze: () => void }> = ({ onAnalyze }) => {
  const { setChordProgression, setSelectedKey } = useTheory();
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mockSong, setMockSong] = useState<any>(null);

  const handleImport = () => {
    if (!url) return;
    setStatus('loading');

    // Simulate backend lookup
    setTimeout(() => {
      if (url.toLowerCase().includes('spotify') || url.toLowerCase().includes('youtube')) {
        let song = {
          title: 'Hotel California',
          artist: 'Eagles',
          chords: ['Bm', 'F#', 'A', 'E', 'G', 'D', 'Em', 'F#'],
          key: { root: 'B', quality: 'minor' }
        };

        if (url.toLowerCase().includes('let it be')) {
          song = {
            title: 'Let It Be',
            artist: 'The Beatles',
            chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C'],
            key: { root: 'C', quality: 'major' }
          };
        }

        setMockSong(song);
        setStatus('success');
      } else {
        setStatus('error');
      }
    }, 2000);
  };

  const handleSendToAnalyzer = () => {
    if (mockSong) {
      setChordProgression(mockSong.chords);
      setSelectedKey(mockSong.key);
      onAnalyze();
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <PlayCircle className="w-8 h-8 text-indigo-600" />
          Song Import
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">Import chords from Spotify or YouTube URLs.</p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Enter URL</CardTitle>
          <CardDescription>Paste a Spotify track or YouTube video link to find the chords.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <Button 
              onClick={handleImport} 
              disabled={status === 'loading' || !url}
              className="bg-indigo-600 font-bold px-8"
            >
              {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
              Find Chords
            </Button>
          </div>

          <div className="flex gap-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1"><Youtube className="w-3.5 h-3.5" /> YouTube</span>
            <span className="flex items-center gap-1"><Music className="w-3.5 h-3.5" /> Spotify</span>
          </div>
        </CardContent>
      </Card>

      {status === 'error' && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-900/30">
          <CardContent className="p-4 flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">Could not find chords for this URL. Please try a different link or search for "Let It Be".</p>
          </CardContent>
        </Card>
      )}

      {status === 'success' && mockSong && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
          <Card className="border-green-200 bg-green-50/30 dark:bg-green-950/10 dark:border-green-900/30">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Chords Found!</span>
              </div>
              <CardTitle className="text-2xl font-black">{mockSong.title}</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300 font-bold">{mockSong.artist}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {mockSong.chords.map((c: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-sm px-3 py-1 bg-white dark:bg-slate-900">{c}</Badge>
                ))}
              </div>
              <Button onClick={handleSendToAnalyzer} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 text-lg rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all">
                Send to Song Analyzer
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {!mockSong && status !== 'loading' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
          <div className="p-6 border-2 border-dashed rounded-3xl text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
              <Youtube className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-600 dark:text-slate-300">YouTube Search</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Paste any video link to extract chords using our AI detection engine.</p>
          </div>
          <div className="p-6 border-2 border-dashed rounded-3xl text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
              <Music className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-600 dark:text-slate-300">Spotify Lookup</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Connect your account or paste track links to find high-quality chord charts.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SongImportView;
