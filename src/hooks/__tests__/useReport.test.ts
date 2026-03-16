import { renderHook, waitFor } from '@testing-library/react';
import { useDailyReport, useWeeklyReport, useMonthlyReport, useOverallStats } from '@/hooks/useReport';
import { reportService } from '@/services/supabase/report.service';

// Mock the supabase client first to avoid ESM import issues
jest.mock('@/lib/supabase/client', () => ({
  supabase: jest.fn(() => ({
    from: jest.fn(),
  })),
}));

// Mock the reportService
jest.mock('@/services/supabase/report.service');

const mockReportService = reportService as jest.Mocked<typeof reportService>;

describe('useReport Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useDailyReport', () => {
    it('should fetch daily report', async () => {
      const mockReport = {
        date: '2025-01-09',
        study_time: 300,
        practice_count: 5,
        average_score: 85,
        progress_chart: [],
      };

      mockReportService.getDailyReport.mockResolvedValue({
        data: mockReport,
        error: null,
      });

      const { result } = renderHook(() => useDailyReport('user-123', '2025-01-09'));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockReport);
      expect(result.current.error).toBeNull();
      expect(mockReportService.getDailyReport).toHaveBeenCalledWith('user-123', '2025-01-09');
    });

    it('should not fetch when userId or date is missing', async () => {
      const { result } = renderHook(() => useDailyReport('', '2025-01-09'));

      expect(result.current.isLoading).toBe(false);
      expect(mockReportService.getDailyReport).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const mockError = { message: 'Failed to fetch report', code: 'ERROR' };

      mockReportService.getDailyReport.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { result } = renderHook(() => useDailyReport('user-123', '2025-01-09'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(mockError);
    });

    it('should refetch when date changes', async () => {
      const mockReport = {
        date: '2025-01-09',
        study_time: 300,
        practice_count: 5,
        average_score: 85,
        progress_chart: [],
      };

      mockReportService.getDailyReport.mockResolvedValue({
        data: mockReport,
        error: null,
      });

      const { result, rerender } = renderHook(
        ({ date }) => useDailyReport('user-123', date),
        { initialProps: { date: '2025-01-09' } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockReportService.getDailyReport).toHaveBeenCalledTimes(1);

      rerender({ date: '2025-01-10' });

      await waitFor(() => {
        expect(mockReportService.getDailyReport).toHaveBeenCalledTimes(2);
      });

      expect(mockReportService.getDailyReport).toHaveBeenCalledWith('user-123', '2025-01-10');
    });
  });

  describe('useWeeklyReport', () => {
    it('should fetch weekly report', async () => {
      const mockReport = {
        year: 2025,
        week_number: 2,
        date: '2025-01-06',
        study_time: 1500,
        practice_count: 20,
        average_score: 88,
        progress_chart: [],
      };

      mockReportService.getWeeklyReport.mockResolvedValue({
        data: mockReport,
        error: null,
      });

      const { result } = renderHook(() => useWeeklyReport('user-123', 2025, 2));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockReport);
      expect(mockReportService.getWeeklyReport).toHaveBeenCalledWith('user-123', 2025, 2);
    });

    it('should not fetch when parameters are missing', async () => {
      const { result } = renderHook(() => useWeeklyReport('', 2025, 2));

      expect(result.current.isLoading).toBe(false);
      expect(mockReportService.getWeeklyReport).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const mockError = { message: 'Failed to fetch weekly report', code: 'ERROR' };

      mockReportService.getWeeklyReport.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { result } = renderHook(() => useWeeklyReport('user-123', 2025, 2));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(mockError);
    });

    it('should refetch when week changes', async () => {
      const mockReport = {
        year: 2025,
        week_number: 2,
        date: '2025-01-06',
        study_time: 1500,
        practice_count: 20,
        average_score: 88,
        progress_chart: [],
      };

      mockReportService.getWeeklyReport.mockResolvedValue({
        data: mockReport,
        error: null,
      });

      const { result, rerender } = renderHook(
        ({ week }) => useWeeklyReport('user-123', 2025, week),
        { initialProps: { week: 2 } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockReportService.getWeeklyReport).toHaveBeenCalledTimes(1);

      rerender({ week: 3 });

      await waitFor(() => {
        expect(mockReportService.getWeeklyReport).toHaveBeenCalledTimes(2);
      });

      expect(mockReportService.getWeeklyReport).toHaveBeenCalledWith('user-123', 2025, 3);
    });
  });

  describe('useMonthlyReport', () => {
    it('should fetch monthly report', async () => {
      const mockReport = {
        year: 2025,
        month: 1,
        date: '2025-01-01',
        study_time: 5000,
        practice_count: 50,
        average_score: 87,
        progress_chart: [],
      };

      mockReportService.getMonthlyReport.mockResolvedValue({
        data: mockReport,
        error: null,
      });

      const { result } = renderHook(() => useMonthlyReport('user-123', 2025, 1));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockReport);
      expect(mockReportService.getMonthlyReport).toHaveBeenCalledWith('user-123', 2025, 1);
    });

    it('should not fetch when parameters are missing', async () => {
      const { result } = renderHook(() => useMonthlyReport('', 2025, 1));

      expect(result.current.isLoading).toBe(false);
      expect(mockReportService.getMonthlyReport).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const mockError = { message: 'Failed to fetch monthly report', code: 'ERROR' };

      mockReportService.getMonthlyReport.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { result } = renderHook(() => useMonthlyReport('user-123', 2025, 1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(mockError);
    });

    it('should refetch when month changes', async () => {
      const mockReport = {
        year: 2025,
        month: 1,
        date: '2025-01-01',
        study_time: 5000,
        practice_count: 50,
        average_score: 87,
        progress_chart: [],
      };

      mockReportService.getMonthlyReport.mockResolvedValue({
        data: mockReport,
        error: null,
      });

      const { result, rerender } = renderHook(
        ({ month }) => useMonthlyReport('user-123', 2025, month),
        { initialProps: { month: 1 } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockReportService.getMonthlyReport).toHaveBeenCalledTimes(1);

      rerender({ month: 2 });

      await waitFor(() => {
        expect(mockReportService.getMonthlyReport).toHaveBeenCalledTimes(2);
      });

      expect(mockReportService.getMonthlyReport).toHaveBeenCalledWith('user-123', 2025, 2);
    });
  });

  describe('useOverallStats', () => {
    it('should fetch overall statistics', async () => {
      const mockStats = {
        total_practice_count: 100,
        total_study_time: 10000,
        average_score: 85,
        best_score: 95,
        courses_completed: 5,
        current_streak: 7,
      };

      mockReportService.getOverallStats.mockResolvedValue({
        data: mockStats,
        error: null,
      });

      const { result } = renderHook(() => useOverallStats('user-123'));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockStats);
      expect(mockReportService.getOverallStats).toHaveBeenCalledWith('user-123');
    });

    it('should not fetch when userId is missing', async () => {
      const { result } = renderHook(() => useOverallStats(''));

      expect(result.current.isLoading).toBe(false);
      expect(mockReportService.getOverallStats).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const mockError = { message: 'Failed to fetch stats', code: 'ERROR' };

      mockReportService.getOverallStats.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { result } = renderHook(() => useOverallStats('user-123'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(mockError);
    });

    it('should refetch when userId changes', async () => {
      const mockStats = {
        total_practice_count: 100,
        total_study_time: 10000,
        average_score: 85,
        best_score: 95,
        courses_completed: 5,
        current_streak: 7,
      };

      mockReportService.getOverallStats.mockResolvedValue({
        data: mockStats,
        error: null,
      });

      const { result, rerender } = renderHook(
        ({ userId }) => useOverallStats(userId),
        { initialProps: { userId: 'user-123' } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockReportService.getOverallStats).toHaveBeenCalledTimes(1);

      rerender({ userId: 'user-456' });

      await waitFor(() => {
        expect(mockReportService.getOverallStats).toHaveBeenCalledTimes(2);
      });

      expect(mockReportService.getOverallStats).toHaveBeenCalledWith('user-456');
    });
  });
});
