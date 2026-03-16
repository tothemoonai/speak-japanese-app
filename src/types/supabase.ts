export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nickname: string | null
          avatar_url: string | null
          level: 'beginner' | 'intermediate' | 'advanced'
          total_study_time: number
          created_at: string
          updated_at: string
          last_login_at: string | null
          status: 'active' | 'suspended'
        }
        Insert: {
          id?: string
          email: string
          nickname?: string | null
          avatar_url?: string | null
          level?: 'beginner' | 'intermediate' | 'advanced'
          total_study_time?: number
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          status?: 'active' | 'suspended'
        }
        Update: {
          id?: string
          email?: string
          nickname?: string | null
          avatar_url?: string | null
          level?: 'beginner' | 'intermediate' | 'advanced'
          total_study_time?: number
          updated_at?: string
          last_login_at?: string | null
          status?: 'active' | 'suspended'
        }
      }
      courses: {
        Row: {
          id: number
          course_number: number
          title_cn: string
          title_jp: string
          description: string | null
          difficulty: 'N5' | 'N4' | 'N3'
          theme: string | null
          scene_image_url: string | null
          total_sentences: number | null
          vocab_count: number | null
          grammar_count: number | null
          sort_order: number | null
          created_at: string
        }
        Insert: {
          id: number
          course_number: number
          title_cn: string
          title_jp: string
          description?: string | null
          difficulty: 'N5' | 'N4' | 'N3'
          theme?: string | null
          scene_image_url?: string | null
          total_sentences?: number | null
          vocab_count?: number | null
          grammar_count?: number | null
          sort_order?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          course_number?: number
          title_cn?: string
          title_jp?: string
          description?: string | null
          difficulty?: 'N5' | 'N4' | 'N3'
          theme?: string | null
          scene_image_url?: string | null
          total_sentences?: number | null
          vocab_count?: number | null
          grammar_count?: number | null
          sort_order?: number | null
        }
      }
      characters: {
        Row: {
          id: number
          course_id: number
          name_cn: string
          name_jp: string
          gender: 'male' | 'female' | 'other' | null
          age_range: string | null
          description: string | null
          avatar_url: string | null
          difficulty_level: 'easy' | 'medium' | 'hard' | null
        }
        Insert: {
          id: number
          course_id: number
          name_cn: string
          name_jp: string
          gender?: 'male' | 'female' | 'other' | null
          age_range?: string | null
          description?: string | null
          avatar_url?: string | null
          difficulty_level?: 'easy' | 'medium' | 'hard' | null
        }
        Update: {
          id?: number
          course_id?: number
          name_cn?: string
          name_jp?: string
          gender?: 'male' | 'female' | 'other' | null
          age_range?: string | null
          description?: string | null
          avatar_url?: string | null
          difficulty_level?: 'easy' | 'medium' | 'hard' | null
        }
      }
      sentences: {
        Row: {
          id: number
          course_id: number
          sentence_order: number
          character_id: number
          text_jp: string
          text_cn: string
          text_furigana: string | null
          text_romaji: string | null
          vocabulary: Json | null
          grammar_points: Json | null
          difficulty_level: 'easy' | 'medium' | 'hard' | null
        }
        Insert: {
          id: number
          course_id: number
          sentence_order: number
          character_id: number
          text_jp: string
          text_cn: string
          text_furigana?: string | null
          text_romaji?: string | null
          vocabulary?: Json | null
          grammar_points?: Json | null
          difficulty_level?: 'easy' | 'medium' | 'hard' | null
        }
        Update: {
          id?: number
          course_id?: number
          sentence_order?: number
          character_id?: number
          text_jp?: string
          text_cn?: string
          text_furigana?: string | null
          text_romaji?: string | null
          vocabulary?: Json | null
          grammar_points?: Json | null
          difficulty_level?: 'easy' | 'medium' | 'hard' | null
        }
      }
      practice_records: {
        Row: {
          id: number
          user_id: string
          course_id: number
          character_id: number
          practice_mode: 'standard' | 'shadow' | 'free'
          overall_score: number | null
          completion_rate: number | null
          time_spent: number | null
          sentences_completed: number | null
          sentences_total: number | null
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          course_id: number
          character_id: number
          practice_mode: 'standard' | 'shadow' | 'free'
          overall_score?: number | null
          completion_rate?: number | null
          time_spent?: number | null
          sentences_completed?: number | null
          sentences_total?: number | null
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          course_id?: number
          character_id?: number
          practice_mode?: 'standard' | 'shadow' | 'free'
          overall_score?: number | null
          completion_rate?: number | null
          time_spent?: number | null
          sentences_completed?: number | null
          sentences_total?: number | null
          started_at?: string
          completed_at?: string | null
        }
      }
      sentence_practices: {
        Row: {
          id: number
          record_id: number
          sentence_id: number
          user_id: string
          user_text: string | null
          standard_text: string
          audio_url: string | null
          overall_score: number | null
          accuracy_score: number | null
          pronunciation_score: number | null
          fluency_score: number | null
          emotion_score: number | null
          freedom_score: number | null
          grade: 'S' | 'A' | 'B' | 'C' | 'D' | null
          feedback: Json | null
          attempted_at: string
        }
        Insert: {
          id?: number
          record_id: number
          sentence_id: number
          user_id: string
          user_text?: string | null
          standard_text: string
          audio_url?: string | null
          overall_score?: number | null
          accuracy_score?: number | null
          pronunciation_score?: number | null
          fluency_score?: number | null
          emotion_score?: number | null
          freedom_score?: number | null
          grade?: 'S' | 'A' | 'B' | 'C' | 'D' | null
          feedback?: Json | null
          attempted_at?: string
        }
        Update: {
          id?: number
          record_id?: number
          sentence_id?: number
          user_id?: string
          user_text?: string | null
          standard_text?: string
          audio_url?: string | null
          overall_score?: number | null
          accuracy_score?: number | null
          pronunciation_score?: number | null
          fluency_score?: number | null
          emotion_score?: number | null
          freedom_score?: number | null
          grade?: 'S' | 'A' | 'B' | 'C' | 'D' | null
          feedback?: Json | null
          attempted_at?: string
        }
      }
    }
  }
}
