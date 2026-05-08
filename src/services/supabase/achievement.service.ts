import { supabase } from '@/lib/supabase/client';
import { ACHIEVEMENTS, type AchievementDef, type AchievementStats } from '@/config/achievements';

export class AchievementService {
  private getClient() {
    const client = supabase();
    if (!client) throw new Error('Supabase client not initialized');
    return client;
  }

  /**
   * Check all achievement conditions and unlock new ones.
   * Returns the list of newly unlocked achievements.
   */
  async checkAndUnlock(userId: string): Promise<AchievementDef[]> {
    try {
      const client = this.getClient();

      // 1. Get already unlocked IDs
      const { data: unlocked } = await client
        .from('jp_user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
      const unlockedIds = new Set((unlocked || []).map((a: any) => a.achievement_id));

      // 2. Compute stats from practice_records
      const stats = await this.computeStats(userId);

      // 3. Check each un unlocked achievement
      const newAchievements: AchievementDef[] = [];
      for (const achievement of ACHIEVEMENTS) {
        if (unlockedIds.has(achievement.id)) continue;
        if (achievement.condition(stats)) {
          newAchievements.push(achievement);
        }
      }

      // 4. Insert new achievements
      if (newAchievements.length > 0) {
        const rows = newAchievements.map(a => ({
          user_id: userId,
          achievement_id: a.id,
          achievement_name: a.name,
          achievement_description: a.description,
          achievement_level: a.level,
        }));
        const { error } = await client
          .from('jp_user_achievements')
          .upsert(rows as any, { onConflict: 'user_id,achievement_id' });
        if (error) console.error('Failed to insert achievements:', error);
      }

      return newAchievements;
    } catch (error) {
      console.error('Achievement check failed:', error);
      return [];
    }
  }

  /**
   * Compute stats directly from practice_records
   */
  private async computeStats(userId: string): Promise<AchievementStats> {
    try {
      const client = this.getClient();
      const { data: practices, error } = await client
        .from('jp_practice_records')
        .select('total_score, completed_at, course_id')
        .eq('user_id', userId)
        .not('completed_at', 'is', null);

      if (error || !practices || practices.length === 0) {
        return { total_practice_count: 0, streak_days: 0, best_score: 0, average_score: 0, courses_completed: 0 };
      }

      const totalPracticeCount = practices.length;
      const scores = practices.map((p: any) => p.total_score || 0);
      const bestScore = Math.max(...scores);
      const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const coursesCompleted = new Set(
        practices.filter((p: any) => (p.total_score || 0) >= 90).map((p: any) => p.course_id)
      ).size;
      const streakDays = this.calculateStreak(practices);

      return {
        total_practice_count: totalPracticeCount,
        streak_days: streakDays,
        best_score: bestScore,
        average_score: averageScore,
        courses_completed: coursesCompleted,
      };
    } catch {
      return { total_practice_count: 0, streak_days: 0, best_score: 0, average_score: 0, courses_completed: 0 };
    }
  }

  /**
   * Calculate current streak of consecutive practice days
   */
  private calculateStreak(practices: any[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const practicedDates = new Set(
      practices.map((p: any) => {
        const d = new Date(p.completed_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );

    let streak = 0;
    let checkDate = today;
    while (practicedDates.has(checkDate.getTime())) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    }
    return streak;
  }

  /**
   * Get unlocked achievement count for a user
   */
  async getUnlockedCount(userId: string): Promise<number> {
    try {
      const client = this.getClient();
      const { count } = await client
        .from('jp_user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      return count || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get all unlocked achievements with earned_at dates
   */
  async getUnlockedAchievements(userId: string): Promise<{ achievement_id: string; earned_at: string }[]> {
    try {
      const client = this.getClient();
      const { data } = await client
        .from('jp_user_achievements')
        .select('achievement_id, earned_at')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });
      return (data || []) as { achievement_id: string; earned_at: string }[];
    } catch {
      return [];
    }
  }
}

export const achievementService = new AchievementService();
