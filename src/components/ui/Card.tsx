import { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  clickable?: boolean
  children: ReactNode
}

export interface CardSectionProps {
  children: ReactNode
  className?: string
}

export function Card({ clickable, children, className, onClick, ...props }: CardProps) {
  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        clickable
          ? (e) => {
              if ((e.key === 'Enter' || e.key === ' ') && onClick) {
                e.preventDefault()
                onClick(e as unknown as React.MouseEvent<HTMLDivElement>)
              }
            }
          : undefined
      }
      className={[
        'rounded-2xl border border-card-border bg-card',
        'transition-all duration-200',
        clickable
          ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ boxShadow: 'var(--shadow-md)' }}
      {...props}
    >
      {children}
    </div>
  )
}

function CardHeader({ children, className }: CardSectionProps) {
  return (
    <div
      className={[
        'px-6 py-4 border-b border-border',
        'text-foreground font-semibold',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}

function CardBody({ children, className }: CardSectionProps) {
  return (
    <div className={['px-6 py-5 text-foreground', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

function CardFooter({ children, className }: CardSectionProps) {
  return (
    <div
      className={[
        'px-6 py-4 border-t border-border',
        'text-foreground-secondary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter
