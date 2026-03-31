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
