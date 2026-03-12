'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const ACCEPTED_EXTENSIONS = '.mp3,.wav,.m4a,.mp4,.webm,.ogg'
const MAX_SIZE_MB = 200

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileExt(name: string): string {
  return name.split('.').pop()?.toUpperCase() ?? ''
}

interface Props {
  onSubmit: (file: File, title: string, date: string) => void
  isLoading: boolean
}

export function AudioUploader({ onSubmit, isLoading }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [sizeError, setSizeError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(selected: File) {
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setSizeError(`ファイルサイズは${MAX_SIZE_MB}MB以下にしてください`)
      return
    }
    setSizeError(null)
    setFile(selected)
    if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, ''))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (selected) handleFile(selected)
  }

  function handleSubmit() {
    if (!file || !title.trim()) return
    onSubmit(file, title.trim(), date)
  }

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={[
          'relative flex flex-col items-center justify-center min-h-[200px] rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden',
          file
            ? 'border-success/40 bg-success-bg/20 cursor-default'
            : dragOver
            ? 'border-primary bg-primary-bg/30 scale-[1.01]'
            : 'border-border hover:border-primary/50 hover:bg-primary-bg/10 cursor-pointer',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleInputChange}
          className="sr-only"
          aria-label="音声ファイルを選択"
        />

        {file ? (
          /* File selected state */
          <div className="flex flex-col items-center gap-3 px-6 py-2 text-center">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-success/10 border border-success/25 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-success" aria-hidden="true">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground truncate max-w-[240px]">{file.name}</p>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                <span className="text-[11px] font-semibold bg-success/15 text-success px-2 py-0.5 rounded-md">
                  {getFileExt(file.name)}
                </span>
                <span className="text-xs text-foreground-secondary">{formatFileSize(file.size)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); setSizeError(null) }}
              className="text-xs text-foreground-tertiary hover:text-danger transition-colors underline underline-offset-2 mt-1"
            >
              別のファイルを選択
            </button>
          </div>
        ) : (
          /* Empty / drag state */
          <div className="flex flex-col items-center gap-3 text-center px-6 py-2">
            <div className={[
              'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200',
              dragOver ? 'bg-primary/15 scale-110' : 'bg-fill-tertiary',
            ].join(' ')}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={dragOver ? 'text-primary' : 'text-foreground-secondary'} aria-hidden="true">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {dragOver ? 'ここにドロップ' : '音声ファイルをドロップ'}
              </p>
              <p className="text-xs text-foreground-secondary mt-0.5">
                または <span className="text-primary font-medium">クリックして選択</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap justify-center mt-1">
              {['MP3', 'WAV', 'M4A', 'MP4', 'WebM'].map((fmt) => (
                <span key={fmt} className="text-[10px] font-medium bg-fill-tertiary text-foreground-tertiary px-1.5 py-0.5 rounded">
                  {fmt}
                </span>
              ))}
              <span className="text-[10px] text-foreground-tertiary">最大{MAX_SIZE_MB}MB</span>
            </div>
          </div>
        )}
      </div>

      {sizeError && (
        <p className="text-xs text-danger flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {sizeError}
        </p>
      )}

      {/* Metadata inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="会議タイトル"
          placeholder="例: 週次定例ミーティング"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          label="会議日時"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <Button
        variant="primary"
        size="md"
        onClick={handleSubmit}
        disabled={!file || !title.trim() || isLoading}
        loading={isLoading}
        className="w-full"
        icon={
          !isLoading ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          ) : undefined
        }
      >
        {isLoading ? 'アップロード中...' : '文字起こしを開始'}
      </Button>
    </div>
  )
}
