import { WebPlugin } from '@capacitor/core';
import type { LocalASRPlugin, ModelStatus } from './definitions';

export class LocalASRWeb extends WebPlugin implements LocalASRPlugin {
  async checkModelStatus(): Promise<ModelStatus> {
    return { int8: false, fp32: false };
  }
  async downloadModel(): Promise<void> {
    throw new Error('Local ASR is only available on Android');
  }
  async deleteModel(): Promise<void> {
    throw new Error('Local ASR is only available on Android');
  }
  async initialize(): Promise<{ success: boolean }> {
    throw new Error('Local ASR is only available on Android');
  }
  async release(): Promise<void> {}
  async startRecording(): Promise<void> {
    throw new Error('Local ASR is only available on Android');
  }
  async stopRecording(): Promise<void> {}
}
