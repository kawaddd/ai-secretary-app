'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Spinner } from '@/components/ui/Spinner'
import { Input } from '@/components/ui/Input'
import type { MinutesDocument, MinutesJobStatus } from '@/types/minutes'

const STATUS_CONFIG: Record<MinutesJobStatus, { label: string; color: string; bg: string }> = {
  uploading:   { label: 'アップロード中', color: 'text-info',    bg: 'bg-info-bg' },
  transcribing:{ label: '音声認識中',     color: 'text-warning', bg: 'bg-warning-bg' },
  generating:  { label: '生成中',         color: 'text-primary', bg: 'bg-primary-bg' },
  completed:   { label: '完了',           color: 'text-success', bg: 'bg-success-bg' },
  error:       { label: 'エラー',         color: 'text-danger',  bg: 'bg-danger-bg' },
}

interface Props {
  items: MinutesDocument[]
  isLoading: boolean
  onDelete: (id: string) => void
}

export function MinutesList({ items, isLoading, onDelete }: Props) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? items.filter((m) => m.title.includes(search) || m.metadata?.summary?.includes(search))
    : items

  return (
    <div
      className="rounded-2xl border border-card-border overflow-hidden bg-card"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-sm text-foreground">過去の議事録</span>
          {!isLoading && (
            <span className="text-xs font-medium text-foreground-tertiary bg-fill-tertiary px-2 py-0.5 rounded-full">
              {filtered.length}件
            </span>
          )}
        </div>
        <div className="w-52">
          <Input
            placeholder="タイトル・概要で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leadingIcon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-14">
          <Spinner size="md" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasSearch={!!search} />
      ) : (
        <div className="divide-y divide-border">
          {filtered.map((doc) => (
            <MinutesRow key={doc.id} doc={doc} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

function MinutesRow({ doc, onDelete }: { doc: MinutesDocument; onDelete: (id: string) => void }) {
  const status = doc.metadata?.status ?? 'completed'
  const cfg = STATUS_CONFIG[status]
  const isProcessing = status !== 'completed' && status !== 'error'
  const meta = doc.metadata

  return (
    <div className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-fill-quaternary transition-colors group">
      <div className="min-w-0 flex-1">
        {/* Top row: status + date */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
            {isProcessing && (
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            )}
            {cfg.label}
          </span>
          {meta?.meetingDate && (
            <span className="text-xs text-foreground-tertiary">
              {new Date(meta.meetingDate).toLocaleDateString('ja-JP', {
                year: 'numeric', month: 'short', day: 'numeric',
              })}
            </span>
          )}
          {meta?.audioFileName && (
            <span className="text-xs text-foreground-tertiary truncate max-w-[140px] hidden sm:block">
              {meta.audioFileName}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-sm font-semibold text-foreground truncate leading-snug">{doc.title}</p>

        {/* Summary */}
        {meta?.summary && (
          <p className="text-xs text-foreground-secondary mt-1 line-clamp-1 leading-relaxed">
            {meta.summary}
          </p>
        )}

        {/* Counts */}
        {(meta?.decisions?.length || meta?.nextActions?.length) ? (
          <div className="flex items-center gap-3 mt-2">
            {meta?.decisions && meta.decisions.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-foreground-tertiary">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                決定事項 {meta.decisions.length}件
              </span>
            )}
            {meta?.nextActions && meta.nextActions.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-foreground-tertiary">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                アクション {meta.nextActions.length}件
              </span>
            )}
          </div>
        ) : null}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {status === 'completed' && (
          <Link
            href={`/dashboard/documents/minutes/${doc.id}`}
            className="text-xs font-medium text-primary hover:text-primary-hover px-3 py-1.5 rounded-lg hover:bg-primary-bg transition-colors border border-primary/20 hover:border-primary/40"
          >
            開く
          </Link>
        )}
        <button
          type="button"
          onClick={() => onDelete(doc.id)}
          className="p-1.5 rounded-lg text-foreground-tertiary hover:text-danger hover:bg-danger-bg transition-colors"
          title="削除"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-fill-tertiary flex items-center justify-center mb-4">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-tertiary" aria-hidden="true">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </div>
      <p className="text-sm font-medium text-foreground-secondary">
        {hasSearch ? '該当する議事録が見つかりません' : 'まだ議事録がありません'}
      </p>
      {!hasSearch && (
        <p className="text-xs text-foreground-tertiary mt-1 max-w-[240px] leading-relaxed">
          音声ファイルをアップロードして最初の議事録を作成しましょう
        </p>
      )}
    </div>
  )
}
