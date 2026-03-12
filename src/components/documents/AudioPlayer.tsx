'use client'

import { useEffect, useRef, useState } from 'react'
import { Spinner } from '@/components/ui/Spinner'

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface Props {
  documentId: string
  fileName?: string
}

export function AudioPlayer({ documentId, fileName }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffering, setBuffering] = useState(false)

  useEffect(() => {
    fetch(`/api/documents/minutes/${documentId}/audio`)
      .then((r) => r.json())
      .then((data) => {
        if (data.url) setAudioUrl(data.url)
        else setLoadError(true)
      })
      .catch(() => setLoadError(true))
      .finally(() => setFetching(false))
  }, [documentId])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current
    if (!audio) return
    const t = Number(e.target.value)
    audio.currentTime = t
    setCurrentTime(t)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (fetching) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 text-xs text-foreground-tertiary">
        <Spinner size="xs" />
        音声を読み込み中...
      </div>
    )
  }

  if (loadError || !audioUrl) {
    return (
      <p className="px-4 py-3 text-xs text-foreground-tertiary">
        音声ファイルを読み込めませんでした
      </p>
    )
  }

  return (
    <div className="px-5 py-4 border-t border-border bg-background-secondary">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCurrentTime(0) }}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
      />

      <div className="flex items-center gap-3">
        {/* Play / Pause button */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={playing ? '一時停止' : '再生'}
        >
          {buffering ? (
            <Spinner size="xs" color="foreground" />
          ) : playing ? (
            /* Pause icon */
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            /* Play icon */
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        {/* Progress area */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          {/* Filename */}
          {fileName && (
            <p className="text-[10px] text-foreground-tertiary truncate leading-none">{fileName}</p>
          )}

          {/* Seek bar */}
          <div className="relative h-1.5 rounded-full bg-fill-tertiary overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full transition-none"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
              aria-label="再生位置"
            />
          </div>
        </div>

        {/* Time */}
        <span className="text-xs text-foreground-tertiary tabular-nums shrink-0 w-[72px] text-right">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}
