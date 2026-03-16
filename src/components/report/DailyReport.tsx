'use client';

import { Clock, Trophy, Target } from 'lucide-react';
import { ProgressChart, StatCard } from './ProgressChart';
import type { DailyReport } from '@/types';
import { formatDuration } from '@/lib/utils/format';

interface DailyReportDisplayProps {
  report: DailyReport;
}

export function DailyReportDisplay({ report }: DailyReportDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="练习次数"
          value={report.practice_count}
          unit="次"
          icon={<Target className="h-6 w-6" />}
        />
        <StatCard
          title="学习时长"
          value={formatDuration(report.study_time)}
          icon={<Clock className="h-6 w-6" />}
        />
        <StatCard
          title="平均分数"
          value={report.average_score}
          unit="分"
          icon={<Trophy className="h-6 w-6" />}
        />
      </div>

      {/* Progress Chart */}
      <ProgressChart data={report} type="daily" />
    </div>
  );
}

interface WeeklyReportDisplayProps {
  report: WeeklyReport;
}

export function WeeklyReportDisplay({ report }: WeeklyReportDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">第 {report.week_number} 周</h3>
        <p className="text-sm text-muted-foreground">{report.year}年</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="练习次数"
          value={report.practice_count}
          unit="次"
          icon={<Target className="h-6 w-6" />}
        />
        <StatCard
          title="学习时长"
          value={formatDuration(report.study_time)}
          icon={<Clock className="h-6 w-6" />}
        />
        <StatCard
          title="平均分数"
          value={report.average_score}
          unit="分"
          icon={<Trophy className="h-6 w-6" />}
        />
      </div>

      {/* Progress Chart */}
      <ProgressChart data={report} type="weekly" />
    </div>
  );
}

interface MonthlyReportDisplayProps {
  report: MonthlyReport;
}

export function MonthlyReportDisplay({ report }: MonthlyReportDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">{report.month}月</h3>
        <p className="text-sm text-muted-foreground">{report.year}年</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="练习次数"
          value={report.practice_count}
          unit="次"
          icon={<Target className="h-6 w-6" />}
        />
        <StatCard
          title="学习时长"
          value={formatDuration(report.study_time)}
          icon={<Clock className="h-6 w-6" />}
        />
        <StatCard
          title="平均分数"
          value={report.average_score}
          unit="分"
          icon={<Trophy className="h-6 w-6" />}
        />
      </div>

      {/* Progress Chart */}
      <ProgressChart data={report} type="monthly" />
    </div>
  );
}
