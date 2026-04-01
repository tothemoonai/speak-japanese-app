export interface ImportResult {
  success: boolean;
  errors: string[];
  stats: {
    books: number;
    courses: number;
    characters: number;
    sentences: number;
  };
}

export interface ImportData {
  books?: any[];
  courses?: any[];
  characters?: any[];
  sentences?: any[];
}

export function validateImportData(data: any): { valid: boolean; errors: string[]; parsed: ImportData } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid JSON: expected an object'], parsed: {} };
  }

  // Single-course file format: has course_number + sentences (flat)
  if (data.course_number && data.sentences && Array.isArray(data.sentences) && !data.books) {
    if (!data.title_jp) errors.push('course file: missing title_jp');
    if (!data.title_cn) errors.push('course file: missing title_cn');
    for (let i = 0; i < data.sentences.length; i++) {
      const s = data.sentences[i];
      if (!s.text_jp) errors.push(`sentences[${i}]: missing text_jp`);
      if (!s.text_cn) errors.push(`sentences[${i}]: missing text_cn`);
      if (!s.sentence_order) errors.push(`sentences[${i}]: missing sentence_order`);
    }
    // Wrap into nested format for unified processing
    const wrapped = {
      books: [{
        book_number: data.book_number || 1,
        title_jp: data.book_title_jp || 'IT業務日本語',
        title_cn: data.book_title_cn || 'IT业务日语',
        description: data.book_description || null,
        difficulty: data.difficulty || 'N2',
        is_published: true,
        sort_order: data.book_number || 1,
        courses: [{
          course_number: data.course_number,
          title_jp: data.title_jp,
          title_cn: data.title_cn,
          description: data.description || null,
          difficulty: data.difficulty || 'N2',
          theme: data.theme || null,
          sentences: data.sentences.map((s: any) => ({
            sentence_order: s.sentence_order,
            character_id: s.character_id || null,
            text_jp: s.text_jp,
            text_cn: s.text_cn,
            text_furigana: s.text_furigana || null,
            text_romaji: s.text_romaji || null,
            difficulty_level: s.difficulty_level || null,
          })),
        }],
      }],
    };
    return { valid: errors.length === 0, errors, parsed: wrapped };
  }

  // Nested import: books with courses/characters/sentences
  if (data.books && Array.isArray(data.books)) {
    for (let i = 0; i < data.books.length; i++) {
      const book = data.books[i];
      if (!book.title_jp) errors.push(`books[${i}]: missing title_jp`);
      if (!book.title_cn) errors.push(`books[${i}]: missing title_cn`);
      if (!book.book_number) errors.push(`books[${i}]: missing book_number`);

      if (book.courses && Array.isArray(book.courses)) {
        for (let j = 0; j < book.courses.length; j++) {
          const course = book.courses[j];
          if (!course.title_jp) errors.push(`books[${i}].courses[${j}]: missing title_jp`);
          if (!course.title_cn) errors.push(`books[${i}].courses[${j}]: missing title_cn`);
          if (!course.course_number) errors.push(`books[${i}].courses[${j}]: missing course_number`);
        }
      }
    }
    return { valid: errors.length === 0, errors, parsed: data };
  }

  // Flat import: individual entity arrays
  if (data.courses && !Array.isArray(data.courses)) errors.push('courses must be an array');
  if (data.characters && !Array.isArray(data.characters)) errors.push('characters must be an array');
  if (data.sentences && !Array.isArray(data.sentences)) errors.push('sentences must be an array');

  if (!data.books && !data.courses && !data.characters && !data.sentences) {
    errors.push('No valid entity arrays found. Expected: books, courses, characters, or sentences');
  }

  return { valid: errors.length === 0, errors, parsed: data };
}
