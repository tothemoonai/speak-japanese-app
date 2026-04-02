import { registerPlugin } from '@capacitor/core';
import type { LocalASRPlugin, ModelStatus, DownloadProgressEvent, ASRResultEvent, VADStateEvent } from './definitions';

const LocalASR = registerPlugin<LocalASRPlugin>('LocalASR', {
  web: () => import('./web').then(m => new m.LocalASRWeb()),
});

export { LocalASR };
export type { LocalASRPlugin, ModelStatus, DownloadProgressEvent, ASRResultEvent, VADStateEvent };
