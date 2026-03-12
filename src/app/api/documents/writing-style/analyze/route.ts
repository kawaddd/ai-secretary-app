import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeWritingStyle } from '@/lib/ai/openai'
import { mergeStyles } from '@/lib/writing-style/styleAnalyzer'
import type { WritingStyle } from '@/types/document'
import type { Json } from '@/types/database'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { text } = await request.json()
  if (!text?.trim() || text.trim().length < 50) {
    return NextResponse.json(
      { error: '文体分析には50文字以上のテキストが必要です' },
      { status: 400 },
    )
  }

  // Analyze with OpenAI
  const newStyle = await analyzeWritingStyle(text)

  // Fetch existing style to merge
  const { data: existing } = await supabase
    .from('writing_styles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  let finalStyle: WritingStyle
  let newSampleCount: number

  if (existing?.style_patterns) {
    finalStyle = mergeStyles(existing.style_patterns as unknown as WritingStyle, newStyle)
    newSampleCount = (existing.sample_count ?? 0) + 1
  } else {
    finalStyle = newStyle
    newSampleCount = 1
  }

  const { data, error } = await supabase
    .from('writing_styles')
    .upsert(
      {
        user_id: user.id,
        style_patterns: finalStyle as unknown as Json,
        sample_count: newSampleCount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
