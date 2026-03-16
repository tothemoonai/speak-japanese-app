/**
 * VolcEngine ASR Server Service
 * 服务端语音识别服务，使用Node.js文件系统处理音频
 */

import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { tmpdir } from 'os';

// API配置
const VOLCENGINE_CONFIG = {
  appId: process.env.VOLCENGINE_APP_ID || '7063204876', // 使用服务器端环境变量
  accessToken: process.env.VOLCENGINE_ACCESS_TOKEN || 'U8PJF_OmQKQGzHETV3ZCrwW1_mmiqkRV', // 使用服务器端环境变量
  submitUrl: 'https://openspeech.bytedance.com/api/v3/auc/bigmodel/submit',
  queryUrl: 'https://openspeech.bytedance.com/api/v3/auc/bigmodel/query',
  // 支持两种模型：
  // - volc.seedasr.auc: 录音文件识别模型2.0 (需要单独开通权限)
  // - volc.bigasr.auc: 录音文件识别模型1.0 (默认可用)
  resourceId: process.env.VOLCENGINE_RESOURCE_ID || 'volc.bigasr.auc', // 使用服务器端环境变量
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
 * 将Buffer转换为Base64 URL
 * 注意：火山引擎API需要一个可公开访问的URL
 * 由于我们无法在服务端直接提供公开URL，这里使用一种变通方法：
 * 1. 将音频数据保存到临时文件
 * 2. 如果有云存储，上传到云存储并获取URL
 * 3. 如果没有云存储，返回错误提示
 *
 * 对于开发环境，我们假设用户会配置一个可访问的URL前缀
 */
async function getAudioUrl(audioBuffer: Buffer, filename: string): Promise<string> {
  // 确保临时目录存在
  const tempDir = join(tmpdir(), 'asr-temp');
  if (!existsSync(tempDir)) {
    await mkdir(tempDir, { recursive: true });
  }

  // 保存音频文件到临时目录
  const filePath = join(tempDir, filename);
  await writeFile(filePath, audioBuffer);

  // 在实际生产环境中，您需要：
  // 1. 上传到云存储服务（火山引擎TOS、阿里云OSS、AWS S3等）
  // 2. 返回可公开访问的URL
  //
  // 例如：
  // const uploadedUrl = await uploadToCloudStorage(filePath);
  // return uploadedUrl;

  // 临时方案：返回文件路径（这不能直接用于API调用）
  // 这个实现仅用于演示，实际使用时必须实现云存储上传
  throw new Error(
    '需要配置云存储服务。请实现音频文件上传功能，以获取可公开访问的URL。'
  );
}

/**
 * 提交语音识别任务（使用公网URL）
 */
async function submitTask(
  audioUrl: string,
  language: string = 'ja-JP',
  requestId?: string
): Promise<string> {
  const reqId = requestId || generateUUID();

  const requestBody = {
    user: {
      uid: reqId,
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
      enable_itn: true,
      enable_punc: true,
    },
  };

  const response = await fetch(VOLCENGINE_CONFIG.submitUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-App-Key': VOLCENGINE_CONFIG.appId,
      'X-Api-Access-Key': VOLCENGINE_CONFIG.accessToken,
      'X-Api-Resource-Id': VOLCENGINE_CONFIG.resourceId,
      'X-Api-Request-Id': reqId,
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

  return reqId;
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

  // 20000001: 正在处理中, 20000002: 任务在队列中
  if (statusCode === '20000001' || statusCode === '20000002') {
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

    if (result.processing) {
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
 * 服务端语音识别函数
 * @param audioBuffer 音频Buffer
 * @param audioUrl 音频文件的公网URL（必需）
 * @param language 语言代码
 */
export async function recognizeAudioServer(
  audioBuffer: Buffer,
  audioUrl: string,
  language: string = 'ja-JP'
): Promise<ASRResult> {
  try {
    // 1. 提交识别任务（使用提供的URL）
    const requestId = await submitTask(audioUrl, language);

    // 2. 轮询查询结果
    const result = await pollForResult(requestId);

    return result;
  } catch (error) {
    console.error('[VolcEngine ASR] Recognition failed:', error);
    throw error;
  }
}

/**
 * VolcEngine ASR服务类（服务端）
 */
export class VolcEngineASRServerService {
  private readonly maxAttempts: number;
  private readonly pollInterval: number;

  constructor(config?: { maxAttempts?: number; pollInterval?: number }) {
    this.maxAttempts = config?.maxAttempts || 30;
    this.pollInterval = config?.pollInterval || 1000;
  }

  /**
   * 识别音频（服务端）
   * @param audioBuffer 音频数据
   * @param audioUrl 音频文件的公网URL
   * @param language 语言代码
   */
  async recognize(
    audioBuffer: Buffer,
    audioUrl: string,
    language: string = 'ja-JP'
  ): Promise<ASRResult> {
    return recognizeAudioServer(audioBuffer, audioUrl, language);
  }
}

// 导出单例实例
export const volcEngineASRServerService = new VolcEngineASRServerService();

// 默认导出
export default volcEngineASRServerService;
