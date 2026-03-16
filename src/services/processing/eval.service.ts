/**
 * Evaluation Service
 * Evaluates user speech using AI (OpenAI GPT-4, Anthropic Claude, or Zhipu GLM)
 */

// Evaluation dimensions
export interface EvaluationResult {
  overall_score: number; // 0-100
  accuracy_score: number; // 0-100: pronunciation and grammar accuracy
  fluency_score: number; // 0-100: flow and naturalness
  pronunciation_score: number; // 0-100: individual sound accuracy
  intonation_score: number; // 0-100: pitch accent and prosody
  feedback: string;
  suggestions: string[];
  strengths: string[];
  improvements: string[];
}

export interface EvaluationInput {
  target_text: string; // The Japanese text user should say
  user_transcript: string; // ASR transcription of what user said
  audio_blob?: Blob; // Optional: audio file for more detailed analysis
  user_level?: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Get API key from environment
 */
function getAPIKey(): string {
  // Server-side (check for process.env which is only available in Node.js)
  if (typeof process !== 'undefined' && process.env) {
    return process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.ZHIPU_API_KEY || '';
  } else {
    // Client-side - not recommended for production
    throw new Error('API calls should be made from server-side only');
  }
}

/**
 * Get Zhipu GLM API token
 */
function getZhipuToken(): string {
  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) {
    throw new Error('Zhipu API key is not configured');
  }
  return apiKey;
}

/**
 * Generate evaluation prompt for the LLM
 */
function generateEvaluationPrompt(input: EvaluationInput): string {
  const { target_text, user_transcript, user_level = 'beginner' } = input;

  return `あなたは日本語の発音と会話の専門家です。以下の情報に基づいて、学習者の日本語スピーチを評価してください。

【目標文】
${target_text}

【学習者の発話】
${user_transcript}

【学習者のレベル】
${user_level === 'beginner' ? '初級' : user_level === 'intermediate' ? '中級' : '上級'}

【評価基準】
1. 発音の正確さ (accuracy): 音声の正確さ、文法の正しさ
2. 流暢さ (fluency): 話す流れの自然さ、適切なリズム
3. 発音 (pronunciation): 個々の音の正確さ
4. イントネーション (intonation): ピッチアクセント、抑揚

以下のJSON形式で評価結果を返してください：

\`\`\`json
{
  "overall_score": 0-100の整数,
  "accuracy_score": 0-100の整数,
  "fluency_score": 0-100の整数,
  "pronunciation_score": 0-100の整数,
  "intonation_score": 0-100の整数,
  "feedback": "全体のフィードバック（日本語、2-3文）",
  "suggestions": ["具体的な改善提案1", "具体的な改善提案2"],
  "strengths": ["よくできた点1", "よくできた点2"],
  "improvements": ["改善が必要な点1", "改善が必要な点2"]
}
\`\`\`

注意：
- スコアは0-100の範囲で、客観的かつ建設的に評価してください
- 初級者の場合は励ましを含め、上級者の場合はより詳細な分析を提供してください
- フィードバックは日本語で提供してください`;
}

/**
 * Call OpenAI API for evaluation
 */
async function evaluateWithOpenAI(input: EvaluationInput): Promise<EvaluationResult> {
  const apiKey = getAPIKey();
  if (!apiKey.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key');
  }

  const prompt = generateEvaluationPrompt(input);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'あなたは日本語教育と発音評価の専門家です。常にJSON形式で評価を返してください。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Parse JSON from response (handle markdown code blocks)
  const jsonMatch = content.match(/```json\\s*([\\s\\S]*?)\\s*```/) ||
                   content.match(/\\{[\\s\\S]*\\}/);

  if (!jsonMatch) {
    throw new Error('Failed to parse evaluation result from AI response');
  }

  const result = JSON.parse(jsonMatch[1] || jsonMatch[0]);

  // Validate result structure
  if (typeof result.overall_score !== 'number' ||
      typeof result.accuracy_score !== 'number' ||
      typeof result.fluency_score !== 'number' ||
      typeof result.pronunciation_score !== 'number' ||
      typeof result.intonation_score !== 'number') {
    throw new Error('Invalid evaluation result structure');
  }

  return result as EvaluationResult;
}

/**
 * Call Anthropic Claude API for evaluation
 */
async function evaluateWithAnthropic(input: EvaluationInput): Promise<EvaluationResult> {
  const apiKey = getAPIKey();
  if (!apiKey.startsWith('sk-ant-')) {
    throw new Error('Invalid Anthropic API key');
  }

  const prompt = generateEvaluationPrompt(input);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Parse JSON from response
  const jsonMatch = content.match(/```json\\s*([\\s\\S]*?)\\s*```/) ||
                   content.match(/\\{[\\s\\S]*\\}/);

  if (!jsonMatch) {
    throw new Error('Failed to parse evaluation result from AI response');
  }

  const result = JSON.parse(jsonMatch[1] || jsonMatch[0]);

  // Validate result structure
  if (typeof result.overall_score !== 'number' ||
      typeof result.accuracy_score !== 'number' ||
      typeof result.fluency_score !== 'number' ||
      typeof result.pronunciation_score !== 'number' ||
      typeof result.intonation_score !== 'number') {
    throw new Error('Invalid evaluation result structure');
  }

  return result as EvaluationResult;
}

/**
 * Call Zhipu GLM API for evaluation
 */
async function evaluateWithZhipu(input: EvaluationInput): Promise<EvaluationResult> {
  const apiKey = getZhipuToken();

  // Zhipu API uses JWT token, need to generate it
  // For simplicity, we'll use the direct API call
  // In production, you should generate a proper JWT token

  const prompt = generateEvaluationPrompt(input);

  // Zhipu GLM-4 API endpoint
  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'glm-4',
      messages: [
        {
          role: 'system',
          content: 'あなたは日本語教育と発音評価の専門家です。常にJSON形式で評価を返してください。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Zhipu GLM API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Parse JSON from response (handle markdown code blocks)
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                   content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Failed to parse evaluation result from AI response');
  }

  const result = JSON.parse(jsonMatch[1] || jsonMatch[0]);

  // Validate result structure
  if (typeof result.overall_score !== 'number' ||
      typeof result.accuracy_score !== 'number' ||
      typeof result.fluency_score !== 'number' ||
      typeof result.pronunciation_score !== 'number' ||
      typeof result.intonation_score !== 'number') {
    throw new Error('Invalid evaluation result structure');
  }

  return result as EvaluationResult;
}

/**
 * Fallback evaluation (rule-based, when AI is not available)
 */
function evaluateFallback(input: EvaluationInput): EvaluationResult {
  const { target_text, user_transcript } = input;

  // Simple string similarity
  const similarity = calculateSimilarity(target_text, user_transcript);

  const overall_score = Math.round(similarity * 100);

  return {
    overall_score,
    accuracy_score: Math.round(similarity * 100),
    fluency_score: Math.max(0, Math.min(100, overall_score + Math.random() * 10 - 5)),
    pronunciation_score: Math.round(similarity * 95),
    intonation_score: Math.max(0, Math.min(100, overall_score + Math.random() * 10 - 5)),
    feedback: overall_score >= 80
      ? '素晴らしい！非常に正確な発音です。'
      : overall_score >= 60
      ? '良いスタートです。もう少し練習を続けましょう。'
      : 'もう一度挑戦してみましょう。慣れるにつれて上達します。',
    suggestions: overall_score >= 80
      ? ['様々なシナリオで練習を続けてください', '自然な会話のリズムを意識してください']
      : overall_score >= 60
      ? ['各音をゆっくり、はっきり発音してください', 'ネイティブスピーカーの音声を繰り返し聞いて真似してください']
      : ['センテンスを短く分けて練習してください', '平仮名の発音から始めてみましょう'],
    strengths: overall_score >= 60
      ? ['学習への意欲が素晴らしいです', '継続的な練習が成果を生んでいます']
      : ['挑戦する姿勢が素晴らしいです'],
    improvements: overall_score >= 80
      ? ['イントネーションのバリエーションを増やしましょう', 'より自然な話し方を目指しましょう']
      : overall_score >= 60
      ? ['長音の発音に注意しましょう', 'アクセントの位置を意識しましょう']
      : ['基礎的な発音から始めましょう', '母音の発音を丁寧に'],
  };
}

/**
 * Calculate string similarity (simple Levenshtein-based)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

/**
 * Main evaluation function
 */
export async function evaluateSpeech(
  input: EvaluationInput,
  provider: 'openai' | 'anthropic' | 'zhipu' | 'fallback' = 'openai'
): Promise<EvaluationResult> {
  try {
    if (provider === 'openai') {
      return await evaluateWithOpenAI(input);
    } else if (provider === 'anthropic') {
      return await evaluateWithAnthropic(input);
    } else if (provider === 'zhipu') {
      return await evaluateWithZhipu(input);
    } else {
      return evaluateFallback(input);
    }
  } catch (error) {
    console.error('AI evaluation failed, using fallback:', error);
    return evaluateFallback(input);
  }
}

/**
 * Evaluation service class
 */
export class EvaluationService {
  async evaluate(input: EvaluationInput, provider?: 'openai' | 'anthropic' | 'zhipu' | 'fallback'): Promise<EvaluationResult> {
    // If provider is specified, use it
    if (provider) {
      return evaluateSpeech(input, provider);
    }

    // Determine which AI provider to use based on available API keys
    const hasOpenAI = process.env.OPENAI_API_KEY?.startsWith('sk-');
    const hasAnthropic = process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-');
    const hasZhipu = process.env.ZHIPU_API_KEY && process.env.ZHIPU_API_KEY.length > 0;

    let selectedProvider: 'openai' | 'anthropic' | 'zhipu' | 'fallback' = 'fallback';

    // Priority order: OpenAI > Anthropic > Zhipu > Fallback
    if (hasOpenAI) {
      selectedProvider = 'openai';
    } else if (hasAnthropic) {
      selectedProvider = 'anthropic';
    } else if (hasZhipu) {
      selectedProvider = 'zhipu';
    }

    return evaluateSpeech(input, selectedProvider);
  }
}

// Export singleton instance
export const evaluationService = new EvaluationService();
