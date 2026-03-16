import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExtendedUser } from '@/types/auth';
import { authService } from '@/services/supabase/auth.service';

interface AuthState {
  user: ExtendedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: ExtendedUser | null) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      initialize: async () => {
        set({ isLoading: true });
        try {
          // 从 Supabase 恢复 session
          const user = await authService.getCurrentUser();
          set({
            user,
            isAuthenticated: !!user,
            isLoading: false,
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { user, error } = await authService.login({ email, password });
          if (error) throw error;
          set({
            user,
            isAuthenticated: !!user,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, nickname?: string) => {
        set({ isLoading: true });
        try {
          const { user, error } = await authService.register({
            email,
            password,
            nickname,
          });
          if (error) throw error;

          // 注册成功，但不自动登录
          // 用户需要通过邮件确认后才能登录
          set({
            isLoading: false,
          });

          return { user, needsEmailVerification: true };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
          // 清除所有状态
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
