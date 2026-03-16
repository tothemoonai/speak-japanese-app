'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { shareService } from '@/services/supabase/share.service';
import { ShareContentCard } from '@/components/share/ShareCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, Home } from 'lucide-react';

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [share, setShare] = useState<(Share & { user?: { nickname?: string; avatar_url?: string } }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShare() {
      if (!code) {
        setError('无效的分享链接');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data, error: err } = await shareService.getShareByCode(code);

      if (err) {
        setError(err.message === 'Share has expired' ? '此分享已过期' : '加载失败');
      } else {
        setShare(data);
      }

      setIsLoading(false);
    }

    fetchShare();
  }, [code]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">加载中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !share) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 mb-2">加载失败</p>
            <p className="text-sm text-muted-foreground mb-6">{error || '找不到此分享'}</p>
            <Link href="/">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                返回首页
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold">IT日语</h1>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                开始学习
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <ShareContentCard share={share} />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>想要分享你的学习成果吗？</p>
            <Link href="/register" className="text-primary hover:underline">
              立即注册开始学习
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
