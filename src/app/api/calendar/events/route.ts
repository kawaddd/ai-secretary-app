import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { getValidToken, listEvents, createEvent } from '@/lib/calendar/googleCalendar'

export async function GET(request: NextRequest) {
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

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const timeMin = searchParams.get('timeMin')
  const timeMax = searchParams.get('timeMax')

  if (!timeMin || !timeMax) {
    return NextResponse.json({ error: 'timeMin and timeMax are required' }, { status: 400 })
  }

  try {
    const accessToken = await getValidToken(supabase, user.id)
    const events = await listEvents(accessToken, timeMin, timeMax)
    return NextResponse.json(events)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const isAuthError =
      message === 'Google Calendar not connected' ||
      message.toLowerCase().includes('insufficient') ||
      message.toLowerCase().includes('unauthorized') ||
      message.toLowerCase().includes('invalid_grant')
    return NextResponse.json({ error: message }, { status: isAuthError ? 403 : 500 })
  }
}

export async function POST(request: NextRequest) {
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

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  try {
    const accessToken = await getValidToken(supabase, user.id)
    const event = await createEvent(accessToken, body)
    return NextResponse.json(event, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const isAuthError =
      message === 'Google Calendar not connected' ||
      message.toLowerCase().includes('insufficient') ||
      message.toLowerCase().includes('unauthorized') ||
      message.toLowerCase().includes('invalid_grant')
    return NextResponse.json({ error: message }, { status: isAuthError ? 403 : 500 })
  }
}
