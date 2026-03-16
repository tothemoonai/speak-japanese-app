import { renderHook, waitFor, act } from '@testing-library/react';
import { useCourses, useCourse, useCoursesFilter, useCourseCharacters, useCourseSentences, useThemes } from '@/hooks/useCourse';
import { courseService } from '@/services/supabase/course.service';

// Mock the supabase client first to avoid ESM import issues
jest.mock('@/lib/supabase/client', () => ({
  supabase: jest.fn(() => ({
    from: jest.fn(),
  })),
}));

// Mock the courseService
jest.mock('@/services/supabase/course.service');

const mockCourseService = courseService as jest.Mocked<typeof courseService>;

describe('useCourse Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useCourses', () => {
    it('should fetch courses without userId', async () => {
      const mockCourses = [
        { id: 1, title: 'Course 1', progress: 0 },
        { id: 2, title: 'Course 2', progress: 0 },
      ];

      mockCourseService.getAllCourses.mockResolvedValue({
        data: mockCourses,
        error: null,
      });

      const { result } = renderHook(() => useCourses());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockCourses);
      expect(result.current.error).toBeNull();
      expect(mockCourseService.getAllCourses).toHaveBeenCalledWith(undefined);
    });

    it('should fetch courses with userId', async () => {
      const mockCourses = [
        { id: 1, title: 'Course 1', progress: 50 },
      ];

      mockCourseService.getAllCourses.mockResolvedValue({
        data: mockCourses,
        error: null,
      });

      const { result } = renderHook(() => useCourses('user-123'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockCourses);
      expect(mockCourseService.getAllCourses).toHaveBeenCalledWith('user-123');
    });

    it('should handle errors', async () => {
      const mockError = { message: 'Failed to fetch', code: 'ERROR' };

      mockCourseService.getAllCourses.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(mockError);
    });

    it('should refetch courses', async () => {
      const mockCourses = [{ id: 1, title: 'Course 1', progress: 0 }];

      mockCourseService.getAllCourses.mockResolvedValue({
        data: mockCourses,
        error: null,
      });

      const { result } = renderHook(() => useCourses());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockCourseService.getAllCourses.mockClear();

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockCourseService.getAllCourses).toHaveBeenCalledTimes(1);
    });
  });

  describe('useCourse', () => {
    it('should fetch course by id', async () => {
      const mockCourse = {
        id: 1,
        title: 'Course 1',
        progress: 50,
        characters: [{ id: 1, text: 'Char 1' }],
        sentences: [{ id: 1, text: 'Sentence 1' }],
      };

      mockCourseService.getCourseById.mockResolvedValue({
        data: mockCourse,
        error: null,
      });

      const { result } = renderHook(() => useCourse(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockCourse);
      expect(mockCourseService.getCourseById).toHaveBeenCalledWith(1, undefined);
    });

    it('should fetch course by id with userId', async () => {
      const mockCourse = {
        id: 1,
        title: 'Course 1',
        progress: 75,
      };

      mockCourseService.getCourseById.mockResolvedValue({
        data: mockCourse,
        error: null,
      });

      const { result } = renderHook(() => useCourse(1, 'user-123'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockCourseService.getCourseById).toHaveBeenCalledWith(1, 'user-123');
    });

    it('should not fetch when courseId is null', async () => {
      const { result } = renderHook(() => useCourse(0));

      // When courseId is 0, the hook synchronously sets isLoading to false
      expect(result.current.isLoading).toBe(false);

      expect(mockCourseService.getCourseById).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const mockError = { message: 'Course not found', code: '404' };

      mockCourseService.getCourseById.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { result } = renderHook(() => useCourse(999));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useCoursesFilter', () => {
    it('should fetch courses with filter', async () => {
      const mockCourses = [
        { id: 1, title: 'Beginner Course', progress: 0 },
      ];

      const filter = { difficulty: 'beginner' };

      mockCourseService.getCoursesByFilter.mockResolvedValue({
        data: mockCourses,
        error: null,
      });

      const { result } = renderHook(() => useCoursesFilter(filter));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockCourses);
      expect(mockCourseService.getCoursesByFilter).toHaveBeenCalledWith(filter, undefined);
    });

    it('should fetch courses with filter and userId', async () => {
      const mockCourses = [{ id: 1, title: 'Course 1', progress: 50 }];

      const filter = { difficulty: 'intermediate' };

      mockCourseService.getCoursesByFilter.mockResolvedValue({
        data: mockCourses,
        error: null,
      });

      const { result } = renderHook(() => useCoursesFilter(filter, 'user-123'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockCourseService.getCoursesByFilter).toHaveBeenCalledWith(filter, 'user-123');
    });

    it('should refetch when filter changes', async () => {
      const mockCourses = [{ id: 1, title: 'Course 1', progress: 0 }];

      mockCourseService.getCoursesByFilter.mockResolvedValue({
        data: mockCourses,
        error: null,
      });

      const { result, rerender } = renderHook(
        ({ filter }) => useCoursesFilter(filter),
        { initialProps: { filter: { difficulty: 'beginner' } } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockCourseService.getCoursesByFilter).toHaveBeenCalledTimes(1);

      rerender({ filter: { difficulty: 'advanced' } });

      await waitFor(() => {
        expect(mockCourseService.getCoursesByFilter).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle errors', async () => {
      const mockError = { message: 'Filter error', code: 'ERROR' };

      mockCourseService.getCoursesByFilter.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { result } = renderHook(() => useCoursesFilter({ difficulty: 'beginner' }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useCourseCharacters', () => {
    it('should fetch course characters', async () => {
      const mockCharacters = [
        { id: 1, text: 'Char 1', reading: 'reading 1' },
        { id: 2, text: 'Char 2', reading: 'reading 2' },
      ];

      mockCourseService.getCourseCharacters.mockResolvedValue({
        data: mockCharacters,
        error: null,
      });

      const { result } = renderHook(() => useCourseCharacters(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockCharacters);
      expect(mockCourseService.getCourseCharacters).toHaveBeenCalledWith(1);
    });

    it('should not fetch when courseId is null', async () => {
      const { result } = renderHook(() => useCourseCharacters(0));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockCourseService.getCourseCharacters).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const mockError = { message: 'Characters not found', code: '404' };

      mockCourseService.getCourseCharacters.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { result } = renderHook(() => useCourseCharacters(999));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useCourseSentences', () => {
    it('should fetch course sentences', async () => {
      const mockSentences = [
        { id: 1, text: 'Sentence 1', translation: 'Translation 1' },
        { id: 2, text: 'Sentence 2', translation: 'Translation 2' },
      ];

      mockCourseService.getCourseSentences.mockResolvedValue({
        data: mockSentences,
        error: null,
      });

      const { result } = renderHook(() => useCourseSentences(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockSentences);
      expect(mockCourseService.getCourseSentences).toHaveBeenCalledWith(1);
    });

    it('should not fetch when courseId is null', async () => {
      const { result } = renderHook(() => useCourseSentences(0));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockCourseService.getCourseSentences).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const mockError = { message: 'Sentences not found', code: '404' };

      mockCourseService.getCourseSentences.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { result } = renderHook(() => useCourseSentences(999));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useThemes', () => {
    it('should fetch themes', async () => {
      const mockThemes = ['travel', 'business', 'daily'];

      mockCourseService.getThemes.mockResolvedValue({
        data: mockThemes,
        error: null,
      });

      const { result } = renderHook(() => useThemes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockThemes);
      expect(mockCourseService.getThemes).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const mockError = { message: 'Themes not found', code: 'ERROR' };

      mockCourseService.getThemes.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { result } = renderHook(() => useThemes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(mockError);
    });

    it('should refetch themes', async () => {
      const mockThemes = ['travel', 'business'];

      mockCourseService.getThemes.mockResolvedValue({
        data: mockThemes,
        error: null,
      });

      const { result } = renderHook(() => useThemes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockCourseService.getThemes.mockClear();

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockCourseService.getThemes).toHaveBeenCalledTimes(1);
    });
  });
});
