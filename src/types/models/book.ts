/**
 * Book - 课本类型定义
 */

/**
 * 基础课本接口
 */
export interface Book {
  id: number;
  book_number: number;
  title_cn: string;
  title_jp: string;
  description: string | null;
  cover_image_url: string | null;
  difficulty: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null;
  target_audience: string | null;
  total_courses: number;
  sort_order: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 带用户进度的课本接口
 */
export interface BookWithProgress extends Book {
  progress?: number;
  completed_courses?: number;
  total_practices?: number;
  last_practiced_at?: string;
}

/**
 * 书本筛选条件
 */
export interface BookFilter {
  difficulty?: ('N5' | 'N4' | 'N3' | 'N2' | 'N1')[];
  target_audience?: string[];
  search?: string;
  is_published?: boolean;
}
