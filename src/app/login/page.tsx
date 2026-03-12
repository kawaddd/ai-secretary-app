'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signInWithGoogle } from '@/lib/auth/auth'

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const callbackError = searchParams.get('error')

  async function handleSignIn() {
    try {
      setIsLoading(true)
      setError(null)
      await signInWithGoogle()
    } catch {
      setError('ログインに失敗しました。もう一度お試しください。')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(10,80,180,0.35) 0%, transparent 60%), #000000' }}>
      {/* Back to top */}
      <Link
        href="/"
        className="fixed top-5 left-6 flex items-center gap-1.5 text-sm transition-colors duration-150"
        style={{ color: 'var(--foreground-secondary)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--foreground)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--foreground-secondary)')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        トップへ戻る
      </Link>

      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-background-elevated p-8"
        style={{ boxShadow: 'var(--shadow-xl)' }}
      >
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4" />
              <path d="M12 14c-6 0-8 3-8 4v1h16v-1c0-1-2-4-8-4" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-foreground">AI Secretary</h1>
          <p className="text-sm text-foreground-secondary mt-1">アカウントにサインインしてください</p>
        </div>

        {/* Error messages */}
        {(error || callbackError) && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-danger-bg border border-danger text-sm text-danger">
            {error ?? '認証に失敗しました。再度お試しください。'}
          </div>
        )}

        {/* Google Sign In button */}
        <button
          type="button"
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium text-foreground transition-colors duration-150 hover:bg-fill-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <svg
              className="animate-spin w-5 h-5 text-foreground-secondary"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          {isLoading ? 'サインイン中...' : 'Googleでサインイン'}
        </button>

        <p className="text-center text-xs text-foreground-tertiary mt-6">
          サインインすることで、利用規約およびプライバシーポリシーに同意したものとみなされます。
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
