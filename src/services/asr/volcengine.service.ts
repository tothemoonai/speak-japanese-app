/**
 * VolcEngine ASR Service
 * 使用火山引擎录音文件识别2.0模型进行语音识别
 * API文档: https://www.volcengine.com/docs/6561/1354868?lang=zh
 */

// API配置
const VOLCENGINE_CONFIG = {
  appId: process.env.NEXT_PUBLIC_VOLCENGINE_APP_ID || '7063204876',
  accessToken: process.env.NEXT_PUBLIC_VOLCENGINE_ACCESS_TOKEN || 'U8PJF_OmQKQGzHETV3ZCrwW1_mmiqkRV',
  submitUrl: 'https://openspeech.bytedance.com/api/v3/auc/bigmodel/submit',
  queryUrl: 'https://openspeech.bytedance.com/api/v3/auc/bigmodel/query',
  // 支持两种模型：
  // - volc.seedasr.auc: 录音文件识别模型2.0 (需要单独开通权限)
  // - volc.bigasr.auc: 录音文件识别模型1.0 (默认可用)
  resourceId: process.env.NEXT_PUBLIC_VOLCENGINE_RESOURCE_ID || 'volc.bigasr.auc',
};

// 识别结果接口
export interface ASRResult {
  text: string;
  utterances?: Utterance[];
  audio_info?: {
    duration: number;
  };
}

export interface Utterance {
  text: string;
  start_time: number;
  end_time: number;
  definite: boolean;
  words?: Word[];
}

export interface Word {
  text: string;
  start_time: number;
  end_time: number;
  blank_duration: number;
}

// 提交任务请求接口
interface SubmitRequest {
  user?: {
    uid?: string;
  };
  audio: {
    url?: string;
    format: 'raw' | 'wav' | 'mp3' | 'ogg';
    language?: string; // ja-JP for Japanese, zh-CN for Chinese, etc.
    codec?: 'raw' | 'opus';
    rate?: number;
    bits?: number;
    channel?: 1 | 2;
  };
  request: {
    model_name: string;
    enable_itn?: boolean;
    enable_punc?: boolean;
    enable_ddc?: boolean;
  };
}

// 提交任务响应头
interface SubmitResponseHeaders {
  'X-Tt-Logid': string;
  'X-Api-Status-Code': string;
  'X-Api-Message': string;
}

// 查询结果响应
interface QueryResponse {
  result?: ASRResult;
  audio_info?: {
    duration: number;
  };
  processing?: boolean;
}

/**
 * 生成UUID
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 上传音频文件到临时存储并获取URL
 * 注意：在实际生产环境中，您需要实现文件上传到云存储（如OSS、S3等）
 * 这里简化处理，假设有一个可访问的URL
 */
async function uploadAudioToStorage(audioBlob: Blob): Promise<string> {
  // TODO: 实现实际的文件上传逻辑
  // 这里暂时返回一个占位符，实际使用时需要实现：
  // 1. 上传到云存储服务（如火山引擎TOS、阿里云OSS、AWS S3等）
  // 2. 返回可公开访问的URL

  throw new Error('音频文件上传功能需要实现。请配置云存储服务。');
}

/**
 * 提交语音识别任务
 */
async function submitTask(audioUrl: string, language: string = 'ja-JP'): Promise<string> {
  const requestId = generateUUID();

  const requestBody: SubmitRequest = {
    user: {
      uid: requestId,
    },
    audio: {
      url: audioUrl,
      format: 'wav',
      language: language,
      rate: 16000,
      bits: 16,
      channel: 1,
    },
    request: {
      model_name: 'bigmodel',
      enable_itn: true, // 启用文本规范化
      enable_punc: true, // 启用标点
    },
  };

  const response = await fetch(VOLCENGINE_CONFIG.submitUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-App-Key': VOLCENGINE_CONFIG.appId,
      'X-Api-Access-Key': VOLCENGINE_CONFIG.accessToken,
      'X-Api-Resource-Id': VOLCENGINE_CONFIG.resourceId,
      'X-Api-Request-Id': requestId,
      'X-Api-Sequence': '-1',
    },
    body: JSON.stringify(requestBody),
  });

  const statusCode = response.headers.get('X-Api-Status-Code');
  const message = response.headers.get('X-Api-Message');
  const logId = response.headers.get('X-Tt-Logid');

  console.log(`[VolcEngine ASR] Submit task - LogId: ${logId}, StatusCode: ${statusCode}, Message: ${message}`);

  if (statusCode !== '20000000') {
    throw new Error(`提交任务失败: ${message} (${statusCode})`);
  }

  return requestId;
}

/**
 * 查询识别结果
 */
async function queryResult(requestId: string): Promise<QueryResponse> {
  const response = await fetch(VOLCENGINE_CONFIG.queryUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-App-Key': VOLCENGINE_CONFIG.appId,
      'X-Api-Access-Key': VOLCENGINE_CONFIG.accessToken,
      'X-Api-Resource-Id': VOLCENGINE_CONFIG.resourceId,
      'X-Api-Request-Id': requestId,
    },
    body: JSON.stringify({}),
  });

  const statusCode = response.headers.get('X-Api-Status-Code');
  const message = response.headers.get('X-Api-Message');
  const logId = response.headers.get('X-Tt-Logid');

  console.log(`[VolcEngine ASR] Query result - LogId: ${logId}, StatusCode: ${statusCode}, Message: ${message}`);

  // 20000000: 成功
  // 20000001: 正在处理中
  // 20000002: 任务在队列中
  if (statusCode === '20000001' || statusCode === '20000002') {
    // 还在处理中，返回特殊标记
    return { processing: true };
  }

  if (statusCode !== '20000000') {
    throw new Error(`查询结果失败: ${message} (${statusCode})`);
  }

  const data: QueryResponse = await response.json();
  return data;
}

/**
 * 轮询查询结果直到完成
 */
async function pollForResult(
  requestId: string,
  maxAttempts: number = 30,
  intervalMs: number = 1000
): Promise<ASRResult> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await queryResult(requestId);

    if ('processing' in result && result.processing) {
      // 还在处理中，等待后重试
      console.log(`[VolcEngine ASR] Processing... Attempt ${attempt + 1}/${maxAttempts}`);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      continue;
    }

    if (result.result) {
      return result.result;
    }

    throw new Error('无法获取识别结果');
  }

  throw new Error('识别超时，请重试');
}

/**
 * 主要的语音识别函数
 * @param audioBlob 音频Blob对象
 * @param language 语言代码 (ja-JP, zh-CN, en-US等)
 * @returns 识别结果
 */
export async function recognizeAudio(
  audioBlob: Blob,
  language: string = 'ja-JP'
): Promise<ASRResult> {
  try {
    // 1. 上传音频文件并获取URL
    const audioUrl = await uploadAudioToStorage(audioBlob);

    // 2. 提交识别任务
    const requestId = await submitTask(audioUrl, language);

    // 3. 轮询查询结果
    const result = await pollForResult(requestId);

    return result;
  } catch (error) {
    console.error('[VolcEngine ASR] Recognition failed:', error);
    throw error;
  }
}

/**
 * VolcEngine ASR服务类
 */
export class VolcEngineASRService {
  private readonly maxAttempts: number;
  private readonly pollInterval: number;

  constructor(config?: { maxAttempts?: number; pollInterval?: number }) {
    this.maxAttempts = config?.maxAttempts || 30;
    this.pollInterval = config?.pollInterval || 1000;
  }

  /**
   * 识别音频文件
   */
  async recognize(audioBlob: Blob, language: string = 'ja-JP'): Promise<ASRResult> {
    return recognizeAudio(audioBlob, language);
  }

  /**
   * 识别日语音频
   */
  async recognizeJapanese(audioBlob: Blob): Promise<ASRResult> {
    return this.recognize(audioBlob, 'ja-JP');
  }

  /**
   * 识别中文音频
   */
  async recognizeChinese(audioBlob: Blob): Promise<ASRResult> {
    return this.recognize(audioBlob, 'zh-CN');
  }

  /**
   * 识别英文音频
   */
  async recognizeEnglish(audioBlob: Blob): Promise<ASRResult> {
    return this.recognize(audioBlob, 'en-US');
  }
}

// 导出单例实例
export const volcEngineASRService = new VolcEngineASRService();

// 默认导出
export default volcEngineASRService;
