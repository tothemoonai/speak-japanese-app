import type { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * 扩展的用户类型，包含从 public.users 表同步的字段
 */
export interface ExtendedUser extends SupabaseUser {
  nickname?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  total_study_time?: number;
  avatar_url?: string;

  // 这些字段从 user_metadata 中获取
  user_metadata?: SupabaseUser['user_metadata'] & {
    nickname?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
  };
}

/**
 * 用户类型，用于组件中
 */
export type User = ExtendedUser | null;
