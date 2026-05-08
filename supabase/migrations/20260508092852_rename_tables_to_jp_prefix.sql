-- Rename all tables to add JP_ prefix (except jp_users which already has it)

ALTER TABLE public.books RENAME TO jp_books;
ALTER TABLE public.characters RENAME TO jp_characters;
ALTER TABLE public.course_characters RENAME TO jp_course_characters;
ALTER TABLE public.courses RENAME TO jp_courses;
ALTER TABLE public.daily_reports RENAME TO jp_daily_reports;
ALTER TABLE public.practice_records RENAME TO jp_practice_records;
ALTER TABLE public.practice_results RENAME TO jp_practice_results;
ALTER TABLE public.sentences RENAME TO jp_sentences;
ALTER TABLE public.shares RENAME TO jp_shares;
ALTER TABLE public.user_achievements RENAME TO jp_user_achievements;
