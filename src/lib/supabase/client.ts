import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

export const createClient = () => {
  return createClientComponentClient<Database>();
};

// 导出单例客户端
let clientInstance: ReturnType<typeof createClient> | null = null;

export const supabase = () => {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
};
