import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AudioRecorder } from '@/components/practice/AudioRecorder';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Blob } from 'buffer';

// Mock the useAudioRecorder hook
jest.mock('@/hooks/useAudioRecorder');

const mockUseAudioRecorder = useAudioRecorder as jest.MockedFunction<typeof useAudioRecorder>;

// Mock MediaStream for the tests
class MockMediaStream {
  public tracks: any[] = [];

  constructor() {
    this.tracks = [{ stop: jest.fn() }];
  }

  getTracks() {
    return this.tracks;
  }
}

describe('AudioRecorder Component', () => {
  const mockControls = {
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    pauseRecording: jest.fn(),
    resumeRecording: jest.fn(),
    resetRecording: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock state
    mockUseAudioRecorder.mockReturnValue({
      state: {
        isRecording: false,
        isPaused: false,
        audioBlob: null,
        audioUrl: null,
        duration: 0,
        error: null,
      },
      controls: mockControls,
    });
  });

  it('should render start recording button initially', () => {
    render(<AudioRecorder />);

    expect(screen.getByRole('button', { name: /开始录音/ })).toBeInTheDocument();
    expect(screen.getByText(/点击"开始录音"按钮，然后清晰地读出目标句子/)).toBeInTheDocument();
  });

  it('should disable start button when disabled prop is true', () => {
    render(<AudioRecorder disabled={true} />);

    const startButton = screen.getByRole('button', { name: /开始录音/ });
    expect(startButton).toBeDisabled();
  });

  it('should call startRecording when start button is clicked', async () => {
    render(<AudioRecorder />);

    const startButton = screen.getByRole('button', { name: /开始录音/ });
    fireEvent.click(startButton);

    expect(mockControls.startRecording).toHaveBeenCalledTimes(1);
  });

  it('should show duration and controls when recording', () => {
    mockUseAudioRecorder.mockReturnValue({
      state: {
        isRecording: true,
        isPaused: false,
        audioBlob: null,
        audioUrl: null,
        duration: 65,
        error: null,
      },
      controls: mockControls,
    });

    render(<AudioRecorder />);

    expect(screen.getByText('01:05')).toBeInTheDocument();
    expect(screen.getByText('录音中...')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('should show resume button when paused', () => {
    mockUseAudioRecorder.mockReturnValue({
      state: {
        isRecording: true,
        isPaused: true,
        audioBlob: null,
        audioUrl: null,
        duration: 30,
        error: null,
      },
      controls: mockControls,
    });

    render(<AudioRecorder />);

    expect(screen.getByText('00:30')).toBeInTheDocument();

    const stopButton = screen.getAllByRole('button')[0];
    const resumeButton = screen.getAllByRole('button')[1];

    expect(stopButton).toBeInTheDocument();
    expect(resumeButton).toBeInTheDocument();
  });

  it('should call stopRecording when stop button is clicked', () => {
    mockUseAudioRecorder.mockReturnValue({
      state: {
        isRecording: true,
        isPaused: false,
        audioBlob: null,
        audioUrl: null,
        duration: 10,
        error: null,
      },
      controls: mockControls,
    });

    render(<AudioRecorder />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);

    expect(mockControls.stopRecording).toHaveBeenCalledTimes(1);
  });

  it('should call pauseRecording when pause button is clicked', () => {
    mockUseAudioRecorder.mockReturnValue({
      state: {
        isRecording: true,
        isPaused: false,
        audioBlob: null,
        audioUrl: null,
        duration: 10,
        error: null,
      },
      controls: mockControls,
    });

    render(<AudioRecorder />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);

    expect(mockControls.pauseRecording).toHaveBeenCalledTimes(1);
  });

  it('should call resumeRecording when resume button is clicked', () => {
    mockUseAudioRecorder.mockReturnValue({
      state: {
        isRecording: true,
        isPaused: true,
        audioBlob: null,
        audioUrl: null,
        duration: 10,
        error: null,
      },
      controls: mockControls,
    });

    render(<AudioRecorder />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);

    expect(mockControls.resumeRecording).toHaveBeenCalledTimes(1);
  });

  it('should show reset button after recording completes', async () => {
    const mockAudioBlob = new Blob(['audio data'], { type: 'audio/wav' });

    mockUseAudioRecorder.mockReturnValue({
      state: {
        isRecording: false,
        isPaused: false,
        audioBlob: mockAudioBlob,
        audioUrl: 'blob:http://localhost/audio',
        duration: 15,
        error: null,
      },
      controls: mockControls,
    });

    render(<AudioRecorder />);

    expect(screen.getByRole('button', { name: /重新录音/ })).toBeInTheDocument();
  });

  it('should call resetRecording when reset button is clicked', () => {
    const mockAudioBlob = new Blob(['audio data'], { type: 'audio/wav' });

    mockUseAudioRecorder.mockReturnValue({
      state: {
        isRecording: false,
        isPaused: false,
        audioBlob: mockAudioBlob,
        audioUrl: 'blob:http://localhost/audio',
        duration: 15,
        error: null,
      },
      controls: mockControls,
    });

    render(<AudioRecorder />);

    const resetButton = screen.getByRole('button', { name: /重新录音/ });
    fireEvent.click(resetButton);

    expect(mockControls.resetRecording).toHaveBeenCalledTimes(1);
  });

  it('should call onRecordingComplete when recording finishes', async () => {
    const onRecordingComplete = jest.fn();
    const mockAudioBlob = new Blob(['audio data'], { type: 'audio/wav' });

    mockUseAudioRecorder.mockReturnValue({
      state: {
        isRecording: false,
        isPaused: false,
        audioBlob: mockAudioBlob,
        audioUrl: 'blob:http://localhost/audio',
        duration: 15,
        error: null,
      },
      controls: mockControls,
    });

    render(<AudioRecorder onRecordingComplete={onRecordingComplete} />);

    await waitFor(() => {
      expect(onRecordingComplete).toHaveBeenCalledWith(mockAudioBlob, 'blob:http://localhost/audio');
    });
  });

  it('should display permission denied error', () => {
    const error = new Error('Permission denied');
    (error as any).name = 'NotAllowedError';

    mockUseAudioRecorder.mockReturnValue({
      state: {
        isRecording: false,
        isPaused: false,
        audioBlob: null,
        audioUrl: null,
        duration: 0,
        error,
      },
      controls: mockControls,
    });

    render(<AudioRecorder />);

    expect(screen.getByText('请允许访问麦克风')).toBeInTheDocument();
  });

  it('should display device not found error', () => {
    const error = new Error('Device not found');
    (error as any).name = 'NotFoundError';

    mockUseAudioRecorder.mockReturnValue({
      state: {
        isRecording: false,
        isPaused: false,
        audioBlob: null,
        audioUrl: null,
        duration: 0,
        error,
      },
      controls: mockControls,
    });

    render(<AudioRecorder />);

    expect(screen.getByText('未找到麦克风设备')).toBeInTheDocument();
  });

  it('should display generic error message', () => {
    const error = new Error('Some other error');

    mockUseAudioRecorder.mockReturnValue({
      state: {
        isRecording: false,
        isPaused: false,
        audioBlob: null,
        audioUrl: null,
        duration: 0,
        error,
      },
      controls: mockControls,
    });

    render(<AudioRecorder />);

    expect(screen.getByText('录音出错，请重试')).toBeInTheDocument();
  });

  it('should call onError when error occurs', async () => {
    const onError = jest.fn();
    const error = new Error('Permission denied');

    mockUseAudioRecorder.mockReturnValue({
      state: {
        isRecording: false,
        isPaused: false,
        audioBlob: null,
        audioUrl: null,
        duration: 0,
        error,
      },
      controls: mockControls,
    });

    render(<AudioRecorder onError={onError} />);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  it('should format duration correctly', () => {
    mockUseAudioRecorder.mockReturnValue({
      state: {
        isRecording: true,
        isPaused: false,
        audioBlob: null,
        audioUrl: null,
        duration: 125,
        error: null,
      },
      controls: mockControls,
    });

    render(<AudioRecorder />);

    expect(screen.getByText('02:05')).toBeInTheDocument();
  });

  it('should not call onRecordingComplete multiple times for same recording', async () => {
    const onRecordingComplete = jest.fn();
    const mockAudioBlob = new Blob(['audio data'], { type: 'audio/wav' });

    mockUseAudioRecorder.mockReturnValue({
      state: {
        isRecording: false,
        isPaused: false,
        audioBlob: mockAudioBlob,
        audioUrl: 'blob:http://localhost/audio',
        duration: 15,
        error: null,
      },
      controls: mockControls,
    });

    const { rerender } = render(<AudioRecorder onRecordingComplete={onRecordingComplete} />);

    await waitFor(() => {
      expect(onRecordingComplete).toHaveBeenCalledTimes(1);
    });

    // Re-render with same state
    rerender(<AudioRecorder onRecordingComplete={onRecordingComplete} />);

    // Should still only be called once
    expect(onRecordingComplete).toHaveBeenCalledTimes(1);
  });
});
