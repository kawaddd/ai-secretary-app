import Link from 'next/link'
import { ReactNode } from 'react'

export interface NavigationItemProps {
  href: string
  label: string
  icon: ReactNode
  active?: boolean
  badge?: string | number
}

export function NavigationItem({ href, label, icon, active, badge }: NavigationItemProps) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      style={{
        color: active ? 'var(--primary)' : 'var(--foreground-secondary)',
        backgroundColor: active ? 'var(--sidebar-item-active)' : undefined,
      }}
      className={[
        'flex items-center justify-start gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        !active ? 'hover:bg-sidebar-item-hover' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="shrink-0 w-[18px] flex items-center justify-center">
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && (
        <span
          className="shrink-0 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          {badge}
        </span>
      )}
    </Link>
  )
}
