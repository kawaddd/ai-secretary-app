export interface CalendarEventDateTime {
  dateTime?: string
  date?: string
  timeZone?: string
}

export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  location?: string
  start: CalendarEventDateTime
  end: CalendarEventDateTime
  colorId?: string
  htmlLink?: string
  extendedProperties?: {
    private?: {
      reminderMinutes?: string
    }
  }
}

export interface CalendarEventInput {
  summary: string
  description?: string
  location?: string
  // For timed events (one pair must be set)
  startDateTime?: string // ISO string
  endDateTime?: string   // ISO string
  // For all-day events
  startDate?: string     // YYYY-MM-DD
  endDate?: string       // YYYY-MM-DD (exclusive: end date = last day + 1)
  // Reminder: minutes before start (0 = no reminder)
  reminderMinutes?: number
}
