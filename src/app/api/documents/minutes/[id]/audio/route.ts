import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { MinutesMetadata } from '@/types/minutes'

export const dynamic = 'force-dynamic'

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
    .select('metadata')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const meta = doc.metadata as unknown as MinutesMetadata
  // Use stored path, or fall back to reconstructed path for older records
  const storagePath = meta?.audioStoragePath ?? `${user.id}/${meta?.audioFileName}`

  if (!meta?.audioFileName) {
    return NextResponse.json({ error: 'No audio file' }, { status: 404 })
  }

  const { data: urlData, error: urlError } = await supabase.storage
    .from('audio-uploads')
    .createSignedUrl(storagePath, 7200) // 2 hours

  if (urlError || !urlData) {
    return NextResponse.json({ error: 'Failed to get audio URL' }, { status: 500 })
  }

  return NextResponse.json({ url: urlData.signedUrl })
}
