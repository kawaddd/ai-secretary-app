type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg'
type SpinnerColor = 'primary' | 'foreground' | 'success' | 'danger' | 'warning'

export interface SpinnerProps {
  size?: SpinnerSize
  color?: SpinnerColor
  className?: string
}

const sizeMap: Record<SpinnerSize, number> = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
}

const colorMap: Record<SpinnerColor, string> = {
  primary: 'var(--primary)',
  foreground: 'var(--foreground)',
  success: 'var(--success)',
  danger: 'var(--danger)',
  warning: 'var(--warning)',
}

export function Spinner({ size = 'md', color = 'primary', className }: SpinnerProps) {
  const px = sizeMap[size]
  const stroke = colorMap[color]

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      role="presentation"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={stroke}
        strokeWidth="2.5"
        strokeOpacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
