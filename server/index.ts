import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

/**
 * Clean up titles and artists by removing common YouTube noise.
 */
function cleanString(str: string): string {
  return str
    .replace(/\[.*?\]/g, '') 
    .replace(/\(.*?\)/g, '') 
    .replace(/official\s+(music\s+)?video/gi, '')
    .replace(/video\s+clip/gi, '')
    .replace(/lyrics/gi, '')
    .replace(/ft\..*$/gi, '')
    .replace(/feat\..*$/gi, '')
    .replace(/&/g, 'and')
    .replace(/[^\w\s]/gi, '') 
    .replace(/\s+/g, ' ')    
    .trim();
}

/**
 * Extract Artist and Title from Spotify/YouTube URLs.
 */
async function extractMetadata(url: string): Promise<{ title: string; artist: string } | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    let title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
    let description = $('meta[property="og:description"]').attr('content') || '';

    if (!title) return null;

    let artist = 'Unknown Artist';

    if (url.includes('spotify.com')) {
      if (description.includes(' · ')) {
        const parts = description.split(' · ');
        artist = parts[0]; 
      }
    } 
    else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      title = title.replace(' - YouTube', '').trim();
      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        artist = parts[0].trim();
        title = parts[1].trim();
      } else if (title.includes(': ')) {
        const parts = title.split(': ');
        artist = parts[0].trim();
        title = parts[1].trim();
      }
    }

    return { 
      title: cleanString(title), 
      artist: cleanString(artist) 
    };
  } catch (error) {
    console.error('Metadata extraction failed:', error);
    return null;
  }
}

/**
 * Extract unique chord symbols from a raw text block.
 * Handles [ch]Am[/ch] (UG format) or plain text like "Am G C".
 */
function parseChordsFromText(text: string): string[] {
  // 1. Try UG specific format [ch]Am[/ch]
  const ugRegex = /\[ch\](.*?)\[\/ch\]/g;
  const ugChords: string[] = [];
  let match;
  while ((match = ugRegex.exec(text)) !== null) {
    const c = match[1].trim();
    if (c && !ugChords.includes(c)) ugChords.push(c);
  }

  if (ugChords.length > 0) return ugChords;

  // 2. Generic fallback: Look for chord-like words (e.g., Am, G/B, Cmaj7)
  // This looks for uppercase letters followed by optional sharps/flats, quality, and slash bass notes
  const genericRegex = /\b([A-G][#b]?(m|min|maj|dim|aug|sus|add|7|9|11|13)*(\/[A-G][#b]?)?)\b/g;
  const genericChords: string[] = [];
  while ((match = genericRegex.exec(text)) !== null) {
    const c = match[1].trim();
    if (c && !genericChords.includes(c)) {
      // Basic validation: Chord must start with A-G
      genericChords.push(c);
    }
  }

  return genericChords;
}

app.post('/api/extract-metadata', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  console.log(`Extracting metadata for: ${url}`);
  const metadata = await extractMetadata(url);
  
  if (metadata) {
    res.json({ success: true, metadata });
  } else {
    res.status(404).json({ success: false, error: 'Could not extract metadata' });
  }
});

app.post('/api/parse-chords', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  const chords = parseChordsFromText(text);
  res.json({ success: true, chords });
});

app.listen(port, () => {
  console.log(`Metadata & Parser Backend running at http://localhost:${port}`);
});
