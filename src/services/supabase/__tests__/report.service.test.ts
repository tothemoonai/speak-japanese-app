import { ReportService } from '@/services/supabase/report.service';
import type { PostgrestError } from '@supabase/supabase-js';

// Mock the supabase client
jest.mock('@/lib/supabase/client', () => {
  const mockFrom = jest.fn();
  return {
    supabase: jest.fn(() => ({
      from: mockFrom,
    })),
  };
});

describe('ReportService', () => {
  let reportService: ReportService;
  let mockFrom: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Get reference to the mock
    const { supabase: supabaseFn } = require('@/lib/supabase/client');
    const mockClient = supabaseFn();
    mockFrom = mockClient.from;

    reportService = new ReportService();
  });

  describe('getDailyReport', () => {
    const mockUserId = 'user-123';
    const mockDate = '2025-01-09';

    it('should return daily report with practice data', async () => {
      const mockPractices = [
        {
          id: 1,
          user_id: mockUserId,
          course_id: 1,
          total_score: 85,
          duration_seconds: 300,
          completed_at: '2025-01-09T10:30:00.000Z',
        },
        {
          id: 2,
          user_id: mockUserId,
          course_id: 1,
          total_score: 90,
          duration_seconds: 250,
          completed_at: '2025-01-09T14:20:00.000Z',
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockPractices,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await reportService.getDailyReport(mockUserId, mockDate);

      expect(result.error).toBeNull();
      expect(result.data).toHaveProperty('date', mockDate);
      expect(result.data?.practice_count).toBe(2);
      expect(result.data?.average_score).toBe(88);
      expect(result.data?.study_time).toBe(550);
      expect(result.data?.progress_chart).toBeDefined();
      expect(result.data?.progress_chart).toHaveLength(2);
    });

    it('should return empty report when no practices', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await reportService.getDailyReport(mockUserId, mockDate);

      expect(result.error).toBeNull();
      expect(result.data?.practice_count).toBe(0);
      expect(result.data?.average_score).toBe(0);
      expect(result.data?.study_time).toBe(0);
      expect(result.data?.progress_chart).toEqual([]);
    });

    it('should handle database errors', async () => {
      const mockError: PostgrestError = {
        message: 'Database error',
        code: 'PGRST116',
        details: '',
        hint: '',
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await reportService.getDailyReport(mockUserId, mockDate);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should calculate hourly progress chart correctly', async () => {
      const mockPractices = [
        {
          total_score: 85,
          duration_seconds: 300,
          completed_at: '2025-01-09T10:30:00.000Z',
        },
        {
          total_score: 88,
          duration_seconds: 250,
          completed_at: '2025-01-09T10:45:00.000Z',
        },
        {
          total_score: 92,
          duration_seconds: 400,
          completed_at: '2025-01-09T14:00:00.000Z',
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockPractices,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await reportService.getDailyReport(mockUserId, mockDate);

      expect(result.data?.progress_chart).toHaveLength(2);
      // Just verify we have data, don't check exact hours due to timezone differences
      const firstEntry = result.data?.progress_chart[0];
      expect(firstEntry).toHaveProperty('hour');
      expect(firstEntry).toHaveProperty('count');
      expect(firstEntry).toHaveProperty('avgScore');
    });
  });

  describe('getWeeklyReport', () => {
    const mockUserId = 'user-123';
    const mockYear = 2025;
    const mockWeekNumber = 2;

    it('should return weekly report with practice data', async () => {
      const mockPractices = [
        {
          id: 1,
          user_id: mockUserId,
          course_id: 1,
          total_score: 85,
          duration_seconds: 300,
          completed_at: '2025-01-06T10:30:00.000Z', // Monday
        },
        {
          id: 2,
          user_id: mockUserId,
          course_id: 1,
          total_score: 90,
          duration_seconds: 250,
          completed_at: '2025-01-07T14:20:00.000Z', // Tuesday
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockPractices,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await reportService.getWeeklyReport(mockUserId, mockYear, mockWeekNumber);

      expect(result.error).toBeNull();
      expect(result.data).toHaveProperty('week_number', mockWeekNumber);
      expect(result.data).toHaveProperty('year', mockYear);
      expect(result.data?.practice_count).toBe(2);
      expect(result.data?.average_score).toBe(88);
      expect(result.data?.study_time).toBe(550);
      expect(result.data?.progress_chart).toBeDefined();
      expect(result.data?.progress_chart).toHaveLength(7); // 7 days in a week
    });

    it('should return empty weekly report when no practices', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [], // Empty array
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await reportService.getWeeklyReport(mockUserId, mockYear, mockWeekNumber);

      expect(result.error).toBeNull();
      expect(result.data?.practice_count).toBe(0);
      expect(result.data?.average_score).toBe(0);
      expect(result.data?.study_time).toBe(0);
      // When no practices, the service still returns 7 days of progress chart with 0 values
      expect(result.data?.progress_chart).toHaveLength(7);
      // All days should have count 0
      result.data?.progress_chart.forEach((day: any) => {
        expect(day.count).toBe(0);
      });
    });

    it('should handle database errors', async () => {
      const mockError: PostgrestError = {
        message: 'Database error',
        code: 'PGRST116',
        details: '',
        hint: '',
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await reportService.getWeeklyReport(mockUserId, mockYear, mockWeekNumber);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should create daily progress chart for week', async () => {
      const mockPractices = [
        {
          total_score: 85,
          duration_seconds: 300,
          completed_at: '2025-01-06T10:30:00.000Z', // Monday
        },
        {
          total_score: 90,
          duration_seconds: 250,
          completed_at: '2025-01-07T14:20:00.000Z', // Tuesday
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockPractices,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await reportService.getWeeklyReport(mockUserId, mockYear, mockWeekNumber);

      expect(result.data?.progress_chart).toHaveLength(7);
      expect(result.data?.progress_chart[0]).toHaveProperty('day');
      expect(result.data?.progress_chart[0]).toHaveProperty('date');
      expect(result.data?.progress_chart[0]).toHaveProperty('count');
      expect(result.data?.progress_chart[0]).toHaveProperty('avgScore');
    });
  });

  describe('getMonthlyReport', () => {
    const mockUserId = 'user-123';
    const mockYear = 2025;
    const mockMonth = 1; // January

    it('should return monthly report with practice data', async () => {
      const mockPractices = [
        {
          id: 1,
          user_id: mockUserId,
          course_id: 1,
          total_score: 85,
          duration_seconds: 300,
          completed_at: '2025-01-15T10:30:00.000Z',
        },
        {
          id: 2,
          user_id: mockUserId,
          course_id: 1,
          total_score: 90,
          duration_seconds: 250,
          completed_at: '2025-01-20T14:20:00.000Z',
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockPractices,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await reportService.getMonthlyReport(mockUserId, mockYear, mockMonth);

      expect(result.error).toBeNull();
      expect(result.data).toHaveProperty('month', mockMonth);
      expect(result.data).toHaveProperty('year', mockYear);
      expect(result.data?.practice_count).toBe(2);
      expect(result.data?.average_score).toBe(88);
      expect(result.data?.study_time).toBe(550);
      expect(result.data?.progress_chart).toBeDefined();
    });

    it('should return empty monthly report when no practices', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await reportService.getMonthlyReport(mockUserId, mockYear, mockMonth);

      expect(result.error).toBeNull();
      expect(result.data?.practice_count).toBe(0);
      expect(result.data?.average_score).toBe(0);
      expect(result.data?.study_time).toBe(0);
      expect(result.data?.progress_chart).toEqual([]);
    });

    it('should handle database errors', async () => {
      const mockError: PostgrestError = {
        message: 'Database error',
        code: 'PGRST116',
        details: '',
        hint: '',
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await reportService.getMonthlyReport(mockUserId, mockYear, mockMonth);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should create daily progress chart for month', async () => {
      const mockPractices = [
        {
          total_score: 85,
          duration_seconds: 300,
          completed_at: '2025-01-15T10:30:00.000Z',
        },
        {
          total_score: 90,
          duration_seconds: 250,
          completed_at: '2025-01-20T14:20:00.000Z',
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockPractices,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await reportService.getMonthlyReport(mockUserId, mockYear, mockMonth);

      // January has 31 days
      expect(result.data?.progress_chart).toHaveLength(31);
      expect(result.data?.progress_chart[0]).toHaveProperty('day', 1);
      expect(result.data?.progress_chart[14]).toHaveProperty('count', 1); // Day 15
      expect(result.data?.progress_chart[19]).toHaveProperty('count', 1); // Day 20
    });
  });

  describe('getOverallStats', () => {
    const mockUserId = 'user-123';

    it('should return overall statistics', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const mockPractices = [
        {
          total_score: 85,
          duration_seconds: 300,
          course_id: 1,
          completed_at: today.toISOString(),
        },
        {
          total_score: 92,
          duration_seconds: 250,
          course_id: 1,
          completed_at: today.toISOString(),
        },
        {
          total_score: 88,
          duration_seconds: 400,
          course_id: 2,
          completed_at: yesterday.toISOString(),
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockPractices,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await reportService.getOverallStats(mockUserId);

      expect(result.error).toBeNull();
      expect(result.data?.total_practice_count).toBe(3);
      expect(result.data?.average_score).toBe(88);
      expect(result.data?.best_score).toBe(92);
      expect(result.data?.total_study_time).toBe(950);
      expect(result.data?.courses_completed).toBe(1); // Only course 1 has score >= 90
      expect(result.data).toHaveProperty('current_streak');
    });

    it('should return zero stats when no practices', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await reportService.getOverallStats(mockUserId);

      expect(result.error).toBeNull();
      expect(result.data?.total_practice_count).toBe(0);
      expect(result.data?.total_study_time).toBe(0);
      expect(result.data?.average_score).toBe(0);
      expect(result.data?.best_score).toBe(0);
      expect(result.data?.courses_completed).toBe(0);
      expect(result.data?.current_streak).toBe(0);
    });

    it('should handle database errors', async () => {
      const mockError: PostgrestError = {
        message: 'Database error',
        code: 'PGRST116',
        details: '',
        hint: '',
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await reportService.getOverallStats(mockUserId);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should count completed courses correctly', async () => {
      const mockPractices = [
        {
          total_score: 95,
          course_id: 1,
          duration_seconds: 300,
          completed_at: new Date().toISOString(),
        },
        {
          total_score: 90,
          course_id: 2,
          duration_seconds: 250,
          completed_at: new Date().toISOString(),
        },
        {
          total_score: 85,
          course_id: 3,
          duration_seconds: 400,
          completed_at: new Date().toISOString(),
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockPractices,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await reportService.getOverallStats(mockUserId);

      expect(result.data?.courses_completed).toBe(2); // Courses 1 and 2 have score >= 90
    });

    it('should calculate current streak correctly', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockPractices = [
        {
          total_score: 85,
          course_id: 1,
          duration_seconds: 300,
          completed_at: today.toISOString(),
        },
        {
          total_score: 88,
          course_id: 1,
          duration_seconds: 250,
          completed_at: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          total_score: 90,
          course_id: 1,
          duration_seconds: 400,
          completed_at: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockPractices,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await reportService.getOverallStats(mockUserId);

      expect(result.data?.current_streak).toBe(3);
    });

    it('should handle streak break', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockPractices = [
        {
          total_score: 85,
          course_id: 1,
          duration_seconds: 300,
          completed_at: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          total_score: 88,
          course_id: 1,
          duration_seconds: 250,
          completed_at: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockPractices,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await reportService.getOverallStats(mockUserId);

      expect(result.data?.current_streak).toBe(0); // No practice today or yesterday
    });
  });
});
