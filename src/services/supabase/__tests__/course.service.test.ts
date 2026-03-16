import { CourseService } from '@/services/supabase/course.service';
import type { CourseFilter } from '@/types';
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

describe('CourseService', () => {
  let courseService: CourseService;
  let mockFrom: any;
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Get reference to the mock
    const { supabase: supabaseFn } = require('@/lib/supabase/client');
    mockClient = supabaseFn();
    mockFrom = mockClient.from;

    courseService = new CourseService();
  });

  describe('getAllCourses', () => {
    it('should fetch all courses without user', async () => {
      const mockCourses = [
        { id: 1, title_cn: '基础日语', title_jp: '基礎日本語', theme: '日常', difficulty: 'beginner', sort_order: 1 },
        { id: 2, title_cn: '旅行日语', title_jp: '旅行日本語', theme: '旅行', difficulty: 'intermediate', sort_order: 2 },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockCourses,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await courseService.getAllCourses();

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockCourses);
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.order).toHaveBeenCalledWith('sort_order', { ascending: true });
    });

    it('should fetch courses with user progress', async () => {
      const mockCourses = [
        { id: 1, title_cn: '基础日语', title_jp: '基礎日本語', theme: '日常', difficulty: 'beginner', sort_order: 1 },
      ];

      const mockPractices = [
        { course_id: 1, completed_at: '2025-01-09', total_score: 85, id: 1 },
      ];

      let callCount = 0;
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({ data: mockCourses, error: null });
          } else {
            return Promise.resolve({ data: mockPractices, error: null });
          }
        }),
      };

      const mockInnerQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockPractices,
          error: null,
        }),
      };

      mockFrom.mockImplementation((table: string) => {
        if (table === 'courses') {
          return mockQuery;
        } else {
          return mockInnerQuery;
        }
      });

      const result = await courseService.getAllCourses('user-123');

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data![0]).toHaveProperty('progress');
      expect(result.data![0]).toHaveProperty('status');
      expect(result.data![0].status).toBe('in_progress');
    });

    it('should handle database errors', async () => {
      const mockError: PostgrestError = {
        message: 'Database connection failed',
        code: 'PGRST116',
        details: '',
        hint: '',
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await courseService.getAllCourses();

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should calculate completed status for high scores', async () => {
      const mockCourses = [
        { id: 1, title_cn: '基础日语', title_jp: '基礎日本語', theme: '日常', difficulty: 'beginner', sort_order: 1 },
      ];

      const mockPractices = [
        { course_id: 1, completed_at: '2025-01-09', total_score: 95, id: 1 },
      ];

      let callCount = 0;
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({ data: mockCourses, error: null });
          } else {
            return Promise.resolve({ data: mockPractices, error: null });
          }
        }),
      };

      const mockInnerQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockPractices,
          error: null,
        }),
      };

      mockFrom.mockImplementation((table: string) => {
        if (table === 'courses') {
          return mockQuery;
        } else {
          return mockInnerQuery;
        }
      });

      const result = await courseService.getAllCourses('user-123');

      expect(result.data![0].status).toBe('completed');
      expect(result.data![0].progress).toBe(100);
      expect(result.data![0].best_score).toBe(95);
    });
  });

  describe('getCourseById', () => {
    it('should fetch course by ID', async () => {
      const mockCourse = { id: 1, title_cn: '基础日语', title_jp: '基礎日本語', theme: '日常', difficulty: 'beginner' };
      const mockCharacters = [{ id: 1, course_id: 1, name_cn: '田中', name_jp: 'タナカ' }];
      const mockSentences = [{ id: 1, course_id: 1, text_jp: 'こんにちは', text_cn: '你好', sentence_order: 1 }];

      const mockQueryForCourse = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCourse, error: null }),
      };

      const mockQueryForOthers = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      let fromCallCount = 0;
      mockFrom.mockImplementation((table: string) => {
        fromCallCount++;
        if (fromCallCount === 1) {
          return mockQueryForCourse;
        } else if (fromCallCount === 2) {
          mockQueryForOthers.order.mockResolvedValueOnce({ data: mockCharacters, error: null });
          return mockQueryForOthers;
        } else if (fromCallCount === 3) {
          mockQueryForOthers.order.mockResolvedValueOnce({ data: mockSentences, error: null });
          return mockQueryForOthers;
        } else {
          return mockQueryForOthers;
        }
      });

      const result = await courseService.getCourseById(1);

      expect(result.error).toBeNull();
      expect(result.data).toHaveProperty('id', 1);
      expect(result.data).toHaveProperty('characters');
      expect(result.data).toHaveProperty('sentences');
      expect(result.data!.characters).toEqual(mockCharacters);
      expect(result.data!.sentences).toEqual(mockSentences);
    });

    it('should return error for non-existent course', async () => {
      const mockError: PostgrestError = {
        message: 'Course not found',
        code: 'PGRST116',
        details: '',
        hint: '',
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await courseService.getCourseById(999);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should include user progress when userId provided', async () => {
      const mockCourse = { id: 1, title_cn: '基础日语', title_jp: '基礎日本語', theme: '日常', difficulty: 'beginner' };
      const mockCharacters = [];
      const mockSentences = [];
      const mockPractices = [
        { course_id: 1, completed_at: '2025-01-09', total_score: 88, id: 1 },
      ];

      const mockQueryForCourse = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCourse, error: null }),
      };

      const mockQueryForOthers = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      let fromCallCount = 0;
      mockFrom.mockImplementation((table: string) => {
        fromCallCount++;
        if (fromCallCount === 1) {
          return mockQueryForCourse;
        } else if (fromCallCount === 2) {
          mockQueryForOthers.order.mockResolvedValueOnce({ data: mockCharacters, error: null });
          return mockQueryForOthers;
        } else if (fromCallCount === 3) {
          mockQueryForOthers.order.mockResolvedValueOnce({ data: mockSentences, error: null });
          return mockQueryForOthers;
        } else if (fromCallCount === 4) {
          mockQueryForOthers.order.mockResolvedValueOnce({ data: mockPractices, error: null });
          return mockQueryForOthers;
        } else {
          return mockQueryForOthers;
        }
      });

      const result = await courseService.getCourseById(1, 'user-123');

      expect(result.data).toHaveProperty('progress');
      expect(result.data).toHaveProperty('status');
      expect(result.data!.status).toBe('in_progress');
      expect(result.data!.best_score).toBe(88);
    });

    it('should handle empty characters and sentences', async () => {
      const mockCourse = { id: 1, title_cn: '基础日语', title_jp: '基礎日本語', theme: '日常', difficulty: 'beginner' };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCourse, error: null }),
        order: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await courseService.getCourseById(1);

      expect(result.data!.characters).toEqual([]);
      expect(result.data!.sentences).toEqual([]);
    });
  });

  describe('getCoursesByFilter', () => {
    it('should filter by difficulty', async () => {
      const mockCourses = [
        { id: 1, title_cn: '基础日语', title_jp: '基礎日本語', theme: '日常', difficulty: 'beginner', sort_order: 1 },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockCourses,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const filter: CourseFilter = { difficulty: ['beginner'] };
      const result = await courseService.getCoursesByFilter(filter);

      expect(result.error).toBeNull();
      expect(mockQuery.in).toHaveBeenCalledWith('difficulty', ['beginner']);
    });

    it('should filter by theme', async () => {
      const mockCourses = [
        { id: 1, title_cn: '旅行日语', title_jp: '旅行日本語', theme: '旅行', difficulty: 'intermediate', sort_order: 1 },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockCourses,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const filter: CourseFilter = { theme: ['旅行'] };
      const result = await courseService.getCoursesByFilter(filter);

      expect(result.error).toBeNull();
      expect(mockQuery.in).toHaveBeenCalledWith('theme', ['旅行']);
    });

    it('should filter by search term', async () => {
      const mockCourses = [
        { id: 1, title_cn: '商务日语', title_jp: 'ビジネス日本語', theme: '商务', difficulty: 'advanced', sort_order: 1 },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockCourses,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const filter: CourseFilter = { search: '商务' };
      const result = await courseService.getCoursesByFilter(filter);

      expect(result.error).toBeNull();
      expect(mockQuery.or).toHaveBeenCalledWith(expect.stringContaining('商务'));
    });

    it('should filter by status when userId provided', async () => {
      const mockCourses = [
        { id: 1, title_cn: '基础日语', title_jp: '基礎日本語', theme: '日常', difficulty: 'beginner', sort_order: 1 },
        { id: 2, title_cn: '旅行日语', title_jp: '旅行日本語', theme: '旅行', difficulty: 'intermediate', sort_order: 2 },
      ];

      const mockPractices = [
        { course_id: 1, completed_at: '2025-01-09', total_score: 85 },
      ];

      const mockQueryForCourses = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockCourses,
          error: null,
        }),
      };

      const mockQueryForPractices = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: mockPractices,
          error: null,
        }),
      };

      let fromCallCount = 0;
      mockFrom.mockImplementation((table: string) => {
        fromCallCount++;
        if (fromCallCount === 1) {
          return mockQueryForCourses;
        } else {
          return mockQueryForPractices;
        }
      });

      const filter: CourseFilter = { status: ['in_progress'] };
      const result = await courseService.getCoursesByFilter(filter, 'user-123');

      expect(result.error).toBeNull();
      // Should filter out course with no practices
      expect(result.data).toHaveLength(1);
    });

    it('should apply combined filters', async () => {
      const mockCourses = [
        { id: 1, title_cn: '基础日常日语', title_jp: '基礎日常日本語', theme: '日常', difficulty: 'beginner', sort_order: 1 },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockCourses,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const filter: CourseFilter = {
        difficulty: ['beginner'],
        theme: ['日常'],
        search: '日语',
      };
      const result = await courseService.getCoursesByFilter(filter);

      expect(result.error).toBeNull();
      expect(mockQuery.in).toHaveBeenCalledTimes(2);
    });

    it('should handle no filters', async () => {
      const mockCourses = [
        { id: 1, title_cn: '基础日语', title_jp: '基礎日本語', theme: '日常', difficulty: 'beginner', sort_order: 1 },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockCourses,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const filter: CourseFilter = {};
      const result = await courseService.getCoursesByFilter(filter);

      expect(result.error).toBeNull();
      expect(mockQuery.in).not.toHaveBeenCalled();
      expect(mockQuery.or).not.toHaveBeenCalled();
    });
  });

  describe('getCourseCharacters', () => {
    it('should fetch characters for a course', async () => {
      const mockCharacters = [
        { id: 1, course_id: 1, name_cn: '田中', name_jp: 'タナカ', description: '上班族' },
        { id: 2, course_id: 1, name_cn: '佐藤', name_jp: 'サトウ', description: '学生' },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockCharacters,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await courseService.getCourseCharacters(1);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockCharacters);
      expect(mockQuery.eq).toHaveBeenCalledWith('course_id', 1);
      expect(mockQuery.order).toHaveBeenCalledWith('id', { ascending: true });
    });

    it('should return empty array when no characters', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await courseService.getCourseCharacters(1);

      expect(result.error).toBeNull();
      expect(result.data).toBeNull();
    });

    it('should handle errors', async () => {
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

      const result = await courseService.getCourseCharacters(1);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('getCourseSentences', () => {
    it('should fetch sentences for a course', async () => {
      const mockSentences = [
        { id: 1, course_id: 1, text_jp: 'こんにちは', text_cn: '你好', sentence_order: 1 },
        { id: 2, course_id: 1, text_jp: 'お元気ですか', text_cn: '你好吗', sentence_order: 2 },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockSentences,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await courseService.getCourseSentences(1);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockSentences);
      expect(mockQuery.eq).toHaveBeenCalledWith('course_id', 1);
      expect(mockQuery.order).toHaveBeenCalledWith('sentence_order', { ascending: true });
    });

    it('should return empty array when no sentences', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await courseService.getCourseSentences(1);

      expect(result.error).toBeNull();
      expect(result.data).toBeNull();
    });

    it('should handle errors', async () => {
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

      const result = await courseService.getCourseSentences(1);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('getThemes', () => {
    it('should fetch unique themes', async () => {
      const mockCourses = [
        { id: 1, theme: '日常' },
        { id: 2, theme: '旅行' },
        { id: 3, theme: '日常' },
        { id: 4, theme: '商务' },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
      };

      const mockPromise = Promise.resolve({
        data: mockCourses,
        error: null,
      });

      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.not.mockReturnValue(mockPromise);

      mockFrom.mockReturnValue(mockQuery);

      const result = await courseService.getThemes();

      expect(result.error).toBeNull();
      expect(result.data).toEqual(['日常', '旅行', '商务']);
      expect(mockQuery.select).toHaveBeenCalledWith('theme');
      expect(mockQuery.not).toHaveBeenCalledWith('theme', 'is', null);
    });

    it('should handle empty results', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
      };

      const mockPromise = Promise.resolve({
        data: [],
        error: null,
      });

      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.not.mockReturnValue(mockPromise);

      mockFrom.mockReturnValue(mockQuery);

      const result = await courseService.getThemes();

      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });

    it('should handle null themes', async () => {
      const mockCourses = [
        { id: 1, theme: '日常' },
        { id: 2, theme: null },
        { id: 3, theme: null },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
      };

      const mockPromise = Promise.resolve({
        data: mockCourses,
        error: null,
      });

      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.not.mockReturnValue(mockPromise);

      mockFrom.mockReturnValue(mockQuery);

      const result = await courseService.getThemes();

      expect(result.error).toBeNull();
      expect(result.data).toEqual(['日常']);
    });

    it('should handle errors', async () => {
      const mockError: PostgrestError = {
        message: 'Database error',
        code: 'PGRST116',
        details: '',
        hint: '',
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
      };

      const mockPromise = Promise.resolve({
        data: null,
        error: mockError,
      });

      mockQuery.select.mockReturnValue(mockQuery);
      mockQuery.not.mockReturnValue(mockPromise);

      mockFrom.mockReturnValue(mockQuery);

      const result = await courseService.getThemes();

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });
});
