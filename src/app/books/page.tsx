'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { BookList } from '@/components/book/BookList';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { BookFilter } from '@/types';

const DIFFICULTIES = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;

export default function BooksPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<BookFilter>({});
  const [selectedDifficulties, setSelectedDifficulties] = useState<(typeof DIFFICULTIES)[number][]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleDifficultyToggle = (difficulty: (typeof DIFFICULTIES)[number]) => {
    setSelectedDifficulties((prev) => {
      const newSelected = prev.includes(difficulty)
        ? prev.filter((d) => d !== difficulty)
        : [...prev, difficulty];

      setFilter((prev) => ({
        ...prev,
        difficulty: newSelected.length > 0 ? newSelected as any : undefined,
      }));

      return newSelected;
    });
  };

  const handleClearFilters = () => {
    setSelectedDifficulties([]);
    setFilter({});
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Link href="/dashboard">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">IT日语课本</h1>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-muted-foreground hidden xs:block">
                {user.nickname || user.email}
              </span>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  返回首页
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">选择课本</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            选择一本课本开始学习
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="pt-4 sm:pt-6">
            <div>
              <h3 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">难度级别</h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {DIFFICULTIES.map((difficulty) => (
                  <Badge
                    key={difficulty}
                    variant={selectedDifficulties.includes(difficulty) ? 'default' : 'outline'}
                    className="cursor-pointer hover:opacity-80 transition-opacity text-xs sm:text-sm"
                    onClick={() => handleDifficultyToggle(difficulty)}
                  >
                    {difficulty}
                  </Badge>
                ))}
              </div>
              {selectedDifficulties.length > 0 && (
                <div className="mt-3 sm:mt-4">
                  <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs sm:text-sm">
                    清除筛选
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Book List */}
        <BookList filter={filter} userId={user.id} />
      </div>
    </div>
  );
}
