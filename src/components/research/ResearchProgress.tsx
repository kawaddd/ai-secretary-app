'use client'

import { Spinner } from '@/components/ui/Spinner'
import type { ResearchStep } from '@/types/research'

const STEPS: { key: ResearchStep; label: string; description: string }[] = [
  { key: 'optimizing', label: 'クエリ最適化', description: 'AIが検索クエリを最適化中' },
  { key: 'searching', label: 'Web検索', description: 'Perplexity AIが最新情報を収集中' },
  { key: 'summarizing', label: '要約生成', description: 'AIが情報を整理・要約中' },
  { key: 'completed', label: '完了', description: 'リサーチが完了しました' },
]

const STEP_ORDER: ResearchStep[] = ['optimizing', 'searching', 'summarizing', 'completed']

interface Props {
  step: ResearchStep
}

export function ResearchProgress({ step }: Props) {
  const currentIndex = STEP_ORDER.indexOf(step)
  const isError = step === 'error'
  const isDone = step === 'completed'
  const progressPercent = isDone
    ? 100
    : isError
      ? 0
      : Math.round((currentIndex / (STEPS.length - 1)) * 100)

  return (
    <div className="space-y-5">
      {/* Status header */}
      <div
        className={[
          'flex items-center gap-3 rounded-xl px-4 py-3.5 border',
          isDone
            ? 'bg-success-bg/40 border-success/25'
            : isError
              ? 'bg-danger-bg border-danger/25'
              : 'bg-primary-bg/30 border-primary/20',
        ].join(' ')}
      >
        <div
          className={[
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
            isDone ? 'bg-success' : isError ? 'bg-danger' : 'bg-primary',
          ].join(' ')}
        >
          {isDone ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : isError ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <Spinner size="xs" color="primary" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={[
              'text-sm font-semibold',
              isDone ? 'text-success' : isError ? 'text-danger' : 'text-foreground',
            ].join(' ')}
          >
            {isDone ? 'リサーチが完了しました' : isError ? 'エラーが発生しました' : '処理中...'}
          </p>
        </div>
        {!isDone && !isError && (
          <span className="text-xs font-semibold text-foreground-secondary shrink-0 tabular-nums">
            {progressPercent}%
          </span>
        )}
      </div>

      {/* Progress bar */}
      {!isError && (
        <div className="h-1 rounded-full bg-fill-tertiary overflow-hidden">
          <div
            className={[
              'h-full rounded-full transition-all duration-700 ease-out',
              isDone ? 'bg-success' : 'bg-primary',
            ].join(' ')}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Steps timeline */}
      <div>
        {STEPS.map((s, i) => {
          const stepDone = i < currentIndex || isDone
          const stepActive = i === currentIndex && !isDone && !isError
          const isLast = i === STEPS.length - 1

          return (
            <div key={s.key} className="flex gap-3.5">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={[
                    'w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300',
                    stepDone
                      ? 'bg-success'
                      : stepActive
                        ? 'bg-primary ring-4 ring-primary/20 animate-pulse'
                        : 'bg-fill-tertiary border border-border',
                  ].join(' ')}
                >
                  {stepDone ? (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : stepActive ? (
                    <Spinner size="xs" color="primary" />
                  ) : (
                    <span className="text-[9px] font-bold text-foreground-tertiary">{i + 1}</span>
                  )}
                </div>
                {!isLast && (
                  <div
                    className={[
                      'w-px flex-1 my-1 min-h-[18px] transition-colors duration-500',
                      stepDone ? 'bg-success/40' : 'bg-border',
                    ].join(' ')}
                  />
                )}
              </div>

              {/* Step content */}
              <div className={`min-w-0 flex-1 ${isLast ? 'pb-0' : 'pb-4'}`}>
                <p
                  className={[
                    'text-sm font-medium',
                    stepDone
                      ? 'text-success'
                      : stepActive
                        ? 'text-foreground'
                        : 'text-foreground-tertiary',
                  ].join(' ')}
                >
                  {s.label}
                </p>
                {stepActive && (
                  <p className="text-xs text-foreground-secondary mt-0.5">{s.description}</p>
                )}
                {stepDone && !stepActive && (
                  <p className="text-xs text-success/60 mt-0.5">完了</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!isDone && !isError && (
        <p className="text-xs text-foreground-tertiary text-center pt-1">
          検索・要約に数十秒かかる場合があります
        </p>
      )}
    </div>
  )
}
