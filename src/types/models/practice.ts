export type PracticeMode = 'standard' | 'shadow' | 'free';

export interface PracticeSession {
  record_id: number;
  course_id: number;
  character_id: number;
  mode: PracticeMode;
  sentences: any[];
  current_index: number;
  started_at: string;
}

export interface PracticeResult {
  practice_id: number;
  sentence_id: number;
  user_text: string | null;
  standard_text: string;
  audio_url: string | null;
  overall_score: number;
  dimension_scores: {
    accuracy: number;
    pronunciation: number;
    fluency: number;
    emotion: number;
    freedom: number;
  };
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  feedback: {
    highlights: string[];
    issues: string[];
    suggestions: string[];
  };
  detailed_analysis: string;
}

export interface PracticeSummary {
  overall_score: number;
  completion_rate: number;
  time_spent: number;
  sentences_completed: number;
  sentences_total: number;
  achievements_unlocked: any[];
}
