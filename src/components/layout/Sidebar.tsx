'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navGroups } from './navItems'
import { NavigationItem } from './NavigationItem'

export interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={[
        'flex flex-col h-screen w-60 shrink-0 sticky top-0',
        'border-r border-sidebar-border bg-sidebar-bg',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="サイドバーナビゲーション"
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-4 shrink-0">
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          style={{
            background: 'linear-gradient(90deg, #0a84ff 0%, #38b6ff 45%, rgba(180, 220, 255, 0.45) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          AI Secretary
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden" role="navigation">
        {navGroups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
            {group.label && (
              <p className="pl-4 pr-2 mb-1 text-xs font-medium text-foreground-tertiary tracking-wide">
                {group.label}
              </p>
            )}
            <ul role="list" className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <li key={item.href}>
                    <NavigationItem
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      active={active}
                    />
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
