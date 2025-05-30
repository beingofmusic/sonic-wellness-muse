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

export type ChordType = 'major' | 'minor' | 'diminished' | 'augmented';

export interface DroneOptions {
  rootNote: string;
  playChord: boolean;
  chordType: ChordType;
}

export class DroneGenerator {
  private audioContext: AudioContext;
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private isPlaying: boolean = false;
  private rootNote: string;
  private playChord: boolean;
  private chordType: ChordType;
  private transitionTimer: NodeJS.Timeout | null = null;
  
  constructor(options: DroneOptions) {
    this.audioContext = getAudioContext();
    this.rootNote = options.rootNote;
    this.playChord = options.playChord;
    this.chordType = options.chordType || 'major';
  }

  async start() {
    await ensureAudioContextRunning();
    
    // If already playing, we'll keep it playing and just update the notes
    if (!this.isPlaying) {
      this.isPlaying = true;
    }
    
    this.generateDrone();
  }

  private generateDrone() {
    // Clear any existing oscillators first
    this.clearCurrentOscillators();
    
    // Create oscillators based on options
    if (this.playChord) {
      // Play chord based on selected chord type
      this.playNote(this.rootNote, 0.2); // Root
      
      switch (this.chordType) {
        case 'major':
          this.playInterval(this.rootNote, 4, 0.15); // Major 3rd (4 semitones)
          this.playInterval(this.rootNote, 7, 0.15); // Perfect 5th (7 semitones)
          break;
        case 'minor':
          this.playInterval(this.rootNote, 3, 0.15); // Minor 3rd (3 semitones)
          this.playInterval(this.rootNote, 7, 0.15); // Perfect 5th (7 semitones)
          break;
        case 'diminished':
          this.playInterval(this.rootNote, 3, 0.15); // Minor 3rd (3 semitones)
          this.playInterval(this.rootNote, 6, 0.15); // Diminished 5th (6 semitones)
          break;
        case 'augmented':
          this.playInterval(this.rootNote, 4, 0.15); // Major 3rd (4 semitones)
          this.playInterval(this.rootNote, 8, 0.15); // Augmented 5th (8 semitones)
          break;
        default:
          this.playInterval(this.rootNote, 4, 0.15); // Default to major (4 semitones)
          this.playInterval(this.rootNote, 7, 0.15); // Perfect 5th (7 semitones)
      }
    } else {
      // Play just the root note
      this.playNote(this.rootNote, 0.3);
    }
  }
  
  // New method to safely clear current oscillators without stopping playback
  private clearCurrentOscillators() {
    // Cancel any pending transition timer
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }
    
    // Stop and disconnect all current oscillators and gain nodes
    const now = this.audioContext.currentTime;
    
    // Quick fade out to avoid clicks/pops
    this.gainNodes.forEach(gainNode => {
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    });
    
    // Stop oscillators after the short fade
    this.oscillators.forEach(osc => {
      try {
        // Schedule stopping after the short fade to avoid clicks
        osc.stop(now + 0.06);
        // We'll disconnect after stopping
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    
    // Clear arrays right away so new oscillators can be created immediately
    this.oscillators = [];
    this.gainNodes = [];
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
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
    }
    
    this.transitionTimer = setTimeout(() => {
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
      this.transitionTimer = null;
    }, 600);
    
    this.isPlaying = false;
  }

  updateOptions(options: Partial<DroneOptions>) {
    let optionsChanged = false;
    
    if (options.rootNote !== undefined && options.rootNote !== this.rootNote) {
      this.rootNote = options.rootNote;
      optionsChanged = true;
    }
    
    if (options.playChord !== undefined && options.playChord !== this.playChord) {
      this.playChord = options.playChord;
      optionsChanged = true;
    }
    
    if (options.chordType !== undefined && options.chordType !== this.chordType) {
      this.chordType = options.chordType;
      optionsChanged = true;
    }
    
    // If we're playing and options changed, update the drone sound
    // without stopping/restarting the entire audio context
    if (optionsChanged && this.isPlaying) {
      this.generateDrone();
    }
    
    // If we're not playing but have a root note and options changed, start
    if (this.rootNote && !this.isPlaying && optionsChanged) {
      this.start();
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
  
  private playInterval(rootNote: string, semitones: number, volume: number) {
    // Calculate note at given interval from root
    const notes = Object.keys(NOTE_FREQUENCIES);
    const rootIndex = notes.indexOf(rootNote);
    if (rootIndex === -1) return;
    
    const targetIndex = (rootIndex + semitones) % notes.length;
    this.playNote(notes[targetIndex], volume);
  }
  
  isActive(): boolean {
    return this.isPlaying;
  }
  
  getRootNote(): string {
    return this.rootNote;
  }
  
  getChordType(): ChordType {
    return this.chordType;
  }
}
