'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(email, password, nickname || undefined);

      // 注册成功，显示确认邮件提示
      if (result && result.needsEmailVerification) {
        setIsSuccess(true);
        setRegisteredEmail(email);
      }
    } catch (err: any) {
      setError(err.message || '注册失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <h1 className="sr-only">注册</h1>
        <CardHeader>
          <CardTitle>注册</CardTitle>
          <CardDescription>
            创建一个账户开始学习日语口语
          </CardDescription>
        </CardHeader>

        {isSuccess ? (
          <CardContent className="space-y-4">
            <div className="p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">注册成功！</h3>
              <p className="text-muted-foreground mb-4">
                我们已向 <span className="font-medium">{registeredEmail}</span> 发送了一封确认邮件
              </p>
              <div className="text-left space-y-2 text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-900">接下来：</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>查看您的邮箱并找到确认邮件</li>
                  <li>点击邮件中的确认链接</li>
                  <li>确认后即可登录开始学习</li>
                </ol>
              </div>
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  未收到邮件？请检查垃圾邮件文件夹
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/login')}
                >
                  前往登录页面
                </Button>
              </div>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                邮箱
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="nickname" className="text-sm font-medium">
                昵称（可选）
              </label>
              <Input
                id="nickname"
                type="text"
                placeholder="你的昵称"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                密码
              </label>
              <Input
                id="password"
                type="password"
                placeholder="至少6位"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                确认密码
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '注册中...' : '注册'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              已有账户？{' '}
              <Link href="/login" className="text-primary hover:underline">
                立即登录
              </Link>
            </p>
          </CardFooter>
        </form>
        )}
      </Card>
    </div>
  );
}
