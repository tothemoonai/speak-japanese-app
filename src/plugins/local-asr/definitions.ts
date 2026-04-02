import { PluginListenerHandle } from '@capacitor/core';

export interface ModelStatus {
  int8: boolean;
  fp32: boolean;
}

export interface DownloadProgressEvent {
  progress: number;
}

export interface ASRResultEvent {
  text: string;
}

export interface ASRErrorEvent {
  message: string;
}

export interface VADStateEvent {
  isSpeech: boolean;
}

export interface LocalASRPlugin {
  checkModelStatus(): Promise<ModelStatus>;
  downloadModel(options: { type: 'int8' | 'fp32' }): Promise<void>;
  deleteModel(options: { type: 'int8' | 'fp32' }): Promise<void>;
  initialize(options: { modelType: 'int8' | 'fp32'; language: string }): Promise<{ success: boolean }>;
  release(): Promise<void>;
  startRecording(): Promise<void>;
  stopRecording(): Promise<void>;
  addListener(eventName: 'asrResult', listenerFunc: (event: ASRResultEvent) => void): Promise<PluginListenerHandle>;
  addListener(eventName: 'asrError', listenerFunc: (event: ASRErrorEvent) => void): Promise<PluginListenerHandle>;
  addListener(eventName: 'downloadProgress', listenerFunc: (event: DownloadProgressEvent) => void): Promise<PluginListenerHandle>;
  addListener(eventName: 'vadState', listenerFunc: (event: VADStateEvent) => void): Promise<PluginListenerHandle>;
}
