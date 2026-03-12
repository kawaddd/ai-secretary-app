import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { proofreadText } from '@/lib/ai/openai'
import type { ProofreadRequest, WritingStyle, Suggestion } from '@/types/document'
import type { Json } from '@/types/database'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: ProofreadRequest = await request.json()
  const { content, documentType, applyUserStyle } = body

  if (!content?.trim()) {
    return NextResponse.json({ error: 'テキストを入力してください' }, { status: 400 })
  }

  // Fetch user writing style if requested
  let userStyle: WritingStyle | null = null
  if (applyUserStyle) {
    const { data: styleRow } = await supabase
      .from('writing_styles')
      .select('style_patterns')
      .eq('user_id', user.id)
      .single()
    if (styleRow?.style_patterns) {
      userStyle = styleRow.style_patterns as unknown as WritingStyle
    }
  }

  // Call OpenAI
  const { corrected, suggestions: rawSuggestions, writingStyleMatch } = await proofreadText(
    content,
    documentType,
    userStyle,
  )

  // Compute positions for each suggestion
  const suggestions: Suggestion[] = rawSuggestions.map((s) => {
    const start = content.indexOf(s.original)
    return {
      ...s,
      position: {
        start: Math.max(0, start),
        end: start >= 0 ? start + s.original.length : 0,
      },
    }
  })

  // Save to documents table
  const title = content.slice(0, 30).trim() + (content.length > 30 ? '...' : '')
  const { data: doc, error: dbError } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      title,
      type: 'proofread',
      original_content: content,
      processed_content: corrected,
      metadata: { documentType, suggestions, writingStyleMatch } as unknown as Json,
    })
    .select()
    .single()

  if (dbError) {
    console.error('Failed to save document:', dbError)
    return NextResponse.json({
      documentId: '',
      original: content,
      corrected,
      suggestions,
      writingStyleMatch,
      createdAt: new Date().toISOString(),
    })
  }

  return NextResponse.json({
    documentId: doc.id,
    original: content,
    corrected,
    suggestions,
    writingStyleMatch,
    createdAt: doc.created_at,
  })
}
