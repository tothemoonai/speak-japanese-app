export interface User {
  id: string;
  email: string;
  nickname?: string | null;
  avatar_url?: string | null;
  level?: 'beginner' | 'intermediate' | 'advanced';
  total_study_time?: number;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
  status?: 'active' | 'suspended';
}
