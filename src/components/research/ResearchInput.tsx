'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'

const SUGGESTIONS = [
  'AIの最新動向',
  '量子コンピュータの現状',
  '再生可能エネルギートレンド',
  '日本のスタートアップエコシステム',
]

interface Props {
  onSubmit: (query: string) => void
  isLoading: boolean
}

export function ResearchInput({ onSubmit, isLoading }: Props) {
  const [query, setQuery] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit() {
    const trimmed = query.trim()
    if (!trimmed || isLoading) return
    onSubmit(trimmed)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleSuggestion(suggestion: string) {
    setQuery(suggestion)
    textareaRef.current?.focus()
  }

  return (
    <div className="space-y-4">
      <Textarea
        ref={textareaRef}
        label="調査テーマ"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="例: 2025年のAI技術トレンド、最新の気候変動対策、日本の少子化対策の現状..."
        rows={4}
        disabled={isLoading}
      />

      {/* Suggestion pills */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-foreground-tertiary self-center">候補:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSuggestion(s)}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-full border border-border bg-fill-tertiary text-foreground-secondary hover:border-primary hover:text-primary hover:bg-primary-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {s}
          </button>
        ))}
      </div>

      <Button
        variant="primary"
        size="md"
        className="w-full"
        onClick={handleSubmit}
        disabled={!query.trim() || isLoading}
        loading={isLoading}
      >
        リサーチ開始
      </Button>

      <p className="text-xs text-foreground-tertiary text-center">
        Cmd/Ctrl + Enter でも送信できます
      </p>
    </div>
  )
}
