import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateMinutesFromTranscription, minutesToMarkdown, punctuateTranscription } from '@/lib/minutes/minutesGenerator'
import type { Json } from '@/types/database'
import type { MinutesMetadata } from '@/types/minutes'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { documentId, transcriptionText } = await request.json()

  if (!documentId || !transcriptionText?.trim()) {
    return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 })
  }

  // Fetch existing document to get meeting info
  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !doc) {
    return NextResponse.json({ error: 'ドキュメントが見つかりません' }, { status: 404 })
  }

  const existingMeta = (doc.metadata ?? {}) as unknown as MinutesMetadata

  // Add punctuation to raw transcription for readable display
  const formattedText = await punctuateTranscription(transcriptionText)

  // Generate structured minutes with OpenAI
  const minutesData = await generateMinutesFromTranscription(formattedText, doc.title)

  // Build markdown version
  const markdown = minutesToMarkdown(
    doc.title,
    existingMeta.meetingDate ?? '',
    minutesData,
  )

  const updatedMeta: MinutesMetadata = {
    ...existingMeta,
    ...minutesData,
    status: 'completed',
  }

  const { data: updated, error: updateError } = await supabase
    .from('documents')
    .update({
      original_content: formattedText,
      processed_content: markdown,
      metadata: updatedMeta as unknown as Json,
    })
    .eq('id', documentId)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json(updated)
}
