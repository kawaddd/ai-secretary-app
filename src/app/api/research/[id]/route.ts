import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ResearchResult, ResearchSummary, ResearchSource } from '@/types/research'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { data: doc, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const meta = doc.metadata as unknown as {
    optimizedQuery: string
    summary: ResearchSummary
    sources: ResearchSource[]
  }

  const result: ResearchResult = {
    id: doc.id,
    query: doc.title,
    optimizedQuery: meta?.optimizedQuery ?? doc.title,
    summary: meta?.summary ?? {
      overview: doc.processed_content ?? '',
      keyPoints: [],
      details: '',
      relatedTopics: [],
    },
    sources: meta?.sources ?? [],
    createdAt: doc.created_at ?? '',
  }

  return NextResponse.json(result)
}

export async function DELETE(_req: Request, { params }: Params) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to delete research document:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
