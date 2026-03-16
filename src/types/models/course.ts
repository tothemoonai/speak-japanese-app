export interface Course {
  id: number;
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
}

export interface CourseWithProgress extends Course {
  progress?: number;
  status?: 'not_started' | 'in_progress' | 'completed';
  last_practiced_at?: string;
  best_score?: number;
  practice_count?: number;
}

export interface CourseFilter {
  difficulty?: ('N5' | 'N4' | 'N3')[];
  theme?: string[];
  status?: ('not_started' | 'in_progress' | 'completed')[];
  search?: string;
}
