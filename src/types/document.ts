export type DocumentType =
  | 'email'
  | 'report'
  | 'proposal'
  | 'minutes'
  | 'announcement'
  | 'apology'
  | 'thanks'
  | 'sns'
  | 'presentation'
  | 'general'

export type SuggestionType = 'spelling' | 'grammar' | 'style' | 'structure'

export interface Suggestion {
  id: string
  type: SuggestionType
  original: string
  suggested: string
  explanation: string
  position: { start: number; end: number }
  confidence: number
}

export interface ProofreadRequest {
  content: string
  documentType: DocumentType
  applyUserStyle: boolean
}

export interface ProofreadResult {
  documentId: string
  original: string
  corrected: string
  suggestions: Suggestion[]
  writingStyleMatch: number
  createdAt: string
}

export interface WritingStyle {
  vocabulary: string[]
  sentencePatterns: string[]
  formalityLevel: number
  averageSentenceLength: number
  commonPhrases: string[]
}

export interface ProofreadHistoryItem {
  id: string
  title: string
  original_content: string | null
  processed_content: string | null
  metadata: {
    documentType: DocumentType
    suggestions: Suggestion[]
    writingStyleMatch: number
  } | null
  created_at: string | null
}
