import OpenAI from 'openai'

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')
  return new OpenAI({ apiKey })
}

export async function optimizeQuery(userQuery: string): Promise<string> {
  const client = getClient()

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          '検索クエリを最適化するアシスタントです。ユーザーのクエリを、過去6ヶ月以内の最新情報を見つけるために効果的な検索クエリに変換してください。日本語のクエリは日本語のまま最適化してください。最適化後のクエリ文字列のみを返してください。説明は不要です。',
      },
      {
        role: 'user',
        content: userQuery,
      },
    ],
    temperature: 0.3,
    max_tokens: 200,
  })

  const optimized = response.choices[0]?.message?.content?.trim()
  return optimized || userQuery
}
