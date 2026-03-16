export type ShareType = 'practice' | 'course' | 'achievement';

export interface Share {
  id: number;
  share_code: string;
  user_id: string;
  share_type: ShareType;
  target_id: number;
  title?: string;
  description?: string;
  image_url?: string;
  click_count: number;
  created_at: string;
  expires_at?: string;
}

export interface ShareContent {
  user: {
    nickname: string;
    avatar_url?: string;
  };
  share_type: ShareType;
  title: string;
  description?: string;
  image_url?: string;
  data: any;
}
