'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { MinutesDisplay } from '@/components/documents/MinutesDisplay'
import { MinutesEditor } from '@/components/documents/MinutesEditor'
import { MinutesExporter } from '@/components/documents/MinutesExporter'
import type { MinutesDocument } from '@/types/minutes'

export default function MinutesDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [doc, setDoc] = useState<MinutesDocument | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      const res = await fetch(`/api/documents/minutes/${id}`)
      if (res.ok) {
        setDoc(await res.json())
      } else {
        setError('議事録が見つかりません')
      }
      setIsLoading(false)
    }
    load()
  }, [id])

  async function handleSave(updated: Partial<MinutesDocument>) {
    if (!doc) return
    setIsSaving(true)
    const res = await fetch(`/api/documents/minutes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    if (res.ok) {
      const saved = await res.json()
      setDoc(saved)
      setIsEditing(false)
    } else {
      setError('保存に失敗しました')
    }
    setIsSaving(false)
  }

  async function handleDelete() {
    if (!confirm(`「${doc?.title}」を削除しますか？`)) return
    const res = await fetch(`/api/documents/minutes/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/dashboard/documents/minutes')
    } else {
      setError('削除に失敗しました')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-danger">{error ?? '議事録が見つかりません'}</p>
        <Link href="/dashboard/documents/minutes" className="text-sm text-primary hover:underline">
          ← 議事録一覧に戻る
        </Link>
      </div>
    )
  }

  const meta = doc.metadata

  return (
    <div className="space-y-6 max-w-[1000px]">
      {/* Back link */}
      <Link
        href="/dashboard/documents/minutes"
        className="inline-flex items-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        議事録一覧
      </Link>

      {/* Header card */}
      <div
        className="rounded-2xl border border-card-border bg-card px-6 py-5"
        style={{ boxShadow: 'var(--shadow-md)' }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground tracking-tight">{doc.title}</h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {meta?.meetingDate && (
                <span className="text-sm text-foreground-secondary">
                  {new Date(meta.meetingDate).toLocaleDateString('ja-JP', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </span>
              )}
              {meta?.audioFileName && (
                <span className="text-xs text-foreground-tertiary bg-fill-tertiary px-2 py-0.5 rounded">
                  {meta.audioFileName}
                </span>
              )}
              {doc.created_at && (
                <span className="text-xs text-foreground-tertiary">
                  作成: {new Date(doc.created_at).toLocaleDateString('ja-JP')}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <MinutesExporter doc={doc} />
            {!isEditing && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(true)}
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                }
              >
                編集
              </Button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 rounded-lg text-foreground-tertiary hover:text-danger hover:bg-danger-bg transition-colors"
              title="削除"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-danger-bg border border-danger/40 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Content */}
      <div
        className="rounded-2xl border border-card-border bg-card px-6 py-5"
        style={{ boxShadow: 'var(--shadow-md)' }}
      >
        {isEditing ? (
          <MinutesEditor
            doc={doc}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <MinutesDisplay doc={doc} />
        )}
      </div>
    </div>
  )
}
