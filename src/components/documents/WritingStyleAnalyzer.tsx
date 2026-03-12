'use client'

import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { WritingStyle } from '@/types/document'

interface Props {
  writingStyle: WritingStyle | null
  sampleCount: number
  updatedAt: string | null
  isLoading: boolean
  isAnalyzing: boolean
  error: string | null
  currentText: string
  onAnalyze: (text: string) => Promise<void>
}

function FormalityMeter({ level }: { level: number }) {
  const labels = ['', 'カジュアル', '', '', '', '標準', '', '', '', '', 'フォーマル']
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-foreground-secondary">丁寧さ</span>
        <span className="text-xs font-medium text-foreground tabular-nums">
          {level}/10 — {labels[level] ?? ''}
        </span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full transition-all duration-500"
            style={{
              backgroundColor:
                i < level
                  ? level <= 3
                    ? 'var(--info)'
                    : level <= 6
                      ? 'var(--primary)'
                      : 'var(--success)'
                  : 'var(--fill-tertiary)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function WritingStyleAnalyzer({
  writingStyle,
  sampleCount,
  updatedAt,
  isLoading,
  isAnalyzing,
  error,
  currentText,
  onAnalyze,
}: Props) {
  const canAnalyze = currentText.trim().length >= 50

  return (
    <div
      className="rounded-2xl border border-card-border overflow-hidden bg-card"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary-bg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary" aria-hidden="true">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <span className="font-semibold text-sm text-foreground">文体プロファイル</span>
          </div>
          {sampleCount > 0 && (
            <span className="text-xs font-medium bg-primary-bg text-primary px-2 py-0.5 rounded-full">
              {sampleCount}サンプル
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner size="md" />
          </div>
        ) : writingStyle ? (
          <>
            <FormalityMeter level={writingStyle.formalityLevel} />

            <div className="flex items-center justify-between py-2 border-t border-border">
              <span className="text-xs text-foreground-secondary">平均文長</span>
              <span className="text-xs font-semibold text-foreground tabular-nums">
                {writingStyle.averageSentenceLength}
                <span className="font-normal text-foreground-tertiary">文字</span>
              </span>
            </div>

            {writingStyle.vocabulary.length > 0 && (
              <div>
                <p className="text-xs text-foreground-secondary mb-2">特徴的な語彙</p>
                <div className="flex flex-wrap gap-1">
                  {writingStyle.vocabulary.slice(0, 10).map((v) => (
                    <span
                      key={v}
                      className="text-xs bg-fill-tertiary text-foreground-secondary px-2 py-0.5 rounded-full"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {writingStyle.commonPhrases.length > 0 && (
              <div>
                <p className="text-xs text-foreground-secondary mb-2">頻出フレーズ</p>
                <div className="flex flex-wrap gap-1">
                  {writingStyle.commonPhrases.slice(0, 6).map((p) => (
                    <span
                      key={p}
                      className="text-xs bg-primary-bg text-primary px-2 py-0.5 rounded-full"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {updatedAt && (
              <p className="text-xs text-foreground-tertiary pt-1 border-t border-border">
                最終更新: {new Date(updatedAt).toLocaleDateString('ja-JP')}
              </p>
            )}
          </>
        ) : (
          <div className="py-4 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-fill-tertiary flex items-center justify-center mx-auto">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-tertiary" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground-secondary">未学習</p>
            <p className="text-xs text-foreground-tertiary leading-relaxed">
              テキストを入力して学習ボタンを押すと
              <br />
              AIがあなたの文体を学習します
            </p>
          </div>
        )}

        {error && (
          <p className="text-xs text-danger bg-danger-bg px-3 py-2 rounded-lg">{error}</p>
        )}

        <Button
          variant={writingStyle ? 'outline' : 'primary'}
          size="sm"
          onClick={() => onAnalyze(currentText)}
          disabled={!canAnalyze || isAnalyzing}
          loading={isAnalyzing}
          className="w-full"
        >
          {isAnalyzing
            ? '分析中...'
            : writingStyle
              ? 'この文章から再学習'
              : 'この文章から文体を学習'}
        </Button>

        {!canAnalyze && currentText.length > 0 && (
          <p className="text-xs text-foreground-tertiary text-center">
            あと{50 - currentText.trim().length}文字必要です
          </p>
        )}
      </div>
    </div>
  )
}
