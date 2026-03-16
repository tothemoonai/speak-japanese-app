import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeedbackDisplay } from '@/components/practice/FeedbackDisplay';
import type { EvaluationResult } from '@/services/processing/eval.service';

const mockResult: EvaluationResult = {
  overall_score: 85,
  accuracy_score: 90,
  fluency_score: 80,
  pronunciation_score: 85,
  intonation_score: 82,
  feedback: '整体表现良好，继续努力！',
  strengths: ['发音清晰', '语调自然'],
  improvements: ['部分音节发音需要练习', '语速可以更稳定'],
  suggestions: ['多听母语者发音', '练习慢速朗读'],
};

describe('FeedbackDisplay Component', () => {
  it('should render overall score', () => {
    render(<FeedbackDisplay result={mockResult} />);

    expect(screen.getByText('综合评分')).toBeInTheDocument();
    const scores = screen.getAllByText('85');
    expect(scores.length).toBeGreaterThan(0);
    expect(screen.getByText('良好')).toBeInTheDocument();
  });

  it('should render feedback text', () => {
    render(<FeedbackDisplay result={mockResult} />);

    expect(screen.getByText('整体表现良好，继续努力！')).toBeInTheDocument();
  });

  it('should show excellent badge for scores >= 90', () => {
    const excellentResult = { ...mockResult, overall_score: 95 };
    render(<FeedbackDisplay result={excellentResult} />);

    expect(screen.getByText('优秀')).toBeInTheDocument();
  });

  it('should show good badge for scores >= 80 and < 90', () => {
    render(<FeedbackDisplay result={mockResult} />);

    expect(screen.getByText('良好')).toBeInTheDocument();
  });

  it('should show pass badge for scores >= 60 and < 80', () => {
    const passResult = { ...mockResult, overall_score: 70 };
    render(<FeedbackDisplay result={passResult} />);

    expect(screen.getByText('合格')).toBeInTheDocument();
  });

  it('should show needs improvement badge for scores < 60', () => {
    const failResult = { ...mockResult, overall_score: 50 };
    render(<FeedbackDisplay result={failResult} />);

    expect(screen.getByText('需改进')).toBeInTheDocument();
  });

  it('should render detailed scores when showDetails is true', () => {
    render(<FeedbackDisplay result={mockResult} showDetails={true} />);

    expect(screen.getByText('详细评分')).toBeInTheDocument();
    expect(screen.getByText('准确性')).toBeInTheDocument();
    expect(screen.getByText('流利度')).toBeInTheDocument();
    expect(screen.getByText('发音')).toBeInTheDocument();
    expect(screen.getByText('语调')).toBeInTheDocument();
  });

  it('should not render detailed scores when showDetails is false', () => {
    render(<FeedbackDisplay result={mockResult} showDetails={false} />);

    expect(screen.queryByText('详细评分')).not.toBeInTheDocument();
    expect(screen.queryByText('准确性')).not.toBeInTheDocument();
  });

  it('should render strengths', () => {
    render(<FeedbackDisplay result={mockResult} showDetails={true} />);

    expect(screen.getByText('优点')).toBeInTheDocument();
    expect(screen.getByText('发音清晰')).toBeInTheDocument();
    expect(screen.getByText('语调自然')).toBeInTheDocument();
  });

  it('should not render strengths section when empty', () => {
    const noStrengthsResult = { ...mockResult, strengths: [] };
    render(<FeedbackDisplay result={noStrengthsResult} showDetails={true} />);

    expect(screen.queryByText('优点')).not.toBeInTheDocument();
  });

  it('should render improvements', () => {
    render(<FeedbackDisplay result={mockResult} showDetails={true} />);

    expect(screen.getByText('需改进之处')).toBeInTheDocument();
    expect(screen.getByText('部分音节发音需要练习')).toBeInTheDocument();
    expect(screen.getByText('语速可以更稳定')).toBeInTheDocument();
  });

  it('should not render improvements section when empty', () => {
    const noImprovementsResult = { ...mockResult, improvements: [] };
    render(<FeedbackDisplay result={noImprovementsResult} showDetails={true} />);

    expect(screen.queryByText('需改进之处')).not.toBeInTheDocument();
  });

  it('should render suggestions', () => {
    render(<FeedbackDisplay result={mockResult} showDetails={true} />);

    expect(screen.getByText('学习建议')).toBeInTheDocument();
    expect(screen.getByText('多听母语者发音')).toBeInTheDocument();
    expect(screen.getByText('练习慢速朗读')).toBeInTheDocument();
  });

  it('should not render suggestions section when empty', () => {
    const noSuggestionsResult = { ...mockResult, suggestions: [] };
    render(<FeedbackDisplay result={noSuggestionsResult} showDetails={true} />);

    expect(screen.queryByText('学习建议')).not.toBeInTheDocument();
  });

  it('should render all detailed score values', () => {
    render(<FeedbackDisplay result={mockResult} showDetails={true} />);

    expect(screen.getByText('90')).toBeInTheDocument(); // accuracy
    expect(screen.getByText('80')).toBeInTheDocument(); // fluency
    // 85 appears twice (overall and pronunciation), so check it appears at least once
    const scores85 = screen.getAllByText('85');
    expect(scores85.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('82')).toBeInTheDocument(); // intonation
  });

  it('should apply correct color class for high scores', () => {
    render(<FeedbackDisplay result={mockResult} />);

    const scoreElements = screen.getAllByText('85');
    // Get the overall score element (first one)
    const scoreElement = scoreElements[0].closest('div');
    expect(scoreElement?.className).toContain('text-green-600');
  });

  it('should apply correct color class for medium scores', () => {
    const mediumResult = { ...mockResult, overall_score: 70 };
    render(<FeedbackDisplay result={mediumResult} />);

    const scoreElement = screen.getByText('70').closest('div');
    expect(scoreElement?.className).toContain('text-yellow-600');
  });

  it('should apply correct color class for low scores', () => {
    const lowResult = { ...mockResult, overall_score: 50 };
    render(<FeedbackDisplay result={lowResult} />);

    const scoreElement = screen.getByText('50').closest('div');
    expect(scoreElement?.className).toContain('text-red-600');
  });

  it('should render descriptions for detailed scores', () => {
    render(<FeedbackDisplay result={mockResult} showDetails={true} />);

    expect(screen.getByText('发音和语法的准确性')).toBeInTheDocument();
    expect(screen.getByText('说话的流畅性和自然度')).toBeInTheDocument();
    expect(screen.getByText('单个音的发音准确度')).toBeInTheDocument();
    expect(screen.getByText('重音和抑扬顿挫')).toBeInTheDocument();
  });

  it('should handle result without optional fields', () => {
    const minimalResult: EvaluationResult = {
      overall_score: 75,
      accuracy_score: 80,
      fluency_score: 70,
      pronunciation_score: 76,
      intonation_score: 72,
      feedback: '测试反馈',
    };

    render(<FeedbackDisplay result={minimalResult} showDetails={true} />);

    // 75 appears in both overall and pronunciation
    const scores75 = screen.getAllByText('75');
    expect(scores75.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('合格')).toBeInTheDocument();
    expect(screen.queryByText('优点')).not.toBeInTheDocument();
    expect(screen.queryByText('需改进之处')).not.toBeInTheDocument();
    expect(screen.queryByText('学习建议')).not.toBeInTheDocument();
  });

  it('should render multiple items in each list', () => {
    render(<FeedbackDisplay result={mockResult} showDetails={true} />);

    const listItems = screen.getAllByText('✓');
    expect(listItems).toHaveLength(2);

    const improvementItems = screen.getAllByText('!');
    expect(improvementItems).toHaveLength(2);

    const suggestionItems = screen.getAllByText('💡');
    expect(suggestionItems).toHaveLength(2);
  });
});
