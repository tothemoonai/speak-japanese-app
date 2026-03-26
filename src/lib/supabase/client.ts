import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// 全局单例实例
let clientInstance: ReturnType<typeof createSupabaseClient> | null = null;

export const createClient = () => {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'supabase-auth',
      },
    }
  );
};

/**
 * 获取 Supabase 客户端单例
 * 确保整个应用只有一个 Supabase 客户端实例
 */
export const supabase = () => {
  if (!clientInstance) {
    clientInstance = createClient();
    console.log('✅ Supabase client singleton created');
  }
  return clientInstance;
};

/**
 * 重置客户端实例（用于测试或调试）
 */
export const resetSupabaseClient = () => {
  clientInstance = null;
};
