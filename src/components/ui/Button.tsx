import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react'
import { Spinner } from './Spinner'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
  secondary:
    'bg-fill-secondary text-foreground hover:bg-fill-primary active:bg-fill-secondary',
  outline:
    'border border-border text-foreground hover:bg-fill-tertiary hover:border-primary active:bg-fill-secondary',
  ghost:
    'text-foreground hover:bg-fill-tertiary active:bg-fill-secondary',
  destructive:
    'bg-danger text-danger-foreground hover:bg-danger-hover active:bg-danger',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-base rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-lg rounded-2xl gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'left',
    children,
    disabled,
    className,
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading

  return (
    <button
      type="button"
      ref={ref}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={[
        'inline-flex items-center justify-center font-medium',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading && (
        <Spinner
          size={size === 'lg' ? 'sm' : 'xs'}
          color={variant === 'primary' || variant === 'destructive' ? 'foreground' : 'primary'}
        />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'right' && (
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  )
})
