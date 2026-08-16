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
      .from('jp_courses')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('course_number', { ascending: true });

    const { data, error } = await query;

    if (error) {
      return { data: null, error };
    }

    // Extract book_number from book_id field (they are the same)
    const coursesWithBookNumber = data.map((course) => ({
      ...course,
      book_number: course.book_id,  // book_id stores book_number
    }));

    // If userId provided, fetch user progress for each course
    let coursesWithProgress: CourseWithProgress[] = coursesWithBookNumber;

    if (userId && data) {
      const courseIds = data.map((course) => course.id);

      // Fetch practice records for these courses
      const { data: practices } = await client
        .from('jp_practice_records')
        .select('course_id, completed_at, total_score, id')
        .eq('user_id', userId)
        .in('course_id', courseIds)
        .order('completed_at', { ascending: false });

      // Map progress to courses
      coursesWithProgress = coursesWithBookNumber.map((course) => {
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

    // Fetch course with book_number (simplified query without JOIN)
    const { data: course, error: courseError } = await client
      .from('jp_courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError) {
      return { data: null, error: courseError };
    }

    // book_id stores book_number directly
    const bookNumber = course.book_id;

    // Fetch characters for this course
    // Use book_id and course_number to query course_characters junction table
    const { data: courseCharacters } = await client
      .from('jp_course_characters')
      .select('character_id, character_order, is_primary, characters(*)')
      .eq('book_id', course.book_id)
      .eq('course_id', course.course_number)
      .order('character_order');

    let characters: Character[] = [];

    if (courseCharacters && courseCharacters.length > 0) {
      // Use junction table data
      characters = courseCharacters.map(cc => ({
        ...cc.characters,
        id: cc.character_id,
        course_id: course.id,
        character_order: cc.character_order,
        is_primary: cc.is_primary
      }));
    } else {
      // No characters found for this course
      characters = [];
    }

    // Fetch sentences for this course using course_number (not id!)
    const { data: sentences } = await client
      .from('jp_sentences')
      .select('*')
      .eq('book_id', course.book_id)
      .eq('course_id', course.course_number)
      .order('sentence_order', { ascending: true });

    // Fetch user progress if userId provided
    let progress = 0;
    let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
    let bestScore: number | undefined;
    let practiceCount = 0;
    let lastPracticed: string | undefined;

    if (userId) {
      const { data: practices } = await client
        .from('jp_practice_records')
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
        book_number: bookNumber,
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
   * Get courses by book ID
   */
  async getCoursesByBookId(bookId: number, userId?: string): Promise<{
    data: CourseWithProgress[] | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();

    const { data, error } = await client
      .from('jp_courses')
      .select('*')
      .eq('book_id', bookId)
      .order('sort_order', { ascending: true })
      .order('course_number', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    // If userId provided, fetch user progress for each course
    let coursesWithProgress: CourseWithProgress[] = data;

    if (userId && data) {
      const courseIds = data.map((course) => course.id);

      // Fetch practice records for these courses
      const { data: practices } = await client
        .from('jp_practice_records')
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
          book_number: course.book_id,  // book_id stores book_number
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
   * Get courses by filter
   */
  async getCoursesByFilter(filter: CourseFilter, userId?: string): Promise<{
    data: CourseWithProgress[] | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();
    let query = client.from('jp_courses').select('*');

    // Apply book_id filter (note: book_id stores book_number)
    if (filter.book_id) {
      query = query.eq('book_id', filter.book_id);
    }

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

    query = query
      .order('sort_order', { ascending: true })
      .order('course_number', { ascending: true });

    const { data, error } = await query;

    if (error) {
      return { data: null, error };
    }

    // Extract book_number from book_id field (they are the same)
    const coursesWithBookNumber = data.map((course) => ({
      ...course,
      book_number: course.book_id,  // book_id stores book_number
    }));

    // Apply status filter and add user progress
    let coursesWithProgress: CourseWithProgress[] = [];

    if (userId && data) {
      const courseIds = data.map((course) => course.id);

      const { data: practices } = await client
        .from('jp_practice_records')
        .select('course_id, completed_at, total_score')
        .eq('user_id', userId)
        .in('course_id', courseIds);

      coursesWithProgress = coursesWithBookNumber
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
    } else if (coursesWithBookNumber) {
      // No user provided, return courses without progress
      coursesWithProgress = coursesWithBookNumber;
    }

    return { data: coursesWithProgress, error: null };
  }

  /**
   * Get course characters
   * Note: courseId parameter is courses.id (primary key)
   * Characters are fetched from course_characters junction table
   */
  async getCourseCharacters(courseId: number): Promise<{
    data: Character[] | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();

    // First get the course to find book_id and course_number
    const { data: course } = await client
      .from('jp_courses')
      .select('book_id, course_number')
      .eq('id', courseId)
      .single();

    if (!course) {
      return { data: null, error: { message: 'Course not found', code: '404' } as PostgrestError };
    }

    // Try course_characters junction table first
    const { data: courseCharacters, error: junctionError } = await client
      .from('jp_course_characters')
      .select('character_id, character_order, is_primary, characters(*)')
      .eq('book_id', course.book_id)  // Add book_id filter
      .eq('course_id', course.course_number)
      .order('character_order');

    if (courseCharacters && courseCharacters.length > 0) {
      // Use junction table data
      const characters = courseCharacters.map(cc => ({
        ...cc.characters,
        id: cc.character_id,
        course_id: courseId,
        character_order: cc.character_order,
        is_primary: cc.is_primary
      }));
      return { data: characters, error: null };
    }

    // No characters found for this course
    return { data: [], error: null };
  }

  /**
   * Get course sentences
   * Note: courseId parameter is courses.id (primary key)
   * But sentences table uses course_number (business field) for course_id
   */
  async getCourseSentences(courseId: number): Promise<{
    data: Sentence[] | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();

    // First get the course to find book_id and course_number
    const { data: course } = await client
      .from('jp_courses')
      .select('book_id, course_number')
      .eq('id', courseId)
      .single();

    if (!course) {
      return { data: null, error: { message: 'Course not found', code: '404' } as PostgrestError };
    }

    // Query sentences using book_id and course_number (not courses.id!)
    const { data, error } = await client
      .from('jp_sentences')
      .select('*')
      .eq('book_id', course.book_id)
      .eq('course_id', course.course_number)
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
      .from('jp_courses')
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
