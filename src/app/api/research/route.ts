import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { optimizeQuery } from '@/lib/research/promptOptimizer'
import { searchWithPerplexity } from '@/lib/research/perplexityClient'
import type { Json } from '@/types/database'
import type { ResearchResult } from '@/types/research'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { query?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { query } = body
  if (!query?.trim()) {
    return NextResponse.json({ error: '検索クエリを入力してください' }, { status: 400 })
  }

  let optimizedQuery: string
  try {
    optimizedQuery = await optimizeQuery(query)
  } catch (err) {
    console.error('Failed to optimize query:', err)
    optimizedQuery = query
  }

  let summary, sources, rawContent
  try {
    ;({ summary, sources, rawContent } = await searchWithPerplexity(optimizedQuery))
  } catch (err) {
    console.error('Perplexity search failed:', err)
    return NextResponse.json({ error: 'リサーチ中にエラーが発生しました' }, { status: 502 })
  }

  const metadata = { optimizedQuery, summary, sources }

  const { data: doc, error: dbError } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      title: query,
      type: 'research',
      original_content: rawContent,
      processed_content: summary.overview,
      metadata: metadata as unknown as Json,
    })
    .select()
    .single()

  if (dbError) {
    console.error('Failed to save research document:', dbError)
    return NextResponse.json({ error: 'ドキュメントの保存に失敗しました' }, { status: 500 })
  }

  const result: ResearchResult = {
    id: doc.id,
    query,
    optimizedQuery,
    summary,
    sources,
    createdAt: doc.created_at ?? new Date().toISOString(),
  }

  return NextResponse.json(result)
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('documents')
    .select('id, title, metadata, created_at')
    .eq('user_id', user.id)
    .eq('type', 'research')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Failed to fetch research history:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const history = (data ?? []).map((doc) => {
    const meta = doc.metadata as unknown as {
      summary?: { overview?: string }
    } | null
    return {
      id: doc.id,
      query: doc.title,
      overview: meta?.summary?.overview ?? '',
      createdAt: doc.created_at ?? '',
    }
  })

  return NextResponse.json(history)
}
