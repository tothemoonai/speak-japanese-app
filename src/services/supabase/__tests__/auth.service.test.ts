import { AuthService } from '@/services/supabase/auth.service';
import type { RegisterInput, LoginInput } from '@/services/supabase/auth.service';

// Mock the entire module
jest.mock('@/lib/supabase/client', () => {
  const mockAuth = {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
  };

  return {
    supabase: jest.fn(() => ({
      auth: mockAuth,
    })),
  };
});

describe('AuthService', () => {
  let authService: AuthService;
  let mockAuth: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Get reference to the mock auth object
    const { supabase: supabaseFn } = require('@/lib/supabase/client');
    const client = supabaseFn();
    mockAuth = client.auth;

    authService = new AuthService();
  });

  describe('register', () => {
    const validInput: RegisterInput = {
      email: 'test@example.com',
      password: 'SecurePass123',
      nickname: 'TestUser'
    };

    it('should successfully register a new user', async () => {
      const mockUser = {
        id: 'user-123',
        email: validInput.email,
        user_metadata: { nickname: validInput.nickname }
      };

      mockAuth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await authService.register(validInput);

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: validInput.email,
        password: validInput.password,
        options: {
          data: {
            nickname: validInput.nickname
          }
        }
      });
    });

    it('should use email prefix as default nickname when not provided', async () => {
      const inputWithoutNickname: RegisterInput = {
        email: 'test@example.com',
        password: 'SecurePass123'
      };

      const mockUser = {
        id: 'user-123',
        email: inputWithoutNickname.email,
        user_metadata: { nickname: 'test' }
      };

      mockAuth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await authService.register(inputWithoutNickname);

      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: inputWithoutNickname.email,
        password: inputWithoutNickname.password,
        options: {
          data: {
            nickname: 'test' // Email prefix
          }
        }
      });
    });

    it('should return error when email already exists', async () => {
      const mockError = {
        message: 'User already registered',
        status: 400
      };

      mockAuth.signUp.mockResolvedValue({
        data: { user: null },
        error: mockError
      });

      const result = await authService.register(validInput);

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should return error for invalid email format', async () => {
      const invalidInput: RegisterInput = {
        email: 'invalid-email',
        password: 'SecurePass123'
      };

      const mockError = {
        message: 'Invalid email format',
        status: 400
      };

      mockAuth.signUp.mockResolvedValue({
        data: { user: null },
        error: mockError
      });

      const result = await authService.register(invalidInput);

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should return error for weak password', async () => {
      const weakPasswordInput: RegisterInput = {
        email: 'test@example.com',
        password: '123' // Too weak
      };

      const mockError = {
        message: 'Password should be at least 6 characters',
        status: 400
      };

      mockAuth.signUp.mockResolvedValue({
        data: { user: null },
        error: mockError
      });

      const result = await authService.register(weakPasswordInput);

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should handle network errors', async () => {
      mockAuth.signUp.mockRejectedValue(
        new Error('Network error')
      );

      await expect(authService.register(validInput)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('login', () => {
    const validInput: LoginInput = {
      email: 'test@example.com',
      password: 'SecurePass123'
    };

    it('should successfully login with correct credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: validInput.email,
        user_metadata: { nickname: 'TestUser' }
      };

      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await authService.login(validInput);

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: validInput.email,
        password: validInput.password
      });
    });

    it('should return error for wrong password', async () => {
      const wrongPasswordInput: LoginInput = {
        email: 'test@example.com',
        password: 'WrongPassword'
      };

      const mockError = {
        message: 'Invalid login credentials',
        status: 401
      };

      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: mockError
      });

      const result = await authService.login(wrongPasswordInput);

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should return error for non-existent user', async () => {
      const nonExistentInput: LoginInput = {
        email: 'nonexistent@example.com',
        password: 'SomePassword123'
      };

      const mockError = {
        message: 'Invalid login credentials',
        status: 401
      };

      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: mockError
      });

      const result = await authService.login(nonExistentInput);

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should handle login service errors', async () => {
      mockAuth.signInWithPassword.mockRejectedValue(
        new Error('Service temporarily unavailable')
      );

      await expect(authService.login(validInput)).rejects.toThrow(
        'Service temporarily unavailable'
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      mockAuth.signOut.mockResolvedValue({
        error: null
      });

      const result = await authService.logout();

      expect(result.error).toBeNull();
      expect(mockAuth.signOut).toHaveBeenCalled();
    });

    it('should handle logout errors gracefully', async () => {
      const mockError = {
        message: 'Logout failed',
        status: 500
      };

      mockAuth.signOut.mockResolvedValue({
        error: mockError
      });

      const result = await authService.logout();

      expect(result.error).toEqual(mockError);
    });

    it('should handle network errors during logout', async () => {
      mockAuth.signOut.mockRejectedValue(
        new Error('Network error')
      );

      await expect(authService.logout()).rejects.toThrow('Network error');
    });
  });

  describe('getCurrentUser', () => {
    it('should return user when authenticated', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { nickname: 'TestUser' }
      };

      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser }
      });

      const result = await authService.getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(mockAuth.getUser).toHaveBeenCalled();
    });

    it('should return null when not authenticated', async () => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: null }
      });

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should handle session expiration', async () => {
      const mockError = {
        message: 'Session expired',
        status: 401
      };

      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: mockError
      });

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should handle network errors', async () => {
      mockAuth.getUser.mockRejectedValue(
        new Error('Network error')
      );

      await expect(authService.getCurrentUser()).rejects.toThrow(
        'Network error'
      );
    });
  });
});
