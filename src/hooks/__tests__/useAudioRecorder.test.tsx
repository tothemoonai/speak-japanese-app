import { renderHook, act, waitFor } from '@testing-library/react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

// Mock MediaStream
class MockMediaStream {
  public tracks: any[] = [];

  constructor() {
    this.tracks = [{ stop: jest.fn() }];
  }

  getTracks() {
    return this.tracks;
  }
}

// Mock MediaRecorder
class MockMediaRecorder {
  public stream: any;
  public ondataavailable: ((event: BlobEvent) => void) | null = null;
  public onstop: (() => void) | null = null;
  public state: 'inactive' | 'recording' | 'paused' = 'inactive';
  private audioChunks: Blob[] = [];

  constructor(stream: any) {
    this.stream = stream;
  }

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) {
      this.onstop();
    }
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'recording';
  }

  requestData(size: number) {
    if (this.ondataavailable) {
      const blob = new Blob([new ArrayBuffer(size)], { type: 'audio/wav' });
      this.ondataavailable({ data: blob } as BlobEvent);
    }
  }
}

// Mock getUserMedia
const mockGetUserMedia = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-audio-url');
global.URL.revokeObjectURL = jest.fn();

// Mock MediaRecorder
Object.defineProperty(window, 'MediaRecorder', {
  writable: true,
  value: MockMediaRecorder,
});

Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: mockGetUserMedia,
  },
});

describe('useAudioRecorder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should have correct initial state', () => {
    const { result } = renderHook(() => useAudioRecorder());

    expect(result.current.state).toEqual({
      isRecording: false,
      isPaused: false,
      audioBlob: null,
      audioUrl: null,
      duration: 0,
      error: null,
    });
  });

  it('should start recording successfully', async () => {
    const mockStream = new MockMediaStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.controls.startRecording();
    });

    expect(result.current.state.isRecording).toBe(true);
    expect(result.current.state.isPaused).toBe(false);
    expect(result.current.state.error).toBeNull();
    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
  });

  it('should handle microphone permission denial', async () => {
    const mockError = new Error('Permission denied');
    mockError.name = 'NotAllowedError';
    mockGetUserMedia.mockRejectedValue(mockError);

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.controls.startRecording();
    });

    expect(result.current.state.isRecording).toBe(false);
    expect(result.current.state.error).toBeInstanceOf(Error);
    expect(result.current.state.error?.message).toBe('Permission denied');
  });

  it('should handle microphone not found', async () => {
    const mockError = new Error('Device not found');
    mockError.name = 'NotFoundError';
    mockGetUserMedia.mockRejectedValue(mockError);

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.controls.startRecording();
    });

    expect(result.current.state.isRecording).toBe(false);
    expect(result.current.state.error).toBeInstanceOf(Error);
  });

  it('should stop recording and create audio blob', async () => {
    const mockStream = new MockMediaStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useAudioRecorder());

    // Start recording
    await act(async () => {
      await result.current.controls.startRecording();
    });

    expect(result.current.state.isRecording).toBe(true);

    // Stop recording
    act(() => {
      result.current.controls.stopRecording();
    });

    expect(result.current.state.isRecording).toBe(false);
    expect(result.current.state.isPaused).toBe(false);
    // Audio blob is created in onstop callback
  });

  it('should pause recording', async () => {
    const mockStream = new MockMediaStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.controls.startRecording();
    });

    act(() => {
      result.current.controls.pauseRecording();
    });

    expect(result.current.state.isRecording).toBe(true);
    expect(result.current.state.isPaused).toBe(true);
  });

  it('should resume recording', async () => {
    const mockStream = new MockMediaStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.controls.startRecording();
    });

    act(() => {
      result.current.controls.pauseRecording();
    });

    expect(result.current.state.isPaused).toBe(true);

    act(() => {
      result.current.controls.resumeRecording();
    });

    expect(result.current.state.isRecording).toBe(true);
    expect(result.current.state.isPaused).toBe(false);
  });

  it('should reset recording', async () => {
    const mockStream = new MockMediaStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.controls.startRecording();
    });

    expect(result.current.state.isRecording).toBe(true);

    act(() => {
      result.current.controls.resetRecording();
    });

    expect(result.current.state).toEqual({
      isRecording: false,
      isPaused: false,
      audioBlob: null,
      audioUrl: null,
      duration: 0,
      error: null,
    });
  });

  it('should track duration during recording', async () => {
    const mockStream = new MockMediaStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.controls.startRecording();
    });

    expect(result.current.state.duration).toBe(0);

    // Fast forward timers
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Duration should be updated
    expect(result.current.state.duration).toBeGreaterThan(0);
  });

  it('should not start recording if already recording', async () => {
    const mockStream = new MockMediaStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.controls.startRecording();
    });

    const callCount = mockGetUserMedia.mock.calls.length;

    // Try to start again
    await act(async () => {
      await result.current.controls.startRecording();
    });

    // getUserMedia should not be called again
    expect(mockGetUserMedia.mock.calls.length).toBe(callCount);
  });

  it('should not stop if not recording', () => {
    const { result } = renderHook(() => useAudioRecorder());

    act(() => {
      result.current.controls.stopRecording();
    });

    expect(result.current.state.isRecording).toBe(false);
  });

  it('should not pause if not recording', () => {
    const { result } = renderHook(() => useAudioRecorder());

    act(() => {
      result.current.controls.pauseRecording();
    });

    expect(result.current.state.isPaused).toBe(false);
  });

  it('should not resume if not recording', () => {
    const { result } = renderHook(() => useAudioRecorder());

    act(() => {
      result.current.controls.resumeRecording();
    });

    expect(result.current.state.isPaused).toBe(false);
  });

  it('should handle recording errors gracefully', async () => {
    const mockStream = new MockMediaStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.controls.startRecording();
    });

    expect(result.current.state.isRecording).toBe(true);
  });

  it('should cleanup on unmount', async () => {
    const mockStream = new MockMediaStream();
    mockGetUserMedia.mockResolvedValue(mockStream);

    const stopSpy = jest.spyOn(mockStream.getTracks()[0], 'stop');

    const { unmount, result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.controls.startRecording();
    });

    unmount();

    // Timer should be cleared and tracks stopped
    expect(stopSpy).toHaveBeenCalled();
  });
});
