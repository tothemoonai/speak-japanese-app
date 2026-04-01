'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useDailyReport, useWeeklyReport, useOverallStats } from '@/hooks/useReport';
import { AchievementGrid } from '@/components/report/AchievementGrid';
import { DailyReportDisplay, WeeklyReportDisplay } from '@/components/report/DailyReport';
import { BottomNavBar } from '@/components/ui/zen/BottomNavBar';
import { StatCard } from '@/components/ui/zen/StatCard';
import { Icon } from '@/components/ui/zen/Icon';
import { cn } from '@/lib/utils';
import { getWeekNumber } from '@/lib/utils/format';

type ReportPeriod = 'daily' | 'weekly' | 'overall';

export default function ReportsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<ReportPeriod>('overall');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const currentWeek = getWeekNumber(new Date());
  const currentYear = new Date().getFullYear();

  const { data: dailyReport, isLoading: dailyLoading } = useDailyReport(user?.id || '', selectedDate);
  const { data: weeklyReport, isLoading: weeklyLoading } = useWeeklyReport(user?.id || '', currentYear, currentWeek);
  const { data: overallStats, isLoading: overallLoading } = useOverallStats(user?.id || '');

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) return null;

  const handleDateChange = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const periodTabs: { key: ReportPeriod; label: string; icon: string }[] = [
    { key: 'overall', label: '総括', icon: 'analytics' },
    { key: 'weekly', label: '週間', icon: 'date_range' },
    { key: 'daily', label: '日次', icon: 'today' },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 header-gradient flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="font-headline font-bold text-primary tracking-tighter text-xl">学習レポート</h1>
        </div>
        <span className="font-label text-xs text-secondary/50 tracking-widest hidden sm:block">
          {user.nickname || user.email?.split('@')[0]}
        </span>
      </header>

      <main className="px-6 pt-6 pb-32 max-w-4xl mx-auto">
        {/* Period Tabs */}
        <section className="mb-8">
          <div className="flex gap-3">
            {periodTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setPeriod(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl font-headline font-bold text-sm transition-all',
                  period === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                )}
              >
                <Icon name={tab.icon} size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Overall Stats */}
        {period === 'overall' && (
          <section className="space-y-6">
            <div>
              <h2 className="font-headline text-2xl font-bold tracking-tight mb-1">総括統計</h2>
              <p className="text-secondary/50 font-body text-sm">あなたの学習成果の概要</p>
            </div>

            {overallLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-32 bg-surface-container-low rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : overallStats ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard
                  label="総練習回数"
                  value={overallStats.total_practice_count}
                  icon="track_changes"
                  accent="primary"
                />
                <StatCard
                  label="総学習時間"
                  value={Math.floor(overallStats.total_study_time / 60)}
                  unit="時間"
                  icon="schedule"
                  accent="secondary"
                />
                <StatCard
                  label="平均スコア"
                  value={overallStats.average_score}
                  icon="trending_up"
                  accent="primary"
                />
                <StatCard
                  label="最高スコア"
                  value={overallStats.best_score}
                  icon="emoji_events"
                  accent="tertiary"
                />
                <StatCard
                  label="完了コース"
                  value={overallStats.courses_completed}
                  icon="menu_book"
                  accent="primary"
                />
                <StatCard
                  label="連続学習"
                  value={overallStats.current_streak}
                  unit="日"
                  icon="local_fire_department"
                  accent="tertiary"
                />
              </div>
            ) : (
              <div className="bg-surface-container-low p-12 rounded-2xl text-center">
                <Icon name="bar_chart" size={48} className="text-secondary/20 mb-4" />
                <p className="text-secondary/50 font-body">まだデータがありません</p>
                <p className="text-secondary/30 text-sm font-body mt-2">練習を始めると統計が表示されます</p>
              </div>
            )}
          </section>
        )}

        {/* Daily Report */}
        {period === 'daily' && (
          <section className="space-y-6">
            <div>
              <h2 className="font-headline text-2xl font-bold tracking-tight mb-1">日次レポート</h2>
              <p className="text-secondary/50 font-body text-sm">毎日の学習状況</p>
            </div>

            {/* Date Navigator */}
            <div className="flex items-center gap-3 bg-surface-container-low px-4 py-3 rounded-xl">
              <button onClick={() => handleDateChange(-1)} className="text-secondary/60 hover:text-primary transition-colors">
                <Icon name="chevron_left" size={20} />
              </button>
              <span className="font-headline font-bold text-on-surface text-sm flex-1 text-center">{selectedDate}</span>
              <button
                onClick={() => handleDateChange(1)}
                disabled={selectedDate === new Date().toISOString().split('T')[0]}
                className={cn(
                  'transition-colors',
                  selectedDate === new Date().toISOString().split('T')[0]
                    ? 'text-secondary/20 cursor-not-allowed'
                    : 'text-secondary/60 hover:text-primary'
                )}
              >
                <Icon name="chevron_right" size={20} />
              </button>
            </div>

            {dailyLoading ? (
              <div className="h-48 bg-surface-container-low rounded-2xl animate-pulse" />
            ) : dailyReport ? (
              <DailyReportDisplay report={dailyReport} />
            ) : (
              <div className="bg-surface-container-low p-12 rounded-2xl text-center">
                <Icon name="event_busy" size={48} className="text-secondary/20 mb-4" />
                <p className="text-secondary/50 font-body">この日のデータはありません</p>
              </div>
            )}
          </section>
        )}

        {/* Weekly Report */}
        {period === 'weekly' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline text-2xl font-bold tracking-tight mb-1">週間レポート</h2>
                <p className="text-secondary/50 font-body text-sm">週ごとの学習推移</p>
              </div>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-label text-xs font-bold tracking-widest">
                第{currentWeek}週
              </span>
            </div>

            {weeklyLoading ? (
              <div className="h-48 bg-surface-container-low rounded-2xl animate-pulse" />
            ) : weeklyReport ? (
              <WeeklyReportDisplay report={weeklyReport} />
            ) : (
              <div className="bg-surface-container-low p-12 rounded-2xl text-center">
                <Icon name="date_range" size={48} className="text-secondary/20 mb-4" />
                <p className="text-secondary/50 font-body">今週のデータはまだありません</p>
              </div>
            )}
          </section>
        )}

        {/* Achievement Grid */}
        {period === 'overall' && (
          <section className="space-y-6 pt-6">
            <div>
              <h2 className="font-headline text-2xl font-bold tracking-tight mb-1">アチーブメント</h2>
              <p className="text-secondary/50 font-body text-sm">獲得した成就一覧</p>
            </div>
            <AchievementGrid userId={user.id} />
          </section>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
