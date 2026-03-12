import OpenAI from 'openai'
import type { DocumentType, WritingStyle, Suggestion } from '@/types/document'
import { buildProofreadPrompt, buildWritingStylePrompt } from './prompts'

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')
  return new OpenAI({ apiKey })
}

const VALID_SUGGESTION_TYPES = ['spelling', 'grammar', 'style', 'structure'] as const

export async function proofreadText(
  content: string,
  documentType: DocumentType,
  userStyle?: WritingStyle | null,
): Promise<{
  corrected: string
  suggestions: Omit<Suggestion, 'position'>[]
  writingStyleMatch: number
}> {
  const client = getClient()
  const prompt = buildProofreadPrompt(content, documentType, userStyle)

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const raw = response.choices[0]?.message?.content ?? '{}'
  const parsed = JSON.parse(raw)

  const suggestions: Omit<Suggestion, 'position'>[] = (
    Array.isArray(parsed.suggestions) ? parsed.suggestions : []
  ).map((s: Record<string, unknown>, i: number) => ({
    id: typeof s.id === 'string' ? s.id : `s${i + 1}`,
    type: VALID_SUGGESTION_TYPES.includes(s.type as never) ? s.type : 'grammar',
    original: typeof s.original === 'string' ? s.original : '',
    suggested: typeof s.suggested === 'string' ? s.suggested : '',
    explanation: typeof s.explanation === 'string' ? s.explanation : '',
    confidence: typeof s.confidence === 'number' ? s.confidence : 0.8,
  }))

  return {
    corrected: typeof parsed.corrected === 'string' ? parsed.corrected : content,
    suggestions,
    writingStyleMatch:
      typeof parsed.writingStyleMatch === 'number' ? parsed.writingStyleMatch : 50,
  }
}

export async function analyzeWritingStyle(text: string): Promise<WritingStyle> {
  const client = getClient()
  const prompt = buildWritingStylePrompt(text)

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  })

  const raw = response.choices[0]?.message?.content ?? '{}'
  const parsed = JSON.parse(raw)

  return {
    vocabulary: Array.isArray(parsed.vocabulary) ? parsed.vocabulary : [],
    sentencePatterns: Array.isArray(parsed.sentencePatterns) ? parsed.sentencePatterns : [],
    formalityLevel:
      typeof parsed.formalityLevel === 'number'
        ? Math.min(10, Math.max(1, Math.round(parsed.formalityLevel)))
        : 5,
    averageSentenceLength:
      typeof parsed.averageSentenceLength === 'number'
        ? Math.round(parsed.averageSentenceLength)
        : 30,
    commonPhrases: Array.isArray(parsed.commonPhrases) ? parsed.commonPhrases : [],
  }
}
