'use client';

import { useState, useEffect } from 'react';
import { achievementService } from '@/services/supabase/achievement.service';
import { ACHIEVEMENTS, LEVEL_COLORS, LEVEL_BG, CATEGORY_LABELS, type AchievementDef, type AchievementCategory } from '@/config/achievements';
import { Icon } from '@/components/ui/zen/Icon';

interface AchievementGridProps {
  userId: string;
}

export function AchievementGrid({ userId }: AchievementGridProps) {
  const [unlockedIds, setUnlockedIds] = useState<Map<string, string>>(new Map()); // id -> earned_at
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    achievementService.getUnlockedAchievements(userId).then(data => {
      const map = new Map(data.map(a => [a.achievement_id, a.earned_at]));
      setUnlockedIds(map);
      setLoading(false);
    });
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((_, i) => (
          <div key={i} className="h-28 bg-surface-container-low rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const unlockedCount = unlockedIds.size;
  const totalCount = ACHIEVEMENTS.length;

  // Group by category
  const categories: AchievementCategory[] = ['progress', 'streak', 'score', 'course'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-secondary/50 font-body text-sm">{unlockedCount} / {totalCount} 獲得</p>
        <div className="w-32 h-2 bg-surface-container rounded-full overflow-hidden">
          <div
            className="bg-tertiary h-full rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {categories.map(cat => {
        const catAchievements = ACHIEVEMENTS.filter(a => a.category === cat);
        return (
          <div key={cat} className="space-y-3">
            <h3 className="font-headline text-lg font-bold tracking-tight text-on-surface">
              {CATEGORY_LABELS[cat]}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {catAchievements.map(achievement => {
                const isUnlocked = unlockedIds.has(achievement.id);
                const earnedAt = unlockedIds.get(achievement.id);
                return (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={isUnlocked}
                    earnedAt={earnedAt}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AchievementCard({
  achievement,
  isUnlocked,
  earnedAt,
}: {
  achievement: AchievementDef;
  isUnlocked: boolean;
  earnedAt?: string;
}) {
  return (
    <div
      className={`relative p-4 rounded-xl border transition-all ${
        isUnlocked
          ? `${LEVEL_BG[achievement.level]} border`
          : 'bg-surface-container-low/50 border-outline-variant/10 opacity-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`text-2xl ${isUnlocked ? LEVEL_COLORS[achievement.level] : 'text-secondary/30'}`}>
          <Icon name={achievement.icon} size={24} fill={isUnlocked} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-headline font-bold text-sm truncate ${isUnlocked ? 'text-on-surface' : 'text-secondary/40'}`}>
            {achievement.name}
          </p>
          <p className={`text-xs mt-0.5 line-clamp-2 ${isUnlocked ? 'text-secondary/60' : 'text-secondary/30'}`}>
            {achievement.description}
          </p>
          {isUnlocked && earnedAt && (
            <p className="text-[10px] text-secondary/30 mt-1 font-label">
              {new Date(earnedAt).toLocaleDateString('ja-JP')}
            </p>
          )}
          {!isUnlocked && (
            <div className="flex items-center gap-1 mt-1">
              <Icon name="lock" size={10} className="text-secondary/20" />
              <span className="text-[10px] text-secondary/20 font-label">未解除</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
