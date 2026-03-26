export interface Course {
  id: number;
  book_id: number;  // 注意：这里存储的是 book_number（业务键），不是 books.id（主键）
  book_number?: number;  // 业务键（冗余字段，用于便捷访问）
  course_number: number;
  title_cn: string;
  title_jp: string;
  description: string | null;
  difficulty: 'N5' | 'N4' | 'N3';
  theme: string | null;
  scene_image_url: string | null;
  total_sentences: number | null;
  vocab_count: number | null;
  grammar_count: number | null;
  sort_order: number | null;
  created_at: string;
  characters?: CourseCharacter[];
}

export interface CourseCharacter {
  id: number;
  course_id: number;
  character_id: number;
  character_order: number;
  is_primary: boolean;
  character: {
    id: number;
    name_cn: string;
    name_jp: string;
    avatar_url: string | null;
  };
}

export interface CourseWithProgress extends Course {
  progress?: number;
  status?: 'not_started' | 'in_progress' | 'completed';
  last_practiced_at?: string;
  best_score?: number;
  practice_count?: number;
}

export interface CourseFilter {
  book_id?: number;  // 注意：这里存储的是 book_number（业务键），不是 books.id（主键）
  difficulty?: ('N5' | 'N4' | 'N3')[];
  theme?: string[];
  status?: ('not_started' | 'in_progress' | 'completed')[];
  search?: string;
}
