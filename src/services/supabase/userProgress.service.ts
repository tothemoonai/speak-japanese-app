/**
 * 用户进度和等级升级服务
 * 根据用户的练习表现自动升级
 */

import { supabase } from '@/lib/supabase/client';

export interface UserStats {
  total_practices: number;
  average_score: number;
  courses_completed: number;
}

export interface LevelProgress {
  current_level: 'beginner' | 'intermediate' | 'advanced';
  next_level?: 'intermediate' | 'advanced';
  progress: {
    total_practices: number;
    average_score: number;
    courses_completed: number;
  };
  requirements: {
    total_practices: number;
    average_score: number;
    courses_completed: number;
  };
  can_upgrade: boolean;
}

/**
 * 等级升级要求配置
 */
const LEVEL_REQUIREMENTS = {
  beginner: {
    // 从初级升级到中级的要求
    total_practices: 5,
    average_score: 80,
    courses_completed: 2,
  },
  intermediate: {
    // 从中级升级到高级的要求
    total_practices: 20,
    average_score: 85,
    courses_completed: 5,
  },
  advanced: {
    // 最高等级，无需升级
    total_practices: Infinity,
    average_score: Infinity,
    courses_completed: Infinity,
  },
};

export class UserProgressService {
  /**
   * 获取用户的统计数据
   */
  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      // 获取总练习次数和平均分数
      const { data: practices, error: practiceError } = await supabase
        .from('practice_records')
        .select('overall_score')
        .eq('user_id', userId)
        .not('overall_score', 'is', null);

      if (practiceError) throw practiceError;

      const total_practices = practices?.length || 0;
      const average_score =
        total_practices > 0
          ? Math.round(
              practices.reduce((sum, p) => sum + (p.overall_score || 0), 0) /
                total_practices
            )
          : 0;

      // 获取完成的课程数（假设练习记录覆盖不同课程）
      const { data: courses, error: courseError } = await supabase
        .from('practice_records')
        .select('course_id')
        .eq('user_id', userId);

      if (courseError) throw courseError;

      const courses_completed =
        new Set(courses?.map((c) => c.course_id)).size || 0;

      return {
        total_practices,
        average_score,
        courses_completed,
      };
    } catch (error) {
      console.error('获取用户统计失败:', error);
      return null;
    }
  }

  /**
   * 计算用户升级进度
   */
  async calculateLevelProgress(
    userId: string,
    currentLevel: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<LevelProgress | null> {
    const stats = await this.getUserStats(userId);
    if (!stats) return null;

    const requirements = LEVEL_REQUIREMENTS[currentLevel];
    const can_upgrade =
      stats.total_practices >= requirements.total_practices &&
      stats.average_score >= requirements.average_score &&
      stats.courses_completed >= requirements.courses_completed;

    let next_level: 'intermediate' | 'advanced' | undefined;
    if (currentLevel === 'beginner') next_level = 'intermediate';
    if (currentLevel === 'intermediate') next_level = 'advanced';

    return {
      current_level: currentLevel,
      next_level,
      progress: stats,
      requirements,
      can_upgrade,
    };
  }

  /**
   * 检查并执行等级升级
   * 返回是否升级成功
   */
  async checkAndUpgrade(userId: string): Promise<boolean> {
    try {
      // 获取当前用户level
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('level')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      if (!user) return false;

      const currentLevel =
        (user.level as 'beginner' | 'intermediate' | 'advanced') || 'beginner';

      // 如果已经是最高级，无需升级
      if (currentLevel === 'advanced') return false;

      // 计算升级进度
      const progress = await this.calculateLevelProgress(userId, currentLevel);
      if (!progress || !progress.can_upgrade) return false;

      // 执行升级 - 更新public.users表
      const newLevel = progress.next_level!;
      const { error: updateError } = await supabase
        .from('users')
        .update({ level: newLevel })
        .eq('id', userId);

      if (updateError) throw updateError;

      // 同时更新auth.user_metadata.level
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: { level: newLevel }
      });

      if (authUpdateError) {
        console.error('更新auth metadata失败:', authUpdateError);
        // 不影响主流程，继续执行
      }

      console.log(`🎉 用户 ${userId} 从 ${currentLevel} 升级到 ${newLevel}！`);
      return true;
    } catch (error) {
      console.error('检查升级失败:', error);
      return false;
    }
  }

  /**
   * 获取用户的升级进度信息（用于显示）
   */
  async getLevelProgressForDisplay(
    userId: string
  ): Promise<LevelProgress | null> {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('level')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      if (!user) return null;

      const currentLevel =
        (user.level as 'beginner' | 'intermediate' | 'advanced') || 'beginner';

      return await this.calculateLevelProgress(userId, currentLevel);
    } catch (error) {
      console.error('获取升级进度失败:', error);
      return null;
    }
  }
}

export const userProgressService = new UserProgressService();
