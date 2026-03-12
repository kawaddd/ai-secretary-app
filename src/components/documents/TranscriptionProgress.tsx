'use client'

import { Spinner } from '@/components/ui/Spinner'
import type { MinutesJobStatus } from '@/types/minutes'

const STEPS: { key: MinutesJobStatus; label: string; description: string }[] = [
  { key: 'uploading', label: 'ファイルアップロード', description: 'ストレージへ音声データをアップロード中' },
  { key: 'transcribing', label: '音声認識', description: 'AIが音声を日本語テキストに変換中' },
  { key: 'generating', label: '議事録生成', description: 'AIが構造化された議事録を作成中' },
  { key: 'completed', label: '完了', description: '議事録が正常に生成されました' },
]

const STATUS_ORDER: MinutesJobStatus[] = ['uploading', 'transcribing', 'generating', 'completed']

interface Props {
  status: MinutesJobStatus
  meetingTitle?: string
}

export function TranscriptionProgress({ status, meetingTitle }: Props) {
  const currentIndex = STATUS_ORDER.indexOf(status)
  const isError = status === 'error'
  const isDone = status === 'completed'
  const progressPercent = isDone ? 100 : isError ? 0 : Math.round((currentIndex / (STEPS.length - 1)) * 100)

  return (
    <div className="space-y-5">
      {/* Status header */}
      <div className={[
        'flex items-center gap-3 rounded-xl px-4 py-3.5 border',
        isDone
          ? 'bg-success-bg/40 border-success/25'
          : isError
          ? 'bg-danger-bg border-danger/25'
          : 'bg-primary-bg/30 border-primary/20',
      ].join(' ')}>
        <div className={[
          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
          isDone ? 'bg-success' : isError ? 'bg-danger' : 'bg-primary',
        ].join(' ')}>
          {isDone ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : isError ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <Spinner size="xs" color="primary" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className={[
            'text-sm font-semibold',
            isDone ? 'text-success' : isError ? 'text-danger' : 'text-foreground',
          ].join(' ')}>
            {isDone ? '議事録の生成が完了しました' : isError ? 'エラーが発生しました' : '処理中...'}
          </p>
          {meetingTitle && (
            <p className="text-xs text-foreground-secondary mt-0.5 truncate">{meetingTitle}</p>
          )}
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
        {STEPS.map((step, i) => {
          const stepDone = i < currentIndex || isDone
          const stepActive = i === currentIndex && !isDone && !isError
          const isLast = i === STEPS.length - 1

          return (
            <div key={step.key} className="flex gap-3.5">
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className={[
                  'w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300',
                  stepDone
                    ? 'bg-success'
                    : stepActive
                    ? 'bg-primary ring-4 ring-primary/20 animate-pulse'
                    : 'bg-fill-tertiary border border-border',
                ].join(' ')}>
                  {stepDone ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : stepActive ? (
                    <Spinner size="xs" color="primary" />
                  ) : (
                    <span className="text-[9px] font-bold text-foreground-tertiary">{i + 1}</span>
                  )}
                </div>
                {!isLast && (
                  <div className={[
                    'w-px flex-1 my-1 min-h-[18px] transition-colors duration-500',
                    stepDone ? 'bg-success/40' : 'bg-border',
                  ].join(' ')} />
                )}
              </div>

              {/* Content */}
              <div className={`min-w-0 flex-1 ${isLast ? 'pb-0' : 'pb-4'}`}>
                <p className={[
                  'text-sm font-medium',
                  stepDone ? 'text-success' : stepActive ? 'text-foreground' : 'text-foreground-tertiary',
                ].join(' ')}>
                  {step.label}
                </p>
                {stepActive && (
                  <p className="text-xs text-foreground-secondary mt-0.5">{step.description}</p>
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
          音声の長さによって数分かかる場合があります
        </p>
      )}
    </div>
  )
}
