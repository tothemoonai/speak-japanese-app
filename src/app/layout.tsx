import type { Metadata } from 'next';
import { Noto_Sans_JP, Outfit, JetBrains_Mono, Geist } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { FontSizeProvider } from '@/components/providers/FontSizeProvider';
import { ColorSchemeProvider } from '@/components/providers/ColorSchemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

/**
 * 字体配置 - Tech-Zen Modern 美学
 *
 * - Noto Sans JP: 现代日式字体，用于标题和日文内容
 * - Outfit: 几何无衬线字体，科技感，用于英文标题和 UI
 * - JetBrains Mono: 等宽字体，用于代码和数据展示
 */

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
  weight: ['400', '500', '700', '900'],
});

const outfit = Outfit({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'IT日语',
  description: '通过AI技术，帮助你进行沉浸式的IT日语练习',
  keywords: ['日语', '口语练习', 'IT日语', 'AI学习'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={cn(notoSansJP.variable, outfit.variable, jetbrainsMono.variable, "font-sans", geist.variable)}
      data-scroll-behavior="smooth"
    >
      <body
        className="
          font-sans
          bg-gradient-mesh
          dark:bg-gradient-mesh-dark
          min-h-screen
        "
      >
        <ColorSchemeProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <FontSizeProvider>
              <AuthProvider>{children}</AuthProvider>
              <Toaster />
            </FontSizeProvider>
          </ThemeProvider>
        </ColorSchemeProvider>
      </body>
    </html>
  );
}
