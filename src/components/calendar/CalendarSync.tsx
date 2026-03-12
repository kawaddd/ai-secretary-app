'use client'

import { useState, useEffect, useRef } from 'react'

const AUTO_SYNC_MS = 3 * 60 * 1_000
const STORAGE_KEY = 'calendar_next_sync_at'
const RADIUS = 6
const CIRC = 2 * Math.PI * RADIUS

interface Props {
  onSync: () => Promise<void>
  isSyncing: boolean
  lastSyncAt: Date | null
  syncError: string | null
}

function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1_000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function useRelativeTime(date: Date | null): string {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!date) return
    const id = setInterval(() => setTick((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [date])
  if (!date) return ''
  const diff = Math.floor((Date.now() - date.getTime()) / 60_000)
  if (diff < 1) return 'たった今'
  if (diff < 60) return `${diff}分前`
  const h = Math.floor(diff / 60)
  if (h < 24) return `${h}時間前`
  return date.toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function saveNextSyncAt(ts: number) {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(ts))
  } catch {
    // ignore
  }
}

export function CalendarSync({ onSync, isSyncing, lastSyncAt, syncError }: Props) {
  // Default: fresh 3-min countdown from now
  const nextSyncAtRef = useRef<number>(Date.now() + AUTO_SYNC_MS)
  const [msRemaining, setMsRemaining] = useState(AUTO_SYNC_MS)
  const onSyncRef = useRef(onSync)
  const isSyncingRef = useRef(isSyncing)

  useEffect(() => {
    onSyncRef.current = onSync
  }, [onSync])
  useEffect(() => {
    isSyncingRef.current = isSyncing
  }, [isSyncing])

  // On mount: restore nextSyncAt from sessionStorage if still valid
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const nextAt = parseInt(stored, 10)
        const remaining = nextAt - Date.now()
        if (remaining > 0 && remaining <= AUTO_SYNC_MS) {
          nextSyncAtRef.current = nextAt
          setMsRemaining(remaining)
          return
        }
      }
    } catch {
      // ignore
    }
    // No valid stored value — persist the default
    saveNextSyncAt(nextSyncAtRef.current)
  }, [])

  // Countdown tick + auto-trigger
  useEffect(() => {
    const id = setInterval(() => {
      const remaining = nextSyncAtRef.current - Date.now()
      if (remaining <= 0) {
        if (!isSyncingRef.current) {
          onSyncRef.current()
        }
        const next = Date.now() + AUTO_SYNC_MS
        nextSyncAtRef.current = next
        saveNextSyncAt(next)
        setMsRemaining(AUTO_SYNC_MS)
      } else {
        setMsRemaining(remaining)
      }
    }, 1_000)
    return () => clearInterval(id)
  }, [])

  // Reset countdown after each sync completes
  useEffect(() => {
    if (!lastSyncAt) return
    const next = Date.now() + AUTO_SYNC_MS
    nextSyncAtRef.current = next
    saveNextSyncAt(next)
    setMsRemaining(AUTO_SYNC_MS)
  }, [lastSyncAt])

  const relativeTime = useRelativeTime(lastSyncAt)
  const progress = msRemaining / AUTO_SYNC_MS
  const dashOffset = CIRC * (1 - progress)

  async function handleManualSync() {
    if (isSyncing) return
    await onSync()
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={handleManualSync}
        disabled={isSyncing}
        title="手動で今すぐ同期"
        className="group flex items-center gap-1.5 text-xs text-foreground-tertiary hover:text-foreground-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
      >
        <span className="relative flex-shrink-0 w-4 h-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            className="absolute inset-0"
            style={{ transform: 'rotate(-90deg)' }}
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="8"
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.15"
              strokeWidth="1.5"
            />
            <circle
              cx="8"
              cy="8"
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.55"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              style={{
                strokeDashoffset: dashOffset,
                transition: 'stroke-dashoffset 1s linear',
              }}
            />
          </svg>
          <svg
            width="8"
            height="8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={['absolute inset-0 m-auto', isSyncing ? 'animate-spin' : ''].join(' ')}
            aria-hidden="true"
          >
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </span>
        <span>{isSyncing ? '同期中...' : '同期'}</span>
      </button>

      <span className="text-border/60 text-xs select-none">·</span>

      {syncError ? (
        <span className="flex items-center gap-1 text-xs text-danger">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          同期エラー
        </span>
      ) : (
        <span className="flex items-center gap-2 text-xs text-foreground-quaternary">
          {lastSyncAt && (
            <span className="flex items-center gap-1">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-success"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {relativeTime}に同期
            </span>
          )}
          {!isSyncing && (
            <>
              <span className="text-border/60">·</span>
              <span>次の同期まで {formatCountdown(msRemaining)}</span>
            </>
          )}
        </span>
      )}
    </div>
  )
}
