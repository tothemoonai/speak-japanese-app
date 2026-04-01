import type { Metadata } from 'next';
import { Space_Grotesk, Manrope, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { FontSizeProvider } from '@/components/providers/FontSizeProvider';
import { ColorSchemeProvider } from '@/components/providers/ColorSchemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { cn } from "@/lib/utils";

/**
 * Editorial Tech-Zen Typography
 * - Space Grotesk: Engineered geometric for headlines
 * - Manrope: Versatile sans-serif for body
 * - Plus Jakarta Sans: Labels and micro-copy
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'IT業務日本語',
  description: 'AI搭載のIT業務日本語スピーキング練習プラットフォーム',
  keywords: ['日本語', 'IT業務日本語', 'AI学習', 'スピーキング練習'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={cn(
        spaceGrotesk.variable,
        manrope.variable,
        plusJakartaSans.variable,
        "dark font-body"
      )}
      data-scroll-behavior="smooth"
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="bg-surface text-on-surface min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ColorSchemeProvider>
            <FontSizeProvider>
              <AuthProvider>{children}</AuthProvider>
              <Toaster />
            </FontSizeProvider>
          </ColorSchemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
