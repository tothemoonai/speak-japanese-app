export interface Sentence {
  id: number;
  book_id: number;        // 句子属于哪本书
  course_id: number;      // 第几课（从1开始，不是数据库主键）
  sentence_order: number;
  character_id: number;
  text_jp: string;
  text_cn: string;
  text_furigana: string | null;
  text_romaji: string | null;
  vocabulary: any;
  grammar_points: any;
  difficulty_level: 'easy' | 'medium' | 'hard' | null;
}
