'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl?: string | null;
  text?: string; // For TTS
  autoPlay?: boolean;
  onEnded?: () => void;
  label?: string;
}

export function AudioPlayer({
  audioUrl,
  text,
  autoPlay = false,
  onEnded,
  label = '播放音频',
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioUrl && !audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        onEnded?.();
      };
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl, onEnded]);

  useEffect(() => {
    if (autoPlay && audioRef.current && !isPlaying) {
      handlePlay();
    }
  }, [autoPlay]);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  if (!audioUrl && !text) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-4 sm:pt-6">
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          {label && (
            <span className="text-xs sm:text-sm text-muted-foreground">{label}</span>
          )}
          <Button
            size="lg"
            variant={isPlaying ? 'secondary' : 'default'}
            onClick={togglePlay}
            className="w-full sm:w-auto min-w-[100px] sm:w-32"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                暂停
              </>
            ) : (
              <>
                <Play className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                播放
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * TTS Player Component
 * Plays text using text-to-speech
 * Enhanced for Android WebView support
 */
interface TTSPlayerProps {
  text: string;
  lang?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  label?: string;
}

export function TTSPlayer({
  text,
  lang = 'ja-JP',
  autoPlay = false,
  onEnded,
  label = '播放示范',
}: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech synthesis and load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    // Check if voices are available
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setVoicesLoaded(true);
        setIsSupported(true);
      }
    };

    // Load voices immediately
    loadVoices();

    // Also listen for voiceschanged event (important for Android)
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Create utterance when voices are loaded and text changes
  useEffect(() => {
    if (!voicesLoaded || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    // Get Japanese voice if available
    const voices = window.speechSynthesis.getVoices();
    const japaneseVoice = voices.find(voice => voice.lang.startsWith('ja'));
    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [text, lang, voicesLoaded, onEnded]);

  const handlePlay = () => {
    if (utteranceRef.current && isSupported && voicesLoaded) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Speak
      window.speechSynthesis.speak(utteranceRef.current);
    }
  };

  const handleStop = () => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      handleStop();
    } else {
      handlePlay();
    }
  };

  if (!isSupported) {
    return (
      <Card className="w-full">
        <CardContent className="pt-4 sm:pt-6">
          <div className="text-center text-xs sm:text-sm text-muted-foreground">
            您的浏览器不支持语音播放
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!voicesLoaded) {
    return (
      <Card className="w-full">
        <CardContent className="pt-4 sm:pt-6">
          <div className="text-center text-xs sm:text-sm text-muted-foreground">
            正在加载语音...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-4 sm:pt-6">
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          <Volume2 className="h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
          {label && (
            <span className="text-xs sm:text-sm text-muted-foreground">{label}</span>
          )}
          <Button
            size="lg"
            variant={isPlaying ? 'secondary' : 'default'}
            onClick={togglePlay}
            className="w-full sm:w-auto min-w-[100px] sm:w-32"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                暂停
              </>
            ) : (
              <>
                <Play className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                播放
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
