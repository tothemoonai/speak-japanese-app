'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ColorComparisonPage() {
  const [showHsl, setShowHsl] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">🎨 配色方案对比测试</h1>
        <p className="text-muted-foreground">
          对比预览页面和实际应用的配色差异
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Preview Page Colors */}
          <Card>
            <CardHeader>
              <CardTitle>预览页面定义的颜色</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Primary (#7766eb)</h3>
                <div
                  className="h-20 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: '#7766eb' }}
                >
                  Primary
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  RGB(119, 102, 235)
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Secondary (#2563eb)</h3>
                <div
                  className="h-20 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: '#2563eb' }}
                >
                  Secondary
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  RGB(37, 99, 235)
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Success (#22c55e)</h3>
                <div
                  className="h-20 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: '#22c55e' }}
                >
                  Success
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  RGB(34, 197, 94)
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Warning (#f59e0b)</h3>
                <div
                  className="h-20 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: '#f59e0b' }}
                >
                  Warning
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  RGB(245, 158, 11)
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Danger (#ef4444)</h3>
                <div
                  className="h-20 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  Danger
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  RGB(239, 68, 68)
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Sakura (#ec4899)</h3>
                <div
                  className="h-20 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: '#ec4899' }}
                >
                  Sakura
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  RGB(236, 72, 153)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Applied CSS Colors */}
          <Card>
            <CardHeader>
              <CardTitle>实际应用的颜色 (CSS HSL)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Primary (hsl(248, 77%, 66%))</h3>
                <div className="h-20 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  Primary
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  使用CSS变量: --primary-blue
                </p>
                {showHsl && (
                  <p className="text-xs font-mono mt-1">
                    HSL(248, 77%, 66%) → #7766eb ✓
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Secondary (hsl(221, 83%, 53%))</h3>
                <div className="h-20 rounded-lg bg-secondary flex items-center justify-center text-secondary-foreground font-bold">
                  Secondary
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  使用CSS变量: --japan-blue
                </p>
                {showHsl && (
                  <p className="text-xs font-mono mt-1">
                    HSL(221, 83%, 53%) → #2563eb (接近)
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Success (hsl(142, 70%, 45%))</h3>
                <div className="h-20 rounded-lg bg-success flex items-center justify-center text-success-foreground font-bold">
                  Success
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  使用CSS变量: --bamboo
                </p>
                {showHsl && (
                  <p className="text-xs font-mono mt-1">
                    HSL(142, 70%, 45%) → #22c55e (接近)
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Warning (hsl(38, 91%, 50%))</h3>
                <div className="h-20 rounded-lg bg-warning flex items-center justify-center text-warning-foreground font-bold">
                  Warning
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  使用CSS变量: --amber
                </p>
                {showHsl && (
                  <p className="text-xs font-mono mt-1">
                    HSL(38, 91%, 50%) → #f59e0b (接近)
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Danger (hsl(0, 83%, 60%))</h3>
                <div className="h-20 rounded-lg bg-destructive flex items-center justify-center text-destructive-foreground font-bold">
                  Danger
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  使用CSS变量: --danger-red
                </p>
                {showHsl && (
                  <p className="text-xs font-mono mt-1">
                    HSL(0, 83%, 60%) → #ef4444 (接近)
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Sakura (hsl(330, 79%, 60%))</h3>
                <div className="h-20 rounded-lg bg-sakura flex items-center justify-center text-white font-bold">
                  Sakura
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  使用CSS变量: --sakura
                </p>
                {showHsl && (
                  <p className="text-xs font-mono mt-1">
                    HSL(330, 79%, 60%) → #ec4899 (接近)
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Explanation */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <h3 className="font-bold text-lg mb-3">📝 说明</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>主要颜色 (Primary)</strong> 已经完全匹配预览页面 (#7766eb)
              </p>
              <p>
                其他颜色的差异是由于HSL到RGB转换的精度限制造成的，通常只有1-2个RGB值的差异，
                在实际显示中几乎无法区分。
              </p>
              <p>
                <strong>视觉影响</strong>: 这些微小的差异在实际应用中不会影响用户体验。
              </p>
              <p className="mt-4">
                <strong>建议</strong>: 如果您觉得差异明显，我可以：
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>直接使用RGB/十六进制值替代HSL值</li>
                <li>调整预览页面以匹配实际的HSL值</li>
                <li>接受当前配置（差异极小，不影响使用）</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Toggle HSL Info */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowHsl(!showHsl)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            {showHsl ? '隐藏' : '显示'} HSL转换信息
          </button>
        </div>

        {/* Side-by-Side Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>并排对比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">预览页面 Primary</p>
                <div
                  className="h-16 rounded flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: '#7766eb' }}
                >
                  #7766eb
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">实际应用 Primary</p>
                <div className="h-16 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  CSS Primary
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              观察两个颜色块，它们的差异应该几乎不可见
            </p>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="flex gap-4 justify-center">
          <a
            href="/color-scheme-preview.html"
            target="_blank"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            查看预览页面
          </a>
          <a
            href="/test-professional-theme"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            查看测试页面
          </a>
        </div>
      </div>
    </div>
  );
}
