import type { DocumentType, WritingStyle } from '@/types/document'

export const documentTypeLabels: Record<DocumentType, string> = {
  email: 'メール',
  report: '報告書',
  proposal: '提案書',
  minutes: '議事録',
  announcement: 'お知らせ',
  apology: 'お詫び文',
  thanks: 'お礼状',
  sns: 'SNS投稿',
  presentation: 'プレゼン資料',
  general: '一般文書',
}

// Per-type tone guidance injected into the proofread prompt
const documentTypeToneGuide: Partial<Record<DocumentType, string>> = {
  email: 'ビジネスメールとして丁寧かつ簡潔な表現にしてください。',
  report: '事実を正確に、箇条書き・見出しを活用した読みやすい構成にしてください。',
  proposal: '説得力のある論理展開と、メリットが伝わる表現にしてください。',
  minutes: '決定事項・アクションアイテムが明確になるよう、簡潔・正確に記述してください。',
  announcement: '要点が一目でわかる、明快で丁寧なお知らせ文にしてください。',
  apology: '誠意が伝わる謝罪表現を使い、言い訳がましくならないようにしてください。',
  thanks: '感謝の気持ちが温かく伝わる、具体的な表現にしてください。',
  sns: '読みやすく、共感・拡散されやすい自然な口調にしてください。文字数も意識してください。',
  presentation: '聴衆に伝わるよう、簡潔なキーワードと論理的な構成にしてください。',
  general: '読みやすく正確な日本語にしてください。',
}

export function buildProofreadPrompt(
  content: string,
  documentType: DocumentType,
  userStyle?: WritingStyle | null,
): string {
  const typeLabel = documentTypeLabels[documentType]
  const styleSection = userStyle
    ? `\n## ユーザーの文体特徴\n` +
      `- 丁寧さレベル: ${userStyle.formalityLevel}/10\n` +
      `- 平均文長: ${userStyle.averageSentenceLength}文字\n` +
      (userStyle.vocabulary.length > 0
        ? `- 特徴的な語彙: ${userStyle.vocabulary.slice(0, 10).join('、')}\n`
        : '') +
      (userStyle.commonPhrases.length > 0
        ? `- 頻出フレーズ: ${userStyle.commonPhrases.slice(0, 5).join('、')}\n`
        : '') +
      `これらの文体特徴を参考にして校正してください。\n`
    : ''

  return `あなたは日本語の文章校正の専門家です。以下の${typeLabel}を校正してください。

## 校正対象テキスト
${content}
${styleSection}
## 指示
1. 誤字脱字を修正
2. 文法的な誤りを修正
3. 文体を改善（${documentTypeToneGuide[documentType] ?? typeLabel + 'として適切な表現に'}）
4. 必要に応じて構成を提案

## 回答形式
以下のJSON形式のみで回答してください。日本語で説明を記述してください。

{
  "corrected": "校正後のテキスト全文",
  "suggestions": [
    {
      "id": "s1",
      "type": "spelling（誤字脱字）| grammar（文法）| style（文体）| structure（構成）のいずれか",
      "original": "元のフレーズ",
      "suggested": "修正後のフレーズ",
      "explanation": "修正理由の説明",
      "confidence": 0.0から1.0の信頼度
    }
  ],
  "writingStyleMatch": 0から100のユーザー文体一致度（文体情報がない場合は50）
}

提案は重要な修正を中心に最大15件まで挙げてください。`
}

export function buildWritingStylePrompt(text: string): string {
  return `以下のテキストから筆者の文体特徴を分析してください。

## 分析対象テキスト
${text}

## 回答形式
以下のJSON形式のみで回答してください：

{
  "vocabulary": ["特徴的な語彙や表現（最大20個）"],
  "sentencePatterns": ["特徴的な文型パターン（最大10個）"],
  "formalityLevel": 1から10の整数（1=非常にカジュアル、10=非常にフォーマル）,
  "averageSentenceLength": 平均文字数（整数）,
  "commonPhrases": ["頻出フレーズや接続詞（最大10個）"]
}`
}
