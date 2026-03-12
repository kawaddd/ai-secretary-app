'use client'

import { KeyboardEvent, useEffect, useRef, useState } from 'react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  options: SelectOption[]
  value?: string[]
  onChange?: (value: string[]) => void
  placeholder?: string
  searchable?: boolean
  multiple?: boolean
  disabled?: boolean
  label?: string
  error?: string
  id?: string
  className?: string
}

export function Select({
  options,
  value,
  onChange,
  placeholder = '選択してください',
  searchable = false,
  multiple = false,
  disabled = false,
  label,
  error,
  id,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [internalSelected, setInternalSelected] = useState<string[]>(value ?? [])

  const selected = value ?? internalSelected
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const inputId = id ?? (label ? `select-${label}` : 'select')
  const listboxId = `${inputId}-listbox`

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Focus search on open
  useEffect(() => {
    if (open && searchable) {
      setTimeout(() => searchRef.current?.focus(), 10)
    }
  }, [open, searchable])

  const filteredOptions = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  function toggleOption(optionValue: string) {
    let next: string[]
    if (multiple) {
      next = selected.includes(optionValue)
        ? selected.filter((v) => v !== optionValue)
        : [...selected, optionValue]
    } else {
      next = [optionValue]
      setOpen(false)
      setSearch('')
    }
    setInternalSelected(next)
    onChange?.(next)
  }

  function handleTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
    }
    if (e.key === 'Escape') setOpen(false)
  }

  function handleOptionKeyDown(e: KeyboardEvent<HTMLButtonElement>, optionValue: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleOption(optionValue)
    }
    if (e.key === 'Escape') {
      setOpen(false)
      setSearch('')
    }
  }

  const triggerLabel =
    selected.length === 0
      ? placeholder
      : multiple
        ? `${selected.length}件選択中`
        : (options.find((o) => o.value === selected[0])?.label ?? placeholder)

  return (
    <div className={['flex flex-col gap-1.5', className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div ref={containerRef} className="relative">
        {/* Trigger */}
        <button
          id={inputId}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-invalid={error ? true : undefined}
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          onKeyDown={handleTriggerKeyDown}
          className={[
            'w-full flex items-center justify-between rounded-xl text-base px-3.5 py-2.5',
            'bg-input-bg border transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20',
            selected.length > 0 ? 'text-foreground' : 'text-foreground-tertiary',
            error
              ? 'border-danger focus:border-danger'
              : open
                ? 'border-primary'
                : 'border-input-border',
            disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-primary',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className="truncate text-left">{triggerLabel}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`shrink-0 ml-2 text-foreground-tertiary transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div
            id={listboxId}
            role="listbox"
            aria-multiselectable={multiple}
            className="absolute z-50 w-full mt-1.5 rounded-xl border border-border bg-background-elevated overflow-hidden"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            {searchable && (
              <div className="p-2 border-b border-border">
                <input
                  ref={searchRef}
                  type="search"
                  placeholder="検索..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-input-bg border border-input-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary"
                />
              </div>
            )}
            <ul className="max-h-56 overflow-y-auto py-1" role="presentation">
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-2.5 text-sm text-foreground-tertiary text-center">
                  結果なし
                </li>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selected.includes(option.value)
                  return (
                    <li key={option.value} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        disabled={option.disabled}
                        onClick={() => toggleOption(option.value)}
                        onKeyDown={(e) => handleOptionKeyDown(e, option.value)}
                        className={[
                          'w-full flex items-center justify-between px-3 py-2.5 text-sm text-left',
                          'transition-colors duration-100',
                          'focus:outline-none',
                          isSelected
                            ? 'bg-sidebar-item-active text-primary'
                            : 'text-foreground hover:bg-fill-tertiary',
                          option.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <span>{option.label}</span>
                        {isSelected && (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            className="shrink-0 text-primary"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
