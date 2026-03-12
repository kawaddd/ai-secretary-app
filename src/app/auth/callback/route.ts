import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          },
        },
      },
    )
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      const reason = encodeURIComponent(error.message)
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed&reason=${reason}`)
    }

    // Calendar OAuth flow (connectCalendar) returns a refresh_token via access_type:offline.
    // Only save to calendar_tokens when we have a refresh_token to avoid overwriting a valid
    // calendar token with a basic-scope (openid email profile) login token.
    const session = data.session
    if (session?.provider_token && session?.provider_refresh_token) {
      await supabase.from('calendar_tokens').upsert(
        {
          user_id: session.user.id,
          access_token: session.provider_token,
          refresh_token: session.provider_refresh_token,
          expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
    }
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Dump all query params for debugging
  const allParams: Record<string, string> = {}
  searchParams.forEach((value, key) => { allParams[key] = value })
  const reason = encodeURIComponent(JSON.stringify(allParams))
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed&reason=${reason}`)
}
