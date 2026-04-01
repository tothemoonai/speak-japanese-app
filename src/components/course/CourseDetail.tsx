'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/zen/Icon';
import { ProgressBar } from '@/components/ui/zen/ProgressBar';
import type { CourseWithProgress, Character, Sentence } from '@/types';

interface CourseDetailProps {
  course: CourseWithProgress & { characters?: Character[]; sentences?: Sentence[] };
  onPractice?: (characterId: number) => void;
}

export function CourseDetail({ course, onPractice }: CourseDetailProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [showChinese, setShowChinese] = useState(true);
  const [showJapanese, setShowJapanese] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const manuallyStoppedRef = useRef(false);
  const playlistRef = useRef<{ sentences: any[]; index: number } | null>(null);

  const handlePractice = (characterId: number) => {
    setSelectedCharacter(characterId);
    if (onPractice) {
      onPractice(characterId);
    }
  };

  const handlePlayAll = () => {
    if (!course.sentences || course.sentences.length === 0) return;

    if (isPlaying) {
      manuallyStoppedRef.current = true;
      playlistRef.current = null;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    playlistRef.current = { sentences: course.sentences, index: 0 };
    manuallyStoppedRef.current = false;

    if (window.speechSynthesis) window.speechSynthesis.cancel();

    setTimeout(() => {
      if (!playlistRef.current || manuallyStoppedRef.current) return;
      setIsPlaying(true);

      const playNext = () => {
        const playlist = playlistRef.current;
        if (!playlist || manuallyStoppedRef.current) {
          setIsPlaying(false);
          playlistRef.current = null;
          return;
        }

        if (playlist.index >= playlist.sentences.length) {
          setIsPlaying(false);
          playlistRef.current = null;
          return;
        }

        const sentence = playlist.sentences[playlist.index];
        playlist.index++;

        if (window.TTS && typeof window.TTS.speak === 'function') {
          window.TTS.speak(sentence.text_jp, () => {
            if (playlistRef.current && !manuallyStoppedRef.current) {
              setTimeout(() => playNext(), 50);
            }
          });
        } else if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(sentence.text_jp);
          utterance.lang = 'ja-JP';
          utterance.pitch = 1.0;
          utterance.rate = 0.9;
          utterance.onend = () => playNext();
          utterance.onerror = () => playNext();
          window.speechSynthesis.speak(utterance);
        } else {
          setIsPlaying(false);
          playlistRef.current = null;
        }
      };

      playNext();
    }, 100);
  };

  useEffect(() => {
    return () => {
      manuallyStoppedRef.current = true;
      playlistRef.current = null;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const progress = course.progress || 0;
  const isCompleted = course.status === 'completed';

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <span className={cn(
              'px-3 py-1 rounded-md font-label text-xs font-bold tracking-widest',
              isCompleted
                ? 'bg-tertiary/20 text-tertiary border border-tertiary/20'
                : 'bg-primary/10 text-primary border border-primary/20'
            )}>
              {course.difficulty || 'N/A'}
            </span>
            <span className="text-secondary/60 text-xs font-label tracking-widest">
              第{course.course_number}課
            </span>
            {course.status && (
              <span className="text-secondary/40 text-xs font-label tracking-widest uppercase">
                {course.status === 'not_started' && '未着手'}
                {course.status === 'in_progress' && '学習中'}
                {course.status === 'completed' && '完了'}
              </span>
            )}
          </div>

          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-on-surface leading-tight">
            {course.title_jp || course.title_cn}
          </h2>
          {course.title_jp && course.title_cn && course.title_jp !== course.title_cn && (
            <p className="text-secondary font-body text-lg leading-relaxed">{course.title_cn}</p>
          )}

          {course.theme && (
            <div className="flex items-center gap-2 text-secondary/60 text-sm font-body">
              <Icon name="category" size={16} />
              <span>{course.theme}</span>
            </div>
          )}
        </div>

        <Link href={`/practice/${course.id}`} className="block">
          <button className="bg-primary text-primary-foreground font-headline font-bold px-8 py-4 rounded-xl flex items-center gap-3 hover:bg-primary-fixed transition-all active:scale-95 shadow-lg shadow-primary/10">
            練習を始める
            <Icon name="play_circle" size={20} />
          </button>
        </Link>
      </section>

      {/* Progress & Controls */}
      <section className="bg-surface-container-low p-6 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <p className="font-label text-xs text-secondary/50 uppercase tracking-[0.2em] mb-1">学習進捗</p>
            <p className="font-headline text-3xl font-bold text-on-surface">
              {progress}% <span className="text-secondary/40 text-lg font-normal">完了</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {course.practice_count !== undefined && course.practice_count > 0 && (
              <span className="text-xs text-secondary/50 font-label tracking-widest">
                練習 {course.practice_count}回
              </span>
            )}
            {course.best_score !== undefined && course.best_score > 0 && (
              <span className="text-xs text-tertiary font-label font-bold tracking-widest">
                最高 {course.best_score}点
              </span>
            )}
          </div>
        </div>
        <ProgressBar value={progress} />

        {/* Control Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-outline-variant/10">
          <button
            onClick={() => setShowChinese(!showChinese)}
            className={cn(
              'px-4 py-2 rounded-lg text-xs font-label font-bold tracking-widest transition-all',
              showChinese
                ? 'bg-primary/15 text-primary'
                : 'bg-surface-container-highest text-secondary/50'
            )}
          >
            <Icon name={showChinese ? 'visibility' : 'visibility_off'} size={14} className="mr-1 align-middle" />
            中文
          </button>
          <button
            onClick={() => setShowJapanese(!showJapanese)}
            className={cn(
              'px-4 py-2 rounded-lg text-xs font-label font-bold tracking-widest transition-all',
              showJapanese
                ? 'bg-primary/15 text-primary'
                : 'bg-surface-container-highest text-secondary/50'
            )}
          >
            <Icon name={showJapanese ? 'visibility' : 'visibility_off'} size={14} className="mr-1 align-middle" />
            日本語
          </button>
          {course.sentences && course.sentences.length > 0 && (
            <button
              onClick={handlePlayAll}
              disabled={!showJapanese}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-label font-bold tracking-widest transition-all',
                isPlaying
                  ? 'bg-destructive/15 text-destructive'
                  : 'bg-surface-container-highest text-secondary/50 hover:text-primary',
                !showJapanese && 'opacity-30 cursor-not-allowed'
              )}
            >
              <Icon name={isPlaying ? 'stop_circle' : 'volume_up'} size={14} className="mr-1 align-middle" />
              {isPlaying ? '停止' : '再生'}
            </button>
          )}
        </div>
      </section>

      {/* Characters Section */}
      {course.characters && course.characters.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Icon name="group" size={20} className="text-primary" />
            <h3 className="font-headline text-xl font-bold tracking-tight">会話キャラクター</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {course.characters.map((character) => (
              <Link
                key={character.id}
                href={`/practice/${course.id}?character=${character.id}`}
              >
                <div className="bg-surface-container-high px-5 py-3 rounded-xl flex items-center gap-3 hover:bg-surface-container-highest transition-all cursor-pointer group">
                  <span className="font-headline font-bold text-on-surface text-sm group-hover:text-primary transition-colors">
                    {character.name_jp}
                  </span>
                  <Icon name="play_arrow" size={16} className="text-secondary/40 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Sentences Preview - Chat Bubble Style */}
      {course.sentences && course.sentences.length > 0 && (() => {
        // Determine which characters are "left" vs "right" based on first appearance
        const characterSides = new Map<number, 'left' | 'right'>();
        let sideToggle = false;
        course.sentences.forEach(s => {
          if (!characterSides.has(s.character_id)) {
            characterSides.set(s.character_id, sideToggle ? 'right' : 'left');
            sideToggle = !sideToggle;
          }
        });

        return (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-lg font-bold flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full" />
                ダイアログプレビュー
              </h3>
              <span className="text-secondary/50 font-label text-xs tracking-widest">
                {course.sentences.length}フレーズ
              </span>
            </div>
            <div className="space-y-3">
              {course.sentences.map((sentence) => {
                const character = course.characters?.find(c => c.id === sentence.character_id);
                const side = characterSides.get(sentence.character_id) || 'left';
                const isLeft = side === 'left';

                return (
                  <div
                    key={sentence.id}
                    className={cn('flex gap-3 items-start', isLeft ? '' : 'flex-row-reverse')}
                  >
                    {/* Avatar */}
                    <div className={cn(
                      'w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center',
                      isLeft ? 'bg-primary/15' : 'bg-tertiary/15'
                    )}>
                      <span className={cn(
                        'font-headline text-sm font-bold',
                        isLeft ? 'text-primary' : 'text-tertiary'
                      )}>
                        {(character?.name_jp || '?').charAt(0)}
                      </span>
                    </div>

                    {/* Bubble */}
                    <div className={cn(
                      'p-4 rounded-xl flex-1',
                      isLeft
                        ? 'bg-surface-container-low rounded-tl-none border-l-2 border-primary/20'
                        : 'bg-surface-container-high rounded-tr-none border-r-2 border-tertiary/30 text-right'
                    )}>
                      {showJapanese && (
                        <p className="font-medium text-lg text-on-surface mb-1">{sentence.text_jp}</p>
                      )}
                      {showChinese && (
                        <p className="text-sm text-secondary/60">{sentence.text_cn}</p>
                      )}
                      {!showJapanese && !showChinese && (
                        <p className="text-sm text-secondary/30 italic">テキスト非表示</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })()}
    </div>
  );
}
