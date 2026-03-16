'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CourseList } from '@/components/course/CourseList';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Mic, TrendingUp, Trophy, Target, LogOut, User, Settings } from 'lucide-react';
import { getUserLevel } from '@/lib/utils/user';

// 强制动态渲染，因为页面依赖用户认证状态
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.push('/login');
    }
  }, [user, router, mounted]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!mounted || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-10" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4" style={{ paddingTop: '0' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-primary">IT日语</h1>
            <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
              <Link href="/dashboard" className="flex-shrink-0">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  首页
                </Button>
              </Link>
              <Link href="/courses" className="flex-shrink-0">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span className="hidden xs:inline">课程</span>
                </Button>
              </Link>
              <Link href="/reports" className="flex-shrink-0">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="hidden xs:inline">学习报告</span>
                </Button>
              </Link>
              <span className="text-xs text-muted-foreground hidden md:inline truncate max-w-[100px]">
                {user.nickname || user.user_metadata?.nickname || user.email}
              </span>
              <Badge variant="outline" className="text-xs">
                {getUserLevel(user) === 'beginner' && '初级'}
                {getUserLevel(user) === 'intermediate' && '中级'}
                {getUserLevel(user) === 'advanced' && '高级'}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs sm:text-sm">
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden xs:inline">登出</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            欢迎回来，{user.nickname || user.user_metadata?.nickname || user.email.split('@')[0]}！
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            继续你的IT日语练习之旅
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                总练习次数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">12</div>
                <Mic className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                本周 +3 次
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                平均分数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">85</div>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                比上周 +5 分
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                已完成课程
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">3</div>
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                共 32 门课程
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                获得成就
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">5</div>
                <Trophy className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                总共 20 个成就
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/courses">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  继续学习
                </CardTitle>
                <CardDescription>
                  查看所有可用课程
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  32 门课程等待你学习
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/courses">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  每日目标
                </CardTitle>
                <CardDescription>
                  完成每日练习目标
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  今日已完成 0/3 次练习
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reports">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  学习报告
                </CardTitle>
                <CardDescription>
                  查看学习进度和成绩
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  追踪你的学习成果
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Courses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">课程列表</h3>
            <Link href="/courses">
              <Button variant="outline" size="sm">
                查看全部
              </Button>
            </Link>
          </div>
          <CourseList userId={user.id} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; 2026 IT日语. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/settings" className="hover:text-foreground">
                <Settings className="h-4 w-4 inline mr-1" />
                设置
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
