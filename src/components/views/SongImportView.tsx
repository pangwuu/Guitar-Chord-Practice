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
  AlertCircle,
  Timer,
  ExternalLink,
  ClipboardList
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { useTheory } from '../../context/TheoryContext';

const SongImportView: React.FC<{ onAnalyze: () => void }> = ({ onAnalyze }) => {
  const { setChordProgression } = useTheory();
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'metadata-found'>('idle');
  const [metadata, setMetadata] = useState<{ title: string; artist: string } | null>(null);
  const [chordText, setChordText] = useState('');
  const [extractedChords, setExtractedChords] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleMetadataExtract = async () => {
    if (!url) return;
    setStatus('loading');
    setMetadata(null);
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/extract-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        setMetadata(data.metadata);
        setStatus('metadata-found');
      } else {
        setErrorMessage(data.error || 'Could not find song metadata.');
        setStatus('error');
      }
    } catch (err) {
      console.error('Extraction failed', err);
      setErrorMessage('Network error: Make sure the backend server is running.');
      setStatus('error');
    }
  };

  const handleParseChords = async () => {
    if (!chordText) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/parse-chords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: chordText }),
      });

      const data = await response.json();
      if (data.success && data.chords.length > 0) {
        setExtractedChords(data.chords);
        setStatus('success');
      } else {
        setErrorMessage('No chords found in the text. Try to include the whole page.');
        setStatus('error');
      }
    } catch (err) {
      setErrorMessage('Failed to parse text.');
      setStatus('error');
    }
  };

  const handleSendToAnalyzer = () => {
    if (extractedChords.length > 0) {
      setChordProgression(extractedChords);
      onAnalyze();
    }
  };

  const getUGSearchUrl = () => {
    if (!metadata) return '';
    const query = encodeURIComponent(`${metadata.artist} ${metadata.title} chords`);
    return `https://www.ultimate-guitar.com/search.php?search_type=title&value=${query}`;
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <PlayCircle className="w-8 h-8 text-indigo-600" />
          Song Import
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">Safe, reliable import via copy-paste.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>1. Find Your Song</CardTitle>
              <CardDescription>Paste a Spotify or YouTube URL to identify the track.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Spotify or YouTube URL"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <Button 
                  onClick={handleMetadataExtract} 
                  disabled={status === 'loading' || !url}
                  className="bg-indigo-600 font-bold"
                >
                  {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                  Identify
                </Button>
              </div>

              {metadata && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30 animate-in slide-in-from-top-2">
                   <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Track Identified</p>
                   <p className="text-xl font-black">{metadata.title}</p>
                   <p className="font-bold text-slate-600 dark:text-slate-400">{metadata.artist}</p>
                   <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-900/30">
                     <p className="text-xs text-slate-500 mb-3">Cloudflare blocks automated scraping. Please manually find the chords:</p>
                     <a 
                      href={getUGSearchUrl()} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-indigo-100"
                    >
                      Search Ultimate Guitar
                      <ExternalLink className="w-4 h-4" />
                    </a>
                   </div>
                </div>
              )}
            </CardContent>
          </Card>

          {(status === 'metadata-found' || status === 'success') && (
            <Card className="border-2 animate-in fade-in slide-in-from-top-4">
              <CardHeader>
                <CardTitle>2. Paste Chords</CardTitle>
                <CardDescription>Copy the entire page content from Ultimate Guitar and paste it here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea 
                  value={chordText}
                  onChange={(e) => setChordText(e.target.value)}
                  placeholder="Paste text here..."
                  className="w-full min-h-[200px] p-4 font-mono text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <Button 
                  onClick={handleParseChords} 
                  disabled={!chordText}
                  className="w-full bg-slate-900 text-white hover:bg-slate-800 h-12"
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Extract Chords
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {status === 'success' && extractedChords.length > 0 && (
            <Card className="border-green-200 bg-green-50/30 dark:bg-green-950/10 dark:border-green-900/30 animate-in slide-in-from-right-4">
               <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Detected Chords
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {extractedChords.map((c, i) => (
                    <Badge key={i} variant="secondary" className="bg-white dark:bg-slate-900 border shadow-sm">
                      {c}
                    </Badge>
                  ))}
                </div>
                <Button onClick={handleSendToAnalyzer} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-8 text-xl rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all group">
                  Confirm Chords
                  <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          )}

          {status === 'error' && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
              <CardContent className="p-4 flex items-center gap-3 text-red-600">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-bold">{errorMessage}</p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-slate-900 text-white border-none overflow-hidden relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16" />
             <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest opacity-70">Pro Tip</CardTitle>
            </CardHeader>
            <CardContent className="text-xs leading-relaxed opacity-90">
              On Ultimate Guitar, use CMD+A to select all, then CMD+C to copy. Our parser will filter out the noise for you!
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SongImportView;
