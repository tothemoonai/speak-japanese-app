'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/supabase/auth.service';
import { BottomNavBar } from '@/components/ui/zen/BottomNavBar';
import { Icon } from '@/components/ui/zen/Icon';
import { cn } from '@/lib/utils';
import { getUserLevel } from '@/lib/utils/user';
import { ApiKeySettings } from '@/components/settings/ApiKeySettings';
import { FontSizeSettings } from '@/components/settings/FontSizeSettings';
import { ColorSchemeSettings } from '@/components/settings/ColorSchemeSettings';
import { ASRSettings } from '@/components/settings/ASRSettings';
import { VERSION_DISPLAY } from '@/VERSION';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Nickname editing
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nickname, setNickname] = useState('');
  const [isUpdatingNickname, setIsUpdatingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState('');

  // Password change
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (user) setNickname(user.nickname || '');
  }, [user]);

  useEffect(() => {
    if (mounted && !user) router.push('/login');
  }, [user, router, mounted]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleUpdateNickname = async () => {
    setNicknameError('');
    if (!nickname.trim()) { setNicknameError('ニックネームを入力してください'); return; }

    setIsUpdatingNickname(true);
    try {
      const { user: updatedUser, error } = await authService.updateNickname(nickname.trim());
      if (error) throw error;
      if (updatedUser) {
        setUser(updatedUser);
        setIsEditingNickname(false);
      }
    } catch (error: any) {
      setNicknameError(error.message || 'ニックネームの更新に失敗しました');
    } finally {
      setIsUpdatingNickname(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('すべてのパスワードフィールドを入力してください');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('新しいパスワードは6文字以上にしてください');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('新しいパスワードが一致しません');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error: loginError } = await authService.login({ email: user!.email, password: currentPassword });
      if (loginError) { setPasswordError('現在のパスワードが正しくありません'); setIsUpdatingPassword(false); return; }

      const { error } = await authService.updatePassword(newPassword);
      if (error) throw error;

      setPasswordSuccess('パスワードが変更されました。再度ログインしてください。');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);

      setTimeout(async () => { await logout(); router.push('/login'); }, 1500);
    } catch (error: any) {
      setPasswordError(error.message || 'パスワードの変更に失敗しました');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!mounted || !user) return null;

  const levelMap = { beginner: '初級', intermediate: '中級', advanced: '上級' };
  const userLevel = getUserLevel(user);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 header-gradient">
        <div className="max-w-4xl mx-auto flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <Icon name="settings" size={20} className="text-primary" />
          <h1 className="font-headline font-bold text-primary tracking-tighter text-xl">設定</h1>
        </div>
        <span className="font-label text-xs text-secondary/50 tracking-widest hidden sm:block">
          {user.nickname || user.email?.split('@')[0]}
        </span>
        </div>
      </header>

      <main className="px-6 pt-6 pb-32 max-w-4xl mx-auto space-y-6">
        {/* User Info Card */}
        <section className="bg-surface-container-low p-6 rounded-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-primary/20 p-0.5 bg-surface-container-high flex items-center justify-center">
              <Icon name="person" size={24} className="text-secondary" />
            </div>
            <div>
              <p className="font-headline font-bold text-on-surface">{user.nickname || '未設定'}</p>
              <p className="text-secondary/50 text-xs font-label tracking-widest">{user.email}</p>
            </div>
            <span className={cn(
              'ml-auto px-3 py-1 rounded-lg font-label text-xs font-bold tracking-widest',
              'bg-primary/10 text-primary'
            )}>
              {levelMap[userLevel as keyof typeof levelMap] || '初級'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-secondary/40 text-xs font-label">
            <Icon name="info" size={14} />
            <span>バージョン {VERSION_DISPLAY}</span>
          </div>
        </section>

        {/* Admin Content Management - only for admin users */}
        {user.is_admin && (
          <Link href="/admin/content" className="block">
            <section className="bg-surface-container-low p-6 rounded-2xl flex items-center justify-between group hover:bg-surface-container-high cursor-pointer transition-all">
              <div className="flex items-center gap-3">
                <Icon name="admin_panel_settings" size={20} className="text-primary" />
                <div>
                  <h3 className="font-headline font-bold text-on-surface">データ管理</h3>
                  <p className="text-secondary/50 text-xs font-label tracking-widest">教材・コース・文の管理</p>
                </div>
              </div>
              <Icon name="chevron_right" size={20} className="text-secondary opacity-40" />
            </section>
          </Link>
        )}

        {/* Edit Nickname */}
        <section className="bg-surface-container-low p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="edit" size={18} className="text-primary" />
              <h3 className="font-headline font-bold text-on-surface">ニックネーム</h3>
            </div>
            {!isEditingNickname && (
              <button
                onClick={() => setIsEditingNickname(true)}
                className="text-xs text-primary font-label font-bold tracking-widest hover:underline"
              >
                変更
              </button>
            )}
          </div>

          {isEditingNickname ? (
            <div className="space-y-3">
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="新しいニックネーム"
                maxLength={20}
                disabled={isUpdatingNickname}
                className="w-full bg-surface-container-high px-4 py-3 rounded-xl text-on-surface font-body border border-outline-variant/10 focus:border-primary/50 focus:outline-none transition-colors"
              />
              {nicknameError && <p className="text-destructive text-xs font-body">{nicknameError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleUpdateNickname}
                  disabled={isUpdatingNickname}
                  className="bg-primary text-primary-foreground font-headline font-bold text-sm px-5 py-2.5 rounded-xl active:scale-95 transition-all disabled:opacity-50"
                >
                  {isUpdatingNickname ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={() => { setIsEditingNickname(false); setNickname(user.nickname || ''); setNicknameError(''); }}
                  className="bg-surface-container-high text-on-surface-variant font-headline font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-surface-container-highest transition-all"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <p className="text-secondary/60 text-sm font-body">{user.nickname || '未設定'}</p>
          )}
        </section>

        {/* Change Password */}
        <section className="bg-surface-container-low p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="lock" size={18} className="text-primary" />
              <h3 className="font-headline font-bold text-on-surface">パスワード</h3>
            </div>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="text-xs text-primary font-label font-bold tracking-widest hover:underline"
              >
                変更
              </button>
            )}
          </div>

          {passwordSuccess && (
            <div className="bg-primary/10 text-primary px-4 py-3 rounded-xl text-sm font-body">
              {passwordSuccess}
            </div>
          )}

          {isChangingPassword ? (
            <div className="space-y-3">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="現在のパスワード"
                disabled={isUpdatingPassword}
                className="w-full bg-surface-container-high px-4 py-3 rounded-xl text-on-surface font-body border border-outline-variant/10 focus:border-primary/50 focus:outline-none transition-colors"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="新しいパスワード（6文字以上）"
                disabled={isUpdatingPassword}
                className="w-full bg-surface-container-high px-4 py-3 rounded-xl text-on-surface font-body border border-outline-variant/10 focus:border-primary/50 focus:outline-none transition-colors"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="新しいパスワードを再入力"
                disabled={isUpdatingPassword}
                className="w-full bg-surface-container-high px-4 py-3 rounded-xl text-on-surface font-body border border-outline-variant/10 focus:border-primary/50 focus:outline-none transition-colors"
              />
              {passwordError && <p className="text-destructive text-xs font-body">{passwordError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleChangePassword}
                  disabled={isUpdatingPassword}
                  className="bg-primary text-primary-foreground font-headline font-bold text-sm px-5 py-2.5 rounded-xl active:scale-95 transition-all disabled:opacity-50"
                >
                  {isUpdatingPassword ? '変更中...' : '確認'}
                </button>
                <button
                  onClick={() => { setIsChangingPassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPasswordError(''); }}
                  className="bg-surface-container-high text-on-surface-variant font-headline font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-surface-container-highest transition-all"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <p className="text-secondary/60 text-sm font-body">セキュリティのため定期的に変更してください</p>
          )}
        </section>

        {/* Font Size Settings */}
        <section className="bg-surface-container-low p-6 rounded-2xl">
          <FontSizeSettings />
        </section>

        {/* Color Scheme Settings */}
        <section className="bg-surface-container-low p-6 rounded-2xl">
          <ColorSchemeSettings />
        </section>

        {/* API Key Settings */}
        <section className="bg-surface-container-low p-6 rounded-2xl">
          <ApiKeySettings />
        </section>

        {/* ASR Settings */}
        <ASRSettings />

        {/* Logout */}
        <section className="pt-4">
          <button
            onClick={handleLogout}
            className="w-full bg-destructive/10 text-destructive font-headline font-bold text-sm px-6 py-4 rounded-xl hover:bg-destructive/20 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <Icon name="logout" size={18} />
            ログアウト
          </button>
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}
