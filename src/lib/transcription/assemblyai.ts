import { AssemblyAI } from 'assemblyai'
import type { TranscriptionStatus } from '@/types/minutes'

function getClient(): AssemblyAI {
  const apiKey = process.env.ASSEMBLYAI_API_KEY
  if (!apiKey) throw new Error('ASSEMBLYAI_API_KEY is not set')
  return new AssemblyAI({ apiKey })
}

export async function uploadAndStartTranscription(audioBuffer: Buffer): Promise<string> {
  const client = getClient()

  const uploadUrl = await client.files.upload(audioBuffer)

  const transcript = await client.transcripts.submit({
    audio: uploadUrl,
    speech_models: ['universal-2'],
    language_code: 'ja',
  })

  return transcript.id
}

export async function startTranscriptionFromUrl(audioUrl: string): Promise<string> {
  const client = getClient()

  const transcript = await client.transcripts.submit({
    audio: audioUrl,
    speech_models: ['universal-2'],
    language_code: 'ja',
  })

  return transcript.id
}

export async function getTranscriptionStatus(transcriptionId: string): Promise<{
  status: TranscriptionStatus
  text?: string
  error?: string
}> {
  const client = getClient()
  const transcript = await client.transcripts.get(transcriptionId)

  if (transcript.status !== 'completed' || !transcript.text) {
    return {
      status: transcript.status as TranscriptionStatus,
      text: transcript.text ?? undefined,
      error: transcript.error ?? undefined,
    }
  }

  // Use sentence-level segmentation so text has proper line breaks
  try {
    const { sentences } = await client.transcripts.sentences(transcriptionId)
    const text = sentences.map((s) => s.text).join('\n')
    return { status: 'completed', text }
  } catch {
    // Fall back to raw text if sentences endpoint fails
    return { status: 'completed', text: transcript.text }
  }
}
