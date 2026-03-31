'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/zen/Icon';
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

  if (!mounted) return null;

  const schemes: { key: ColorScheme; label: string; desc: string; icon: string; colors: { bg: string; label: string }[] }[] = [
    {
      key: 'warm',
      label: '温馨可爱',
      desc: '温暖柔和的日式配色',
      icon: 'favorite',
      colors: [
        { bg: 'bg-[#ec4899]', label: '樱花粉' },
        { bg: 'bg-[#a78bfa]', label: '藤紫' },
        { bg: 'bg-[#fbbf24]', label: '琥珀' },
        { bg: 'bg-[#22c55e]', label: '竹绿' },
      ],
    },
    {
      key: 'cool',
      label: '科技未来',
      desc: '冷色调科技感配色',
      icon: 'auto_awesome',
      colors: [
        { bg: 'bg-[#57f1db]', label: '霓虹青' },
        { bg: 'bg-[#b9c8de]', label: '银灰' },
        { bg: 'bg-[#ffd29f]', label: '金色' },
        { bg: 'bg-[#60a5fa]', label: '电光蓝' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Icon name="palette" size={18} className="text-primary" />
        <h3 className="font-headline font-bold text-on-surface">配色方案</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {schemes.map((scheme) => (
          <button
            key={scheme.key}
            onClick={() => handleSchemeChange(scheme.key)}
            className={`relative p-4 rounded-xl text-left transition-all active:scale-[0.98] ${
              currentScheme === scheme.key
                ? 'bg-primary/15 ring-1 ring-primary/30'
                : 'bg-surface-container-high hover:bg-surface-container-highest'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon name={scheme.icon} size={18} className={currentScheme === scheme.key ? 'text-primary' : 'text-secondary'} />
              <span className={`font-headline font-bold text-sm ${currentScheme === scheme.key ? 'text-primary' : 'text-on-surface'}`}>
                {scheme.label}
              </span>
            </div>
            <div className="flex gap-1.5 mb-2">
              {scheme.colors.map((color) => (
                <div key={color.label} className={`w-6 h-6 rounded-full ${color.bg} border-2 border-white/10`} title={color.label} />
              ))}
            </div>
            <p className="text-xs text-secondary/60 font-body">{scheme.desc}</p>
            {currentScheme === scheme.key && (
              <div className="absolute top-3 right-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-start gap-2 text-secondary/40 text-xs font-label pt-1">
        <Icon name="info" size={14} className="mt-0.5 flex-shrink-0" />
        <span>设置将在所有页面立即生效</span>
      </div>
    </div>
  );
}
