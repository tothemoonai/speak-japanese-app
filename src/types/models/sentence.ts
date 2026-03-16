export interface Sentence {
  id: number;
  course_id: number;
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
