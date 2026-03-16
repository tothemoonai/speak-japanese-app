/**
 * Aliyun Qwen ASR Service
 * 使用阿里云Qwen实时语音识别API
 * API文档: https://www.alibabacloud.com/help/zh/model-studio/developer-reference/use-qwen-audio-realtime-asr
 */

import WebSocket from 'ws';

// API配置
const ALIYUN_CONFIG = {
  apiKey: process.env.DASHSCOPE_API_KEY || 'sk-ad3cb691dfb04b8b8551b895c31ed67d',
  model: 'qwen3-asr-flash-realtime',
  // 新加坡地域（国际）
  baseUrlIntl: 'wss://dashscope-intl.aliyuncs.com/api-ws/v1/realtime',
  // 北京地域（中国）
  baseUrlCN: 'wss://dashscope.aliyuncs.com/api-ws/v1/realtime',
};

// 识别结果接口
export interface AliyunASRResult {
  transcript: string;
  isFinal: boolean;
  event_type: string;
}

// 会话配置
export interface SessionConfig {
  language?: 'zh' | 'en' | 'ja' | 'yue';
  sampleRate?: number;
  enableVad?: boolean;
  vadThreshold?: number;
  silenceDurationMs?: number;
  audioFormat?: 'pcm' | 'opus';
}

/**
 * 阿里云ASR服务类
 */
export class AliyunASRService {
  private useIntlRegion: boolean = true; // 默认使用新加坡地域

  constructor(useIntlRegion: boolean = true) {
    this.useIntlRegion = useIntlRegion;
  }

  /**
   * 使用WebSocket进行实时语音识别
   * @param audioBuffer 音频数据（支持opus或pcm格式）
   * @param config 会话配置
   */
  async recognize(
    audioBuffer: Buffer,
    config: SessionConfig = {}
  ): Promise<AliyunASRResult> {
    const {
      language = 'zh',
      sampleRate = 16000,
      enableVad = false, // 默认关闭VAD，避免中断识别
      vadThreshold = 0.0,
      silenceDurationMs = 2000, // 增加到2000ms，避免说话停顿时中断
      audioFormat = 'pcm', // 使用PCM格式（更兼容）
    } = config;

    return new Promise((resolve, reject) => {
      const baseUrl = this.useIntlRegion ? ALIYUN_CONFIG.baseUrlIntl : ALIYUN_CONFIG.baseUrlCN;
      const url = `${baseUrl}?model=${ALIYUN_CONFIG.model}`;

      console.log(`[Aliyun ASR] Connecting to: ${url}, format: ${audioFormat}`);

      const ws = new WebSocket(url, {
        headers: {
          'Authorization': `Bearer ${ALIYUN_CONFIG.apiKey}`,
          'OpenAI-Beta': 'realtime=v1',
        },
      });

      let transcript = '';
      let isFinished = false;

      // 设置超时
      const timeout = setTimeout(() => {
        if (!isFinished) {
          ws.close(1000, 'Timeout');
          reject(new Error('识别超时'));
        }
      }, 30000); // 30秒超时

      ws.on('open', () => {
        console.log('[Aliyun ASR] WebSocket connected');

        // 发送会话配置
        this.sendSessionUpdate(ws, {
          language,
          sampleRate,
          enableVad,
          vadThreshold,
          silenceDurationMs,
          audioFormat,
        });

        // 开始发送音频
        setTimeout(() => {
          this.sendAudio(ws, audioBuffer, enableVad);
        }, 1000);
      });

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('[Aliyun ASR] Received event:', data.type);
          console.log('[Aliyun ASR] Full data:', JSON.stringify(data, null, 2));

          // 检查各种可能包含识别结果的事件
          // 1. conversation.item.input_audio_transcription.completed
          if (data.type === 'conversation.item.input_audio_transcription.completed') {
            if (data.transcript) {
              transcript = data.transcript;
              console.log('[Aliyun ASR] Got transcript from completed event:', transcript);
            }
          }

          // 2. conversation.item.created
          if (data.type === 'conversation.item.created') {
            if (data.item?.input_audio_transcription?.transcript) {
              transcript = data.item.input_audio_transcription.transcript;
              console.log('[Aliyun ASR] Got transcript from item.created:', transcript);
            }
          }

          // 3. input_audio_buffer.committed
          if (data.type === 'input_audio_buffer.committed') {
            if (data.item?.input_audio_transcription?.transcript) {
              transcript = data.item.input_audio_transcription.transcript;
              console.log('[Aliyun ASR] Got transcript from committed:', transcript);
            }
          }

          // 收到结束事件
          if (data.type === 'session.finished') {
            isFinished = true;
            clearTimeout(timeout);

            // 尝试从不同位置获取转录文本
            const finalTranscript = data.transcript ||
                                   data.item?.input_audio_transcription?.transcript ||
                                   transcript;

            console.log('[Aliyun ASR] Session finished, final transcript:', finalTranscript);

            resolve({
              transcript: finalTranscript || '(无识别结果)',
              isFinal: true,
              event_type: 'session.finished',
            });

            ws.close(1000, 'ASR finished');
          }

          // 错误处理
          if (data.type === 'error') {
            isFinished = true;
            clearTimeout(timeout);
            reject(new Error(data.error?.message || '识别失败'));
            ws.close();
          }
        } catch (e) {
          console.error('[Aliyun ASR] Failed to parse message:', e);
        }
      });

      ws.on('close', (code, reason) => {
        if (!isFinished) {
          clearTimeout(timeout);
          if (code !== 1000) {
            reject(new Error(`WebSocket closed: ${code} - ${reason}`));
          } else {
            resolve({
              transcript,
              isFinal: true,
              event_type: 'connection.closed',
            });
          }
        }
      });

      ws.on('error', (err) => {
        clearTimeout(timeout);
        reject(new Error(`WebSocket error: ${err.message}`));
      });
    });
  }

  /**
   * 发送会话配置更新
   */
  private sendSessionUpdate(ws: WebSocket, config: SessionConfig) {
    const {
      language = 'zh',
      sampleRate = 16000,
      enableVad = false, // 默认关闭VAD
      vadThreshold = 0.0,
      silenceDurationMs = 2000, // 增加到2000ms
      audioFormat = 'pcm', // 默认使用PCM
    } = config;

    const event = {
      event_id: `event_${Date.now()}`,
      type: 'session.update',
      session: {
        modalities: ['text'],
        input_audio_format: audioFormat, // 使用PCM格式
        sample_rate: sampleRate,
        input_audio_transcription: {
          language: language,
        },
        turn_detection: enableVad
          ? {
              type: 'server_vad',
              threshold: vadThreshold,
              silence_duration_ms: silenceDurationMs,
            }
          : null,
      },
    };

    console.log('[Aliyun ASR] Sending session.update:', JSON.stringify(event, null, 2));
    ws.send(JSON.stringify(event));
  }

  /**
   * 发送音频数据
   */
  private sendAudio(ws: WebSocket, audioBuffer: Buffer, enableVad: boolean) {
    console.log(`[Aliyun ASR] Sending audio: ${audioBuffer.length} bytes`);

    let offset = 0;
    const chunkSize = 3200; // 约0.1s的音频数据

    const sendChunk = () => {
      if (offset >= audioBuffer.length) {
        // 音频发送完成
        console.log('[Aliyun ASR] Audio sending completed');

        // 如果不是VAD模式，需要发送commit事件
        if (!enableVad && ws.readyState === WebSocket.OPEN) {
          const commitEvent = {
            event_id: `event_${Date.now()}`,
            type: 'input_audio_buffer.commit',
          };
          ws.send(JSON.stringify(commitEvent));
          console.log('[Aliyun ASR] Sent input_audio_buffer.commit');
        }

        // 发送完成事件
        if (ws.readyState === WebSocket.OPEN) {
          const finishEvent = {
            event_id: `event_${Date.now()}`,
            type: 'session.finish',
          };
          ws.send(JSON.stringify(finishEvent));
          console.log('[Aliyun ASR] Sent session.finish');
        }

        return;
      }

      if (ws.readyState !== WebSocket.OPEN) {
        console.log('[Aliyun ASR] WebSocket is not open, stopping audio send');
        return;
      }

      const chunk = audioBuffer.slice(offset, offset + chunkSize);
      offset += chunkSize;

      // 转换为base64并发送
      const encoded = chunk.toString('base64');
      const appendEvent = {
        event_id: `event_${Date.now()}`,
        type: 'input_audio_buffer.append',
        audio: encoded,
      };

      ws.send(JSON.stringify(appendEvent));

      // 继续发送下一块（模拟实时发送，每100ms发送一块）
      setTimeout(sendChunk, 100);
    };

    sendChunk();
  }
}

// 导出服务实例
export const aliyunASRService = new AliyunASRService();

// 导出默认
export default aliyunASRService;
