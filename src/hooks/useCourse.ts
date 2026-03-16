import { useState, useEffect, useCallback } from 'react';
import { courseService } from '@/services/supabase/course.service';
import type {
  Course,
  CourseWithProgress,
  CourseFilter,
  Character,
  Sentence,
} from '@/types';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Hook for fetching all courses
 */
export function useCourses(userId?: string) {
  const [data, setData] = useState<CourseWithProgress[] | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    const { data: courses, error: err } = await courseService.getAllCourses(userId);
    setData(courses);
    setError(err);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { data, error, isLoading, refetch: fetchCourses };
}

/**
 * Hook for fetching a single course by ID
 */
export function useCourse(courseId: number, userId?: string) {
  const [data, setData] = useState<(CourseWithProgress & { characters?: Character[]; sentences?: Sentence[] }) | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourse = useCallback(async () => {
    if (!courseId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data: course, error: err } = await courseService.getCourseById(courseId, userId);
    setData(course);
    setError(err);
    setIsLoading(false);
  }, [courseId, userId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return { data, error, isLoading, refetch: fetchCourse };
}

/**
 * Hook for fetching courses with filters
 */
export function useCoursesFilter(filter: CourseFilter, userId?: string) {
  const [data, setData] = useState<CourseWithProgress[] | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    const { data: courses, error: err } = await courseService.getCoursesByFilter(filter, userId);
    setData(courses);
    setError(err);
    setIsLoading(false);
  }, [JSON.stringify(filter), userId]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { data, error, isLoading, refetch: fetchCourses };
}

/**
 * Hook for fetching course characters
 */
export function useCourseCharacters(courseId: number) {
  const [data, setData] = useState<Character[] | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCharacters = useCallback(async () => {
    if (!courseId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data: characters, error: err } = await courseService.getCourseCharacters(courseId);
    setData(characters);
    setError(err);
    setIsLoading(false);
  }, [courseId]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  return { data, error, isLoading, refetch: fetchCharacters };
}

/**
 * Hook for fetching course sentences
 */
export function useCourseSentences(courseId: number) {
  const [data, setData] = useState<Sentence[] | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSentences = useCallback(async () => {
    if (!courseId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data: sentences, error: err } = await courseService.getCourseSentences(courseId);
    setData(sentences);
    setError(err);
    setIsLoading(false);
  }, [courseId]);

  useEffect(() => {
    fetchSentences();
  }, [fetchSentences]);

  return { data, error, isLoading, refetch: fetchSentences };
}

/**
 * Hook for fetching available themes
 */
export function useThemes() {
  const [data, setData] = useState<string[] | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchThemes = useCallback(async () => {
    setIsLoading(true);
    const { data: themes, error: err } = await courseService.getThemes();
    setData(themes);
    setError(err);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  return { data, error, isLoading, refetch: fetchThemes };
}
