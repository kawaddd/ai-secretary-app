'use client'

import { TextareaHTMLAttributes, forwardRef, useEffect, useRef } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  maxLength?: number
  autoResize?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, maxLength, autoResize = false, id, className, onChange, value, ...props },
  forwardedRef,
) {
  const innerRef = useRef<HTMLTextAreaElement>(null)

  // Merge refs
  function setRef(el: HTMLTextAreaElement | null) {
    innerRef.current = el
    if (typeof forwardedRef === 'function') forwardedRef(el)
    else if (forwardedRef) forwardedRef.current = el
  }

  useEffect(() => {
    if (!autoResize || !innerRef.current) return
    const el = innerRef.current
    function resize() {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
    resize()
    el.addEventListener('input', resize)
    return () => el.removeEventListener('input', resize)
  }, [autoResize])

  const inputId = id ?? (label ? `textarea-${label}` : undefined)
  const errorId = error ? `${inputId}-error` : undefined
  const hintId = hint ? `${inputId}-hint` : undefined
  const currentLength = typeof value === 'string' ? value.length : 0

  return (
    <div className="flex flex-col gap-1.5">
      {(label || maxLength) && (
        <div className="flex items-center justify-between">
          {label && (
            <label htmlFor={inputId} className="text-sm font-medium text-foreground">
              {label}
            </label>
          )}
          {maxLength && (
            <span
              className={`text-xs tabular-nums ${
                currentLength > maxLength ? 'text-danger' : 'text-foreground-tertiary'
              }`}
              aria-live="polite"
            >
              {currentLength} / {maxLength}
            </span>
          )}
        </div>
      )}
      <textarea
        ref={setRef}
        id={inputId}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? true : undefined}
        rows={props.rows ?? 4}
        className={[
          'w-full rounded-xl text-base text-foreground placeholder:text-foreground-tertiary',
          'bg-input-bg border border-input-border',
          'px-3.5 py-2.5',
          'transition-colors duration-150',
          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20',
          'resize-none',
          error ? 'border-danger focus:border-danger focus:ring-danger' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={autoResize ? { overflow: 'hidden' } : undefined}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={hintId} className="text-sm text-foreground-secondary">
          {hint}
        </p>
      )}
    </div>
  )
})
