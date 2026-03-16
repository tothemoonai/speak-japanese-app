'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, Check, Copy, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import { shareService } from '@/services/supabase/share.service';
import type { ShareType } from '@/types';

interface ShareButtonProps {
  shareType: ShareType;
  targetId: number;
  title?: string;
  description?: string;
  userId?: string;
  onSuccess?: (shareUrl: string) => void;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ShareButton({
  shareType,
  targetId,
  title,
  description,
  userId,
  onSuccess,
  variant = 'default',
  size = 'default',
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    if (!userId) {
      alert('请先登录');
      return;
    }

    setIsLoading(true);

    try {
      let share;

      if (shareType === 'practice') {
        share = await shareService.sharePracticeResult({
          userId,
          practiceId: targetId,
          score: 85, // This should come from the actual practice result
          courseName: title || '课程',
          description,
        });
      } else if (shareType === 'course') {
        share = await shareService.shareCourseCompletion({
          userId,
          courseId: targetId,
          courseName: title || '课程',
          description,
        });
      } else if (shareType === 'achievement') {
        share = await shareService.shareAchievement({
          userId,
          achievementId: targetId,
          achievementName: title || '成就',
          description,
        });
      }

      if (share.error) {
        throw new Error(share.error.message);
      }

      const url = shareService.getShareUrl(share.data!.share_code);
      setShareUrl(url);
      setIsOpen(true);
      onSuccess?.(url);
    } catch (error) {
      console.error('Share error:', error);
      alert('分享失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'weibo') => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title || '我在学习日语口语');

    let url = '';

    if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    } else if (platform === 'weibo') {
      url = `http://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`;
    }

    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleShare}
        disabled={isLoading}
      >
        {isLoading ? (
          <>分享中...</>
        ) : (
          <>
            <Share2 className="h-4 w-4 mr-2" />
            分享
          </>
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">分享成果</h3>

                {/* URL Copy */}
                <div>
                  <label className="text-sm font-medium mb-2 block">分享链接</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                    />
                    <Button onClick={handleCopy} size="sm" variant="outline">
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          复制
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div>
                  <label className="text-sm font-medium mb-2 block">分享到社交平台</label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSocialShare('twitter')}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Twitter className="h-4 w-4 mr-1" />
                      Twitter
                    </Button>
                    <Button
                      onClick={() => handleSocialShare('facebook')}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Facebook className="h-4 w-4 mr-1" />
                      Facebook
                    </Button>
                    <Button
                      onClick={() => handleSocialShare('weibo')}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      微博
                    </Button>
                  </div>
                </div>

                {/* Close Button */}
                <Button onClick={() => setIsOpen(false)} className="w-full">
                  关闭
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
