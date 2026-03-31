import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

function getAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export class AdminService {
  // --- Auth ---
  async checkAdmin(userId: string): Promise<boolean> {
    const client = getAdminClient();
    const { data } = await client
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();
    return data?.is_admin === true;
  }

  // --- Books ---
  async listBooks() {
    const client = getAdminClient();
    return client.from('books').select('*').order('book_number');
  }

  async upsertBook(book: Record<string, unknown>) {
    const client = getAdminClient();
    return client
      .from('books')
      .upsert(book, { onConflict: 'book_number' })
      .select()
      .single();
  }

  async deleteBook(id: number) {
    const client = getAdminClient();
    return client.from('books').delete().eq('id', id);
  }

  // --- Courses ---
  async listCourses() {
    const client = getAdminClient();
    return client.from('courses').select('*').order('book_id', { ascending: true }).order('course_number', { ascending: true });
  }

  async upsertCourse(course: Record<string, unknown>) {
    const client = getAdminClient();
    return client
      .from('courses')
      .upsert(course, { onConflict: 'book_id,course_number' })
      .select()
      .single();
  }

  async deleteCourse(id: number) {
    const client = getAdminClient();
    return client.from('courses').delete().eq('id', id);
  }

  // --- Characters ---
  async listCharacters() {
    const client = getAdminClient();
    return client.from('characters').select('*').order('id');
  }

  async upsertCharacter(character: Record<string, unknown>) {
    const client = getAdminClient();
    return client.from('characters').upsert(character).select().single();
  }

  async deleteCharacter(id: number) {
    const client = getAdminClient();
    return client.from('characters').delete().eq('id', id);
  }

  // --- Sentences ---
  async listSentences() {
    const client = getAdminClient();
    return client.from('sentences').select('*').order('book_id').order('course_id').order('sentence_order');
  }

  async upsertSentence(sentence: Record<string, unknown>) {
    const client = getAdminClient();
    return client.from('sentences').upsert(sentence).select().single();
  }

  async deleteSentence(id: number) {
    const client = getAdminClient();
    return client.from('sentences').delete().eq('id', id);
  }

  // --- Import helpers ---
  async getCharacterByName(nameJp: string) {
    const client = getAdminClient();
    return client.from('characters').select('id').eq('name_jp', nameJp).limit(1);
  }

  async updateBookTotalCourses(bookId: number) {
    const client = getAdminClient();
    const { data: courses } = await client.from('courses').select('id').eq('book_id', bookId);
    return client.from('books').update({ total_courses: courses?.length || 0 }).eq('id', bookId);
  }
}

export const adminService = new AdminService();
