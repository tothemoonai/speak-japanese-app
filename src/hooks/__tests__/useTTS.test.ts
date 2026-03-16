import { renderHook, act, waitFor } from '@testing-library/react';
import { useTTS, useVoices } from '@/hooks/useTTS';

// Mock SpeechSynthesisUtterance
class MockSpeechSynthesisUtterance {
  public text: string;
  public lang: string = 'ja-JP';
  public voice: SpeechSynthesisVoice | null = null;
  public pitch: number = 1.0;
  public rate: number = 1.0;
  public volume: number = 1.0;
  public onstart: (() => void) | null = null;
  public onend: (() => void) | null = null;
  public onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;
  public onpause: (() => void) | null = null;
  public onresume: (() => void) | null = null;
  public onboundary: ((event: SpeechSynthesisEvent) => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

// Mock SpeechSynthesis
const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => []),
  onvoiceschanged: null,
};

// Mock SpeechSynthesisErrorEvent
class MockSpeechSynthesisErrorEvent {
  public error: string;
  public readonly type: string;
  public readonly target: SpeechSynthesisUtterance | null;
  public readonly timeStamp: number;

  constructor(error: string) {
    this.error = error;
    this.type = 'error';
    this.target = null;
    this.timeStamp = Date.now();
  }
}

// Set up mocks
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: mockSpeechSynthesis,
});

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  writable: true,
  value: MockSpeechSynthesisUtterance,
});

Object.defineProperty(window, 'SpeechSynthesisErrorEvent', {
  writable: true,
  value: MockSpeechSynthesisErrorEvent,
});

describe('useTTS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('useTTS Hook', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useTTS());

      expect(result.current.state).toEqual({
        isPlaying: false,
        isPaused: false,
        currentText: null,
        error: null,
      });
    });

    it('should start speaking', () => {
      const { result } = renderHook(() => useTTS());

      act(() => {
        result.current.controls.speak('こんにちは');
      });

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    });

    it('should set language correctly', () => {
      const { result } = renderHook(() => useTTS());

      act(() => {
        result.current.controls.speak('こんにちは', 'en-US');
      });

      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      expect(utterance.lang).toBe('en-US');
    });

    it('should prefer Japanese voice', () => {
      const mockVoices = [
        { lang: 'en-US', name: 'English' },
        { lang: 'ja-JP', name: 'Japanese' },
      ];
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);

      const { result } = renderHook(() => useTTS());

      act(() => {
        result.current.controls.speak('こんにちは');
      });

      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      expect(utterance.voice).toEqual(mockVoices[1]);
    });

    it('should handle missing speech synthesis support', () => {
      const originalSpeechSynthesis = window.speechSynthesis;
      delete (window as any).speechSynthesis;

      const { result } = renderHook(() => useTTS());

      act(() => {
        result.current.controls.speak('こんにちは');
      });

      expect(result.current.state.error).toBeInstanceOf(Error);
      expect(result.current.state.error?.message).toBe('Speech synthesis is not supported in this browser');
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();

      // Restore speechSynthesis
      window.speechSynthesis = originalSpeechSynthesis;
    });

    it('should pause speech', () => {
      const { result } = renderHook(() => useTTS());

      // First start speaking
      act(() => {
        result.current.controls.speak('こんにちは');
      });

      // Simulate onstart event
      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      act(() => {
        utterance.onstart?.();
      });

      expect(result.current.state.isPlaying).toBe(true);

      // Now pause
      act(() => {
        result.current.controls.pause();
      });

      expect(mockSpeechSynthesis.pause).toHaveBeenCalled();
    });

    it('should not pause if not speaking', () => {
      const { result } = renderHook(() => useTTS());

      act(() => {
        result.current.controls.pause();
      });

      expect(mockSpeechSynthesis.pause).not.toHaveBeenCalled();
    });

    it('should resume speech', () => {
      const { result } = renderHook(() => useTTS());

      // First start speaking
      act(() => {
        result.current.controls.speak('こんにちは');
      });

      // Simulate onstart event
      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      act(() => {
        utterance.onstart?.();
      });

      // Pause
      act(() => {
        result.current.controls.pause();
      });

      // Now resume
      act(() => {
        result.current.controls.resume();
      });

      expect(mockSpeechSynthesis.resume).toHaveBeenCalled();
    });

    it('should not resume if not paused', () => {
      const { result } = renderHook(() => useTTS());

      // Start speaking
      act(() => {
        result.current.controls.speak('こんにちは');
      });

      // Simulate onstart event
      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      act(() => {
        utterance.onstart?.();
      });

      // Try to resume without pausing
      act(() => {
        result.current.controls.resume();
      });

      expect(mockSpeechSynthesis.resume).not.toHaveBeenCalled();
    });

    it('should cancel speech', () => {
      const { result } = renderHook(() => useTTS());

      // Start speaking
      act(() => {
        result.current.controls.speak('こんにちは');
      });

      // Simulate onstart event
      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];
      act(() => {
        utterance.onstart?.();
      });

      expect(result.current.state.isPlaying).toBe(true);

      // Cancel
      act(() => {
        result.current.controls.cancel();
      });

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      expect(result.current.state.isPlaying).toBe(false);
      expect(result.current.state.currentText).toBeNull();
    });

    it('should handle onstart event', () => {
      const { result } = renderHook(() => useTTS());

      act(() => {
        result.current.controls.speak('こんにちは');
      });

      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];

      act(() => {
        utterance.onstart?.();
      });

      expect(result.current.state.isPlaying).toBe(true);
      expect(result.current.state.isPaused).toBe(false);
      expect(result.current.state.currentText).toBe('こんにちは');
    });

    it('should handle onend event', () => {
      const { result } = renderHook(() => useTTS());

      act(() => {
        result.current.controls.speak('こんにちは');
      });

      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];

      // Simulate start
      act(() => {
        utterance.onstart?.();
      });

      expect(result.current.state.isPlaying).toBe(true);

      // Simulate end
      act(() => {
        utterance.onend?.();
      });

      expect(result.current.state.isPlaying).toBe(false);
      expect(result.current.state.currentText).toBeNull();
    });

    it('should handle onerror event', () => {
      const { result } = renderHook(() => useTTS());

      act(() => {
        result.current.controls.speak('こんにちは');
      });

      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];

      act(() => {
        utterance.onerror?.({ error: 'synthesis-failed' } as SpeechSynthesisErrorEvent);
      });

      expect(result.current.state.isPlaying).toBe(false);
      expect(result.current.state.error).toBeInstanceOf(Error);
      expect(result.current.state.error?.message).toContain('synthesis-failed');
    });

    it('should handle onpause event', () => {
      const { result } = renderHook(() => useTTS());

      act(() => {
        result.current.controls.speak('こんにちは');
      });

      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];

      // Simulate start
      act(() => {
        utterance.onstart?.();
      });

      // Simulate pause
      act(() => {
        utterance.onpause?.();
      });

      expect(result.current.state.isPaused).toBe(true);
    });

    it('should handle onresume event', () => {
      const { result } = renderHook(() => useTTS());

      act(() => {
        result.current.controls.speak('こんにちは');
      });

      const utterance = mockSpeechSynthesis.speak.mock.calls[0][0];

      // Simulate start and pause
      act(() => {
        utterance.onstart?.();
        utterance.onpause?.();
      });

      expect(result.current.state.isPaused).toBe(true);

      // Simulate resume
      act(() => {
        utterance.onresume?.();
      });

      expect(result.current.state.isPaused).toBe(false);
    });

    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(() => useTTS());

      unmount();

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });
  });

  describe('useVoices Hook', () => {
    it('should load voices', async () => {
      const mockVoices = [
        { lang: 'en-US', name: 'English' },
        { lang: 'ja-JP', name: 'Japanese' },
      ];
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);

      const { result } = renderHook(() => useVoices());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.voices).toEqual(mockVoices);
    });

    it('should handle missing speech synthesis', () => {
      const originalSpeechSynthesis = window.speechSynthesis;
      delete (window as any).speechSynthesis;

      const { result } = renderHook(() => useVoices());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.voices).toEqual([]);

      // Restore speechSynthesis
      window.speechSynthesis = originalSpeechSynthesis;
    });

    it('should update voices when onvoiceschanged fires', async () => {
      const initialVoices = [{ lang: 'en-US', name: 'English' }];
      const updatedVoices = [
        { lang: 'en-US', name: 'English' },
        { lang: 'ja-JP', name: 'Japanese' },
      ];

      mockSpeechSynthesis.getVoices.mockReturnValueOnce(initialVoices);

      const { result } = renderHook(() => useVoices());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.voices).toEqual(initialVoices);

      // Simulate voiceschanged event
      mockSpeechSynthesis.getVoices.mockReturnValue(updatedVoices);

      act(() => {
        if (mockSpeechSynthesis.onvoiceschanged) {
          (mockSpeechSynthesis as any).onvoiceschanged();
        }
      });

      expect(result.current.voices).toEqual(updatedVoices);
    });

    it('should cleanup onvoiceschanged listener on unmount', () => {
      const mockVoices = [{ lang: 'en-US', name: 'English' }];
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);

      const { unmount } = renderHook(() => useVoices());

      unmount();

      expect(mockSpeechSynthesis.onvoiceschanged).toBeNull();
    });
  });
});
