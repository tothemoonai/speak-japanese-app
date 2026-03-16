import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Create WAV file buffer with proper header
 * @param pcmData - Raw PCM data as ArrayBuffer
 * @param sampleRate - Sample rate (e.g., 16000)
 * @param numChannels - Number of audio channels (1 = mono, 2 = stereo)
 * @returns WAV file as ArrayBuffer
 */
function createWavBuffer(pcmData: ArrayBuffer, sampleRate: number, numChannels: number): ArrayBuffer {
  const pcmView = new Int16Array(pcmData);
  const numSamples = pcmView.length;
  const bytesPerSample = 2; // 16-bit = 2 bytes

  // WAV file size = header (44 bytes) + data size
  const bufferSize = 44 + pcmData.byteLength;
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // Helper functions to write data
  let pos = 0;
  const writeString = (str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(pos, str.charCodeAt(i));
      pos++;
    }
  };

  const writeUint32 = (value: number) => {
    view.setUint32(pos, value, true); // little-endian
    pos += 4;
  };

  const writeUint16 = (value: number) => {
    view.setUint16(pos, value, true); // little-endian
    pos += 2;
  };

  const writeInt16 = (value: number) => {
    view.setInt16(pos, value, true); // little-endian
    pos += 2;
  };

  // Write WAV header
  // RIFF chunk
  writeString('RIFF');              // ChunkID
  writeUint32(bufferSize - 8);      // ChunkSize
  writeString('WAVE');              // Format

  // fmt sub-chunk
  writeString('fmt ');              // Subchunk1ID
  writeUint32(16);                  // Subchunk1Size (16 for PCM)
  writeUint16(1);                   // AudioFormat (1 = PCM)
  writeUint16(numChannels);         // NumChannels
  writeUint32(sampleRate);          // SampleRate
  writeUint32(sampleRate * numChannels * bytesPerSample); // ByteRate
  writeUint16(numChannels * bytesPerSample); // BlockAlign
  writeUint16(16);                  // BitsPerSample

  // data sub-chunk
  writeString('data');              // Subchunk2ID
  writeUint32(pcmData.byteLength);  // Subchunk2Size

  // Write PCM data
  for (let i = 0; i < numSamples; i++) {
    writeInt16(pcmView[i]);
  }

  return buffer;
}


export interface PCMRecorderState {
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  duration: number;
  error: Error | null;
}

export interface PCMRecorderControls {
  startRecording: () => void;
  stopRecording: () => void;
  resetRecording: () => void;
}

/**
 * PCM录音Hook
 * 使用Web Audio API录制16-bit PCM音频（16kHz采样率）
 * 适用于阿里云ASR等需要PCM格式的服务
 */
export function usePCMRecorder() {
  const [state, setState] = useState<PCMRecorderState>({
    isRecording: false,
    audioBlob: null,
    audioUrl: null,
    duration: 0,
    error: null,
  });

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioDataRef = useRef<Float32Array[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
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

      // Create audio context with 16kHz sample rate for PCM recording
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      // Create audio source from stream
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Create script processor for capturing audio data
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // Clear previous audio data
      audioDataRef.current = [];

      // Handle audio process
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        audioDataRef.current.push(new Float32Array(inputData));
      };

      // Connect the audio graph
      source.connect(processor);
      processor.connect(audioContext.destination);

      // Start timer
      startTimer();

      setState(prev => ({
        ...prev,
        isRecording: true,
        error: null,
        duration: 0,
        audioBlob: null,
        audioUrl: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
      }));
    }
  }, [state.isRecording, startTimer]);

  const stopRecording = useCallback(() => {
    if (state.isRecording) {
      stopTimer();

      // Disconnect audio nodes
      if (processorRef.current) {
        processorRef.current.disconnect();
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Convert audio data to PCM 16-bit WAV format
      if (audioDataRef.current.length > 0) {
        // Calculate total length
        const totalLength = audioDataRef.current.reduce((acc, data) => acc + data.length, 0);
        const merged = new Float32Array(totalLength);
        let offset = 0;
        for (const data of audioDataRef.current) {
          merged.set(data, offset);
          offset += data.length;
        }

        // Convert to 16-bit PCM
        const pcmData = new Int16Array(merged.length);
        for (let i = 0; i < merged.length; i++) {
          pcmData[i] = Math.max(-32768, Math.min(32767, merged[i] * 32768));
        }

        // Create WAV file with header
        const wavBuffer = createWavBuffer(pcmData.buffer, 16000, 1);
        const audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        setState(prev => ({
          ...prev,
          audioBlob,
          audioUrl,
          isRecording: false,
        }));
      } else {
        // No audio data recorded
        setState(prev => ({
          ...prev,
          isRecording: false,
          error: new Error('没有录制到音频数据'),
        }));
      }
    }
  }, [state.isRecording, stopTimer]);

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
      audioBlob: null,
      audioUrl: null,
      duration: 0,
      error: null,
    });

    // Clear audio data
    audioDataRef.current = [];
  }, [state.isRecording, state.audioUrl, stopRecording]);

  const controls: PCMRecorderControls = {
    startRecording,
    stopRecording,
    resetRecording,
  };

  return { state, controls };
}
