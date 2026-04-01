'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { AppLayout } from '@/components/ui/zen/AppLayout';
import { BottomNavBar } from '@/components/ui/zen/BottomNavBar';
import { StatCard } from '@/components/ui/zen/StatCard';
import { ProgressBar } from '@/components/ui/zen/ProgressBar';
import { Icon } from '@/components/ui/zen/Icon';
import { BookList } from '@/components/book/BookList';
import { getUserLevel } from '@/lib/utils/user';
import { userProgressService } from '@/services/supabase/userProgress.service';
import { achievementService } from '@/services/supabase/achievement.service';
import { supabase } from '@/lib/supabase/client';
import { Capacitor } from '@capacitor/core';

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

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !user) router.push('/login');
  }, [user, router, mounted]);

  useEffect(() => {
    if (user) fetchUserStats();
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      let stats = { total_practices: 0, average_score: 0, courses_completed: 0 };
      try {
        const result = await userProgressService.getUserStats(user.id);
        if (result) stats = result;
      } catch { console.warn('统计数据不可用，使用默认值'); }

      let achievementsCount = 0;
      try {
        achievementsCount = await achievementService.getUnlockedCount(user.id);
      } catch { console.warn('成就数据不可用'); }

      let todayPractices = 0;
      try {
        const supabaseClient = supabase();
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const { data: todayRecords } = await supabaseClient
          .from('practice_records').select('id')
          .eq('user_id', user.id).gte('started_at', today.toISOString())
          .not('completed_at', 'is', null);
        if (todayRecords) todayPractices = todayRecords.length;
      } catch { console.warn('今日练习数据不可用'); }

      setUserStats({
        total_practices: stats.total_practices,
        average_score: stats.average_score,
        courses_completed: stats.courses_completed,
        achievements_count: achievementsCount,
        today_practices: todayPractices,
      });
    } catch {
      setUserStats({ total_practices: 0, average_score: 0, courses_completed: 0, achievements_count: 0, today_practices: 0 });
    } finally { setLoading(false); }
  };

  if (!mounted || !user) return null;

  const nickname = user.nickname || user.user_metadata?.nickname || user.email?.split('@')[0] || '学習者';
  const totalCourses = 32;
  const todayGoalProgress = Math.min(100, (userStats.today_practices / 3) * 100);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="w-full top-0 sticky z-50 header-gradient">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="font-headline font-bold tracking-tight text-xl text-primary tracking-tighter">
            IT業務日本語
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="font-label text-xs text-secondary opacity-60 uppercase tracking-widest">
              {getUserLevel(user) === 'beginner' && '初級'}
              {getUserLevel(user) === 'intermediate' && '中級'}
              {getUserLevel(user) === 'advanced' && '上級'}
            </p>
            <p className="font-headline font-bold text-on-surface">{nickname}</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden bg-surface-container-high flex items-center justify-center">
            <Icon name="person" size={20} className="text-secondary" />
          </div>
        </div>
        </div>
      </header>

      <main className="px-6 pt-6 pb-32 max-w-7xl mx-auto space-y-10">
        {/* Welcome Section & Stats Bento Grid */}
        <section className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-4">
            <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-surface">
              お帰りなさい、<span className="text-primary">{nickname}</span>
            </h2>
            <p className="text-secondary font-body text-lg max-w-lg leading-relaxed">
              現在<span className="text-primary font-bold">{userStats.courses_completed}コース</span>を修了しています。次の会話をデバッグする準備はできていますか？
            </p>
            <div className={`pt-4 flex ${Capacitor.isNativePlatform() ? 'flex-nowrap gap-3' : 'flex-wrap gap-4'}`}>
              <Link href="/books" className={Capacitor.isNativePlatform() ? 'shrink-0' : ''}>
                <button className={`bg-primary text-primary-foreground font-headline font-bold rounded-xl flex items-center hover:bg-primary-fixed transition-all active:scale-95 shadow-lg shadow-primary/10 ${Capacitor.isNativePlatform() ? 'text-sm px-5 py-3 gap-2' : 'px-8 py-4 gap-3'}`}>
                  学習を再開する
                  <Icon name="play_circle" size={Capacitor.isNativePlatform() ? 16 : 20} />
                </button>
              </Link>
              <Link href="/reports" className={Capacitor.isNativePlatform() ? 'shrink-0' : ''}>
                <button className={`bg-surface-container-high border border-outline-variant/15 text-on-surface font-headline font-semibold rounded-xl hover:bg-surface-container-highest transition-all ${Capacitor.isNativePlatform() ? 'text-sm px-5 py-3' : 'px-8 py-4'}`}>
                  レポートを表示
                </button>
              </Link>
            </div>
          </div>

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-[400px]">
            <StatCard label="練習回数" value={loading ? '-' : userStats.total_practices} />
            <StatCard label="平均スコア" value={loading ? '-' : userStats.average_score} unit="%" />
            <StatCard label="コース数" value={loading ? '-' : userStats.courses_completed} />
            <div className="bg-tertiary/10 p-6 rounded-2xl border border-tertiary/5 flex flex-col justify-between h-32 relative overflow-hidden">
              <div className="absolute -right-2 -bottom-2 opacity-10">
                <Icon name="emoji_events" size={56} fill className="text-tertiary" />
              </div>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-tertiary font-bold">アチーブメント</span>
              <p className="font-headline text-3xl font-bold text-tertiary">{loading ? '-' : userStats.achievements_count}</p>
            </div>
          </div>
        </section>

        {/* Quick Actions Row */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/books" className="block">
            <div className="bg-surface-container-high p-5 rounded-xl flex items-center justify-between group hover:bg-surface-container-highest cursor-pointer transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Icon name="track_changes" size={20} />
                </div>
                <div>
                  <p className="font-headline font-bold text-on-surface">今日の目標</p>
                  <p className="text-[10px] text-secondary opacity-60 font-label tracking-wide uppercase">{todayGoalProgress}% 完了</p>
                </div>
              </div>
              <div className="w-12 h-1 bg-surface-container rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: `${todayGoalProgress}%` }} />
              </div>
            </div>
          </Link>

          <Link href="/reports" className="block">
            <div className="bg-surface-container-high p-5 rounded-xl flex items-center justify-between group hover:bg-surface-container-highest cursor-pointer transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                  <Icon name="analytics" size={20} />
                </div>
                <div>
                  <p className="font-headline font-bold text-on-surface">詳細レポート</p>
                  <p className="text-[10px] text-secondary opacity-60 font-label tracking-wide uppercase">週間インサイト</p>
                </div>
              </div>
              <Icon name="chevron_right" size={20} className="text-secondary opacity-40" />
            </div>
          </Link>

          <Link href="/books" className="block">
            <div className="bg-surface-container-high p-5 rounded-xl flex items-center justify-between group hover:bg-surface-container-highest cursor-pointer transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                  <Icon name="workspace_premium" size={20} />
                </div>
                <div>
                  <p className="font-headline font-bold text-on-surface">チャレンジ</p>
                  <p className="text-[10px] text-secondary opacity-60 font-label tracking-wide uppercase">{totalCourses}コース</p>
                </div>
              </div>
              <Icon name="chevron_right" size={20} className="text-secondary opacity-40" />
            </div>
          </Link>
        </section>

        {/* Recent Courses */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="font-headline text-2xl font-bold tracking-tight">
              最近の<span className="text-primary/70">学習</span>
            </h3>
            <Link href="/books">
              <span className="text-primary font-label text-xs uppercase tracking-widest font-bold hover:underline cursor-pointer">
                すべて見る
              </span>
            </Link>
          </div>
          <BookList userId={user.id} />
        </section>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-6 z-40">
        <Link href="/books">
          <button className="w-16 h-16 rounded-full bg-primary text-primary-foreground btn-shadow-primary flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
            <Icon name="mic" size={28} fill />
          </button>
        </Link>
      </div>

      <BottomNavBar />
    </div>
  );
}
