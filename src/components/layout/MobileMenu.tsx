'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navGroups } from './navItems'
import { NavigationItem } from './NavigationItem'

export interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const pathname = usePathname()

  // Close on route change
  useEffect(() => {
    onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Body scroll lock
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 z-40 bg-overlay lg:hidden',
          'transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={onClose}
        aria-hidden="true"
        style={{ backdropFilter: open ? 'blur(4px)' : undefined }}
      />

      {/* Drawer */}
      <aside
        className={[
          'fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col lg:hidden',
          'bg-sidebar-bg border-r border-sidebar-border',
          'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-label="モバイルナビゲーション"
        aria-hidden={!open}
      >
        {/* Brand + close */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4 shrink-0">
          <Link
            href="/dashboard"
            onClick={onClose}
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
          <button
            type="button"
            onClick={onClose}
            aria-label="メニューを閉じる"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-sidebar-item-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto" role="navigation">
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
    </>
  )
}
