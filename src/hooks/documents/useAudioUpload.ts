'use client'

import { useState } from 'react'

export type UploadStatus = 'idle' | 'uploading' | 'error'

export function useAudioUpload() {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  async function upload(
    file: File,
    meetingTitle: string,
    meetingDate: string,
  ): Promise<{ documentId: string; transcriptionId: string } | null> {
    setStatus('uploading')
    setError(null)

    // Step 1: Get a signed upload URL from our API
    const signRes = await fetch(
      `/api/documents/minutes/signed-upload?filename=${encodeURIComponent(file.name)}`,
    )
    const signData = await signRes.json()

    if (!signRes.ok) {
      setError(signData.error ?? 'アップロードURLの取得に失敗しました')
      setStatus('error')
      return null
    }

    const { signedUrl, path } = signData as { signedUrl: string; path: string }

    // Step 2: Upload file directly to Supabase Storage (bypasses Vercel size limits)
    const uploadRes = await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    })

    if (!uploadRes.ok) {
      setError('ファイルのアップロードに失敗しました')
      setStatus('error')
      return null
    }

    // Step 3: Start transcription with the storage path
    const transcribeRes = await fetch('/api/documents/minutes/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingTitle, meetingDate, storagePath: path }),
    })

    const data = await transcribeRes.json()

    if (!transcribeRes.ok) {
      setError(data.error ?? 'アップロードに失敗しました')
      setStatus('error')
      return null
    }

    setStatus('idle')
    return data as { documentId: string; transcriptionId: string }
  }

  function reset() {
    setStatus('idle')
    setError(null)
  }

  return { status, error, upload, reset }
}
