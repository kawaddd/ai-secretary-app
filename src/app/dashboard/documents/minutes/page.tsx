'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AudioUploader } from '@/components/documents/AudioUploader'
import { TranscriptionProgress } from '@/components/documents/TranscriptionProgress'
import { MinutesList } from '@/components/documents/MinutesList'
import { useAudioUpload } from '@/hooks/documents/useAudioUpload'
import { useTranscription } from '@/hooks/documents/useTranscription'
import { useMinutes } from '@/hooks/documents/useMinutes'
import type { MinutesJobStatus } from '@/types/minutes'

export default function MinutesPage() {
  const router = useRouter()
  const [jobStatus, setJobStatus] = useState<MinutesJobStatus | null>(null)
  const [currentTitle, setCurrentTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { upload, status: uploadStatus } = useAudioUpload()
  const { status: transcriptionStatus, text: transcriptionText, startPolling, reset: resetTranscription } = useTranscription()
  const { minutes, isLoading, fetchMinutes, generateMinutes, deleteMinutes } = useMinutes()

  const isProcessing = jobStatus !== null && jobStatus !== 'completed' && jobStatus !== 'error'

  async function handleUpload(file: File, title: string, date: string) {
    setError(null)
    setCurrentTitle(title)
    setJobStatus('uploading')

    const result = await upload(file, title, date)
    if (!result) {
      setError('アップロードに失敗しました')
      setJobStatus('error')
      return
    }

    setJobStatus('transcribing')
    startPolling(result.transcriptionId)

    // Wait for transcription to complete via polling
    await waitForTranscription(result.documentId, result.transcriptionId)
  }

  async function waitForTranscription(documentId: string, transcriptionId: string) {
    // Poll manually until complete
    const checkInterval = setInterval(async () => {
      const res = await fetch(`/api/documents/minutes/transcribe/${transcriptionId}`)
      if (!res.ok) return
      const data = await res.json()

      if (data.status === 'completed' && data.text) {
        clearInterval(checkInterval)
        setJobStatus('generating')

        const updated = await generateMinutes(documentId, data.text)
        if (updated) {
          setJobStatus('completed')
          await fetchMinutes()
          setTimeout(() => {
            router.push(`/dashboard/documents/minutes/${documentId}`)
          }, 1500)
        } else {
          setError('議事録の生成に失敗しました')
          setJobStatus('error')
        }
      } else if (data.status === 'error') {
        clearInterval(checkInterval)
        setError(data.error ?? '文字起こしに失敗しました')
        setJobStatus('error')
      }
    }, 4000)
  }

  async function handleDelete(id: string) {
    if (!confirm('この議事録を削除しますか？')) return
    await deleteMinutes(id)
  }

  function handleReset() {
    setJobStatus(null)
    setCurrentTitle('')
    setError(null)
    resetTranscription()
  }

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">議事録作成</h1>
        <p className="text-foreground-secondary mt-1 text-sm">
          音声ファイルから自動で文字起こしし、構造化された議事録を生成します
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-danger-bg border border-danger/40 text-sm text-danger flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs underline hover:no-underline shrink-0"
          >
            再試行
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Upload / Progress panel */}
        <div className="lg:col-span-3">
          <div
            className="rounded-2xl border border-card-border bg-card overflow-hidden"
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground">
                {isProcessing ? '処理中' : jobStatus === 'completed' ? '処理完了' : '新規作成'}
              </span>
              {jobStatus && jobStatus !== 'completed' && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-foreground-tertiary hover:text-foreground px-2 py-1 rounded hover:bg-fill-tertiary transition-colors"
                >
                  キャンセル
                </button>
              )}
            </div>
            <div className="p-5">
              {jobStatus ? (
                <TranscriptionProgress
                  status={jobStatus}
                  meetingTitle={currentTitle}
                />
              ) : (
                <AudioUploader
                  onSubmit={handleUpload}
                  isLoading={uploadStatus === 'uploading'}
                />
              )}
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="lg:col-span-2 space-y-4">
          <div
            className="rounded-2xl border border-card-border bg-card p-5 space-y-4"
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <p className="text-sm font-semibold text-foreground">対応フォーマット</p>
            <div className="space-y-2">
              {[
                { format: 'MP3 / WAV', note: '一般的な音声フォーマット' },
                { format: 'M4A', note: 'Apple デバイスの録音' },
                { format: 'MP4 / WebM', note: '動画ファイルの音声トラック' },
              ].map((item) => (
                <div key={item.format} className="flex items-center gap-3">
                  <span className="text-xs font-medium bg-fill-tertiary text-foreground-secondary px-2 py-0.5 rounded w-24 text-center shrink-0">
                    {item.format}
                  </span>
                  <span className="text-xs text-foreground-secondary">{item.note}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl border border-card-border bg-card p-5 space-y-3"
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <p className="text-sm font-semibold text-foreground">処理の流れ</p>
            <ol className="space-y-2">
              {[
                '音声ファイルをAssemblyAIにアップロード',
                'AIが音声を日本語テキストに変換',
                'GPT-4oが議事録形式に整形',
                '決定事項・アクションを自動抽出',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-foreground-secondary">
                  <span className="w-4 h-4 rounded-full bg-fill-tertiary text-foreground-tertiary flex items-center justify-center shrink-0 font-medium text-[10px]">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Minutes list */}
      <MinutesList
        items={minutes}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  )
}
