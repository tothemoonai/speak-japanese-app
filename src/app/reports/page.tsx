'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useDailyReport, useWeeklyReport, useOverallStats } from '@/hooks/useReport';
import { DailyReportDisplay, WeeklyReportDisplay } from '@/components/report/DailyReport';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, TrendingUp, Award, Flame, BookOpen, Target } from 'lucide-react';
import { getWeekNumber } from '@/lib/utils/format';

type ReportPeriod = 'daily' | 'weekly' | 'overall';

export default function ReportsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Get current week info
  const currentWeek = getWeekNumber(new Date());
  const currentYear = new Date().getFullYear();

  // Fetch reports
  const { data: dailyReport, isLoading: dailyLoading } = useDailyReport(
    user?.id || '',
    selectedDate
  );

  const { data: weeklyReport, isLoading: weeklyLoading } = useWeeklyReport(
    user?.id || '',
    currentYear,
    currentWeek
  );

  const { data: overallStats, isLoading: overallLoading } = useOverallStats(user?.id || '');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleDateChange = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleWeekChange = (weeks: number) => {
    setPeriod('weekly');
    // Week change logic would be handled by updating currentWeek
    // For simplicity, we'll just stay on current week
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold">学习报告</h1>
            </Link>
            <span className="text-sm text-muted-foreground">
              {user.nickname || user.email}
            </span>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Period Selector */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <Button
              variant={period === 'overall' ? 'default' : 'outline'}
              onClick={() => setPeriod('overall')}
            >
              总览
            </Button>
            <Button
              variant={period === 'weekly' ? 'default' : 'outline'}
              onClick={() => setPeriod('weekly')}
            >
              本周
            </Button>
            <Button
              variant={period === 'daily' ? 'default' : 'outline'}
              onClick={() => setPeriod('daily')}
            >
              当日
            </Button>
          </div>
        </div>

        {/* Overall Stats */}
        {period === 'overall' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">总览统计</h2>
              <p className="text-muted-foreground">你的学习成果总览</p>
            </div>

            {overallLoading ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-muted-foreground">加载中...</p>
                </CardContent>
              </Card>
            ) : overallStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      总练习次数
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">{overallStats.total_practice_count}</div>
                      <Target className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      总学习时长
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">
                        {Math.floor(overallStats.total_study_time / 60)}小时
                      </div>
                      <Calendar className="h-6 w-6 text-muted-foreground" />
                    </div>
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
                      <div className="text-3xl font-bold">{overallStats.average_score}</div>
                      <TrendingUp className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      最高分数
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">{overallStats.best_score}</div>
                      <Award className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      完成课程
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">{overallStats.courses_completed}</div>
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      连续学习
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold">{overallStats.current_streak}天</div>
                      <Flame className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-muted-foreground">暂无数据</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Daily Report */}
        {period === 'daily' && (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold mb-2">当日报告</h2>
                  <p className="text-muted-foreground">查看你的每日学习情况</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateChange(-1)}
                  >
                    前一天
                  </Button>
                  <span className="text-sm px-3 py-1 bg-gray-100 rounded">
                    {selectedDate}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateChange(1)}
                    disabled={selectedDate === new Date().toISOString().split('T')[0]}
                  >
                    后一天
                  </Button>
                </div>
              </div>
            </div>

            {dailyLoading ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-muted-foreground">加载中...</p>
                </CardContent>
              </Card>
            ) : dailyReport ? (
              <DailyReportDisplay report={dailyReport} />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-muted-foreground">暂无数据</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Weekly Report */}
        {period === 'weekly' && (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold mb-2">本周报告</h2>
                  <p className="text-muted-foreground">查看你的每周学习情况</p>
                </div>
                <Badge variant="outline">
                  第 {currentWeek} 周
                </Badge>
              </div>
            </div>

            {weeklyLoading ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-muted-foreground">加载中...</p>
                </CardContent>
              </Card>
            ) : weeklyReport ? (
              <WeeklyReportDisplay report={weeklyReport} />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-muted-foreground">暂无数据</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
