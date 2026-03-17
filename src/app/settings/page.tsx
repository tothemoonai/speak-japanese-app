'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/supabase/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, User, Shield, Palette, LogOut, Sun, Moon, Check, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { getUserLevel } from '@/lib/utils/user';
import { ApiKeySettings } from '@/components/settings/ApiKeySettings';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // 昵称编辑状态
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nickname, setNickname] = useState('');
  const [isUpdatingNickname, setIsUpdatingNickname] = useState(false);

  // 修改密码状态
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // 错误信息
  const [nicknameError, setNicknameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setMounted(true);
    if (user) {
      setNickname(user.nickname || '');
    }
  }, [user]);

  useEffect(() => {
    if (mounted && !user) {
      router.push('/login');
    }
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
    if (!nickname.trim()) {
      setNicknameError('昵称不能为空');
      return;
    }

    setIsUpdatingNickname(true);
    try {
      const { user: updatedUser, error } = await authService.updateNickname(nickname.trim());
      if (error) throw error;

      if (updatedUser) {
        setUser(updatedUser);
        toast({
          title: '昵称更新成功',
          description: '您的昵称已成功更新',
        });
        setIsEditingNickname(false);
      }
    } catch (error: any) {
      setNicknameError(error.message || '更新昵称失败');
    } finally {
      setIsUpdatingNickname(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('请填写所有密码字段');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('新密码长度至少为6位');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的新密码不一致');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      // 首先验证当前密码
      const { error: loginError } = await authService.login({
        email: user.email,
        password: currentPassword,
      });

      if (loginError) {
        setPasswordError('当前密码不正确');
        setIsUpdatingPassword(false);
        return;
      }

      // 更新密码
      const { error } = await authService.updatePassword(newPassword);
      if (error) throw error;

      toast({
        title: '密码修改成功',
        description: '请使用新密码重新登录',
      });

      // 清空表单
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);

      // 登出用户
      setTimeout(async () => {
        await logout();
        router.push('/login');
      }, 1500);
    } catch (error: any) {
      setPasswordError(error.message || '修改密码失败');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!mounted || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <Link href="/dashboard">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
                设置
              </h1>
            </Link>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  返回首页
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* User Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              账户信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">邮箱</span>
              <span className="text-sm font-medium">{user.email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">当前等级</span>
              <Badge variant="outline">
                {getUserLevel(user) === 'beginner' && '初级'}
                {getUserLevel(user) === 'intermediate' && '中级'}
                {getUserLevel(user) === 'advanced' && '高级'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Edit Nickname */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              修改昵称
            </CardTitle>
            <CardDescription>
              设置您在IT日语中显示的名称
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditingNickname ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="输入新昵称"
                    maxLength={20}
                    disabled={isUpdatingNickname}
                  />
                  {nicknameError && (
                    <p className="text-sm text-red-600">{nicknameError}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateNickname}
                    disabled={isUpdatingNickname}
                    size="sm"
                  >
                    {isUpdatingNickname ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        更新中...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        保存
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingNickname(false);
                      setNickname(user.nickname || '');
                      setNicknameError('');
                    }}
                    disabled={isUpdatingNickname}
                    size="sm"
                  >
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{user.nickname || '未设置'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    点击右侧按钮修改昵称
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingNickname(true)}
                >
                  修改
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              修改密码
            </CardTitle>
            <CardDescription>
              定期修改密码以保护账户安全
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isChangingPassword ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">当前密码</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="输入当前密码"
                    disabled={isUpdatingPassword}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">新密码</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="至少6位"
                    disabled={isUpdatingPassword}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">确认新密码</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入新密码"
                    disabled={isUpdatingPassword}
                  />
                </div>
                {passwordError && (
                  <p className="text-sm text-red-600">{passwordError}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleChangePassword}
                    disabled={isUpdatingPassword}
                    size="sm"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        修改中...
                      </>
                    ) : (
                      '确认修改'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError('');
                    }}
                    disabled={isUpdatingPassword}
                    size="sm"
                  >
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsChangingPassword(true)}
                className="w-full sm:w-auto"
              >
                修改密码
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              外观设置
            </CardTitle>
            <CardDescription>
              选择您喜欢的主题模式
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="flex-1 sm:flex-none"
              >
                <Sun className="h-4 w-4 mr-2" />
                白天模式
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="flex-1 sm:flex-none"
              >
                <Moon className="h-4 w-4 mr-2" />
                夜晚模式
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
                className="flex-1 sm:flex-none"
              >
                跟随系统
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Key Settings */}
        <ApiKeySettings />

        {/* Logout Button */}
        <Card className="mt-6 border-red-200 dark:border-red-900">
          <CardContent className="pt-6">
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
