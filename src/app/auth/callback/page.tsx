'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');

      try {
        if (accessToken && refreshToken) {
          // 设置session
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;

          if (type === 'signup') {
            setMessage('注册成功！邮箱已确认');
            setStatus('success');

            // 2秒后跳转到登录页
            setTimeout(() => {
              router.push('/login');
            }, 2000);
          } else if (type === 'recovery') {
            setMessage('密码重置成功！请设置新密码');
            setStatus('success');

            // 跳转到设置密码页面（如果有的话）
            setTimeout(() => {
              router.push('/settings');
            }, 2000);
          } else {
            setMessage('验证成功！');
            setStatus('success');

            // 跳转到dashboard
            setTimeout(() => {
              router.push('/dashboard');
            }, 1000);
          }
        } else if (type === 'email_change') {
          setMessage('邮箱已成功更改');
          setStatus('success');
          setTimeout(() => {
            router.push('/settings');
          }, 2000);
        } else {
          // 没有token，检查是否有错误
          const error = searchParams.get('error');
          const errorDescription = searchParams.get('error_description');

          if (error) {
            setMessage(errorDescription || '验证失败');
            setStatus('error');
          } else {
            // 默认成功（可能是已经验证过的情况）
            setMessage('验证成功！');
            setStatus('success');
            setTimeout(() => {
              router.push('/login');
            }, 1500);
          }
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setMessage('验证失败：' + (error.message || '未知错误'));
        setStatus('error');
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-12 pb-12 flex flex-col items-center text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <h2 className="text-xl font-semibold mb-2">正在验证...</h2>
              <p className="text-sm text-muted-foreground">请稍候</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">成功！</h2>
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
              <div className="w-full">
                <Link href="/login" className="block">
                  <Button className="w-full">
                    前往登录
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">验证失败</h2>
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
              <div className="space-y-2 w-full">
                <Link href="/login" className="block">
                  <Button className="w-full">
                    前往登录
                  </Button>
                </Link>
                <Link href="/register" className="block">
                  <Button variant="outline" className="w-full">
                    重新注册
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

export default function AuthCallbackPage() {
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
      <AuthCallbackContent />
    </Suspense>
  );
}
