export type AchievementId =
  | 'first_practice' | 'practice_5' | 'practice_25' | 'practice_50'
  | 'streak_3' | 'streak_7' | 'streak_14' | 'streak_30'
  | 'perfect_score' | 'score_90_avg'
  | 'first_course' | 'courses_5' | 'courses_10';

export type AchievementCategory = 'progress' | 'streak' | 'score' | 'course';

export interface AchievementDef {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  condition: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  total_practice_count: number;
  streak_days: number;
  best_score: number;
  average_score: number;
  courses_completed: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Progress — 練習回数
  { id: 'first_practice', name: 'はじめての練習', description: '初めて練習を完了しました', icon: 'play_circle', category: 'progress', level: 'bronze',
    condition: (s) => s.total_practice_count >= 1 },
  { id: 'practice_5', name: '練習5回', description: '練習を5回完了しました', icon: 'fitness_center', category: 'progress', level: 'bronze',
    condition: (s) => s.total_practice_count >= 5 },
  { id: 'practice_25', name: '練習25回', description: '練習を25回完了しました', icon: 'emoji_events', category: 'progress', level: 'silver',
    condition: (s) => s.total_practice_count >= 25 },
  { id: 'practice_50', name: '練習マスター', description: '練習を50回完了しました', icon: 'workspace_premium', category: 'progress', level: 'gold',
    condition: (s) => s.total_practice_count >= 50 },

  // Streak — 連続学習
  { id: 'streak_3', name: '3日連続', description: '3日連続で練習しました', icon: 'local_fire_department', category: 'streak', level: 'bronze',
    condition: (s) => s.streak_days >= 3 },
  { id: 'streak_7', name: '週間完走', description: '7日連続で練習しました', icon: 'whatshot', category: 'streak', level: 'silver',
    condition: (s) => s.streak_days >= 7 },
  { id: 'streak_14', name: '2週間継続', description: '14日連続で練習しました', icon: 'star', category: 'streak', level: 'gold',
    condition: (s) => s.streak_days >= 14 },
  { id: 'streak_30', name: '月間達成', description: '30日連続で練習しました', icon: 'stars', category: 'streak', level: 'platinum',
    condition: (s) => s.streak_days >= 30 },

  // Score — スコア
  { id: 'perfect_score', name: '完璧スコア', description: '100点満点を獲得しました', icon: 'verified', category: 'score', level: 'gold',
    condition: (s) => s.best_score >= 100 },
  { id: 'score_90_avg', name: '高得点プレイヤー', description: '平均スコア90点以上を達成', icon: 'trending_up', category: 'score', level: 'silver',
    condition: (s) => s.average_score >= 90 },

  // Course — コース完了
  { id: 'first_course', name: '初コース完了', description: '初めてコースを完了しました', icon: 'menu_book', category: 'course', level: 'bronze',
    condition: (s) => s.courses_completed >= 1 },
  { id: 'courses_5', name: '5コース完了', description: '5コースを完了しました', icon: 'school', category: 'course', level: 'silver',
    condition: (s) => s.courses_completed >= 5 },
  { id: 'courses_10', name: '10コース完了', description: '10コースを完了しました', icon: 'military_tech', category: 'course', level: 'gold',
    condition: (s) => s.courses_completed >= 10 },
];

export const LEVEL_COLORS: Record<string, string> = {
  bronze: 'text-amber-600',
  silver: 'text-gray-400',
  gold: 'text-yellow-500',
  platinum: 'text-cyan-400',
};

export const LEVEL_BG: Record<string, string> = {
  bronze: 'bg-amber-600/10 border-amber-600/20',
  silver: 'bg-gray-400/10 border-gray-400/20',
  gold: 'bg-yellow-500/10 border-yellow-500/20',
  platinum: 'bg-cyan-400/10 border-cyan-400/20',
};

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  progress: '練習回数',
  streak: '連続学習',
  score: 'スコア',
  course: 'コース完了',
};
