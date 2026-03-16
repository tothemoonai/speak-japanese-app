'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DailyReport, WeeklyReport, MonthlyReport } from '@/types';

interface ProgressChartProps {
  data: DailyReport | WeeklyReport | MonthlyReport;
  type: 'daily' | 'weekly' | 'monthly';
}

export function ProgressChart({ data, type }: ProgressChartProps) {
  if (!data.progress_chart || data.progress_chart.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>学习进度</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            暂无数据
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.progress_chart.map((d) => d.count || 0), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>学习进度</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.progress_chart.map((item: any, index) => {
            const height = item.count ? (item.count / maxValue) * 100 : 0;
            const label = type === 'daily'
              ? `${item.hour}:00`
              : type === 'weekly'
              ? item.day
              : `${item.day}日`;

            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-16 text-sm text-muted-foreground text-right shrink-0">
                  {label}
                </div>
                <div className="flex-1 h-8 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 flex items-center justify-end pr-2"
                    style={{ width: `${height}%` }}
                  >
                    {item.count > 0 && (
                      <span className="text-xs text-white font-medium">
                        {item.count}次
                      </span>
                    )}
                  </div>
                </div>
                {item.avgScore > 0 && (
                  <div className="w-12 text-sm text-muted-foreground">
                    {item.avgScore}分
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, unit, description, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">
              {value}
              {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
