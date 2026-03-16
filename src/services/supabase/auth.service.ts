import { supabase } from '@/lib/supabase/client';

export interface RegisterInput {
  email: string;
  password: string;
  nickname?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  private getClient() {
    return supabase();
  }

  /**
   * 从public.users表获取完整的用户信息（包括level）
   */
  private async enrichUserFromPublic(user: any): Promise<any> {
    if (!user) return user;

    const email = user.email || '';
    const nickname = user.user_metadata?.nickname || user.nickname || email.split('@')[0];

    try {
      // 从public.users表获取level和其他信息
      const client = this.getClient();
      const { data: publicUser, error } = await client
        .from('users')
        .select('level, total_study_time, avatar_url')
        .eq('id', user.id)
        .single();

      if (error || !publicUser) {
        // 如果查询失败，返回默认值
        return {
          ...user,
          nickname,
          level: 'beginner',
          user_metadata: {
            ...user.user_metadata,
            nickname,
            level: 'beginner',
          },
        };
      }

      return {
        ...user,
        nickname,
        level: publicUser.level || 'beginner',
        total_study_time: publicUser.total_study_time,
        avatar_url: publicUser.avatar_url,
        user_metadata: {
          ...user.user_metadata,
          nickname,
          level: publicUser.level || 'beginner',
        },
      };
    } catch (error) {
      console.error('Error enriching user from public.users:', error);
      return {
        ...user,
        nickname,
        level: 'beginner',
        user_metadata: {
          ...user.user_metadata,
          nickname,
          level: 'beginner',
        },
      };
    }
  }

  /**
   * 确保用户对象有有效的nickname
   * 如果nickname为空，使用email@前的部分
   * @deprecated Use enrichUserFromPublic instead
   */
  private ensureNickname(user: any): any {
    if (!user) return user;

    const email = user.email || '';
    const nickname = user.user_metadata?.nickname || user.nickname || email.split('@')[0];

    return {
      ...user,
      nickname,
      user_metadata: {
        ...user.user_metadata,
        nickname,
      },
    };
  }

  async register(input: RegisterInput) {
    const { email, password, nickname } = input;
    const defaultNickname = nickname || email.split('@')[0];
    const client = this.getClient();

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname: defaultNickname,
        },
      },
    });

    const user = data.user ? await this.enrichUserFromPublic(data.user) : null;
    return { user, error };
  }

  async login(input: LoginInput) {
    const { email, password } = input;
    const client = this.getClient();

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    const user = data.user ? await this.enrichUserFromPublic(data.user) : null;
    return { user, error };
  }

  async logout() {
    const client = this.getClient();
    const { error } = await client.auth.signOut();
    return { error };
  }

  async getCurrentUser() {
    const client = this.getClient();
    const {
      data: { user },
    } = await client.auth.getUser();

    return user ? await this.enrichUserFromPublic(user) : null;
  }

  /**
   * 更新用户昵称
   */
  async updateNickname(nickname: string) {
    const client = this.getClient();
    const { data, error } = await client.auth.updateUser({
      data: { nickname },
    });

    if (error) return { user: null, error };

    // 同时更新public.users表
    if (data.user) {
      await client
        .from('users')
        .update({ nickname })
        .eq('id', data.user.id);
    }

    const user = data.user ? await this.enrichUserFromPublic(data.user) : null;
    return { user, error: null };
  }

  /**
   * 修改密码
   */
  async updatePassword(newPassword: string) {
    const client = this.getClient();
    const { error } = await client.auth.updateUser({
      password: newPassword,
    });

    return { error };
  }

  /**
   * 更新用户等级
   */
  async updateLevel(level: 'beginner' | 'intermediate' | 'advanced') {
    const client = this.getClient();
    const { data, error } = await client.auth.updateUser({
      data: { level },
    });

    if (error) return { user: null, error };

    // 同时更新public.users表
    if (data.user) {
      await client
        .from('users')
        .update({ level })
        .eq('id', data.user.id);
    }

    const user = data.user ? await this.enrichUserFromPublic(data.user) : null;
    return { user, error: null };
  }

  /**
   * 根据学习进度自动计算用户等级
   * 等级判定标准：
   * - 初级 (beginner): 完成课程 < 5 门 或 平均分 < 70
   * - 中级 (intermediate): 完成课程 5-15 门 且 平均分 >= 70
   * - 高级 (advanced): 完成课程 > 15 门 且 平均分 >= 85
   */
  private calculateLevel(
    completedCourses: number,
    averageScore: number,
    totalPracticeCount: number
  ): 'beginner' | 'intermediate' | 'advanced' {
    // 高级：完成15门以上课程，平均分85分以上，练习次数50次以上
    if (
      completedCourses >= 15 &&
      averageScore >= 85 &&
      totalPracticeCount >= 50
    ) {
      return 'advanced';
    }

    // 中级：完成5门以上课程，平均分70分以上，练习次数20次以上
    if (
      completedCourses >= 5 &&
      averageScore >= 70 &&
      totalPracticeCount >= 20
    ) {
      return 'intermediate';
    }

    // 默认初级
    return 'beginner';
  }

}

export const authService = new AuthService();
