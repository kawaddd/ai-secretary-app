import type { SupabaseClient } from '@supabase/supabase-js'
import type { CalendarEvent, CalendarEventInput } from '@/types/calendar'

const BASE = 'https://www.googleapis.com/calendar/v3'

export class CalendarNotConnectedError extends Error {
  constructor() {
    super('Google Calendar not connected')
    this.name = 'CalendarNotConnectedError'
  }
}

async function refreshToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new CalendarNotConnectedError()
  return res.json()
}

export async function getValidToken(supabase: SupabaseClient, userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('calendar_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .single()

  if (error || !data) throw new CalendarNotConnectedError()

  const isExpired =
    !data.expires_at || new Date(data.expires_at).getTime() < Date.now() + 5 * 60 * 1000

  if (!isExpired) return data.access_token

  if (!data.refresh_token) throw new CalendarNotConnectedError()

  const refreshed = await refreshToken(data.refresh_token)
  await supabase
    .from('calendar_tokens')
    .update({
      access_token: refreshed.access_token,
      expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  return refreshed.access_token
}

export async function listEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string,
): Promise<CalendarEvent[]> {
  const url = new URL(`${BASE}/calendars/primary/events`)
  url.searchParams.set('timeMin', timeMin)
  url.searchParams.set('timeMax', timeMax)
  url.searchParams.set('singleEvents', 'true')
  url.searchParams.set('orderBy', 'startTime')
  url.searchParams.set('maxResults', '250')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? 'Failed to fetch events')
  }
  const data = await res.json()
  return data.items ?? []
}

export async function createEvent(
  accessToken: string,
  input: CalendarEventInput,
): Promise<CalendarEvent> {
  const body: Record<string, unknown> = {
    summary: input.summary,
    description: input.description ?? '',
    location: input.location ?? '',
    start: input.startDate
      ? { date: input.startDate }
      : { dateTime: input.startDateTime!, timeZone: 'Asia/Tokyo' },
    end: input.endDate
      ? { date: input.endDate }
      : { dateTime: input.endDateTime!, timeZone: 'Asia/Tokyo' },
  }
  if (input.reminderMinutes != null && input.reminderMinutes > 0) {
    body.extendedProperties = { private: { reminderMinutes: String(input.reminderMinutes) } }
  }
  const res = await fetch(`${BASE}/calendars/primary/events`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? 'Failed to create event')
  }
  return res.json()
}

export async function updateEvent(
  accessToken: string,
  eventId: string,
  input: Partial<CalendarEventInput>,
): Promise<CalendarEvent> {
  const body: Record<string, unknown> = {}
  if (input.summary !== undefined) body.summary = input.summary
  if (input.description !== undefined) body.description = input.description
  if (input.location !== undefined) body.location = input.location
  if (input.startDate) body.start = { date: input.startDate }
  else if (input.startDateTime) body.start = { dateTime: input.startDateTime, timeZone: 'Asia/Tokyo' }
  if (input.endDate) body.end = { date: input.endDate }
  else if (input.endDateTime) body.end = { dateTime: input.endDateTime, timeZone: 'Asia/Tokyo' }
  if (input.reminderMinutes != null) {
    body.extendedProperties = {
      private: { reminderMinutes: input.reminderMinutes > 0 ? String(input.reminderMinutes) : '' },
    }
  }

  const res = await fetch(`${BASE}/calendars/primary/events/${eventId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? 'Failed to update event')
  }
  return res.json()
}

export async function deleteEvent(accessToken: string, eventId: string): Promise<void> {
  const res = await fetch(`${BASE}/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? 'Failed to delete event')
  }
}
