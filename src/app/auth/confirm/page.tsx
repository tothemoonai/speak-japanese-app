'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function AuthConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // 检查URL参数
    const error = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const type = searchParams.get('type');

    if (error) {
      setStatus('error');
      if (errorCode === 'otp_expired') {
        setMessage('邮箱确认链接已过期，请重新注册');
      } else if (errorCode === 'access_denied') {
        setMessage('邮箱确认失败，链接无效');
      } else {
        setMessage('邮箱确认失败：' + error);
      }
    } else if (type === 'email_change') {
      setStatus('success');
      setMessage('邮箱已成功确认！');
    } else if (type === 'signup') {
      setStatus('success');
      setMessage('注册成功！您现在可以登录了');
    } else if (type === 'recovery') {
      setStatus('success');
      setMessage('密码重置链接已确认');
    } else {
      // 默认成功状态（Supabase在后台处理确认）
      setStatus('success');
      setMessage('邮箱已成功确认！');
    }

    // 3秒后自动跳转到登录页
    if (!error && type !== 'recovery') {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-12 pb-12 flex flex-col items-center text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <h2 className="text-xl font-semibold mb-2">正在确认邮箱...</h2>
              <p className="text-sm text-muted-foreground">请稍候</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">确认成功！</h2>
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
              <div className="space-y-2 w-full">
                <Link href="/login" className="block">
                  <Button className="w-full">
                    前往登录
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground">
                  页面将在3秒后自动跳转...
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">确认失败</h2>
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
              <div className="space-y-2 w-full">
                <Link href="/register" className="block">
                  <Button variant="outline" className="w-full">
                    重新注册
                  </Button>
                </Link>
                <Link href="/login" className="block">
                  <Button className="w-full">
                    前往登录
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12 flex flex-col items-center text-center">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <h2 className="text-xl font-semibold mb-2">正在加载...</h2>
          </CardContent>
        </Card>
      </div>
    }>
      <AuthConfirmContent />
    </Suspense>
  );
}
