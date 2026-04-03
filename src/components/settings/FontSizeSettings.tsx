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
      </CardContent>
    </Card>
  );
}
