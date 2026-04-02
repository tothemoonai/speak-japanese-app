'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalASR } from '@/plugins/local-asr';
import type { ModelStatus } from '@/plugins/local-asr';
import { useASRStore } from '@/store/asrStore';

interface LocalASRState {
  isAvailable: boolean;
  isInitialized: boolean;
  isRecording: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  modelStatus: ModelStatus | null;
  error: string | null;
  lastResult: string | null;
}

export function useLocalASR() {
  const isAndroid = typeof window !== 'undefined' && Capacitor.getPlatform() === 'android';
  const { localModelType } = useASRStore();

  const [state, setState] = useState<LocalASRState>({
    isAvailable: isAndroid,
    isInitialized: false,
    isRecording: false,
    isDownloading: false,
    downloadProgress: 0,
    modelStatus: null,
    error: null,
    lastResult: null,
  });

  // Track listener handles for cleanup
  const listenerHandles = useRef<import('@capacitor/core').PluginListenerHandle[]>([]);

  // Set up event listeners
  useEffect(() => {
    if (!isAndroid) return;

    const setupListeners = async () => {
      const handles = await Promise.all([
        LocalASR.addListener('asrResult', (event) => {
          setState(prev => ({ ...prev, lastResult: event.text }));
        }),
        LocalASR.addListener('asrError', (event) => {
          setState(prev => ({ ...prev, error: event.message }));
        }),
        LocalASR.addListener('downloadProgress', (event) => {
          setState(prev => ({ ...prev, downloadProgress: event.progress }));
        }),
        LocalASR.addListener('vadState', () => {
          // VAD state can be used for UI feedback
        }),
      ]);
      listenerHandles.current = handles;
    };

    setupListeners();

    return () => {
      listenerHandles.current.forEach(h => h.remove());
    };
  }, [isAndroid]);

  const checkStatus = useCallback(async () => {
    if (!isAndroid) return;
    try {
      const status = await LocalASR.checkModelStatus();
      setState(prev => ({ ...prev, modelStatus: status }));
    } catch (e) {
      console.error('[useLocalASR] checkStatus failed:', e);
    }
  }, [isAndroid]);

  const downloadModel = useCallback(async (type: 'int8' | 'fp32') => {
    if (!isAndroid) return;
    setState(prev => ({ ...prev, isDownloading: true, downloadProgress: 0, error: null }));
    try {
      await LocalASR.downloadModel({ type });
      await checkStatus();
    } catch (e: any) {
      setState(prev => ({ ...prev, error: e.message || 'Download failed' }));
    } finally {
      setState(prev => ({ ...prev, isDownloading: false, downloadProgress: 0 }));
    }
  }, [isAndroid, checkStatus]);

  const deleteModel = useCallback(async (type: 'int8' | 'fp32') => {
    if (!isAndroid) return;
    try {
      await LocalASR.deleteModel({ type });
      await checkStatus();
    } catch (e: any) {
      setState(prev => ({ ...prev, error: e.message || 'Delete failed' }));
    }
  }, [isAndroid, checkStatus]);

  const initialize = useCallback(async () => {
    if (!isAndroid) return false;
    try {
      const result = await LocalASR.initialize({
        modelType: localModelType,
        language: 'ja',
      });
      setState(prev => ({ ...prev, isInitialized: result.success }));
      return result.success;
    } catch (e: any) {
      setState(prev => ({ ...prev, error: e.message }));
      return false;
    }
  }, [isAndroid, localModelType]);

  const release = useCallback(async () => {
    if (!isAndroid) return;
    try {
      await LocalASR.release();
      setState(prev => ({ ...prev, isInitialized: false }));
    } catch (e) {
      console.error('[useLocalASR] release failed:', e);
    }
  }, [isAndroid]);

  const startRecording = useCallback(async () => {
    if (!isAndroid) return;
    try {
      if (!state.isInitialized) {
        const ok = await initialize();
        if (!ok) return;
      }
      await LocalASR.startRecording();
      setState(prev => ({ ...prev, isRecording: true, lastResult: null, error: null }));
    } catch (e: any) {
      setState(prev => ({ ...prev, error: e.message }));
    }
  }, [isAndroid, state.isInitialized, initialize]);

  const stopRecording = useCallback(async () => {
    if (!isAndroid) return;
    try {
      await LocalASR.stopRecording();
      setState(prev => ({ ...prev, isRecording: false }));
    } catch (e: any) {
      setState(prev => ({ ...prev, error: e.message }));
    }
  }, [isAndroid]);

  return {
    state,
    checkStatus,
    downloadModel,
    deleteModel,
    initialize,
    release,
    startRecording,
    stopRecording,
  };
}
