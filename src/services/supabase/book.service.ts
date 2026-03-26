import { supabase } from '@/lib/supabase/client';
import type {
  Book,
  BookWithProgress,
  BookFilter,
} from '@/types';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Book Service
 * Handles all book-related database operations
 */
export class BookService {
  private getClient() {
    return supabase();
  }

  /**
   * Calculate user progress for books
   */
  private async calculateBookProgress(
    books: Book[],
    userId: string
  ): Promise<BookWithProgress[]> {
    const client = this.getClient();
    const bookNumbers = books.map((book) => book.book_number);  // Use book_number (business field)

    // Fetch practice records for user
    const { data: practices } = await client
      .from('practice_records')
      .select('course_id, completed_at, total_score')
      .eq('user_id', userId);

    // Fetch all courses to map books to courses
    const { data: courses } = await client
      .from('courses')
      .select('id, book_id')
      .in('book_id', bookNumbers);  // Use book_number to query courses

    if (!courses) {
      return books.map((book) => ({
        ...book,
        progress: 0,
        completed_courses: 0,
        total_practices: 0,
      }));
    }

    // Calculate progress for each book
    return books.map((book) => {
      const bookCourses = courses.filter((c) => c.book_id === book.book_number);  // Use book_number
      const bookCourseIds = bookCourses.map((c) => c.id);

      const bookPractices = practices?.filter((p) =>
        bookCourseIds.includes(p.course_id)
      ) || [];

      // Count completed courses (score >= 90)
      const completedCourseIds = new Set(
        bookPractices
          .filter((p) => p.total_score && p.total_score >= 90)
          .map((p) => p.course_id)
      );

      const completedCourses = completedCourseIds.size;
      const progress = bookCourses.length > 0
        ? Math.round((completedCourses / bookCourses.length) * 100)
        : 0;

      const lastPracticed = bookPractices.length > 0
        ? bookPractices.sort((a, b) =>
            new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
          )[0].completed_at
        : undefined;

      return {
        ...book,
        progress,
        completed_courses: completedCourses,
        total_practices: bookPractices.length,
        last_practiced_at: lastPracticed,
      };
    });
  }

  /**
   * Get all books with optional user progress
   */
  async getAllBooks(userId?: string): Promise<{
    data: BookWithProgress[] | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();

    const { data, error } = await client
      .from('books')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    // If userId provided, calculate progress
    if (userId && data) {
      const booksWithProgress = await this.calculateBookProgress(data, userId);
      return { data: booksWithProgress, error: null };
    }

    return { data: data, error: null };
  }

  /**
   * Get book by book_number
   */
  async getBookById(bookNumber: number, userId?: string): Promise<{
    data: BookWithProgress | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();

    const { data: book, error } = await client
      .from('books')
      .select('*')
      .eq('book_number', bookNumber)
      .eq('is_published', true)
      .single();

    if (error) {
      return { data: null, error };
    }

    if (!book) {
      return { data: null, error: { message: 'Book not found' } as PostgrestError };
    }

    // If userId provided, calculate progress
    if (userId) {
      const booksWithProgress = await this.calculateBookProgress([book], userId);
      return { data: booksWithProgress[0], error: null };
    }

    return { data: book, error: null };
  }

  /**
   * Get books by filter with optional user progress
   */
  async getBooksByFilter(filter: BookFilter, userId?: string): Promise<{
    data: BookWithProgress[] | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();
    let query = client
      .from('books')
      .select('*')
      .eq('is_published', true);

    // Apply difficulty filter
    if (filter.difficulty && filter.difficulty.length > 0) {
      query = query.in('difficulty', filter.difficulty);
    }

    // Apply target audience filter
    if (filter.target_audience && filter.target_audience.length > 0) {
      query = query.in('target_audience', filter.target_audience);
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

    // If userId provided, calculate progress
    if (userId && data) {
      const booksWithProgress = await this.calculateBookProgress(data, userId);
      return { data: booksWithProgress, error: null };
    }

    return { data: data || [], error: null };
  }
}

// Export singleton instance
export const bookService = new BookService();
