'use client';

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Icon } from '@/components/ui/zen/Icon';
import { useASRStore } from '@/store/asrStore';
import { useLocalASR } from '@/hooks/useLocalASR';

export function ASRSettings() {
  const [mounted, setMounted] = useState(false);
  const { asrMode, setASRMode, localModelType, setLocalModelType } = useASRStore();
  const { state, checkStatus, downloadModel, deleteModel } = useLocalASR();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && state.isAvailable) {
      checkStatus();
    }
  }, [mounted, state.isAvailable, checkStatus]);

  if (!mounted || !state.isAvailable) return null;

  return (
    <section className="bg-surface-container-low p-6 rounded-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Icon name="mic" size={18} className="text-primary" />
        <h3 className="font-headline font-bold text-on-surface">音声認識設定</h3>
      </div>

      {/* ASR Mode Selection */}
      <div className="space-y-2">
        <p className="font-label text-[10px] uppercase tracking-widest text-secondary/40 mb-2">認識モード</p>
        <div className="flex gap-3">
          <button
            onClick={() => setASRMode('cloud')}
            className={`flex-1 px-4 py-3 rounded-xl font-headline font-bold text-sm transition-all ${
              asrMode === 'cloud'
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Icon name="cloud" size={16} />
              <span>クラウドASR</span>
            </div>
          </button>
          <button
            onClick={() => setASRMode('local')}
            className={`flex-1 px-4 py-3 rounded-xl font-headline font-bold text-sm transition-all ${
              asrMode === 'local'
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Icon name="smartphone" size={16} />
              <span>ローカルASR</span>
            </div>
          </button>
        </div>
      </div>

      {/* Cloud ASR Info */}
      {asrMode === 'cloud' && (
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-label text-[10px] uppercase tracking-widest text-secondary/40 mb-1">モデル</p>
              <p className="font-body text-sm text-on-surface font-medium">qwen3-asr-flash</p>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase tracking-widest text-secondary/40 mb-1">プロバイダー</p>
              <p className="font-body text-sm text-on-surface font-medium">Alibaba Cloud DashScope</p>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase tracking-widest text-secondary/40 mb-1">エンドポイント</p>
              <p className="font-body text-xs text-secondary/60 font-mono break-all">dashscope-intl.aliyuncs.com</p>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase tracking-widest text-secondary/40 mb-1">対応言語</p>
              <p className="font-body text-sm text-on-surface font-medium">日本語・中国語・英語</p>
            </div>
          </div>
          <div className="pt-3 border-t border-outline-variant/10 space-y-2">
            {[
              '高速認識：flashモデル、5-10秒で応答',
              '高精度：専門日本語音声認識、精度 > 95%',
              '多言語対応：日本語・中国語・英語を自動検出',
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-2">
                <Icon name="check_circle" size={14} className="text-primary mt-0.5 flex-shrink-0" fill />
                <span className="text-sm text-secondary/70 font-body">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Local ASR Model Management */}
      {asrMode === 'local' && (
        <div className="space-y-3 pt-2">
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <Icon name="info" size={14} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-secondary/70 font-body">
                ローカルASRはオフラインで動作します。初回使用時にモデルのダウンロードが必要です。
              </p>
            </div>
          </div>

          {/* Model Type Selection */}
          <div className="space-y-2">
            <p className="font-label text-[10px] uppercase tracking-widest text-secondary/40">使用モデル</p>
            <div className="flex gap-2">
              <button
                onClick={() => setLocalModelType('int8')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-label font-bold tracking-widest transition-all ${
                  localModelType === 'int8'
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                INT8（高速・228MB）
              </button>
              <button
                onClick={() => setLocalModelType('fp32')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-label font-bold tracking-widest transition-all ${
                  localModelType === 'fp32'
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                FP32（高精度・894MB）
              </button>
            </div>
          </div>

          {/* INT8 Model Row */}
          <ModelRow
            label="INT8 モデル"
            size="228MB"
            isDownloaded={state.modelStatus?.int8 ?? false}
            isDownloading={state.isDownloading && state.downloadingType === 'int8'}
            progress={state.downloadProgress}
            onDownload={() => downloadModel('int8')}
            onDelete={() => deleteModel('int8')}
          />

          {/* FP32 Model Row */}
          <ModelRow
            label="FP32 モデル"
            size="894MB"
            isDownloaded={state.modelStatus?.fp32 ?? false}
            isDownloading={state.isDownloading && state.downloadingType === 'fp32'}
            progress={state.downloadProgress}
            onDownload={() => downloadModel('fp32')}
            onDelete={() => deleteModel('fp32')}
          />

          {/* Error Display */}
          {state.error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-xl text-xs font-body">
              {state.error}
            </div>
          )}

        </div>
      )}
    </section>
  );
}

// Model row sub-component
function ModelRow({
  label,
  size,
  isDownloaded,
  isDownloading,
  progress,
  onDownload,
  onDelete,
}: {
  label: string;
  size: string;
  isDownloaded: boolean;
  isDownloading: boolean;
  progress: number;
  onDownload: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset confirm state when download status changes
  useEffect(() => {
    if (!isDownloaded) setConfirmDelete(false);
  }, [isDownloaded]);

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-surface-container-high rounded-xl">
      <div className="flex items-center gap-3">
        <Icon
          name={isDownloaded ? 'check_circle' : 'download'}
          size={16}
          className={isDownloaded ? 'text-primary' : 'text-secondary/40'}
          fill={isDownloaded}
        />
        <div>
          <p className="text-sm text-on-surface font-body font-medium">{label}</p>
          <p className="text-xs text-secondary/40 font-label">{size}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isDownloading ? (
          progress >= 70 ? (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] text-primary font-label font-bold">解压中...</span>
            </div>
          ) : (
            <div className="w-28">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-primary font-label font-bold">下载中</span>
                <span className="text-[10px] text-secondary/50 font-label">{Math.round(progress / 69 * 100)}%</span>
              </div>
              <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(progress / 69 * 100)}%` }}
                />
              </div>
            </div>
          )
        ) : isDownloaded ? (
          confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { onDelete(); setConfirmDelete(false); }}
                className="text-[10px] text-destructive font-label font-bold px-2 py-1 bg-destructive/10 rounded-lg"
              >
                確認
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[10px] text-secondary/50 font-label px-2 py-1"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-destructive font-label font-bold tracking-widest hover:underline"
            >
              削除
            </button>
          )
        ) : (
          <button
            onClick={onDownload}
            className="text-xs text-primary font-label font-bold tracking-widest hover:underline"
          >
            ダウンロード
          </button>
        )}
      </div>
    </div>
  );
}
