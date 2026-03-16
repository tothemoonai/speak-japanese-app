import { useState, useCallback, useRef, useEffect } from 'react';

export interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string | null;
  error: Error | null;
}

export interface TTSControls {
  speak: (text: string, lang?: string) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
}

export function useTTS() {
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentText: null,
    error: null,
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string, lang: string = 'ja-JP') => {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      setState(prev => ({
        ...prev,
        error: new Error('Speech synthesis is not supported in this browser'),
      }));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Set language
    utterance.lang = lang;

    // Set voice (prefer Japanese voice)
    const voices = window.speechSynthesis.getVoices();
    const japaneseVoice = voices.find(voice => voice.lang.startsWith('ja'));
    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
    }

    // Set pitch and rate
    utterance.pitch = 1.0;
    utterance.rate = 0.9; // Slightly slower for better clarity

    // Event handlers
    utterance.onstart = () => {
      setState(prev => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
        currentText: text,
        error: null,
      }));
    };

    utterance.onend = () => {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        currentText: null,
      }));
    };

    utterance.onerror = (event) => {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        error: new Error(`Speech synthesis error: ${event.error}`),
      }));
    };

    utterance.onpause = () => {
      setState(prev => ({
        ...prev,
        isPaused: true,
      }));
    };

    utterance.onresume = () => {
      setState(prev => ({
        ...prev,
        isPaused: false,
      }));
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
  }, []);

  const pause = useCallback(() => {
    if ('speechSynthesis' in window && state.isPlaying && !state.isPaused) {
      window.speechSynthesis.pause();
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, [state.isPlaying, state.isPaused]);

  const resume = useCallback(() => {
    if ('speechSynthesis' in window && state.isPlaying && state.isPaused) {
      window.speechSynthesis.resume();
      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, [state.isPlaying, state.isPaused]);

  const cancel = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setState({
        isPlaying: false,
        isPaused: false,
        currentText: null,
        error: null,
      });
    }
  }, []);

  const controls: TTSControls = {
    speak,
    pause,
    resume,
    cancel,
  };

  return { state, controls };
}

/**
 * Hook to preload voices (call this on app initialization)
 */
export function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsLoading(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      setIsLoading(false);
    };

    // Load voices immediately
    loadVoices();

    // Voices load asynchronously in some browsers
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  return { voices, isLoading };
}
