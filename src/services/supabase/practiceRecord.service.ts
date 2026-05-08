/**
 * 练习记录保存服务
 * 处理练习记录和结果的数据库存储
 */

import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

export type PracticeRecord = Database['public']['Tables']['practice_records']['Row'];
export type PracticeResult = Database['public']['Tables']['practice_results']['Row'];

interface SavePracticeParams {
  userId: string;
  courseId: number;
  characterId: number;
  sentences: any[];
}

interface SaveResultParams {
  practiceId: number;
  sentenceId: number;
  userText: string;
  standardText: string;
  audioUrl?: string;
  overallScore: number;
  dimensionScores: {
    emotion: number;
    fluency: number;
    freedom: number;
    accuracy: number;
    pronunciation: number;
  };
  grade: string;
  feedback: {
    issues: string[];
    highlights: string[];
    suggestions: string[];
  };
  detailedAnalysis?: string;
}

export class PracticeRecordService {
  /**
   * 创建新的练习记录
   */
  async createPracticeRecord(params: SavePracticeParams): Promise<number | null> {
    try {
      const client = supabase();

      // 查询角色ID映射（获取实际的角色ID）
      const { data: characterData } = await client
        .from('jp_characters')
        .select('id')
        .eq('id', params.characterId)
        .single();

      if (!characterData) {
        console.error('角色不存在:', params.characterId);
        return null;
      }

      // 创建练习记录
      const { data, error } = await client
        .from('jp_practice_records')
        .insert({
          user_id: params.userId,
          course_id: params.courseId,
          character_id: params.characterId,
          sentences: params.sentences,
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error('创建练习记录失败:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('创建练习记录异常:', error);
      return null;
    }
  }

  /**
   * 更新练习记录完成状态
   */
  async updatePracticeRecord(
    practiceId: number,
    totalTimeSpent: number,
    totalScore: number
  ): Promise<boolean> {
    try {
      const client = supabase();

      const { error } = await client
        .from('jp_practice_records')
        .update({
          completed_at: new Date().toISOString(),
          time_spent: totalTimeSpent,
          total_score: totalScore,
        })
        .eq('id', practiceId);

      if (error) {
        console.error('更新练习记录失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('更新练习记录异常:', error);
      return false;
    }
  }

  /**
   * 保存单句练习结果
   */
  async savePracticeResult(params: SaveResultParams): Promise<boolean> {
    try {
      const client = supabase();

      const { error } = await client
        .from('jp_practice_results')
        .insert({
          practice_id: params.practiceId,
          sentence_id: params.sentenceId,
          user_text: params.userText,
          standard_text: params.standardText,
          audio_url: params.audioUrl,
          overall_score: params.overallScore,
          dimension_scores: params.dimensionScores,
          grade: params.grade,
          feedback: params.feedback,
          detailed_analysis: params.detailedAnalysis,
        });

      if (error) {
        console.error('保存练习结果失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('保存练习结果异常:', error);
      return false;
    }
  }

  /**
   * 完成练习（保存记录和更新统计数据）
   */
  async completePractice(
    practiceId: number,
    totalTimeSpent: number,
    totalScore: number,
    results: any[]
  ): Promise<boolean> {
    try {
      // 1. 更新练习记录
      const updated = await this.updatePracticeRecord(
        practiceId,
        totalTimeSpent,
        totalScore
      );

      if (!updated) {
        return false;
      }

      // 2. 保存所有结果
      const savePromises = results.map((result) =>
        this.savePracticeResult({
          practiceId: practiceId,
          sentenceId: result.sentenceId,
          userText: result.userText || '',
          standardText: result.standardText || '',
          audioUrl: result.audioUrl,
          overallScore: result.overallScore || 0,
          dimensionScores: result.dimensionScores || {
            emotion: 0,
            fluency: 0,
            freedom: 0,
            accuracy: 0,
            pronunciation: 0,
          },
          grade: result.grade || 'D',
          feedback: result.feedback || {
            issues: [],
            highlights: [],
            suggestions: [],
          },
          detailedAnalysis: result.detailedAnalysis,
        })
      );

      await Promise.all(savePromises);

      return true;
    } catch (error) {
      console.error('完成练习失败:', error);
      return false;
    }
  }
}

export const practiceRecordService = new PracticeRecordService();
