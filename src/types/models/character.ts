export interface Character {
  id: number;
  book_id: number;         // 角色属于哪本书
  name_cn: string;
  name_jp: string;
  gender?: 'male' | 'female' | 'other' | null;
  age_range?: string | null;
  description?: string | null;
  avatar_url?: string | null;
  difficulty_level?: 'easy' | 'medium' | 'hard' | null;
}
