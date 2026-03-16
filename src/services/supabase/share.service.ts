import { supabase } from '@/lib/supabase/client';
import type { Share, ShareType, ShareContent } from '@/types';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Share Service
 * Handles all share-related database operations
 */
export class ShareService {
  private getClient() {
    return supabase();
  }

  /**
   * Generate a unique share code
   */
  private generateShareCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Create a new share record
   */
  async createShare(input: {
    userId: string;
    shareType: ShareType;
    targetId: number;
    title?: string;
    description?: string;
    imageUrl?: string;
    expiresInDays?: number;
  }): Promise<{
    data: Share | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();

    // Generate unique share code
    let shareCode = this.generateShareCode();
    let isUnique = false;
    let attempts = 0;

    // Ensure unique code
    while (!isUnique && attempts < 10) {
      const { data: existing } = await client
        .from('shares')
        .select('share_code')
        .eq('share_code', shareCode)
        .single();

      if (!existing) {
        isUnique = true;
      } else {
        shareCode = this.generateShareCode();
        attempts++;
      }
    }

    // Calculate expiration date
    let expiresAt = undefined;
    if (input.expiresInDays) {
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + input.expiresInDays);
      expiresAt = expiration.toISOString();
    }

    // Create share record
    const { data, error } = await client
      .from('shares')
      .insert({
        share_code: shareCode,
        user_id: input.userId,
        share_type: input.shareType,
        target_id: input.targetId,
        title: input.title,
        description: input.description,
        image_url: input.imageUrl,
        expires_at: expiresAt,
      })
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get share by code
   */
  async getShareByCode(code: string): Promise<{
    data: (Share & { user?: { nickname?: string; avatar_url?: string } }) | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();

    // First, increment click count
    await client
      .from('shares')
      .update({ click_count: (await client.from('shares').select('click_count').eq('share_code', code).single()).data?.click_count || 0 + 1 })
      .eq('share_code', code);

    // Get share with user info
    const { data, error } = await client
      .from('shares')
        .select(`
          *,
          user:users!user_id(nickname, avatar_url)
        `)
      .eq('share_code', code)
      .single();

    if (error) {
      return { data: null, error };
    }

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { data: null, error: { message: 'Share has expired', code: 'EXPIRED' } as PostgrestError };
    }

    return { data, error: null };
  }

  /**
   * Get user's shares
   */
  async getUserShares(userId: string): Promise<{
    data: Share[] | null;
    error: PostgrestError | null;
  }> {
    const client = this.getClient();
    const { data, error } = await client
      .from('shares')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  /**
   * Delete a share
   */
  async deleteShare(shareId: number): Promise<{
    error: PostgrestError | null;
  }> {
    const client = this.getClient();
    const { error } = await client
      .from('shares')
      .delete()
      .eq('id', shareId);

    return { error };
  }

  /**
   * Get share URL
   */
  getShareUrl(shareCode: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    return `${baseUrl}/share/${shareCode}`;
  }

  /**
   * Create practice result share
   */
  async sharePracticeResult(input: {
    userId: string;
    practiceId: number;
    score: number;
    courseName: string;
    description?: string;
    expiresInDays?: number;
  }): Promise<{
    data: Share | null;
    error: PostgrestError | null;
  }> {
    return this.createShare({
      userId: input.userId,
      shareType: 'practice',
      targetId: input.practiceId,
      title: `我在「${input.courseName}」中获得了${input.score}分！`,
      description: input.description || '快来看看我的IT日语练习成果吧！',
      expiresInDays: input.expiresInDays ?? 30,
    });
  }

  /**
   * Create course completion share
   */
  async shareCourseCompletion(input: {
    userId: string;
    courseId: number;
    courseName: string;
    description?: string;
    expiresInDays?: number;
  }): Promise<{
    data: Share | null;
    error: PostgrestError | null;
  }> {
    return this.createShare({
      userId: input.userId,
      shareType: 'course',
      targetId: input.courseId,
      title: `我完成了「${input.courseName}」的学习！`,
      description: input.description || '快来一起学习日语口语吧！',
      expiresInDays: input.expiresInDays ?? 30,
    });
  }

  /**
   * Create achievement share
   */
  async shareAchievement(input: {
    userId: string;
    achievementId: number;
    achievementName: string;
    description?: string;
    imageUrl?: string;
    expiresInDays?: number;
  }): Promise<{
    data: Share | null;
    error: PostgrestError | null;
  }> {
    return this.createShare({
      userId: input.userId,
      shareType: 'achievement',
      targetId: input.achievementId,
      title: `我获得了成就「${input.achievementName}」！`,
      description: input.description || '快来一起学习日语口语吧！',
      imageUrl: input.imageUrl,
      expiresInDays: input.expiresInDays ?? 30,
    });
  }
}

// Export singleton instance
export const shareService = new ShareService();
