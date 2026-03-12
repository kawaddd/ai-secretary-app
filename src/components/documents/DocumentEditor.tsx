'use client'

import { useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/Button'
import type { DocumentType } from '@/types/document'

const MAX_CHARS = 5000

const DOC_TYPES: { value: DocumentType; label: string; icon: string }[] = [
  { value: 'email', label: 'メール', icon: '✉' },
  { value: 'report', label: '報告書', icon: '📋' },
  { value: 'proposal', label: '提案書', icon: '💡' },
  { value: 'minutes', label: '議事録', icon: '📝' },
  { value: 'announcement', label: 'お知らせ', icon: '📢' },
  { value: 'apology', label: 'お詫び文', icon: '🙇' },
  { value: 'thanks', label: 'お礼状', icon: '🙏' },
  { value: 'sns', label: 'SNS', icon: '📱' },
  { value: 'presentation', label: 'プレゼン', icon: '📊' },
  { value: 'general', label: '一般文書', icon: '📄' },
]

const TEMPLATES: Partial<Record<DocumentType, string>> = {
  email:
    '件名：\n\nお世話になっております。\n\n\n\nよろしくお願いいたします。',
  report:
    '# 報告書\n\n## 実施内容\n\n\n## 結果・成果\n\n\n## 課題・所感\n\n',
  proposal:
    '# 提案書\n\n## 目的・背景\n\n\n## 提案内容\n\n\n## 期待される効果\n\n',
  minutes:
    '# 議事録\n\n日時：\n場所：\n参加者：\n\n## 議題\n\n\n## 決定事項\n\n\n## 次回アクション\n\n',
  announcement:
    '件名：〇〇についてのお知らせ\n\nいつもお世話になっております。\n\n下記の通りご連絡いたします。\n\n\n\n何卒よろしくお願いいたします。',
  apology:
    'この度は、〇〇の件につきまして、ご迷惑をおかけし誠に申し訳ございませんでした。\n\n\n\n今後このようなことがないよう、十分に注意してまいります。\n何卒ご容赦くださいますようお願い申し上げます。',
  thanks:
    'この度は、〇〇の件につきまして、大変お世話になりました。\n心より御礼申し上げます。\n\n\n\n今後ともどうぞよろしくお願いいたします。',
  presentation:
    '# タイトル\n\n## 背景・課題\n\n\n## 解決策・提案\n\n\n## 実施計画\n\n\n## まとめ・次のステップ\n\n',
}

function countWords(text: string): number {
  // Japanese: count by chars; count spaces-separated tokens for mixed
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).filter(Boolean).length
}

interface Props {
  content: string
  onChange: (value: string) => void
  documentType: DocumentType
  onDocumentTypeChange: (type: DocumentType) => void
  onProofread: () => void
  isLoading: boolean
  applyStyle: boolean
  onApplyStyleChange: (v: boolean) => void
  hasWritingStyle: boolean
}

export function DocumentEditor({
  content,
  onChange,
  documentType,
  onDocumentTypeChange,
  onProofread,
  isLoading,
  applyStyle,
  onApplyStyleChange,
  hasWritingStyle,
}: Props) {
  const draftKeyRef = useRef<string | null>(null)
  const hasLoadedRef = useRef(false)

  // Load draft after user ID is resolved (user-scoped key prevents cross-account leakage)
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id
      if (uid) {
        const key = `proofread_draft_${uid}`
        draftKeyRef.current = key
        // Migrate old shared draft if present
        const legacy = localStorage.getItem('proofread_draft')
        if (legacy) {
          localStorage.setItem(key, legacy)
          localStorage.removeItem('proofread_draft')
        }
        const draft = localStorage.getItem(key)
        if (draft) onChange(draft)
      }
      hasLoadedRef.current = true
    })
    // Clear draft on page leave or logout (component unmount)
    return () => {
      if (draftKeyRef.current) {
        localStorage.removeItem(draftKeyRef.current)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hasLoadedRef.current || !draftKeyRef.current) return
    if (content) {
      localStorage.setItem(draftKeyRef.current, content)
    } else {
      localStorage.removeItem(draftKeyRef.current)
    }
  }, [content])

  function handleTemplate() {
    const tpl = TEMPLATES[documentType]
    if (tpl) onChange(tpl)
  }

  const charCount = content.length
  const isOverLimit = charCount > MAX_CHARS
  const pct = Math.min(100, (charCount / MAX_CHARS) * 100)
  const progressColor = isOverLimit ? 'var(--danger)' : pct > 80 ? 'var(--warning)' : 'var(--primary)'

  return (
    <div
      className="rounded-2xl border border-card-border overflow-hidden bg-card"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      {/* Document type tab bar — horizontally scrollable */}
      <div className="flex overflow-x-auto border-b border-border bg-background-secondary scrollbar-hide">
        {DOC_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onDocumentTypeChange(type.value)}
            className={[
              'flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-all duration-150 border-b-2 -mb-px shrink-0',
              'focus-visible:outline-none',
              documentType === type.value
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground-secondary hover:text-foreground hover:border-border',
            ].join(' ')}
          >
            <span aria-hidden="true">{type.icon}</span>
            {type.label}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className={[
            'w-full h-72 bg-transparent px-6 py-5',
            'text-sm text-foreground placeholder:text-foreground-tertiary',
            'resize-none focus:outline-none leading-relaxed',
          ].join(' ')}
          placeholder="校正したい文章をここに入力してください..."
          aria-label="校正対象テキスト"
          spellCheck={false}
        />
        {/* Character progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-fill-tertiary">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${pct}%`, backgroundColor: progressColor }}
          />
        </div>
      </div>

      {/* Status / action bar */}
      <div className="px-5 py-3 border-t border-border flex items-center justify-between gap-3 flex-wrap bg-background-secondary">
        {/* Left actions */}
        <div className="flex items-center gap-1 flex-wrap">
          {TEMPLATES[documentType] && (
            <button
              type="button"
              onClick={handleTemplate}
              className="flex items-center gap-1.5 text-xs text-foreground-secondary hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-fill-tertiary transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="9" x2="15" y2="9" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="15" x2="12" y2="15" />
              </svg>
              テンプレート
            </button>
          )}
          {content && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex items-center gap-1.5 text-xs text-foreground-secondary hover:text-danger px-2.5 py-1.5 rounded-lg hover:bg-danger-bg transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
              クリア
            </button>
          )}
          {hasWritingStyle && (
            <label className="flex items-center gap-2 text-xs text-foreground-secondary cursor-pointer select-none px-2.5 py-1.5 rounded-lg hover:bg-fill-tertiary transition-colors">
              <span
                className={[
                  'relative inline-block w-7 h-4 rounded-full transition-colors duration-200',
                  applyStyle ? 'bg-primary' : 'bg-fill-primary',
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200',
                    applyStyle ? 'translate-x-3.5' : 'translate-x-0.5',
                  ].join(' ')}
                />
                <input
                  type="checkbox"
                  checked={applyStyle}
                  onChange={(e) => onApplyStyleChange(e.target.checked)}
                  className="sr-only"
                />
              </span>
              文体を適用
            </label>
          )}
        </div>

        {/* Right: counter + button */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span
              className={`text-xs tabular-nums font-medium ${isOverLimit ? 'text-danger' : pct > 80 ? 'text-warning' : 'text-foreground-tertiary'}`}
            >
              {charCount.toLocaleString()}
              <span className="text-foreground-tertiary font-normal">
                /{MAX_CHARS.toLocaleString()}
              </span>
            </span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={onProofread}
            disabled={!content.trim() || isOverLimit || isLoading}
            loading={isLoading}
            icon={
              !isLoading ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              ) : undefined
            }
          >
            {isLoading ? '校正中...' : '校正する'}
          </Button>
        </div>
      </div>
    </div>
  )
}
