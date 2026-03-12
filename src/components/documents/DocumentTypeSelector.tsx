'use client'

import type { DocumentType } from '@/types/document'

export const DOC_TYPE_OPTIONS: { value: DocumentType; label: string; description: string }[] = [
  { value: 'email', label: 'メール', description: 'ビジネスメール' },
  { value: 'report', label: '報告書', description: '業務報告・日報' },
  { value: 'proposal', label: '提案書', description: '企画・提案' },
  { value: 'minutes', label: '議事録', description: '会議・打ち合わせの記録' },
  { value: 'announcement', label: 'お知らせ', description: '社内外へのアナウンス' },
  { value: 'apology', label: 'お詫び文', description: '謝罪・お詫びの文書' },
  { value: 'thanks', label: 'お礼状', description: '感謝・御礼の文書' },
  { value: 'sns', label: 'SNS投稿', description: 'X・Instagram・Facebookなど' },
  { value: 'presentation', label: 'プレゼン資料', description: 'スライド・発表資料' },
  { value: 'general', label: '一般文書', description: 'その他の文書' },
]

interface Props {
  value: DocumentType
  onChange: (type: DocumentType) => void
}

export function DocumentTypeSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="文書タイプ">
      {DOC_TYPE_OPTIONS.map((type) => (
        <button
          key={type.value}
          type="button"
          onClick={() => onChange(type.value)}
          title={type.description}
          className={[
            'px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            value === type.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-fill-tertiary text-foreground-secondary hover:bg-fill-secondary hover:text-foreground',
          ].join(' ')}
        >
          {type.label}
        </button>
      ))}
    </div>
  )
}
