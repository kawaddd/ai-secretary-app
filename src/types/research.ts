export interface ResearchSource {
  title: string
  url: string
  excerpt: string
  publishedDate?: string
  credibilityScore?: number // 0–100
}

export interface ResearchSummary {
  overview: string
  keyPoints: string[]
  details: string
  relatedTopics: string[]
}

export interface ResearchResult {
  id: string
  query: string
  optimizedQuery: string
  summary: ResearchSummary
  sources: ResearchSource[]
  createdAt: string
}

export interface ResearchHistoryItem {
  id: string
  query: string
  overview: string
  createdAt: string
}

export type ResearchStep = 'optimizing' | 'searching' | 'summarizing' | 'completed' | 'error'
