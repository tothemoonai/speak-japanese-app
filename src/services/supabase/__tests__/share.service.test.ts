import { ShareService } from '@/services/supabase/share.service';
import type { PostgrestError } from '@supabase/supabase-js';

// Mock the supabase client
jest.mock('@/lib/supabase/client', () => {
  const mockFrom = jest.fn();
  return {
    supabase: jest.fn(() => ({
      from: mockFrom,
    })),
  };
});

// Mock window.location
delete (window as any).location;
(window as any).location = { origin: 'http://localhost:3000' };

describe('ShareService', () => {
  let shareService: ShareService;
  let mockFrom: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Get reference to the mock
    const { supabase: supabaseFn } = require('@/lib/supabase/client');
    const mockClient = supabaseFn();
    mockFrom = mockClient.from;

    shareService = new ShareService();
  });

  describe('createShare', () => {
    const mockInput = {
      userId: 'user-123',
      shareType: 'practice' as const,
      targetId: 1,
      title: 'Test Share',
      description: 'Test Description',
      imageUrl: 'https://example.com/image.png',
      expiresInDays: 30,
    };

    it('should create a new share', async () => {
      const mockShare = {
        id: 1,
        share_code: 'ABC12345',
        user_id: mockInput.userId,
        share_type: mockInput.shareType,
        target_id: mockInput.targetId,
        title: mockInput.title,
        description: mockInput.description,
        image_url: mockInput.imageUrl,
        click_count: 0,
        created_at: new Date().toISOString(),
      };

      // Mock check for existing code
      const mockCheckQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      // Mock insert
      const mockInsertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockShare, error: null }),
      };

      let fromCallCount = 0;
      mockFrom.mockImplementation(() => {
        fromCallCount++;
        if (fromCallCount <= 10) {
          return mockCheckQuery;
        } else {
          return mockInsertQuery;
        }
      });

      const result = await shareService.createShare(mockInput);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockShare);
      expect(mockInsertQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          share_code: expect.any(String),
          user_id: mockInput.userId,
          share_type: mockInput.shareType,
          target_id: mockInput.targetId,
        })
      );
    });

    it('should handle share code collision', async () => {
      const mockShare = {
        id: 1,
        share_code: 'ABC12345',
        user_id: mockInput.userId,
        share_type: mockInput.shareType,
        target_id: mockInput.targetId,
        title: mockInput.title,
      };

      let checkCount = 0;
      const mockCheckQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          checkCount++;
          // First attempt fails (code exists), second succeeds
          if (checkCount === 1) {
            return Promise.resolve({ data: { share_code: 'EXISTING' }, error: null });
          } else {
            return Promise.resolve({ data: null, error: null });
          }
        }),
      };

      const mockInsertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockShare, error: null }),
      };

      let fromCallCount = 0;
      mockFrom.mockImplementation(() => {
        fromCallCount++;
        if (fromCallCount <= 10) {
          return mockCheckQuery;
        } else {
          return mockInsertQuery;
        }
      });

      const result = await shareService.createShare(mockInput);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockShare);
      expect(mockCheckQuery.single).toHaveBeenCalledTimes(2);
    });

    it('should calculate expiration date', async () => {
      const inputWithExpiration = { ...mockInput, expiresInDays: 7 };

      const mockShare = {
        id: 1,
        share_code: 'ABC12345',
        user_id: inputWithExpiration.userId,
        share_type: inputWithExpiration.shareType,
        target_id: inputWithExpiration.targetId,
        title: inputWithExpiration.title,
      };

      const mockCheckQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      const mockInsertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockShare, error: null }),
      };

      let fromCallCount = 0;
      mockFrom.mockImplementation(() => {
        fromCallCount++;
        if (fromCallCount <= 10) {
          return mockCheckQuery;
        } else {
          return mockInsertQuery;
        }
      });

      await shareService.createShare(inputWithExpiration);

      const insertedData = mockInsertQuery.insert.mock.calls[0][0];
      expect(insertedData.expires_at).toBeDefined();
      const expirationDate = new Date(insertedData.expires_at);
      const today = new Date();
      const daysDiff = Math.floor((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBeGreaterThanOrEqual(6); // Allow for timing differences
      expect(daysDiff).toBeLessThanOrEqual(7);
    });

    it('should handle database errors', async () => {
      const mockError: PostgrestError = {
        message: 'Database error',
        code: 'PGRST116',
        details: '',
        hint: '',
      };

      const mockCheckQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      const mockInsertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      let fromCallCount = 0;
      mockFrom.mockImplementation(() => {
        fromCallCount++;
        if (fromCallCount <= 10) {
          return mockCheckQuery;
        } else {
          return mockInsertQuery;
        }
      });

      const result = await shareService.createShare(mockInput);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('getShareByCode', () => {
    const mockCode = 'ABC12345';

    it('should get share by code', async () => {
      const mockShare = {
        id: 1,
        share_code: mockCode,
        user_id: 'user-123',
        share_type: 'practice' as const,
        target_id: 1,
        title: 'Test Share',
        description: 'Test Description',
        click_count: 5,
        created_at: new Date().toISOString(),
        user: {
          nickname: 'Test User',
          avatar_url: 'https://example.com/avatar.png',
        },
      };

      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      const mockSelectQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { click_count: 5 }, error: null }),
      };

      const mockGetQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockShare, error: null }),
      };

      let fromCallCount = 0;
      mockFrom.mockImplementation(() => {
        fromCallCount++;
        if (fromCallCount === 1) {
          return mockSelectQuery;
        } else if (fromCallCount === 2) {
          return mockUpdateQuery;
        } else {
          return mockGetQuery;
        }
      });

      const result = await shareService.getShareByCode(mockCode);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockShare);
    });

    it('should return error for non-existent share', async () => {
      const mockError: PostgrestError = {
        message: 'Share not found',
        code: 'PGRST116',
        details: '',
        hint: '',
      };

      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      const mockSelectQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { click_count: 0 }, error: null }),
      };

      const mockGetQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      let fromCallCount = 0;
      mockFrom.mockImplementation(() => {
        fromCallCount++;
        if (fromCallCount === 1) {
          return mockSelectQuery;
        } else if (fromCallCount === 2) {
          return mockUpdateQuery;
        } else {
          return mockGetQuery;
        }
      });

      const result = await shareService.getShareByCode(mockCode);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });

    it('should handle expired shares', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const mockShare = {
        id: 1,
        share_code: mockCode,
        user_id: 'user-123',
        share_type: 'practice' as const,
        target_id: 1,
        title: 'Test Share',
        expires_at: yesterday.toISOString(),
        click_count: 5,
        created_at: new Date().toISOString(),
      };

      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      const mockSelectQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { click_count: 5 }, error: null }),
      };

      const mockGetQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockShare, error: null }),
      };

      let fromCallCount = 0;
      mockFrom.mockImplementation(() => {
        fromCallCount++;
        if (fromCallCount === 1) {
          return mockSelectQuery;
        } else if (fromCallCount === 2) {
          return mockUpdateQuery;
        } else {
          return mockGetQuery;
        }
      });

      const result = await shareService.getShareByCode(mockCode);

      expect(result.data).toBeNull();
      expect(result.error).toHaveProperty('message', 'Share has expired');
    });
  });

  describe('getUserShares', () => {
    const mockUserId = 'user-123';

    it('should get user shares', async () => {
      const mockShares = [
        {
          id: 1,
          share_code: 'ABC12345',
          user_id: mockUserId,
          share_type: 'practice' as const,
          target_id: 1,
          title: 'Share 1',
          created_at: '2025-01-09T10:00:00.000Z',
        },
        {
          id: 2,
          share_code: 'XYZ67890',
          user_id: mockUserId,
          share_type: 'course' as const,
          target_id: 2,
          title: 'Share 2',
          created_at: '2025-01-08T10:00:00.000Z',
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockShares,
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await shareService.getUserShares(mockUserId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockShares);
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should return empty array when no shares', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await shareService.getUserShares(mockUserId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });

    it('should handle database errors', async () => {
      const mockError: PostgrestError = {
        message: 'Database error',
        code: 'PGRST116',
        details: '',
        hint: '',
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await shareService.getUserShares(mockUserId);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('deleteShare', () => {
    it('should delete a share', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await shareService.deleteShare(1);

      expect(result.error).toBeNull();
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 1);
    });

    it('should handle errors during deletion', async () => {
      const mockError: PostgrestError = {
        message: 'Delete failed',
        code: 'PGRST116',
        details: '',
        hint: '',
      };

      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: mockError,
        }),
      };

      mockFrom.mockReturnValue(mockQuery);

      const result = await shareService.deleteShare(1);

      expect(result.error).toEqual(mockError);
    });
  });

  describe('getShareUrl', () => {
    it('should generate share URL', () => {
      const mockCode = 'ABC12345';
      const url = shareService.getShareUrl(mockCode);

      expect(url).toBe('http://localhost:3000/share/ABC12345');
    });

    it('should use custom base URL from env', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://custom.example.com';
      const mockCode = 'XYZ67890';
      const url = shareService.getShareUrl(mockCode);

      expect(url).toBe('https://custom.example.com/share/XYZ67890');
      delete process.env.NEXT_PUBLIC_APP_URL;
    });
  });

  describe('sharePracticeResult', () => {
    it('should create practice result share', async () => {
      const mockInput = {
        userId: 'user-123',
        practiceId: 1,
        score: 85,
        courseName: '基础日语',
      };

      const mockShare = {
        id: 1,
        share_code: 'ABC12345',
        user_id: mockInput.userId,
        share_type: 'practice' as const,
        target_id: mockInput.practiceId,
        title: `我在「${mockInput.courseName}」中获得了${mockInput.score}分！`,
      };

      const mockCheckQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      const mockInsertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockShare, error: null }),
      };

      let fromCallCount = 0;
      mockFrom.mockImplementation(() => {
        fromCallCount++;
        if (fromCallCount <= 10) {
          return mockCheckQuery;
        } else {
          return mockInsertQuery;
        }
      });

      const result = await shareService.sharePracticeResult(mockInput);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockShare);

      const insertedData = mockInsertQuery.insert.mock.calls[0][0];
      expect(insertedData.title).toContain(mockInput.courseName);
      expect(insertedData.title).toContain(mockInput.score.toString());
      expect(insertedData.expires_in_days).toBe(30);
    });
  });

  describe('shareCourseCompletion', () => {
    it('should create course completion share', async () => {
      const mockInput = {
        userId: 'user-123',
        courseId: 1,
        courseName: '基础日语',
      };

      const mockShare = {
        id: 1,
        share_code: 'ABC12345',
        user_id: mockInput.userId,
        share_type: 'course' as const,
        target_id: mockInput.courseId,
        title: `我完成了「${mockInput.courseName}」的学习！`,
      };

      const mockCheckQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      const mockInsertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockShare, error: null }),
      };

      let fromCallCount = 0;
      mockFrom.mockImplementation(() => {
        fromCallCount++;
        if (fromCallCount <= 10) {
          return mockCheckQuery;
        } else {
          return mockInsertQuery;
        }
      });

      const result = await shareService.shareCourseCompletion(mockInput);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockShare);

      const insertedData = mockInsertQuery.insert.mock.calls[0][0];
      expect(insertedData.title).toContain(mockInput.courseName);
      expect(insertedData.expires_in_days).toBe(30);
    });
  });

  describe('shareAchievement', () => {
    it('should create achievement share', async () => {
      const mockInput = {
        userId: 'user-123',
        achievementId: 1,
        achievementName: '连续练习7天',
        imageUrl: 'https://example.com/badge.png',
      };

      const mockShare = {
        id: 1,
        share_code: 'ABC12345',
        user_id: mockInput.userId,
        share_type: 'achievement' as const,
        target_id: mockInput.achievementId,
        title: `我获得了成就「${mockInput.achievementName}」！`,
        image_url: mockInput.imageUrl,
      };

      const mockCheckQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      const mockInsertQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockShare, error: null }),
      };

      let fromCallCount = 0;
      mockFrom.mockImplementation(() => {
        fromCallCount++;
        if (fromCallCount <= 10) {
          return mockCheckQuery;
        } else {
          return mockInsertQuery;
        }
      });

      const result = await shareService.shareAchievement(mockInput);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockShare);

      const insertedData = mockInsertQuery.insert.mock.calls[0][0];
      expect(insertedData.title).toContain(mockInput.achievementName);
      expect(insertedData.image_url).toEqual(mockInput.imageUrl);
      expect(insertedData.expires_in_days).toBe(30);
    });
  });
});
