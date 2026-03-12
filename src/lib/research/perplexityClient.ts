import OpenAI from 'openai'
import type { ResearchSource, ResearchSummary } from '@/types/research'

export interface PerplexitySearchResult {
  summary: ResearchSummary
  sources: ResearchSource[]
  rawContent: string
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
  citations?: string[]
}

interface StructuredResult {
  overview?: string
  keyPoints?: unknown[]
  details?: string
  relatedTopics?: unknown[]
  sources?: Array<{
    title?: string
    url?: string
    excerpt?: string
    publishedDate?: string | null
    credibilityScore?: number
  }>
}

// Step 1: Fetch raw Japanese text from Perplexity (no JSON requirement)
async function fetchFromPerplexity(
  query: string,
): Promise<{ content: string; citations: string[] }> {
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) throw new Error('PERPLEXITY_API_KEY is not set')

  const now = new Date()
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
  const fromDate = sixMonthsAgo.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const toDate = now.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const prompt = `以下のテーマについて、${fromDate}から${toDate}までの最新情報のみを使用して、日本語で詳しくリサーチしてください。この期間外の情報は使用しないでください。

テーマ: ${query}

以下の内容を含めて日本語で回答してください：
- 全体的な概要
- 重要なポイント（箇条書き）
- 詳細情報
- 関連するトピック`

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [{ role: 'user', content: prompt }],
      search_recency_filter: 'year',
      return_citations: true,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Perplexity API error: ${response.status} ${errorText}`)
  }

  const data: PerplexityResponse = await response.json()
  const content = data.choices[0]?.message?.content ?? ''
  const citations: string[] = data.citations ?? []

  return { content, citations }
}

// Step 2: Use OpenAI to structure Perplexity's text into 4-section JSON (Japanese)
async function structureWithOpenAI(
  content: string,
  citations: string[],
): Promise<{ summary: ResearchSummary; sources: ResearchSource[] }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')

  const client = new OpenAI({ apiKey })

  const citationList = citations.length > 0 ? `\n\n出典URL一覧:\n${citations.join('\n')}` : ''

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'あなたはリサーチ結果を構造化するアシスタントです。与えられたテキストを指定のJSON形式に変換してください。すべての値は日本語で出力してください。',
      },
      {
        role: 'user',
        content: `以下のリサーチ結果を日本語でJSON形式に変換してください。

リサーチ結果:
${content}${citationList}

以下のJSON形式のみで回答してください（他のテキストは不要）:
{
  "overview": "2〜3文の全体概要（日本語）",
  "keyPoints": ["主要ポイント1（日本語）", "主要ポイント2（日本語）"],
  "details": "詳細情報（日本語、複数段落可）",
  "relatedTopics": ["関連トピック1（日本語）", "関連トピック2（日本語）"],
  "sources": [
    {
      "title": "出典タイトル（日本語または原文）",
      "url": "https://...",
      "excerpt": "関連する抜粋（日本語）",
      "publishedDate": "YYYY-MM-DD または null",
      "credibilityScore": 出典の信頼度スコア（0〜100の整数）。ドメイン権威・情報源の種類（政府/学術/大手メディア/公式サイト=高、個人ブログ/不明=低）・URLの明確さを基に評価
    }
  ]
}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 2048,
  })

  const raw = response.choices[0]?.message?.content ?? '{}'

  let parsed: StructuredResult = {}
  try {
    parsed = JSON.parse(raw) as StructuredResult
  } catch {
    // fallback handled below
  }

  const parsedSources: ResearchSource[] = Array.isArray(parsed.sources)
    ? parsed.sources
        .filter((s) => s && typeof s === 'object')
        .map((s) => ({
          title: typeof s.title === 'string' ? s.title : s.url ?? '',
          url: typeof s.url === 'string' ? s.url : '',
          excerpt: typeof s.excerpt === 'string' ? s.excerpt : '',
          publishedDate:
            typeof s.publishedDate === 'string' && s.publishedDate !== 'null'
              ? s.publishedDate
              : undefined,
          credibilityScore:
            typeof s.credibilityScore === 'number'
              ? Math.min(100, Math.max(0, Math.round(s.credibilityScore)))
              : undefined,
        }))
    : []

  const sources: ResearchSource[] =
    parsedSources.length > 0
      ? parsedSources
      : citations.map((url) => ({ title: url, url, excerpt: '' }))

  return {
    summary: {
      overview: typeof parsed.overview === 'string' ? parsed.overview : content.slice(0, 300),
      keyPoints: Array.isArray(parsed.keyPoints)
        ? (parsed.keyPoints.filter((p) => typeof p === 'string') as string[])
        : [],
      details: typeof parsed.details === 'string' ? parsed.details : content,
      relatedTopics: Array.isArray(parsed.relatedTopics)
        ? (parsed.relatedTopics.filter((t) => typeof t === 'string') as string[])
        : [],
    },
    sources,
  }
}

export async function searchWithPerplexity(query: string): Promise<PerplexitySearchResult> {
  // Step 1: Perplexity fetches latest info as Japanese free text
  const { content, citations } = await fetchFromPerplexity(query)

  // Step 2: OpenAI structures the result into 4-section JSON in Japanese
  const { summary, sources } = await structureWithOpenAI(content, citations)

  return { summary, sources, rawContent: content }
}
