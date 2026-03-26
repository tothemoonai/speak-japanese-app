'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookList } from '@/components/book/BookList';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Mic,
  TrendingUp,
  Trophy,
  Target,
  LogOut,
  Sparkles,
  ArrowUpRight,
  Flame,
  BarChart,
} from 'lucide-react';
import { getUserLevel } from '@/lib/utils/user';
import { userProgressService } from '@/services/supabase/userProgress.service';
import { supabase } from '@/lib/supabase/client';
import { Footer } from '@/components/layout/Footer';

export const dynamic = 'force-dynamic';

interface UserStats {
  total_practices: number;
  average_score: number;
  courses_completed: number;
  achievements_count: number;
  today_practices: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    total_practices: 0,
    average_score: 0,
    courses_completed: 0,
    achievements_count: 0,
    today_practices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.push('/login');
    }
  }, [user, router, mounted]);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 获取基础统计数据（如果表结构不存在，返回默认值）
      let stats = { total_practices: 0, average_score: 0, courses_completed: 0 };
      try {
        const result = await userProgressService.getUserStats(user.id);
        if (result) {
          stats = result;
        }
      } catch (statsError) {
        // practice_records 表结构可能不完整，使用默认值
        console.warn('统计数据不可用，使用默认值');
      }

      // 获取成就数量（如果表不存在，返回0）
      let achievementsCount = 0;
      try {
        const supabaseClient = supabase();
        const { data: achievements, error: achievementsError } = await supabaseClient
          .from('user_achievements')
          .select('id')
          .eq('user_id', user.id);

        if (!achievementsError && achievements) {
          achievementsCount = achievements.length;
        }
      } catch (achievementsError) {
        // user_achievements 表可能不存在，使用默认值
        console.warn('成就数据不可用，使用默认值');
      }

      // 获取今日练习次数
      let todayPractices = 0;
      try {
        const supabaseClient = supabase();
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 设置为今天的00:00:00

        const { data: todayRecords, error: todayError } = await supabaseClient
          .from('practice_records')
          .select('id')
          .eq('user_id', user.id)
          .gte('started_at', today.toISOString())
          .not('completed_at', 'is', null); // 只统计已完成的练习

        if (!todayError && todayRecords) {
          todayPractices = todayRecords.length;
        }
      } catch (todayError) {
        console.warn('今日练习数据不可用，使用默认值');
      }

      setUserStats({
        total_practices: stats.total_practices,
        average_score: stats.average_score,
        courses_completed: stats.courses_completed,
        achievements_count: achievementsCount,
        today_practices: todayPractices,
      });
    } catch (error) {
      // 任何其他错误也使用默认值
      console.warn('获取用户统计时出错，使用默认值');
      setUserStats({
        total_practices: 0,
        average_score: 0,
        courses_completed: 0,
        achievements_count: 0,
        today_practices: 0,
      });
    } finally {
      setLoading(false);
    }
  };

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

  const totalCourses = 32;

  return (
    <div className="min-h-screen">
      {/* Header - 玻璃态效果 */}
      <header className="glass sticky top-0 z-50">
        <div
          className="container mx-auto px-1.5 sm:px-2 py-2 sm:py-3"
          style={{ paddingTop: '0' }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gradient-sakura">
                IT日语
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                通过AI技术，沉浸式学习日语
              </p>
            </div>
            <nav className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-sm">
                  首页
                </Button>
              </Link>
              <Link href="/books">
                <Button variant="ghost" size="sm" className="text-sm">
                  <BookOpen className="h-4 w-4 mr-1" />
                  课本
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="ghost" size="sm" className="text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  学习报告
                </Button>
              </Link>
              <Badge
                variant="outline"
                className="border-sakura/50 text-sakura text-xs"
              >
                {getUserLevel(user) === 'beginner' && '初级'}
                {getUserLevel(user) === 'intermediate' && '中级'}
                {getUserLevel(user) === 'advanced' && '高级'}
              </Badge>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-1.5 sm:px-2 py-3 sm:py-4 md:py-6">
        {/* Welcome Section - 带动画 */}
        <div className="mb-4 sm:mb-6 animate-fade-up">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-sakura animate-glow" />
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                欢迎回来，
                <span className="text-gradient-sakura">
                  {user.nickname ||
                    user.user_metadata?.nickname ||
                    user.email?.split('@')[0] ||
                    '学员'}
                  ！
                </span>
              </h2>
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            继续你的IT日语练习之旅。每一次练习，都让你离流利更近一步。
          </p>
        </div>

        {/* Stats Cards - 增强版 */}
        <Card className="mb-2 sm:mb-6 card-gradient-border animate-fade-up delay-100">
          <CardContent className="p-1 sm:p-3">
            <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-3">
              {/* 总练习次数 */}
              <div className="stat-card stat-card-sakura flex flex-col items-center justify-center gap-0.5 p-1 sm:p-2 rounded-lg">
                <Mic className="h-3 w-3 sm:h-4 sm:w-4 text-sakura flex-shrink-0" />
                {loading ? (
                  <div className="text-sm font-bold text-muted-foreground">-</div>
                ) : (
                  <div className="flex items-baseline gap-0">
                    <span className="text-sm sm:text-lg font-bold text-sakura-dark dark:text-sakura-light">
                      {userStats.total_practices}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">次</span>
                  </div>
                )}
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  总练习
                </span>
              </div>

              {/* 平均分数 */}
              <div className="stat-card stat-card-blue flex flex-col items-center justify-center gap-0.5 p-1 sm:p-2 rounded-lg">
                <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-japan-blue flex-shrink-0" />
                {loading ? (
                  <div className="text-sm font-bold text-muted-foreground">-</div>
                ) : (
                  <div className="flex items-baseline gap-0">
                    <span className="text-sm sm:text-lg font-bold text-japan-blue-dark dark:text-japan-blue-light">
                      {userStats.average_score}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">分</span>
                  </div>
                )}
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  平均分
                </span>
              </div>

              {/* 已完成课程 */}
              <div className="stat-card stat-card-green flex flex-col items-center justify-center gap-0.5 p-1 sm:p-2 rounded-lg">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-bamboo flex-shrink-0" />
                {loading ? (
                  <div className="text-sm font-bold text-muted-foreground">-</div>
                ) : (
                  <div className="flex items-baseline gap-0">
                    <span className="text-sm sm:text-lg font-bold text-bamboo">
                      {userStats.courses_completed}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      /{totalCourses}
                    </span>
                  </div>
                )}
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  已完成
                </span>
              </div>

              {/* 获得成就 */}
              <div className="stat-card stat-card-orange flex flex-col items-center justify-center gap-0.5 p-1 sm:p-2 rounded-lg">
                <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-maple flex-shrink-0" />
                {loading ? (
                  <div className="text-sm font-bold text-muted-foreground">-</div>
                ) : (
                  <div className="flex items-baseline gap-0">
                    <span className="text-sm sm:text-lg font-bold text-maple">
                      {userStats.achievements_count}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">个</span>
                  </div>
                )}
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  成就
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - 紧凑卡片 */}
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 mb-3 sm:mb-8">
          <Link href="/books" className="group col-span-1">
            <Card className="card-enhanced h-full">
              <CardContent className="p-1.5">
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left">
                  {/* 图标 */}
                  <div className="p-1 rounded-lg bg-gradient-sakura flex-shrink-0">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  {/* 文字内容 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[11px] sm:text-sm font-bold mb-0 truncate leading-tight">继续学习</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {totalCourses}门课程
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/books" className="group col-span-1">
            <Card className="card-enhanced h-full">
              <CardContent className="p-1.5">
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left">
                  <div className="p-1 rounded-lg bg-gradient-japan-blue flex-shrink-0">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[11px] sm:text-sm font-bold mb-0 truncate leading-tight">每日目标</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      今日{userStats.today_practices}/3次
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reports" className="group col-span-2 sm:col-span-1">
            <Card className="card-enhanced h-full">
              <CardContent className="p-1.5">
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left">
                  <div className="p-1 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex-shrink-0">
                    <BarChart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[11px] sm:text-sm font-bold mb-0 truncate leading-tight">学习报告</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      学习成果
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Courses */}
        <div className="animate-fade-up delay-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-sakura" />
              <h3 className="text-2xl font-bold">课本列表</h3>
            </div>
            <Link href="/books">
              <Button variant="outline" size="sm" className="group">
                查看全部
                <ArrowUpRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
          <BookList userId={user.id} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
