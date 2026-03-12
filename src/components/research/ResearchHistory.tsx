'use client'

import { Spinner } from '@/components/ui/Spinner'
import type { ResearchHistoryItem } from '@/types/research'

interface Props {
  items: ResearchHistoryItem[]
  isLoading: boolean
  onDelete: (id: string) => void
  onSelect: (id: string) => void
}

export function ResearchHistory({ items, isLoading, onDelete, onSelect }: Props) {
  return (
    <div
      className="rounded-2xl border border-card-border overflow-hidden bg-card"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
        <span className="font-semibold text-sm text-foreground">リサーチ履歴</span>
        {!isLoading && (
          <span className="text-xs font-medium text-foreground-tertiary bg-fill-tertiary px-2 py-0.5 rounded-full">
            {items.length}件
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-14">
          <Spinner size="md" />
        </div>
      ) : items.length === 0 ? (
        <HistoryEmptyState />
      ) : (
        <div className="divide-y divide-border">
          {items.map((item) => (
            <HistoryRow key={item.id} item={item} onDelete={onDelete} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}

function HistoryRow({
  item,
  onDelete,
  onSelect,
}: {
  item: ResearchHistoryItem
  onDelete: (id: string) => void
  onSelect: (id: string) => void
}) {
  const date = new Date(item.createdAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-fill-tertiary/50 transition-colors group">
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        className="min-w-0 flex-1 text-left"
      >
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-foreground truncate leading-snug">
            {item.query}
          </p>
          <span className="text-xs text-foreground-tertiary shrink-0">{date}</span>
        </div>
        {item.overview && (
          <p className="text-xs text-foreground-secondary line-clamp-1 leading-relaxed">
            {item.overview}
          </p>
        )}
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="p-1.5 rounded-lg text-foreground-tertiary hover:text-danger hover:bg-danger-bg transition-colors"
          title="削除"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
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

function HistoryEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-fill-tertiary flex items-center justify-center mb-4">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground-tertiary"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <p className="text-sm font-medium text-foreground-secondary">履歴がありません</p>
      <p className="text-xs text-foreground-tertiary mt-1 max-w-[240px] leading-relaxed">
        リサーチを実行すると結果がここに保存されます
      </p>
    </div>
  )
}
