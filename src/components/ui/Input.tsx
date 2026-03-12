import { InputHTMLAttributes, ReactNode, forwardRef } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leadingIcon, trailingIcon, id, className, ...props },
  ref,
) {
  const inputId = id ?? (label ? `input-${label}` : undefined)
  const errorId = error ? `${inputId}-error` : undefined
  const hintId = hint ? `${inputId}-hint` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leadingIcon && (
          <span
            className="absolute left-3 text-foreground-tertiary pointer-events-none"
            aria-hidden="true"
          >
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
          aria-invalid={error ? true : undefined}
          className={[
            'w-full rounded-xl text-base text-foreground placeholder:text-foreground-tertiary',
            'bg-input-bg border border-input-border',
            'px-3.5 py-2.5',
            'transition-colors duration-150',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20',
            error ? 'border-danger focus:border-danger focus:ring-danger' : '',
            leadingIcon ? 'pl-10' : '',
            trailingIcon ? 'pr-10' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {trailingIcon && (
          <span
            className="absolute right-3 text-foreground-tertiary pointer-events-none"
            aria-hidden="true"
          >
            {trailingIcon}
          </span>
        )}
      </div>
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
