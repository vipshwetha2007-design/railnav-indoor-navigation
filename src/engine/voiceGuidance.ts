/**
 * Voice guidance engine using Web Speech Synthesis API
 * Features human pacing, intelligent queueing, active speech state tracking, and replay.
 */

export type VoiceStatusSubscriber = (isSpeaking: boolean) => void;

export interface SpeakOptions {
  force?: boolean;
  priority?: 'urgent' | 'normal';
  rate?: number;
  onEnd?: () => void;
}

class VoiceGuidanceEngine {
  private isMuted: boolean = false;
  private lastAnnouncedText: string = '';
  private lastSpokenTimestamp: number = 0;
  private isSpeaking: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private subscribers: Set<VoiceStatusSubscriber> = new Set();
  private speechQueue: { text: string; force?: boolean; rate?: number; onEnd?: () => void }[] = [];
  private watchdogTimer: number | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Warm up voices
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }

  public subscribe(callback: VoiceStatusSubscriber): () => void {
    this.subscribers.add(callback);
    callback(this.isSpeaking);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.subscribers.forEach((cb) => cb(this.isSpeaking));
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getLastAnnouncedText(): string {
    return this.lastAnnouncedText;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.stop();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public speak(text: string, options: SpeakOptions | boolean = {}): void {
    if (this.isMuted || !text) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Support legacy speak(text, force) boolean argument
    const opts: SpeakOptions = typeof options === 'boolean' ? { force: options } : options;
    const { force = false, priority = 'normal', rate = 0.95, onEnd } = opts;

    const trimmed = text.trim();
    if (!trimmed) {
      if (onEnd) onEnd();
      return;
    }

    // Deduplication check: do not repeat exact same text unless explicitly forced
    if (!force && trimmed === this.lastAnnouncedText) {
      if (onEnd) onEnd();
      return;
    }

    // If urgent priority (emergency alert, platform change, closure), clear queue and speak immediately
    if (priority === 'urgent' || force) {
      this.speechQueue = [];
      this.executeSpeak(trimmed, rate, onEnd);
      return;
    }

    // If currently speaking a normal turn, do not cut off mid-word
    if (this.isSpeaking) {
      // Retain only the freshest turn instruction in the queue
      this.speechQueue = [{ text: trimmed, force, rate, onEnd }];
      return;
    }

    this.executeSpeak(trimmed, rate, onEnd);
  }

  private executeSpeak(text: string, rate: number = 0.95, onEndCallback?: () => void): void {
    try {
      if (this.watchdogTimer) {
        window.clearTimeout(this.watchdogTimer);
        this.watchdogTimer = null;
      }

      window.speechSynthesis.cancel();

      this.lastAnnouncedText = text;
      this.lastSpokenTimestamp = Date.now();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate; // Paced speech for clear station comprehension
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Retain utterance on global window object to prevent Chromium GC cancellation bug
      if (typeof window !== 'undefined') {
        (window as unknown as Record<string, unknown>).__railnav_speech_utterance = utterance;
      }

      // Select most natural English voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find(
          (v) =>
            (v.lang.startsWith('en') || v.lang.includes('US') || v.lang.includes('GB')) &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Enhanced') ||
              v.name.includes('Samantha') ||
              v.name.includes('Alex'))
        ) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Estimated duration fallback watchdog timer (average 2.5 words/sec)
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      const expectedDurationMs = Math.max(2000, Math.round((wordCount / (2.2 * rate)) * 1000));
      this.watchdogTimer = window.setTimeout(() => {
        if (this.isSpeaking) {
          this.isSpeaking = false;
          this.notifyListeners();
          if (onEndCallback) {
            try { onEndCallback(); } catch (err) { console.error(err); }
          }
        }
      }, expectedDurationMs + 2000);

      const finishSpeech = () => {
        if (this.watchdogTimer) {
          window.clearTimeout(this.watchdogTimer);
          this.watchdogTimer = null;
        }
        this.isSpeaking = false;
        this.notifyListeners();

        if (onEndCallback) {
          try { onEndCallback(); } catch (err) { console.error(err); }
        }

        // Process queued instruction if one was waiting
        if (this.speechQueue.length > 0) {
          const next = this.speechQueue.shift();
          if (next && !this.isMuted) {
            window.setTimeout(() => {
              this.executeSpeak(next.text, next.rate ?? 0.95, next.onEnd);
            }, 300); // Natural pause between instructions
          }
        }
      };

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.notifyListeners();
      };

      utterance.onend = finishSpeech;
      utterance.onerror = (e) => {
        finishSpeech();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      this.isSpeaking = false;
      this.notifyListeners();
      if (onEndCallback) {
        try { onEndCallback(); } catch (err) { console.error(err); }
      }
    }
  }

  public replayLast(): void {
    if (this.lastAnnouncedText && !this.isMuted) {
      this.speak(this.lastAnnouncedText, { force: true });
    }
  }

  public stop(): void {
    if (this.watchdogTimer) {
      window.clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
    this.speechQueue = [];
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.notifyListeners();
    }
  }
}

export const voiceGuidance = new VoiceGuidanceEngine();
