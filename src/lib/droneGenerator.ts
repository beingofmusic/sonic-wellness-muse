
import { getAudioContext, ensureAudioContextRunning } from "./audioContext";

// Note frequencies in Hz (A4 = 440Hz)
const NOTE_FREQUENCIES: Record<string, number> = {
  'A': 440.00,
  'A#': 466.16,
  'B': 493.88,
  'C': 523.25,
  'C#': 554.37,
  'D': 587.33,
  'D#': 622.25,
  'E': 659.25,
  'F': 698.46,
  'F#': 739.99,
  'G': 783.99,
  'G#': 830.61,
};

export interface DroneOptions {
  rootNote: string;
  playChord: boolean;
}

export class DroneGenerator {
  private audioContext: AudioContext;
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private isPlaying: boolean = false;
  private rootNote: string;
  private playChord: boolean;
  
  constructor(options: DroneOptions) {
    this.audioContext = getAudioContext();
    this.rootNote = options.rootNote;
    this.playChord = options.playChord;
  }

  async start() {
    if (this.isPlaying) {
      this.stop();
      return;
    }
    
    await ensureAudioContextRunning();
    this.isPlaying = true;
    
    // Create oscillators based on options
    if (this.playChord) {
      // Play a major triad: root, major third (4 semitones up), perfect fifth (7 semitones up)
      this.playNote(this.rootNote, 0.2); // Root
      this.playMajorThird(this.rootNote, 0.15); // Third
      this.playPerfectFifth(this.rootNote, 0.15); // Fifth
    } else {
      // Play just the root note
      this.playNote(this.rootNote, 0.3);
    }
  }

  stop() {
    if (!this.isPlaying) return;
    
    const now = this.audioContext.currentTime;
    
    // Fade out all oscillators
    this.gainNodes.forEach(gainNode => {
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    });
    
    // Stop all oscillators after fade out
    setTimeout(() => {
      this.oscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {
          // Oscillator might already be stopped
        }
      });
      
      this.oscillators = [];
      this.gainNodes = [];
    }, 600);
    
    this.isPlaying = false;
  }

  updateOptions(options: Partial<DroneOptions>) {
    let shouldRestart = false;
    
    if (options.rootNote !== undefined && options.rootNote !== this.rootNote) {
      this.rootNote = options.rootNote;
      shouldRestart = true;
    }
    
    if (options.playChord !== undefined && options.playChord !== this.playChord) {
      this.playChord = options.playChord;
      shouldRestart = true;
    }
    
    // Restart with new options if currently playing
    if (shouldRestart && this.isPlaying) {
      this.stop();
      setTimeout(() => this.start(), 100); // Small delay to ensure clean transition
    }
  }
  
  private playNote(note: string, volume: number) {
    const frequency = NOTE_FREQUENCIES[note];
    if (!frequency) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    
    gainNode.gain.value = 0;
    gainNode.connect(this.audioContext.destination);
    
    // Fade in
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.exponentialRampToValueAtTime(volume, now + 0.1);
    
    oscillator.start();
    
    this.oscillators.push(oscillator);
    this.gainNodes.push(gainNode);
  }
  
  private playMajorThird(rootNote: string, volume: number) {
    // Major third is 4 semitones up from root
    const notes = Object.keys(NOTE_FREQUENCIES);
    const rootIndex = notes.indexOf(rootNote);
    if (rootIndex === -1) return;
    
    const thirdIndex = (rootIndex + 4) % notes.length;
    this.playNote(notes[thirdIndex], volume);
  }
  
  private playPerfectFifth(rootNote: string, volume: number) {
    // Perfect fifth is 7 semitones up from root
    const notes = Object.keys(NOTE_FREQUENCIES);
    const rootIndex = notes.indexOf(rootNote);
    if (rootIndex === -1) return;
    
    const fifthIndex = (rootIndex + 7) % notes.length;
    this.playNote(notes[fifthIndex], volume);
  }
  
  isActive(): boolean {
    return this.isPlaying;
  }
}
