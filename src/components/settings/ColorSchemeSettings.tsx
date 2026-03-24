'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Sun, Sparkles } from 'lucide-react';
import { getColorScheme, setColorScheme, type ColorScheme } from '@/lib/utils/colorScheme';

export function ColorSchemeSettings() {
  const [currentScheme, setCurrentScheme] = useState<ColorScheme>('warm');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentScheme(getColorScheme());
  }, []);

  const handleSchemeChange = (scheme: ColorScheme) => {
    setCurrentScheme(scheme);
    setColorScheme(scheme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          配色方案
        </CardTitle>
        <CardDescription>
          选择您喜欢的配色风格
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Warm Scheme */}
          <Button
            variant={currentScheme === 'warm' ? 'default' : 'outline'}
            onClick={() => handleSchemeChange('warm')}
            className="h-auto py-4 px-4 flex flex-col items-start gap-3 relative overflow-hidden group"
          >
            <div className="flex items-center gap-2 w-full">
              <Sun className="h-5 w-5" />
              <span className="font-semibold">温馨可爱</span>
            </div>
            <div className="flex gap-1.5 w-full">
              <div className="w-6 h-6 rounded-full bg-[hsl(350_85%_68%)] border-2 border-white/20" title="樱花粉" />
              <div className="w-6 h-6 rounded-full bg-[hsl(215_88%_58%)] border-2 border-white/20" title="日本蓝" />
              <div className="w-6 h-6 rounded-full bg-[hsl(142_71%_45%)] border-2 border-white/20" title="竹绿" />
              <div className="w-6 h-6 rounded-full bg-[hsl(10_85%_58%)] border-2 border-white/20" title="枫红" />
            </div>
            <p className="text-xs text-left opacity-80">
              温暖柔和的日式配色
            </p>
            {currentScheme === 'warm' && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            )}
          </Button>

          {/* Cool Scheme */}
          <Button
            variant={currentScheme === 'cool' ? 'default' : 'outline'}
            onClick={() => handleSchemeChange('cool')}
            className="h-auto py-4 px-4 flex flex-col items-start gap-3 relative overflow-hidden group"
          >
            <div className="flex items-center gap-2 w-full">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">科技未来</span>
            </div>
            <div className="flex gap-1.5 w-full">
              <div className="w-6 h-6 rounded-full bg-[hsl(190_100%_50%)] border-2 border-white/20" title="赛博蓝" />
              <div className="w-6 h-6 rounded-full bg-[hsl(170_100%_50%)] border-2 border-white/20" title="霓虹青" />
              <div className="w-6 h-6 rounded-full bg-[hsl(260_85%_65%)] border-2 border-white/20" title="紫罗兰" />
              <div className="w-6 h-6 rounded-full bg-[hsl(210_100%_55%)] border-2 border-white/20" title="电光蓝" />
            </div>
            <p className="text-xs text-left opacity-80">
              冷色调科技感配色
            </p>
            {currentScheme === 'cool' && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            )}
          </Button>
        </div>

        {/* 说明文字 */}
        <div className="mt-4 text-xs text-muted-foreground">
          <p>💡 提示：</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>温馨可爱：温暖柔和，适合日常学习</li>
            <li>科技未来：冷色调科技感，视觉冲击力强</li>
            <li>设置将在所有页面立即生效</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
