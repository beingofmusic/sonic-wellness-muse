
// Singleton for sharing AudioContext across components
let audioContext: AudioContext | null = null;

export const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

export const ensureAudioContextRunning = async (): Promise<AudioContext> => {
  const context = getAudioContext();
  
  if (context.state === 'suspended') {
    await context.resume();
  }
  
  return context;
};
