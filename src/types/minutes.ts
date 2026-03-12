export interface ActionItem {
  task: string
  assignee?: string
  dueDate?: string
}

export type TranscriptionStatus = 'queued' | 'processing' | 'completed' | 'error'

export type MinutesJobStatus =
  | 'uploading'
  | 'transcribing'
  | 'generating'
  | 'completed'
  | 'error'

export interface MinutesData {
  discussedTopics: string[]
  decisions: string[]
  nextActions: ActionItem[]
  summary: string
}

export interface MinutesMetadata extends MinutesData {
  meetingDate: string
  audioFileName: string
  audioStoragePath?: string
  transcriptionId?: string
  status: MinutesJobStatus
  error?: string
}

export interface MinutesDocument {
  id: string
  title: string
  original_content: string | null
  processed_content: string | null
  metadata: MinutesMetadata | null
  created_at: string | null
}
