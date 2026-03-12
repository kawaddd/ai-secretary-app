import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const filename = searchParams.get('filename')

  if (!filename) {
    return NextResponse.json({ error: 'filename is required' }, { status: 400 })
  }

  const ext = filename.split('.').pop() ?? 'mp3'
  const storagePath = `${user.id}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('audio-uploads')
    .createSignedUploadUrl(storagePath)

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? 'Failed to create upload URL' },
      { status: 500 },
    )
  }

  return NextResponse.json({ signedUrl: data.signedUrl, path: storagePath })
}
