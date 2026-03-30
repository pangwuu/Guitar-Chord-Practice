import * as Tone from 'tone';
import { NoteName, PlaybackOptions } from '../types/theory';

const INSTRUMENT_URLS: Record<string, string> = {
  acoustic: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3/',
  electric_clean: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/electric_guitar_clean-mp3/',
  piano: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-mp3/',
};

const SAMPLE_MAP = {
  'A2': 'A2.mp3', 
  'C3': 'C3.mp3', 
  'D#3': 'Eb3.mp3', 
  'F#3': 'Gb3.mp3', 
  'A3': 'A3.mp3', 
  'C4': 'C4.mp3', 
  'D#4': 'Eb4.mp3', 
  'F#4': 'Gb4.mp3', 
  'A4': 'A4.mp3', 
  'C5': 'C5.mp3', 
  'D#5': 'Eb5.mp3', 
  'F#5': 'Gb5.mp3', 
};

class PlaybackEngine {
  private samplers: Map<string, Tone.Sampler> = new Map();
  private activeInstrument: string = 'acoustic';
  private part: Tone.Part | null = null;

  async getSampler(instrument: string): Promise<Tone.Sampler> {
    if (this.samplers.has(instrument)) {
      return this.samplers.get(instrument)!;
    }

    return new Promise((resolve, reject) => {
      const sampler = new Tone.Sampler({
        urls: SAMPLE_MAP,
        baseUrl: INSTRUMENT_URLS[instrument],
        onload: () => {
          this.samplers.set(instrument, sampler);
          resolve(sampler);
        },
        onerror: (err) => reject(err)
      }).toDestination();
    });
  }

  async playNotes(notes: string[], options: PlaybackOptions, onNoteIndex?: (index: number | null) => void) {
    await Tone.start();
    const sampler = await this.getSampler(options.instrument);
    
    if (this.part) {
      this.part.dispose();
    }

    const interval = 60 / options.bpm;
    const events = notes.map((note, i) => ({
      time: i * interval * (options.mode === 'strum' ? 0.05 : 1),
      note,
      index: i
    }));

    this.part = new Tone.Part((time, event) => {
      sampler.triggerAttackRelease(event.note, "2n", time);
      if (onNoteIndex) {
        Tone.Draw.schedule(() => onNoteIndex(event.index), time);
      }
    }, events).start(0);

    Tone.Transport.start();
    
    // Stop after all notes played
    const totalTime = events[events.length - 1].time + interval;
    Tone.Transport.stop(`+${totalTime}`);
    
    if (onNoteIndex) {
      Tone.Transport.schedule(() => {
        onNoteIndex(null);
      }, totalTime);
    }
  }

  stop() {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    if (this.part) {
      this.part.dispose();
      this.part = null;
    }
  }
}

export const playbackEngine = new PlaybackEngine();
