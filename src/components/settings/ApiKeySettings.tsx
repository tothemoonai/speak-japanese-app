'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Key, Trash2, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { saveApiKeys, getApiKeys, clearApiKeys, type ApiKeys } from '@/lib/storage/apiKeyStorage';
import { useToast } from '@/hooks/use-toast';
import { validateApiKey, type ApiKeyProvider } from '@/lib/services/apiKeyValidator';

export function ApiKeySettings() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});
  const [showKeys, setShowKeys] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // 验证相关状态
  const [validatingProvider, setValidatingProvider] = useState<ApiKeyProvider | null>(null);
  const [validationResults, setValidationResults] = useState<Record<ApiKeyProvider, { valid: boolean; message: string }>>({});

  // 加载已保存的 API Keys
  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const keys = await getApiKeys();
      setApiKeys(keys);
    } catch (error) {
      console.error('加载 API Keys 失败:', error);
    }
  };

  const handleKeyChange = (provider: keyof ApiKeys, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 验证至少有一个密钥
      const hasKey = Object.values(apiKeys).some(key => key && key.trim().length > 0);
      if (!hasKey) {
        toast({
          title: '配置错误',
          description: '请至少配置一个 API Key',
          variant: 'destructive',
        });
        setIsSaving(false);
        return;
      }

      // 检查是否有关键的验证失败
      const dashScopeKey = apiKeys.dashscope;
      if (dashScopeKey && validationResults.dashscope && !validationResults.dashscope.valid) {
        toast({
          title: '配置错误',
          description: 'DashScope API Key 验证失败，请检查密钥是否正确',
          variant: 'destructive',
        });
        setIsSaving(false);
        return;
      }

      await saveApiKeys(apiKeys);
      toast({
        title: '保存成功',
        description: 'API Keys 已安全保存到本地设备',
      });
    } catch (error) {
      console.error('保存失败:', error);
      toast({
        title: '保存失败',
        description: '请重试或检查网络连接',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('确定要删除所有已保存的 API Keys 吗？此操作不可恢复。')) {
      return;
    }

    setIsClearing(true);
    try {
      await clearApiKeys();
      setApiKeys({});
      setValidationResults({}); // 清除验证结果
      toast({
        title: '删除成功',
        description: '所有 API Keys 已从本地设备删除',
      });
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: '删除失败',
        description: '请重试或检查网络连接',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleValidate = async (provider: ApiKeyProvider) => {
    const apiKey = apiKeys[provider];
    if (!apiKey || apiKey.trim() === '') {
      toast({
        title: '验证失败',
        description: '请先输入 API Key',
        variant: 'destructive',
      });
      return;
    }

    setValidatingProvider(provider);

    try {
      const result = await validateApiKey(provider, apiKey);

      setValidationResults(prev => ({
        ...prev,
        [provider]: {
          valid: result.valid,
          message: result.message,
        },
      }));

      if (result.valid) {
        toast({
          title: '验证成功',
          description: `${provider} API Key 有效`,
        });
      } else {
        toast({
          title: '验证失败',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('验证失败:', error);
      toast({
        title: '验证失败',
        description: '请检查网络连接',
        variant: 'destructive',
      });
    } finally {
      setValidatingProvider(null);
    }
  };

  const toggleKeyVisibility = () => {
    setShowKeys(!showKeys);
  };

  const apiKeyConfigs = [
    {
      key: 'dashscope' as const,
      label: '阿里云 DashScope API Key',
      description: '用于语音识别功能（必需）',
      placeholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx',
      required: true,
      helpUrl: 'https://www.alibabacloud.com/help/zh/model-studio',
    },
    {
      key: 'openai' as const,
      label: 'OpenAI API Key',
      description: '用于 GPT-4 语音评估（可选）',
      placeholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx',
      required: false,
      helpUrl: 'https://platform.openai.com/api-keys',
    },
    {
      key: 'anthropic' as const,
      label: 'Anthropic API Key',
      description: '用于 Claude 语音评估（可选）',
      placeholder: 'sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx',
      required: false,
      helpUrl: 'https://console.anthropic.com/',
    },
    {
      key: 'zhipu' as const,
      label: '智谱 GLM API Key',
      description: '用于智谱 GLM 语音评估（可选）',
      placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxx',
      required: false,
      helpUrl: 'https://open.bigmodel.cn/',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API 密钥配置
            </CardTitle>
            <CardDescription className="mt-2">
              配置你自己的 API 密钥，所有密钥都安全地存储在本地设备上，不会上传到服务器。
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleKeyVisibility}
            className="shrink-0"
          >
            {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showKeys ? '隐藏' : '显示'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 安全提示 */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">安全说明</p>
            <ul className="space-y-1 text-xs">
              <li>• 所有 API 密钥都安全地存储在本地设备上</li>
              <li>• 移动端使用加密存储，网页版使用浏览器本地存储</li>
              <li>• 我们不会收集或上传你的 API 密钥到服务器</li>
              <li>• 请妥善保管你的密钥，不要分享给他人</li>
            </ul>
          </div>
        </div>

        {/* API Key 输入框 */}
        <div className="space-y-4">
          {apiKeyConfigs.map(config => {
            const validationResult = validationResults[config.key];
            const isValidating = validatingProvider === config.key;

            return (
              <div key={config.key} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor={config.key} className="flex items-center gap-2">
                    {config.label}
                    {config.required && <span className="text-red-500">*</span>}
                    {validationResult && (
                      validationResult.valid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )
                    )}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleValidate(config.key)}
                      disabled={!apiKeys[config.key]?.trim() || isValidating}
                      className="text-xs h-7"
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          验证中...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          验证
                        </>
                      )}
                    </Button>
                    <a
                      href={config.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      如何获取？
                    </a>
                  </div>
                </div>

                <Input
                  id={config.key}
                  type={showKeys ? 'text' : 'password'}
                  placeholder={config.placeholder}
                  value={apiKeys[config.key] || ''}
                  onChange={(e) => handleKeyChange(config.key, e.target.value)}
                  className={`font-mono text-sm ${
                    validationResult
                      ? validationResult.valid
                        ? 'border-green-500 focus-visible:ring-green-500'
                        : 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }`}
                />

                {/* 验证结果显示 */}
                {validationResult && (
                  <div className={`flex items-start gap-2 text-xs p-2 rounded ${
                    validationResult.valid
                      ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'
                      : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
                  }`}>
                    {validationResult.valid ? (
                      <CheckCircle className="h-3 w-3 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-3 w-3 mt-0.5 shrink-0" />
                    )}
                    <span>{validationResult.message}</span>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">{config.description}</p>
              </div>
            );
          })}
        </div>

        {/* 状态提示 */}
        {Object.values(apiKeys).some(key => key?.trim()) && (
          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            <div className="text-sm text-green-800 dark:text-green-200">
              <p className="font-medium">API 密钥已配置</p>
              <p className="text-xs mt-1">
                已配置 {Object.values(apiKeys).filter(key => key?.trim()).length} 个 API 密钥
              </p>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="space-y-3">
          {/* 验证所有配置的密钥 */}
          {Object.values(apiKeys).some(key => key?.trim()) && (
            <Button
              variant="outline"
              onClick={() => {
                Object.keys(apiKeys).forEach(provider => {
                  if (apiKeys[provider as ApiKeyProvider]?.trim()) {
                    handleValidate(provider as ApiKeyProvider);
                  }
                });
              }}
              disabled={validatingProvider !== null}
              className="w-full"
            >
              {validatingProvider ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  验证中...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  验证所有配置的密钥
                </>
              )}
            </Button>
          )}

          {/* 保存和清除按钮 */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? '保存中...' : '保存配置'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleClear}
              disabled={isClearing || !Object.values(apiKeys).some(key => key?.trim())}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isClearing ? '删除中...' : '清除所有'}
            </Button>
          </div>

          {/* 验证结果总结 */}
          {Object.keys(validationResults).length > 0 && (
            <div className="flex items-center gap-2 text-sm p-3 bg-muted rounded-lg">
              {Object.values(validationResults).filter(r => r.valid).length > 0 ? (
                <span className="flex items-center text-green-700 dark:text-green-300">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  {Object.values(validationResults).filter(r => r.valid).length} 个有效
                </span>
              ) : null}
              {Object.values(validationResults).filter(r => !r.valid).length > 0 ? (
                <span className="flex items-center text-red-700 dark:text-red-300">
                  <XCircle className="h-4 w-4 mr-1" />
                  {Object.values(validationResults).filter(r => !r.valid).length} 个无效
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* 移动端特殊说明 */}
        {window.Capacitor?.isNativePlatform && (
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
            💡 <strong>移动端用户</strong>：你的 API 密钥使用系统加密存储，
            即使应用关闭也会安全保存。清除应用数据会删除所有密钥。
          </div>
        )}
      </CardContent>
    </Card>
  );
}
