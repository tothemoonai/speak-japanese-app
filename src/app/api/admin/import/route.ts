import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/services/supabase/admin.service';
import { validateImportData } from '@/lib/admin/import-validator';

export const runtime = 'nodejs';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return false;
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return false;
  return adminService.checkAdmin(user.id);
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { valid, errors, parsed } = validateImportData(body);

  if (!valid) {
    return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
  }

  const stats = { books: 0, courses: 0, characters: 0, sentences: 0 };
  const importErrors: string[] = [];

  try {
    if (parsed.books?.length) {
      for (const bookData of parsed.books) {
        const { data: book, error: bookErr } = await adminService.upsertBook({
          book_number: bookData.book_number,
          title_jp: bookData.title_jp,
          title_cn: bookData.title_cn,
          description: bookData.description || null,
          difficulty: bookData.difficulty || null,
          is_published: bookData.is_published ?? false,
          sort_order: bookData.sort_order || null,
          total_courses: 0,
        });
        if (bookErr || !book) {
          importErrors.push(`Book ${bookData.book_number}: ${bookErr?.message}`);
          continue;
        }
        stats.books++;

        if (bookData.courses?.length) {
          for (const courseData of bookData.courses) {
            const { data: course, error: courseErr } = await adminService.upsertCourse({
              book_id: bookData.book_number,
              course_number: courseData.course_number,
              title_jp: courseData.title_jp,
              title_cn: courseData.title_cn,
              description: courseData.description || null,
              difficulty: courseData.difficulty || 'N5',
              theme: courseData.theme || null,
            });
            if (courseErr || !course) {
              importErrors.push(`Course ${courseData.course_number}: ${courseErr?.message}`);
              continue;
            }
            stats.courses++;

            const charMap = new Map<string, number>();
            if (courseData.characters?.length) {
              for (const charData of courseData.characters) {
                const { data: char, error: charErr } = await adminService.upsertCharacter({
                  name_jp: charData.name_jp,
                  name_cn: charData.name_cn,
                  gender: charData.gender || null,
                  description: charData.description || null,
                });
                if (charErr || !char) {
                  importErrors.push(`Character ${charData.name_jp}: ${charErr?.message}`);
                  continue;
                }
                charMap.set(charData.name_jp, char.id);
                stats.characters++;
              }
            }

            if (courseData.sentences?.length) {
              for (const sentData of courseData.sentences) {
                let characterId = sentData.character_id;
                if (!characterId && sentData.character_name) {
                  characterId = charMap.get(sentData.character_name);
                  if (!characterId) {
                    const { data: existingChar } = await adminService.getCharacterByName(sentData.character_name);
                    characterId = existingChar?.[0]?.id;
                  }
                }
                if (!characterId) {
                  importErrors.push(`Sentence ${sentData.sentence_order}: character not found`);
                  continue;
                }

                const { error: sentErr } = await adminService.upsertSentence({
                  book_id: bookData.book_number,
                  course_id: courseData.course_number,
                  sentence_order: sentData.sentence_order,
                  character_id: characterId,
                  text_jp: sentData.text_jp,
                  text_cn: sentData.text_cn,
                  text_furigana: sentData.text_furigana || null,
                  text_romaji: sentData.text_romaji || null,
                  difficulty_level: sentData.difficulty_level || null,
                });
                if (sentErr) {
                  importErrors.push(`Sentence ${sentData.sentence_order}: ${sentErr.message}`);
                  continue;
                }
                stats.sentences++;
              }
            }
          }
        }

        await adminService.updateBookTotalCourses(book.id);
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      errors: importErrors.length > 0 ? importErrors : undefined,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, stats, errors: importErrors },
      { status: 500 }
    );
  }
}
