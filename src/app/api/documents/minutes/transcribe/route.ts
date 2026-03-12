import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startTranscriptionFromUrl } from '@/lib/transcription/assemblyai'
import type { Json } from '@/types/database'
import type { MinutesMetadata } from '@/types/minutes'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { meetingTitle, meetingDate, storagePath } = body as {
    meetingTitle?: string
    meetingDate?: string
    storagePath?: string
  }

  if (!storagePath) {
    return NextResponse.json({ error: 'storagePath is required' }, { status: 400 })
  }

  const title = meetingTitle || '無題の会議'
  const date = meetingDate || new Date().toISOString().split('T')[0]

  // Create a signed download URL for AssemblyAI to fetch the audio (valid 1 hour)
  const { data: urlData, error: urlError } = await supabase.storage
    .from('audio-uploads')
    .createSignedUrl(storagePath, 3600)

  if (urlError || !urlData) {
    return NextResponse.json({ error: 'Failed to get audio URL' }, { status: 500 })
  }

  // Submit transcription job
  let transcriptionId: string
  try {
    transcriptionId = await startTranscriptionFromUrl(urlData.signedUrl)
  } catch (err) {
    console.error('[transcribe] AssemblyAI error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `文字起こし開始に失敗しました: ${message}` }, { status: 500 })
  }

  // Save pending document to DB
  const audioFileName = storagePath.split('/').pop() ?? ''
  const metadata: MinutesMetadata = {
    meetingDate: date,
    audioFileName,
    audioStoragePath: storagePath,
    transcriptionId,
    status: 'transcribing',
    discussedTopics: [],
    decisions: [],
    nextActions: [],
    summary: '',
  }

  const { data: doc, error: dbError } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      title,
      type: 'minutes',
      metadata: metadata as unknown as Json,
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ documentId: doc.id, transcriptionId })
}
