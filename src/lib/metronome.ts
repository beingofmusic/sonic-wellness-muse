
import { getAudioContext, ensureAudioContextRunning } from "./audioContext";

export interface MetronomeOptions {
  tempo: number;
  timeSignature: "2/4" | "3/4" | "4/4";
}

export class Metronome {
  private audioContext: AudioContext;
  private intervalId: number | null = null;
  private currentBeat: number = 0;
  private tempo: number;
  private beatsPerMeasure: number;
  private isPlaying: boolean = false;
  
  constructor(options: MetronomeOptions) {
    this.audioContext = getAudioContext();
    this.tempo = options.tempo;
    
    // Extract number of beats from time signature
    const [beats] = options.timeSignature.split('/').map(Number);
    this.beatsPerMeasure = beats;
  }

  start() {
    if (this.isPlaying) return;
    
    ensureAudioContextRunning();
    this.isPlaying = true;
    this.currentBeat = 0;
    
    // Calculate interval in milliseconds from tempo (beats per minute)
    const interval = (60 / this.tempo) * 1000;
    
    this.intervalId = window.setInterval(() => {
      this.playClick(this.currentBeat === 0);
      
      // Increment beat and reset when we reach the end of the measure
      this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure;
    }, interval);
  }

  stop() {
    if (!this.isPlaying) return;
    
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isPlaying = false;
    this.currentBeat = 0;
  }

  updateTempo(newTempo: number) {
    this.tempo = newTempo;
    
    // Restart with new tempo if currently playing
    if (this.isPlaying) {
      this.stop();
      this.start();
    }
  }

  updateTimeSignature(newTimeSignature: "2/4" | "3/4" | "4/4") {
    const [beats] = newTimeSignature.split('/').map(Number);
    this.beatsPerMeasure = beats;
    
    // Reset current beat to avoid out-of-range issues
    this.currentBeat = 0;
  }

  private playClick(isAccented: boolean) {
    // Create oscillator for click sound
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Connect oscillator to gain node and gain node to destination
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Set oscillator properties - higher frequency for accented beat
    oscillator.frequency.value = isAccented ? 1000 : 800;
    
    // Set volume - louder for accented beat
    gainNode.gain.value = isAccented ? 0.4 : 0.2;
    
    // Schedule envelope for click sound
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    // Start and stop oscillator
    oscillator.start();
    oscillator.stop(now + 0.1);
  }
  
  isActive(): boolean {
    return this.isPlaying;
  }
}
