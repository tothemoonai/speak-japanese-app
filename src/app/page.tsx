'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

function AuthMessageHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAuthMessage, setShowAuthMessage] = useState(false);
  const [authStatus, setAuthStatus] = useState<'success' | 'error' | null>(null);
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    // 检查URL参数，看是否是从邮件确认链接跳转过来的
    const error = searchParams.get('error');
    const type = searchParams.get('type');

    if (error || type) {
      setShowAuthMessage(true);

      if (error) {
        const errorCode = searchParams.get('error_code');
        const errorDescription = searchParams.get('error_description');

        setAuthStatus('error');
        if (errorCode === 'otp_expired') {
          setAuthMessage('邮箱确认链接已过期');
        } else if (errorDescription) {
          setAuthMessage(errorDescription);
        } else {
          setAuthMessage('邮箱确认失败');
        }
      } else if (type === 'signup') {
        setAuthStatus('success');
        setAuthMessage('邮箱已成功确认！请登录');

        // 3秒后自动跳转到登录页
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else if (type === 'email_change') {
        setAuthStatus('success');
        setAuthMessage('邮箱已成功更改');

        // 3秒后自动跳转到设置页
        setTimeout(() => {
          router.push('/settings');
        }, 3000);
      }

      // 清除URL参数
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams, router]);

  if (!showAuthMessage || !authStatus) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 p-4 ${
      authStatus === 'success'
        ? 'bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800'
        : 'bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800'
    }`}>
      <div className="container mx-auto max-w-md">
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          authStatus === 'success'
            ? 'bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800'
            : 'bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800'
        }`}>
          {authStatus === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">
              {authStatus === 'success' ? '确认成功' : '确认失败'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{authMessage}</p>
          </div>
          <button
            onClick={() => setShowAuthMessage(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Auth Message Handler with Suspense */}
      <Suspense fallback={null}>
        <AuthMessageHandler />
      </Suspense>

      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
            IT日语
          </h1>
          <nav className="flex gap-2 sm:gap-4">
            <Link
              href="/login"
              className="px-3 sm:px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm sm:text-base"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
            >
              注册
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 text-center" style={{ paddingTop: 'max(3rem, calc(env(safe-area-inset-top) + 3rem))', paddingBottom: '3rem' }}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            通过AI技术，提升你的日语口语能力
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            基于新概念日本语的IT日语智能对话练习平台
            <br className="hidden sm:block" />
            AI语音识别 + 智能评估 + 个性化反馈
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              href="/register"
              className="px-6 sm:px-8 py-3 bg-primary text-primary-foreground rounded-lg text-base sm:text-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              开始学习
            </Link>
            <Link
              href="/courses"
              className="px-6 sm:px-8 py-3 border-2 border-primary rounded-lg text-base sm:text-lg font-semibold hover:bg-accent transition-colors"
            >
              浏览课程
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            核心功能
          </h3>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <FeatureCard
              title="AI智能评估"
              description="利用大模型对您的口语进行多维度评估，提供精准的改进建议"
              icon="🤖"
            />
            <FeatureCard
              title="情景对话练习"
              description="基于新概念日本语的真实场景对话，沉浸式学习体验"
              icon="💬"
            />
            <FeatureCard
              title="实时语音识别"
              description="浏览器原生语音识别，零延迟，高准确率"
              icon="🎤"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 IT日语. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="p-4 sm:p-6 border rounded-lg hover:shadow-lg transition-shadow">
      <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{icon}</div>
      <h4 className="text-lg sm:text-xl font-semibold mb-2">{title}</h4>
      <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
    </div>
  );
}
