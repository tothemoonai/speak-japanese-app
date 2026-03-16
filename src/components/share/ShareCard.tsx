'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Share2, Eye, Calendar } from 'lucide-react';
import type { Share } from '@/types';
import { formatDateTime } from '@/lib/utils/format';

interface ShareCardProps {
  share: Share;
  onShare?: () => void;
}

const shareTypeLabels = {
  practice: '练习成果',
  course: '课程完成',
  achievement: '成就',
};

export function ShareCard({ share, onShare }: ShareCardProps) {
  const isExpired = share.expires_at && new Date(share.expires_at) < new Date();

  return (
    <Card className={isExpired ? 'opacity-50' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{share.title || '分享'}</CardTitle>
            {share.description && (
              <CardDescription className="mt-1">{share.description}</CardDescription>
            )}
          </div>
          <Badge variant="outline">{shareTypeLabels[share.share_type]}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{share.click_count} 次查看</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(share.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          {isExpired && (
            <Badge variant="destructive">已过期</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ShareContentCardProps {
  share: Share & { user?: { nickname?: string; avatar_url?: string } };
}

export function ShareContentCard({ share }: ShareContentCardProps) {
  const shareTypeLabels = {
    practice: '练习成果',
    course: '课程完成',
    achievement: '成就',
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Share2 className="h-6 w-6 text-primary" />
          <Badge variant="outline">{shareTypeLabels[share.share_type]}</Badge>
        </div>
        <CardTitle className="text-2xl">{share.title || '分享'}</CardTitle>
        {share.description && (
          <CardDescription className="text-base mt-2">{share.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User info */}
        {share.user && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>来自 {share.user.nickname || '学习者'} 的分享</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{share.click_count} 次查看</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDateTime(share.created_at)}</span>
          </div>
        </div>

        {/* CTA */}
        {!share.expires_at || new Date(share.expires_at) > new Date() ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              想要分享你的学习成果吗？
            </p>
            <a href="/register" className="inline-block">
              <Button>开始学习</Button>
            </a>
          </div>
        ) : (
          <div className="text-center">
            <Badge variant="destructive">此分享已过期</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
