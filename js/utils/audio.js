// Audio Manager
// Handles sound effect preloading and playback

import RouletteConfig from '../config/roulette-config.js';
import gameState from '../core/game-state.js';

class AudioManager {
  constructor() {
    this.sounds = {};
    this.enabled = gameState.getSetting('soundEnabled', RouletteConfig.sounds.enabled);
    this.volume = RouletteConfig.sounds.volume;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      // Preload all sounds
      const soundFiles = RouletteConfig.sounds.files;

      for (const [name, path] of Object.entries(soundFiles)) {
        try {
          this.sounds[name] = new Audio(path);
          this.sounds[name].volume = this.volume;
          this.sounds[name].preload = 'auto';

          // Load the sound
          await new Promise((resolve, reject) => {
            this.sounds[name].addEventListener('canplaythrough', resolve, { once: true });
            this.sounds[name].addEventListener('error', reject, { once: true });
            this.sounds[name].load();
          });
        } catch (err) {
          console.warn(`Failed to load sound: ${name}`, err);
          // Create a silent fallback
          this.sounds[name] = { play: () => Promise.resolve(), pause: () => {}, currentTime: 0 };
        }
      }

      this.initialized = true;
    } catch (err) {
      console.error('Failed to initialize audio:', err);
    }
  }

  play(soundName) {
    if (!this.enabled) return Promise.resolve();
    if (!this.sounds[soundName]) {
      console.warn(`Sound not found: ${soundName}`);
      return Promise.resolve();
    }

    try {
      const sound = this.sounds[soundName];
      sound.currentTime = 0;
      return sound.play().catch(err => {
        console.warn(`Failed to play sound: ${soundName}`, err);
      });
    } catch (err) {
      console.warn(`Error playing sound: ${soundName}`, err);
      return Promise.resolve();
    }
  }

  stop(soundName) {
    if (!this.sounds[soundName]) return;

    try {
      const sound = this.sounds[soundName];
      sound.pause();
      sound.currentTime = 0;
    } catch (err) {
      console.warn(`Error stopping sound: ${soundName}`, err);
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    gameState.setSetting('soundEnabled', enabled);
  }

  isEnabled() {
    return this.enabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));

    Object.values(this.sounds).forEach(sound => {
      if (sound.volume !== undefined) {
        sound.volume = this.volume;
      }
    });
  }

  getVolume() {
    return this.volume;
  }

  // Convenience methods for specific sounds
  playChip() {
    return this.play('chip');
  }

  playSpin() {
    return this.play('spin');
  }

  playWin() {
    return this.play('win');
  }

  playLose() {
    return this.play('lose');
  }

  stopSpin() {
    this.stop('spin');
  }
}

// Export singleton instance
const audioManager = new AudioManager();
export default audioManager;
