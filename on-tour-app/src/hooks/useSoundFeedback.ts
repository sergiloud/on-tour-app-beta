/**
 * Hook for playing subtle sound effects for user feedback
 * Uses Web Audio API for low-latency, reliable playback
 */

export interface SoundFeedbackOptions {
  enabled?: boolean;
  volume?: number; // 0-1
}

/**
 * Creates a simple oscillator-based sound effect
 * @param frequency - Frequency in Hz (e.g., 800)
 * @param duration - Duration in ms (e.g., 100)
 * @param volume - Volume 0-1 (default 0.3)
 */
function playTone(frequency: number, duration: number, volume: number = 0.3): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (err) {
    console.warn('Sound feedback unavailable:', err);
  }
}

export function useSoundFeedback(options: SoundFeedbackOptions = {}) {
  const { enabled = true, volume = 0.3 } = options;

  return {
    /**
     * Play a confirmation sound (pleasant high-pitched tone)
     */
    playConfirm: () => {
      if (!enabled) return;
      playTone(800, 120, volume);
      setTimeout(() => playTone(1000, 100, volume * 0.8), 80);
    },

    /**
     * Play a click/tap sound (short beep)
     */
    playClick: () => {
      if (!enabled) return;
      playTone(600, 80, volume);
    },

    /**
     * Play a success sound (ascending tones)
     */
    playSuccess: () => {
      if (!enabled) return;
      playTone(400, 100, volume);
      setTimeout(() => playTone(600, 100, volume), 60);
      setTimeout(() => playTone(800, 120, volume), 120);
    },

    /**
     * Play a warning sound (descending tones)
     */
    playWarning: () => {
      if (!enabled) return;
      playTone(800, 100, volume);
      setTimeout(() => playTone(600, 100, volume), 60);
      setTimeout(() => playTone(400, 120, volume), 120);
    },

    /**
     * Play a subtle tick sound for micro-interactions
     */
    playTick: () => {
      if (!enabled) return;
      playTone(500, 40, volume * 0.6);
    },
  };
}

export default useSoundFeedback;
