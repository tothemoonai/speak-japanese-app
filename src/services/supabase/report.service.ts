import { supabase } from '@/lib/supabase/client';
import type { DailyReport, WeeklyReport, MonthlyReport } from '@/types';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Report Service
 * Handles all report-related database operations
 */
export class ReportService {
  private getClient() {
    return supabase();
  }

  /**
   * Get daily practice report for a user
   */
  async getDailyReport(userId: string, date: string): Promise<{
    data: DailyReport | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();

    // Get practice records for the specified date
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const { data: practices, error } = await client
      .from('practice_records')
      .select('*')
      .eq('user_id', userId)
      .gte('completed_at', startDate.toISOString())
      .lte('completed_at', endDate.toISOString())
      .order('completed_at', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    if (!practices || practices.length === 0) {
      return {
        data: {
          date,
          study_time: 0,
          practice_count: 0,
          average_score: 0,
          progress_chart: [],
        },
        error: null,
      };
    }

    // Calculate metrics
    const practiceCount = practices.length;
    const averageScore =
      practices.reduce((sum, p) => sum + (p.total_score || 0), 0) / practiceCount;
    const studyTime = practices.reduce((sum, p) => sum + (p.duration_seconds || 0), 0);

    // Create progress chart data (hour by hour)
    const progressChart = this.createProgressChart(practices);

    return {
      data: {
        date,
        study_time: studyTime,
        practice_count: practiceCount,
        average_score: Math.round(averageScore),
        progress_chart: progressChart,
      },
      error: null,
    };
  }

  /**
   * Get weekly practice report for a user
   */
  async getWeeklyReport(
    userId: string,
    year: number,
    weekNumber: number
  ): Promise<{
    data: WeeklyReport | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();

    // Calculate start and end dates of the week
    const startDate = this.getDateOfWeek(year, weekNumber);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const { data: practices, error } = await client
      .from('practice_records')
      .select('*')
      .eq('user_id', userId)
      .gte('completed_at', startDate.toISOString())
      .lte('completed_at', endDate.toISOString())
      .order('completed_at', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    if (!practices || practices.length === 0) {
      // Still create progress chart with 7 days of empty data
      const progressChart = this.createWeeklyProgressChart([], startDate);
      return {
        data: {
          week_number: weekNumber,
          year,
          date: startDate.toISOString().split('T')[0],
          study_time: 0,
          practice_count: 0,
          average_score: 0,
          progress_chart: progressChart,
        },
        error: null,
      };
    }

    // Calculate metrics
    const practiceCount = practices.length;
    const averageScore =
      practices.reduce((sum, p) => sum + (p.total_score || 0), 0) / practiceCount;
    const studyTime = practices.reduce((sum, p) => sum + (p.duration_seconds || 0), 0);

    // Create progress chart data (day by day)
    const progressChart = this.createWeeklyProgressChart(practices, startDate);

    return {
      data: {
        week_number: weekNumber,
        year,
        date: startDate.toISOString().split('T')[0],
        study_time: studyTime,
        practice_count: practiceCount,
        average_score: Math.round(averageScore),
        progress_chart: progressChart,
      },
      error: null,
    };
  }

  /**
   * Get monthly practice report for a user
   */
  async getMonthlyReport(
    userId: string,
    year: number,
    month: number
  ): Promise<{
    data: MonthlyReport | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();

    // Start and end dates of the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const { data: practices, error } = await client
      .from('practice_records')
      .select('*')
      .eq('user_id', userId)
      .gte('completed_at', startDate.toISOString())
      .lte('completed_at', endDate.toISOString())
      .order('completed_at', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    if (!practices || practices.length === 0) {
      return {
        data: {
          month,
          year,
          date: startDate.toISOString().split('T')[0],
          study_time: 0,
          practice_count: 0,
          average_score: 0,
          progress_chart: [],
        },
        error: null,
      };
    }

    // Calculate metrics
    const practiceCount = practices.length;
    const averageScore =
      practices.reduce((sum, p) => sum + (p.total_score || 0), 0) / practiceCount;
    const studyTime = practices.reduce((sum, p) => sum + (p.duration_seconds || 0), 0);

    // Create progress chart data (day by day)
    const progressChart = this.createMonthlyProgressChart(practices, year, month);

    return {
      data: {
        month,
        year,
        date: startDate.toISOString().split('T')[0],
        study_time: studyTime,
        practice_count: practiceCount,
        average_score: Math.round(averageScore),
        progress_chart: progressChart,
      },
      error: null,
    };
  }

  /**
   * Get overall statistics for a user
   */
  async getOverallStats(userId: string): Promise<{
    data: {
      total_practice_count: number;
      total_study_time: number;
      average_score: number;
      best_score: number;
      courses_completed: number;
      current_streak: number;
    } | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();
    const { data: practices, error } = await client
      .from('practice_records')
      .select('total_score, duration_seconds, course_id, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    if (!practices || practices.length === 0) {
      return {
        data: {
          total_practice_count: 0,
          total_study_time: 0,
          average_score: 0,
          best_score: 0,
          courses_completed: 0,
          current_streak: 0,
        },
        error: null,
      };
    }

    const totalPracticeCount = practices.length;
    const totalStudyTime = practices.reduce((sum, p) => sum + (p.duration_seconds || 0), 0);
    const averageScore =
      practices.reduce((sum, p) => sum + (p.total_score || 0), 0) / totalPracticeCount;
    const bestScore = practices.length > 0 ? Math.max(...practices.map((p) => p.total_score || 0)) : 0;

    // Count unique courses with score >= 90
    const completedCourses = new Set(
      practices.filter((p) => (p.total_score || 0) >= 90).map((p) => p.course_id)
    ).size;

    // Calculate current streak
    const currentStreak = this.calculateCurrentStreak(practices);

    return {
      data: {
        total_practice_count: totalPracticeCount,
        total_study_time: totalStudyTime,
        average_score: Math.round(averageScore),
        best_score: bestScore,
        courses_completed: completedCourses,
        current_streak: currentStreak,
      },
      error: null,
    };
  }

  /**
   * Create hourly progress chart for daily report
   */
  private createProgressChart(practices: any[]): any[] {
    const hourlyData: { [hour: number]: { count: number; avgScore: number } } = {};

    practices.forEach((practice) => {
      const hour = new Date(practice.completed_at).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { count: 0, avgScore: 0 };
      }
      hourlyData[hour].count++;
      hourlyData[hour].avgScore =
        (hourlyData[hour].avgScore * (hourlyData[hour].count - 1) +
          (practice.total_score || 0)) /
        hourlyData[hour].count;
    });

    return Object.entries(hourlyData).map(([hour, data]) => ({
      hour: parseInt(hour),
      count: data.count,
      avgScore: Math.round(data.avgScore),
    }));
  }

  /**
   * Create daily progress chart for weekly report
   */
  private createWeeklyProgressChart(practices: any[], startDate: Date): any[] {
    const dailyData: { [day: number]: { count: number; avgScore: number } } = {};

    practices.forEach((practice) => {
      const day = new Date(practice.completed_at).getDay();
      if (!dailyData[day]) {
        dailyData[day] = { count: 0, avgScore: 0 };
      }
      dailyData[day].count++;
      dailyData[day].avgScore =
        (dailyData[day].avgScore * (dailyData[day].count - 1) +
          (practice.total_score || 0)) /
        dailyData[day].count;
    });

    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    return Array.from({ length: 7 }, (_, i) => {
      const day = (startDate.getDay() + i) % 7;
      return {
        day: dayNames[day],
        date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        count: dailyData[day]?.count || 0,
        avgScore: Math.round(dailyData[day]?.avgScore || 0),
      };
    });
  }

  /**
   * Create daily progress chart for monthly report
   */
  private createMonthlyProgressChart(practices: any[], year: number, month: number): any[] {
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyData: { [day: number]: { count: number; avgScore: number } } = {};

    practices.forEach((practice) => {
      const day = new Date(practice.completed_at).getDate();
      if (!dailyData[day]) {
        dailyData[day] = { count: 0, avgScore: 0 };
      }
      dailyData[day].count++;
      dailyData[day].avgScore =
        (dailyData[day].avgScore * (dailyData[day].count - 1) +
          (practice.total_score || 0)) /
        dailyData[day].count;
    });

    return Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      date: new Date(year, month - 1, i + 1).toISOString().split('T')[0],
      count: dailyData[i + 1]?.count || 0,
      avgScore: Math.round(dailyData[i + 1]?.avgScore || 0),
    }));
  }

  /**
   * Get the date of the first day of a given week
   */
  private getDateOfWeek(year: number, weekNumber: number): Date {
    const date = new Date(year, 0, 1);
    const dayOfWeek = date.getDay();
    const diff = (dayOfWeek + 6) % 7; // Adjust so Monday is 0
    date.setDate(date.getDate() - diff + (weekNumber - 1) * 7);
    return date;
  }

  /**
   * Calculate current streak of consecutive days with practice
   */
  private calculateCurrentStreak(practices: any[]): number {
    if (practices.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const practicedDates = new Set(
      practices.map((p) => {
        const date = new Date(p.completed_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    let streak = 0;
    let checkDate = today;

    while (practicedDates.has(checkDate.getTime())) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    }

    return streak;
  }
}

// Export singleton instance
export const reportService = new ReportService();
