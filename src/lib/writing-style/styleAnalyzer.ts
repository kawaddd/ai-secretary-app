import type { WritingStyle } from '@/types/document'

export function compareStyles(style1: WritingStyle, style2: WritingStyle): number {
  let score = 0

  // Formality level similarity (0-30 points)
  const formalityDiff = Math.abs(style1.formalityLevel - style2.formalityLevel)
  score += Math.max(0, 30 - formalityDiff * 3)

  // Avg sentence length similarity (0-30 points)
  const maxLen = Math.max(style1.averageSentenceLength, style2.averageSentenceLength)
  const minLen = Math.min(style1.averageSentenceLength, style2.averageSentenceLength)
  const lenRatio = maxLen > 0 ? minLen / maxLen : 1
  score += lenRatio * 30

  // Vocabulary overlap (0-20 points)
  const vocabSet1 = new Set(style1.vocabulary)
  const vocabOverlap = style2.vocabulary.filter((v) => vocabSet1.has(v)).length
  score += Math.min(20, (vocabOverlap / Math.max(style2.vocabulary.length, 1)) * 40)

  // Common phrases overlap (0-20 points)
  const phraseSet1 = new Set(style1.commonPhrases)
  const phraseOverlap = style2.commonPhrases.filter((p) => phraseSet1.has(p)).length
  score += Math.min(20, (phraseOverlap / Math.max(style2.commonPhrases.length, 1)) * 40)

  return Math.round(score)
}

export function mergeStyles(existing: WritingStyle, incoming: WritingStyle): WritingStyle {
  const w1 = 0.7
  const w2 = 0.3

  const mergedVocab = Array.from(new Set([...existing.vocabulary, ...incoming.vocabulary])).slice(
    0,
    50,
  )
  const mergedPatterns = Array.from(
    new Set([...existing.sentencePatterns, ...incoming.sentencePatterns]),
  ).slice(0, 20)
  const mergedPhrases = Array.from(
    new Set([...existing.commonPhrases, ...incoming.commonPhrases]),
  ).slice(0, 20)

  return {
    vocabulary: mergedVocab,
    sentencePatterns: mergedPatterns,
    formalityLevel: Math.round(existing.formalityLevel * w1 + incoming.formalityLevel * w2),
    averageSentenceLength: Math.round(
      existing.averageSentenceLength * w1 + incoming.averageSentenceLength * w2,
    ),
    commonPhrases: mergedPhrases,
  }
}
