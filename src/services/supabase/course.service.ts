import { supabase } from '@/lib/supabase/client';
import type {
  Course,
  CourseWithProgress,
  CourseFilter,
  Character,
  Sentence,
} from '@/types';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Course Service
 * Handles all course-related database operations
 */
export class CourseService {
  private getClient() {
    return supabase();
  }

  /**
   * Get all courses with optional user progress
   */
  async getAllCourses(userId?: string): Promise<{
    data: CourseWithProgress[] | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();
    let query = client
      .from('courses')
      .select('*')
      .order('sort_order', { ascending: true });

    const { data, error } = await query;

    if (error) {
      return { data: null, error };
    }

    // If userId provided, fetch user progress for each course
    let coursesWithProgress: CourseWithProgress[] = data;

    if (userId && data) {
      const courseIds = data.map((course) => course.id);

      // Fetch practice records for these courses
      const { data: practices } = await client
        .from('practice_records')
        .select('course_id, completed_at, total_score, id')
        .eq('user_id', userId)
        .in('course_id', courseIds)
        .order('completed_at', { ascending: false });

      // Map progress to courses
      coursesWithProgress = data.map((course) => {
        const coursePractices = practices?.filter((p) => p.course_id === course.id) || [];
        const practiceCount = coursePractices.length;
        const bestScore = coursePractices.length > 0
          ? Math.max(...coursePractices.map(p => p.total_score || 0))
          : undefined;
        const lastPracticed = coursePractices.length > 0
          ? coursePractices[0].completed_at
          : undefined;

        let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
        let progress = 0;

        // Simple progress logic: if practiced at least once, in_progress
        // If score >= 90, considered completed
        if (practiceCount > 0) {
          if (bestScore && bestScore >= 90) {
            status = 'completed';
            progress = 100;
          } else {
            status = 'in_progress';
            progress = Math.min(90, practiceCount * 30); // Simple progress calculation
          }
        }

        return {
          ...course,
          progress,
          status,
          last_practiced_at: lastPracticed,
          best_score: bestScore,
          practice_count: practiceCount,
        };
      });
    }

    return { data: coursesWithProgress, error: null };
  }

  /**
   * Get course by ID with characters and sentences
   */
  async getCourseById(courseId: number, userId?: string): Promise<{
    data: (CourseWithProgress & { characters?: Character[]; sentences?: Sentence[] }) | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();

    // Fetch course
    const { data: course, error: courseError } = await client
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError) {
      return { data: null, error: courseError };
    }

    // Fetch characters for this course
    const { data: characters } = await client
      .from('characters')
      .select('*')
      .eq('course_id', courseId)
      .order('id', { ascending: true });

    // Fetch sentences for this course
    const { data: sentences } = await client
      .from('sentences')
      .select('*')
      .eq('course_id', courseId)
      .order('sentence_order', { ascending: true });

    // Fetch user progress if userId provided
    let progress = 0;
    let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
    let bestScore: number | undefined;
    let practiceCount = 0;
    let lastPracticed: string | undefined;

    if (userId) {
      const { data: practices } = await client
        .from('practice_records')
        .select('completed_at, total_score, id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .order('completed_at', { ascending: false });

      if (practices && practices.length > 0) {
        practiceCount = practices.length;
        bestScore = Math.max(...practices.map(p => p.total_score || 0));
        lastPracticed = practices[0].completed_at;

        if (bestScore >= 90) {
          status = 'completed';
          progress = 100;
        } else {
          status = 'in_progress';
          progress = Math.min(90, practiceCount * 30);
        }
      }
    }

    return {
      data: {
        ...course,
        progress,
        status,
        best_score: bestScore,
        practice_count: practiceCount,
        last_practiced_at: lastPracticed,
        characters: characters || [],
        sentences: sentences || [],
      },
      error: null,
    };
  }

  /**
   * Get courses by filter
   */
  async getCoursesByFilter(filter: CourseFilter, userId?: string): Promise<{
    data: CourseWithProgress[] | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();
    let query = client.from('courses').select('*');

    // Apply difficulty filter
    if (filter.difficulty && filter.difficulty.length > 0) {
      query = query.in('difficulty', filter.difficulty);
    }

    // Apply theme filter
    if (filter.theme && filter.theme.length > 0) {
      query = query.in('theme', filter.theme);
    }

    // Apply search filter
    if (filter.search) {
      query = query.or(`title_cn.ilike.%${filter.search}%,title_jp.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
    }

    query = query.order('sort_order', { ascending: true });

    const { data, error } = await query;

    if (error) {
      return { data: null, error };
    }

    // Apply status filter and add user progress
    let coursesWithProgress: CourseWithProgress[] = [];

    if (userId && data) {
      const courseIds = data.map((course) => course.id);

      const { data: practices } = await client
        .from('practice_records')
        .select('course_id, completed_at, total_score')
        .eq('user_id', userId)
        .in('course_id', courseIds);

      coursesWithProgress = data
        .map((course) => {
          const coursePractices = practices?.filter((p) => p.course_id === course.id) || [];
          const practiceCount = coursePractices.length;
          const bestScore = coursePractices.length > 0
            ? Math.max(...coursePractices.map(p => p.total_score || 0))
            : undefined;
          const lastPracticed = coursePractices.length > 0
            ? coursePractices[0].completed_at
            : undefined;

          let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
          let progress = 0;

          if (practiceCount > 0) {
            if (bestScore && bestScore >= 90) {
              status = 'completed';
              progress = 100;
            } else {
              status = 'in_progress';
              progress = Math.min(90, practiceCount * 30);
            }
          }

          return {
            ...course,
            progress,
            status,
            last_practiced_at: lastPracticed,
            best_score: bestScore,
            practice_count: practiceCount,
          };
        })
        .filter((course) => {
          if (filter.status && filter.status.length > 0) {
            return filter.status.includes(course.status!);
          }
          return true;
        });
    } else if (data) {
      // No user provided, return courses without progress
      coursesWithProgress = data;
    }

    return { data: coursesWithProgress, error: null };
  }

  /**
   * Get course characters
   */
  async getCourseCharacters(courseId: number): Promise<{
    data: Character[] | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();
    const { data, error } = await client
      .from('characters')
      .select('*')
      .eq('course_id', courseId)
      .order('id', { ascending: true });

    return { data, error };
  }

  /**
   * Get course sentences
   */
  async getCourseSentences(courseId: number): Promise<{
    data: Sentence[] | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();
    const { data, error } = await client
      .from('sentences')
      .select('*')
      .eq('course_id', courseId)
      .order('sentence_order', { ascending: true });

    return { data, error };
  }

  /**
   * Get unique themes
   */
  async getThemes(): Promise<{
    data: string[] | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();
    const { data, error } = await client
      .from('courses')
      .select('theme')
      .not('theme', 'is', null);

    if (error) {
      return { data: null, error };
    }

    // Extract unique themes
    const themes = [...new Set(data?.map((c) => c.theme).filter(Boolean))] as string[];

    return { data: themes, error: null };
  }
}

// Export singleton instance
export const courseService = new CourseService();
