import OpenAI from 'openai'
import type { MinutesData, ActionItem } from '@/types/minutes'

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')
  return new OpenAI({ apiKey })
}

export async function punctuateTranscription(rawText: string): Promise<string> {
  const client = getClient()

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          '音声認識テキストに日本語の句読点を付与するアシスタントです。テキストの内容・語順は一切変えず、句読点（。、）の追加と文ごとの改行のみ行います。',
      },
      {
        role: 'user',
        content: `以下は音声認識で生成された日本語テキストです。句読点が欠けているため読みにくい状態です。
各文の末尾に「。」を付け、文ごとに改行してください。
テキストの単語・語順・内容は絶対に変更しないでください。句読点と改行の追加のみ行ってください。

テキスト:
${rawText}`,
      },
    ],
    temperature: 0.1,
    max_tokens: 4096,
  })

  return response.choices[0]?.message?.content?.trim() ?? rawText
}

export async function generateMinutesFromTranscription(
  transcriptionText: string,
  meetingTitle: string,
): Promise<MinutesData> {
  const client = getClient()

  const prompt = `以下の会議の文字起こしテキストから、構造化された議事録を作成してください。

## 会議タイトル
${meetingTitle}

## 文字起こしテキスト
${transcriptionText}

## 指示
- 議論されたトピックを箇条書きで抽出してください
- 明確に決定した事項を箇条書きで抽出してください
- 次回までのアクションアイテムを抽出し、担当者・期限が言及されていれば記載してください
- 会議全体を200字以内で要約してください

## 回答形式
以下のJSON形式のみで回答してください：

{
  "discussedTopics": ["議論されたトピック（最大10件）"],
  "decisions": ["決定した事項（見つからなければ空配列）"],
  "nextActions": [
    {
      "task": "アクションアイテム",
      "assignee": "担当者（言及があれば、なければ省略）",
      "dueDate": "期限（言及があれば、なければ省略）"
    }
  ],
  "summary": "会議全体の要約（200字以内）"
}`

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 2048,
  })

  const raw = response.choices[0]?.message?.content ?? '{}'
  const parsed = JSON.parse(raw)

  const nextActions: ActionItem[] = (
    Array.isArray(parsed.nextActions) ? parsed.nextActions : []
  ).map((a: Record<string, unknown>) => ({
    task: typeof a.task === 'string' ? a.task : '',
    assignee: typeof a.assignee === 'string' ? a.assignee : undefined,
    dueDate: typeof a.dueDate === 'string' ? a.dueDate : undefined,
  }))

  return {
    discussedTopics: Array.isArray(parsed.discussedTopics) ? parsed.discussedTopics : [],
    decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
    nextActions,
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
  }
}

export function minutesToMarkdown(
  title: string,
  meetingDate: string,
  data: MinutesData,
  transcription?: string,
): string {
  const lines: string[] = [
    `# ${title}`,
    '',
    `**日時**: ${meetingDate}`,
    '',
  ]

  if (data.summary) {
    lines.push('## 概要', data.summary, '')
  }

  if (data.discussedTopics.length > 0) {
    lines.push('## 議論された内容')
    data.discussedTopics.forEach((t) => lines.push(`- ${t}`))
    lines.push('')
  }

  if (data.decisions.length > 0) {
    lines.push('## 決定事項')
    data.decisions.forEach((d) => lines.push(`- ${d}`))
    lines.push('')
  }

  if (data.nextActions.length > 0) {
    lines.push('## ネクストアクション')
    data.nextActions.forEach((a) => {
      let line = `- [ ] ${a.task}`
      if (a.assignee) line += ` （担当: ${a.assignee}）`
      if (a.dueDate) line += ` （期限: ${a.dueDate}）`
      lines.push(line)
    })
    lines.push('')
  }

  if (transcription) {
    lines.push('## 文字起こし全文', transcription)
  }

  return lines.join('\n')
}
