'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { EvaluationResult } from '@/services/processing/eval.service';
import { TrendingUp, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';

interface FeedbackDisplayProps {
  result: EvaluationResult;
  showDetails?: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

const getScoreVariant = (score: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (score >= 80) return 'default';
  if (score >= 60) return 'secondary';
  return 'destructive';
};

export function FeedbackDisplay({ result, showDetails = true }: FeedbackDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">综合评分</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.overall_score)}`}>
              {result.overall_score}
            </div>
            <Badge variant={getScoreVariant(result.overall_score)} className="mb-4">
              {result.overall_score >= 90 && '优秀'}
              {result.overall_score >= 80 && result.overall_score < 90 && '良好'}
              {result.overall_score >= 60 && result.overall_score < 80 && '合格'}
              {result.overall_score < 60 && '需改进'}
            </Badge>
            <p className="text-center text-muted-foreground">{result.feedback}</p>
          </div>
        </CardContent>
      </Card>

      {showDetails && (
        <>
          {/* Detailed Scores */}
          <Card>
            <CardHeader>
              <CardTitle>详细评分</CardTitle>
              <CardDescription>各项技能的得分详情</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScoreItem
                label="准确性"
                score={result.accuracy_score}
                description="发音和语法的准确性"
              />
              <ScoreItem
                label="流利度"
                score={result.fluency_score}
                description="说话的流畅性和自然度"
              />
              <ScoreItem
                label="发音"
                score={result.pronunciation_score}
                description="单个音的发音准确度"
              />
              <ScoreItem
                label="语调"
                score={result.intonation_score}
                description="重音和抑扬顿挫"
              />
            </CardContent>
          </Card>

          {/* Strengths */}
          {result.strengths && result.strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  优点
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Improvements */}
          {result.improvements && result.improvements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  需改进之处
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">!</span>
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          {result.suggestions && result.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  学习建议
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">💡</span>
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

interface ScoreItemProps {
  label: string;
  score: number;
  description: string;
}

function ScoreItem({ label, score, description }: ScoreItemProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="font-medium">{label}</span>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <span className={`text-lg font-bold ${getScoreColor(score)}`}>{score}</span>
      </div>
      <Progress value={score} className="h-2" />
    </div>
  );
}
