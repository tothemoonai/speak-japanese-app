import { useState, useEffect } from 'react';
import { reportService } from '@/services/supabase/report.service';
import type { DailyReport, WeeklyReport, MonthlyReport } from '@/types';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Hook for fetching daily report
 */
export function useDailyReport(userId: string, date: string) {
  const [data, setData] = useState<DailyReport | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      if (!userId || !date) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data: report, error: err } = await reportService.getDailyReport(userId, date);
      setData(report);
      setError(err);
      setIsLoading(false);
    }

    fetchReport();
  }, [userId, date]);

  return { data, error, isLoading };
}

/**
 * Hook for fetching weekly report
 */
export function useWeeklyReport(userId: string, year: number, weekNumber: number) {
  const [data, setData] = useState<WeeklyReport | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      if (!userId || !year || !weekNumber) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data: report, error: err } = await reportService.getWeeklyReport(
        userId,
        year,
        weekNumber
      );
      setData(report);
      setError(err);
      setIsLoading(false);
    }

    fetchReport();
  }, [userId, year, weekNumber]);

  return { data, error, isLoading };
}

/**
 * Hook for fetching monthly report
 */
export function useMonthlyReport(userId: string, year: number, month: number) {
  const [data, setData] = useState<MonthlyReport | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      if (!userId || !year || !month) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data: report, error: err } = await reportService.getMonthlyReport(
        userId,
        year,
        month
      );
      setData(report);
      setError(err);
      setIsLoading(false);
    }

    fetchReport();
  }, [userId, year, month]);

  return { data, error, isLoading };
}

/**
 * Hook for fetching overall statistics
 */
export function useOverallStats(userId: string) {
  const [data, setData] = useState<{
    total_practice_count: number;
    total_study_time: number;
    average_score: number;
    best_score: number;
    courses_completed: number;
    current_streak: number;
  } | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data: stats, error: err } = await reportService.getOverallStats(userId);
      setData(stats);
      setError(err);
      setIsLoading(false);
    }

    fetchStats();
  }, [userId]);

  return { data, error, isLoading };
}
