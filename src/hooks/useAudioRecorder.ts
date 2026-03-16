import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  duration: number;
  error: Error | null;
}

export interface AudioRecorderControls {
  startRecording: () => void;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
}

export function useAudioRecorder() {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    audioBlob: null,
    audioUrl: null,
    duration: 0,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - pausedTimeRef.current;
    timerIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        setState(prev => ({ ...prev, duration: Math.floor(elapsed / 1000) }));
      }
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    // Prevent starting if already recording
    if (state.isRecording) {
      return;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle stop event
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setState(prev => ({
          ...prev,
          audioBlob,
          audioUrl,
          isRecording: false,
        }));
      };

      // Start recording
      mediaRecorder.start();
      startTimer();

      setState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        error: null,
        duration: 0,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
      }));
    }
  }, [startTimer, state.isRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      stopTimer();
      pausedTimeRef.current = 0;

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      setState(prev => ({
        ...prev,
        isRecording: false,
        isPaused: false,
      }));
    }
  }, [state.isRecording, stopTimer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause();
      stopTimer();
      if (startTimeRef.current) {
        pausedTimeRef.current += Date.now() - startTimeRef.current;
      }

      setState(prev => ({
        ...prev,
        isPaused: true,
      }));
    }
  }, [state.isRecording, state.isPaused, stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
      mediaRecorderRef.current.resume();
      startTimer();

      setState(prev => ({
        ...prev,
        isPaused: false,
      }));
    }
  }, [state.isRecording, state.isPaused, startTimer]);

  const resetRecording = useCallback(() => {
    // Stop recording if in progress
    if (state.isRecording) {
      stopRecording();
    }

    // Revoke URL to free memory
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    // Reset state
    setState({
      isRecording: false,
      isPaused: false,
      audioBlob: null,
      audioUrl: null,
      duration: 0,
      error: null,
    });
    pausedTimeRef.current = 0;
  }, [state.isRecording, state.audioUrl, stopRecording]);

  const controls: AudioRecorderControls = {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  };

  return { state, controls };
}
