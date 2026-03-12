import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTranscriptionStatus } from '@/lib/transcription/assemblyai'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const result = await getTranscriptionStatus(id)
  return NextResponse.json(result)
}
