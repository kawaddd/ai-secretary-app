'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const name = user?.user_metadata?.full_name ?? user?.email ?? 'AI User'
  const email = user?.email ?? ''
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const initials = name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="ユーザーメニュー"
        className="flex items-center gap-2 p-1 rounded-xl transition-colors duration-150 hover:bg-fill-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-primary-foreground shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}
          aria-hidden="true"
        >
          {initials}
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          className={`text-foreground-tertiary transition-transform duration-200 hidden sm:block ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-background-elevated overflow-hidden z-50"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          {/* User info */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground truncate">{name}</p>
            <p className="text-xs text-foreground-secondary truncate mt-0.5">{email}</p>
          </div>

          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                setOpen(false)
                await signOut()
                router.replace('/')
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger-bg transition-colors duration-100 focus-visible:outline-none focus-visible:bg-danger-bg"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
