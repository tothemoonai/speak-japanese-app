/**
 * Sherpa-ONNX ASR Service
 *
 * Local speech recognition using Sherpa-ONNX with SenseVoice model
 * Runs entirely in the browser using WebAssembly
 *
 * Note: This service requires the sherpa-onnx WASM files and model files
 * to be properly configured. See: scripts/download-sense-voice-model.js
 */

// Model configuration
export interface SherpaModelConfig {
  modelUrl: string; // URL to the model.onnx file
  tokensUrl: string; // URL to the tokens.txt file
  language: string; // ja, zh, en, ko, yue
  useInverseTextNormalization?: boolean;
}

// Recognition result
export interface SherpaASRResult {
  text: string;
  timestamp?: number;
}

// Service configuration
export interface SherpaServiceConfig {
  modelConfig: SherpaModelConfig;
  debug?: boolean;
}

/**
 * Sherpa-ONNX ASR Service for browser-based local speech recognition
 *
 * This class wraps the sherpa-onnx WASM module to provide
 * local speech recognition in the browser.
 */
export class SherpaASRService {
  private recognizer: any = null;
  private module: any = null;
  private isInitialized: boolean = false;
  private config: SherpaServiceConfig;

  constructor(config: SherpaServiceConfig) {
    this.config = config;
  }

  /**
   * Initialize the Sherpa-ONNX recognizer
   * This loads the WASM module and model files
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // 确保只在浏览器环境中运行
    if (typeof window === 'undefined') {
      throw new Error('Sherpa-ONNX can only run in browser environment');
    }

    try {
      console.log('[Sherpa ASR] Initializing...');
      console.log('[Sherpa ASR] Loading sherpa-onnx WASM module...');

      // 使用动态导入，只在客户端加载
      const sherpaOnnx = await import('sherpa-onnx');

      // The sherpa-onnx package provides OfflineRecognizer class
      if (!sherpaOnnx.OfflineRecognizer) {
        throw new Error('sherpa-onnx.OfflineRecognizer not found. Make sure sherpa-onnx is properly installed.');
      }

      console.log('[Sherpa ASR] WASM module loaded');

      // Create recognizer configuration
      const config = {
        featConfig: {
          sampleRate: 16000,
          featureDim: 80,
        },
        modelConfig: {
          senseVoice: {
            model: this.config.modelConfig.modelUrl,
            language: this.config.modelConfig.language,
            useInverseTextNormalization:
              this.config.modelConfig.useInverseTextNormalization ?? true,
          },
          tokens: this.config.modelConfig.tokensUrl,
          numThreads: 1,
          provider: 'cpu',
          debug: this.config.debug ? 1 : 0,
          modelType: '',
          modelingUnit: 'cjkchar',
          bpeVocab: '',
        },
        decodingMethod: 'greedy_search',
        maxActivePaths: 4,
      };

      console.log('[Sherpa ASR] Creating recognizer with config:', config);

      // Create the recognizer
      this.recognizer = new sherpaOnnx.OfflineRecognizer(config);

      this.isInitialized = true;
      console.log('[Sherpa ASR] Initialized successfully');
    } catch (error) {
      console.error('[Sherpa ASR] Initialization failed:', error);
      throw new Error(`Sherpa-ONNX initialization failed: ${error}`);
    }
  }

  /**
   * Recognize audio from a Float32Array
   * @param samples - Audio samples in Float32Array format (-1 to 1 range)
   * @param sampleRate - Sample rate (default: 16000)
   * @returns Recognition result
   */
  async recognize(
    samples: Float32Array,
    sampleRate: number = 16000
  ): Promise<SherpaASRResult> {
    if (!this.isInitialized || !this.recognizer) {
      throw new Error('Sherpa-ONNX not initialized. Call initialize() first.');
    }

    try {
      console.log(`[Sherpa ASR] Recognizing ${samples.length} samples...`);

      // Create a stream for this recognition
      const stream = this.recognizer.createStream();

      // Feed the audio data
      stream.acceptWaveform(sampleRate, samples);

      // Run recognition
      this.recognizer.decode(stream);

      // Get result
      const result = this.recognizer.getResult(stream);

      // Clean up
      stream.free();

      console.log('[Sherpa ASR] Recognition result:', result);

      return {
        text: result.text || '',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('[Sherpa ASR] Recognition failed:', error);
      throw error;
    }
  }

  /**
   * Recognize audio from an AudioBuffer
   * @param audioBuffer - Web Audio API AudioBuffer
   * @returns Recognition result
   */
  async recognizeAudioBuffer(audioBuffer: AudioBuffer): Promise<SherpaASRResult> {
    // Convert AudioBuffer to Float32Array
    const samples = audioBuffer.getChannelData(0); // Use first channel
    return this.recognize(samples, audioBuffer.sampleRate);
  }

  /**
   * Recognize audio from a Blob
   * @param blob - Audio blob
   * @returns Recognition result
   */
  async recognizeBlob(blob: Blob): Promise<SherpaASRResult> {
    // Convert blob to AudioBuffer
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    return this.recognizeAudioBuffer(audioBuffer);
  }

  /**
   * Check if the service is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.recognizer !== null;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.recognizer) {
      this.recognizer.free();
      this.recognizer = null;
    }
    this.isInitialized = false;
    console.log('[Sherpa ASR] Disposed');
  }
}

/**
 * Predefined model configurations
 */
export const SHERPA_MODEL_CONFIGS = {
  // SenseVoice INT8 model (Japanese, Chinese, English, Korean, Cantonese)
  senseVoiceInt8: {
    modelUrl: '/models/sense-voice/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09/model.int8.onnx',
    tokensUrl: '/models/sense-voice/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2025-09-09/tokens.txt',
    language: 'ja', // Default to Japanese
    useInverseTextNormalization: true,
  },
};

/**
 * Create a SherpaASRService instance with default configuration
 */
export function createSherpaASRService(
  language: string = 'ja',
  modelConfig?: Partial<SherpaModelConfig>
): SherpaASRService {
  const config = {
    modelConfig: {
      ...SHERPA_MODEL_CONFIGS.senseVoiceInt8,
      language,
      ...modelConfig,
    },
    debug: false,
  };

  return new SherpaASRService(config);
}

// Export a singleton instance (can be configured later)
export let sherpaASRService: SherpaASRService | null = null;

/**
 * Initialize the global Sherpa-ONNX service
 */
export async function initSherpaASRService(language: string = 'ja'): Promise<SherpaASRService> {
  if (!sherpaASRService) {
    sherpaASRService = createSherpaASRService(language);
    await sherpaASRService.initialize();
  }
  return sherpaASRService;
}

/**
 * Get the global Sherpa-ONNX service (must be initialized first)
 */
export function getSherpaASRService(): SherpaASRService | null {
  return sherpaASRService;
}
