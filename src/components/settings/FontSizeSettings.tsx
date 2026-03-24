'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Type } from 'lucide-react';
import {
  getStoredFontSize,
  setStoredFontSize,
  applyFontSize,
  FONT_SIZE_LEVELS,
  type FontSizeLevel,
} from '@/lib/utils/fontSize';

export function FontSizeSettings() {
  const [currentFontSize, setCurrentFontSize] = useState<FontSizeLevel>('medium');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentFontSize(getStoredFontSize());
  }, []);

  const handleFontSizeChange = (level: FontSizeLevel) => {
    setCurrentFontSize(level);
    setStoredFontSize(level);
    applyFontSize(level); // 立即应用字体大小变化
  };

  if (!mounted) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          字体大小
        </CardTitle>
        <CardDescription>
          调整应用中的文字大小，提升阅读体验
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(FONT_SIZE_LEVELS) as FontSizeLevel[]).map((level) => {
            const config = FONT_SIZE_LEVELS[level];
            const isSelected = currentFontSize === level;

            return (
              <Button
                key={level}
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => handleFontSizeChange(level)}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <span className="text-xs">Aa</span>
                <span className="text-sm font-medium">{config.label}</span>
              </Button>
            );
          })}
        </div>

        {/* 预览文本 */}
        <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
          <p className="text-sm font-medium mb-2">预览效果</p>
          <p className="text-base mb-1">IT日语学习平台</p>
          <p className="text-sm text-muted-foreground">
            通过AI技术，帮助你进行沉浸式的IT日语练习
          </p>
        </div>

        {/* 说明文字 */}
        <div className="mt-4 text-xs text-muted-foreground">
          <p>💡 提示：</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>选择适合您的字体大小</li>
            <li>设置将在所有页面生效</li>
            <li>手机上建议使用"小"或"中"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
